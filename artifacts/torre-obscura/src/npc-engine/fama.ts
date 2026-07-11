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
// Fama em que a cidadela passa a NOTAR o morador (primeiro degrau de título).
export const FAMA_NOTAVEL = 15;

// ─── Títulos de nobreza (derivados — nada persiste além de fama/sobrenome) ────
// Morador → Notável (fama) → Nobre (rito de casa) → Cabeça (maior fama da casa
// com 2+ membros vivos). Raridade NÃO dá título: dá berço (famaDeBerco).
export type TituloNobreza = 'morador' | 'notavel' | 'nobre' | 'cabeca';

export const TITULO_LABEL: Record<TituloNobreza, string> = {
  morador: 'Morador',
  notavel: 'Notável',
  nobre: 'Nobre',
  cabeca: 'Cabeça da Casa',
};

export function tituloNobreza(npcs: NPC[], npc: NPC): TituloNobreza {
  if (npc.sobrenome) {
    const casa = npcs.filter(n => n.vivo && n.sobrenome === npc.sobrenome);
    const maiorFama = Math.max(...casa.map(n => n.fama ?? 0));
    if (casa.length >= 2 && (npc.fama ?? 0) >= maiorFama) return 'cabeca';
    return 'nobre';
  }
  return (npc.fama ?? 0) >= FAMA_NOTAVEL ? 'notavel' : 'morador';
}

export function registrarFeito(npc: NPC, feito: FeitoId): number {
  npc.fama = (npc.fama ?? 0) + FAMA_POR_FEITO[feito];
  return npc.fama;
}
