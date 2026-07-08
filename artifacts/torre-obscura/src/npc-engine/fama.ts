// ─── Fama ─────────────────────────────────────────────────────────────────────
// Reputação acumulada por feitos (sobreviver a expedições/câmaras, vencer, treinar).
// Habilita, na promoção, o caminho raro de FUNDAR a própria casa (ver houses.ts).
// Puro: muta apenas o NPC recebido.

import type { NPC } from '../lib/game-data';

// Feitos e quanta fama cada um concede.
export const FAMA_POR_FEITO = {
  expedicao_sobrevivida: 2,
  camara_vencida: 5,
  andar_conquistado: 4,
  treino_concluido: 1,
  guerra_vencida: 6,
} as const;

export type FeitoId = keyof typeof FAMA_POR_FEITO;

// Fama mínima para poder fundar a própria casa ao ser promovido.
export const FAMA_CASA = 25;

export function registrarFeito(npc: NPC, feito: FeitoId): number {
  npc.fama = (npc.fama ?? 0) + FAMA_POR_FEITO[feito];
  return npc.fama;
}
