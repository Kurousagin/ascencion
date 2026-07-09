export function isPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getPermissionState(): NotificationPermission {
  if (!isPushSupported()) return "denied";
  return Notification.permission;
}

const PUSH_ENABLED_KEY = "torre_obscura_push_enabled";

export function isPushEnabled(): boolean {
  return localStorage.getItem(PUSH_ENABLED_KEY) === "true";
}

export function setPushEnabled(enabled: boolean): void {
  localStorage.setItem(PUSH_ENABLED_KEY, String(enabled));
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(
  deviceId: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // Request permission if needed
    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("User denied notification permission");
      }
    }

    if (Notification.permission !== "granted") {
      throw new Error("Notifications not permitted");
    }

    // Get public key from server
    const keyResponse = await fetch("/api/notificacoes/chave-publica");
    if (!keyResponse.ok) {
      throw new Error("Failed to fetch VAPID public key");
    }
    const { publicKey } = await keyResponse.json();

    // Get service worker registration and subscribe
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });

    // Send subscription to server
    const p256dhKey = subscription.getKey("p256dh");
    const authKey = subscription.getKey("auth");
    if (!p256dhKey || !authKey) {
      throw new Error("Subscription sem chaves de criptografia (p256dh/auth)");
    }

    const subscriptionData = {
      deviceId,
      endpoint: subscription.endpoint,
      p256dh: btoa(
        String.fromCharCode.apply(
          null,
          Array.from(new Uint8Array(p256dhKey as ArrayBuffer))
        )
      ),
      auth: btoa(
        String.fromCharCode.apply(
          null,
          Array.from(new Uint8Array(authKey as ArrayBuffer))
        )
      ),
    };

    const response = await fetch("/api/notificacoes/inscrever", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      throw new Error("Failed to register subscription on server");
    }

    // Guarda o deviceId onde o Service Worker consegue ler (localStorage é
    // inacessível ao SW). Usado no handler `pushsubscriptionchange` para
    // re-inscrever automaticamente quando o navegador rotaciona a subscription.
    if ("caches" in window) {
      try {
        const cache = await caches.open("torre-config");
        await cache.put("/__device_id", new Response(deviceId));
      } catch {
        /* cache indisponível — rotação dependerá do próximo heartbeat */
      }
    }

    setPushEnabled(true);
    onSuccess?.();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    throw err;
  }
}

export async function unsubscribeFromPush(
  deviceId: string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // Unsubscribe browser-side
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }

    // Notify server
    await fetch("/api/notificacoes/desinscrever", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });

    setPushEnabled(false);
    onSuccess?.();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    throw err;
  }
}

export async function updateNextEvent(
  deviceId: string,
  nextEventAt: Date | null,
  nextEventText: string | null
): Promise<void> {
  const res = await fetch("/api/notificacoes/proximo-evento", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId,
      proximoEventoEm: nextEventAt?.toISOString() ?? null,
      proximoEventoTexto: nextEventText,
    }),
  });
  if (!res.ok) {
    throw new Error(`Falha ao atualizar próximo evento (${res.status})`);
  }
}
