// ─── O LUGAR VIVO — descrição por estado e sussurros de lugar ────────────────
// Um andar não é uma linha numa lista: é um lugar que muda (descrição por
// estado), lembra (memoriais) e fala de volta (sussurros raros durante farm).
// Textos em DESCRICOES_ANDAR_LORE / SUSSURROS_LUGAR_LORE (lore-content.ts).

import { DESCRICOES_ANDAR_LORE, SUSSURROS_LUGAR_LORE } from './lore-content';
import { FLOORS, type GameState } from './game-data';

// Descrição viva: determinística pelo estado do save — evolui com o jogo,
// mas é estável dentro do mesmo momento (nada de texto trocando a cada render).
export function descricaoVivaDoAndar(
  state: Pick<GameState, 'dia' | 'farmsPerFloor' | 'andarConquistadoDia' | 'memoriais'>,
  floor: number,
): string {
  const f = FLOORS[floor - 1];
  if (!f) return '';
  const t = DESCRICOES_ANDAR_LORE[f.bioma];
  if (!t) return '';

  const farms = state.farmsPerFloor?.[floor] ?? 0;
  const conquistadoDia = state.andarConquistadoDia?.[floor];
  const recente = conquistadoDia != null && state.dia - conquistadoDia <= 5;

  const frase = recente ? t.recente
    : farms >= 5 ? t.batido
    : farms >= 1 ? t.visitado
    : t.quieto;

  const memoriais = state.memoriais?.[floor] ?? [];
  const ultimo = memoriais[memoriais.length - 1];
  const memoria = ultimo ? ' ' + t.memoria.replaceAll('{nome}', ultimo.nome) : '';

  return frase + memoria;
}

export function sortearSussurroLugar(bioma: string): string | null {
  const pool = SUSSURROS_LUGAR_LORE[bioma];
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
