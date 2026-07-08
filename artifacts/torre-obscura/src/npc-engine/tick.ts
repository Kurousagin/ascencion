// ─── Driver do motor de vida ─────────────────────────────────────────────────
// O motor roda como um PIPELINE de sistemas (padrão Strategy), UMA passada por dia
// de jogo — o próprio pipeline é o "tick interno". O GameContext calcula as
// condições da colônia no dia (economia/moral) e delega toda a evolução por-NPC a
// `tickNpcs`. Novos comportamentos entram como um novo SistemaVida, sem tocar os
// existentes.

import type { GameState, LogTipo } from '../lib/game-data';
import { sistemaDecaimento } from './systems/decaimento';
import { sistemaTraicao } from './systems/traicao';
import { sistemaConvivio } from './systems/convivio';

// Condições da colônia no dia, computadas pelo GameContext antes do tick.
export interface CondicoesColonia {
  fome: boolean;          // comida insuficiente hoje
  diasSemComida: number;  // dias consecutivos sem comida
  excedente: number;      // superlotação (moradores próprios acima do limite)
  moral: number;          // moral atual da colônia (0..100)
  sanidadeDia: number;    // +sanidade/dia vindo de edifícios (ef.sanidadeDia)
  fadigaRec: number;      // recuperação de fadiga vinda de edifícios (ef.fadigaRec)
}

export interface CtxVida {
  draft: GameState;
  colonia: CondicoesColonia;
  rng: () => number;
  log: (tipo: LogTipo, mensagem: string) => void;
}

export interface SistemaVida {
  id: string;
  processarDia(ctx: CtxVida): void;
}

// Ordem importa: decaimento (fome/fadiga/passivas) → traição → convívio (social).
export const SISTEMAS_VIDA: SistemaVida[] = [
  sistemaDecaimento,
  sistemaTraicao,
  sistemaConvivio,
  // sistemaVinculosTipados,  // FUTURO: classifica afinidade em amizade/rivalidade/mentoria/romance
];

export function tickNpcs(ctx: CtxVida): void {
  for (const sistema of SISTEMAS_VIDA) sistema.processarDia(ctx);
}
