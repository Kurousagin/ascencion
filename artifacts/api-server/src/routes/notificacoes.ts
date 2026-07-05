import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import webpush from "web-push";
import {
  db,
  pushSubscriptionsTable,
  type PushSubscription,
} from "@workspace/db";
import {
  ObterChavePublicaVapidResponse,
  InscreverNotificacoesBody,
  DesinscreverNotificacoesBody,
  AtualizarProximoEventoBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT;

if (PRIVATE_KEY && SUBJECT) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY || "", PRIVATE_KEY);
}

// GET /notificacoes/chave-publica
router.get("/notificacoes/chave-publica", async (req, res): Promise<void> => {
  if (!PUBLIC_KEY) {
    res.status(503).json({ error: "Notificações não configuradas." });
    return;
  }
  const data = ObterChavePublicaVapidResponse.parse({ publicKey: PUBLIC_KEY });
  res.json(data);
});

// POST /notificacoes/inscrever
router.post("/notificacoes/inscrever", async (req, res): Promise<void> => {
  const parsed = InscreverNotificacoesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { deviceId, endpoint, p256dh, auth } = parsed.data;

  try {
    const now = new Date();
    // Try insert first, if fails due to unique constraint, update instead
    const result = await db
      .insert(pushSubscriptionsTable)
      .values({
        deviceId,
        endpoint,
        p256dh,
        authKey: auth,
        enabled: true,
        lastActiveAt: now,
      })
      .onConflictDoUpdate({
        target: [pushSubscriptionsTable.deviceId],
        set: {
          endpoint,
          p256dh,
          authKey: auth,
          enabled: true,
          lastActiveAt: now,
          updatedAt: now,
        },
      });

    req.log.info({ deviceId }, "Inscrito em notificações");
    res.json({ ok: true });
  } catch (e) {
    const error = e as { message?: string };
    req.log.error({ error: error.message, deviceId }, "Failed to subscribe");
    res.status(500).json({ error: "Failed to subscribe to push notifications" });
  }
});

// POST /notificacoes/desinscrever
router.post("/notificacoes/desinscrever", async (req, res): Promise<void> => {
  const parsed = DesinscreverNotificacoesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { deviceId } = parsed.data;

  await db
    .delete(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.deviceId, deviceId));

  req.log.info({ deviceId }, "Desinscrito de notificações");
  res.json({ ok: true });
});

// PATCH /notificacoes/proximo-evento
router.patch("/notificacoes/proximo-evento", async (req, res): Promise<void> => {
  const parsed = AtualizarProximoEventoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { deviceId, proximoEventoEm, proximoEventoTexto } = parsed.data;

  const [updated] = await db
    .update(pushSubscriptionsTable)
    .set({
      nextEventAt: proximoEventoEm ? new Date(proximoEventoEm) : null,
      nextEventText: proximoEventoTexto,
    })
    .where(eq(pushSubscriptionsTable.deviceId, deviceId))
    .returning();

  if (!updated) {
    res.status(404).json({
      error: "Nenhuma assinatura encontrada para este dispositivo.",
    });
    return;
  }

  // Envia notificação imediatamente se evento é "agora" (Tier 3 - aliança)
  // Sem bloquear a resposta
  if (proximoEventoEm && proximoEventoTexto) {
    const eventTime = new Date(proximoEventoEm);
    const now = new Date();
    const diffMs = eventTime.getTime() - now.getTime();

    // Se evento é agora ou até 1min no futuro, dispara imediatamente
    if (diffMs <= 60_000) {
      setImmediate(async () => {
        try {
          const sub = await db
            .select()
            .from(pushSubscriptionsTable)
            .where(eq(pushSubscriptionsTable.deviceId, deviceId))
            .limit(1);

          if (sub.length === 0 || !sub[0].enabled) {
            req.log.warn({ deviceId }, "Nenhuma subscrição ativa para Tier 3");
            return;
          }

          const payload = JSON.stringify({
            title: "Torre Obscura",
            body: proximoEventoTexto,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: "torre-obscura-event",
          });

          const result = await webpush.sendNotification(
            {
              endpoint: sub[0].endpoint,
              keys: {
                p256dh: sub[0].p256dh,
                auth: sub[0].authKey,
              },
            },
            payload
          );

          await db
            .update(pushSubscriptionsTable)
            .set({ lastNotifiedEventAt: now })
            .where(eq(pushSubscriptionsTable.deviceId, deviceId));

          req.log.info({ deviceId, statusCode: result.statusCode }, "✅ Notificação Tier 3 enviada com sucesso");
        } catch (e) {
          const err = e as { statusCode?: number; message?: string };
          if (err.statusCode === 404 || err.statusCode === 410) {
            await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.deviceId, deviceId));
            req.log.warn({ deviceId, statusCode: err.statusCode }, "❌ Subscrição expirada (404/410), removida do banco");
          } else {
            req.log.error({ deviceId, error: err.message, statusCode: err.statusCode }, "❌ Falha ao enviar notificação Tier 3");
          }
        }
      });
    }
  }

  req.log.info({ deviceId }, "Próximo evento atualizado");
  res.json({ ok: true });
});

export default router;
