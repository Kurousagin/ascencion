import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, primordialClaimsTable } from "@workspace/db";

const router: IRouter = Router();

const TIPOS_VALIDOS = ["primordial_t1", "primordial_t2", "primordial_t3"] as const;
type TipoPrimordial = (typeof TIPOS_VALIDOS)[number];

function validarTipo(v: unknown): TipoPrimordial | null {
  if (typeof v !== "string") return null;
  return TIPOS_VALIDOS.includes(v as TipoPrimordial) ? (v as TipoPrimordial) : null;
}

// GET /api/primordial/:tipo — verifica se o primordial está disponível globalmente.
// Retorna { disponivel: boolean, claimedByMe: boolean }
router.get("/primordial/:tipo", async (req, res) => {
  const tipo = validarTipo(req.params.tipo);
  if (!tipo) { res.status(400).json({ erro: "Tipo inválido" }); return; }

  const deviceId = typeof req.query.deviceId === "string" ? req.query.deviceId.trim().slice(0, 64) : null;

  const [existente] = await db
    .select()
    .from(primordialClaimsTable)
    .where(eq(primordialClaimsTable.tipo, tipo))
    .limit(1);

  res.json({
    disponivel: !existente,
    claimedByMe: existente?.deviceId === deviceId,
  });
});

// POST /api/primordial/claim — reivindica o primordial para um deviceId.
// Idempotente para o mesmo deviceId. Retorna 409 se outro jogador já reivindicou.
router.post("/primordial/claim", async (req, res) => {
  const body = req.body as Record<string, unknown>;
  const tipo = validarTipo(body?.tipo);
  const deviceId = typeof body?.deviceId === "string" ? body.deviceId.trim().slice(0, 64) : null;

  if (!tipo || !deviceId) { res.status(400).json({ erro: "Dados inválidos" }); return; }

  // Verificar se já foi reivindicado
  const [existente] = await db
    .select()
    .from(primordialClaimsTable)
    .where(eq(primordialClaimsTable.tipo, tipo))
    .limit(1);

  if (existente) {
    if (existente.deviceId === deviceId) {
      // Já reivindicado pelo mesmo jogador — idempotente
      res.json({ claimed: true, mine: true });
      return;
    }
    // Outro jogador já tem este primordial
    res.status(409).json({ erro: "Primordial já reivindicado por outro jogador" });
    return;
  }

  try {
    await db.insert(primordialClaimsTable).values({ deviceId, tipo });
    res.json({ claimed: true, mine: true });
  } catch {
    // Corrida de escrita — outro jogador chegou primeiro no mesmo instante
    res.status(409).json({ erro: "Primordial reivindicado por concorrência" });
  }
});

export default router;
