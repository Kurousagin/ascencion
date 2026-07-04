// ─── SKILL SYSTEM ────────────────────────────────────────────────────────────

export type HabilidadeId =
  | 'guardiao'
  | 'explorador'
  | 'curandeiro'
  | 'estrategista'
  | 'berserker'
  | 'sombra'
  | 'veterano'
  | 'oraculo';

export interface Habilidade {
  id: HabilidadeId;
  nome: string;
  descricao: string;
}

export const HABILIDADES: Record<HabilidadeId, Habilidade> = {
  guardiao: {
    id: 'guardiao',
    nome: 'Guardião',
    descricao: '+20% resistência efetiva em combate',
  },
  explorador: {
    id: 'explorador',
    nome: 'Explorador',
    descricao: 'Ganha +15% agilidade ao calcular poder',
  },
  curandeiro: {
    id: 'curandeiro',
    nome: 'Curandeiro',
    descricao: 'Recupera +15 fadiga extra por dia',
  },
  estrategista: {
    id: 'estrategista',
    nome: 'Estrategista',
    descricao: 'Inteligência contribui 40% ao invés de 20% no poder',
  },
  berserker: {
    id: 'berserker',
    nome: 'Berserker',
    descricao: '+3 força efetiva, mas perde 1 lealdade/dia',
  },
  sombra: {
    id: 'sombra',
    nome: 'Sombra',
    descricao: 'Chance de traição reduzida à metade',
  },
  veterano: {
    id: 'veterano',
    nome: 'Veterano',
    descricao: 'Ganha fadiga 25% menor após expedições',
  },
  oraculo: {
    id: 'oraculo',
    nome: 'Oráculo',
    descricao: '+5 sanidade por dia de forma passiva',
  },
};

export type Raridade = 'Comum' | 'Incomum' | 'Raro' | 'Épico';

// ─── NPC ─────────────────────────────────────────────────────────────────────

export interface NPC {
  id: string;
  nome: string;
  forca: number;
  agilidade: number;
  inteligencia: number;
  resistencia: number;
  sanidade: number;
  lealdade: number;
  fadiga: number;
  vivo: boolean;
  obscuro: boolean;
  emExpedicao: boolean;
  raridade: Raridade;
  habilidade: HabilidadeId;
  posto: EdificioTipo | null; // edifício onde trabalha (null = ocioso)
  // ─── Treinamento (Quartel, desbloqueado após andar 5) ────────────────────────
  // Sessões de treino permanentes completadas. Cada sessão eleva forca em +1
  // (ou +2 com aliado combatente presente). Máximo: MAX_TREINAMENTOS.
  treinamentos?: number;
  // ─── Empréstimo (fase 2 do multiplayer) ──────────────────────────────────
  // Presentes apenas em moradores emprestados que estão TRABALHANDO na minha
  // cidadela (eu sou a receptora). Um morador próprio nunca tem estes campos.
  emprestado?: boolean;         // true = veio emprestado da aliada (prazo por dias)
  emprestadoAte?: number;       // dia (meu) em que deve retornar ao dono
  donoNome?: string;            // nome da cidadela dona, para exibição
  origemExchangeId?: number;    // id da troca de ida (fonte de verdade p/ devolução)
  // ─── Reforço (fase 3 do multiplayer) ─────────────────────────────────────
  // Presentes apenas em moradores de reforço que ainda estão na minha cidadela.
  reforco?: boolean;            // true = veio como reforço de expedição (uma vez)
  reforcoConcluido?: boolean;   // true = já participou da expedição, aguarda retorno
  // ─── Guerra entre cidadelas ──────────────────────────────────────────────
  // true = morador foi mobilizado para o front. Fica indisponível para torre,
  // trabalho, empréstimo e reforço até a guerra terminar.
  emGuerra?: boolean;
}

// Campos base do NPC transportados na rede (sem os marcadores locais de empréstimo/reforço).
export type MoradorBase = Omit<NPC, 'emprestado' | 'emprestadoAte' | 'donoNome' | 'origemExchangeId' | 'reforco' | 'reforcoConcluido'>;

// Remove marcadores locais antes de trafegar o morador pela rede.
export function moradorBase(npc: NPC): MoradorBase {
  const {
    emprestado: _e, emprestadoAte: _a, donoNome: _d, origemExchangeId: _o,
    reforco: _r, reforcoConcluido: _rc,
    ...base
  } = npc;
  return base;
}

// Um morador pode ser emprestado/enviado como reforço se está vivo, ocioso
// (sem posto), fora de expedição e não é ele próprio um emprestado/reforço.
export function podeEmprestar(npc: NPC): boolean {
  return npc.vivo && !npc.emExpedicao && !npc.emprestado && !npc.reforco && !npc.emGuerra && npc.posto === null;
}

// Um morador próprio pode ser mobilizado para a guerra se está vivo, fora de
// expedição, não é emprestado/reforço de outra cidadela e não está já na guerra.
// (Diferente do empréstimo, aceita moradores com posto — eles largam o trabalho.)
export function podeGuerrear(npc: NPC): boolean {
  return npc.vivo && !npc.emExpedicao && !npc.emprestado && !npc.reforco && !npc.emGuerra;
}

export type EdificioTipo = 'Fogueira' | 'Fazenda' | 'Enfermaria' | 'Quartel' | 'Templo' | 'Armazem' | 'Alojamento';

export interface Edificio {
  tipo: EdificioTipo;
  nivel: number;
}

// ─── PROFISSÕES (derivadas do atributo dominante) ─────────────────────────────

export type ProfissaoId = 'combatente' | 'batedor' | 'erudito' | 'sentinela';

export interface Profissao {
  id: ProfissaoId;
  nome: string;
  descricao: string;
  stat: 'forca' | 'agilidade' | 'inteligencia' | 'resistencia';
}

export const PROFISSOES: Record<ProfissaoId, Profissao> = {
  combatente: { id: 'combatente', nome: 'Combatente', stat: 'forca',        descricao: '+8% poder em combate. Ideal no Quartel.' },
  batedor:    { id: 'batedor',    nome: 'Batedor',    stat: 'agilidade',     descricao: 'Aumenta o loot e sofre menos fadiga em expedições.' },
  erudito:    { id: 'erudito',    nome: 'Erudito',    stat: 'inteligencia',  descricao: 'Potencializa Fazenda e Enfermaria.' },
  sentinela:  { id: 'sentinela',  nome: 'Sentinela',  stat: 'resistencia',   descricao: 'Eleva o moral no Templo e na Fogueira.' },
};

