// ─── Sistema: decaimento diário ──────────────────────────────────────────────
// Evolução por-NPC extraída do processDay: fome (penalidade + mortes por
// inanição), sanidade de edifícios, recuperação de fadiga, passivas diárias
// (berserker/oráculo), variação de lealdade pela moral e clamps finais. As
// fórmulas são idênticas às originais — apenas realocadas. Mortes por inanição
// disparam luto (grief) nos vínculos do morto.

import type { SistemaVida, CtxVida } from '../tick';
import { aplicarLuto } from '../grief';

const clamp01 = (v: number) => Math.max(0, Math.min(100, v));

export const sistemaDecaimento: SistemaVida = {
  id: 'decaimento',
  processarDia({ draft, colonia, rng, log }: CtxVida): void {
    const vivos = draft.npcs.filter(n => n.vivo);

    // 1. Fome — penalidade base e, a partir do 2º dia, mortes por inanição.
    if (colonia.fome) {
      vivos.forEach(n => { n.sanidade -= 5; n.lealdade -= 3; });

      if (colonia.diasSemComida >= 2) {
        const chanceBase = Math.min(0.50, (colonia.diasSemComida - 1) * 0.05);
        const mortos: { id: string; nome: string }[] = [];
        vivos.forEach(n => {
          if (n.lancamento) return; // imunes à inanição
          if (rng() < chanceBase) {
            n.vivo = false;
            n.posto = null;
            n.emExpedicao = false;
            mortos.push({ id: n.id, nome: n.nome });
          }
        });
        const diasStr = `${colonia.diasSemComida}º dia`;
        if (mortos.length > 0) {
          log('morte', `INANIÇÃO (${diasStr} sem comida): ${mortos.length} morador(es) pereceu de fome.`);
          mortos.forEach(m => aplicarLuto(draft, m.id, m.nome).forEach(l => log(l.tipo, l.mensagem)));
        } else {
          log('alerta', `FOME CRÍTICA (${diasStr}): chance de morte ${Math.round(chanceBase * 100)}% por dia. Providencie comida!`);
        }
      } else {
        log('alerta', 'FOME: Suprimentos insuficientes. Moral e sanidade caindo.');
      }
    }

    // 2. Sanidade vinda de edifícios.
    if (colonia.sanidadeDia) vivos.forEach(n => { n.sanidade += colonia.sanidadeDia; });

    // 3. Recuperação de fadiga (base + enfermaria + curandeiro; superlotação corta).
    //    Não vale para quem está mobilizado na guerra.
    vivos.filter(n => !n.emGuerra).forEach(n => {
      let rec = 10 + colonia.fadigaRec;
      if (n.habilidade === 'curandeiro') rec += 15;
      // Juramento à Escalada: descanso focado — recupera 25% mais rápido.
      if (n.juramento === 'escalada') rec = Math.round(rec * 1.25);
      if (colonia.excedente > 0) rec = Math.max(0, rec - colonia.excedente * 4);
      n.fadiga = Math.max(0, n.fadiga - rec);
    });

    // 4. Passivas diárias.
    vivos.forEach(n => {
      if (n.habilidade === 'berserker') n.lealdade = Math.max(0, n.lealdade - 1);
      if (n.habilidade === 'oraculo')   n.sanidade = Math.min(100, n.sanidade + 5);
    });

    // 5. Variação de lealdade pela moral geral + clamps finais.
    if (colonia.moral > 70) vivos.forEach(n => { n.lealdade = Math.min(100, n.lealdade + 0.2); });
    if (colonia.moral < 40) vivos.forEach(n => { n.lealdade -= 1; });
    vivos.forEach(n => {
      n.lealdade = clamp01(n.lealdade);
      n.sanidade = clamp01(n.sanidade);
      n.fadiga   = clamp01(n.fadiga);
    });
  },
};
