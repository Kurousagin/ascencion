// ─── ESTAÇÕES DA TORRE — a respiração longa ───────────────────────────────────
// Ciclo de 30 dias do jogo: 15 dias de Inspiração (profundezas rendem mais),
// 15 de Expiração (superfície rende mais). A Fortaleza é neutra — muralhas não
// respiram. Determinístico pelo dia do save; textos em ESTACOES_LORE.

import { ESTACOES_LORE } from './lore-content';
import type { BiomaTipo } from './game-data';

const META_ESTACAO = 15;

export type EstacaoId = 'inspira' | 'expira';

export interface Estacao {
  id: EstacaoId;
  nome: string;
  icone: string;
  descricao: string;
  diaNoCiclo: number; // 1..15
  duracao: number;    // 15
}

const MULT: Record<EstacaoId, Partial<Record<BiomaTipo, number>>> = {
  inspira: { caverna: 1.08, abismo: 1.08, floresta: 0.92, ruinas: 0.92 },
  expira:  { floresta: 1.08, ruinas: 1.08, caverna: 0.92, abismo: 0.92 },
};

export function estacaoDoDia(dia: number): Estacao {
  const pos = ((dia - 1) % (META_ESTACAO * 2) + META_ESTACAO * 2) % (META_ESTACAO * 2);
  const id: EstacaoId = pos < META_ESTACAO ? 'inspira' : 'expira';
  return {
    id,
    diaNoCiclo: (pos % META_ESTACAO) + 1,
    duracao: META_ESTACAO,
    ...ESTACOES_LORE[id],
  } as Estacao;
}

export function multEstacao(estacao: Estacao, bioma: BiomaTipo): number {
  return MULT[estacao.id][bioma] ?? 1.0;
}
