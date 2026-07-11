// ─── FÔLEGO DOS ANDARES — pressão ecológica de exploração ─────────────────────
// Farmar o mesmo andar repetidamente cansa o lugar: o rendimento cai e regenera
// com os dias ("a mata precisa respirar"). Decaimento LAZY: nada roda no
// processDay — o valor efetivo é derivado de (usos, dia do último uso).
// Só afeta o SAQUE de explorações (farm); conquistas e quests não são punidas.

import type { GameState } from './game-data';
import { FLOORS } from './game-data';

const DECAIMENTO_POR_DIA = 0.5; // meio uso recuperado por dia
const LIMIAR_CANSADO = 3;       // 3+ usos efetivos → rende 85%
const LIMIAR_EXAUSTO = 5;       // 5+ usos efetivos → rende 70%

type EstadoFolego = Pick<GameState, 'dia' | 'fadigaAndar' | 'andarAtual'>;

export function folegoEfetivo(state: EstadoFolego, floor: number): number {
  const reg = state.fadigaAndar?.[floor];
  if (!reg) return 0;
  return Math.max(0, reg.usos - DECAIMENTO_POR_DIA * (state.dia - reg.dia));
}

export type NivelFolego = 'pleno' | 'cansado' | 'exausto';

export function nivelFolego(state: EstadoFolego, floor: number): NivelFolego {
  const usos = folegoEfetivo(state, floor);
  if (usos >= LIMIAR_EXAUSTO) return 'exausto';
  if (usos >= LIMIAR_CANSADO) return 'cansado';
  return 'pleno';
}

export function multFolego(state: EstadoFolego, floor: number): number {
  const nivel = nivelFolego(state, floor);
  return nivel === 'exausto' ? 0.70 : nivel === 'cansado' ? 0.85 : 1.0;
}

// Cadeia de biomas: exaurir um andar empurra a caça para os irmãos de bioma —
// os OUTROS andares conquistados do mesmo bioma rendem +10% enquanto durar.
export function multCadeia(state: EstadoFolego, floor: number, bioma: string): number {
  const irmaoExausto = FLOORS.some(f =>
    f.bioma === bioma &&
    f.floor !== floor &&
    f.floor < state.andarAtual &&
    nivelFolego(state, f.floor) === 'exausto');
  return irmaoExausto ? 1.10 : 1.0;
}

// Registra um uso (chamar em vitória de farm). Muta o draft do GameState.
export function usarFolego(draft: GameState, floor: number): void {
  const efetivo = folegoEfetivo(draft, floor);
  draft.fadigaAndar = draft.fadigaAndar ?? {};
  draft.fadigaAndar[floor] = { usos: efetivo + 1, dia: draft.dia };
}
