import { Router, type IRouter } from "express";
import { db, botCitadelsTable, type BotCitadel } from "@workspace/db";
import { ListarRivaisBody, ListarRivaisResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Quantos rivais devolver por consulta e de quantos "mais próximos" sortear
// (para variar a cada atualização sem sair da faixa de força justa).
const QTD_RIVAIS = 4;
const JANELA_PROXIMOS = 12;

function embaralhar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function paraRival(b: BotCitadel) {
  return {
    slug: b.slug,
    nome: b.nome,
    dia: b.dia,
    andar: b.andar,
    populacao: b.populacao,
    profissoes: b.profissoes,
    poderBase: b.poderBase,
    suprimento: b.suprimento,
    recursos: b.recursos,
    postura: b.postura,
  };
}

// POST /guerra/rivais — cidadelas-bot próximas ao poder militar informado.
router.post("/guerra/rivais", async (req, res) => {
  const parsed = ListarRivaisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ erro: "Corpo inválido" });
    return;
  }
  const { poder, excluir } = parsed.data;
  const excluidos = new Set(excluir ?? []);

  const todos = await db.select().from(botCitadelsTable);
  const disponiveis = todos.filter((b) => !excluidos.has(b.slug));

  // Ordena pelos mais próximos do poder informado, pega a janela e sorteia.
  disponiveis.sort(
    (a, b) => Math.abs(a.poderBase - poder) - Math.abs(b.poderBase - poder),
  );
  const janela = disponiveis.slice(0, JANELA_PROXIMOS);
  const escolhidos = embaralhar(janela).slice(0, QTD_RIVAIS);

  const data = ListarRivaisResponse.parse({
    rivais: escolhidos.map(paraRival),
  });
  res.json(data);
});

export default router;
