// ─── Sistema: convívio ────────────────────────────────────────────────────────
// Faz a afinidade entre NPCs crescer com o convívio — dividir o mesmo posto de
// trabalho, sair na mesma expedição ou pertencer à mesma casa aproxima as pessoas.
// Condições ruins (fome/superlotação) geram atrito. Emite, raramente, uma linha de
// "vida" no log para o jogador sentir que há gente ali, não só nomes.

import type { NPC } from '../../lib/game-data';
import type { SistemaVida, CtxVida } from '../tick';
import { ajustarAfinidade, getAfinidade } from '../relationships';

const CONVIVIO_POSTO = 1;
const CONVIVIO_EXPEDICAO = 2;
const CONVIVIO_CASA = 1;
const ATRITO = 2;
const CHANCE_LOG_VIDA = 0.06;

function agrupar(npcs: NPC[], chave: (n: NPC) => string | null | undefined): NPC[][] {
  const mapa = new Map<string, NPC[]>();
  for (const n of npcs) {
    const k = chave(n);
    if (!k) continue;
    const g = mapa.get(k);
    if (g) g.push(n); else mapa.set(k, [n]);
  }
  return [...mapa.values()].filter(g => g.length >= 2);
}

function fraseVinculo(a: string, b: string, af: number): string {
  if (af >= 60) return `${a} e ${b} tornaram-se inseparáveis.`;
  if (af >= 25) return `${a} confia cada vez mais em ${b}.`;
  if (af > 0)   return `${a} e ${b} dividiram a vigília em silêncio.`;
  return `${a} e ${b} mal se olham pela cidadela.`;
}

export const sistemaConvivio: SistemaVida = {
  id: 'convivio',
  processarDia({ draft, colonia, rng, log }: CtxVida): void {
    const vivos = draft.npcs.filter(n => n.vivo && !n.emprestado && !n.reforco);
    if (vivos.length < 2) return;

    const tocados: [NPC, NPC][] = [];
    const aproximar = (grupo: NPC[], delta: number) => {
      for (let i = 0; i < grupo.length; i++) {
        for (let j = i + 1; j < grupo.length; j++) {
          ajustarAfinidade(draft, grupo[i].id, grupo[j].id, delta);
          tocados.push([grupo[i], grupo[j]]);
        }
      }
    };

    agrupar(vivos, n => n.posto).forEach(g => aproximar(g, CONVIVIO_POSTO));
    const exped = (draft.ultimaExpedicaoGrupo ?? [])
      .map(id => vivos.find(n => n.id === id))
      .filter((n): n is NPC => !!n);
    if (exped.length >= 2) aproximar(exped, CONVIVIO_EXPEDICAO);
    agrupar(vivos, n => n.sobrenome).forEach(g => aproximar(g, CONVIVIO_CASA));

    // Atrito em condições precárias.
    if ((colonia.fome || colonia.excedente > 0) && rng() < 0.5) {
      const a = vivos[Math.floor(rng() * vivos.length)];
      const b = vivos[Math.floor(rng() * vivos.length)];
      if (a && b && a.id !== b.id) ajustarAfinidade(draft, a.id, b.id, -ATRITO);
    }

    // Linha de vida esparsa.
    if (tocados.length > 0 && rng() < CHANCE_LOG_VIDA) {
      const [a, b] = tocados[Math.floor(rng() * tocados.length)];
      log('evento', fraseVinculo(a.nome, b.nome, getAfinidade(draft, a.id, b.id)));
    }
  },
};
