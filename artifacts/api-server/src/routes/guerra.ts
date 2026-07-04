import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, botCitadelsTable, type BotCitadel } from "@workspace/db";
import { ListarRivaisBody, ListarRivaisResponse } from "@workspace/api-zod";

// ─── Geração e semeadura determinística de bots ───────────────────────────────
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BOT_PREFIXOS  = ['Bastião','Cidadela','Forte','Enclave','Torre','Reduto','Fortaleza','Domínio','Ninho','Refúgio'];
const BOT_SUFIXOS   = ['das Cinzas','do Ocaso','Silente','Errante','Carmesim','Esquecido','do Véu','Maldito','do Abismo','em Ruínas'];
const BOT_POSTURAS  = ['agressiva','defensiva','equilibrada'] as const;

function gerarBots() {
  const bots = [];
  for (let i = 0; i < 100; i++) {
    const rand = mulberry32(1000 + i * 97);
    const t = i / 99;
    const pref   = BOT_PREFIXOS[Math.floor(rand() * BOT_PREFIXOS.length)];
    const suf    = BOT_SUFIXOS[Math.floor(rand() * BOT_SUFIXOS.length)];
    const postura = BOT_POSTURAS[Math.floor(rand() * BOT_POSTURAS.length)];
    const dia    = Math.round(10 + rand() * 140);
    const andar  = Math.max(1, Math.round(1 + t * 19));
    const pop    = Math.round(5 + rand() * 35);
    const comb   = Math.round(rand() * pop * 0.4);
    const bat    = Math.round(rand() * pop * 0.2);
    const sent   = Math.round(rand() * pop * 0.2);
    const erud   = Math.max(0, pop - comb - bat - sent);
    const poder  = Math.round(5 + rand() * (5 + t * 195));
    bots.push({
      slug: `bot-${i}`,
      nome: `${pref} ${suf}`,
      dia, andar, populacao: pop,
      profissoes: { combatente: comb, batedor: bat, erudito: erud, sentinela: sent },
      poderBase: poder,
      suprimento: Math.round(100 + rand() * 4900),
      recursos: {
        comida:  Math.round(rand() * 200),
        madeira: Math.round(rand() * 150),
        pedra:   Math.round(rand() * 100),
        ferro:   Math.round(rand() * 80),
      },
      postura,
    });
  }
  return bots;
}

async function seedBotsIfEmpty(): Promise<void> {
  try {
    const [row] = await db.select({ n: sql<number>`COUNT(*)` }).from(botCitadelsTable);
    if (Number(row?.n ?? 0) > 0) return;
    const bots = gerarBots();
    for (let i = 0; i < bots.length; i += 25) {
      await db.insert(botCitadelsTable).values(bots.slice(i, i + 25)).onConflictDoNothing();
    }
    console.log('Bot citadels seeded (100 bots).');
  } catch (e) {
    console.error('Failed to seed bots:', e);
  }
}
void seedBotsIfEmpty();

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
