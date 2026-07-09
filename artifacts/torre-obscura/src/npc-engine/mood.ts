// ─── Humor / estado de espírito ──────────────────────────────────────────────
// Rótulo derivado de sanidade, lealdade e fadiga — dá "vida" ao NPC na UI sem
// novo estado persistido. Puro. A pior dimensão domina o rótulo (o que mais
// aflige a pessoa é o que se lê no rosto dela).

import type { NPC } from '../lib/game-data';

export type HumorTom = 'bom' | 'neutro' | 'ruim' | 'critico';

export interface Humor {
  rotulo: string;
  tom: HumorTom;
}

export function humorDe(npc: NPC): Humor {
  // Estados críticos primeiro — cada dimensão no fundo do poço tem sua cara.
  if (npc.sanidade <= 20) return { rotulo: 'À beira do colapso', tom: 'critico' };
  if (npc.lealdade <= 20) return { rotulo: 'Prestes a trair',     tom: 'critico' };
  if (npc.fadiga   >= 90) return { rotulo: 'Exausto ao limite',   tom: 'critico' };

  if (npc.sanidade < 45) return { rotulo: 'Abalado',    tom: 'ruim' };
  if (npc.lealdade < 45) return { rotulo: 'Ressentido', tom: 'ruim' };
  if (npc.fadiga   >= 70) return { rotulo: 'Esgotado',  tom: 'ruim' };

  if (npc.sanidade >= 75 && npc.lealdade >= 75 && npc.fadiga < 40) {
    return { rotulo: 'Radiante', tom: 'bom' };
  }
  if (npc.lealdade >= 65 && npc.sanidade >= 60) {
    return { rotulo: 'Sereno', tom: 'bom' };
  }
  return { rotulo: 'Estável', tom: 'neutro' };
}

// Multiplicador de eficiência derivado do humor — usado em produção (via o
// parâmetro `fatorNpc` de getEfeitos) e no poder de expedição. O humor passa a
// ter consequência: gente abalada rende menos, gente radiante rende um pouco mais.
export function fatorHumor(npc: NPC): number {
  switch (humorDe(npc).tom) {
    case 'bom':     return 1.05;
    case 'ruim':    return 0.9;
    case 'critico': return 0.75;
    default:        return 1;
  }
}
