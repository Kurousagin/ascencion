// ─── Sistema: traição ────────────────────────────────────────────────────────
// Moradores com lealdade < 30 podem roubar comida ou sabotar o moral. Obscuros
// traem mais; a habilidade 'sombra' reduz a chance à metade. Extraído do
// processDay — fórmulas idênticas; usa ctx.rng para ser determinístico em teste.

import type { SistemaVida, CtxVida } from '../tick';

export const sistemaTraicao: SistemaVida = {
  id: 'traicao',
  processarDia({ draft, rng, log }: CtxVida): void {
    draft.npcs.filter(n => n.vivo).forEach(n => {
      if (n.lealdade >= 30) return;
      let chance = n.obscuro ? 0.2 : 0.1;
      if (n.habilidade === 'sombra') chance *= 0.5;
      if (rng() >= chance) return;

      if (rng() < 0.5) {
        const roubo = 5 + Math.floor(rng() * 16); // 5..20
        draft.recursos.comida = Math.max(0, draft.recursos.comida - roubo);
        log('traicao', `${n.nome.toUpperCase()} ROUBOU COMIDA (${roubo})`);
      } else {
        draft.moral -= 8;
        log('traicao', `${n.nome.toUpperCase()} SABOTOU O GRUPO (-8 Moral)`);
      }
    });
  },
};
