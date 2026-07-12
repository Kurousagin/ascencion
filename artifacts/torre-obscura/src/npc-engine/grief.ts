// ─── Luto ─────────────────────────────────────────────────────────────────────
// Chamado quando um NPC morre. Quem tinha vínculo positivo com o morto sofre na
// sanidade e na lealdade — proporcional à afinidade. É o que dá PESO a descartar
// ou forçar um NPC ao extremo. Retorna intenções de log (mesmo padrão de
// autoExplorar) para o GameContext registrar; e limpa os vínculos do morto.

import type { GameState, LogTipo } from '../lib/game-data';
import { getAfinidade, parKey } from './relationships';
import { anotarCronica } from './cronica';
import { CRONICA_LORE } from '../lib/lore-content';

export interface LogIntent { tipo: LogTipo; mensagem: string; }

// Só sofrem luto vínculos acima deste piso (conhecidos casuais não abalam).
const LIMIAR_LUTO = 15;

export function aplicarLuto(draft: GameState, mortoId: string, mortoNome: string): LogIntent[] {
  const logs: LogIntent[] = [];
  const enlutados: { nome: string; af: number }[] = [];

  for (const n of draft.npcs) {
    if (!n.vivo || n.id === mortoId) continue;
    const af = getAfinidade(draft, n.id, mortoId);
    if (af < LIMIAR_LUTO) continue;
    // Perder o par de um romance dói o dobro.
    const viuvez = draft.vinculosEspeciais?.[parKey(n.id, mortoId)] === 'romance' ? 2 : 1;
    const sanPenalty  = Math.round(2 + af / 10) * viuvez;  // af 100 → −12 sanidade (−24 em romance)
    const lealPenalty = Math.round(af / 20) * viuvez;      // af 100 → −5 lealdade
    n.sanidade = Math.max(0, n.sanidade - sanPenalty);
    n.lealdade = Math.max(0, n.lealdade - lealPenalty);
    // Luto visível no retrato: duração proporcional à afinidade (romance dobra).
    const dias = Math.min(20, Math.round(3 + af / 10) * viuvez);
    n.luto = { nome: mortoNome, ateDia: draft.dia + dias };
    // Perdas que marcam a biografia: vínculo forte ou romance.
    if (af >= 40 || viuvez === 2) {
      anotarCronica(n, draft.dia, CRONICA_LORE.luto.replaceAll('{nome}', mortoNome));
    }
    enlutados.push({ nome: n.nome, af });
  }

  // Limpa os vínculos do morto para não deixar fantasmas nos mapas.
  if (draft.relacionamentos) {
    for (const key in draft.relacionamentos) {
      const [a, b] = key.split('__');
      if (a === mortoId || b === mortoId) delete draft.relacionamentos[key];
    }
  }
  if (draft.vinculosEspeciais) {
    for (const key in draft.vinculosEspeciais) {
      const [a, b] = key.split('__');
      if (a === mortoId || b === mortoId) delete draft.vinculosEspeciais[key];
    }
  }

  if (enlutados.length > 0) {
    enlutados.sort((x, y) => y.af - x.af);
    const principal = enlutados[0];
    const resto = enlutados.length - 1;
    const sufixo = resto > 0 ? ` e mais ${resto} sente${resto > 1 ? 'm' : ''} a ausência` : '';
    logs.push({
      tipo: 'evento',
      mensagem: `${principal.nome.toUpperCase()} não aceita a perda de ${mortoNome}${sufixo}.`,
    });
  }
  return logs;
}
