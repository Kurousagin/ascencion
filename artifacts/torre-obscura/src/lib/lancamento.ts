// ─── SISTEMA DE LANÇAMENTO DE TEMPORADAS ────────────────────────────────────
// Cada temporada pode ter um evento de lançamento com NPC especial e bônus.
// Para configurar uma nova temporada, edite LANCAMENTO_ATIVO.
// Para desativar o lançamento (fora do período), defina como null.

import type { HabilidadeId } from './game-data';

export interface LancamentoNpcEspecial {
  nome: string;
  titulo: string;            // Ex: "Guardião da Primeira Ascensão"
  descricao: string;         // Lore curto exibido no modal
  forca: number;
  agilidade: number;
  inteligencia: number;
  resistencia: number;
  habilidade: HabilidadeId;
}

export interface LancamentoTemporada {
  temporada: number;
  titulo: string;            // Ex: "TEMPORADA I — A ASCENSÃO"
  subtitulo: string;         // Tagline
  descricao: string[];       // Parágrafos exibidos no modal de boas-vindas
  npcEspecial: LancamentoNpcEspecial;
  bonusRecursos: {
    comida?: number;
    madeira?: number;
    pedra?: number;
    ferro?: number;
  };
  bonusMoral?: number;
  logsBoas: string[];        // Entradas de log adicionadas ao iniciar
}

// ─── LANÇAMENTO ATIVO ────────────────────────────────────────────────────────
// Defina null para desativar. Para Temporada II, substitua este objeto.

export const LANCAMENTO_ATIVO: LancamentoTemporada | null = {
  temporada: 1,
  titulo: 'TEMPORADA I — A ASCENSÃO',
  subtitulo: 'O Observador desperta. A Torre aguarda.',
  descricao: [
    'A Torre Obscura abre suas portas pela primeira vez. Algo ancestral se move nos andares mais altos.',
    'Como presente de inauguração, a Torre concede a você um guardião lendário — e recursos para começar com vantagem.',
  ],
  npcEspecial: {
    nome: 'Valdris, o Eterno',
    titulo: 'Guardião da Primeira Ascensão',
    descricao:
      'Sobreviveu a eras antes da Torre existir. Não sabe o que é cansaço. Não conhece o que é medo. Observa você com olhos que já viram civilizações cintilar e se apagar.',
    forca:        15,
    agilidade:    12,
    inteligencia: 11,
    resistencia:  15,
    habilidade:   'guardiao',
  },
  bonusRecursos: {
    comida:  80,
    madeira: 60,
    pedra:   40,
    ferro:   20,
  },
  bonusMoral: 20,
  logsBoas: [
    'TEMPORADA I INICIADA — O Observador desperta pela primeira vez.',
    'PRESENTE DE LANÇAMENTO — Valdris, o Eterno, une-se à sua cidadela.',
    'BÔNUS INICIAIS — Recursos e moral reforçados para a primeira jornada.',
  ],
};
