// ─── SISTEMA DE LANÇAMENTO DE TEMPORADAS ────────────────────────────────────
// Cada temporada tem um evento de lançamento com gacha gratuito.
// Para configurar uma nova temporada, edite LANCAMENTO_ATIVO.
// Para desativar o lançamento (fora do período), defina como null.

import type { HabilidadeId, PassivaId } from './game-data';
import { PRIMORDIAIS_LORE, VESTIGIOS_LORE, MARCADOS_LORE } from './lore-content';

// ─── TIPOS ───────────────────────────────────────────────────────────────────

export interface NpcLancamento {
  nome: string;
  titulo: string;           // subtítulo exibido no card
  forca: number;
  agilidade: number;
  inteligencia: number;
  resistencia: number;
  habilidade: HabilidadeId;
  // Lore exibido no card do gacha (antes dos stats)
  cardLore: string[];
  // Linha final do card — só Primordiais têm; Marcados não
  cardLoreFinal?: string;
  // Se true: quase imortal (imune a fome, 10% mort. expedição)
  primordial?: boolean;
  // Se true: primordial da temporada final — raridade Divino (acima de Lendário)
  divino?: boolean;
  // Se true: Vestígio — NPC excepcional com passiva única, mas mortal
  vestigio?: boolean;
  // Passiva ativa quando este NPC está no grupo de expedição
  passivaId?: PassivaId;
}

export interface LancamentoTemporada {
  temporada: number;
  titulo: string;           // Ex: "TEMPORADA I — A ASCENSÃO"
  subtitulo: string;        // Tagline do modal de boas-vindas
  descricao: string[];      // Parágrafos do modal antes do botão de ritual
  // Primordial: o NPC lendário único — sorteado com chanceValdris
  primordial: NpcLancamento;
  chanceValdris: number;    // 0–1, ex: 0.05 = 5%
  // Vestígios: NPCs excepcionais com passivas únicas — sorteados com chanceVestigio
  vestigios?: NpcLancamento[];
  chanceVestigio?: number;  // 0–1, probabilidade de cair em um vestígio (se não for primordial)
  // Pool de Sobreviventes Marcados — todos os outros resultados do gacha
  marcados: NpcLancamento[];
  // Bônus de recursos e moral aplicados ao iniciar o jogo
  bonusRecursos: {
    comida?: number;
    madeira?: number;
    pedra?: number;
    ferro?: number;
  };
  bonusMoral?: number;
  logsBoas: string[];       // Entradas de log adicionadas ao iniciar
}

// ─── LANÇAMENTO ATIVO ────────────────────────────────────────────────────────
// Defina null para desativar. Para Temporada II, substitua este objeto.

export const LANCAMENTO_ATIVO: LancamentoTemporada | null = {
  temporada: 1,
  titulo: 'TEMPORADA I — A ASCENSÃO',
  subtitulo: 'O Observador desperta. A Torre aguarda.',
  descricao: [
    'A Torre Obscura desperta pela primeira vez.',
    'Ela não anunciou sua abertura. Não enviou mensageiros. Simplesmente acordou — e os que estavam à sua sombra sentiram algo mudar no ar.',
    'Como reconhecimento a quem chega primeiro, a Torre concede um Ritual gratuito em Trindade — três cartas, um chamado. Apenas uma será atendida.',
    'Ela escolherá quem se junta à sua cidadela entre os que se apresentarem. Você revela as cartas. A Torre decide qual responde.',
  ],

  // ── Primordial: Valdris ───────────────────────────────────────────────────
  primordial: {
    nome: 'Valdris, o Eterno',
    titulo: 'Primordial da Temporada I',
    forca: 22, agilidade: 18, inteligencia: 16, resistencia: 22,
    habilidade: 'guardiao',
    primordial: true,
    cardLore: PRIMORDIAIS_LORE['valdris'].cardLore,
    cardLoreFinal: PRIMORDIAIS_LORE['valdris'].cardLoreFinal,
  },
  chanceValdris: 0.05,

  // ── Vestígios da Temporada I ──────────────────────────────────────────────
  // ~8% de chance após não sortear o primordial. Excepcionais mas mortais.
  chanceVestigio: 0.08,
  vestigios: [
    {
      nome: 'Corven, o Inquebrável',
      titulo: 'Vestígio da Temporada I',
      forca: 20, agilidade: 14, inteligencia: 12, resistencia: 20,
      habilidade: 'guardiao',
      vestigio: true,
      passivaId: 'veterano_das_profundezas' as PassivaId,
      cardLore: VESTIGIOS_LORE['corven'].cardLore,
      cardLoreFinal: VESTIGIOS_LORE['corven'].cardLoreFinal,
    },
    {
      nome: 'Seris, a Decifradora',
      titulo: 'Vestígio da Temporada I',
      forca: 12, agilidade: 15, inteligencia: 23, resistencia: 15,
      habilidade: 'estrategista',
      vestigio: true,
      passivaId: 'leitura_da_torre' as PassivaId,
      cardLore: VESTIGIOS_LORE['seris'].cardLore,
      cardLoreFinal: VESTIGIOS_LORE['seris'].cardLoreFinal,
    },
    {
      nome: 'Kael, o Sem-Rastro',
      titulo: 'Vestígio da Temporada I',
      forca: 15, agilidade: 22, inteligencia: 13, resistencia: 15,
      habilidade: 'explorador',
      vestigio: true,
      passivaId: 'rastro_vivo' as PassivaId,
      cardLore: VESTIGIOS_LORE['kael'].cardLore,
      cardLoreFinal: VESTIGIOS_LORE['kael'].cardLoreFinal,
    },
  ],

  // ── Sobreviventes Marcados ────────────────────────────────────────────────
  marcados: [
    {
      nome: 'Aryn, a Cinza',
      titulo: 'Sobrevivente Marcada da Temporada I',
      forca: 12, agilidade: 13, inteligencia: 10, resistencia: 12,
      habilidade: 'explorador',
      cardLore: MARCADOS_LORE['aryn'].cardLore,
    },
    {
      nome: 'Soren, o Dobrado',
      titulo: 'Sobrevivente Marcado da Temporada I',
      forca: 14, agilidade: 10, inteligencia: 12, resistencia: 11,
      habilidade: 'guardiao',
      cardLore: MARCADOS_LORE['soren'].cardLore,
    },
    {
      nome: 'Irae, a Visão',
      titulo: 'Sobrevivente Marcada da Temporada I',
      forca: 9, agilidade: 11, inteligencia: 15, resistencia: 12,
      habilidade: 'oraculo',
      cardLore: MARCADOS_LORE['irae'].cardLore,
    },
    {
      nome: 'Veth, o Silencioso',
      titulo: 'Sobrevivente Marcado da Temporada I',
      forca: 11, agilidade: 14, inteligencia: 11, resistencia: 11,
      habilidade: 'sombra',
      cardLore: MARCADOS_LORE['veth'].cardLore,
    },
    {
      nome: 'Kaet, a Estrategista',
      titulo: 'Sobrevivente Marcada da Temporada I',
      forca: 10, agilidade: 12, inteligencia: 14, resistencia: 11,
      habilidade: 'estrategista',
      cardLore: MARCADOS_LORE['kaet'].cardLore,
    },
  ],

  // ── Bônus de recursos ─────────────────────────────────────────────────────
  bonusRecursos: { comida: 80, madeira: 60, pedra: 40, ferro: 20 },
  bonusMoral: 20,
  logsBoas: [
    'TEMPORADA I INICIADA — O Observador desperta pela primeira vez.',
    'RITUAL GRATUITO CONCLUÍDO — Um guardião responde ao chamado da Torre.',
    'BÔNUS INICIAIS — Recursos e moral reforçados para a primeira jornada.',
  ],
};

