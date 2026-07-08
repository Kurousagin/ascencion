// ─── Luto ─────────────────────────────────────────────────────────────────────
// Chamado quando um NPC morre. Quem tinha vínculo positivo com o morto sofre na
// sanidade e na lealdade — proporcional à afinidade. É o que dá PESO a descartar
// ou forçar um NPC ao extremo. Retorna intenções de log (mesmo padrão de
// autoExplorar) para o GameContext registrar; e limpa os vínculos do morto.

import type { GameState, LogTipo } from '../lib/game-data';
import { getAfinidade } from './relationships';

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
    const sanPenalty  = Math.round(2 + af / 10);  // af 100 → −12 sanidade
    const lealPenalty = Math.round(af / 20);      // af 100 → −5 lealdade
    n.sanidade = Math.max(0, n.sanidade - sanPenalty);
    n.lealdade = Math.max(0, n.lealdade - lealPenalty);
    enlutados.push({ nome: n.nome, af });
  }

  // Limpa os vínculos do morto para não deixar fantasmas no mapa.
  if (draft.relacionamentos) {
    for (const key in draft.relacionamentos) {
      const [a, b] = key.split('__');
      if (a === mortoId || b === mortoId) delete draft.relacionamentos[key];
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
