// ─── SISTEMA DE LANÇAMENTO DE TEMPORADAS ────────────────────────────────────
// Cada temporada tem um evento de lançamento com gacha gratuito.
// Para configurar uma nova temporada, edite LANCAMENTO_ATIVO.
// Para desativar o lançamento (fora do período), defina como null.

import type { HabilidadeId, PassivaId } from './game-data';

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
    cardLore: [
      'Sobreviveu a eras antes da Torre existir. Não sabe o que é cansaço. Não conhece o que é medo.',
      'Subiu. Até onde, ninguém sabe — ele não fala. A Torre ainda carrega as marcas da passagem dele em andares que você ainda não viu.',
      'A Torre o reconhece antes de reconhecer você. Isso, sozinho, deveria dizer tudo.',
      '"Eu esperei antes. Posso esperar de novo." — disse uma vez, sem contexto. Ninguém perguntou pelo quê.',
    ],
    cardLoreFinal: 'Em toda a extensão dos ecos, apenas você o recebeu.',
  },
  chanceValdris: 0.05,

  // ── Vestígios da Temporada I ──────────────────────────────────────────────
  // ~8% de chance após não sortear o primordial. Excepcionais mas mortais.
  chanceVestigio: 0.08,
  vestigios: [
    {
      nome: 'Corven, o Inquebrável',
      titulo: 'Vestígio da Temporada I',
      forca: 17, agilidade: 13, inteligencia: 11, resistencia: 17,
      habilidade: 'guardiao',
      vestigio: true,
      passivaId: 'veterano_das_profundezas' as PassivaId,
      cardLore: [
        'Voltou de onde outros não voltaram. A Torre o testou uma vez. Não tentou de novo.',
        'Quando você pergunta onde foi, ele olha para um ponto fixo acima de você. Não é hostil. É que o que viu não tem nome nesta língua.',
      ],
      cardLoreFinal: 'Carrega o peso de andares que você ainda não conhece.',
    },
    {
      nome: 'Seris, a Decifradora',
      titulo: 'Vestígio da Temporada I',
      forca: 11, agilidade: 14, inteligencia: 19, resistencia: 14,
      habilidade: 'estrategista',
      vestigio: true,
      passivaId: 'leitura_da_torre' as PassivaId,
      cardLore: [
        'Lê a Torre como outros leem mapas. Não metaforicamente — literalmente encontra recursos onde a lógica diz que não deveria haver.',
        'Passou por andares que não constam em nenhum registro. Quando você menciona um número específico, ela para de andar por um momento.',
      ],
      cardLoreFinal: 'A Torre mostra a ela o que esconde dos outros.',
    },
    {
      nome: 'Kael, o Sem-Rastro',
      titulo: 'Vestígio da Temporada I',
      forca: 14, agilidade: 18, inteligencia: 12, resistencia: 14,
      habilidade: 'explorador',
      vestigio: true,
      passivaId: 'rastro_vivo' as PassivaId,
      cardLore: [
        'Não deixa pegadas. Não por habilidade — a Torre simplesmente não registra sua passagem. Os registros têm lacunas exatas no formato dele.',
        'A Torre sussurra coisas para ele. Ele anota. Quando você lê as notas, o texto mudou desde que ele escreveu.',
      ],
      cardLoreFinal: 'Ouve o que a Torre diz entre as paredes.',
    },
  ],

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
    cardLore: [
      'Não é uma pessoa. É um arquivo vivo do que a Torre apagou — cada memória excluída, cada nome reescrito, cada intenção original substituída por outra.',
      'Fala em fragmentos de idiomas que ninguém mais usa. Às vezes para no meio de uma frase e fica olhando para um ponto fixo, como se estivesse ouvindo algo do outro lado.',
      'A Torre o reconhece com algo próximo a medo. Não porque ele seja mais forte — mas porque ele lembra do que ela era antes de aprender a esquecer.',
      '"Você perguntou sobre o andar um. Mas a pergunta certa é: o que havia antes do andar um? Eu sei. E vou te mostrar — quando você estiver pronto."',
    ],
    cardLoreFinal: 'Thael carrega o que a Torre tentou destruir. Em toda a extensão dos ecos, apenas você o recebeu.',
  },
  chanceValdris: 0.04,

  // ── Sobreviventes Marcados de T2 ──────────────────────────────────────────
  marcados: [
    {
      nome: 'Reth, o Fragmentado',
      titulo: 'Sobrevivente Marcado da Temporada II',
      forca: 13, agilidade: 11, inteligencia: 12, resistencia: 13,
      habilidade: 'guardiao',
      cardLore: [
        'Lembra de duas vidas ao mesmo tempo. Em uma delas, chegou até o vigésimo andar e voltou. Na outra, nunca tentou. Não sabe qual é a verdadeira.',
        'A Torre o fragmentou e depois remontou — mas as peças voltaram em ordem diferente. Ele funciona. Só não tem certeza de quem é o que funciona.',
      ],
    },
    {
      nome: 'Mira, a Ouvinte',
      titulo: 'Sobrevivente Marcada da Temporada II',
      forca: 9, agilidade: 14, inteligencia: 13, resistencia: 13,
      habilidade: 'sombra',
      cardLore: [
        'Ouve o que a Torre está dizendo. Não metaforicamente — literalmente. A estrutura produz frequências que ela aprendeu a interpretar.',
        'Nunca explica o que ouve. Diz que a tradução sempre perde algo essencial. Que o essencial é a parte que você precisa descobrir sozinho.',
      ],
    },
    {
      nome: 'Caen, o Construtor',
      titulo: 'Sobrevivente Marcado da Temporada II',
      forca: 15, agilidade: 10, inteligencia: 11, resistencia: 13,
      habilidade: 'guardiao',
      cardLore: [
        'Descendente direto dos que ergueram a Torre. Carrega plantas arquitetônicas gravadas na memória — estruturas que não existem em nenhum dos vinte andares conhecidos.',
        'Quando vê as paredes, toca como se reconhecesse o trabalho. "Meu bisavô fez esse bloco", disse uma vez, sobre um andar que nenhum humano deveria ter construído.',
      ],
    },
    {
      nome: 'Liora, a Constante',
      titulo: 'Sobrevivente Marcada da Temporada II',
      forca: 10, agilidade: 12, inteligencia: 15, resistencia: 12,
      habilidade: 'estrategista',
      cardLore: [
        'Esteve presente em três versões diferentes do Intervalo. Em duas, a Torre a expulsou antes do vigésimo andar. Na terceira — esta — chegou mais longe.',
        'Não demonstra surpresa com nada. Não porque seja corajosa, mas porque já viu versões de tudo. O que a surpreende são as variações pequenas — os detalhes que mudam entre as versões.',
      ],
    },
    {
      nome: 'Aldric, o Arquivado',
      titulo: 'Sobrevivente Marcado da Temporada II',
      forca: 12, agilidade: 13, inteligencia: 13, resistencia: 11,
      habilidade: 'explorador',
      cardLore: [
        'A Torre tem um arquivo com seu nome. Não como visitante — como dado. Algo na estrutura o catalogou antes de ele entrar.',
        'Encontrou a entrada no andar oito. Não leu o que estava escrito depois do nome. Diz que não estava pronto. Ainda não está — mas chegará.',
      ],
    },
    {
      nome: 'Vass, a Testemunha',
      titulo: 'Sobrevivente Marcada da Temporada II',
      forca: 11, agilidade: 11, inteligencia: 14, resistencia: 13,
      habilidade: 'oraculo',
      cardLore: [
        'Viu o momento em que a Torre foi construída. Não como visão ou profecia — como memória. Uma memória que não deveria ser dela.',
        'Quando foi investigar de onde a memória vinha, encontrou Thael. Ele a reconheceu antes de ela falar. "Você esteve lá", disse. "Não fisicamente. Mas esteve."',
      ],
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
