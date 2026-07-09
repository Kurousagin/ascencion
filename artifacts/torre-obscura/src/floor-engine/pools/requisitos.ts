// ─── Pool de REQUISITOS (arquétipos de stat gating) ──────────────────────────
// A descoberta de uma câmara nunca é automática nem trivial: o requisito é uma
// PISTA estrita, escalada agressivamente ao andar. No Early Game o esquadrão
// simplesmente não atinge os limiares (atributos altos, classes desenvolvidas,
// sussurros acumulados) — a pista de andares altos só surge depois, e a de T1
// recompensa quem VOLTA forte (backtracking). Tom "a Torre omite, nunca mente".

import { capituloDoAndar, PROFISSOES, type RequisitoCamara, type ProfissaoId } from '../../lib/game-data';
import { rngInt, rngPick, type Rng } from '../rng';

export type RequisitoArquetipo =
  | 'npc_atributo_alto'    // K NPCs com <stat> ≥ limiar (escala forte com o andar)
  | 'classe_desenvolvida'  // K NPCs de <classe> com o stat da classe ≥ limiar
  | 'sussurros_capitulo'   // N fragmentos 'sussurro' do capítulo já desbloqueados
  | 'npc_raridade'         // K moradores raros ou superiores
  | 'farms_andar';         // farmar ESTE andar N vezes (peso baixo — não é mais o gate trivial)

// Pesos favorecem os gates duros (atributo/classe); farms fica como fallback raro.
export const REQUISITOS_POOL: ReadonlyArray<{ item: RequisitoArquetipo; peso: number }> = [
  { item: 'npc_atributo_alto', peso: 3 },
  { item: 'classe_desenvolvida', peso: 3 },
  { item: 'sussurros_capitulo', peso: 2 },
  { item: 'npc_raridade', peso: 2 },
  { item: 'farms_andar', peso: 1 },
];

const STATS = ['forca', 'agilidade', 'inteligencia', 'resistencia'] as const;
const STAT_LABEL: Record<(typeof STATS)[number], string> = {
  forca: 'FOR', agilidade: 'AGI', inteligencia: 'INT', resistencia: 'RES',
};

// Constrói um RequisitoCamara concreto a partir do arquétipo, escalado ao andar.
// Os limiares crescem agressivamente com `floor` — ver plano (Fase 1).
export function montarRequisito(floor: number, arq: RequisitoArquetipo, rng: Rng): RequisitoCamara {
  const cap = capituloDoAndar(floor);
  switch (arq) {
    case 'npc_atributo_alto': {
      const stat = rngPick(rng, STATS);
      const quantidade = 2 + Math.floor(floor / 10);
      const minValor = Math.round(10 + floor * 0.9);
      return { tipo: 'npc_atributo_alto', stat, minValor, quantidade,
        textoRequisito: `Reunir ${quantidade} moradores com ${STAT_LABEL[stat]} ≥ ${minValor} para pressentir o que o andar guarda.` };
    }
    case 'classe_desenvolvida': {
      const profissao = rngPick(rng, ['combatente', 'batedor', 'erudito', 'sentinela'] as const);
      const quantidade = 1 + Math.floor(floor / 12);
      const minStat = Math.round(12 + floor * 0.8);
      const nome = PROFISSOES[profissao].nome;
      return { tipo: 'classe_desenvolvida', profissao, minStat, quantidade,
        textoRequisito: `${quantidade} ${nome}${quantidade > 1 ? 's' : ''} de talento apurado (≥ ${minStat}) fazem a passagem se insinuar.` };
    }
    case 'sussurros_capitulo': {
      const quantidade = Math.min(3, 1 + Math.floor(cap / 2));
      return { tipo: 'sussurros_capitulo', capitulo: cap, quantidade,
        textoRequisito: `Só depois de ouvir ${quantidade} Sussurro${quantidade > 1 ? 's' : ''} deste ciclo o caminho se desenha.` };
    }
    case 'npc_raridade': {
      const quantidade = 2 + Math.floor(floor / 12);
      return { tipo: 'npc_raridade', raridade: 'raro', quantidade,
        textoRequisito: `Reunir ${quantidade} moradores raros (ou superiores) para que o oculto se deixe notar.` };
    }
    case 'farms_andar': {
      const minFarms = 5 + Math.floor(floor / 8) + rngInt(rng, 0, 2);
      return { tipo: 'farms_andar', floor, minFarms,
        textoRequisito: `Percorrer o Andar ${floor} ${minFarms} vezes gasta o véu que esconde a passagem.` };
    }
  }
}
