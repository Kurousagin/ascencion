// Semeia ~100 cidadelas-bot como alvos de guerra. Idempotente: upsert por slug,
// gerado de forma determinística (PRNG semeado por índice), então re-rodar não
// duplica nem muda os dados. Usa `pg` direto para não depender de TS/bundler.
//
// Uso: node artifacts/api-server/scripts/seed-bots.mjs
import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL não definido.");
  process.exit(1);
}

// PRNG determinístico (mulberry32) — mesma semente → mesma sequência.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PREFIXOS = [
  "Bastião",
  "Cidadela",
  "Forte",
  "Enclave",
  "Torre",
  "Reduto",
  "Fortaleza",
  "Domínio",
  "Ninho",
  "Refúgio",
];
const SUFIXOS = [
  "das Cinzas",
  "do Ocaso",
  "Silente",
  "Errante",
  "Carmesim",
  "Esquecido",
  "do Véu",
  "Maldito",
  "do Abismo",
  "em Ruínas",
];
const POSTURAS = ["agressiva", "defensiva", "equilibrada"];

const TOTAL = 100;

function gerarBots() {
  const bots = [];
  for (let i = 0; i < TOTAL; i++) {
    const rand = mulberry32(1000 + i * 97);
    const t = i / (TOTAL - 1); // 0..1
    // Distribuição quadrática: muitas cidadelas fracas, poucas colossais.
    const jitter = 0.85 + rand() * 0.3;
    const poderBase = Math.max(6, Math.round((8 + t * t * 300) * jitter));

    const populacao = Math.min(24, Math.max(4, Math.round(poderBase / 9) + 4));
    const andar = Math.min(20, Math.max(1, Math.round(poderBase / 16) + 1));
    const dia = Math.round(populacao * (4 + rand() * 8)) + 10;

    // Profissões: exército de bot é combatente-pesado.
    const combatente = Math.max(1, Math.round(populacao * (0.45 + rand() * 0.2)));
    const sentinela = Math.round(populacao * (0.1 + rand() * 0.15));
    const batedor = Math.round(populacao * (0.08 + rand() * 0.12));
    const erudito = Math.max(0, populacao - combatente - sentinela - batedor);

    const suprimento = Math.round(poderBase * (2.5 + rand() * 2));

    const recursos = {
      comida: Math.round(poderBase * (3 + rand() * 4)) + 20,
      madeira: Math.round(poderBase * (2 + rand() * 3)) + 15,
      pedra: Math.round(poderBase * (1.5 + rand() * 2.5)) + 10,
      ferro: Math.round(poderBase * (1 + rand() * 2)) + 5,
    };

    const nome = `${PREFIXOS[i % 10]} ${SUFIXOS[Math.floor(i / 10) % 10]}`;
    const postura = POSTURAS[i % 3];

    bots.push({
      slug: `bot-${i}`,
      nome,
      dia,
      andar,
      populacao,
      profissoes: { combatente, batedor, erudito, sentinela },
      poderBase,
      suprimento,
      recursos,
      postura,
    });
  }
  return bots;
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const bots = gerarBots();
  let ok = 0;
  try {
    for (const b of bots) {
      await pool.query(
        `INSERT INTO bot_citadels
           (slug, nome, dia, andar, populacao, profissoes, poder_base, suprimento, recursos, postura)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (slug) DO UPDATE SET
           nome = EXCLUDED.nome,
           dia = EXCLUDED.dia,
           andar = EXCLUDED.andar,
           populacao = EXCLUDED.populacao,
           profissoes = EXCLUDED.profissoes,
           poder_base = EXCLUDED.poder_base,
           suprimento = EXCLUDED.suprimento,
           recursos = EXCLUDED.recursos,
           postura = EXCLUDED.postura`,
        [
          b.slug,
          b.nome,
          b.dia,
          b.andar,
          b.populacao,
          JSON.stringify(b.profissoes),
          b.poderBase,
          b.suprimento,
          JSON.stringify(b.recursos),
          b.postura,
        ],
      );
      ok++;
    }
    console.log(`Semeadas ${ok} cidadelas-bot (upsert por slug).`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Falha ao semear bots:", err);
  process.exit(1);
});
