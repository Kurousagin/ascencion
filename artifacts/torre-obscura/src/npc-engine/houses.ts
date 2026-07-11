// ─── Casas / linhagens ────────────────────────────────────────────────────────
// A "casa" de um NPC é o seu `sobrenome`. Ao ser promovido a Raro+, um plebeu sem
// casa pode: (a) ser ADOTADO por uma casa nobre a que tem vínculo forte; (b) com
// fama alta, raramente FUNDAR a própria casa (tom anime/manhwa); ou (c) apenas
// herdar um sobrenome próprio discreto. Regras puras — mutam o NPC e o mapa de
// relacionamentos do state recebido; a UI/log fica com o GameContext.

import type { GameState, NPC, Raridade } from '../lib/game-data';
import { SOBRENOMES } from '../lib/game-data';
import { getAfinidade, ajustarAfinidade } from './relationships';
import { FAMA_CASA } from './fama';

// Afinidade mínima com um nobre para que a casa dele adote o promovido.
export const LIMIAR_ADOCAO = 40;
// Chance de fundar a própria casa quando elegível por fama (raro — anime vibe).
export const CHANCE_FUNDAR_CASA = 0.08;

export function nomeCasa(npc: NPC): string | undefined {
  return npc.sobrenome;
}

export function membrosDaCasa(npcs: NPC[], casa: string): NPC[] {
  return npcs.filter(n => n.vivo && n.sobrenome === casa);
}

function primeiroNome(npc: NPC): string {
  return npc.nome.split(' ')[0];
}

function sobrenomeInedito(npcs: NPC[], rng: () => number): string {
  const usados = new Set(npcs.map(n => n.sobrenome).filter(Boolean) as string[]);
  const livres = SOBRENOMES.filter(s => !usados.has(s));
  const pool = livres.length > 0 ? livres : SOBRENOMES;
  return pool[Math.floor(rng() * pool.length)];
}

export type PromocaoResultado =
  | { tipo: 'adocao'; casa: string; padrinho: NPC }
  | { tipo: 'fundacao'; casa: string }
  | { tipo: 'propria'; casa: string };

// Aplica o efeito de nobreza a um NPC recém-promovido a Raro+. Retorna o que
// aconteceu (para o GameContext narrar) ou null se não se aplica.
export function promoverParaNobre(
  draft: GameState,
  npc: NPC,
  rng: () => number = Math.random,
): PromocaoResultado | null {
  if (npc.sobrenome) return null;                 // já tem casa
  // Nobreza vem de FEITOS, não de estrelas: o rito exige fama de casa.
  // (Raridade dá berço — fama inicial — nunca o título; ver famaDeBerco.)
  if ((npc.fama ?? 0) < FAMA_CASA) return null;

  // (a) Adoção: nobre vivo, com casa, e vínculo forte.
  const padrinho = draft.npcs
    .filter(n => n.vivo && n.id !== npc.id && n.sobrenome && getAfinidade(draft, npc.id, n.id) >= LIMIAR_ADOCAO)
    .sort((a, b) => getAfinidade(draft, npc.id, b.id) - getAfinidade(draft, npc.id, a.id))[0];
  if (padrinho?.sobrenome) {
    npc.sobrenome = padrinho.sobrenome;
    npc.nome = `${primeiroNome(npc)} ${padrinho.sobrenome}`;
    ajustarAfinidade(draft, npc.id, padrinho.id, 10);
    npc.lealdade = Math.min(100, npc.lealdade + 5);
    return { tipo: 'adocao', casa: padrinho.sobrenome, padrinho };
  }

  // (b) Fundação da própria casa — raro, exige fama.
  if ((npc.fama ?? 0) >= FAMA_CASA && rng() < CHANCE_FUNDAR_CASA) {
    const casa = sobrenomeInedito(draft.npcs, rng);
    npc.sobrenome = casa;
    npc.nome = `${primeiroNome(npc)} ${casa}`;
    npc.casaFundador = true;
    return { tipo: 'fundacao', casa };
  }

  // (c) Sobrenome próprio discreto.
  const casa = sobrenomeInedito(draft.npcs, rng);
  npc.sobrenome = casa;
  npc.nome = `${primeiroNome(npc)} ${casa}`;
  return { tipo: 'propria', casa };
}
