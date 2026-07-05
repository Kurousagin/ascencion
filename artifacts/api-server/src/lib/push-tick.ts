import webpush from "web-push";
import { and, eq, isNotNull, lt } from "drizzle-orm";
import { db, pushSubscriptionsTable } from "@workspace/db";
import { logger } from "./logger";

const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT;

const TIER1_COOLDOWN_HOURS = 20;
const INACTIVITY_THRESHOLD_HOURS = 8;
const MIN_INACTIVITY_MINUTES = 30;
const EVENT_LOOKAHEAD_HOURS = 4;
const PER_SEND_TIMEOUT_MS = 5000;

const GENERIC_MESSAGES = [
  "Sua cidadela precisa de você.",
  "Dias se passaram em silêncio na torre...",
  "Seus moradores aguardam suas ordens.",
  "A torre permanece adormecida, esperando por você.",
  "O tempo segue seu curso. Volte!",
];

function getGenericMessage(): string {
  return GENERIC_MESSAGES[Math.floor(Math.random() * GENERIC_MESSAGES.length)];
}

function timeoutPromise<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

export interface PushTickResult {
  ok: boolean;
  enviados: number;
  removidos: number;
  erros: number;
}

export async function runNotificationTick(): Promise<PushTickResult> {
  if (!PUBLIC_KEY || !PRIVATE_KEY || !SUBJECT) {
    logger.warn(
      "VAPID keys not configured, skipping notification tick"
    );
    return { ok: false, enviados: 0, removidos: 0, erros: 0 };
  }

  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);

  const now = new Date();
  const cooldownThreshold = new Date(
    now.getTime() - TIER1_COOLDOWN_HOURS * 60 * 60 * 1000
  );
  const inactivityThreshold = new Date(
    now.getTime() - INACTIVITY_THRESHOLD_HOURS * 60 * 60 * 1000
  );
  const minActivityThreshold = new Date(
    now.getTime() - MIN_INACTIVITY_MINUTES * 60 * 1000
  );
  const eventLookaheadThreshold = new Date(
    now.getTime() + EVENT_LOOKAHEAD_HOURS * 60 * 60 * 1000
  );

  // Fetch subscriptions eligible for notification
  const subscriptions = await db
    .select()
    .from(pushSubscriptionsTable)
    .where(
      and(
        eq(pushSubscriptionsTable.enabled, true),
        // Either never notified or outside cooldown window
        // (lastNotifiedAt IS NULL OR lastNotifiedAt < cooldownThreshold)
      )
    );

  let enviados = 0;
  let removidos = 0;
  let erros = 0;

  const sendPromises = subscriptions.map(async (sub) => {
    try {
      const isInactive = sub.lastActiveAt < inactivityThreshold;

      // Detecta se é notificação de aliança (timestamp "agora")
      const isAllianceNotification =
        sub.nextEventAt &&
        sub.nextEventAt <= now &&
        (!sub.lastNotifiedEventAt || sub.lastNotifiedEventAt !== sub.nextEventAt);

      // Para eventos de aliança, dispara imediatamente (sem MIN_INACTIVITY_MINUTES)
      // Para outros eventos, requer 30min de inatividade
      if (!isAllianceNotification && sub.lastActiveAt > minActivityThreshold) {
        return;
      }

      const shouldNotifyEvent =
        sub.nextEventAt &&
        (isAllianceNotification || (sub.nextEventAt > now && sub.nextEventAt <= eventLookaheadThreshold)) &&
        (!sub.lastNotifiedEventAt || sub.lastNotifiedEventAt !== sub.nextEventAt);

      const shouldNotifyGeneric =
        isInactive &&
        (!sub.lastNotifiedAt || sub.lastNotifiedAt < cooldownThreshold);

      if (!shouldNotifyGeneric && !shouldNotifyEvent) {
        return;
      }

      const message = shouldNotifyEvent
        ? sub.nextEventText || getGenericMessage()
        : getGenericMessage();

      const payload = JSON.stringify({
        title: "Torre Obscura",
        body: message,
        url: "/",
      });

      // Send with timeout
      await timeoutPromise(
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.authKey,
            },
          },
          payload
        ),
        PER_SEND_TIMEOUT_MS
      );

      // Update timestamps
      const updateData: Record<string, any> = { lastNotifiedAt: new Date() };
      if (shouldNotifyEvent && sub.nextEventAt) {
        updateData.lastNotifiedEventAt = sub.nextEventAt;
      }

      await db
        .update(pushSubscriptionsTable)
        .set(updateData)
        .where(eq(pushSubscriptionsTable.id, sub.id));

      enviados++;
    } catch (error) {
      const err = error as any;

      // 404/410 = subscription expired/revoked on browser side
      if (err.statusCode === 404 || err.statusCode === 410) {
        await db
          .delete(pushSubscriptionsTable)
          .where(eq(pushSubscriptionsTable.id, sub.id));
        removidos++;
        logger.info(
          { deviceId: sub.deviceId, statusCode: err.statusCode },
          "Subscription expired, removed"
        );
      } else {
        erros++;
        logger.warn(
          { deviceId: sub.deviceId, error: err.message },
          "Failed to send notification"
        );
      }
    }
  });

  await Promise.allSettled(sendPromises);

  logger.info(
    { enviados, removidos, erros },
    "Notification tick completed"
  );

  return { ok: true, enviados, removidos, erros };
}
