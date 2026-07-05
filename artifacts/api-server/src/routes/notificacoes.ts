import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
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
    await db
      .insert(pushSubscriptionsTable)
      .values({
        deviceId,
        endpoint,
        p256dh,
        authKey: auth,
        enabled: true,
        lastActiveAt: new Date(),
      })
      .onConflictDoUpdate({
        target: pushSubscriptionsTable.deviceId,
        set: {
          endpoint,
          p256dh,
          authKey: auth,
          enabled: true,
          lastActiveAt: new Date(),
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

  req.log.info({ deviceId }, "Próximo evento atualizado");
  res.json({ ok: true });
});

export default router;