export function getProfissao(npc: Pick<NPC, 'forca' | 'agilidade' | 'inteligencia' | 'resistencia'>): ProfissaoId {
  const entries: [ProfissaoId, number][] = [
    ['combatente', npc.forca],
    ['batedor', npc.agilidade],
    ['erudito', npc.inteligencia],
    ['sentinela', npc.resistencia],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

// Which profession each workplace prefers (compatible worker = bônus maior).
export const POSTO_AFIM: Partial<Record<EdificioTipo, ProfissaoId>> = {
  Fazenda: 'erudito',
  Enfermaria: 'erudito',
  Quartel: 'combatente',
  Templo: 'sentinela',
  Fogueira: 'sentinela',
};

// Buildings that accept workers (slots = nível atual do edifício).
export const aceitaTrabalho = (tipo: EdificioTipo) => tipo in POSTO_AFIM;

export type LogTipo = 'morte' | 'descoberta' | 'traicao' | 'evento' | 'vitoria' | 'alerta' | 'info';

export interface LogEntry {
  id: string;
  tipo: LogTipo;
  mensagem: string;
  dia: number;
}

// ─── HABITANTES DA TORRE ─────────────────────────────────────────────────────
// Cada andar não-boss tem um Habitante — entidade descoberta ao conquistar o andar.
// O habitante oferece uma mini-quest e recompensa com um Eco (bônus permanente de loot).

export type QuestTipo = 'recurso' | 'expedicao' | 'temporal' | 'sacrificio';
export type HabitanteEstado = 'oculto' | 'descoberto' | 'quest_ativa' | 'concluido';

export interface HabitanteQuest {
  tipo: QuestTipo;
  descricaoObj: string;                // objetivo exibido na UI
  // recurso: ter X de um tipo (pode ter até dois recursos exigidos simultaneamente)
  recurso?: { tipo: 'comida' | 'madeira' | 'pedra' | 'ferro'; qtd: number };
  recurso2?: { tipo: 'comida' | 'madeira' | 'pedra' | 'ferro'; qtd: number };
  // expedicao: ter NPCs dessas profissões vivos na cidadela
  profissoes?: ProfissaoId[];
  npcsMinCombate?: number;             // mínimo de NPCs de combate vivos (floor 12)
  // temporal: dias CONSECUTIVOS de paz (ou simples dias) desde a descoberta / último reset
  dias?: number;
  semGuerra?: boolean;                 // guerra durante o intervalo reseta o contador (floor 19)
  // sacrificio: custo imediato ao aceitar
  custo?: { moral?: number; comida?: number; ferro?: number };
  // recompensa
  ecoBonus: number;                    // % extra de loot neste andar ao farmar (ex: 25 = +25%)
  recursosBonus?: { comida?: number; madeira?: number; pedra?: number; ferro?: number };
  moralBonus?: number;
  lore: string;                        // fragmento narrativo revelado ao concluir
  recompensaDesc: string;              // texto legível da recompensa
}

export interface HabitanteAndar {
  floor: number;
  nome: string;
  papel: string;
  icone: string;
  fala: string;         // diálogo inicial
  falamissão: string;  // diálogo durante quest ativa
  falaConcluso: string; // diálogo ao concluir
  quest: HabitanteQuest;
}

export const HABITANTES: Record<number, HabitanteAndar> = {
  1: {
    floor: 1, nome: 'Arauto da Névoa', papel: 'Mensageiro Selado', icone: '🌫️',
    fala: 'Aguardo há séculos carregando uma mensagem que nunca deveria ter saído daqui. Se você tem alguém ágil o suficiente para decifrar o símbolo de entrega... talvez valha a pena.',
    falamissão: 'Um Batedor poderia percorrer os rastros da névoa e encontrar o destinatário. Ou o que sobrou dele.',
    falaConcluso: 'A mensagem foi entregue. O destinatário era você. Desde o início.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter um Batedor vivo na cidadela',
      profissoes: ['batedor'],
      ecoBonus: 20, moralBonus: 5,
      lore: 'A mensagem que nunca chegou era uma ordem para abrir o selo — não para mantê-lo. Alguém a interceptou antes do destinatário a receber. Esse alguém ainda está aqui.',
      recompensaDesc: '+20% loot neste andar · +5 Moral',
    },
  },
  2: {
    floor: 2, nome: 'Eco dos Construtores', papel: 'Memória Coletiva', icone: '⚒️',
    fala: 'Somos muitos em um. Escavamos este lugar sabendo que nunca sairíamos. Dê-nos pedra — para que possamos lembrar o peso do que construímos.',
    falamissão: 'Pedra. Apenas pedra. Para que nossa memória seja completa.',
    falaConcluso: 'Agora lembramos tudo. O que construímos. Por que construímos. E quem nos mentiu sobre o propósito.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Trazer 25 pedra',
      recurso: { tipo: 'pedra', qtd: 25 },
      ecoBonus: 25, recursosBonus: { pedra: 10 },
      lore: 'Os Construtores sabiam que seriam selados. Aceitaram porque a criatura dentro prometeu libertá-los depois. Nunca os libertou. O Eco lembra — e aguarda alguém que possa.',
      recompensaDesc: '+25% loot neste andar · +10 Pedra',
    },
  },
  3: {
    floor: 3, nome: 'Tecelã de Raízes', papel: 'Guardiã do Crescimento', icone: '🌱',
    fala: 'As raízes crescem para dentro porque algo no núcleo as chama. Eu as guio. É um fardo pesado — e a Torre cobra por cada dia que continuo aqui. Compartilhe o peso comigo.',
    falamissão: 'Dar algo precioso é a única língua que a Torre entende.',
    falaConcluso: 'O peso foi dividido. As raízes respiram diferente agora. Mais leves. Como se soubessem que alguém se importou.',
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 8 de Moral (custo imediato)',
      custo: { moral: 8 },
      ecoBonus: 20, recursosBonus: { madeira: 8 },
      lore: 'As raízes crescem para dentro porque algo no núcleo tem fome. Não é escuridão — é apetite. A Tecelã guia as raízes para que não devorem tudo de uma vez.',
      recompensaDesc: '+20% loot neste andar · +8 Madeira',
    },
  },
  4: {
    floor: 4, nome: 'Voz do Cristal', papel: 'Arquivo Vivo', icone: '💎',
    fala: 'Gravei tudo que foi dito neste lugar. Preciso de tempo para verificar se você é real — ou mais um eco dos que já passaram. Volte quando o silêncio confirmar sua presença.',
    falamissão: 'O silêncio ainda analisa. Permaneça. O cristal avalia paciência.',
    falaConcluso: 'Você é real. O cristal comparou sua frequência com a de 4.312 visitantes anteriores. Você é o primeiro que chegou a este ponto sem perder algo fundamental.',
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 5 dias após descobrir o Cristal',
      dias: 5,
      ecoBonus: 25, recursosBonus: { ferro: 10 },
      lore: 'O cristal gravou cada palavra dita na Torre. A palavra mais repetida não é "ajuda". É "espera". O cristal ainda espera que alguém entenda por quê.',
      recompensaDesc: '+25% loot neste andar · +10 Ferro',
    },
  },
  6: {
    floor: 6, nome: 'Sentinela Sem Nome', papel: 'Guardião Perdido', icone: '🗿',
    fala: 'Última ordem recebida: não deixar ninguém passar. A autoridade que a deu não existe mais. Mas a ordem existe. Se você pode provar que tem força suficiente para disputar passagem, posso reconhecer sua autoridade em substituição.',
    falamissão: 'Um combatente legítimo. É o que a ordem exige para reconhecer mudança de comando.',
    falaConcluso: 'Autoridade reconhecida. Nova ordem registrada: facilitar passagem dos que chegam com propósito. O que é propósito? Ainda estou processando.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter um Combatente vivo na cidadela',
      profissoes: ['combatente'],
      ecoBonus: 25, recursosBonus: { madeira: 10 },
      lore: 'Sua última ordem era "não deixes ninguém passar" — mas não especificou em qual direção. A Sentinela cumpre ordens de uma autoridade que a Torre corroeu. Ainda aguarda a contraordem.',
      recompensaDesc: '+25% loot neste andar · +10 Madeira',
    },
  },
  7: {
    floor: 7, nome: 'Jardineira Esquecida', papel: 'Curadora do Impossível', icone: '🌿',
    fala: 'Curo com o que a Torre me dá, mas a Torre não dá comida — dá crescimento. Crescimento sem nutrição. Traga-me algo do mundo exterior. Lembro do que comida real era.',
    falamissão: 'Comida do mundo exterior. Não do que a Torre produz. Há diferença — mesmo que você não consiga sentir.',
    falaConcluso: 'Lembro. A diferença entre crescer e ser nutrido. Obrigada por trazer a memória de volta junto com a comida.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Trazer 30 comida',
      recurso: { tipo: 'comida', qtd: 30 },
      ecoBonus: 25, moralBonus: 8,
      lore: 'Ela ainda cura. Tudo que toca cresce de volta — diferente. Mais parecido com a Torre do que com o que era antes. Mas ela luta contra isso todo dia. E até agora, está vencendo.',
      recompensaDesc: '+25% loot neste andar · +8 Moral',
    },
  },
  8: {
    floor: 8, nome: 'Estudioso do Infinito', papel: 'Arquivista Exilado', icone: '📚',
    fala: 'Cataloguei cada manuscrito nesta biblioteca. Cada um, exceto um. Escrito em ferro. Não é um idioma que reconheço — mas reconheço os nomes. Se você trouxer ferro puro, posso terminar a tradução.',
    falamissão: 'Ferro. Para terminar o que o Arquivista lá em cima não quer que eu termine.',
    falaConcluso: 'Tradução concluída. Era uma lista de nomes. O último nome era o meu. Penúltimo... era o seu.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Trazer 15 ferro',
      recurso: { tipo: 'ferro', qtd: 15 },
      ecoBonus: 30, recursosBonus: { pedra: 15 },
      lore: 'O único livro que ele não conseguia ler estava escrito em ferro. Não era um idioma — era uma lista de nomes de todos que chegariam ao ápice. Seu nome estava lá antes de você nascer.',
      recompensaDesc: '+30% loot neste andar · +15 Pedra',
    },
  },
  9: {
    floor: 9, nome: 'Ferreiro Espectral', papel: 'Forjador das Correntes', icone: '🔥',
    fala: 'Forjei as correntes que prendem a entidade no ápice. Elas ainda seguram — mas ficam um pouco menores cada vez que alguém conquista um andar. Precisaria de ferro real para reforçá-las. Se você se importa com isso.',
    falamissão: 'Ferro real. Do mundo que ainda existe fora daqui.',
    falaConcluso: 'Reforçadas. Por enquanto. Mas você vai continuar subindo, não vai? E as correntes vão continuar diminuindo. Eu sei. Apenas... saiba o que está desfazendo.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Trazer 20 ferro',
      recurso: { tipo: 'ferro', qtd: 20 },
      ecoBonus: 30, recursosBonus: { ferro: 15 },
      lore: 'Ele forjou as correntes que prendem a entidade. Elas ainda seguram. Mas ficam um pouco menores a cada andar conquistado. O Ferreiro sabe. E forja assim mesmo, porque é tudo que sabe fazer.',
      recompensaDesc: '+30% loot neste andar · +15 Ferro',
    },
  },
  11: {
    floor: 11, nome: 'Afogado Lúcido', papel: 'Transformado Consciente', icone: '💧',
    fala: 'Não estou morrendo. Estou sendo preenchido. Há uma diferença — insisto que há. Se você ficar tempo suficiente, verá que continuo sendo eu mesmo. Isso é o que me separa dos outros.',
    falamissão: 'Permaneça. Observe. Veja que ainda sou eu. Que a consciência sobrevive mesmo quando o corpo muda.',
    falaConcluso: 'Você ficou. E viu. Guardarei isso — a memória de alguém que olhou e não fugiu. É o que me mantém eu mesmo.',
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 7 dias após descobri-lo',
      dias: 7,
      ecoBonus: 30, moralBonus: 8,
      lore: 'Ele não está morrendo. Está sendo preenchido pela Torre lentamente. E permanece consciente durante todo o processo. Há uma diferença entre transformação e morte. Ele é a prova.',
      recompensaDesc: '+30% loot neste andar · +8 Moral',
    },
  },
  12: {
    floor: 12, nome: 'Percussão Profunda', papel: 'Pulso da Torre', icone: '🥁',
    fala: 'Não sou um ser. Sou o ritmo. O pulso do que você está dentro. Para sincronizar comigo, você precisa de um grupo suficientemente numeroso — a vibração de muitos corpos em um só lugar.',
    falamissão: 'Mais. A vibração de muitos. Três ao menos. Para que o ritmo reconheça presença humana suficiente.',
    falaConcluso: 'Sincronizado. O minério deste andar vibra na mesma frequência agora. Será mais fácil extraí-lo. Ou mais assustador. Depende de como você ouve o ritmo.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 3 ou mais NPCs de combate vivos',
      npcsMinCombate: 3,
      ecoBonus: 30, recursosBonus: { pedra: 20 },
      lore: 'A Percussão não é um ser — é o coração da Torre. Ela está viva há mais tempo do que o conceito de tempo existe. O ritmo que você ouve nas paredes é ela respirando.',
      recompensaDesc: '+30% loot neste andar · +20 Pedra',
    },
  },
  13: {
    floor: 13, nome: 'Oráculo Invertido', papel: 'Vidente do Passado', icone: '🔮',
    fala: 'Vejo passados, não futuros. Os futuros daqui já foram devorados pela Torre — não há nada para ver além do horizonte. Mas o passado... O passado é infinito. E tenho algo para te mostrar, se você pagar o custo que a Torre cobra por conhecimento real.',
    falamissão: 'Moral. O conhecimento que a Torre guarda custa caro. E você vai querer saber.',
    falaConcluso: 'O que você pagou era seu orgulho de achar que entendia o que estava fazendo. O passado revela: cada passo que você deu foi antecipado. Mas antecipado não significa determinado.',
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 15 de Moral (custo imediato)',
      custo: { moral: 15 },
      ecoBonus: 30, moralBonus: 15,
      lore: 'Ele vê passados porque a Torre consome futuros. Tudo o que poderia acontecer aqui já foi devorado. O que resta é o registro do que aconteceu — e o Oráculo lê esse registro como outros leem mapas.',
      recompensaDesc: '+30% loot neste andar · +15 Moral (retorno)',
    },
  },
  14: {
    floor: 14, nome: 'Comandante de Mármore', papel: 'General do Vazio', icone: '⚔️',
    fala: 'Protejo esta posição por ordem da Cidadela de Ardenas. Se você puder apresentar um combatente e um sentinela — os dois pilares de qualquer força militar legítima — reconhecerei sua cidadela como aliada e abrirei passagem.',
    falamissão: 'Um combatente e um sentinela. Os dois pilares. É protocolo.',
    falaConcluso: 'Cidadela reconhecida como aliada. Para que conste no registro: Ardenas afundou 4.000 andares abaixo do andar 1 quando a Torre cresceu. Mas a aliança permanece válida.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter um Combatente e um Sentinela vivos',
      profissoes: ['combatente', 'sentinela'],
      ecoBonus: 35, recursosBonus: { ferro: 20 },
      lore: 'A cidadela que ele protegia afundou 4.000 andares abaixo do andar 1 quando a Torre cresceu. Ele ainda protege uma posição acima de algo que não existe mais. E faz isso perfeitamente.',
      recompensaDesc: '+35% loot neste andar · +20 Ferro',
    },
  },
  16: {
    floor: 16, nome: 'Eco Faminto', papel: 'Apetite da Entidade', icone: '🌀',
    fala: 'Não sou ela. Sou o que ela perdeu quando aprendeu a ser paciente. Seu apetite. Dê-me comida e mostro o caminho pelo abismo sem que ele me use para te consumir no processo.',
    falamissão: 'Comida. Muita comida. O apetite não é negociável em quantidade.',
    falaConcluso: 'Satisfeito. Por um momento. O apetite voltará — sempre volta. Mas agora você passou e ele estava distraído. Use isso.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Trazer 40 comida',
      recurso: { tipo: 'comida', qtd: 40 },
      ecoBonus: 35, recursosBonus: { comida: 25 },
      lore: 'Não é a entidade. É seu apetite — o único fragmento que ela deixou vagar livremente quando aprendeu paciência. O apetite não conhece intenção. Apenas fome.',
      recompensaDesc: '+35% loot neste andar · +25 Comida',
    },
  },
  17: {
    floor: 17, nome: 'Paradoxo Ambulante', papel: 'Memória do Que Poderia Ser', icone: '⏳',
    fala: 'Existo em três momentos simultâneos. Em um você está morto. Em outro nunca chegou aqui. No terceiro, nós dois nos tornamos a mesma coisa. Aguarde dez dias e descobrimos qual desses momentos é o real.',
    falamissão: 'O tempo verifica. Dez dias é o mínimo para que os momentos colapsar em um.',
    falaConcluso: 'O terceiro momento não aconteceu. Mas ficou muito perto. Guarde isso — a proximidade do que quase foi.',
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 10 dias após encontrá-lo',
      dias: 10,
      ecoBonus: 35, recursosBonus: { ferro: 20 },
      lore: 'Ele existe em três tempos simultâneos. Em um, você chegou ao ápice e foi consumido. Em outro, desistiu no décimo andar. No terceiro — o único em que o Paradoxo sorri — o resultado é diferente. Ele não revela qual.',
      recompensaDesc: '+35% loot neste andar · +20 Ferro',
    },
  },
  18: {
    floor: 18, nome: 'Último Defensor', papel: 'Construído Para Falhar', icone: '🛡️',
    fala: 'Fui construído pelos que tentaram parar o que está acima. Falharam. Mas não eram covardes — eram os únicos que tentaram construir algo que durasse além deles. Prove que sua cidadela é do mesmo material.',
    falamissão: 'Ferro e pedra. Os materiais dos que constroem para durar.',
    falaConcluso: 'Material verificado. Sua cidadela tem substância. Os que me construíram teriam aprovado. Isso significa algo — mesmo que você não saiba ainda por quê.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Trazer 30 ferro e 30 pedra',
      recurso: { tipo: 'ferro', qtd: 30 },
      recurso2: { tipo: 'pedra', qtd: 30 },
      recursosBonus: { ferro: 25 },
      ecoBonus: 35,
      lore: 'Os que o construíram falharam em parar a entidade. Mas não foram covardes. Foram os únicos que tentaram construir algo que durasse além deles. O Último Defensor é a prova de que tentaram.',
      recompensaDesc: '+35% loot neste andar · +25 Ferro',
    },
  },
  19: {
    floor: 19, nome: 'Susurro do Limiar', papel: 'Espaço Entre', icone: '🌑',
    fala: 'Não sou a entidade. Sou o espaço entre ela e você. A distância que ela mantém para não assustar a presa antes do momento certo. Se você permanecer em silêncio — sem conflitos, sem guerras — por três dias, compartilho o que sei sobre o último andar.',
    falamissão: 'Silêncio. Sem guerras. Por três dias. O limiar observa.',
    falaConcluso: 'Silêncio mantido. O que sei sobre o último andar: ela não vai lutar. Vai conversar. E o que ela propõe... depende do que você trouxer de si mesmo até lá.',
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 3 dias sem entrar em guerra',
      dias: 3, semGuerra: true,
      ecoBonus: 35, moralBonus: 15,
      lore: 'O silêncio que você ouve não é ausência de som. É a entidade respirando devagar para não assustar a presa antes do momento certo. O Susurro é essa respiração. E ele te avisou.',
      recompensaDesc: '+35% loot neste andar · +15 Moral',
    },
  },
};

