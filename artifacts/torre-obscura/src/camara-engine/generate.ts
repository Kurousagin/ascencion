// ─── Geração procedural das câmaras da torre ──────────────────────────────────
// A partir da `camaraSeed` do save, monta o conjunto de câmaras — colocação de
// temas por andar + requisito local + dureza — de forma determinística. Mesma
// seed → mesma torre; seeds diferentes → torres diferentes (anti-guia).

import { HABITANTES, capituloDoAndar, type GameState, type CamaraSecreta, type RequisitoCamara } from '../lib/game-data';
import { mulberry32, rngPara, rngInt, rngPick, rngWeighted, type Rng } from './rng';
import { temasDoCapitulo, REQUISITOS_POOL, type TemaCamara } from './pools';

// Até onde geramos câmaras nesta fase (T1 + T2). 41–100 estende os pools depois.
const ANDAR_MAX = 40;
const BOSS = new Set([5, 10, 15, 20, 25, 30, 35, 40]);

function montarRequisito(floor: number, rng: Rng): RequisitoCamara {
  let arq = rngWeighted(rng, REQUISITOS_POOL);
  // quest_habitante só existe em andar com habitante (não-chefe).
  if (arq === 'quest_habitante' && (BOSS.has(floor) || !HABITANTES[floor])) arq = 'farms_andar';

  switch (arq) {
    case 'farms_andar': {
      const minFarms = rngInt(rng, 2, 4);
      return { tipo: 'farms_andar', floor, minFarms,
        textoRequisito: `Explorar o Andar ${floor} ${minFarms} vezes revela a passagem escondida.` };
    }
    case 'quest_habitante':
      return { tipo: 'quest_habitante', floor,
        textoRequisito: `Concluir a história do morador do Andar ${floor} desvela a câmara.` };
    case 'mortes_andar': {
      const minMortes = rngInt(rng, 3, 3 + Math.floor(floor / 4));
      return { tipo: 'mortes_andar', minMortes,
        textoRequisito: `Só depois de ${minMortes} perdas na Torre a fenda se abre.` };
    }
    case 'npc_raridade': {
      const raridade = rngPick(rng, ['incomum', 'raro'] as const);
      const quantidade = rngInt(rng, 2, 3);
      return { tipo: 'npc_raridade', raridade, quantidade,
        textoRequisito: `Reunir ${quantidade} moradores ${raridade}s para pressentir o oculto.` };
    }
    case 'recurso_minimo': {
      const recurso = rngPick(rng, ['comida', 'madeira', 'pedra', 'ferro'] as const);
      const quantidade = (floor * 15) + rngInt(rng, 0, 40);
      return { tipo: 'recurso_minimo', recurso, quantidade,
        textoRequisito: `Acumular ${quantidade} de ${recurso} atrai o que estava escondido.` };
    }
  }
}

function montarCamara(floor: number, idx: number, tema: TemaCamara, rng: Rng): CamaraSecreta {
  // Dureza: default 1.25×; chefes e sorteios raros ficam mais duros.
  let multiplicador = 1.25;
  if (BOSS.has(floor)) multiplicador += 0.2;
  if (rng() < 0.15) multiplicador += rngInt(rng, 1, 3) / 10; // pico raro
  const moralBonus = rngInt(rng, 2, 5);
  const custo = 12 + floor + rngInt(rng, 0, 8);
  return {
    floor,
    titulo: tema.titulo,
    icone: tema.icone,
    descricao: tema.descricao,
    requisito: montarRequisito(floor, rng),
    tipo: 'benéfica',
    dificuldade: 10 + floor,              // legado (não lido; dificuldadeCamara escala pelo andar)
    multiplicadorDificuldade: Math.round(multiplicador * 100) / 100,
    custo,
    maxTentativas: 3,
    chancePerTentativa: 0.4,              // legado
    resultado: {
      sucessoTexto: tema.sucessoTexto,
      falhaTexto: tema.falhaTexto,
      moralBonus,
      chanceMorteNPC: 0.12,
      loreGanho: tema.loreGanho,
    },
  };
}

// Câmaras de um andar (1–2), escolhendo temas sem repetir, por seed.
export function gerarCamarasDoAndar(floor: number, seedBase: number): Record<string, CamaraSecreta> {
  const rng = rngPara(seedBase, floor);
  const temas = [...temasDoCapitulo(capituloDoAndar(floor))];
  if (temas.length === 0) return {};
  const qtd = rng() < 0.35 ? 2 : 1;
  const out: Record<string, CamaraSecreta> = {};
  for (let i = 0; i < qtd && temas.length > 0; i++) {
    const ti = Math.floor(rng() * temas.length);
    const tema = temas.splice(ti, 1)[0];
    out[`${floor}_${i + 1}`] = montarCamara(floor, i + 1, tema, rng);
  }
  return out;
}

// ─── Selector memoizado ───────────────────────────────────────────────────────
let cacheSeed: number | null = null;
let cache: Record<string, CamaraSecreta> = {};

// Conjunto completo de câmaras da torre do save (regenerado da seed, sem inchar o
// save). Memoizado pela seed. `camaraSeed` ausente (save muito antigo) → torre vazia
// até a migração atribuir uma seed.
export function camarasDaTorre(state: Pick<GameState, 'camaraSeed'>): Record<string, CamaraSecreta> {
  const seed = state.camaraSeed;
  if (seed == null) return {};
  if (cacheSeed === seed) return cache;
  const todas: Record<string, CamaraSecreta> = {};
  for (let f = 1; f <= ANDAR_MAX; f++) {
    Object.assign(todas, gerarCamarasDoAndar(f, seed));
  }
  cacheSeed = seed;
  cache = todas;
  return todas;
}

// Seed nova para um save (deriva do deviceId quando disponível + entropia).
export function novaCamaraSeed(deviceId?: string): number {
  const base = deviceId ? deviceId : Math.random().toString(36).slice(2);
  const salt = Math.floor(Math.random() * 0xffffffff);
  return mulberry32((salt ^ base.split('').reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7))>>>0)() * 0xffffffff >>> 0;
}
