// ─── Sistema: vínculos tipados ────────────────────────────────────────────────
// Dá NOME ao que a afinidade já conta. Amizade e rivalidade são derivadas do
// número (sem estado novo); romance e mentoria são ARCOS — acontecem num dia,
// ganham log e ficam persistidos em `GameState.vinculosEspeciais` até esfriarem.
// No máximo 1 arco novo por dia, para o catch-up offline não virar novela.

import type { GameState, NPC } from '../../lib/game-data';
import type { SistemaVida, CtxVida } from '../tick';
import { getAfinidade, parKey } from '../relationships';

export type VinculoEspecial = 'romance' | 'mentoria';
export type TipoVinculo = 'amizade' | 'rivalidade' | VinculoEspecial;

export const AF_AMIZADE = 50;
export const AF_RIVALIDADE = -40;
export const AF_ROMANCE = 60;
export const AF_MENTORIA = 30;
// Abaixo disto um arco persistido esfria e se desfaz.
export const AF_DISSOLUCAO = 20;
// Mentoria exige clara diferença de calibre entre os dois.
export const DIF_STAT_MENTORIA = 15;
const CHANCE_ROMANCE = 0.02;
const CHANCE_MENTORIA = 0.04;

function especiais(state: GameState): Record<string, VinculoEspecial> {
  if (!state.vinculosEspeciais) state.vinculosEspeciais = {};
  return state.vinculosEspeciais;
}

// Tipo do vínculo de um par: arco persistido primeiro, senão derivado do número.
export function tipoVinculo(state: GameState, a: string, b: string): TipoVinculo | null {
  const esp = state.vinculosEspeciais?.[parKey(a, b)];
  if (esp) return esp;
  const af = getAfinidade(state, a, b);
  if (af >= AF_AMIZADE) return 'amizade';
  if (af <= AF_RIVALIDADE) return 'rivalidade';
  return null;
}

export function emRomance(state: GameState, id: string): boolean {
  const esp = state.vinculosEspeciais;
  if (!esp) return false;
  return Object.keys(esp).some(k => esp[k] === 'romance' && k.split('__').includes(id));
}

function statDominante(n: NPC): number {
  return Math.max(n.forca, n.agilidade, n.inteligencia, n.resistencia);
}

// +1 no ganho de treino/estudo quando o NPC tem um mentor vivo que o supera no
// stat treinado (a direção da mentoria é a do calibre, não é gravada no par).
export function bonusMentor(
  state: GameState,
  npc: NPC,
  statKey: 'forca' | 'agilidade' | 'inteligencia' | 'resistencia',
): number {
  const esp = state.vinculosEspeciais;
  if (!esp) return 0;
  for (const key in esp) {
    if (esp[key] !== 'mentoria') continue;
    const [a, b] = key.split('__');
    const outroId = a === npc.id ? b : b === npc.id ? a : null;
    if (!outroId) continue;
    const outro = state.npcs.find(n => n.id === outroId && n.vivo);
    if (outro && outro[statKey] > npc[statKey]) return 1;
  }
  return 0;
}

export const sistemaVinculosTipados: SistemaVida = {
  id: 'vinculos-tipados',
  processarDia({ draft, rng, log }: CtxVida): void {
    const rel = draft.relacionamentos;
    if (!rel) return;
    const esp = especiais(draft);
    const vivos = new Map(draft.npcs.filter(n => n.vivo).map(n => [n.id, n]));

    // 1) Dissolução: arcos esfriam quando a afinidade cai (ou alguém partiu).
    for (const key of Object.keys(esp)) {
      const [aId, bId] = key.split('__');
      const a = vivos.get(aId);
      const b = vivos.get(bId);
      if (a && b && getAfinidade(draft, aId, bId) >= AF_DISSOLUCAO) continue;
      const tipo = esp[key];
      delete esp[key];
      if (a && b) {
        log('evento', tipo === 'romance'
          ? `O romance entre ${a.nome} e ${b.nome} esfriou.`
          : `A mentoria entre ${a.nome} e ${b.nome} chegou ao fim.`);
      }
    }

    // 2) Novos arcos — no máximo 1 por dia.
    for (const key of Object.keys(rel)) {
      if (esp[key]) continue;
      const [aId, bId] = key.split('__');
      const a = vivos.get(aId);
      const b = vivos.get(bId);
      if (!a || !b) continue;
      const af = rel[key];

      if (af >= AF_ROMANCE && !emRomance(draft, aId) && !emRomance(draft, bId)
          && rng() < CHANCE_ROMANCE) {
        esp[key] = 'romance';
        log('evento', `${a.nome} e ${b.nome} agora dividem o mesmo destino — um romance floresce na cidadela.`);
        return;
      }

      if (af >= AF_MENTORIA
          && Math.abs(statDominante(a) - statDominante(b)) >= DIF_STAT_MENTORIA
          && rng() < CHANCE_MENTORIA) {
        const mentor = statDominante(a) >= statDominante(b) ? a : b;
        const aprendiz = mentor === a ? b : a;
        esp[key] = 'mentoria';
        log('evento', `${mentor.nome} tomou ${aprendiz.nome} como aprendiz.`);
        return;
      }
    }
  },
};