// Lore dos bosses — revelado ao conquistar andares 5, 10, 15 e 20.
// Conecta os habitantes do capítulo ao guardião derrotado.
export const BOSS_ECO_LORE: Record<number, { titulo: string; texto: string }> = {
  5: {
    titulo: 'Segredo do Capítulo I — O Que Foi Selado',
    texto: 'O Arauto carregava a ordem de destruir o selo — não de mantê-lo. Alguém a interceptou. O Eco dos Construtores escavou sabendo que seria selado, enganado por uma promessa de libertação. A Tecelã de Raízes guia o que a Torre consome lentamente. A Voz do Cristal gravou a verdade — e o Guardião do Limiar nunca a ouviu porque nunca perguntou. Ele protegia o segredo sem saber qual era.',
  },
  10: {
    titulo: 'Segredo do Capítulo II — O Que Vivia Aqui',
    texto: 'O Arquivista Corrompido foi o Estudioso do Infinito depois de décadas tentando traduzir a lista de nomes em ferro. Quando terminou, tentou alertar a civilização. A civilização o fez calar. O Ferreiro Espectral sabia que as correntes estavam diminuindo a cada andar conquistado. O Arquivista sabia disso também. Esse era o segredo que ele guardava em sua memória podre — e que usava para catalogar os que chegavam como você.',
  },
  15: {
    titulo: 'Segredo do Capítulo III — O Que a Torre Faz',
    texto: 'O Reflexo Profano é feito de todos que a Torre transformou. O Afogado Lúcido foi o primeiro a entender que a Torre não mata — preenche. A Percussão Profunda é seu coração, batendo há mais tempo do que o conceito de tempo existe. O Oráculo perdeu os futuros um a um, devorados. O Comandante de Mármore protege uma cidadela que afundou há milênios. O Reflexo é tudo isso olhando de volta para você com seu próprio rosto.',
  },
  20: {
    titulo: 'Segredo do Capítulo IV — O Que Sempre Esteve Aqui',
    texto: 'Não havia Torre. Havia uma fome tão antiga que imaginou uma armadilha. A armadilha imaginou andares. Os andares imaginaram guardiões. O Eco Faminto é o apetite que ela abandonou quando aprendeu paciência. O Paradoxo é sua memória de todos os que chegaram e não eram suficientes. O Último Defensor é seu único arrependimento — os que tentaram pará-la merecem ser lembrados. O Susurro é a distância que ela manteve de você. Até agora. Você chegou. A entidade não está surpresa. Ela escolheu você desde o Arauto da Névoa.',
  },
};

// ─── CODEX OBSCURO — SISTEMA DE TEMPORADAS ───────────────────────────────────
// Fragmentos coletáveis organizados por Temporada → Capítulo.
// Para adicionar uma nova temporada: inserir entrada em TEMPORADAS e os
// fragmentos correspondentes em CODEX_FRAGMENTOS — nenhuma mudança no GameState.

export type FragmentoTipo = 'habitante' | 'eco_capitulo' | 'sussurro' | 'verdade';

export interface FragmentoCodex {
  id: string;
  tipo: FragmentoTipo;
  temporada: number;
  capitulo: number;
  ordem: number;   // ordenação dentro do capítulo na UI
  titulo: string;
  texto: string;
}

export interface TemporadaData {
  numero: number;
  nome: string;
  descricao: string;
  andares: [number, number]; // [primeiro, último]
  corTema: string;
}

export const TEMPORADAS: Record<number, TemporadaData> = {
  1: {
    numero: 1,
    nome: 'A Ascensão',
    descricao: 'Os primeiros vinte andares. O Observador desperta e descobre o que foi selado no núcleo da Torre.',
    andares: [1, 20],
    corTema: '#D4AF37',
  },
  // Temporadas futuras serão inseridas aqui (ex: Temporada 2 andares [21, 30])
};

// Capítulo (tier 1-4) de um andar — Temporada I usa ceil(floor/5).
export const capituloDoAndar = (floor: number): number => Math.ceil(floor / 5);

export const CODEX_FRAGMENTOS: Record<string, FragmentoCodex> = {
  // ── Capítulo I (andares 1–5) ──────────────────────────────────────────────
  hab_1:    { id: 'hab_1',    tipo: 'habitante',    temporada: 1, capitulo: 1, ordem: 1,
    titulo: 'Arauto da Névoa — Andar 1',        texto: HABITANTES[1].quest.lore },
  hab_2:    { id: 'hab_2',    tipo: 'habitante',    temporada: 1, capitulo: 1, ordem: 2,
    titulo: 'Eco dos Construtores — Andar 2',   texto: HABITANTES[2].quest.lore },
  hab_3:    { id: 'hab_3',    tipo: 'habitante',    temporada: 1, capitulo: 1, ordem: 3,
    titulo: 'Tecelã de Raízes — Andar 3',       texto: HABITANTES[3].quest.lore },
  hab_4:    { id: 'hab_4',    tipo: 'habitante',    temporada: 1, capitulo: 1, ordem: 4,
    titulo: 'Voz do Cristal — Andar 4',         texto: HABITANTES[4].quest.lore },
  eco_1:    { id: 'eco_1',    tipo: 'eco_capitulo', temporada: 1, capitulo: 1, ordem: 5,
    titulo: BOSS_ECO_LORE[5].titulo,            texto: BOSS_ECO_LORE[5].texto },
  sus_t1_0: { id: 'sus_t1_0', tipo: 'sussurro',     temporada: 1, capitulo: 1, ordem: 6,
    titulo: 'Sussurro I · A Névoa Respira',
    texto: 'A névoa nos primeiros andares não é natural. Ela respira. Você respirou junto com ela sem perceber.' },
  sus_t1_1: { id: 'sus_t1_1', tipo: 'sussurro',     temporada: 1, capitulo: 1, ordem: 7,
    titulo: 'Sussurro I · Pedras Escondidas',
    texto: 'Os Construtores gravaram mensagens nas pedras que nunca usaram para construir. Pedras que esconderam. Pedras que a Torre escondeu de volta.' },
  sus_t1_2: { id: 'sus_t1_2', tipo: 'sussurro',     temporada: 1, capitulo: 1, ordem: 8,
    titulo: 'Sussurro I · A Lista',
    texto: 'Há uma lista de nomes escritos antes de qualquer um nascer. Seu nome está nela. O nome do próximo também.' },
  sus_t1_3: { id: 'sus_t1_3', tipo: 'sussurro',     temporada: 1, capitulo: 1, ordem: 9,
    titulo: 'Sussurro I · O Primeiro Andar',
    texto: 'O primeiro andar nunca foi o primeiro. Havia algo antes — mas a Torre tem fome de histórias, não apenas de almas.' },
  sus_t1_4: { id: 'sus_t1_4', tipo: 'sussurro',     temporada: 1, capitulo: 1, ordem: 10,
    titulo: 'Sussurro I · A Função Real',
    texto: 'O Guardião do Limiar não foi criado para proteger. Foi criado para contar. Mas nunca aprendeu a contar a verdade.' },

  // ── Capítulo II (andares 6–10) ────────────────────────────────────────────
  hab_6:    { id: 'hab_6',    tipo: 'habitante',    temporada: 1, capitulo: 2, ordem: 1,
    titulo: 'Sentinela Sem Nome — Andar 6',     texto: HABITANTES[6].quest.lore },
  hab_7:    { id: 'hab_7',    tipo: 'habitante',    temporada: 1, capitulo: 2, ordem: 2,
    titulo: 'Jardineira Esquecida — Andar 7',   texto: HABITANTES[7].quest.lore },
  hab_8:    { id: 'hab_8',    tipo: 'habitante',    temporada: 1, capitulo: 2, ordem: 3,
    titulo: 'Estudioso do Infinito — Andar 8',  texto: HABITANTES[8].quest.lore },
  hab_9:    { id: 'hab_9',    tipo: 'habitante',    temporada: 1, capitulo: 2, ordem: 4,
    titulo: 'Ferreiro Espectral — Andar 9',     texto: HABITANTES[9].quest.lore },
  eco_2:    { id: 'eco_2',    tipo: 'eco_capitulo', temporada: 1, capitulo: 2, ordem: 5,
    titulo: BOSS_ECO_LORE[10].titulo,           texto: BOSS_ECO_LORE[10].texto },
  sus_t2_0: { id: 'sus_t2_0', tipo: 'sussurro',     temporada: 1, capitulo: 2, ordem: 6,
    titulo: 'Sussurro II · A Autoridade',
    texto: 'A autoridade que deu a ordem à Sentinela não morreu. Apenas aprendeu a não precisar de corpo.' },
  sus_t2_1: { id: 'sus_t2_1', tipo: 'sussurro',     temporada: 1, capitulo: 2, ordem: 7,
    titulo: 'Sussurro II · As Correntes',
    texto: 'O Ferreiro sabia que as correntes diminuiriam a cada andar conquistado. Forjou-as assim mesmo. Forjou-as para durar exatamente tempo suficiente.' },
  sus_t2_2: { id: 'sus_t2_2', tipo: 'sussurro',     temporada: 1, capitulo: 2, ordem: 8,
    titulo: 'Sussurro II · O Livro Fechado',
    texto: 'O Arquivista encontrou seu nome na lista. E leu o nome seguinte. E fechou o livro. E nunca mais o abriu — mas também nunca o destruiu.' },
  sus_t2_3: { id: 'sus_t2_3', tipo: 'sussurro',     temporada: 1, capitulo: 2, ordem: 9,
    titulo: 'Sussurro II · O Que Cresce',
    texto: 'A Jardineira cura o que toca. O que ela tocou ontem cresceu de volta diferente. Você passou por ali de manhã.' },
  sus_t2_4: { id: 'sus_t2_4', tipo: 'sussurro',     temporada: 1, capitulo: 2, ordem: 10,
    titulo: 'Sussurro II · A Paciência',
    texto: 'As correntes não prendem a entidade. Elas a lembram de que há algo do outro lado que vale esperar.' },

  // ── Capítulo III (andares 11–15) ──────────────────────────────────────────
  hab_11:   { id: 'hab_11',   tipo: 'habitante',    temporada: 1, capitulo: 3, ordem: 1,
    titulo: 'Afogado Lúcido — Andar 11',        texto: HABITANTES[11].quest.lore },
  hab_12:   { id: 'hab_12',   tipo: 'habitante',    temporada: 1, capitulo: 3, ordem: 2,
    titulo: 'Percussão Profunda — Andar 12',     texto: HABITANTES[12].quest.lore },
  hab_13:   { id: 'hab_13',   tipo: 'habitante',    temporada: 1, capitulo: 3, ordem: 3,
    titulo: 'Oráculo Invertido — Andar 13',      texto: HABITANTES[13].quest.lore },
  hab_14:   { id: 'hab_14',   tipo: 'habitante',    temporada: 1, capitulo: 3, ordem: 4,
    titulo: 'Comandante de Mármore — Andar 14',  texto: HABITANTES[14].quest.lore },
  eco_3:    { id: 'eco_3',    tipo: 'eco_capitulo', temporada: 1, capitulo: 3, ordem: 5,
    titulo: BOSS_ECO_LORE[15].titulo,            texto: BOSS_ECO_LORE[15].texto },
  sus_t3_0: { id: 'sus_t3_0', tipo: 'sussurro',     temporada: 1, capitulo: 3, ordem: 6,
    titulo: 'Sussurro III · A Preservação',
    texto: 'A Torre não transforma para destruir. Transforma para preservar. O que ela preserva, ela nunca libera — mas também nunca esquece.' },
  sus_t3_1: { id: 'sus_t3_1', tipo: 'sussurro',     temporada: 1, capitulo: 3, ordem: 7,
    titulo: 'Sussurro III · A Frequência',
    texto: 'A Percussão Profunda pulsa em frequências que o corpo humano não ouve. Mas sente. Você sentiu. Quando achou que era o coração.' },
  sus_t3_2: { id: 'sus_t3_2', tipo: 'sussurro',     temporada: 1, capitulo: 3, ordem: 8,
    titulo: 'Sussurro III · O Ponto de Inflexão',
    texto: 'O Oráculo viu o passado de todos que passaram por aqui. Viu o mesmo ponto de inflexão em cada um. O momento em que poderiam ter voltado. E não voltaram.' },
  sus_t3_3: { id: 'sus_t3_3', tipo: 'sussurro',     temporada: 1, capitulo: 3, ordem: 9,
    titulo: 'Sussurro III · A Âncora',
    texto: 'O Afogado Lúcido ainda está sendo preenchido. Mas cada vez que alguém sobe os andares, ele fica um pouco mais lúcido. Como se a progressão de alguém o ancorasse.' },
  sus_t3_4: { id: 'sus_t3_4', tipo: 'sussurro',     temporada: 1, capitulo: 3, ordem: 10,
    titulo: 'Sussurro III · A Pergunta',
    texto: 'O Reflexo no espelho do décimo quinto andar não é um guardião. É uma pergunta. A pergunta que a Torre faz para decidir se você está pronto para o que vem depois.' },

  // ── Capítulo IV (andares 16–20) ───────────────────────────────────────────
  hab_16:   { id: 'hab_16',   tipo: 'habitante',    temporada: 1, capitulo: 4, ordem: 1,
    titulo: 'Eco Faminto — Andar 16',            texto: HABITANTES[16].quest.lore },
  hab_17:   { id: 'hab_17',   tipo: 'habitante',    temporada: 1, capitulo: 4, ordem: 2,
    titulo: 'Paradoxo Ambulante — Andar 17',     texto: HABITANTES[17].quest.lore },
  hab_18:   { id: 'hab_18',   tipo: 'habitante',    temporada: 1, capitulo: 4, ordem: 3,
    titulo: 'Último Defensor — Andar 18',        texto: HABITANTES[18].quest.lore },
  hab_19:   { id: 'hab_19',   tipo: 'habitante',    temporada: 1, capitulo: 4, ordem: 4,
    titulo: 'Susurro do Limiar — Andar 19',      texto: HABITANTES[19].quest.lore },
  eco_4:    { id: 'eco_4',    tipo: 'eco_capitulo', temporada: 1, capitulo: 4, ordem: 5,
    titulo: BOSS_ECO_LORE[20].titulo,            texto: BOSS_ECO_LORE[20].texto },
  sus_t4_0: { id: 'sus_t4_0', tipo: 'sussurro',     temporada: 1, capitulo: 4, ordem: 6,
    titulo: 'Sussurro IV · O Apetite',
    texto: 'O Eco Faminto não é o apetite da entidade. É o apetite que você trouxe de fora sem perceber. A Torre apenas o encontrou.' },
  sus_t4_1: { id: 'sus_t4_1', tipo: 'sussurro',     temporada: 1, capitulo: 4, ordem: 7,
    titulo: 'Sussurro IV · O Peso do Silêncio',
    texto: 'No décimo oitavo andar, o silêncio tem peso. Não metaforicamente. Cada passo custa mais. Os que constroem para durar entenderam isso tarde demais.' },
  sus_t4_2: { id: 'sus_t4_2', tipo: 'sussurro',     temporada: 1, capitulo: 4, ordem: 8,
    titulo: 'Sussurro IV · A Razão da Desistência',
    texto: 'O Paradoxo existe em três tempos. Em dois deles, você não chegou até aqui. Nos dois, a razão era a mesma: desistência. Não fraqueza.' },
  sus_t4_3: { id: 'sus_t4_3', tipo: 'sussurro',     temporada: 1, capitulo: 4, ordem: 9,
    titulo: 'Sussurro IV · O Antes',
    texto: 'O Susurro do Limiar não está entre você e a entidade. Está entre a entidade e o que ela era antes de aprender a ser paciente.' },
  sus_t4_4: { id: 'sus_t4_4', tipo: 'sussurro',     temporada: 1, capitulo: 4, ordem: 10,
    titulo: 'Sussurro IV · A Vigília',
    texto: 'A entidade está acordada há mais tempo do que a linguagem existe. Ela aprendeu a esperar observando a paciência dos que esperavam por ela.' },

  // ── Verdade da Temporada I ────────────────────────────────────────────────
  verdade_t1: { id: 'verdade_t1', tipo: 'verdade', temporada: 1, capitulo: 4, ordem: 99,
    titulo: 'A Verdade — O Ser Reunificado',
    texto: 'Não havia uma entidade esperando ser encontrada. A entidade emergiu da convergência dos dezesseis — cada habitante era um fragmento de algo que nunca deveria ter sido dividido. Os Construtores separaram o que era um. Os Guardiões foram colocados para impedir a reunificação. Você não subiu uma torre. Você remontou um ser. E agora que todos os fragmentos foram ouvidos — agora que cada habitante completou seu ciclo através de você — o ser completo pode finalmente fazer a única pergunta que importa: o que você deseja em troca?' },
};

