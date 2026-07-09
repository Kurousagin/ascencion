// ─── Sistema: eventos sociais ─────────────────────────────────────────────────
// Momentos raros que dão drama ao convívio: brigas entre desafetos, reconciliações
// inesperadas e juras de lealdade entre inseparáveis. No máximo 1 evento por dia —
// o catch-up offline de 40 dias não pode virar um folhetim.

import type { SistemaVida, CtxVida } from '../tick';
import { ajustarAfinidade } from '../relationships';

const AF_BRIGA = -30;          // desafetos a partir daqui podem brigar
const AF_RECONCILIACAO_MIN = -60;
const AF_RECONCILIACAO_MAX = -10;
const AF_JURA = 70;            // inseparáveis a partir daqui podem jurar lealdade
const CHANCE_BRIGA = 0.03;
const CHANCE_RECONCILIACAO = 0.015; // dobra com a colônia em moral alta
const CHANCE_JURA = 0.01;

export const sistemaEventosSociais: SistemaVida = {
  id: 'eventos-sociais',
  processarDia({ draft, colonia, rng, log }: CtxVida): void {
    const rel = draft.relacionamentos;
    if (!rel) return;
    const vivos = new Map(draft.npcs.filter(n => n.vivo).map(n => [n.id, n]));
    const chanceRec = CHANCE_RECONCILIACAO * (colonia.moral >= 70 ? 2 : 1);

    for (const key of Object.keys(rel)) {
      const [aId, bId] = key.split('__');
      const a = vivos.get(aId);
      const b = vivos.get(bId);
      if (!a || !b) continue;
      const af = rel[key];

      if (af <= AF_BRIGA && rng() < CHANCE_BRIGA) {
        ajustarAfinidade(draft, aId, bId, -5);
        a.sanidade = Math.max(0, a.sanidade - 3);
        b.sanidade = Math.max(0, b.sanidade - 3);
        log('alerta', `${a.nome} e ${b.nome} trocaram golpes na cidadela — a rixa só piora.`);
        return;
      }

      if (af >= AF_RECONCILIACAO_MIN && af <= AF_RECONCILIACAO_MAX && rng() < chanceRec) {
        ajustarAfinidade(draft, aId, bId, 10 - af); // salta para +10
        log('evento', `${a.nome} e ${b.nome} fizeram as pazes diante da fogueira.`);
        return;
      }

      if (af >= AF_JURA && rng() < CHANCE_JURA) {
        a.lealdade = Math.min(100, a.lealdade + 5);
        b.lealdade = Math.min(100, b.lealdade + 5);
        log('vitoria', `${a.nome} e ${b.nome} juraram lealdade um ao outro — e à cidadela.`);
        return;
      }
    }
  },
};
