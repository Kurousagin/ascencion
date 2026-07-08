import { useEffect } from "react";
import { subscribeToPush, isPushEnabled } from "../lib/push-notifications";
import { getDeviceId } from "../lib/alliance-identity";

const HEARTBEAT_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
let lastHeartbeatTime = 0;

export function useNotificationsHeartbeat(): void {
  useEffect(() => {
    if (!isPushEnabled()) return;

    const sendHeartbeat = async () => {
      const now = Date.now();
      if (now - lastHeartbeatTime < HEARTBEAT_INTERVAL_MS) return;

      lastHeartbeatTime = now;
      try {
        await subscribeToPush(getDeviceId());
      } catch (error) {
        console.warn("Push heartbeat failed:", error);
      }
    };

    // Send on mount
    sendHeartbeat();

    // Send on visibility change (when returning to app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Batimento periódico enquanto o app fica aberto e visível — sem ele, o
    // lastActiveAt não é renovado e o servidor passa a considerar o jogador
    // "inativo" após 8h mesmo com o app à frente. O throttle interno evita spam.
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(intervalId);
    };
  }, []);
}
