// ─── Relacionamentos entre NPCs ──────────────────────────────────────────────
// Afinidade por par, guardada em GameState.relacionamentos sob uma chave canônica
// (ids ordenados) para que (a,b) e (b,a) sejam o mesmo vínculo. Valor −100..100:
// positivo = aliança/amizade; negativo = rivalidade. Funções puras — mutam apenas
// o mapa de relacionamentos do state recebido.

import type { GameState } from '../lib/game-data';

export const AFINIDADE_MIN = -100;
export const AFINIDADE_MAX = 100;

// Chave canônica de um par (independe da ordem dos argumentos).
export function parKey(a: string, b: string): string {
  return a < b ? `${a}__${b}` : `${b}__${a}`;
}

function mapa(state: GameState): Record<string, number> {
  if (!state.relacionamentos) state.relacionamentos = {};
  return state.relacionamentos;
}

export function getAfinidade(state: GameState, a: string, b: string): number {
  if (a === b) return 0;
  return state.relacionamentos?.[parKey(a, b)] ?? 0;
}

// Ajusta a afinidade de um par, com clamp. Remove a entrada quando volta a zero
// para não inflar o save. Retorna o valor final.
export function ajustarAfinidade(state: GameState, a: string, b: string, delta: number): number {
  if (a === b || delta === 0) return getAfinidade(state, a, b);
  const rel = mapa(state);
  const key = parKey(a, b);
  const valor = Math.max(AFINIDADE_MIN, Math.min(AFINIDADE_MAX, (rel[key] ?? 0) + delta));
  if (valor === 0) delete rel[key];
  else rel[key] = valor;
  return valor;
}

export interface Vinculo {
  id: string;        // id do outro NPC
  afinidade: number; // −100..100
}

// Todos os vínculos (não-zero) de um NPC, ordenados por afinidade desc
// (aliados primeiro, rivais por último).
export function vinculosDe(state: GameState, id: string): Vinculo[] {
  const rel = state.relacionamentos;
  if (!rel) return [];
  const out: Vinculo[] = [];
  for (const key in rel) {
    const [a, b] = key.split('__');
    if (a === id) out.push({ id: b, afinidade: rel[key] });
    else if (b === id) out.push({ id: a, afinidade: rel[key] });
  }
  out.sort((x, y) => y.afinidade - x.afinidade);
  return out;
}
