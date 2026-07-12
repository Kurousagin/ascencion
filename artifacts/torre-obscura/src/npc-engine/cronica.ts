// ─── Crônica pessoal ──────────────────────────────────────────────────────────
// Biografia por evento do morador, exibida no retrato (Habitantes). Cada entrada
// é uma frase curta com o dia em que aconteceu. Entradas repetidas em sequência
// viram contador (×N) para expedições de farm não afogarem a história. Cap
// pequeno para o save não crescer. Puro: muta apenas o NPC recebido.

import type { NPC } from '../lib/game-data';

export const CRONICA_CAP = 12;

export function anotarCronica(npc: NPC, dia: number, texto: string): void {
  npc.cronica ??= [];
  const ultima = npc.cronica[npc.cronica.length - 1];
  if (ultima && ultima.texto === texto) {
    ultima.vezes = (ultima.vezes ?? 1) + 1;
    ultima.dia = dia;
    return;
  }
  npc.cronica.push({ dia, texto });
  if (npc.cronica.length > CRONICA_CAP) npc.cronica.splice(0, npc.cronica.length - CRONICA_CAP);
}