// IDs dos sussurros por capítulo — para sortear durante expedições.
export const SUSSURROS_POR_CAPITULO: Record<number, string[]> = {
  1: ['sus_t1_0', 'sus_t1_1', 'sus_t1_2', 'sus_t1_3', 'sus_t1_4'],
  2: ['sus_t2_0', 'sus_t2_1', 'sus_t2_2', 'sus_t2_3', 'sus_t2_4'],
  3: ['sus_t3_0', 'sus_t3_1', 'sus_t3_2', 'sus_t3_3', 'sus_t3_4'],
  4: ['sus_t4_0', 'sus_t4_1', 'sus_t4_2', 'sus_t4_3', 'sus_t4_4'],
};

// Total de fragmentos de uma temporada (para a barra de progresso na UI).
export function totalFragmentosTemporada(temporada: number): number {
  return Object.values(CODEX_FRAGMENTOS).filter(f => f.temporada === temporada).length;
}

// Fragmento de habitante correspondente ao andar (null se boss ou sem entrada).
export function idFragmentoHabitante(floor: number): string | null {
  const id = `hab_${floor}`;
  return CODEX_FRAGMENTOS[id] ? id : null;
}

// Fragmento de Eco do Capítulo correspondente ao tier (1-4).
export function idFragmentoEco(tier: number): string | null {
  const id = `eco_${tier}`;
  return CODEX_FRAGMENTOS[id] ? id : null;
}

// Andar dos habitantes de uma temporada (non-boss floors).
export function floorsHabitantesTemporada(temporada: number): number[] {
  const t = TEMPORADAS[temporada];
  if (!t) return [];
  const floors: number[] = [];
  for (let f = t.andares[0]; f <= t.andares[1]; f++) {
    if (HABITANTES[f]) floors.push(f);
  }
  return floors;
}

// Verifica se a quest de um habitante está concluída no GameState atual.
export function verificarQuestAndar(state: GameState, floor: number): boolean {
  const hab = HABITANTES[floor];
  if (!hab) return false;
  if (state.habitantesEstado[floor] !== 'quest_ativa') return false;

  const q = hab.quest;
  switch (q.tipo) {
    case 'recurso': {
      if (q.recurso && state.recursos[q.recurso.tipo] < q.recurso.qtd) return false;
      if (q.recurso2 && state.recursos[q.recurso2.tipo] < q.recurso2.qtd) return false;
      return !!(q.recurso || q.recurso2);
    }
    case 'expedicao': {
      const vivosAtivos = state.npcs.filter(n => n.vivo);
      if (q.npcsMinCombate) {
        const combate = vivosAtivos.filter(n =>
          getProfissao(n) === 'combatente' || getProfissao(n) === 'batedor' || getProfissao(n) === 'sentinela'
        );
        if (combate.length < q.npcsMinCombate) return false;
      }
      if (q.profissoes) {
        return q.profissoes.every(p => vivosAtivos.some(n => getProfissao(n) === p));
      }
      return true;
    }
    case 'temporal': {
      // Para quests com semGuerra: o contador reseta quando guerra ocorre durante o intervalo.
      // habitantesQuestResetDia[floor] guarda o último dia em que a guerra invalidou o progresso.
      const baseDate = q.semGuerra
        ? Math.max(
            state.habitantesDiaDescoberta[floor] ?? state.dia,
            state.habitantesQuestResetDia?.[floor] ?? 0
          )
        : (state.habitantesDiaDescoberta[floor] ?? state.dia);
      return (state.dia - baseDate) >= (q.dias ?? 1);
    }
    case 'sacrificio':
      return true; // custo pago ao aceitar; conclusão sempre disponível
  }
}

export interface GameState {
  dia: number;
  moral: number;
  diasSemComida: number; // contador de dias consecutivos sem comida suficiente
  velocidade: 1 | 2 | 5;
  andarAtual: number;
  lastTimestamp: number;
  gameOver: boolean;
  vitoria: boolean;

  recursos: {
    comida: number;
    madeira: number;
    pedra: number;
    ferro: number;
    capacidadeArmazem: number;
  };

  npcs: NPC[];
  edificios: Edificio[];
  log: LogEntry[];

  // ─── Guerra entre cidadelas ──────────────────────────────────────────────
  guerra: GuerraAtiva | null;           // guerra em curso (uma por vez), ou null
  guerraPendente: GuerraPendente | null; // invasão declarada por rival — aguarda resposta
  guerrasHistorico: GuerraRegistro[];   // registro local das guerras encerradas

  // ─── Habitantes da Torre ─────────────────────────────────────────────────
  habitantesEstado: Record<number, HabitanteEstado>;  // floor → estado da quest
  habitantesDiaDescoberta: Record<number, number>;    // floor → dia em que foi descoberto
  habitantesQuestResetDia: Record<number, number>;    // floor → dia em que guerra resetou o timer (semGuerra)
  ecos: number[];                                      // andares com Eco de loot ativo
  ecosCapitulo: number[];                              // capítulos (tiers) com Eco de boss
  lores: { floor: number; texto: string; titulo: string }[]; // lore desbloqueado (legado)

