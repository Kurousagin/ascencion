// v6: purga respostas de /api-server/* (path antigo de dev) que ficaram presas
// no cache-first como HTML do SPA fallback.
const CACHE_NAME = 'torre-obscura-v6';

// Assets to pre-cache on install (app shell)
const PRECACHE_URLS = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests from same origin
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Navigation requests: network-first so the user always gets updates
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('/'))
        )
    );
    return;
  }

  // Chamadas de API nunca devem ser respondidas com cache: dados de aliança,
  // caixa, perfil etc. mudam a cada poll e o `cache: 'no-store'` do fetch do
  // client não tem efeito aqui (o SW intercepta antes da camada de cache HTTP).
  // Sem este bypass, a primeira resposta de uma URL de API (ex.: lista de
  // aliadas vazia antes de parear) fica presa no cache pra sempre.
  if (url.pathname.startsWith('/api/')) return;

  // Static assets (JS, CSS, fonts, images): cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((res) => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        // Nunca cachear HTML fora de navigation: uma rota de API errada que caia
        // no SPA fallback (200 + index.html) ficaria presa no cache para sempre.
        if ((res.headers.get('content-type') ?? '').includes('text/html')) return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      });
    })
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try { data = event.data.json(); }
    catch { data = { body: event.data.text() }; }
  }
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Torre Obscura', {
      body: data.body ?? 'Sua cidadela precisa de você.',
      icon: data.icon ?? '/icon-192.png',
      // Badge Android exige ícone monocromático (alpha-only) — um PNG colorido
      // vira um quadrado branco na status bar.
      badge: data.badge ?? '/badge-96.png',
      tag: data.tag ?? 'torre-obscura-reminder',
      data: { url: data.url ?? '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => c.url.includes(self.location.origin));
      if (existing) {
        // Foca a janela existente e navega até a URL do evento (quando aplicável).
        const focar = existing.focus();
        if (url !== '/' && 'navigate' in existing) {
          return Promise.resolve(focar).then(() => existing.navigate(url).catch(() => {}));
        }
        return focar;
      }
      return self.clients.openWindow(url);
    })
  );
});

// ─── Re-inscrição automática quando o navegador rotaciona a subscription ───────
// Sem isto, a rotação/expiração da subscription faz o push ser perdido silenciosa-
// mente até o app reabrir. Lê o deviceId do Cache (gravado pelo app ao inscrever),
// re-inscreve e faz upsert via /inscrever (idempotente por deviceId).
function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = self.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return self.btoa(bin);
}

async function lerDeviceId() {
  try {
    const cache = await caches.open('torre-config');
    const res = await cache.match('/__device_id');
    return res ? await res.text() : null;
  } catch { return null; }
}

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    const deviceId = await lerDeviceId();
    if (!deviceId) return; // sem deviceId, o próximo heartbeat re-inscreve

    let applicationServerKey = event.oldSubscription?.options?.applicationServerKey;
    if (!applicationServerKey) {
      try {
        const r = await fetch('/api/notificacoes/chave-publica');
        if (!r.ok) return;
        const { publicKey } = await r.json();
        applicationServerKey = urlB64ToUint8Array(publicKey);
      } catch { return; }
    }

    let sub;
    try {
      sub = await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
    } catch { return; }

    const p256dh = sub.getKey('p256dh');
    const auth = sub.getKey('auth');
    if (!p256dh || !auth) return;

    await fetch('/api/notificacoes/inscrever', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, endpoint: sub.endpoint, p256dh: bufToB64(p256dh), auth: bufToB64(auth) }),
    }).catch(() => {});
  })());
});