export const LANCAMENTO_T2: LancamentoTemporada = {
  temporada: 2,
  titulo: 'TEMPORADA II — O INTERVALO',
  subtitulo: 'A Torre revela o que sempre esteve antes de si.',
  descricao: [
    'A Torre não terminou no vigésimo andar.',
    'Ela apenas mudou. O que você encontrou nos primeiros vinte andares era uma introdução — a Torre apresentando o que está disposta a mostrar a quem chegou até aqui.',
    'Como reconhecimento aos que alcançaram o Intervalo, a Torre concede um segundo Ritual em Trindade — três cartas, um chamado. Apenas uma será atendida.',
    'Thael conhece o que a Torre apagou. Se ele responder ao chamado, você saberá que não foi por acaso.',
  ],

  // ── Primordial: Thael ─────────────────────────────────────────────────────
  primordial: {
    nome: 'Thael, a Memória',
    titulo: 'Primordial da Temporada II',
    forca: 20, agilidade: 20, inteligencia: 28, resistencia: 22,
    habilidade: 'oraculo',
    primordial: true,
    cardLore: PRIMORDIAIS_LORE['thael'].cardLore,
    cardLoreFinal: PRIMORDIAIS_LORE['thael'].cardLoreFinal,
  },
  chanceValdris: 0.04,

  // ── Sobreviventes Marcados de T2 ──────────────────────────────────────────
  marcados: [
    {
      nome: 'Reth, o Fragmentado',
      titulo: 'Sobrevivente Marcado da Temporada II',
      forca: 13, agilidade: 11, inteligencia: 12, resistencia: 13,
      habilidade: 'guardiao',
      cardLore: MARCADOS_LORE['reth'].cardLore,
    },
    {
      nome: 'Mira, a Ouvinte',
      titulo: 'Sobrevivente Marcada da Temporada II',
      forca: 9, agilidade: 14, inteligencia: 13, resistencia: 13,
      habilidade: 'sombra',
      cardLore: MARCADOS_LORE['mira'].cardLore,
    },
    {
      nome: 'Caen, o Construtor',
      titulo: 'Sobrevivente Marcado da Temporada II',
      forca: 15, agilidade: 10, inteligencia: 11, resistencia: 13,
      habilidade: 'guardiao',
      cardLore: MARCADOS_LORE['caen'].cardLore,
    },
    {
      nome: 'Liora, a Constante',
      titulo: 'Sobrevivente Marcada da Temporada II',
      forca: 10, agilidade: 12, inteligencia: 15, resistencia: 12,
      habilidade: 'estrategista',
      cardLore: MARCADOS_LORE['liora'].cardLore,
    },
    {
      nome: 'Aldric, o Arquivado',
      titulo: 'Sobrevivente Marcado da Temporada II',
      forca: 12, agilidade: 13, inteligencia: 13, resistencia: 11,
      habilidade: 'explorador',
      cardLore: MARCADOS_LORE['aldric'].cardLore,
    },
    {
      nome: 'Vass, a Testemunha',
      titulo: 'Sobrevivente Marcada da Temporada II',
      forca: 11, agilidade: 11, inteligencia: 14, resistencia: 13,
      habilidade: 'oraculo',
      cardLore: MARCADOS_LORE['vass'].cardLore,
    },
  ],

  bonusRecursos: { comida: 100, madeira: 80, pedra: 60, ferro: 40 },
  bonusMoral: 25,
  logsBoas: [
    'TEMPORADA II INICIADA — O Intervalo começa. A Torre revela o que estava antes.',
    'RITUAL GRATUITO CONCLUÍDO — Um guardião do Intervalo responde ao chamado.',
    'BÔNUS INICIAIS — Recursos reforçados para a jornada além do vigésimo andar.',
  ],
};
