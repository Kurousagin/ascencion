// ─── O TEMPO DA TORRE — clima diário por bioma ────────────────────────────────
// Determinístico por (camaraSeed, dia): a torre de cada jogador amanhece do seu
// próprio jeito, igual para todos os andares do mesmo bioma naquele dia. Sem
// estado persistido — é função pura, recomputável em qualquer tela.
// Textos em CLIMAS_LORE (lore-content.ts); aqui só pesos e multiplicadores.

import { mulberry32 } from '../floor-engine/rng';
import { CLIMAS_LORE, type ClimaTexto } from './lore-content';
import type { BiomaTipo } from './game-data';

export type ClimaEstado = 'neutro' | 'favoravel' | 'adverso';

export interface ClimaDoBioma extends ClimaTexto {
  estado: ClimaEstado;
  multLoot: number; // aplicado ao saque de expedições vitoriosas no bioma
}

const MULT: Record<ClimaEstado, number> = { neutro: 1.0, favoravel: 1.1, adverso: 0.9 };

const BIOMAS: BiomaTipo[] = ['floresta', 'caverna', 'ruinas', 'fortaleza', 'abismo'];

// neutro 60% · favorável 20% · adverso 20%
function sortearEstado(r: number): ClimaEstado {
  if (r < 0.6) return 'neutro';
  if (r < 0.8) return 'favoravel';
  return 'adverso';
}

export function climaDoDia(seed: number, dia: number): Record<BiomaTipo, ClimaDoBioma> {
  // Mistura seed e dia num uint32 (constante de Knuth) — dias vizinhos divergem.
  const rng = mulberry32(((seed >>> 0) ^ Math.imul(dia, 2654435761)) >>> 0);
  const out = {} as Record<BiomaTipo, ClimaDoBioma>;
  for (const bioma of BIOMAS) {
    const estado = sortearEstado(rng());
    out[bioma] = { estado, multLoot: MULT[estado], ...CLIMAS_LORE[bioma][estado] };
  }
  return out;
}
