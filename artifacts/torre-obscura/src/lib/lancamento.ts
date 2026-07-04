// ─── SISTEMA DE LANÇAMENTO DE TEMPORADAS ────────────────────────────────────
// Cada temporada tem um evento de lançamento com gacha gratuito.
// Para configurar uma nova temporada, edite LANCAMENTO_ATIVO.
// Para desativar o lançamento (fora do período), defina como null.

import type { HabilidadeId } from './game-data';

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
}

export interface LancamentoTemporada {
  temporada: number;
  titulo: string;           // Ex: "TEMPORADA I — A ASCENSÃO"
  subtitulo: string;        // Tagline do modal de boas-vindas
  descricao: string[];      // Parágrafos do modal antes do botão de ritual
  // Primordial: o NPC lendário único — sorteado com chanceValdris
  primordial: NpcLancamento;
  chanceValdris: number;    // 0–1, ex: 0.05 = 5%
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
    'A Torre Obscura abre seus portões pela primeira vez.',
    'Como sinal de reconhecimento, a Torre concede a você um Ritual gratuito em Trindade — e recursos para começar com vantagem.',
    'A Torre escolherá quem se une à sua cidadela. Você não escolhe. Ela sim.',
  ],

  // ── Primordial: Valdris ───────────────────────────────────────────────────
  primordial: {
    nome: 'Valdris, o Eterno',
    titulo: 'Primordial da Temporada I',
    forca: 15, agilidade: 12, inteligencia: 11, resistencia: 15,
    habilidade: 'guardiao',
    primordial: true,
    cardLore: [
      'Sobreviveu a eras antes da Torre existir. Não sabe o que é cansaço. Não conhece o que é medo.',
      'Chegou ao vigésimo andar uma vez. Voltou diferente. Quando perguntado sobre o que viu lá, olha para o horizonte e cala.',
      'A Torre o reconhece antes de reconhecer você. Isso, sozinho, deveria dizer tudo.',
    ],
    cardLoreFinal: 'Em toda a extensão dos ecos, apenas você o recebeu.',
  },
  chanceValdris: 0.05,

  // ── Sobreviventes Marcados ────────────────────────────────────────────────
  marcados: [
    {
      nome: 'Aryn, a Cinza',
      titulo: 'Sobrevivente Marcada da Temporada I',
      forca: 12, agilidade: 13, inteligencia: 10, resistencia: 12,
      habilidade: 'explorador',
      cardLore: [
        'Nunca olha para trás. Diz que o que ficou atrás dela não merece ser lembrado.',
        'A Torre a encontrou entre ruínas de uma cidadela que tentou antes. Ela foi a última a deixar aquele lugar. Carrega o peso dos que ficaram.',
      ],
    },
    {
      nome: 'Soren, o Dobrado',
      titulo: 'Sobrevivente Marcado da Temporada I',
      forca: 14, agilidade: 10, inteligencia: 12, resistencia: 11,
      habilidade: 'guardiao',
      cardLore: [
        'Seu corpo carrega marcas de batalhas que ninguém mais se lembra de ter travado.',
        'Dobrado — não quebrado. A Torre tentou quebrá-lo três vezes. Na quarta, parou de tentar.',
      ],
    },
    {
      nome: 'Irae, a Visão',
      titulo: 'Sobrevivente Marcada da Temporada I',
      forca: 9, agilidade: 11, inteligencia: 15, resistencia: 12,
      habilidade: 'oraculo',
      cardLore: [
        'Vê coisas antes de acontecerem. Nunca avisa. Diz que avisar muda o que vê.',
        'Ela sabia que chegaria até você antes do lançamento, antes da Torre acordar. O que mais ela sabe, você nunca vai descobrir.',
      ],
    },
    {
      nome: 'Veth, o Silencioso',
      titulo: 'Sobrevivente Marcado da Temporada I',
      forca: 11, agilidade: 14, inteligencia: 11, resistencia: 11,
      habilidade: 'sombra',
      cardLore: [
        'Ninguém o viu chegar. Ninguém o vê partir. Está simplesmente lá, quando é necessário.',
        'Os registros da Torre não mencionam seu nome. Existe uma lacuna onde ele deveria estar. Você tem a impressão de que isso foi intencional.',
      ],
    },
    {
      nome: 'Kaet, a Estrategista',
      titulo: 'Sobrevivente Marcada da Temporada I',
      forca: 10, agilidade: 12, inteligencia: 14, resistencia: 11,
      habilidade: 'estrategista',
      cardLore: [
        'Nunca perdeu uma batalha que planejou. Perdeu todas as que não planejou. Agora planeja tudo.',
        'A Torre a observou por muito tempo antes de agir. Escolheu o momento exato. Ela faria o mesmo.',
      ],
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