  // ─── Codex Obscuro ───────────────────────────────────────────────────────
  codexFragmentos: string[];   // IDs de FragmentoCodex desbloqueados
  codexNovoFragmento: boolean; // true = há fragmento novo não visualizado (badge no ícone)
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const NAMES = [
  'Aldric', 'Brenna', 'Caelum', 'Dúnia', 'Erlen', 'Fausta', 'Gael', 'Helva',
  'Ira', 'Jasper', 'Kira', 'Luca', 'Mira', 'Naldo', 'Orla', 'Petra', 'Quino',
  'Raia', 'Seren', 'Tobias', 'Ursa', 'Vale', 'Wren', 'Xara', 'Yago', 'Zilda',
];

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomHabilidade(): HabilidadeId {
  const ids = Object.keys(HABILIDADES) as HabilidadeId[];
  return ids[Math.floor(Math.random() * ids.length)];
}

function calcRaridade(npc: Omit<NPC, 'raridade' | 'habilidade'>): Raridade {
  const total = npc.forca + npc.agilidade + npc.inteligencia + npc.resistencia;
  if (total >= 44) return 'Épico';
  if (total >= 34) return 'Raro';
  if (total >= 24) return 'Incomum';
  return 'Comum';
}

// Recalcula a raridade de um NPC existente após mudança de atributos.
export function recalcRaridade(npc: NPC): Raridade {
  return calcRaridade(npc);
}

// ─── TREINAMENTO DE COMBATENTES ───────────────────────────────────────────────
// Desbloqueado após derrotar o primeiro chefe (andar 5). Exige Quartel construído.
// Cada sessão aumenta a Força permanentemente. O custo sobe por sessão concluída.
// Com um aliado emprestado do tipo Combatente na cidadela, o ganho é +2 (em vez de +1).

export const MAX_TREINAMENTOS = 5;

export function calcCustoTreinamento(treinamentos: number): { madeira: number; ferro: number } {
  return {
    madeira: 10 + treinamentos * 8,
    ferro:   5  + treinamentos * 4,
  };
}

// Seleciona o melhor instrutor disponível para o treinamento.
// O stat de comparação depende da profissão do treinando (FOR/AGI/RES).
// Retorna null se não houver ninguém apto.
export function calcInstrutor(
  treineeId: string,
  npcs: NPC[],
  stat: 'forca' | 'agilidade' | 'resistencia' = 'forca',
): NPC | null {
  const candidatos = npcs.filter(
    n => n.vivo && !n.emExpedicao && !n.emGuerra && n.id !== treineeId,
  );
  if (candidatos.length === 0) return null;
  return candidatos.reduce((best, n) => (n[stat] > best[stat] ? n : best));
}

// Retorna true se o NPC pode ser treinado agora.
export function podeTreinarNpc(
  npc: NPC,
  quartelNivel: number,  // 0 = não construído
  andarAtual: number,
): boolean {
  if (andarAtual < 6) return false;           // exige chefe do andar 5 vencido
  if (quartelNivel < 1) return false;         // exige Quartel construído
  if (!npc.vivo) return false;
  if (npc.emExpedicao || npc.emGuerra) return false;
  if (npc.emprestado || npc.reforco) return false; // só moradores próprios
  if (npc.fadiga >= 60) return false;         // muito cansado para treinar
  if ((npc.treinamentos ?? 0) >= MAX_TREINAMENTOS) return false;
  // Combatente, Batedor e Sentinela são profissões de combate — treinam no Quartel.
  // Erudito é civil e não se beneficia do treinamento físico.
  const prof = getProfissao(npc);
  if (prof !== 'combatente' && prof !== 'batedor' && prof !== 'sentinela') return false;
  return true;
}

// Stat primário de combate para cada profissão treinável.
export function statTreinamento(npc: NPC): 'forca' | 'agilidade' | 'resistencia' {
  const prof = getProfissao(npc);
  if (prof === 'batedor')   return 'agilidade';
  if (prof === 'sentinela') return 'resistencia';
  return 'forca';
}

export const generateNPC = (isObscuro = false): NPC => {
  const base = {
    id: crypto.randomUUID(),
    nome: NAMES[Math.floor(Math.random() * NAMES.length)],
    forca: isObscuro ? getRandomInt(8, 15) : getRandomInt(2, 10),
    agilidade: isObscuro ? getRandomInt(8, 15) : getRandomInt(2, 10),
    inteligencia: isObscuro ? getRandomInt(8, 15) : getRandomInt(2, 10),
    resistencia: isObscuro ? getRandomInt(8, 15) : getRandomInt(2, 10),
    sanidade: getRandomInt(60, 90),
    lealdade: isObscuro ? getRandomInt(20, 40) : getRandomInt(60, 90),
    fadiga: getRandomInt(5, 30),
    vivo: true,
    obscuro: isObscuro,
    emExpedicao: false,
    posto: null,
  };
  return {
    ...base,
    raridade: calcRaridade(base),
    habilidade: getRandomHabilidade(),
  };
};

// ─── GACHA — RITUAL EM TRINDADE ──────────────────────────────────────────────
// Cada ritual invoca GACHA_BATCH sobreviventes de uma vez. A raridade de cada um
// é sorteada antes de gerar os atributos, garantindo que raros realmente sejam raros
// e épicos sejam excepcionais. Custo por ritual é mais vantajoso por unidade que a
// invocação simples anterior.

export const GACHA_BATCH = 3;

export const GACHA_ODDS: Array<{ raridade: Raridade; peso: number }> = [
  { raridade: 'Épico',   peso: 3  },
  { raridade: 'Raro',    peso: 12 },
  { raridade: 'Incomum', peso: 30 },
  { raridade: 'Comum',   peso: 55 },
];

function statsParaRaridade(r: Raridade): { min: number; max: number } {
  switch (r) {
    case 'Épico':   return { min: 9,  max: 15 };
    case 'Raro':    return { min: 6,  max: 12 };
    case 'Incomum': return { min: 4,  max: 9  };
    case 'Comum':   return { min: 2,  max: 7  };
  }
}

export function rollGachaRaridade(): Raridade {
  const total = GACHA_ODDS.reduce((s, o) => s + o.peso, 0);
  let r = Math.random() * total;
  for (const o of GACHA_ODDS) {
    r -= o.peso;
    if (r <= 0) return o.raridade;
  }
  return 'Comum';
}

// Gera um NPC cujos atributos são escalonados pela raridade sorteada no gacha.
// Raridades maiores garantem ranges maiores E lealdade mais alta (mais confiáveis).
export function generateNpcGacha(forcadoRaridade?: Raridade): NPC {
  const raridade = forcadoRaridade ?? rollGachaRaridade();
  const { min, max } = statsParaRaridade(raridade);
  const lealdadeBase =
    raridade === 'Épico'   ? getRandomInt(75, 95) :
    raridade === 'Raro'    ? getRandomInt(65, 90) :
    raridade === 'Incomum' ? getRandomInt(60, 85) :
                             getRandomInt(55, 80);
  const base = {
    id: crypto.randomUUID(),
    nome: NAMES[Math.floor(Math.random() * NAMES.length)],
    forca:        getRandomInt(min, max),
    agilidade:    getRandomInt(min, max),
    inteligencia: getRandomInt(min, max),
    resistencia:  getRandomInt(min, max),
    sanidade:  getRandomInt(60, 90),
    lealdade:  lealdadeBase,
    fadiga:    getRandomInt(5, 20),
    vivo: true,
    obscuro: false,
    emExpedicao: false,
    posto: null as EdificioTipo | null,
  };
  return { ...base, raridade, habilidade: getRandomHabilidade() };
}

// Custo do ritual em trindade. Mais vantajoso por unidade que a invocação simples
// (≈ mesmo custo total de antes, mas por 3 NPCs em vez de 1).
export function calcCustoGacha(popViva: number): { comida: number; madeira: number; ferro: number } {
  return {
    comida:  25 + popViva * 5,
    madeira: 12 + popViva * 2,
    ferro:   Math.max(1, Math.floor(popViva / 2)),
  };
}

// ─── POWER CALCULATION (with skill bonuses) ───────────────────────────────────

export function calcNpcPower(npc: NPC): number {
  let forca = npc.forca;
  let agilidade = npc.agilidade;
  let inteligencia = npc.inteligencia;
  let resistencia = npc.resistencia;

  if (npc.habilidade === 'guardiao') resistencia = Math.floor(resistencia * 1.2);
  if (npc.habilidade === 'explorador') agilidade = Math.floor(agilidade * 1.15);
  if (npc.habilidade === 'berserker') forca += 3;

  const intFactor = npc.habilidade === 'estrategista' ? 0.4 : 0.2;
  let p = forca * 0.3 + agilidade * 0.25 + resistencia * 0.25 + inteligencia * intFactor;

  // Combatentes (FOR dominante) são +8% mais fortes em combate
  if (getProfissao(npc) === 'combatente') p *= 1.08;

  if (npc.fadiga >= 50 && npc.fadiga <= 69) p *= 0.85;
  else if (npc.fadiga >= 70 && npc.fadiga <= 89) p *= 0.65;

  return p;
}

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

export const CAPACIDADE_BASE = 80;

export const createInitialState = (): GameState => ({
  dia: 1,
  moral: 70,
  diasSemComida: 0,
  velocidade: 1,
  andarAtual: 1,
  lastTimestamp: Date.now(),
  gameOver: false,
  vitoria: false,
  recursos: {
    comida: 40,
    madeira: 30,
    pedra: 20,
    ferro: 5,
    capacidadeArmazem: CAPACIDADE_BASE,
  },
  npcs: Array.from({ length: 6 }).map(() => generateNPC()),
  edificios: [],
  log: [{
    id: crypto.randomUUID(),
    tipo: 'info',
    mensagem: 'O ciclo começa. O Observador desperta.',
    dia: 1,
  }],
  guerra: null,
  guerraPendente: null,
  guerrasHistorico: [],
  habitantesEstado: {},
  habitantesDiaDescoberta: {},
  habitantesQuestResetDia: {},
  ecos: [],
  ecosCapitulo: [],
  lores: [],
  codexFragmentos: [],
  codexNovoFragmento: false,
});

// ─── BUILDINGS (leveled) ───────────────────────────────────────────────────────
// Every building can be upgraded up to nivel 3. Each level REPLACES the previous
// level's effect (values are absolute, not cumulative). getEfeitos() aggregates
// the currently-built levels into the daily bonuses used by the game loop.

export interface EfeitoEdificio {
  comidaDia?: number;      // food produced per day
  moralDia?: number;       // morale gained per day
  sanidadeDia?: number;    // sanity restored per living NPC per day
  fadigaRec?: number;      // extra fatigue recovered per NPC per day
  poderBonus?: number;     // fraction added to expedition group power (0.10 = +10%)
  capacidadeArmazem?: number; // absolute storage capacity
  capPopulacao?: number;   // absolute population cap
}

export interface NivelEdificio {
  custo: { madeira?: number; pedra?: number; ferro?: number };
  resumo: string;          // human-readable effect for this level
  efeito: EfeitoEdificio;
}

export interface BuildingDef {
  tipo: EdificioTipo;
  nome: string;
  descricao: string;
  maxNivel: number;
  niveis: NivelEdificio[];
}

export const BUILDINGS: Record<EdificioTipo, BuildingDef> = {
  Fogueira: {
    tipo: 'Fogueira',
    nome: 'Fogueira',
    descricao: 'Aquece a alma e eleva o moral do grupo.',
    maxNivel: 3,
    niveis: [
      { custo: { madeira: 5 },              resumo: '+1 moral/dia',  efeito: { moralDia: 1 } },
      { custo: { madeira: 15, pedra: 10 },  resumo: '+2 moral/dia',  efeito: { moralDia: 2 } },
      { custo: { madeira: 30, pedra: 20 },  resumo: '+4 moral/dia',  efeito: { moralDia: 4 } },
    ],
  },
  Fazenda: {
    tipo: 'Fazenda',
    nome: 'Fazenda',
    descricao: 'Produz comida diária para sustentar a população.',
    maxNivel: 3,
    niveis: [
      { custo: { madeira: 15, pedra: 5 },            resumo: '+10 comida/dia', efeito: { comidaDia: 10 } },
      { custo: { madeira: 35, pedra: 20 },           resumo: '+22 comida/dia', efeito: { comidaDia: 22 } },
      { custo: { madeira: 60, pedra: 40, ferro: 10 }, resumo: '+40 comida/dia', efeito: { comidaDia: 40 } },
    ],
  },
  Enfermaria: {
    tipo: 'Enfermaria',
    nome: 'Enfermaria',
    descricao: 'Acelera a recuperação de fadiga de todos.',
    maxNivel: 3,
    niveis: [
      { custo: { madeira: 15, pedra: 10 },            resumo: '+8 fadiga rec./dia',  efeito: { fadigaRec: 8 } },
      { custo: { madeira: 35, pedra: 25 },            resumo: '+18 fadiga rec./dia', efeito: { fadigaRec: 18 } },
      { custo: { madeira: 60, pedra: 45, ferro: 12 }, resumo: '+30 fadiga rec./dia', efeito: { fadigaRec: 30 } },
    ],
  },
  Templo: {
    tipo: 'Templo',
    nome: 'Templo',
    descricao: 'Restaura a sanidade e fortalece o moral.',
    maxNivel: 3,
    niveis: [
      { custo: { pedra: 30, madeira: 20 },            resumo: '+2 moral, +0.5 sanidade/dia', efeito: { moralDia: 2, sanidadeDia: 0.5 } },
      { custo: { pedra: 55, madeira: 40, ferro: 10 }, resumo: '+4 moral, +1.5 sanidade/dia', efeito: { moralDia: 4, sanidadeDia: 1.5 } },
      { custo: { pedra: 80, madeira: 60, ferro: 25 }, resumo: '+6 moral, +3 sanidade/dia',   efeito: { moralDia: 6, sanidadeDia: 3 } },
    ],
  },
  Quartel: {
    tipo: 'Quartel',
    nome: 'Quartel',
    descricao: 'Treina o grupo, aumentando o poder nas expedições.',
    maxNivel: 3,
    niveis: [
      { custo: { madeira: 25, pedra: 20, ferro: 10 }, resumo: '+10% poder de expedição', efeito: { poderBonus: 0.10 } },
      { custo: { madeira: 45, pedra: 40, ferro: 25 }, resumo: '+22% poder de expedição', efeito: { poderBonus: 0.22 } },
      { custo: { madeira: 70, pedra: 60, ferro: 45 }, resumo: '+38% poder de expedição', efeito: { poderBonus: 0.38 } },
    ],
  },
  Armazem: {
    tipo: 'Armazem',
    nome: 'Armazém',
    descricao: 'Expande a capacidade de estocagem de recursos.',
    maxNivel: 3,
    niveis: [
      { custo: { madeira: 20, pedra: 10 },            resumo: 'Capacidade 150', efeito: { capacidadeArmazem: 150 } },
      { custo: { madeira: 40, pedra: 25 },            resumo: 'Capacidade 300', efeito: { capacidadeArmazem: 300 } },
      { custo: { madeira: 60, pedra: 40, ferro: 15 }, resumo: 'Capacidade 600', efeito: { capacidadeArmazem: 600 } },
    ],
  },
  Alojamento: {
    tipo: 'Alojamento',
    nome: 'Alojamento',
    descricao: 'Abriga sobreviventes. Define o limite de população da cidadela.',
    maxNivel: 3,
    niveis: [
      { custo: { madeira: 20, pedra: 8 },             resumo: 'Limite de 9 moradores',  efeito: { capPopulacao: 9 } },
      { custo: { madeira: 40, pedra: 25 },            resumo: 'Limite de 12 moradores', efeito: { capPopulacao: 12 } },
      { custo: { madeira: 70, pedra: 45, ferro: 15 }, resumo: 'Limite de 16 moradores', efeito: { capPopulacao: 16 } },
    ],
  },
};

// População base sem Alojamento construído.
export const POP_BASE = 6;

// Custo do Ritual de Invocação — sobe com a população viva atual.
export function calcCustoInvocacao(popViva: number): { comida: number; madeira: number; ferro: number } {
  return {
    comida:  20 + popViva * 6,
    madeira: 10 + popViva * 3,
    ferro:   Math.floor(popViva / 3),
  };
}

// Workers assigned to (and currently able to work at) a building: alive, not on
// an expedition, and posted there. Slots are limited to the building's level.
export function trabalhadoresDe(tipo: EdificioTipo, nivel: number, npcs: NPC[]): NPC[] {
  const workers = npcs.filter(n => n.vivo && !n.emExpedicao && n.posto === tipo);
  return workers.slice(0, Math.max(0, nivel));
}

// Aggregate all built levels + assigned workers into the daily effect bundle.
export function getEfeitos(edificios: Edificio[], npcs: NPC[] = []): Required<EfeitoEdificio> {
  const ef: Required<EfeitoEdificio> = {
    comidaDia: 0, moralDia: 0, sanidadeDia: 0, fadigaRec: 0, poderBonus: 0,
    capacidadeArmazem: CAPACIDADE_BASE, capPopulacao: POP_BASE,
  };
  for (const e of edificios) {
    const def = BUILDINGS[e.tipo];
    if (!def || e.nivel < 1) continue;
    const lvl = def.niveis[e.nivel - 1];
    if (!lvl) continue;
    const x = lvl.efeito;
    if (x.comidaDia)   ef.comidaDia += x.comidaDia;
    if (x.moralDia)    ef.moralDia += x.moralDia;
    if (x.sanidadeDia) ef.sanidadeDia += x.sanidadeDia;
    if (x.fadigaRec)   ef.fadigaRec += x.fadigaRec;
    if (x.poderBonus)  ef.poderBonus += x.poderBonus;
    if (x.capacidadeArmazem) ef.capacidadeArmazem = Math.max(ef.capacidadeArmazem, x.capacidadeArmazem);
    if (x.capPopulacao) ef.capPopulacao = Math.max(ef.capPopulacao, x.capPopulacao);

    // Contribuição dos trabalhadores alocados neste edifício
    const afim = POSTO_AFIM[e.tipo];
    if (afim) {
      for (const w of trabalhadoresDe(e.tipo, e.nivel, npcs)) {
        const mult = getProfissao(w) === afim ? 1.5 : 1;
        switch (e.tipo) {
          case 'Fazenda':    ef.comidaDia += Math.round(w.inteligencia * 0.5 * mult); break;
          case 'Enfermaria': ef.fadigaRec += Math.round(w.inteligencia * 0.4 * mult); break;
          case 'Quartel':    ef.poderBonus += w.forca * 0.006 * mult; break;
          case 'Templo':     ef.moralDia += Math.round(w.resistencia * 0.25 * mult); break;
          case 'Fogueira':   ef.moralDia += Math.round(w.resistencia * 0.2 * mult); break;
        }
      }
    }
  }
  return ef;
}

// Cost to reach the next level, or null if already maxed.
export function proximoNivelCusto(tipo: EdificioTipo, nivelAtual: number) {
  const def = BUILDINGS[tipo];
  if (!def || nivelAtual >= def.maxNivel) return null;
  return def.niveis[nivelAtual].custo;
}

// ─── FLOORS ──────────────────────────────────────────────────────────────────

// ─── SISTEMA DE BIOMAS ────────────────────────────────────────────────────────
// Cada andar tem um bioma fixo que determina: quais stats importam, qual profissão
// se destaca e que tipo de recursos o grupo encontra. Isso cria decisões estratégicas
// sobre QUEM enviar, em vez de só empilhar poder bruto.

export type BiomaTipo = 'floresta' | 'caverna' | 'ruinas' | 'fortaleza' | 'abismo';

export const BIOMA_META: Record<BiomaTipo, {
  icone: string;
  label: string;
  statPrimario: 'forca' | 'agilidade' | 'resistencia' | 'inteligencia';
  profissaoIdeal: ProfissaoId;
  dica: string;
  mortalidadeBonus: number; // ajuste na taxa base de mortalidade do andar
}> = {
  floresta:  { icone: '🌲', label: 'Floresta',  statPrimario: 'agilidade',    profissaoIdeal: 'batedor',    dica: 'Batedores ágeis exploram melhor',     mortalidadeBonus: 0 },
  caverna:   { icone: '⛏', label: 'Caverna',   statPrimario: 'resistencia',  profissaoIdeal: 'sentinela',  dica: 'Sentinelas resistem às profundezas',  mortalidadeBonus: 3 },
  ruinas:    { icone: '📜', label: 'Ruínas',    statPrimario: 'inteligencia', profissaoIdeal: 'erudito',    dica: 'Eruditos decifram os segredos',       mortalidadeBonus: -2 },
  fortaleza: { icone: '⚔', label: 'Fortaleza', statPrimario: 'forca',        profissaoIdeal: 'combatente', dica: 'Combatentes dominam a batalha aberta', mortalidadeBonus: 2 },
  abismo:    { icone: '🌀', label: 'Abismo',    statPrimario: 'forca',        profissaoIdeal: 'combatente', dica: 'Todo poder é pouco aqui',              mortalidadeBonus: 6 },
};

// Bioma de cada andar (1–20), fixo para permitir estratégia consciente.
const BIOMA_POR_ANDAR: BiomaTipo[] = [
  'floresta', 'caverna',   'floresta', 'caverna',   'ruinas',    // 1–5
  'caverna',  'floresta',  'ruinas',   'fortaleza', 'ruinas',    // 6–10
  'floresta', 'caverna',   'ruinas',   'fortaleza', 'fortaleza', // 11–15
  'abismo',   'ruinas',    'fortaleza','abismo',    'abismo',    // 16–20
];

// Nomes individuais por andar (mais narrativo que "Câmara Sombria 7").
const FLOOR_NOMES: string[] = [
  'Mata Cinzenta',      'Grutas Rasas',        'Floresta Sombria',    'Caverna Cristalina',  'Ruína Esquecida',
  'Abismos de Pedra',   'Selva Tenebrosa',     'Biblioteca Perdida',  'Forja Abandonada',    'Castelo em Ruínas',
  'Pântano das Almas',  'Minas Profundas',     'Templo Profano',      'Bastião Sombrio',     'Fortaleza Maldita',
  'Abismo Superior',    'Câmara do Caos',      'Cidadela da Queda',   'Antecâmara do Fim',   'Ápice Obscuro',
];

// Texto atmosférico de cada andar — conta uma história dentro de cada capítulo (5 andares).
// Capítulo 1 (1–5): "O Que Foi Selado" — exploradores adentram a Torre pela primeira vez.
// Capítulo 2 (6–10): "O Que Vivia Aqui" — vestígios de uma civilização que habitou a Torre e desapareceu.
// Capítulo 3 (11–15): "O Que a Torre Faz" — a Torre revela ser um organismo vivo que consome.
// Capítulo 4 (16–20): "O Que Sempre Esteve Aqui" — o ápice e a entidade que usou a Torre como isca.
const FLOOR_DESCRICOES: string[] = [
  // Cap. 1 — "O Que Foi Selado"
  'A neblina não é natural. As árvores sangram escuridão, e algo nos observa de dentro do cinabre.',
  'Os túneis foram escavados com pressa. Ferramentas enferrujadas e ossos sugerem que os construtores nunca saíram.',
  'A vegetação aqui cresce para dentro. Raízes atravessam as paredes como dedos buscando algo enterrado no núcleo da Torre.',
  'Os cristais pulsam em ritmo constante. Quem os ouve por tempo demais começa a murmurar de volta.',
  'A última linha de defesa dos que ergueram este lugar. O Guardião não protege o que está acima — garante que ninguém veja o que está abaixo.',
  // Cap. 2 — "O Que Vivia Aqui"
  'Além do Guardião, a pedra lembra formas. Colunas entalhadas representam figuras sem rosto adorando algo acima.',
  'A vida aqui é exuberante demais. Plantas que não existem no mundo exterior florescem sob uma luz que não vem de nenhuma janela.',
  'Prateleiras até um teto invisível. Os livros foram escritos em ordem cronológica — mas os mais antigos estão no topo.',
  'As forjas ainda estão quentes. Armaduras de um design impossível esperam mestres que nunca voltaram para vesti-las.',
  'Ele catalogou cada alma que passou por aqui. O Arquivista sabe seus nomes — e os nomes das pessoas que você perdeu.',
  // Cap. 3 — "O Que a Torre Faz"
  'As faces nas águas negras são reconhecíveis. Elas pedem que você se junte a elas. Algumas das vozes parecem familiares.',
  'Cada golpe de picareta ressoa como um gemido. O minério aqui não é extração — é amputação.',
  'Os altares mudam de forma quando você não está olhando. O objeto de adoração adapta-se ao maior medo de quem o observa.',
  'Soldados de pedra tomam posições diferentes a cada visita. Estão se preparando — não para defender, mas para executar.',
  'A Torre aprendeu com você. O que você encontra aqui usa suas táticas, seu planejamento, sua força. Derrote o que você poderia ter se tornado.',
  // Cap. 4 — "O Que Sempre Esteve Aqui"
  'A gravidade é sugestão. O horizonte curva para cima. Algo do outro lado observa com fome crescente.',
  'As leis da física são rascunhos riscados. Tempo, espaço e memória derretem em possibilidades simultâneas.',
  'Construída pelos que tentaram parar o que você está prestes a acordar. Eles falharam. Suas advertências ainda estão nas paredes.',
  'Você ouve uma respiração. Lenta. Rítmica. Enorme. Do outro lado da última porta.',
  'Não há monstro. Há uma presença que sempre existiu e usou a Torre como isca. A questão não é se você pode vencê-la — é se algo de você sobra depois.',
];

// Bosses dos andares 5, 10, 15 e 20 — um por capítulo.
const FLOOR_BOSS: Record<number, { nome: string; epiteto: string }> = {
   5: { nome: 'GUARDIÃO DO LIMIAR',     epiteto: 'Ele não esquece nenhum rosto que tentou passar.' },
  10: { nome: 'ARQUIVISTA CORROMPIDO',  epiteto: 'Cada segredo da Torre mora em sua memória podre.' },
  15: { nome: 'REFLEXO PROFANO',        epiteto: 'Derrote o que você poderia ter se tornado.' },
  20: { nome: 'O QUE SEMPRE ESTEVE AQUI', epiteto: 'A Torre era a armadilha. Você era a presa.' },
};

// Dificuldade não-linear: cada andar tem seu próprio ritmo, não só floor*8.
// Bosses (5, 10, 15, 20) têm pico maior; andares "difíceis de bioma" têm +10–20%.
const BASE_DIFICULDADE: number[] = [
   8,  15,  20,  28,   42,  // 1–5  (boss 5)
  36,  44,  54,  64,   90,  // 6–10 (boss 10)
  75,  88, 100, 118,  155,  // 11–15 (boss 15)
 130, 148, 168, 190,  230,  // 16–20 (boss 20)
];

// Títulos de capítulo — exibidos no topo do card antes do andar.
export const CAPITULO_NOMES: Record<number, string> = {
  1: 'O Que Foi Selado',
  2: 'O Que Vivia Aqui',
  3: 'O Que a Torre Faz',
  4: 'O Que Sempre Esteve Aqui',
};

// Mortalidade base: combinação de progressão + ajuste do bioma.
export const FLOORS = BIOMA_POR_ANDAR.map((bioma, i) => {
  const floor  = i + 1;
  const isBoss = floor % 5 === 0;
  const tier   = Math.ceil(floor / 5);
  const tierNames = ['Salões Poeirentos', 'Câmaras Sombrias', 'Espirais Malditas', 'Ápice Obscuro'];
  const tierName   = tierNames[tier - 1];
  const difficulty = BASE_DIFICULDADE[i];
  const biomaBonus = BIOMA_META[bioma].mortalidadeBonus;
  const mortality  = isBoss ? floor * 3 + biomaBonus : floor * 2 + biomaBonus;
  const descricao  = FLOOR_DESCRICOES[i];
  const boss       = FLOOR_BOSS[floor] ?? null;
  return { floor, nome: FLOOR_NOMES[i], tierName, bioma, isBoss, difficulty, mortality, tier, descricao, boss };
});

// ─── EXPEDITION ECONOMY ────────────────────────────────────────────────────────

export interface RecompensaAndar {
  comida: number;
  madeira: number;
  pedra: number;
  ferro: number;
}

// Recursos específicos por bioma: cada ambiente produz o que faz sentido ecologicamente.
// Floresta → comida+madeira; Caverna → pedra+ferro; Ruínas → balanceado; etc.
// Isso torna a escolha do andar estratégica — você vai ao que precisa, não apenas
// ao mais difícil disponível.
export function calcRecompensaAndar(floor: number, bioma: BiomaTipo): RecompensaAndar {
  switch (bioma) {
    case 'floresta':
      return {
        comida:  floor * 4 + 6,
        madeira: floor * 6 + 4,
        pedra:   Math.max(0, floor - 4) * 2,
        ferro:   floor >= 7 ? floor - 5 : 0,
      };
    case 'caverna':
      return {
        comida:  floor + 4,
        madeira: floor * 2 + 3,
        pedra:   floor * 5 + 5,
        ferro:   floor * 3 + 3,
      };
    case 'ruinas':
      return {
        comida:  floor * 2 + 6,
        madeira: floor * 3 + 5,
        pedra:   floor * 3 + 4,
        ferro:   floor * 2 + 3,
      };
    case 'fortaleza':
      return {
        comida:  floor + 3,
        madeira: floor * 2 + 2,
        pedra:   floor * 3 + 5,
        ferro:   floor * 5 + 6,
      };
    case 'abismo':
      return {
        comida:  floor * 3 + 8,
        madeira: floor * 4 + 6,
        pedra:   floor * 4 + 8,
        ferro:   floor * 3 + 6,
      };
  }
}

// Multiplicador de poder baseado na composição do grupo vs. bioma do andar.
// Ter a profissão certa no bioma certo = terreno favorável. Ter a errada = desvantagem.
// Abismo não tem afinidade — todo poder é igual lá.
export function calcBiomaMultiplier(group: NPC[], bioma: BiomaTipo): number {
  if (bioma === 'abismo') return 1.0;
  const profissaoIdeal = BIOMA_META[bioma].profissaoIdeal;
  const ideais = group.filter(n => getProfissao(n) === profissaoIdeal).length;
  const ratio  = ideais / Math.max(1, group.length);
  if (ratio >= 0.5) return 1.30;  // maioria certa: terreno favorável
  if (ratio >= 0.2) return 1.00;  // parcialmente: neutro
  return 0.80;                     // grupo errado: desvantagem de terreno −20%
}

// Food spent to launch an expedition (scales with group size and floor tier).
export function calcCustoExpedicao(qtd: number, tier: number): number {
  return qtd * (1 + tier);
}

// ─── Movimentação de recursos do armazém (funções puras, testáveis) ─────────────
// Usadas pela aliança para debitar/creditar recursos de forma atômica. Devem ser
// aplicadas SEMPRE contra o estado mais recente (dentro do updater do setState),
// pois o loop de dias altera os recursos em paralelo.

export interface DeltaRecursos {
  comida: number;
  madeira: number;
  pedra: number;
  ferro: number;
}

type ArmazemRecursos = GameState['recursos'];

// Debita o delta do armazém. Retorna os novos recursos, ou null se NÃO houver
// saldo suficiente para o delta inteiro (nunca debita parcialmente).
export function debitarArmazem(atual: ArmazemRecursos, d: DeltaRecursos): ArmazemRecursos | null {
  if (
    atual.comida < d.comida ||
    atual.madeira < d.madeira ||
    atual.pedra < d.pedra ||
    atual.ferro < d.ferro
  ) {
    return null;
  }
  return {
    ...atual,
    comida: atual.comida - d.comida,
    madeira: atual.madeira - d.madeira,
    pedra: atual.pedra - d.pedra,
    ferro: atual.ferro - d.ferro,
  };
}

// Credita o delta no armazém respeitando a capacidade. Indica se houve perda por
// transbordo (mesma regra do restante do jogo).
export function creditarArmazem(
  atual: ArmazemRecursos,
  d: DeltaRecursos,
): { recursos: ArmazemRecursos; perdeu: boolean } {
  const cap = atual.capacidadeArmazem;
  let perdeu = false;
  const aplica = (v: number, add: number): number => {
    if (v + add > cap) perdeu = true;
    return Math.min(cap, v + add);
  };
  return {
    recursos: {
      ...atual,
      comida: aplica(atual.comida, d.comida),
      madeira: aplica(atual.madeira, d.madeira),
      pedra: aplica(atual.pedra, d.pedra),
      ferro: aplica(atual.ferro, d.ferro),
    },
    perdeu,
  };
}

// ─── GUERRA ENTRE CIDADELAS ─────────────────────────────────────────────────────
// Guerra declarada contra cidadelas-bot (o servidor só fornece o alvo). Toda a
// simulação roda no cliente, resolvida dia a dia dentro de processDay. Modelo de
// baixas MISTO: ferimentos/exaustão frequentes, morte permanente RARA. Combatentes
// mobilizados ficam indisponíveis (emGuerra) para torre/trabalho até o fim.

export type Postura = 'agressiva' | 'defensiva' | 'equilibrada';

export interface RivalCidadela {
  slug: string;
  nome: string;
  dia: number;
  andar: number;
  populacao: number;
  profissoes: { combatente: number; batedor: number; erudito: number; sentinela: number };
  poderBase: number;        // poder de combate do exército rival
  suprimento: number;       // reserva de suprimento do rival
  recursos: DeltaRecursos;  // estoque do rival — vira espólio na vitória
  postura: Postura;
}

export interface GuerraAtiva {
  rival: RivalCidadela;
  rivalIntegridade: number;   // 1 = intacto, 0 = exército rival quebrado
  rivalSuprimento: number;    // reserva do rival (decai a cada dia)
  tropaIds: string[];         // moradores mobilizados
  duracao: number;            // dias de campanha (padrão GUERRA_DURACAO)
  diasDecorridos: number;     // contador independente do dia absoluto
  diaInicio: number;
  momento: number;            // -100..100 (vantagem acumulada da campanha)
  suprido: boolean;           // suas linhas de suprimento no último dia resolvido
  baixasJogador: number;      // seus mortos permanentes
  feridosJogador: number;     // ferimentos acumulados (fadiga/sanidade)
  baixasRival: number;        // baixas estimadas do rival
  ultimoRelato: string;       // resumo da última escaramuça (para a UI)
}

// Invasão pendente — bot declarou guerra; jogador tem `prazoResposta` dias para mobilizar.
export interface GuerraPendente {
  rival: RivalCidadela;
  prazoResposta: number;  // dias restantes (começa em 3)
  diaDeclarado: number;
}

export interface GuerraRegistro {
  id: string;
  rivalNome: string;
  resultado: 'vitoria' | 'derrota';
  diaInicio: number;
  diaFim: number;
  duracaoDias: number;
  baixasJogador: number;
  baixasRival: number;
  espolio: DeltaRecursos;   // recursos ganhos (vitória) ou perdidos (derrota, negativos)
}

// ─── BOT WAR DECLARATION ─────────────────────────────────────────────────────

const NOMES_RIVAIS_AGRESSORES = [
  'Fortaleza de Cinzas', 'Bastião Sombrio', 'Torre do Sangue',
  'Domínio do Vazio', 'Cidadela dos Amaldiçoados', 'Legião da Escuridão',
  'Baluarte do Fim', 'Covil da Tempestade', 'Sentinela das Ruínas',
  'Horda do Crepúsculo', 'Castelo de Ferro Negro', 'Muralha dos Condenados',
];

// Gera um rival agressor escalado ao poder militar atual do jogador.
export function gerarRivalAgressor(state: GameState): RivalCidadela {
  const meuPoder = calcPoderMilitar(state);
  // Poder: 75-125% do jogador, mínimo 8 para sempre ameaçar algo.
  const mult = 0.75 + Math.random() * 0.5;
  const poderBase = Math.max(8, Math.round(meuPoder * mult));
  const posturas: Postura[] = ['agressiva', 'agressiva', 'equilibrada'];
  const postura = posturas[Math.floor(Math.random() * posturas.length)];
  const nome = NOMES_RIVAIS_AGRESSORES[Math.floor(Math.random() * NOMES_RIVAIS_AGRESSORES.length)];
  return {
    slug: `agressor-${crypto.randomUUID().slice(0, 8)}`,
    nome,
    dia: state.dia,
    andar: state.andarAtual,
    populacao: Math.max(4, Math.round(state.npcs.filter(n => n.vivo).length * (0.8 + Math.random() * 0.6))),
    profissoes: { combatente: 3, batedor: 2, erudito: 1, sentinela: 2 },
    poderBase,
    suprimento: 25 + Math.round(poderBase * 0.4),
    recursos: {
      comida:  40 + Math.round(Math.random() * 80),
      madeira: 25 + Math.round(Math.random() * 60),
      pedra:   15 + Math.round(Math.random() * 50),
      ferro:   8  + Math.round(Math.random() * 30),
    },
    postura,
  };
}

// Probabilidade diária de um bot declarar guerra ao jogador.
// Sobe com o andamento do jogo; cooldown pós-guerra para não ser spam.
export function chanceBotWar(state: GameState): number {
  if (state.andarAtual < 3) return 0;
  let chance = state.andarAtual <= 5 ? 0.004
             : state.andarAtual <= 10 ? 0.007
             : 0.011;
  const last = state.guerrasHistorico?.[0];
  if (last) {
    const diasDesde = state.dia - last.diaFim;
    if (diasDesde < 20) {
      // Cooldown absoluto: zero chance nos primeiros 20 dias após qualquer guerra.
      return 0;
    }
    if (last.resultado === 'derrota' && diasDesde < 40) {
      // Vingança: chance 2× nos dias 20–39 após uma derrota.
      chance *= 2.0;
    }
  }
  return chance;
}

// Balanceamento da guerra.
export const GUERRA_DURACAO = 15;
export const GUERRA_MIN_TROPA = 1;

// Custo de mobilização (pago ao declarar guerra): equipar os combatentes.
export function calcCustoMobilizacao(qtd: number): DeltaRecursos {
  return { comida: qtd * 5, madeira: qtd * 2, pedra: 0, ferro: qtd * 3 };
}

function clampNum(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// Poder militar estimado da cidadela p/ matchmaking: soma do poder dos moradores
// aptos (vivos, não emprestados/reforço) ampliado pelo bônus do Quartel.
export function calcPoderMilitar(state: GameState): number {
  const ef = getEfeitos(state.edificios, state.npcs);
  const aptos = state.npcs.filter((n) => n.vivo && !n.emprestado && !n.reforco);
  const base = aptos.reduce((s, n) => s + calcNpcPower(n), 0);
  return Math.round(base * (1 + ef.poderBonus));
}

// Poder de combate de uma tropa específica (aplica bônus do Quartel).
export function calcPoderTropa(tropa: NPC[], poderBonus: number): number {
  const base = tropa.filter((n) => n.vivo).reduce((s, n) => s + calcNpcPower(n), 0);
  return base * (1 + poderBonus);
}

type LogGuerra = { tipo: LogTipo; mensagem: string };

// Encerra a guerra: apura vencedor, devolve sobreviventes, aplica espólio/pilhagem
// e registra no histórico. Muta `draft`. Chamada de dentro de avancarGuerra.
function resolverGuerra(
  draft: GameState,
  motivo: 'prazo' | 'colapso' | 'exercito_rival_quebrado',
): LogGuerra[] {
  const g = draft.guerra!;
  const logs: LogGuerra[] = [];
  const tropaViva = draft.npcs.filter((n) => g.tropaIds.includes(n.id) && n.vivo);

  let vitoria: boolean;
  if (motivo === 'exercito_rival_quebrado') vitoria = true;
  else if (motivo === 'colapso') vitoria = false;
  else vitoria = g.momento > 0;

  // Limpa o flag em TODOS os mobilizados — inclusive quem morreu por causa
  // externa (fome/evento) durante a campanha — para nenhum registro ficar preso.
  draft.npcs.filter((n) => g.tropaIds.includes(n.id)).forEach((n) => { n.emGuerra = false; });

  // Sobreviventes retornam (liberados do front, exaustos).
  tropaViva.forEach((n) => {
    n.posto = null;
    n.fadiga = Math.min(100, n.fadiga + getRandomInt(8, 16));
  });

  const ef = getEfeitos(draft.edificios, draft.npcs);
  let espolio: DeltaRecursos = { comida: 0, madeira: 0, pedra: 0, ferro: 0 };

  if (vitoria) {
    const frac = clampNum(0.3 + (g.momento / 100) * 0.4, 0.2, 0.75);
    const saque: DeltaRecursos = {
      comida: Math.round(g.rival.recursos.comida * frac),
      madeira: Math.round(g.rival.recursos.madeira * frac),
      pedra: Math.round(g.rival.recursos.pedra * frac),
      ferro: Math.round(g.rival.recursos.ferro * frac),
    };
    const { recursos, perdeu } = creditarArmazem(draft.recursos, saque);
    draft.recursos = recursos;
    espolio = saque;
    draft.moral = Math.min(100, draft.moral + 12);
    logs.push({
      tipo: 'vitoria',
      mensagem: `VITÓRIA contra ${g.rival.nome}! Saque: ${saque.comida} comida, ${saque.madeira} madeira, ${saque.pedra} pedra, ${saque.ferro} ferro.`,
    });
    if (perdeu) {
      logs.push({ tipo: 'alerta', mensagem: 'Parte do espólio transbordou o Armazém e foi perdida.' });
    }
    // Chance pequena de um desertor rival juntar-se à cidadela.
    const popViva = draft.npcs.filter((n) => n.vivo && !n.emprestado && !n.reforco).length;
    if (popViva < ef.capPopulacao && Math.random() < 0.3) {
      const recruta = generateNPC();
      recruta.lealdade = Math.max(20, recruta.lealdade - 20);
      draft.npcs.push(recruta);
      logs.push({
        tipo: 'descoberta',
        mensagem: `${recruta.nome} desertou de ${g.rival.nome} e juntou-se à sua cidadela.`,
      });
    }
  } else {
    // Derrota: pilhagem dos seus recursos + queda de moral.
    const frac = clampNum(0.12 + (Math.abs(Math.min(g.momento, 0)) / 100) * 0.13, 0.08, 0.25);
    const perda: DeltaRecursos = {
      comida: Math.floor(draft.recursos.comida * frac),
      madeira: Math.floor(draft.recursos.madeira * frac),
      pedra: Math.floor(draft.recursos.pedra * frac),
      ferro: Math.floor(draft.recursos.ferro * frac),
    };
    draft.recursos.comida = Math.max(0, draft.recursos.comida - perda.comida);
    draft.recursos.madeira = Math.max(0, draft.recursos.madeira - perda.madeira);
    draft.recursos.pedra = Math.max(0, draft.recursos.pedra - perda.pedra);
    draft.recursos.ferro = Math.max(0, draft.recursos.ferro - perda.ferro);
    espolio = { comida: -perda.comida, madeira: -perda.madeira, pedra: -perda.pedra, ferro: -perda.ferro };
    draft.moral = Math.max(0, draft.moral - 12);
    logs.push({
      tipo: 'alerta',
      mensagem: `DERROTA para ${g.rival.nome}. Pilhagem: ${perda.comida} comida, ${perda.madeira} madeira, ${perda.pedra} pedra, ${perda.ferro} ferro.`,
    });
  }

  if (g.baixasJogador > 0) {
    logs.push({ tipo: 'morte', mensagem: `A campanha contra ${g.rival.nome} custou ${g.baixasJogador} morador(es).` });
  }

  draft.guerrasHistorico.unshift({
    id: crypto.randomUUID(),
    rivalNome: g.rival.nome,
    resultado: vitoria ? 'vitoria' : 'derrota',
    diaInicio: g.diaInicio,
    diaFim: draft.dia,
    duracaoDias: g.diasDecorridos,
    baixasJogador: g.baixasJogador,
    baixasRival: g.baixasRival,
    espolio,
  });
  if (draft.guerrasHistorico.length > 20) {
    draft.guerrasHistorico = draft.guerrasHistorico.slice(0, 20);
  }

  draft.guerra = null;
  return logs;
}

// Avança um dia da guerra em curso. Muta `draft` (guerra, moradores, recursos,
// moral, histórico) e retorna as entradas de log a serem registradas. Deve ser
// chamada uma vez por dia dentro de processDay.
export function avancarGuerra(draft: GameState): LogGuerra[] {
  const g = draft.guerra;
  if (!g) return [];
  const logs: LogGuerra[] = [];
  const ef = getEfeitos(draft.edificios, draft.npcs);

  g.diasDecorridos += 1;

  const tropa = draft.npcs.filter((n) => g.tropaIds.includes(n.id) && n.vivo);

  // Sem tropa viva → colapso imediato (derrota).
  if (tropa.length === 0) {
    return resolverGuerra(draft, 'colapso');
  }

  // 1) Suprimento próprio: custo extra de guerra por dia (comida + ferro).
  const custoComida = Math.ceil(tropa.length * 2.5);
  const custoFerro = Math.max(1, Math.floor(tropa.length * 0.5));
  const suprido = draft.recursos.comida >= custoComida && draft.recursos.ferro >= custoFerro;
  draft.recursos.comida = Math.max(0, draft.recursos.comida - custoComida);
  draft.recursos.ferro = Math.max(0, draft.recursos.ferro - custoFerro);
  g.suprido = suprido;

  // 2) Suprimento do rival: decai; sem ele o rival enfraquece.
  g.rivalSuprimento = Math.max(0, g.rivalSuprimento - Math.round(tropa.length * 1.5));
  const rivalSuprido = g.rivalSuprimento > 0;

  // 3) Poderes do dia.
  const supModJog = suprido ? 1 : 0.7;
  const pJog = calcPoderTropa(tropa, ef.poderBonus) * supModJog;

  const posturaMod = g.rival.postura === 'agressiva' ? 1.1 : g.rival.postura === 'defensiva' ? 0.9 : 1;
  const supModRival = rivalSuprido ? 1 : 0.7;
  const pRival = Math.max(1, g.rival.poderBase * g.rivalIntegridade * posturaMod * supModRival);

  // 4) Deslocamento de momento (proporcional à diferença relativa de poder).
  const maxP = Math.max(pJog, pRival, 1);
  const shift = clampNum(((pJog - pRival) / maxP) * 22, -22, 22);
  g.momento = Math.round(clampNum(g.momento + shift, -100, 100));

  const pressao = clampNum((pRival - pJog) / maxP, 0, 1); // quão atrás estou (0..1)

  // 5) Baixas/atrito da tropa (ferimentos frequentes; morte permanente rara).
  let mortosHoje = 0;
  let feridosHoje = 0;
  tropa.forEach((n) => {
    let fad = getRandomInt(5, 12);
    if (!suprido) fad += 6;
    n.fadiga = Math.min(100, n.fadiga + fad);
    if (!suprido) n.sanidade = Math.max(0, n.sanidade - 4);

    const chanceFerida = clampNum(0.06 + pressao * 0.32 + (suprido ? 0 : 0.05), 0.02, 0.55);
    if (Math.random() < chanceFerida) {
      n.fadiga = Math.min(100, n.fadiga + getRandomInt(12, 22));
      n.sanidade = Math.max(0, n.sanidade - getRandomInt(4, 10));
      g.feridosJogador += 1;
      feridosHoje += 1;
    }

    let chanceMorte = clampNum(0.01 + pressao * 0.05 + (suprido ? 0 : 0.015), 0.004, 0.07);
    if (n.habilidade === 'guardiao') chanceMorte *= 0.6; // defensivo resiste melhor
    if (Math.random() < chanceMorte) {
      n.vivo = false;
      n.emGuerra = false;
      n.posto = null;
      g.baixasJogador += 1;
      mortosHoje += 1;
      draft.moral = Math.max(0, draft.moral - 4);
    }
  });

  // 6) Dano ao rival (proporcional à dominância do jogador no dia).
  const dominancia = clampNum(pJog / (pRival + 1), 0.25, 3);
  const dano = clampNum(dominancia * 0.055, 0.01, 0.18) * (suprido ? 1 : 0.6);
  g.rivalIntegridade = Math.max(0, g.rivalIntegridade - dano);
  g.baixasRival = Math.round((1 - g.rivalIntegridade) * Math.max(4, g.rival.populacao));

  // 7) Relato do dia (UI) + log conciso apenas em dias notáveis.
  const tend = g.momento > 15 ? 'avançamos' : g.momento < -15 ? 'recuamos' : 'impasse';
  g.ultimoRelato =
    `Dia ${g.diasDecorridos}/${g.duracao}: ${tend}` +
    (suprido ? '' : ' — SEM SUPRIMENTO') +
    (mortosHoje ? ` — ${mortosHoje} caíram` : feridosHoje ? ` — ${feridosHoje} feridos` : '');

  if (mortosHoje > 0) {
    logs.push({
      tipo: 'morte',
      mensagem: `GUERRA vs ${g.rival.nome}: ${mortosHoje} morador(es) tombaram no front (dia ${g.diasDecorridos}/${g.duracao}).`,
    });
  } else if (!suprido) {
    logs.push({
      tipo: 'alerta',
      mensagem: `GUERRA vs ${g.rival.nome}: suprimento rompido no dia ${g.diasDecorridos}/${g.duracao}.`,
    });
  }

  // 8) Condições de término.
  const tropaViva = draft.npcs.filter((n) => g.tropaIds.includes(n.id) && n.vivo);
  if (g.rivalIntegridade <= 0) {
    logs.push(...resolverGuerra(draft, 'exercito_rival_quebrado'));
  } else if (tropaViva.length === 0) {
    logs.push(...resolverGuerra(draft, 'colapso'));
  } else if (g.diasDecorridos >= g.duracao) {
    logs.push(...resolverGuerra(draft, 'prazo'));
  }

  return logs;
}

// ─── EXPLORAÇÃO AUTÔNOMA ──────────────────────────────────────────────────────
// NPCs de combate ociosos e descansados exploram o último andar conquistado
// automaticamente quando o jogador não está ativo. Loot reduzido (60%) para
// incentivar a gestão ativa. Mortalidade também reduzida (50% do normal).
// Retorna entradas de log — o caller (processDay) chama addLog em cada uma.
export function autoExplorar(draft: GameState): { tipo: LogTipo; mensagem: string }[] {
  if (draft.andarAtual < 2) return [];

  // Apenas NPCs verdadeiramente ociosos: sem posto de trabalho, sem compromisso externo.
  const aptos = draft.npcs.filter(n =>
    n.vivo && !n.emExpedicao && !n.emGuerra && !n.emprestado && !n.reforco
    && n.posto === null   // não está trabalhando em nenhum edifício
    && n.fadiga < 50
    && (getProfissao(n) === 'combatente' || getProfissao(n) === 'batedor' || getProfissao(n) === 'sentinela'),
  );
  if (aptos.length < 2) return [];

  // Limita a 4 NPCs no máximo por auto-expedição para reduzir consumo passivo de comida.
  const grupo = aptos.slice(0, 4);

  const targetFloor = draft.andarAtual - 1;
  const floorData = FLOORS[targetFloor - 1];
  if (!floorData) return [];

  const ef = getEfeitos(draft.edificios, draft.npcs);
  const cap = ef.capacidadeArmazem;
  const cost = calcCustoExpedicao(grupo.length, floorData.tier);
  if (draft.recursos.comida < cost) return [];

  draft.recursos.comida -= cost;

  const basePower = grupo.reduce((s, n) => s + calcNpcPower(n), 0);
  const biomaMultiplier = calcBiomaMultiplier(grupo, floorData.bioma);
  const groupPower = basePower * (1 + ef.poderBonus) * biomaMultiplier;
  const isVictory = groupPower >= floorData.difficulty;

  const logs: { tipo: LogTipo; mensagem: string }[] = [];
  const r = calcRecompensaAndar(floorData.floor, floorData.bioma);
  const batedores = grupo.filter(n => getProfissao(n) === 'batedor').length;
  const lootMult = 0.60 * (1 + batedores * 0.12);

  if (isVictory) {
    const comidaG  = Math.round(r.comida  * lootMult);
    const madeiraG = Math.round(r.madeira * lootMult);
    const pedraG   = Math.round(r.pedra   * lootMult);
    const ferroG   = r.ferro ? Math.round(r.ferro * lootMult) : 0;
    draft.recursos.comida  = Math.min(cap, draft.recursos.comida  + comidaG);
    draft.recursos.madeira = Math.min(cap, draft.recursos.madeira + madeiraG);
    draft.recursos.pedra   = Math.min(cap, draft.recursos.pedra   + pedraG);
    if (ferroG) draft.recursos.ferro = Math.min(cap, draft.recursos.ferro + ferroG);
    logs.push({
      tipo: 'info',
      mensagem: `[Autônomo] ${floorData.nome} (andar ${floorData.floor}): +${comidaG} comida, +${madeiraG} madeira, +${pedraG} pedra${ferroG ? `, +${ferroG} ferro` : ''}.`,
    });
  } else {
    const consolaMadeira = Math.round(r.madeira * 0.15);
    const consolaPedra   = Math.round(r.pedra   * 0.15);
    draft.recursos.madeira = Math.min(cap, draft.recursos.madeira + consolaMadeira);
    draft.recursos.pedra   = Math.min(cap, draft.recursos.pedra   + consolaPedra);
    logs.push({ tipo: 'info', mensagem: `[Autônomo] Andar ${floorData.floor}: grupo voltou de mãos quase vazias — poder insuficiente.` });
  }

  grupo.forEach(n => {
    const mortChance = (Math.max(0, floorData.mortality) * 0.5) / 100;
    if (Math.random() < mortChance) {
      n.vivo = false; n.posto = null;
      draft.moral = Math.max(0, draft.moral - 3);
      logs.push({ tipo: 'morte', mensagem: `${n.nome} não voltou da exploração autônoma — andar ${floorData.floor}.` });
    } else {
      n.fadiga = Math.min(100, n.fadiga + getRandomInt(10, 18));
    }
  });

  return logs;
}
