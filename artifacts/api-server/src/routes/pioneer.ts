import { Router, type IRouter } from "express";
import { eq, and, asc, count } from "drizzle-orm";
import { db, milestonesTable } from "@workspace/db";
const router: IRouter = Router();

// Quantos pioneers são necessários para desbloquear T2.
const PIONEER_THRESHOLD = 10;
const TIPOS_VALIDOS = ["andar_20"] as const;
type TipoMilestone = (typeof TIPOS_VALIDOS)[number];

function validarBody(body: unknown): { deviceId: string; nome: string; tipo: TipoMilestone } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.deviceId !== "string" || !b.deviceId.trim()) return null;
  if (typeof b.nome !== "string" || !b.nome.trim()) return null;
  if (!TIPOS_VALIDOS.includes(b.tipo as TipoMilestone)) return null;
  return {
    deviceId: String(b.deviceId).trim().slice(0, 64),
    nome:     String(b.nome).trim().slice(0, 32),
    tipo:     b.tipo as TipoMilestone,
  };
}

// POST /api/pioneer — registrar que um jogador atingiu um marco.
// Idempotente: registrar o mesmo (deviceId, tipo) duas vezes não cria duplicata.
// Retorna:
//   { novo: bool, posicao: number, total: number, desbloqueado: bool, nomes: string[] }
router.post("/pioneer", async (req, res) => {
  const body = validarBody(req.body);
  if (!body) {
    res.status(400).json({ erro: "Dados inválidos" });
    return;
  }

  const { deviceId, nome, tipo } = body;

  // Verificar se já existe
  const [existente] = await db
    .select()
    .from(milestonesTable)
    .where(and(eq(milestonesTable.deviceId, deviceId), eq(milestonesTable.tipo, tipo)))
    .limit(1);

  let novo = false;
  if (!existente) {
    try {
      await db.insert(milestonesTable).values({ deviceId, nome, tipo });
      novo = true;
    } catch {
      // Corrida de escrita — já inserido por concorrência, ignora
    }
  }

  // Buscar estado global
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(milestonesTable)
    .where(eq(milestonesTable.tipo, tipo));

  const primeiros = await db
    .select({ deviceId: milestonesTable.deviceId, nome: milestonesTable.nome })
    .from(milestonesTable)
    .where(eq(milestonesTable.tipo, tipo))
    .orderBy(asc(milestonesTable.createdAt))
    .limit(PIONEER_THRESHOLD);

  const nomes = primeiros.map((p) => p.nome);
  const desbloqueado = Number(total) >= PIONEER_THRESHOLD;

  // Posição baseada em deviceId (não em nome — nomes podem colidir).
  const idxDevice = primeiros.findIndex((p) => p.deviceId === deviceId);
  const posicao   = idxDevice >= 0 ? idxDevice + 1 : null;

  res.json({
    novo,
    posicao,
    total: Number(total),
    desbloqueado,
    nomes,
  });
});

// GET /api/pioneer/:tipo — consultar estado atual do marco (polling do cliente).
router.get("/pioneer/:tipo", async (req, res) => {
  const tipo = req.params.tipo;
  if (!["andar_20"].includes(tipo)) {
    res.status(400).json({ erro: "Tipo inválido" });
    return;
  }

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(milestonesTable)
    .where(eq(milestonesTable.tipo, tipo));

  const primeiros = await db
    .select({ nome: milestonesTable.nome })
    .from(milestonesTable)
    .where(eq(milestonesTable.tipo, tipo))
    .orderBy(asc(milestonesTable.createdAt))
    .limit(PIONEER_THRESHOLD);

  res.json({
    total: Number(total),
    desbloqueado: Number(total) >= PIONEER_THRESHOLD,
    nomes: primeiros.map((p) => p.nome),
  });
});

export default router;
