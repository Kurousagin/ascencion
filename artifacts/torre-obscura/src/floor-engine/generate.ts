// ─── Geração procedural do ECOSSISTEMA de cada andar ─────────────────────────
// A partir da `camaraSeed` do save, monta as câmaras de cada andar — colocação de
// temas + requisito (pista) local + dureza — de forma determinística. Mesma seed →
// mesma torre; seeds diferentes → torres diferentes (anti-guia). Os ids são
// ESTÁVEIS por (seed, floor) — `${floor}_${idx}` — garantindo que estado/pistas
// persistidos nunca fiquem pendurados (ver FloorEcosystem/activeClues).

import { capituloDoAndar, type GameState, type CamaraSecreta } from '../lib/game-data';
import { mulberry32, rngPara, rngInt, rngWeighted, type Rng } from './rng';
import { temasDoCapitulo, type TemaCamara } from './pools/temas';
import { REQUISITOS_POOL, montarRequisito } from './pools/requisitos';

// Até onde geramos câmaras nesta fase (T1 + T2). 41–100 estende os pools depois.
const ANDAR_MAX = 40;
const BOSS = new Set([5, 10, 15, 20, 25, 30, 35, 40]);

function montarCamara(floor: number, tema: TemaCamara, rng: Rng): CamaraSecreta {
  // Dureza: default 1.5×; chefes e sorteios raros ficam ainda mais duros.
  let multiplicador = 1.5;
  if (BOSS.has(floor)) multiplicador += 0.2;
  if (rng() < 0.15) multiplicador += rngInt(rng, 1, 3) / 10; // pico raro
  const moralBonus = rngInt(rng, 2, 5);
  const custo = 12 + floor + rngInt(rng, 0, 8);
  const arq = rngWeighted(rng, REQUISITOS_POOL);
  return {
    floor,
    titulo: tema.titulo,
    icone: tema.icone,
    descricao: tema.descricao,
    requisito: montarRequisito(floor, arq, rng),
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
    out[`${floor}_${i + 1}`] = montarCamara(floor, tema, rng);
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

// ─── Ecossistema do andar (gancho para o futuro) ─────────────────────────────
// Objeto unificado do andar: hoje câmaras + pistas ativas; preparado para receber
// `encounters`/`localEvents`. `activeClues` é uma PROJEÇÃO derivada do estado
// persistido (camarasSecretasEstado[id].descoberta) sobre ids ESTÁVEIS — não é um
// buffer armazenado, então trocar de andar não gera/perde nada. Orphan-safe: só
// lista ids cuja câmara existe no ecossistema regenerado.
export interface FloorEcosystem {
  floor: number;
  chambers: Record<string, CamaraSecreta>;
  activeClues: string[];
  // futuro: encounters?: ...; localEvents?: ...
}

export function ecossistemaDoAndar(
  state: Pick<GameState, 'camaraSeed' | 'camarasSecretasEstado'>,
  floor: number,
): FloorEcosystem {
  const seed = state.camaraSeed;
  const chambers = seed == null ? {} : gerarCamarasDoAndar(floor, seed);
  const activeClues = Object.keys(chambers).filter(
    id => state.camarasSecretasEstado?.[id]?.descoberta && !state.camarasSecretasEstado?.[id]?.encontrada,
  );
  return { floor, chambers, activeClues };
}

// Seed nova para um save (deriva do deviceId quando disponível + entropia).
export function novaCamaraSeed(deviceId?: string): number {
  const base = deviceId ? deviceId : Math.random().toString(36).slice(2);
  const salt = Math.floor(Math.random() * 0xffffffff);
  return mulberry32((salt ^ base.split('').reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7))>>>0)() * 0xffffffff >>> 0;
}
