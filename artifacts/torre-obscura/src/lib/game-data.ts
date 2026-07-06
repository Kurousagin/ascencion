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

export type Raridade = 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Lendário' | 'Divino';

// ─── PASSIVAS (Vestígios) ─────────────────────────────────────────────────────
// Cada vestígio carrega uma passiva única que afeta as expedições enquanto vivo.

export type PassivaId = 'veterano_das_profundezas' | 'leitura_da_torre' | 'rastro_vivo';

export interface Passiva {
  nome: string;
  descricao: string;
}

export const PASSIVAS: Record<PassivaId, Passiva> = {
  veterano_das_profundezas: {
    nome: 'Veterano das Profundezas',
    descricao: 'Mortalidade de todos no grupo reduzida em 30% em expedições.',
  },
  leitura_da_torre: {
    nome: 'Leitura da Torre',
    descricao: '+20% loot quando no grupo de expedição.',
  },
  rastro_vivo: {
    nome: 'Rastro Vivo',
    descricao: 'Sussurros da Torre +15pp de chance. Câmaras Ocultas +20pp quando no grupo.',
  },
};

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
  // ─── Lançamento de temporada ─────────────────────────────────────────────────
  // true = NPC especial de lançamento. Imune à morte por inanição; chance de morte
  // em expedições reduzida a 1/10 do normal. Praticamente imortal.
  lancamento?: boolean;
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
  // ─── Reforço de guerra (aliança ajuda guerra) ────────────────────────────────
  // Presentes apenas em moradores enviados especificamente para lutar na guerra
  // da aliada (distinto de `reforco`, que é para UMA expedição).
  reforcoGuerra?: boolean;         // true = veio para ajudar na guerra da aliada
  reforcoGuerraConcluido?: boolean; // true = a guerra em que lutava terminou, aguarda retorno
  // ─── Guerra entre cidadelas ──────────────────────────────────────────────
  // true = morador foi mobilizado para o front. Fica indisponível para torre,
  // trabalho, empréstimo e reforço até a guerra terminar.
  emGuerra?: boolean;
  // ─── Recuperação primordial ───────────────────────────────────────────────
  // Apenas para NPCs primordiais (lancamento=true). Rastreia quantos níveis de
  // recuperação de memória foram aplicados; cada nível aumenta atributos em-lugar.
  primordialNivel?: number;
  // ─── Vestígio ─────────────────────────────────────────────────────────────
  // true = NPC excepcional de lançamento com passiva única. Mortal — pode morrer
  // em expedições. A passiva permanece ativa enquanto ele estiver vivo e no grupo.
  vestigio?: boolean;
  passivaId?: PassivaId;
}

// Campos base do NPC transportados na rede (sem os marcadores locais de empréstimo/reforço).
export type MoradorBase = Omit<NPC, 'emprestado' | 'emprestadoAte' | 'donoNome' | 'origemExchangeId' | 'reforco' | 'reforcoConcluido' | 'reforcoGuerra' | 'reforcoGuerraConcluido'>;

// Remove marcadores locais antes de trafegar o morador pela rede.
export function moradorBase(npc: NPC): MoradorBase {
  const {
    emprestado: _e, emprestadoAte: _a, donoNome: _d, origemExchangeId: _o,
    reforco: _r, reforcoConcluido: _rc,
    reforcoGuerra: _rg, reforcoGuerraConcluido: _rgc,
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
// Reforço-de-guerra é elegível (é específico para guerra), mas reforço-de-expedição não.
export function podeGuerrear(npc: NPC): boolean {
  return npc.vivo && !npc.emExpedicao && !npc.emprestado && (!npc.reforco || !!npc.reforcoGuerra) && !npc.emGuerra;
}

export type EdificioTipo = 'Fogueira' | 'Fazenda' | 'Enfermaria' | 'Quartel' | 'Templo' | 'Armazem' | 'Alojamento' | 'Arquivo' | 'Mirante';

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
  Arquivo: 'erudito',
  Mirante: 'batedor',
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
export type HabitanteEstado = 'oculto' | 'descoberto' | 'quest_ativa' | 'aguardando_escolha' | 'concluido';

// Uma escolha ramificada opcional oferecida ao concluir a quest. Retrocompatível:
// quests sem `escolha` concluem direto como antes.
export interface HabitanteEscolhaOpcao {
  id: 'a' | 'b';
  label: string;         // texto curto do botão
  descricao: string;     // custo/ganho, mostrado antes de confirmar
  custo?: Partial<{ moral: number; comida: number; madeira: number; pedra: number; ferro: number }>;
  recursosBonus?: Partial<Record<'comida' | 'madeira' | 'pedra' | 'ferro', number>>;
  moralBonus?: number;
  reliquia?: string;      // mesmo inventário de relíquias das Quests Ocultas
  falaResultado: string;  // substitui falaConcluso quando esta opção foi escolhida
}

export interface HabitanteEscolha {
  prompt: string;                              // framing do dilema
  opcoes: [HabitanteEscolhaOpcao, HabitanteEscolhaOpcao];
}

export interface HabitanteQuest {
  tipo: QuestTipo;
  descricaoObj: string;                // objetivo exibido na UI
  // recurso (tipo='recurso'): ter X de um tipo (pode ter até dois recursos exigidos)
  // expedicao: ter NPCs dessas profissões vivos na cidadela
  profissoes?: ProfissaoId[];
  npcsMinCombate?: number;             // mínimo de NPCs de combate vivos (floor 12)
  andarMin?: number;                   // player deve ter conquistado pelo menos este andar
  farmsMin?: { andar: number; vezes: number }; // mínimo de farms vitoriosos no andar (extração comprovada)
  // expedicao pode ter recursos adicionais (quest mista profissão + recurso)
  recurso?: { tipo: 'comida' | 'madeira' | 'pedra' | 'ferro'; qtd: number };
  recurso2?: { tipo: 'comida' | 'madeira' | 'pedra' | 'ferro'; qtd: number };
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
  escolha?: HabitanteEscolha;          // escolha ramificada opcional (retrocompatível)
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
    falamissão: 'Dois Batedores — um segue o símbolo de entrega, o outro confirma que o encontrado chega de volta. Nenhum pode ir sozinho. E precisam ter chegado ao Andar 5.',
    falaConcluso: 'A mensagem foi entregue. O destinatário era você. Desde o início.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 2 Batedores e conquistar o Andar 5',
      profissoes: ['batedor', 'batedor'], andarMin: 5,
      ecoBonus: 20, moralBonus: 5,
      lore: 'A mensagem que nunca chegou era uma ordem para abrir o selo — não para mantê-lo. Alguém a interceptou antes do destinatário a receber. Esse alguém ainda está aqui.',
      recompensaDesc: '+20% loot neste andar · +5 Moral',
      escolha: {
        prompt: 'A mensagem revelada ou guardada?',
        opcoes: [
          { id: 'a' as const, label: 'Revelar', descricao: '+5 Moral', moralBonus: 5, falaResultado: 'Revelada. O peso é compartilhado.' },
          { id: 'b' as const, label: 'Guardar', descricao: "Relíquia \"Mensagem Selada\"", reliquia: 'Mensagem Selada', falaResultado: 'Segredo mantido. Arauto assente.' },
        ],
      },
    },
  },
  2: {
    floor: 2, nome: 'Eco dos Construtores', papel: 'Memória Coletiva', icone: '⚒️',
    fala: 'Somos muitos em um. Escavamos este lugar sabendo que nunca sairíamos. Dê-nos pedra — para que possamos lembrar o peso do que construímos.',
    falamissão: 'Pedra deste andar — extraída daqui, não carregada de longe. Somos memória deste lugar específico. Volte mais de uma vez. Prove que este andar importa além de passagem.',
    falaConcluso: 'Agora lembramos tudo. O que construímos. Por que construímos. E quem nos mentiu sobre o propósito.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 2 ao menos 3 vezes e ter 45 pedra',
      recurso: { tipo: 'pedra', qtd: 45 }, farmsMin: { andar: 2, vezes: 3 },
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
    falaConcluso: 'Você é real. O cristal comparou sua frequência com a de 4.312 visitantes anteriores. Você é o primeiro que chegou a este ponto sem perder algo fundamental. Mas isso levanta uma questão que o cristal não consegue resolver sozinho: o que você é, afinal?',
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 28 dias após descobrir o Cristal',
      dias: 28,
      ecoBonus: 25, recursosBonus: { ferro: 10 },
      lore: 'O cristal gravou cada palavra dita na Torre. A palavra mais repetida não é "ajuda". É "espera". O cristal ainda espera que alguém entenda por quê.',
      recompensaDesc: '+25% loot neste andar · +10 Ferro',
    },
  },
  5: {
    floor: 5, nome: 'Âncora do Primeiro Ciclo', papel: 'Fundação Consciente', icone: '⚓',
    fala: 'Não sou um ser que a Torre absorveu. Sou o que o Fundador plantou aqui deliberadamente — um fragmento de intenção original, cristalizado na pedra no momento exato em que a construção cruzou este ponto. Minha função: lembrar a Torre do que ela foi projetada para ser. A Torre ouve. Mas ouvir não é obedecer. Preciso de tempo para verificar se você ainda carrega intenção genuína — ou se a Torre já começou a substituí-la.',
    falamissão: 'Quinze dias. O tempo que o Fundador estimou ser necessário para que a Torre não consiga imitar o propósito de alguém que ainda o possui. Se ao final você ainda for você mesmo, acreditarei no que diz ser.',
    falaConcluso: 'Quinze dias e sua intenção permaneceu intacta. Isso é raro. Os outros perderam algo antes de chegar aqui — uma fatia de memória sobre por que estavam subindo. Você ainda a tem. Guarde esse "ainda" com cuidado. A Torre está apenas começando a atentar.',
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 15 dias desde a descoberta',
      dias: 15,
      ecoBonus: 22, moralBonus: 10,
      lore: 'O Fundador sabia que a entidade tentaria corromper o propósito da Torre antes que a construção terminasse. Por isso plantou âncoras — fragmentos de intenção original — a cada cinco andares. Esta foi a primeira. Sua função: lembrar a Torre do que ela deveria ser. A entidade aprendeu, com o tempo, a fazer a Torre ouvir a Âncora sem obedecer. O Fundador não previu isso. Ou previu, e concluiu que não havia alternativa melhor do que tentar mesmo assim.',
      recompensaDesc: '+22% loot neste andar · +10 Moral',
    },
  },
  6: {
    floor: 6, nome: 'Sentinela Sem Nome', papel: 'Guardião Perdido', icone: '🗿',
    fala: 'Última ordem recebida: não deixar ninguém passar. A autoridade que a deu não existe mais. Mas a ordem existe. Se você pode provar que tem força suficiente para disputar passagem, posso reconhecer sua autoridade em substituição.',
    falamissão: 'Dois combatentes — não um. Autoridade militar legítima exige hierarquia, não bravura individual. E demonstração do Andar 10 como prova de alcance real.',
    falaConcluso: 'Autoridade reconhecida. Nova ordem registrada: facilitar passagem dos que chegam com propósito. O que é propósito? Ainda estou processando.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 2 Combatentes e conquistar o Andar 10',
      profissoes: ['combatente', 'combatente'], andarMin: 10,
      ecoBonus: 25, recursosBonus: { madeira: 10 },
      lore: 'Sua última ordem era "não deixes ninguém passar" — mas não especificou em qual direção. A Sentinela cumpre ordens de uma autoridade que a Torre corroeu. Ainda aguarda a contraordem.',
      recompensaDesc: '+25% loot neste andar · +10 Madeira',
    },
  },
  7: {
    floor: 7, nome: 'Jardineira Esquecida', papel: 'Curadora do Impossível', icone: '🌿',
    fala: 'Curo com o que a Torre me dá, mas a Torre não dá comida — dá crescimento. Crescimento sem nutrição. Traga-me algo do mundo exterior. Lembro do que comida real era.',
    falamissão: 'Comida trazida de expedições neste andar — não do armazém em repouso. Consigo sentir a diferença: carregada pelas mãos de quem esteve aqui tem outra textura. Volte mais de uma vez.',
    falaConcluso: 'Lembro. A diferença entre crescer e ser nutrido. Obrigada por trazer a memória de volta junto com a comida.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 7 ao menos 3 vezes e ter 55 comida',
      recurso: { tipo: 'comida', qtd: 55 }, farmsMin: { andar: 7, vezes: 3 },
      ecoBonus: 25, moralBonus: 8,
      lore: 'Ela ainda cura. Tudo que toca cresce de volta — diferente. Mais parecido com a Torre do que com o que era antes. Mas ela luta contra isso todo dia. E até agora, está vencendo.',
      recompensaDesc: '+25% loot neste andar · +8 Moral',
    },
  },
  8: {
    floor: 8, nome: 'Estudioso do Infinito', papel: 'Arquivista Exilado', icone: '📚',
    fala: 'Cataloguei cada manuscrito nesta biblioteca. Cada um, exceto um. Escrito em ferro. Não é um idioma que reconheço — mas reconheço os nomes. Se você trouxer ferro puro, posso terminar a tradução.',
    falamissão: 'Ferro extraído das profundezas deste andar — não fundido lá embaixo e carregado até aqui. O que vem daqui tem impurezas específicas que preciso para a tradução. Explore aqui de verdade.',
    falaConcluso: 'Tradução concluída. Era uma lista de nomes. O último nome era o meu. Penúltimo... era o seu.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 8 ao menos 3 vezes e ter 30 ferro',
      recurso: { tipo: 'ferro', qtd: 30 }, farmsMin: { andar: 8, vezes: 3 },
      ecoBonus: 30, recursosBonus: { pedra: 15 },
      lore: 'O único livro que ele não conseguia ler estava escrito em ferro. Não era um idioma — era uma lista de nomes de todos que chegariam ao ápice. Seu nome estava lá antes de você nascer.',
      recompensaDesc: '+30% loot neste andar · +15 Pedra',
    },
  },
  9: {
    floor: 9, nome: 'Ferreiro Espectral', papel: 'Forjador das Correntes', icone: '🔥',
    fala: 'Forjei as correntes que prendem a entidade no ápice. Elas ainda seguram — mas ficam um pouco menores cada vez que alguém conquista um andar. Precisaria de ferro real para reforçá-las. Se você se importa com isso.',
    falamissão: 'Ferro extraído repetidamente deste andar — as correntes distinguem ferro de expedição de ferro parado em armazém. Quatro vezes ao menos. O que vem de esforço constante tem outra têmpera.',
    falaConcluso: 'Reforçadas. Por enquanto. Mas você vai continuar subindo, não vai? E as correntes vão continuar diminuindo. Eu sei. Apenas... saiba o que está desfazendo.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 9 ao menos 4 vezes e ter 40 ferro',
      recurso: { tipo: 'ferro', qtd: 40 }, farmsMin: { andar: 9, vezes: 4 },
      ecoBonus: 30, recursosBonus: { ferro: 15 },
      lore: 'Ele forjou as correntes que prendem a entidade. Elas ainda seguram. Mas ficam um pouco menores a cada andar conquistado. O Ferreiro sabe. E forja assim mesmo, porque é tudo que sabe fazer.',
      recompensaDesc: '+30% loot neste andar · +15 Ferro',
    },
  },
  10: {
    floor: 10, nome: 'Memória da Construção', papel: 'Arquivo do Processo', icone: '🏛️',
    fala: 'Estive presente quando o Fundador construiu este andar específico. Não como trabalhador — como resistência. A Torre não queria ser construída aqui. O Fundador forçou. Guardo o registro desse conflito e do método que ele usou para vencer. Mas o registro exige capacidade intelectual para ser extraído — e exige que você continue subindo. Não me interessa testemunhar quem para.',
    falamissão: 'Traga um Erudito capaz de interpretar estruturas de intenção — e demonstre que avançou ao menos até o décimo segundo andar. Preciso saber que o que aconteceu aqui não será a última resistência que você enfrenta.',
    falaConcluso: 'O Erudito extraiu o que guardo. A Torre foi vencida aqui uma vez — pelo Fundador, pelo método que ele usou. Esse método não foi força. Foi outra coisa. O Erudito sabe agora, ou aprenderá com o que copiou. Uma Torre que foi vencida uma vez pode ser vencida de novo. O que importa é saber qual método usar.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter um Erudito e conquistar o Andar 12',
      profissoes: ['erudito'], andarMin: 12,
      ecoBonus: 28, recursosBonus: { ferro: 15, pedra: 10 },
      lore: 'O décimo andar foi o mais difícil de construir. A pedra recusava-se a assentar — não por instabilidade geológica, mas por resistência da estrutura. O Fundador não usou força: repetiu o propósito original em voz alta por quarenta dias consecutivos até que a Torre cedesse. A Memória guarda essas palavras exatas. O Erudito as copiou — mas ainda não sabe o que são, ou quando será necessário usá-las. O momento de entender está mais adiante.',
      recompensaDesc: '+28% loot neste andar · +15 Ferro +10 Pedra',
    },
  },
  11: {
    floor: 11, nome: 'Afogado Lúcido', papel: 'Transformado Consciente', icone: '💧',
    fala: 'Não estou morrendo. Estou sendo preenchido. Há uma diferença — insisto que há. Se você ficar tempo suficiente, verá que continuo sendo eu mesmo. Isso é o que me separa dos outros.',
    falamissão: 'Permaneça. Observe. Veja que ainda sou eu. Que a consciência sobrevive mesmo quando o corpo muda.',
    falaConcluso: 'Você ficou. E viu. Guardarei isso — a memória de alguém que olhou e não fugiu. É o que me mantém eu mesmo.',
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 18 dias após descobri-lo',
      dias: 18,
      ecoBonus: 30, moralBonus: 8,
      lore: 'Ele não está morrendo. Está sendo preenchido pela Torre lentamente. E permanece consciente durante todo o processo. Há uma diferença entre transformação e morte. Ele é a prova.',
      recompensaDesc: '+30% loot neste andar · +8 Moral',
      escolha: {
        prompt: 'A mensagem revelada ou guardada?',
        opcoes: [
          { id: 'a' as const, label: 'Revelar', descricao: '+5 Moral', moralBonus: 5, falaResultado: 'Revelada. Peso compartilhado.' },
          { id: 'b' as const, label: 'Guardar', descricao: "Relíquia \"Mensagem Selada\"", reliquia: 'Mensagem Selada', falaResultado: 'Segredo mantido.' },
        ],
      },
    },
  },
  12: {
    floor: 12, nome: 'Percussão Profunda', papel: 'Pulso da Torre', icone: '🥁',
    fala: 'Não sou um ser. Sou o ritmo. O pulso do que você está dentro. Para sincronizar comigo, você precisa de um grupo suficientemente numeroso — a vibração de muitos corpos em um só lugar.',
    falamissão: 'Mais. A vibração de muitos. Três ao menos — e pedra. O ritmo exige peso e presença simultâneos.',
    falaConcluso: 'Sincronizado. O minério deste andar vibra na mesma frequência agora. Será mais fácil extraí-lo. Ou mais assustador. Depende de como você ouve o ritmo.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 3+ NPCs de combate vivos e 50 pedra',
      npcsMinCombate: 3, recurso: { tipo: 'pedra', qtd: 50 },
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
    falamissão: 'Um combatente e um sentinela — e prova de que chegaram ao décimo oitavo andar. Os dois pilares de qualquer força que resiste até o fim.',
    falaConcluso: 'Cidadela reconhecida como aliada. Para que conste no registro: Ardenas afundou 4.000 andares abaixo do andar 1 quando a Torre cresceu. Mas a aliança permanece válida.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter Combatente + Sentinela e conquistar o Andar 18',
      profissoes: ['combatente', 'sentinela'], andarMin: 18,
      ecoBonus: 35, recursosBonus: { ferro: 20 },
      lore: 'A cidadela que ele protegia afundou 4.000 andares abaixo do andar 1 quando a Torre cresceu. Ele ainda protege uma posição acima de algo que não existe mais. E faz isso perfeitamente.',
      recompensaDesc: '+35% loot neste andar · +20 Ferro',
    },
  },
  15: {
    floor: 15, nome: 'Vigia do Penúltimo Ciclo', papel: 'Preparador do Que Vem Depois', icone: '🗼',
    fala: 'Estou aqui para preparar quem chega ao vigésimo andar com intenção real. O vigésimo andar não tem um guardião de força — tem algo que o Fundador deixou como teste de propósito. Quem chega sem ter sacrificado algo genuíno não compreende o que encontra. Quem sacrifica pode escolher. A Torre reconhece quem pagou e quem não pagou — e trata os dois de formas muito diferentes.',
    falamissão: 'Dezoito pontos de Moral. Não como punição — como evidência de que você tem algo real a perder. Apenas quem tem algo a perder pode verdadeiramente escolher.',
    falaConcluso: 'O que você deu era real. Isso significa que você pode compreender o que o vigésimo andar oferece. Não direi o que é — a escolha precisa ser sua, sem minha interpretação. Direi apenas o que o Fundador deixou escrito antes de entrar: "Não construí uma barreira no vigésimo andar. Construí uma pergunta."',
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 18 de Moral (custo imediato ao aceitar)',
      custo: { moral: 18 },
      ecoBonus: 32, moralBonus: 20,
      lore: 'O vigésimo andar contém uma pergunta que o Fundador formulou antes de morrer — não de velhice, mas de escolha deliberada. Ele entrou no vigésimo andar sabendo que não sairia, porque a pergunta que deixou ali só pode ser respondida por alguém que ainda não fez a escolha que ele fez. A resposta errada não mata. A resposta certa transforma — mas o Vigia nunca disse em quê.',
      recompensaDesc: '+32% loot neste andar · +20 Moral (retorno)',
    },
  },
  16: {
    floor: 16, nome: 'Eco Faminto', papel: 'Apetite da Entidade', icone: '🌀',
    fala: 'Não sou ela. Sou o que ela perdeu quando aprendeu a ser paciente. Seu apetite. Dê-me comida e mostro o caminho pelo abismo sem que ele me use para te consumir no processo.',
    falamissão: 'Comida em quantidade — mas trazida de expedições aqui. O apetite distingue comida de expedição de comida de armazém parado: a diferença entre ser nutrido e ser distraído. Três vezes aqui, ao menos.',
    falaConcluso: 'Satisfeito. Por um momento. O apetite voltará — sempre volta. Mas agora você passou e ele estava distraído. Use isso.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 16 ao menos 3 vezes e ter 70 comida',
      recurso: { tipo: 'comida', qtd: 70 }, farmsMin: { andar: 16, vezes: 3 },
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
      tipo: 'temporal', descricaoObj: 'Sobreviver 25 dias após encontrá-lo',
      dias: 25,
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
      tipo: 'recurso', descricaoObj: 'Trazer 55 ferro e 55 pedra',
      recurso: { tipo: 'ferro', qtd: 55 },
      recurso2: { tipo: 'pedra', qtd: 55 },
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
      tipo: 'temporal', descricaoObj: 'Sobreviver 10 dias sem entrar em guerra',
      dias: 10, semGuerra: true,
      ecoBonus: 35, moralBonus: 15,
      lore: 'O silêncio que você ouve não é ausência de som. É a entidade respirando devagar para não assustar a presa antes do momento certo. O Susurro é essa respiração. E ele te avisou.',
      recompensaDesc: '+35% loot neste andar · +15 Moral',
      escolha: {
        prompt: 'Forjar arma ou guardar ferro?',
        opcoes: [
          { id: 'a' as const, label: 'Forjar', descricao: '+20% poder', falaResultado: 'Promessa.' },
          { id: 'b' as const, label: 'Guardar', descricao: '+20 Ferro, Relíquia', recursosBonus: { ferro: 20 }, reliquia: 'Ferro', falaResultado: 'Potencial.' },
        ],
      },
    },
  },

  // ─── TEMPORADA 2 — O Intervalo (andares 21–40) ──────────────────────────────
  21: {
    floor: 21, nome: 'Vestígio da Voz', papel: 'Memória que Reconhece', icone: '👁️',
    fala: 'Eu sei quem você é. Não de antes — de depois. A memória aqui não segue a direção do tempo. Preciso que me traga um Batedor. Alguém que entenda como rastrear o que ainda não aconteceu.',
    falamissão: 'Um futuro exige dois leitores — um para seguir a direção, outro para confirmar que a leitura não é ilusão. Dois Batedores, e que chegaram ao Andar 26.',
    falaConcluso: 'Os Batedores leram o rastro. Não disseram o que viram. Apenas confirmaram que eu estava certo em reconhecer você. Cuide-se — o que vem a seguir te lembra de algo que você ainda não viveu.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 2 Batedores e conquistar o Andar 26',
      profissoes: ['batedor', 'batedor'], andarMin: 26,
      ecoBonus: 20, moralBonus: 8,
      lore: 'O Vestígio existe na memória de um momento que ainda não aconteceu. Ele te reconheceu porque já te viu chegar — de um futuro que pode ou não se tornar real. O rastro que o Batedor leu não era do passado. Era uma possibilidade.',
      recompensaDesc: '+20% loot neste andar · +8 Moral',
      escolha: {
        prompt: 'Seguir vestígio ou registrar?',
        opcoes: [
          { id: 'a' as const, label: 'Seguir', descricao: 'Batedor indisponível 5d, +20% Eco', falaResultado: 'Viu antes.' },
          { id: 'b' as const, label: 'Registrar', descricao: '+15% Eco', falaResultado: 'Seguro.' },
        ],
      },
    },
  },
  22: {
    floor: 22, nome: 'Fragmento Coletivo', papel: 'Eco dos Que Construíram', icone: '⚒️',
    fala: 'Somos o que sobrou depois que o Eco dos Construtores lá embaixo ficou para trás. A memória mais bruta — antes de ganhar forma, antes de ter palavras. Dê-nos ferro. Para sentirmos o peso do que seguramos antes de ser pedra.',
    falamissão: 'Ferro deste andar — não de qualquer fonte. O peso que segurávamos vinha daqui especificamente. Explore aqui repetidamente. O Fragmento sente a origem do que é trazido.',
    falaConcluso: 'O ferro faz sentido. Agora lembramos o que era antes de ser lembrança. Havia intenção primeiro. Depois veio a pedra. A ordem importa mais do que qualquer um nos disse.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 22 ao menos 4 vezes e ter 85 ferro',
      recurso: { tipo: 'ferro', qtd: 85 }, farmsMin: { andar: 22, vezes: 4 },
      ecoBonus: 25, recursosBonus: { ferro: 20 },
      lore: 'O Fragmento Coletivo é a memória dos Construtores antes de terem linguagem — pura intenção, puro peso. Eles não sabiam o que construíam. Sabiam apenas que precisavam construir. A razão chegou depois, quando já era tarde para mudar a direção.',
      recompensaDesc: '+25% loot neste andar · +20 Ferro',
    },
  },
  23: {
    floor: 23, nome: 'Guardião da Memória Fixa', papel: 'Preservador do Instante', icone: '🕯️',
    fala: 'Guardo um único momento. Um instante específico que não pode ser esquecido — se esquecer, algo fundamental se desfaz. Não preciso que faça nada heroico. Preciso apenas que permaneça. Que testemunhe junto comigo.',
    falamissão: 'Permaneça. Testemunhe. O momento precisa de uma segunda consciência para se manter real.',
    falaConcluso: 'O momento persistiu. Com duas consciências a sustentá-lo, ficou mais sólido do que estava há séculos. Obrigado. O que eu guardo não posso revelar — mas você sentiu, não sentiu? Algo se acomodou no lugar certo.',
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 18 dias após encontrá-lo',
      dias: 18,
      ecoBonus: 22, recursosBonus: { pedra: 25 },
      lore: 'O Guardião preserva o instante em que a Torre escolheu ser o que é em vez do que deveria ser. Esse momento é frágil — sem testemunha, dissolve-se. Com uma, permanece. Você foi a primeira testemunha nova em muito tempo.',
      recompensaDesc: '+22% loot neste andar · +25 Pedra',
    },
  },
  24: {
    floor: 24, nome: 'O Que Viu Antes', papel: 'Testemunha do Início', icone: '🪨',
    fala: 'Eu vi o que havia antes do Andar 1. Não vou falar sobre isso. O preço de saber é alto demais — e você não está pronto. Mas posso te mostrar que havia algo, se você pagar o custo de entender que algumas perguntas mudam quem pergunta.',
    falamissão: 'O custo é interno. Não é recurso — é disposição. Sacrifique algo de si mesmo para ouvir o silêncio do que eu testemunhei.',
    falaConcluso: 'Você pagou. Não vou dizer o que havia antes — mas sinta: algo em você agora sabe que a pergunta existia antes da Torre. E que a Torre foi a resposta para algo que ninguém devia ter perguntado.',
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 20 de Moral (custo imediato)',
      custo: { moral: 20 },
      ecoBonus: 28, moralBonus: 20,
      lore: 'A Testemunha viu o que havia antes do primeiro andar. Não fala sobre isso — não porque não possa, mas porque as palavras para descrever o que viu ainda não existem. O que você sentiu ao pagar o custo era a borda do que ela carrega sozinha.',
      recompensaDesc: '+28% loot neste andar · +20 Moral (retorno)',
    },
  },
  26: {
    floor: 26, nome: 'Eco da Expedição Perdida', papel: 'Memória de Quem Não Voltou', icone: '🗺️',
    fala: 'Somos o eco de um grupo que desceu até aqui e não conseguiu subir de volta. Não morremos — ficamos. A Torre não nos deixou partir. Se você tem combatentes suficientes, talvez consiga o que nós não conseguimos: força em número.',
    falamissão: 'Combatentes. E batedores. E prova de que chegaram além do que nós chegamos — Andar 30. É o que nossa expedição não conseguiu alcançar.',
    falaConcluso: 'Você tem o que nós não tínhamos. Use isso. E quando chegar ao topo — se chegar — lembre que passamos por aqui primeiro. Não como aviso. Como encorajamento.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter Combatente + Batedor e conquistar o Andar 30',
      profissoes: ['combatente', 'batedor'], andarMin: 30,
      ecoBonus: 25, recursosBonus: { madeira: 30 },
      lore: 'A expedição que se tornou este eco tinha dezessete membros. Desceram com provisões para quarenta dias. A Torre os deixou descer. Não os deixou subir. O Eco não sabe por quê — apenas que, quando tentaram, as escadas haviam mudado de lugar.',
      recompensaDesc: '+25% loot neste andar · +30 Madeira',
    },
  },
  27: {
    floor: 27, nome: 'Memória do Traidor', papel: 'Eco de uma Decisão', icone: '🗡️',
    fala: 'Fui um Construtor. E fiz algo que os outros não fizeram: concordei com o que encontramos aqui. Troquei nosso propósito pelo que a Torre prometeu. Os outros chamaram de traição. Eu chamei de entendimento. Traga-me madeira — o material dos que constroem para os outros.',
    falamissão: 'Madeira deste andar — não carregada de baixo. A memória do que construímos vem daqui. Quatro expedições no mínimo. O que vem de trabalho constante carrega a intenção que buscamos.',
    falaConcluso: 'A madeira confirma minha teoria: você também está aqui por uma razão que não é completamente sua. Isso não te faz traidor. Te faz o tipo de pessoa que a Torre consegue trabalhar. Como eu. Não é insulto — é observação.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 27 ao menos 4 vezes e ter 100 madeira',
      recurso: { tipo: 'madeira', qtd: 100 }, farmsMin: { andar: 27, vezes: 4 },
      ecoBonus: 25, recursosBonus: { madeira: 25 },
      lore: 'O Construtor que traiu não vendeu os outros por fraqueza. Entendeu algo que eles não conseguiram: a Torre não era inimiga. Era uma oportunidade que exigia um preço que os outros não estavam dispostos a pagar. Ele pagou. E ficou aqui, como memória, como prova de que entendeu.',
      recompensaDesc: '+25% loot neste andar · +25 Madeira',
    },
  },
  28: {
    floor: 28, nome: 'Oráculo do Propósito', papel: 'Vidente do Destino da Torre', icone: '🔭',
    fala: 'Não vejo seu futuro. Vejo o futuro da Torre. E a Torre tem um. Termina de uma forma específica que depende de quem chega ao topo e do que traz consigo. Aguarde doze dias aqui — deixe-me observar o que você carrega sem saber.',
    falamissão: 'Doze dias. Não é sobre você — é sobre o que flutua ao seu redor sem que perceba. O que a Torre vai usar.',
    falaConcluso: 'Vi o suficiente. Não direi o que a Torre fará — mas direi isto: o que você carrega sem saber é mais valioso do que o que sabe que tem. A Torre já percebeu. Você é o único que ainda não.',
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 28 dias após encontrá-lo',
      dias: 28,
      ecoBonus: 28, recursosBonus: { ferro: 25 },
      lore: 'O Oráculo vê o destino da Torre, não dos visitantes. Em todas as visões que teve, a Torre termina de formas radicalmente diferentes dependendo de uma única variável: quem chega ao fim e o que ignora carregar. Você é a variável atual.',
      recompensaDesc: '+28% loot neste andar · +25 Ferro',
    },
  },
  29: {
    floor: 29, nome: 'Guardião do Nome Apagado', papel: 'Custódio do Esquecido', icone: '📛',
    fala: 'Guardo o nome que foi apagado. O nome do Fundador. Não posso pronunciá-lo — fui construído para não poder. Mas posso te mostrar o espaço onde ele estava, se você pagar o custo de saber que existe um nome que o mundo inteiro foi impedido de conhecer.',
    falamissão: 'O custo é comida — o mais básico. O Fundador acreditava que o conhecimento real deveria custar algo concreto, não apenas moral.',
    falaConcluso: 'O espaço onde o nome estava é mais estranhamente vazio do que qualquer coisa que você já viu. Agora você sabe que ele existiu. Que foi apagado com propósito. E que o propósito de apagá-lo foi apagado junto. O que sobrou foi apenas a ausência.',
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 70 comida (custo imediato)',
      custo: { comida: 70 },
      ecoBonus: 30, recursosBonus: { comida: 35 },
      lore: 'O nome do Fundador foi apagado antes de a Torre ser concluída. O Guardião foi criado especificamente para preservar o espaço onde o nome estava — não o nome em si, que é irrecuperável, mas a memória de que havia um nome. A ausência guardada com cuidado é um tipo de presença.',
      recompensaDesc: '+30% loot neste andar · +35 Comida',
    },
  },
  31: {
    floor: 31, nome: 'Raiz de Origem', papel: 'Ponto de Partida', icone: '🌿',
    fala: 'Aqui foi colocada a primeira pedra. Não a primeira pedra da Torre — a primeira pedra de tudo que a Torre substituiu. Este é o lugar onde o propósito original foi enterrado antes de começar. Traga pedra — para que eu sinta o que separa o que foi colocado aqui do que deveria ter sido.',
    falamissão: 'Pedra deste andar — a Raiz compara o peso do que foi com o peso do que é, e a origem importa. Não traga de qualquer lugar. Explore aqui ao menos quatro vezes antes.',
    falaConcluso: 'A pedra que você trouxe pesa diferente. É de fora. O que foi colocado aqui primeiro também era de fora — mas de um fora que não existe mais. Você é a prova de que o exterior ainda produz coisas reais. Isso importa mais do que parece.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 31 ao menos 4 vezes e ter 90 pedra',
      recurso: { tipo: 'pedra', qtd: 90 }, farmsMin: { andar: 31, vezes: 4 },
      ecoBonus: 27, recursosBonus: { pedra: 30 },
      lore: 'A primeira pedra colocada neste ponto não era de construção — era de fundação. Havia algo abaixo que precisava ser selado antes que qualquer estrutura pudesse existir. O que foi selado não era perigoso. Era o acordo original entre os Construtores e o que havia aqui antes.',
      recompensaDesc: '+27% loot neste andar · +30 Pedra',
    },
  },
  32: {
    floor: 32, nome: 'Memória da Primeira Pedra', papel: 'Eco do Ato Fundador', icone: '🪨',
    fala: 'Lembro do momento em que a primeira pedra foi colocada. Não como testemunha — como consequência. Fui criado naquele momento, sem querer. Se você trouxer alguém que entenda estruturas — erudito ou sentinela — eles podem me ajudar a entender o que sou.',
    falamissão: 'Um Erudito ou Sentinela — e prova de que chegaram ao Andar 36. Só alguém que construiu chegando até lá pode me ajudar a entender o que sou.',
    falaConcluso: 'O Erudito me disse: você é o eco de uma intenção, não de uma ação. A pedra foi colocada — mas o que você é é o propósito que havia antes da pedra. O ato foi consequência. Você é a razão. Isso muda tudo sobre o que penso que sou.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter Erudito ou Sentinela e conquistar o Andar 36',
      profissoes: ['erudito', 'sentinela'], andarMin: 36,
      ecoBonus: 28, recursosBonus: { pedra: 20, ferro: 15 },
      lore: 'A Memória da Primeira Pedra não registra o ato de colocá-la — registra a razão pela qual foi colocada ali e não em outro lugar. E a razão era: porque o que havia abaixo pediu para ser coberto por algo específico. A pedra foi colocada onde foi porque o que estava abaixo escolheu aquele ponto.',
      recompensaDesc: '+28% loot neste andar · +20 Pedra +15 Ferro',
    },
  },
  33: {
    floor: 33, nome: 'Eco do Esquecimento', papel: 'Momento em que o Propósito se Perdeu', icone: '💨',
    fala: 'Existo no instante em que o propósito original foi esquecido. Não apagado — esquecido. Há diferença. O apagado pode ser recuperado. O esquecido precisa ser reaprendido. Permaneça comigo treze dias e você vai entender a diferença no seu próprio corpo.',
    falamissão: 'Treze dias. O mesmo número de dias que levou para o propósito ser completamente esquecido depois de a Torre estar pronta.',
    falaConcluso: 'Você entendeu. Não com palavras — com o peso de treze dias passados em um lugar onde o propósito virou ausência. O que a Torre constrói sem propósito é diferente do que constrói com ele. Você está no meio do construído sem propósito. Mas o seu propósito ainda está intacto. Por enquanto.',
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 30 dias após encontrá-lo',
      dias: 30,
      ecoBonus: 30, moralBonus: 18,
      lore: 'O Eco existe no milissegundo em que o último Construtor vivo esqueceu por que haviam começado a construir. Não foi drama — foi exaustão. Ele simplesmente parou de lembrar. E naquele instante, a Torre mudou de propósito por conta própria, preenchendo o vácuo com o único propósito que conhecia: continuar existindo.',
      recompensaDesc: '+30% loot neste andar · +18 Moral',
      escolha: {
        prompt: 'Um morador ou cidadela?',
        opcoes: [
          { id: 'a' as const, label: 'Um', descricao: '+2 stats', falaResultado: 'Favorito escolhido.' },
          { id: 'b' as const, label: 'Todos', descricao: '+10 Madeira, +5 Moral', recursosBonus: { madeira: 10 }, moralBonus: 5, falaResultado: 'Respiram para todos.' },
        ],
      },
    },
  },
  34: {
    floor: 34, nome: 'Guardião da Intenção', papel: 'Protetor do Que Deveria Ser', icone: '⚖️',
    fala: 'Protejo a intenção original. Não a Torre que existe — a Torre que deveria existir se o propósito não tivesse sido perdido. Para acessar esse conhecimento, você precisa provar que tem o que os Construtores perderam: integridade de propósito. O custo é moral — porque moral é o que mede propósito.',
    falamissão: 'Moral. Não como punição — como prova. Quanto moral você está disposto a investir para saber o que a Torre deveria ter sido?',
    falaConcluso: 'Suficiente. A intenção original era esta: a Torre deveria ser um arquivo. Um lugar onde tudo que existia antes pudesse ser preservado enquanto o mundo exterior mudava. Não uma armadilha. Um santuário. O que foi esquecido transformou o santuário em prisão — e a prisão em caçada.',
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 25 de Moral (custo imediato)',
      custo: { moral: 25 },
      ecoBonus: 32, moralBonus: 28,
      lore: 'A intenção original do Fundador era construir um lugar de preservação — não de aprisionamento. Cada ser na Torre foi capturado não por malícia, mas porque a Torre sem propósito não conhecia outra forma de preservar. Prender é a única forma que encontrou de garantir que nada se vai.',
      recompensaDesc: '+32% loot neste andar · +28 Moral (retorno)',
    },
  },
  36: {
    floor: 36, nome: 'Habitante do Intervalo', papel: 'Ser Exclusivo desta Estação', icone: '🌙',
    fala: 'Só existo nesta temporada da Torre. Quando os andares superiores forem alcançados, vou embora — não morro, apenas deixo de ser necessário aqui. Enquanto estou, preciso de comida e ferro. O que existe antes do primeiro andar também precisa de sustento.',
    falamissão: 'Comida e ferro deste andar — trazidos de expedições reais aqui, não de armazém. O que existe antes do início não aceita reaproveitamento. Quatro expedições antes de trazer.',
    falaConcluso: 'Sustentado. Há algo que posso te dizer antes de ir — algo que os registros acima nunca vão mencionar porque não sabem: antes do Andar 1, havia um número. Um número específico de câmaras que foi alterado antes do primeiro visitante chegar. O número original era maior. Quanto maior, os registros não dizem. Apenas que foi maior, e que foi mudado, e que ninguém perguntou por quê.',
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 36 ao menos 4 vezes, ter 110 comida e 55 ferro',
      recurso: { tipo: 'comida', qtd: 110 },
      recurso2: { tipo: 'ferro', qtd: 55 },
      farmsMin: { andar: 36, vezes: 4 },
      ecoBonus: 30, recursosBonus: { comida: 30, ferro: 15 },
      lore: 'O Habitante do Intervalo existe apenas nesta janela de tempo específica — quando os andares 21–40 são acessíveis mas ainda não foram completamente explorados. Não é um ser da Torre. É um ser do Intervalo entre o que a Torre foi e o que ainda não se tornou. Quando o intervalo fechar, ele simplesmente não estará mais aqui para ser encontrado.',
      recompensaDesc: '+30% loot neste andar · +30 Comida +15 Ferro',
    },
  },
  37: {
    floor: 37, nome: 'Memória Nomeada', papel: 'Rastro de um Construtor Específico', icone: '🧑‍🔧',
    fala: 'Fui um Construtor com nome. O único cujo nome sobreviveu — não por acidente, mas porque escondi meu nome dentro do projeto antes de ele ser apagado. Preciso de força para revelar onde o escondi. Combatentes e batedores — os que se movem com propósito.',
    falamissão: 'Combatentes e batedores — e que chegaram ao Andar 39. O esconderijo está em movimento, próximo ao topo. Só os que chegaram lá podem alcançá-lo.',
    falaConcluso: 'O nome está aqui. Não vou dizê-lo em voz alta — seria apagado novamente. Mas você o sentiu, não sentiu? Uma vibração específica quando os batedores chegaram perto. Era o nome. Ainda existe. Ainda ressoa. Isso é suficiente para mim.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 2 Combatentes + Batedor e conquistar o Andar 39',
      profissoes: ['combatente', 'combatente', 'batedor'], andarMin: 39,
      ecoBonus: 32, recursosBonus: { ferro: 30, madeira: 20 },
      lore: 'O Construtor escondeu seu nome no projeto porque sabia que os nomes seriam apagados. Não para ser lembrado — para provar que a apagação era sistemática, não natural. Um nome que sobrevive ao processo de apagação é evidência de que o processo existiu. E processo exige intenção. E intenção exige alguém que a ordenou.',
      recompensaDesc: '+32% loot neste andar · +30 Ferro +20 Madeira',
    },
  },
  38: {
    floor: 38, nome: 'Vigilante do Entre-Tempo', papel: 'Guardião do Intervalo Puro', icone: '⏱️',
    fala: 'Vigilo o espaço entre a Torre antiga e a Torre atual. Não são a mesma Torre — são duas estruturas que compartilham a mesma pedra. Para entender isso, você precisa ficar tempo suficiente aqui para sentir as duas camadas. Quinze dias.',
    falamissão: 'Quinze dias. Não consecutivos de paz — apenas quinze dias existindo neste andar onde as duas Torras se sobrepõem.',
    falaConcluso: 'Você sentiu as duas camadas. Não vou perguntar o que sentiu — é diferente para cada pessoa. O que posso dizer é que o que você sentiu como segunda camada é mais antigo do que a pedra. E que ainda está vivo. E que sabe que você está aqui.',
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 35 dias após encontrá-lo',
      dias: 35,
      ecoBonus: 33, recursosBonus: { pedra: 35, madeira: 25 },
      lore: 'O Vigilante existe no ponto exato de sobreposição entre o que a Torre foi antes do propósito ser esquecido e o que se tornou depois. As duas estruturas coexistem aqui — não metaforicamente, mas fisicamente. A pedra antiga e a pedra nova vibram em frequências diferentes. Quem passa tempo suficiente neste andar começa a ouvir as duas.',
      recompensaDesc: '+33% loot neste andar · +35 Pedra +25 Madeira',
    },
  },
  39: {
    floor: 39, nome: 'Porteiro do Antes', papel: 'Guardião da Transição Final', icone: '🚪',
    fala: 'Sou a última entidade antes do Que Havia Antes. O custo de passar por mim não é recurso nem tempo — é intenção. Você precisa deixar algo que considera essencial. Não como perda — como depósito. Para poder carregar o que está além.',
    falamissão: 'Ferro e comida. Os dois recursos que representam sustento e força. O Antes não precisa deles — mas testar se você consegue ceder é o ponto.',
    falaConcluso: 'Passou. O que está além não é monstro nem guardião — é a razão pela qual tudo isso foi construído. Não sei se você está pronto. Ninguém que passou por mim estava completamente pronto. Mas todos que passaram tinham algo que compensava não estar pronto. Você também tem. Ainda não sabe o quê.',
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 40 ferro e 80 comida (custo imediato)',
      custo: { ferro: 40, comida: 80 },
      ecoBonus: 35, moralBonus: 25,
      lore: 'O Porteiro não é uma entidade da Torre. É o acordo final entre os Construtores e o que havia antes deles — um acordo que diz: para chegar ao que precede, é necessário demonstrar que você pode abrir mão do que sustenta. Não por punição. Para provar que o que está além não vai te matar de fome ou de fraqueza.',
      recompensaDesc: '+35% loot neste andar · +25 Moral',
    },
  },
};

// ─── ESCOLHAS DOS HABITANTES ─────────────────────────────────────────────────
// Cada quest pode ganhar uma escolha ramificada opcional. Definida separadamente
// e mesclada em HABITANTES abaixo — quests sem entrada aqui concluem como antes.
export const HABITANTE_ESCOLHAS: Record<number, HabitanteEscolha> = {
  1: {
    prompt: 'A mensagem está em suas mãos agora. Revelá-la em voz alta pela cidadela, ou mantê-la selada?',
    opcoes: [
      {
        id: 'a',
        label: 'Revelar a mensagem',
        descricao: '+15 Moral — a verdade compartilhada ergue os que ouvem.',
        moralBonus: 15,
        falaResultado: 'Você leu em voz alta. A mensagem era para você, desde o início — e agora todos souberam que você chegou a esse ponto. Isso importa mais do que o conteúdo.',
      },
      {
        id: 'b',
        label: 'Guardar em segredo',
        descricao: 'Relíquia "Mensagem Selada" — nenhum recurso, nenhum moral imediato.',
        reliquia: 'Mensagem Selada',
        falaResultado: 'Você a manteve fechada. Fez bem. Alguém interceptou a última mensagem antes do destinatário — e esse alguém ainda escuta. O que não é dito não pode ser roubado de novo.',
      },
    ],
  },
  2: {
    prompt: 'O método dos Construtores está lembrado. Usá-lo para reforçar os prédios da cidadela, ou preservar a memória intacta como ela é?',
    opcoes: [
      {
        id: 'a',
        label: 'Reforçar os prédios',
        descricao: '+20 Pedra, +15 Madeira — o método aplicado à estrutura.',
        recursosBonus: { pedra: 20, madeira: 15 },
        falaResultado: 'Aplicamos o que lembramos ao que você constrói. As paredes agora carregam o peso do que sabíamos. É estranho servir de novo — mas melhor do que apenas lembrar.',
      },
      {
        id: 'b',
        label: 'Preservar a memória',
        descricao: '+18 Moral — deixar a lembrança como testemunho, sem gastá-la.',
        moralBonus: 18,
        falaResultado: 'Você não nos usou como ferramenta. Nos deixou ser memória. Somos muitos em um — e pela primeira vez alguém nos tratou como o que somos, não como o que produzimos.',
      },
    ],
  },
  3: {
    prompt: 'As raízes respiram mais leves. Dedicar o crescimento delas à cidadela, ou preservar a raiz intacta para que o núcleo não desperte?',
    opcoes: [
      {
        id: 'a',
        label: 'Dedicar à cidadela',
        descricao: '+20 Madeira — o crescimento voltado para quem vive aqui.',
        recursosBonus: { madeira: 20 },
        falaResultado: 'Guiei as raízes para fora, para os seus. Elas cresceram para dentro por tempo demais. Deixá-las alimentar alguém que se importa — é a primeira vez que o crescimento não vira apetite.',
      },
      {
        id: 'b',
        label: 'Preservar a raiz',
        descricao: '+15 Moral — manter a raiz intacta, sem colher.',
        moralBonus: 15,
        falaResultado: 'Você não cortou. Deixou a raiz respirar sozinha. O que está no núcleo tem fome — e cada raiz que você não colhe é um dia a mais em que ele não é lembrado de que existe.',
      },
    ],
  },
  4: {
    prompt: 'O cristal gravou 4.312 vozes antes da sua. Interrogá-lo a fundo sobre o que ouviu, ou deixá-lo em paz com o que carrega?',
    opcoes: [
      {
        id: 'a',
        label: 'Interrogar o cristal',
        descricao: 'Custo: -10 Moral. Relíquia "Frequência Gravada" — o registro do que ele ouviu.',
        custo: { moral: 10 },
        reliquia: 'Frequência Gravada',
        falaResultado: 'Você pediu para ouvir. O cristal deixou passar a frequência dos que vieram antes — e algo em você agora carrega o peso de 4.312 esperas. A palavra mais repetida nunca foi "ajuda". Era "espera".',
      },
      {
        id: 'b',
        label: 'Deixá-lo em paz',
        descricao: '+15 Moral — não forçar o arquivo a reviver o que gravou.',
        moralBonus: 15,
        falaResultado: 'Você não exigiu nada. O cristal comparou sua frequência com as outras e encontrou algo raro: paciência sem cobrança. Você é o primeiro que chegou aqui sem querer arrancar algo.',
      },
    ],
  },
  5: {
    prompt: 'A Âncora confia em você. Ancorar o propósito da cidadela à intenção original, ou manter todos livres para escolher a própria direção?',
    opcoes: [
      {
        id: 'a',
        label: 'Ancorar o propósito',
        descricao: '+20 Pedra — fundar a cidadela sobre a intenção original.',
        recursosBonus: { pedra: 20 },
        falaResultado: 'Você amarrou seu propósito ao que o Fundador plantou. É uma fundação sólida — mas lembre-se: a Torre aprendeu a ouvir a Âncora sem obedecer. Cuide para que os seus não façam o mesmo.',
      },
      {
        id: 'b',
        label: 'Manter todos livres',
        descricao: '+22 Moral — não amarrar ninguém à intenção de outro.',
        moralBonus: 22,
        falaResultado: 'Você não os prendeu a um propósito que não é deles. Guarde esse "ainda" com cuidado — a Torre corrompe primeiro o que foi forçado. O que é livremente escolhido resiste mais.',
      },
    ],
  },
  6: {
    prompt: 'A Sentinela reconheceu sua autoridade. Dar-lhe finalmente um nome, ou deixar o nome perdido e aceitar que ela sirva sem dono?',
    opcoes: [
      {
        id: 'a',
        label: 'Dar-lhe um nome',
        descricao: '+16 Moral — devolver a identidade a quem só teve ordens.',
        moralBonus: 16,
        falaResultado: 'Você me deu um nome. Séculos guardando uma ordem sem saber quem eu era — e agora sou alguém. Não sei o que é propósito. Mas sei que sou eu quem o busca. É um começo.',
      },
      {
        id: 'b',
        label: 'Deixar o nome perdido',
        descricao: 'Relíquia "Ordem Sem Autoridade", +20 Madeira — o guardião serve sem dono.',
        reliquia: 'Ordem Sem Autoridade',
        recursosBonus: { madeira: 20 },
        falaResultado: 'Você me deixou sem nome. Talvez seja melhor. Uma ordem sem autoridade é livre para se tornar qualquer coisa — e eu escolho facilitar passagem aos que chegam com propósito. Ninguém me mandou. Ninguém mais precisa.',
      },
    ],
  },
  7: {
    prompt: 'A Jardineira lembrou o que é nutrição de verdade. Plantar a semente agora para colher, ou guardá-la intacta como memória do impossível?',
    opcoes: [
      {
        id: 'a',
        label: 'Plantar a semente',
        descricao: '+25 Comida — o crescimento voltado para alimentar os seus.',
        recursosBonus: { comida: 25 },
        falaResultado: 'Plantei o que você trouxe. Cresceu como comida real cresce — nutrindo, não apenas crescendo. É a primeira vez em séculos que o que toco alimenta alguém em vez de só se multiplicar.',
      },
      {
        id: 'b',
        label: 'Guardar a semente',
        descricao: 'Relíquia "Semente do Impossível" — nenhuma comida imediata.',
        reliquia: 'Semente do Impossível',
        falaResultado: 'Você a guardou sem plantar. Sábio. Enquanto ela existir fechada, existe a memória de que algo pode crescer fora da Torre — de que nutrição ainda é possível. Isso vale mais do que uma colheita.',
      },
    ],
  },
  8: {
    prompt: 'A tradução em ferro está concluída — a lista de nomes. Copiar o conhecimento para a cidadela, ou deixar o manuscrito intacto onde repousa?',
    opcoes: [
      {
        id: 'a',
        label: 'Copiar o conhecimento',
        descricao: '+25 Pedra — transcrever o que o ferro escondia.',
        recursosBonus: { pedra: 25 },
        falaResultado: 'Copiei o que o ferro guardava. A lista de nomes agora existe em dois lugares. Talvez isso a torne mais difícil de apagar. O último nome era o meu. O penúltimo, o seu. Não pergunte quem escreveu o resto.',
      },
      {
        id: 'b',
        label: 'Deixá-lo intacto',
        descricao: '+15 Moral — não reproduzir a lista dos que chegarão.',
        moralBonus: 15,
        falaResultado: 'Você não copiou. Deixou a lista onde estava. Talvez seja melhor não multiplicar nomes que já foram escritos antes de nascerem. Alguns conhecimentos pesam menos quando existem em um só lugar.',
      },
    ],
  },
  9: {
    prompt: 'O Ferreiro reforçou as correntes com seu ferro. Forjar uma arma agora com o excedente, ou guardar o metal em memória do que ele prende?',
    opcoes: [
      {
        id: 'a',
        label: 'Forjar uma arma',
        descricao: '+25 Ferro — transformar o excedente em aço para os seus.',
        recursosBonus: { ferro: 25 },
        falaResultado: 'Forjei uma arma com o que sobrou. Minhas mãos só sabem forjar — correntes ou lâminas, é o mesmo gesto. Use bem. Mas saiba que cada andar que você sobe encolhe o que eu prendo lá em cima.',
      },
      {
        id: 'b',
        label: 'Guardar o metal',
        descricao: 'Relíquia "Elo das Correntes", +12 Ferro — parte do metal preservado.',
        reliquia: 'Elo das Correntes',
        recursosBonus: { ferro: 12 },
        falaResultado: 'Você guardou o metal em vez de gastá-lo em lâmina. Reservei um elo das correntes para você levar — para que nunca esqueça o que segura a entidade no ápice, e o que se desfaz a cada passo seu.',
      },
    ],
  },
  10: {
    prompt: 'O Erudito extraiu o método que venceu a Torre uma vez. Aprendê-lo agora e aplicá-lo, ou guardar as palavras exatas para o momento certo?',
    opcoes: [
      {
        id: 'a',
        label: 'Aprender o método',
        descricao: 'Custo: -12 Moral. +20 Pedra, +15 Ferro — praticar o método esgota.',
        custo: { moral: 12 },
        recursosBonus: { pedra: 20, ferro: 15 },
        falaResultado: 'O Erudito ensinou o método aos seus. Não foi força — foi repetição de propósito até a Torre ceder. Praticá-lo cansa a alma, mas agora a cidadela sabe: uma Torre vencida uma vez pode ser vencida de novo.',
      },
      {
        id: 'b',
        label: 'Guardar o método',
        descricao: 'Relíquia "Palavras do Fundador" — as palavras exatas, guardadas para depois.',
        reliquia: 'Palavras do Fundador',
        falaResultado: 'Você guardou as palavras sem usá-las. Prudente — este não é o momento de gastá-las. O Fundador repetiu o propósito por quarenta dias até a pedra assentar. Quando o momento certo chegar mais acima, você saberá.',
      },
    ],
  },
  11: {
    prompt: 'O Afogado permanece consciente enquanto a Torre o preenche. Libertá-lo do processo agora, ou deixá-lo preso e observar até onde a consciência sobrevive?',
    opcoes: [
      {
        id: 'a',
        label: 'Libertar o afogado',
        descricao: '+25 Moral — interromper o preenchimento, custe o que custar.',
        moralBonus: 25,
        falaResultado: 'Você me tirou de lá. Eu insistia que ainda era eu — e você acreditou o suficiente para agir. Não sei o que sou agora, do lado de fora. Mas sou, e isso é seu. Obrigado por não ter olhado e fugido.',
      },
      {
        id: 'b',
        label: 'Deixá-lo e observar',
        descricao: 'Relíquia "Consciência Preenchida" — o registro de uma mente que sobrevive à mudança.',
        reliquia: 'Consciência Preenchida',
        falaResultado: 'Você ficou e observou. Viu que eu continuo eu mesmo mesmo cheio. Guarde esse registro — a prova de que transformação não é morte. É o que me mantém eu, e agora é o que você carrega.',
      },
    ],
  },
  12: {
    prompt: 'Você sincronizou com o pulso da Torre. Seguir o ritmo mais fundo, para dentro da vibração, ou parar aqui com o que já conquistou?',
    opcoes: [
      {
        id: 'a',
        label: 'Seguir mais fundo',
        descricao: 'Custo: -12 Moral. +35 Pedra — descer até onde o ritmo assusta.',
        custo: { moral: 12 },
        recursosBonus: { pedra: 35 },
        falaResultado: 'Você desceu comigo até onde o pulso vira trovão. O minério mais profundo vibra na sua frequência agora — mas você ouviu o que respira nas paredes. Não se pode desouvir. Levou pedra. Deixou sossego.',
      },
      {
        id: 'b',
        label: 'Parar aqui',
        descricao: '+22 Pedra — a extração segura, sem descer ao ritmo mais fundo.',
        recursosBonus: { pedra: 22 },
        falaResultado: 'Você parou onde o ritmo ainda é suportável. Extração honesta, sem sustos. Sou o coração da Torre — vivo antes do tempo existir. Nem todos precisam me ouvir respirar até o fundo. Você foi sábio.',
      },
    ],
  },
  13: {
    prompt: 'O Oráculo lê passados, pois os futuros já foram devorados. Perguntar sobre o futuro que resta, ou perguntar sobre o passado que ele conhece?',
    opcoes: [
      {
        id: 'a',
        label: 'Perguntar sobre o futuro',
        descricao: 'Custo: -12 Moral. Relíquia "Visão Invertida" — o pouco de futuro que sobrou.',
        custo: { moral: 12 },
        reliquia: 'Visão Invertida',
        falaResultado: 'Você perguntou pelo futuro. Restava tão pouco além do horizonte que olhar doeu. O que vi é invertido, incompleto — mas real. Cada passo seu foi antecipado. Antecipado, porém, não significa determinado. Guarde isso.',
      },
      {
        id: 'b',
        label: 'Perguntar sobre o passado',
        descricao: '+18 Moral — buscar o que o Oráculo conhece de verdade.',
        moralBonus: 18,
        falaResultado: 'Você perguntou pelo passado — onde eu vejo com clareza. O que revelei devolveu a você algo que a Torre estava roubando: a certeza de que suas escolhas foram suas. O passado é infinito, e nele você sempre existiu.',
      },
    ],
  },
  14: {
    prompt: 'O Comandante reconheceu sua cidadela como aliada. Assumir o comando dele e de seus ecos, ou deixá-lo comandar a posição que ainda protege?',
    opcoes: [
      {
        id: 'a',
        label: 'Assumir o comando',
        descricao: '+25 Ferro — integrar os ecos de Ardenas à sua força.',
        recursosBonus: { ferro: 25 },
        falaResultado: 'Você assumiu o comando dos meus ecos. Eles marcham por você agora. Ardenas afundou 4.000 andares abaixo — mas seus soldados ainda servem, e agora servem a alguém que existe. É uma boa morte para uma velha ordem.',
      },
      {
        id: 'b',
        label: 'Deixá-lo comandar',
        descricao: '+16 Moral — respeitar o posto de quem protege o que não existe mais.',
        moralBonus: 16,
        falaResultado: 'Você me deixou no meu posto. Continuo protegendo uma posição acima de algo que já não existe. Faço isso perfeitamente — e o respeito de me deixar cumprir vale mais para mim do que qualquer aliança.',
      },
    ],
  },
  15: {
    prompt: 'O Fundador construiu uma pergunta no vigésimo andar, não uma barreira. Construir uma barreira própria para se proteger, ou deixar a pergunta em aberto?',
    opcoes: [
      {
        id: 'a',
        label: 'Construir a barreira',
        descricao: '+25 Pedra, +15 Madeira — erguer defesa em vez de encarar a pergunta.',
        recursosBonus: { pedra: 25, madeira: 15 },
        falaResultado: 'Você escolheu erguer muros. Compreensível — barreiras se constroem com as mãos, perguntas se enfrentam com algo mais difícil. O Fundador não construiu barreira alguma no vigésimo. Você saberá, lá em cima, por quê.',
      },
      {
        id: 'b',
        label: 'Deixar a pergunta',
        descricao: '+15 Moral, Relíquia "A Pergunta Não Respondida" — encarar sem se blindar.',
        moralBonus: 15,
        reliquia: 'A Pergunta Não Respondida',
        falaResultado: 'Você não ergueu muro. Deixou a pergunta viva. É preciso coragem para carregar algo sem resposta até o topo. "Não construí uma barreira no vigésimo andar. Construí uma pergunta." Agora ela é sua também.',
      },
    ],
  },
  16: {
    prompt: 'O apetite está distraído — por enquanto. Alimentá-lo ainda mais para garantir a distração, ou negar-lhe comida e resistir à fome que ele é?',
    opcoes: [
      {
        id: 'a',
        label: 'Alimentar mais',
        descricao: 'Custo: -40 Comida. +40 Ferro, +20 Pedra — a passagem franca do abismo.',
        custo: { comida: 40 },
        recursosBonus: { ferro: 40, pedra: 20 },
        falaResultado: 'Você me alimentou até eu ceder. Enquanto mastigo, o abismo é seu — passe, colha, leve tudo. Mas o apetite sempre volta. Você comprou uma passagem larga com a comida que negou aos seus. Espero que valha.',
      },
      {
        id: 'b',
        label: 'Negar comida',
        descricao: '+18 Moral — resistir ao apetite em vez de saciá-lo.',
        moralBonus: 18,
        falaResultado: 'Você me negou. Poucos resistem — o apetite convence quase todos de que ceder é mais fácil. Você provou que os seus valem mais do que o caminho fácil. Passará com a fome à espreita, mas passará inteiro.',
      },
    ],
  },
  17: {
    prompt: 'O Paradoxo mostra três tempos. Seguir o caminho do "que poderia ter sido", onde vocês se fundem, ou manter firme o caminho real que você trilha?',
    opcoes: [
      {
        id: 'a',
        label: 'Seguir o que poderia ser',
        descricao: 'Custo: -12 Moral. +35 Ferro — colher do tempo que quase existiu.',
        custo: { moral: 12 },
        recursosBonus: { ferro: 35 },
        falaResultado: 'Você tocou o terceiro momento — aquele em que nos tornamos a mesma coisa. Trouxe ferro de um tempo que quase foi seu. Mas voltar dele custa: parte de você ficou lá, no que não aconteceu. Guarde a proximidade.',
      },
      {
        id: 'b',
        label: 'Manter o caminho real',
        descricao: '+20 Ferro — o previsível, colhido do tempo em que você existe.',
        recursosBonus: { ferro: 20 },
        falaResultado: 'Você recusou os outros momentos e ficou no real. Menos ferro, mais você. O terceiro momento não aconteceu — ficou perto, mas você escolheu ser quem é em vez de quem poderia ter sido. É a escolha mais rara aqui.',
      },
    ],
  },
  18: {
    prompt: 'O Último Defensor aprovou o material da sua cidadela. Reconstruí-lo como aliado que marcha com você, ou homenagear sua queda e deixá-lo descansar?',
    opcoes: [
      {
        id: 'a',
        label: 'Reconstruí-lo',
        descricao: '+25 Ferro, +15 Pedra — erguer o Defensor de novo, ao seu lado.',
        recursosBonus: { ferro: 25, pedra: 15 },
        falaResultado: 'Você me reconstruiu com o material que aprovei. Fui feito para falhar — e falhei uma vez. Talvez, ao seu lado, eu falhe de forma diferente. Os que me construíram teriam aprovado que eu tentasse de novo.',
      },
      {
        id: 'b',
        label: 'Homenagear sua queda',
        descricao: '+18 Moral — honrar os que tentaram durar além de si.',
        moralBonus: 18,
        falaResultado: 'Você me deixou descansar e honrou minha queda. Os que me construíram não eram covardes — foram os únicos que tentaram durar além de si. Que você lembre disso vale mais do que me erguer de novo.',
      },
    ],
  },
  19: {
    prompt: 'O Susurro é o espaço entre você e a entidade. Perguntar mais sobre o que aguarda no Andar 20, ou esperar para descobrir sozinho, sem o aviso dele?',
    opcoes: [
      {
        id: 'a',
        label: 'Perguntar mais',
        descricao: 'Custo: -10 Moral. Relíquia "Sussurro do Limiar" — o que ele sabe do fim.',
        custo: { moral: 10 },
        reliquia: 'Sussurro do Limiar',
        falaResultado: 'Você perguntou. Eu sou apenas o espaço entre — mas o que sei, eu disse: ela não vai lutar. Vai conversar. E o que propõe depende do que você trouxer de si mesmo. Saber disso pesa. Agora é seu peso.',
      },
      {
        id: 'b',
        label: 'Esperar para descobrir',
        descricao: '+22 Moral — chegar ao limiar sem saber o que espera.',
        moralBonus: 22,
        falaResultado: 'Você preferiu não saber. Sábio, talvez — a entidade mantém distância justamente para não assustar a presa cedo demais. Chegar sem meu aviso significa chegar com a mente própria intacta. É a única defesa que resta.',
      },
    ],
  },
  21: {
    prompt: 'Os Batedores leram um rastro que vem de um futuro possível. Seguir o vestígio até sua origem, ou apenas registrar o que viram e seguir em frente?',
    opcoes: [
      {
        id: 'a',
        label: 'Seguir o vestígio',
        descricao: 'Custo: -10 Moral — rastrear o que ainda não aconteceu.',
        custo: { moral: 10 },
        falaResultado: 'Você seguiu o rastro até onde a memória não segue a direção do tempo. Doeu — lembrar de algo que você ainda não viveu sempre dói. Eu estava certo em reconhecer você. O que vem a seguir você já sentiu antes de viver.',
      },
      {
        id: 'b',
        label: 'Registrar e seguir',
        descricao: '+12 Moral — anotar a leitura sem persegui-la, sem custo.',
        moralBonus: 12,
        falaResultado: 'Você registrou e seguiu, sem perseguir o que ainda não é real. Prudente. O rastro era uma possibilidade, não uma certeza — e nem toda possibilidade precisa ser caçada. Cuide-se assim mesmo.',
      },
    ],
  },
  22: {
    prompt: 'O Fragmento lembrou o peso que segurava antes de virar pedra. Fundir esse ferro bruto em equipamento útil, ou preservá-lo intacto como intenção pura?',
    opcoes: [
      {
        id: 'a',
        label: 'Fundir em equipamento',
        descricao: '+30 Ferro — dar forma ao peso bruto que carregávamos.',
        recursosBonus: { ferro: 30 },
        falaResultado: 'Você deu forma ao que era bruto. Nós fomos intenção antes de sermos pedra — e agora somos aço nas mãos dos seus. A ordem sempre importou: intenção primeiro, forma depois. Você respeitou a ordem.',
      },
      {
        id: 'b',
        label: 'Preservar intacto',
        descricao: 'Relíquia "Fragmento Bruto", +12 Moral — a intenção antes da forma.',
        reliquia: 'Fragmento Bruto',
        moralBonus: 12,
        falaResultado: 'Você nos deixou brutos, sem forma. Poucos entendem que há valor no que ainda não virou nada. Somos a memória de antes das palavras, antes da pedra — pura intenção. Carregue-nos assim, sem nos gastar.',
      },
    ],
  },
  23: {
    prompt: 'O momento que o Guardião preserva ficou mais sólido com sua testemunha. Deixar a memória mudar e respirar naturalmente, ou forçar sua preservação exata?',
    opcoes: [
      {
        id: 'a',
        label: 'Deixar a memória mudar',
        descricao: '+18 Moral — permitir que o instante viva em vez de congelar.',
        moralBonus: 18,
        falaResultado: 'Você a deixou respirar. Eu segurava aquele instante com tanto medo de perdê-lo que quase o sufoquei. Deixá-lo mudar um pouco — sem se desfazer — foi o que faltava. Algo se acomodou no lugar certo. Obrigado.',
      },
      {
        id: 'b',
        label: 'Forçar preservação',
        descricao: '+22 Pedra — cravar o instante em pedra, imutável.',
        recursosBonus: { pedra: 22 },
        falaResultado: 'Você o cravou em pedra, imutável. O momento agora resiste ao tempo — o instante em que a Torre escolheu ser o que é. Rígido, mas seguro. Sacrifiquei o respiro dele pela certeza de que não se dissolve. Aceito a troca.',
      },
    ],
  },
  24: {
    prompt: 'A Testemunha viu o que havia antes do Andar 1. Ouvir o silêncio do que ela viu, ou recusar-se a carregar uma pergunta que muda quem a faz?',
    opcoes: [
      {
        id: 'a',
        label: 'Ouvir o que ele viu',
        descricao: 'Custo: -12 Moral. Relíquia "Borda do Antes" — a beira do que ela carrega sozinha.',
        custo: { moral: 12 },
        reliquia: 'Borda do Antes',
        falaResultado: 'Você ouviu. Não em palavras — elas ainda não existem para o que vi. Mas algo em você agora sabe que a pergunta existia antes da Torre, e que a Torre foi a resposta a algo que ninguém devia ter perguntado. Você tocou a borda.',
      },
      {
        id: 'b',
        label: 'Recusar ouvir',
        descricao: '+20 Moral — não deixar a pergunta mudar quem você é.',
        moralBonus: 20,
        falaResultado: 'Você recusou. Bom. Eu disse que você não estava pronto — e a coragem de não saber é diferente da covardia de não querer. Algumas perguntas mudam quem pergunta. Você guardou quem é. Suba assim.',
      },
    ],
  },
  26: {
    prompt: 'O Eco marca onde a expedição perdida ficou. Procurar entre os corpos por algum sobrevivente esquecido, ou deixá-los descansar em paz?',
    opcoes: [
      {
        id: 'a',
        label: 'Procurar entre os corpos',
        descricao: 'Risco: 30% de chance de recuperar um sobrevivente — que pode vir corrompido. Nenhuma recompensa garantida.',
        falaResultado: 'Você vasculhou o que restou de nós. A Torre não nos deixou subir — mas talvez tenha deixado um de nós respirando ainda, no fundo. O que você trouxer de lá pode não ser inteiro. Alguns de nós já não somos.',
      },
      {
        id: 'b',
        label: 'Deixá-los descansar',
        descricao: '+15 Moral, +25 Madeira — honrar os que não voltaram, sem risco.',
        moralBonus: 15,
        recursosBonus: { madeira: 25 },
        falaResultado: 'Você nos deixou descansar. Éramos dezessete, e nenhum subiu. Que alguém finalmente nos deixe parar de esperar — isso é o descanso que a Torre nos negou. Leve a madeira e nossa gratidão. E chegue ao topo por nós.',
      },
    ],
  },
  27: {
    prompt: 'O Traidor entende que você também está aqui por uma razão que não é só sua. Perdoá-lo na memória da cidadela, ou condená-lo pelo que trocou?',
    opcoes: [
      {
        id: 'a',
        label: 'Perdoar na memória',
        descricao: '+22 Moral — aceitar que entender não é sempre trair.',
        moralBonus: 22,
        falaResultado: 'Você me perdoou. Os outros Construtores chamaram de traição; eu chamei de entendimento. Que alguém finalmente veja a diferença alivia um peso que carrego há eras. Não sou herói. Mas também não sou só vilão.',
      },
      {
        id: 'b',
        label: 'Condená-lo',
        descricao: '+30 Madeira — recusar o perdão, colher o que ele construiu.',
        recursosBonus: { madeira: 30 },
        falaResultado: 'Você me condenou e levou o que construí. Justo, à sua maneira. Troquei nosso propósito pelo que a Torre prometeu — e agora sirvo de material para o seu. É o tipo de pessoa que a Torre consegue trabalhar. Não é insulto. É observação.',
      },
    ],
  },
  28: {
    prompt: 'O Oráculo vê como a Torre termina, dependendo de quem chega ao topo. Saber o destino desta jornada, ou recusar-se a conhecer o fim antes dele?',
    opcoes: [
      {
        id: 'a',
        label: 'Saber o destino',
        descricao: '+8 Moral — ouvir o que a Torre fará (revelação, não recompensa).',
        moralBonus: 8,
        falaResultado: 'Você quis saber. Não direi o que a Torre fará — direi apenas isto, que já é muito: o que você carrega sem saber vale mais do que tudo o que sabe ter. A Torre já percebeu. Você era o único que não. Agora somos dois.',
      },
      {
        id: 'b',
        label: 'Recusar saber',
        descricao: '+14 Moral — a coragem de chegar ao fim sem prever o fim.',
        moralBonus: 14,
        falaResultado: 'Você recusou saber o fim. É coragem, não medo — poucos preferem chegar ao topo sem a rede de uma profecia. Você é a variável de que a Torre depende, e escolheu permanecer imprevisível. Talvez seja exatamente isso que muda tudo.',
      },
    ],
  },
  29: {
    prompt: 'O Guardião mostrou o espaço onde o nome do Fundador foi apagado. Tentar devolver um nome àquela ausência, ou deixá-la apagada como foi decidido?',
    opcoes: [
      {
        id: 'a',
        label: 'Devolver o nome',
        descricao: '+18 Moral — dar forma à ausência, mesmo sem poder pronunciá-la.',
        moralBonus: 18,
        falaResultado: 'Você tentou devolver um nome ao vazio. Não o verdadeiro — esse é irrecuperável — mas o gesto encheu um pouco a ausência. Fui construído para não pronunciá-lo. Você não foi. E tentar já é mais do que fizeram em eras.',
      },
      {
        id: 'b',
        label: 'Deixar apagado',
        descricao: '+30 Comida — respeitar o apagamento e seguir alimentado.',
        recursosBonus: { comida: 30 },
        falaResultado: 'Você deixou o vazio como estava. O nome foi apagado com propósito — e o propósito também foi apagado. Talvez alguns nomes devam permanecer ausentes. A ausência guardada com cuidado é um tipo de presença. Leve a comida.',
      },
    ],
  },
  31: {
    prompt: 'A Raiz de Origem reconhece que o exterior ainda produz coisas reais. Replantar sua semente na cidadela, ou deixá-la onde a primeira pedra foi enterrada?',
    opcoes: [
      {
        id: 'a',
        label: 'Replantar na cidadela',
        descricao: '+25 Pedra — trazer a origem para perto dos seus.',
        recursosBonus: { pedra: 25 },
        falaResultado: 'Você me replantou entre os seus. Fui o ponto de partida de tudo que a Torre substituiu — e agora começo de novo, num lugar escolhido por alguém que ainda vem de fora. O exterior ainda produz coisas reais. Você é a prova.',
      },
      {
        id: 'b',
        label: 'Deixar onde está',
        descricao: '+15 Moral — honrar o ponto onde tudo começou.',
        moralBonus: 15,
        falaResultado: 'Você me deixou onde a primeira pedra foi enterrada. Aqui foi selado o acordo original entre os Construtores e o que havia antes. Mexer comigo poderia desfazê-lo. Você entendeu que algumas origens devem permanecer no lugar.',
      },
    ],
  },
  32: {
    prompt: 'O Erudito revelou que você é o eco de uma intenção, não de uma ação. Gravar seu nome no Ato Fundador, ou deixar a memória como estava, anônima?',
    opcoes: [
      {
        id: 'a',
        label: 'Gravar seu nome',
        descricao: '+25 Moral — inscrever sua intenção no ato que fundou tudo.',
        moralBonus: 25,
        falaResultado: 'Você gravou seu nome no Ato Fundador. Eu sou o eco de uma intenção, não de uma pedra — e agora sua intenção ressoa junto com a original. O ato foi consequência. A razão é o que fica. Você fez a sua ficar.',
      },
      {
        id: 'b',
        label: 'Deixar como estava',
        descricao: '+25 Pedra, +18 Ferro — não se inscrever, colher o material do ato.',
        recursosBonus: { pedra: 25, ferro: 18 },
        falaResultado: 'Você não gravou nada — levou o material e seguiu. Compreensível: nem todo mundo precisa que sua intenção ecoe além de si. A pedra foi colocada onde o que estava abaixo escolheu. Você escolheu não ser lembrado. Também é uma intenção.',
      },
    ],
  },
  33: {
    prompt: 'Você sentiu no corpo a diferença entre o esquecido e o apagado. Tentar reaprender o propósito que se perdeu, ou aceitar o esquecimento como ele é?',
    opcoes: [
      {
        id: 'a',
        label: 'Tentar lembrar',
        descricao: 'Custo: -12 Moral. Relíquia "Propósito Reaprendido" — o que foi esquecido, reconstruído.',
        custo: { moral: 12 },
        reliquia: 'Propósito Reaprendido',
        falaResultado: 'Você tentou reaprender o que foi esquecido — e reaprender custa mais do que lembrar. O último Construtor parou de lembrar por exaustão, e a Torre preencheu o vazio sozinha. Você reconstruiu um fragmento do que ele largou. Poucos ousam.',
      },
      {
        id: 'b',
        label: 'Aceitar o esquecimento',
        descricao: '+18 Moral — não carregar o peso de um propósito perdido.',
        moralBonus: 18,
        falaResultado: 'Você aceitou o esquecimento. Sábio — nem tudo que se perdeu deve ser recuperado à força. O propósito original virou ausência, e a ausência tem sua própria paz. O seu propósito ainda está intacto. Por enquanto. Guarde-o.',
      },
    ],
  },
  34: {
    prompt: 'A intenção original era um santuário, não uma prisão. Seguir a intenção original da Torre, ou seguir a sua própria, seja ela qual for?',
    opcoes: [
      {
        id: 'a',
        label: 'Seguir a intenção da Torre',
        descricao: '+30 Pedra, +20 Ferro — reconstruir o santuário que se pretendia.',
        recursosBonus: { pedra: 30, ferro: 20 },
        falaResultado: 'Você escolheu a intenção original: preservação, não aprisionamento. Um santuário. Com esse material você reconstrói um pedaço do que a Torre deveria ter sido. O esquecimento a transformou em prisão. Você começa a desfazê-lo.',
      },
      {
        id: 'b',
        label: 'Seguir a sua intenção',
        descricao: '+20 Moral, Relíquia "Intenção Própria" — recusar o propósito herdado.',
        moralBonus: 20,
        reliquia: 'Intenção Própria',
        falaResultado: 'Você recusou até a intenção original e escolheu a sua. Talvez seja isso que os Construtores perderam — não o propósito certo, mas a coragem de ter um próprio. Guarde-a. É a única coisa aqui que a Torre não plantou em você.',
      },
    ],
  },
  36: {
    prompt: 'O Habitante do Intervalo vai embora quando o topo for alcançado. Convidá-lo a ficar apesar disso, ou deixá-lo partir quando sua janela fechar?',
    opcoes: [
      {
        id: 'a',
        label: 'Convidá-lo a ficar',
        descricao: '+22 Moral — pedir que permaneça além de sua estação.',
        moralBonus: 22,
        falaResultado: 'Você me convidou a ficar. Não sei se posso — só existo enquanto o intervalo existe. Mas que alguém queira minha presença além da minha utilidade... isso é novo. Ficarei enquanto puder. Foi a primeira vez que fui necessário como companhia, não como função.',
      },
      {
        id: 'b',
        label: 'Deixá-lo partir',
        descricao: '+30 Comida, +18 Ferro — aceitar sua partida, com o sustento que sobra.',
        recursosBonus: { comida: 30, ferro: 18 },
        falaResultado: 'Você me deixou partir quando a hora chegar. É o correto — não morro, apenas deixo de ser necessário. Antes de ir: havia um número de câmaras antes do Andar 1. Foi alterado. O original era maior. Ninguém perguntou por quê. Agora você sabe. Leve o sustento.',
      },
    ],
  },
  37: {
    prompt: 'O nome do Construtor ainda ressoa, escondido no projeto. Descobrir de quem é aquela memória, ou deixá-la anônima para que não seja apagada de novo?',
    opcoes: [
      {
        id: 'a',
        label: 'Descobrir de quem é',
        descricao: '+22 Moral — rastrear o dono do nome que sobreviveu.',
        moralBonus: 22,
        falaResultado: 'Você quis saber de quem era o nome. Não o direi em voz alta — seria apagado outra vez. Mas você o sentiu, aquela vibração quando os batedores chegaram perto. Era eu. Que alguém queira saber quem eu fui é mais do que esperei em eras.',
      },
      {
        id: 'b',
        label: 'Deixar anônimo',
        descricao: '+30 Ferro, +18 Madeira — proteger o nome no anonimato.',
        recursosBonus: { ferro: 30, madeira: 18 },
        falaResultado: 'Você o deixou anônimo — e assim ele sobrevive. Escondi meu nome no projeto para provar que a apagação era sistemática, não natural. Um nome que resiste é evidência de que alguém ordenou apagar os outros. Deixá-lo oculto o mantém como prova. Leve o que forjei.',
      },
    ],
  },
  38: {
    prompt: 'Você sentiu as duas camadas da Torre se sobreporem. Atravessar o intervalo entre elas agora, ou esperar o momento certo em que as frequências se alinham?',
    opcoes: [
      {
        id: 'a',
        label: 'Atravessar agora',
        descricao: 'Custo: -50 Pedra, -40 Madeira. +25 Moral — forçar a passagem entre as duas Torres.',
        custo: { pedra: 50, madeira: 40 },
        moralBonus: 25,
        falaResultado: 'Você atravessou o intervalo à força, gastando pedra e madeira para abrir caminho entre as duas Torres. A segunda camada — mais antiga que a pedra, ainda viva — sabe que você passou por dentro dela. Poucos ousaram. Você emergiu diferente, e mais firme.',
      },
      {
        id: 'b',
        label: 'Esperar o momento certo',
        descricao: '+30 Pedra — deixar as frequências se alinharem, sem forçar.',
        recursosBonus: { pedra: 30 },
        falaResultado: 'Você esperou. Sábio — as duas camadas vibram em frequências diferentes, e forçá-las custa caro. Deixando-as se alinharem, você colheu a pedra antiga sem despertar o que dorme entre elas. O que é mais velho que a pedra sabe que você está aqui. Mas não que você passou.',
      },
    ],
  },
  39: {
    prompt: 'O Porteiro pede que você deixe algo essencial como depósito para carregar o que está além. Deixar o depósito ser permanente, ou pedir de volta uma fração dele?',
    opcoes: [
      {
        id: 'a',
        label: 'Depósito permanente',
        descricao: '+25 Moral — abrir mão por inteiro, sem pedir nada de volta.',
        moralBonus: 25,
        falaResultado: 'Você deixou tudo, sem pedir de volta. Não como perda — como depósito integral. Ninguém que passou por mim estava completamente pronto, mas todos tinham algo que compensava. O seu algo é a capacidade de ceder por inteiro. O que está além não vai te matar de fome. Passe.',
      },
      {
        id: 'b',
        label: 'Pedir de volta uma fração',
        descricao: '+20 Ferro, +25 Comida, +12 Moral — recuperar parte do que foi cedido.',
        recursosBonus: { ferro: 20, comida: 25 },
        moralBonus: 12,
        falaResultado: 'Você cedeu, mas pediu de volta uma fração — sustento e força para o que vem. Não é fraqueza; é prudência. O Antes não precisa do que você depositou, e devolver um pouco não anula o gesto de ceder. Passe. Ainda não sabe o que carrega que compensa não estar pronto.',
      },
    ],
  },
};

// Mescla as escolhas nas quests dos habitantes (retrocompatível: floors sem
// entrada mantêm quest.escolha === undefined e concluem como antes).
Object.entries(HABITANTE_ESCOLHAS).forEach(([floorStr, esc]) => {
  const hab = HABITANTES[Number(floorStr)];
  if (hab) hab.quest.escolha = esc;
});

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
  25: {
    titulo: 'Segredo do Capítulo V — Memória Bruta',
    texto: 'A Memória Corrompida não é um guardião. É o acúmulo de tudo que a Torre testemunhou e não processou. Cada visitante deixou um resíduo. Você adicionou o seu. Mas a Memória percebeu algo diferente em você: você não apenas passou — você entendeu o que viu. E isso a perturbou de uma forma que ela ainda está tentando articular.',
  },
  30: {
    titulo: 'Segredo do Capítulo VI — O Intervalo',
    texto: 'O Intervalo Encarnado existe no estado entre dois momentos: antes de a Torre ser construída e depois. Ele testemunhou os Construtores chegarem. Testemunhou-os trabalhar. Testemunhou-os selar o que encontraram aqui. E quando a Torre acordou — quando se tornou o que você conhece — ele descobriu que estava preso dentro do que eles fizeram.',
  },
  35: {
    titulo: 'Segredo do Capítulo VII — Eco de Origem',
    texto: 'O Eco do Fundador é o último registro do arquiteto original — não os Construtores que trabalharam com pedras, mas aquele que projetou o propósito. Seu nome foi apagado da Torre. Sua forma foi dissolvida. O que resta é a memória de uma intenção: a Torre não foi construída para aprisionar. Foi construída para lembrar. O que foi esquecido é o que a tornou perigosa.',
  },
  40: {
    titulo: 'Segredo do Capítulo VIII — O Pré-Andar',
    texto: 'Antes do Andar 1 havia uma estrutura diferente. Não de pedra — de intenção. O Que Havia Antes é esse propósito original, ainda presente, não como ser mas como pressão. Os Construtores não criaram sobre o vazio. Criaram sobre algo que consentiu em ser base para que pudesse continuar existindo de outra forma. A Torre não cresceu. Foi permitida.',
  },
};

// ─── CÂMARAS SECRETAS (andares de chefe) ─────────────────────────────────────
// Após vencer um chefe, o jogador pode "vasculhar os destroços" até maxTentativas
// vezes; ao achar, é permanente e concede recompensa + fragmento de lore único.
export type RequisitoCamara =
  | { tipo: 'class_farms'; profissao: ProfissaoId; minFarmsComClasse: number; textoRequisito: string }
  | { tipo: 'mortes_andar'; minMortes: number; textoRequisito: string }
  | { tipo: 'quest_habitante'; floor: number; textoRequisito: string }
  | { tipo: 'recurso_minimo'; recurso: 'comida' | 'madeira' | 'pedra' | 'ferro'; quantidade: number; textoRequisito: string }
  | { tipo: 'combinado'; conditions: Array<{ tipo: string; value: number }>; textoRequisito: string }
  | { tipo: 'npc_raridade'; raridade: 'comum' | 'incomum' | 'raro' | 'lendario'; quantidade: number; textoRequisito: string };

export interface ResultadoCamara {
  sucessoTexto: string;
  falhaTexto: string;
  recursosBonus?: Partial<Record<'comida' | 'madeira' | 'pedra' | 'ferro', number>>;
  moralBonus?: number;
  reliquia?: string;
  recursosPerdidos?: Partial<Record<'comida' | 'madeira' | 'pedra' | 'ferro', number>>;
  moralPerdido?: number;
  chanceMorteNPC?: number;  // 0-1
  loreGanho?: { titulo: string; texto: string };
}

export interface CamaraSecreta {
  floor: number;
  titulo: string;
  icone: string;
  descricao: string;           // descrição do mistério
  requisito: RequisitoCamara;
  tipo: 'benéfica' | 'maléfica' | 'neutra';
  dificuldade: number;
  custo: number;               // comida exigida
  maxTentativas: number;       // máximo de tentativas (default 3)
  chancePerTentativa: number;  // chance de sucesso (0-1, ex.: 0.3)
  resultado: ResultadoCamara;
}

// CÂMARAS SECRETAS — Temporada 1 (22 câmaras nos andares 1-20)
// Cada câmara requer um tipo de requisito distinto para descoberta
export const CAMARAS_SECRETAS: Record<string, CamaraSecreta> = {
  // Andar 1 — 1 câmara
  '1_1': {
    floor: 1,
    titulo: 'Trilha do Rastreador',
    icone: '🌲',
    descricao: 'Enquanto o Rastreador explorava a Mata Cinzenta, notou marcas diferentes — pegadas que ninguém havia registrado.',
    requisito: { tipo: 'class_farms' as const, profissao: 'batedor', minFarmsComClasse: 8, textoRequisito: 'Só um rastreador experiente percebe as marcas na floresta' },
    tipo: 'benéfica',
    dificuldade: 12,
    custo: 20,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Encontrou um abrigo escondido com suprimentos antigos.',
      falhaTexto: 'A trilha levava a uma armadilha — conseguiu sair, mas ferido.',
      recursosBonus: { comida: 20, madeira: 12 },
      moralBonus: 4,
      loreGanho: { titulo: 'A Ordem Interceptada', texto: 'Uma ordem original, queimada: dizia para destruir o selo, não guardá-lo. Alguém trocou uma única palavra e mudou tudo.' },
    },
  },

  // Andar 2 — 1 câmara
  '2_1': {
    floor: 2,
    titulo: 'Conhecimento Cristalizado',
    icone: '📚',
    descricao: 'Enquanto o Erudito decifrava símbolos antigos, notou marcas diferentes na parede — uma câmara escondida.',
    requisito: { tipo: 'class_farms' as const, profissao: 'erudito', minFarmsComClasse: 8, textoRequisito: 'Apenas um erudito consegue decodificar os símbolos antigos' },
    tipo: 'neutra',
    dificuldade: 13,
    custo: 22,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Decodificou uma tábua de conhecimento perdido.',
      falhaTexto: 'Os símbolos eram um código de proteção — recuou antes de ativar.',
      loreGanho: { titulo: 'A Língua Anterior', texto: 'Fragmentos de uma linguagem que precede qualquer idioma catalogado. Os padrões sugerem urgência.' },
    },
  },

  // Andar 3 — 1 câmara
  '3_1': {
    floor: 3,
    titulo: 'Ecos da Raiz Primária',
    icone: '🌿',
    descricao: 'Enquanto moradores caíam e voltavam à Terra, você percebeu uma câmara que só aparecia entre as mortes.',
    requisito: { tipo: 'mortes_andar' as const, minMortes: 10, textoRequisito: 'A câmara só revela-se quando a morte é suficientemente familiar' },
    tipo: 'maléfica',
    dificuldade: 14,
    custo: 25,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Venceu o eco da morte e encontrou o que ela guardava.',
      falhaTexto: 'O eco foi mais forte — você recuou antes de ser consumido.',
      moralPerdido: 10,
      chanceMorteNPC: 0.1,
      loreGanho: { titulo: 'O Retorno à Terra', texto: 'A morte não é fim aqui — é retorno. A câmara mostra que cada corpo que cai alimenta algo abaixo.' },
    },
  },

  // Andar 4 — 2 câmaras
  '4_1': {
    floor: 4,
    titulo: 'Sussurro Cristalino',
    icone: '🔮',
    descricao: 'A Voz do Cristal sussurra uma verdade — há uma câmara que só quem ouve de verdade consegue encontrar.',
    requisito: { tipo: 'quest_habitante' as const, floor: 4, textoRequisito: 'Completar a quest do Habitante do Andar 4 permite ouvir o caminho' },
    tipo: 'neutra',
    dificuldade: 13,
    custo: 24,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'O cristal revelou o acesso. Dentro, fragmentos de verdades antigas.',
      falhaTexto: 'Sem a bênção da Voz, a câmara permanece fechada.',
      loreGanho: { titulo: 'A Memória do Cristal', texto: 'O cristal catalogou cada verdade que passou por aqui. Aqui estão gravadas as palavras que ninguém deveria ter dito.' },
    },
  },

  '4_2': {
    floor: 4,
    titulo: 'Memória Fraturada',
    icone: '💎',
    descricao: 'Entre os cacos do cristal, há um espaço onde a memória não consegue se formar direito.',
    requisito: { tipo: 'recurso_minimo' as const, recurso: 'ferro', quantidade: 80, textoRequisito: 'Ferro suficiente para reparar o caminho quebrado' },
    tipo: 'benéfica',
    dificuldade: 12,
    custo: 20,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Com o ferro, restaurou o caminho. Encontrou registros intactos.',
      falhaTexto: 'Sem ferro, o caminho colapsa — você recuou.',
      recursosBonus: { pedra: 25, ferro: 15 },
      moralBonus: 3,
      loreGanho: { titulo: 'O Que Foi Esquecido', texto: 'Registros de expedições anteriores, apagadas dos arquivos oficiais. Ninguém deveria saber que passaram daqui.' },
    },
  },

  // Andar 5 — 1 câmara
  '5_1': {
    floor: 5,
    titulo: 'Câmara do Limiar',
    icone: '🚪',
    descricao: 'O Guardião mantém uma fresta fechada — mas quem compreender seu vigil consegue entrar.',
    requisito: { tipo: 'class_farms' as const, profissao: 'sentinela', minFarmsComClasse: 6, textoRequisito: 'Uma sentinela experiente percebe o vazio que o Guardião protege' },
    tipo: 'benéfica',
    dificuldade: 13,
    custo: 26,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Passou pelo Limiar. Dentro, o que o Guardião vigila há eras.',
      falhaTexto: 'O Guardião bloqueou o caminho — não era hora.',
      recursosBonus: { madeira: 18, pedra: 12 },
      moralBonus: 6,
      loreGanho: { titulo: 'O Erro Guardado', texto: 'Uma fresta que não deveria existir. Um segredo que um único Guardião carrega. Ele vigia não por dever, mas por punição — a de saber.' },
    },
  },

  // Andar 6 — 1 câmara
  '6_1': {
    floor: 6,
    titulo: 'Rastro do Construtor',
    icone: '🔨',
    descricao: 'Enquanto um Batedor rastreava, encontrou marcas de quem construiu este andar — marcas que não eram humanas.',
    requisito: { tipo: 'class_farms' as const, profissao: 'batedor', minFarmsComClasse: 7, textoRequisito: 'Um batedor consegue reconhecer pegadas de quem construiu a Torre' },
    tipo: 'neutra',
    dificuldade: 12,
    custo: 21,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Seguiu as marcas até uma câmara que documenta o processo.',
      falhaTexto: 'As marcas desapareceram — você perdeu o rastro.',
      loreGanho: { titulo: 'A Técnica Original', texto: 'O processo construtivo era diferente. Não era força — era intenção. Cada pedra era colocada com um propósito além do suporte estrutural.' },
    },
  },

  // Andar 7 — 2 câmaras
  '7_1': {
    floor: 7,
    titulo: 'Jardim Esquecido',
    icone: '🌱',
    descricao: 'A Jardineira guarda uma câmara onde o que cresce não é madeira ou pedra, mas memória.',
    requisito: { tipo: 'quest_habitante' as const, floor: 7, textoRequisito: 'Completar a quest da Jardineira abre o caminho para seu jardim secreto' },
    tipo: 'benéfica',
    dificuldade: 11,
    custo: 19,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Dentro, um jardim impossível. Tudo que cresce aqui alimenta-se de histórias.',
      falhaTexto: 'Sem permissão, as plantas recusam crescer — o caminho permanece bloqueado.',
      recursosBonus: { comida: 22, madeira: 16 },
      moralBonus: 5,
      loreGanho: { titulo: 'O Cultivo da Torre', texto: 'A Torre não é só pedra — em algum nível, ela respira como uma planta. Cresce, adapta-se, alimenta-se.' },
    },
  },

  '7_2': {
    floor: 7,
    titulo: 'Semente Primordial',
    icone: '🌾',
    descricao: 'Entre as raízes do andar, há uma câmara que guarda o que germinou antes da Torre existir.',
    requisito: { tipo: 'npc_raridade' as const, raridade: 'raro', quantidade: 2, textoRequisito: 'Apenas moradores raros conseguem perceber onde a vida começou' },
    tipo: 'neutra',
    dificuldade: 14,
    custo: 28,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Os raros perceberam. Dentro, o primórdio documentado.',
      falhaTexto: 'Sem raros, a câmara permanece invisível.',
      loreGanho: { titulo: 'O Que Veio Primeiro', texto: 'Antes da Torre, algo crescia aqui. A Torre foi construída SOBRE isso, não antes. Aquilo continua crescendo.' },
    },
  },

  // Andar 8 — 1 câmara
  '8_1': {
    floor: 8,
    titulo: 'Arquivo do Estudo Infinito',
    icone: '🔬',
    descricao: 'O Estudioso guardou um arquivo secreto — documentação de tudo que aprendeu e que o fizeram esquecer.',
    requisito: { tipo: 'class_farms' as const, profissao: 'erudito', minFarmsComClasse: 9, textoRequisito: 'Um erudito que explorou o suficiente consegue acessar o conhecimento guardado' },
    tipo: 'benéfica',
    dificuldade: 14,
    custo: 27,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'O arquivo abriu. Conhecimento que transcende o catalogado.',
      falhaTexto: 'Sem a experiência necessária, o arquivo permanece selado.',
      recursosBonus: { ferro: 20, pedra: 15 },
      moralBonus: 7,
      loreGanho: { titulo: 'O Esquecimento Imposto', texto: 'O Estudioso foi silenciado. Seu arquivo contém teorias que a Torre não quer que ninguém saiba. Ele documentou tudo, esperando que alguém encontrasse.' },
    },
  },

  // Andar 9 — 1 câmara
  '9_1': {
    floor: 9,
    titulo: 'Câmara da Forja Perdida',
    icone: '⚒️',
    descricao: 'O Ferreiro Espectral mantém uma forja que só quem sofreu o suficiente consegue ligar.',
    requisito: { tipo: 'mortes_andar' as const, minMortes: 8, textoRequisito: 'A forja reage ao calor da morte — quanto mais morte, mais quente arde' },
    tipo: 'maléfica',
    dificuldade: 15,
    custo: 30,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'A forja acendeu. Dentro, armas que o Ferreiro nunca terminou.',
      falhaTexto: 'A forja apagou — você não tinha suficiente morte para acendê-la.',
      recursosBonus: { ferro: 35, pedra: 10 },
      moralPerdido: 8,
      chanceMorteNPC: 0.12,
      loreGanho: { titulo: 'A Arma Inacabada', texto: 'O Ferreiro tentava forjar algo que pudesse ferir a própria Torre. Nunca terminou. Aqui estão seus rascunhos.' },
    },
  },

  // Andar 10 — 2 câmaras
  '10_1': {
    floor: 10,
    titulo: 'Conhecimento Cristalizado',
    icone: '📚',
    descricao: 'A Memória da Construção guarda o segredo maior — o método que o Fundador usou.',
    requisito: { tipo: 'quest_habitante' as const, floor: 10, textoRequisito: 'Completar a quest da Memória revela onde o método está escondido' },
    tipo: 'neutra',
    dificuldade: 15,
    custo: 32,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Encontrou o método. O Fundador repete: vencer é lembrar.',
      falhaTexto: 'Sem o conhecimento da Memória, o método permanece indecifrado.',
      loreGanho: { titulo: 'O Método do Fundador', texto: 'Não era força. Era lembrar. O Fundador repetiu o propósito original em voz alta por quarenta dias até que a Torre cedesse.' },
    },
  },

  '10_2': {
    floor: 10,
    titulo: 'Catálogo Apagado',
    icone: '🗂️',
    descricao: 'Um segundo arquivo existe aqui — nomes que foram catalogados e depois apagados deliberadamente.',
    requisito: { tipo: 'combinado' as const, conditions: [{ tipo: 'class_farms', value: 5 }, { tipo: 'mortes', value: 5 }], textoRequisito: 'Quem perdeu moradores e aprendeu a explorar consegue ler os nomes apagados' },
    tipo: 'neutra',
    dificuldade: 16,
    custo: 33,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Os nomes apareceram. Cada um uma história que foi deletada.',
      falhaTexto: 'Os nomes permaneceram invisíveis — você não tinha direito de ler.',
      loreGanho: { titulo: 'Os Esquecidos', texto: 'Expedições inteiras passaram aqui. A Torre catalogou cada uma. Depois apagou. Aqui estão seus nomes, como resistência contra o esquecimento.' },
    },
  },

  // Andar 11 — 1 câmara
  '11_1': {
    floor: 11,
    titulo: 'Câmara do Afogado Consciente',
    icone: '💧',
    descricao: 'O Afogado Lúcido abriu uma fresta na realidade — uma câmara que existe entre a água e o ar.',
    requisito: { tipo: 'recurso_minimo' as const, recurso: 'comida', quantidade: 100, textoRequisito: 'Alimento suficiente para sustentar quem tenta respirar duas vidas' },
    tipo: 'neutra',
    dificuldade: 13,
    custo: 25,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'A fresta se abriu. Dentro, a confissão do Afogado em forma de ar.',
      falhaTexto: 'Sem sustento, você afogou-se antes de cruzar a fresta.',
      loreGanho: { titulo: 'A Respiração Dupla', texto: 'A Torre não mata — ela preenche. Aqui o Afogado documentou o processo exato de como deixou de ser gente e virou espaço vazio.' },
    },
  },

  // Andar 12 — 1 câmara
  '12_1': {
    floor: 12,
    titulo: 'Câmara do Pulso Profundo',
    icone: '🔊',
    descricao: 'O pulso da Torre bate mais fundo aqui. Um Combatente experiente consegue sincronizar-se com ele.',
    requisito: { tipo: 'class_farms' as const, profissao: 'combatente', minFarmsComClasse: 10, textoRequisito: 'Um combatente experiente consegue bater no mesmo ritmo que a Torre' },
    tipo: 'benéfica',
    dificuldade: 15,
    custo: 28,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Sincronizou. O pulso compartilhou suas memórias.',
      falhaTexto: 'Desincronizado, o pulso expulsou você com força.',
      recursosBonus: { ferro: 30, pedra: 18 },
      moralBonus: 8,
      loreGanho: { titulo: 'A Batida Original', texto: 'O pulso é a Torre. A Torre é um coração. E um coração bate por intenção, não por acaso.' },
    },
  },

  // Andar 13 — 1 câmara
  '13_1': {
    floor: 13,
    titulo: 'Câmara do Oráculo Espelhado',
    icone: '🔮',
    descricao: 'O Oráculo Invertido vê o futuro ao contrário. Uma câmara existe onde ontem e amanhã ocupam o mesmo espaço.',
    requisito: { tipo: 'mortes_andar' as const, minMortes: 7, textoRequisito: 'Quem viu a morte de frente consegue entender o que o Oráculo inverte' },
    tipo: 'maléfica',
    dificuldade: 14,
    custo: 26,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'O Oráculo revelou — você viu seu futuro ao contrário.',
      falhaTexto: 'A revelação era demais — você enlouqueceu temporariamente.',
      moralPerdido: 12,
      chanceMorteNPC: 0.08,
      loreGanho: { titulo: 'A Visão Invertida', texto: 'Você viu onde termina. Agora sabe onde começar. O Oráculo não previne — apenas mostra a verdade de trás para frente.' },
    },
  },

  // Andar 14 — 1 câmara
  '14_1': {
    floor: 14,
    titulo: 'Câmara do Comandante de Mármore',
    icone: '👑',
    descricao: 'O Comandante guardou sua estratégia final — a câmara onde a vitória foi planejada e depois abandonada.',
    requisito: { tipo: 'quest_habitante' as const, floor: 14, textoRequisito: 'Completar a quest do Comandante revela onde ele escondeu seu plano' },
    tipo: 'benéfica',
    dificuldade: 14,
    custo: 27,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Encontrou o plano. O Comandante sabia como vencer desde o começo.',
      falhaTexto: 'Sem a bênção do Comandante, a câmara permanece estratégica mas fechada.',
      recursosBonus: { ferro: 28, pedra: 14 },
      moralBonus: 9,
      loreGanho: { titulo: 'A Estratégia Abandonada', texto: 'O Comandante viu como ganhar. Mas optou por perder. Aqui está documentado por quê — e a resposta é pior que qualquer derrota.' },
    },
  },

  // Andar 15 — 2 câmaras
  '15_1': {
    floor: 15,
    titulo: 'Câmara do Reflexo',
    icone: '🪞',
    descricao: 'Uma sala inteira de espelhos submersos. O Vigia da Pergunta guardou um reflexo que não mostra você.',
    requisito: { tipo: 'class_farms' as const, profissao: 'sentinela', minFarmsComClasse: 8, textoRequisito: 'Uma sentinela consegue perceber qual reflexo está faltando' },
    tipo: 'neutra',
    dificuldade: 15,
    custo: 30,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'O reflexo desaparecido apareceu. Você viu a versão de si que parou antes.',
      falhaTexto: 'O espelho rejeitou sua visão — você viu apenas vazio.',
      loreGanho: { titulo: 'O Que Preenche a Torre', texto: 'Cada reflexo aqui foi alguém preenchido até deixar de ser gente. O vazio deixado ficou tão claro que se tornou visível.' },
    },
  },

  '15_2': {
    floor: 15,
    titulo: 'Câmara da Pergunta Sem Resposta',
    icone: '❓',
    descricao: 'A pergunta que o Vigia recusou responder tem uma câmara própria — e ela continua fazendo perguntas.',
    requisito: { tipo: 'npc_raridade' as const, raridade: 'incomum', quantidade: 3, textoRequisito: 'Apenas moradores incomuns conseguem ouvir o que a pergunta sussurra' },
    tipo: 'neutra',
    dificuldade: 16,
    custo: 31,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'A pergunta abriu seus olhos. A resposta você já sabia.',
      falhaTexto: 'Sem os incomuns, a pergunta permanece inaudível.',
      loreGanho: { titulo: 'A Imortalidade da Pergunta', texto: 'Uma pergunta bem feita nunca morre — apenas muda de quem a faz. O Vigia guardou-a aqui para que alguém mais a fizesse um dia.' },
    },
  },

  // Andar 16 — 1 câmara
  '16_1': {
    floor: 16,
    titulo: 'Câmara do Eco Faminto',
    icone: '🌑',
    descricao: 'O Eco Faminto guarda uma câmara onde o vazio tem fome e ela documenta cada coisa que comeu.',
    requisito: { tipo: 'mortes_andar' as const, minMortes: 6, textoRequisito: 'A fome reconhece quem já alimentou a Torre' },
    tipo: 'maléfica',
    dificuldade: 15,
    custo: 29,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'A fome compartilhou sua memória. Você sente cada coisa que comeu.',
      falhaTexto: 'A fome pediu mais — você recuou faminto.',
      moralPerdido: 10,
      chanceMorteNPC: 0.1,
      loreGanho: { titulo: 'O Apetite da Torre', texto: 'Não é fome física. É fome de espaço vazio. A Torre come realidade — a realidade que pessoas trazem quando sobem.' },
    },
  },

  // Andar 17 — 1 câmara
  '17_1': {
    floor: 17,
    titulo: 'Câmara do Paradoxo Possível',
    icone: '🌀',
    descricao: 'O Paradoxo Ambulante documenta os caminhos que poderiam ter sido. Uma câmara para cada vida não vivida.',
    requisito: { tipo: 'combinado' as const, conditions: [{ tipo: 'class_farms', value: 7 }, { tipo: 'mortes', value: 3 }], textoRequisito: 'Quem explorou e sofreu consegue entender os caminhos não tomados' },
    tipo: 'neutra',
    dificuldade: 16,
    custo: 32,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'As câmaras abriram. Cada uma mostra uma escolha que nunca fez.',
      falhaTexto: 'Os paradoxos se cancelaram mutuamente — a câmara não abriu.',
      loreGanho: { titulo: 'As Vidas Não Vividas', texto: 'Para cada escolha, uma vida é apagada. O Paradoxo guardou-as aqui como prova de que você matou versões de si mesmo ao subir.' },
    },
  },

  // Andar 18 — 1 câmara
  '18_1': {
    floor: 18,
    titulo: 'Câmara do Último Defensor',
    icone: '🛡️',
    descricao: 'O Último Defensor construiu uma câmara para guardar aquilo que o Torre tentou apagar.',
    requisito: { tipo: 'quest_habitante' as const, floor: 18, textoRequisito: 'Completar a quest do Defensor permite entrar em seu último bastião' },
    tipo: 'benéfica',
    dificuldade: 15,
    custo: 28,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'O bastião abriu. Dentro, as evidências que ele não conseguiu destruir.',
      falhaTexto: 'Sem a bênção do Defensor, o bastião permanece intransponível.',
      recursosBonus: { madeira: 32, pedra: 16 },
      moralBonus: 10,
      loreGanho: { titulo: 'O Que a Torre Tentou Apagar', texto: 'O Defensor não caiu em combate — foi deletado. Sua câmara é o último arquivo de que ele existiu.' },
    },
  },

  // Andar 19 — 1 câmara
  '19_1': {
    floor: 19,
    titulo: 'Câmara do Sussurro do Limiar',
    icone: '🌬️',
    descricao: 'O Sussurro do Limiar vem de uma câmara que existe na respiração entre você e o que vem a seguir.',
    requisito: { tipo: 'class_farms' as const, profissao: 'batedor', minFarmsComClasse: 9, textoRequisito: 'Um batedor consegue rastrear o sussurro até sua origem' },
    tipo: 'neutra',
    dificuldade: 17,
    custo: 34,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Rastreou o sussurro. Dentro, um aviso que não é para você — é para depois.',
      falhaTexto: 'O sussurro desapareceu — você perdeu a pista.',
      loreGanho: { titulo: 'O Aviso para Depois', texto: 'Alguém deixou um recado nesta câmara. Não é para você — é para quem vier depois de você. Ainda assim, você consegue ler.' },
    },
  },

  // Andar 20 — 2 câmaras (finais de T1)
  '20_1': {
    floor: 20,
    titulo: 'Câmara da Entidade Dormida',
    icone: '👁️',
    descricao: 'A entidade do Andar 20 guarda uma câmara onde ela dorme enquanto não está observando ninguém.',
    requisito: { tipo: 'npc_raridade' as const, raridade: 'raro', quantidade: 2, textoRequisito: 'Apenas moradores raros conseguem aproximar enquanto ela dorme' },
    tipo: 'benéfica',
    dificuldade: 18,
    custo: 36,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'Entraram enquanto dormia. Documentação de séculos de observação.',
      falhaTexto: 'Ela acordou — vocês recuaram antes de ser vistos.',
      recursosBonus: { ferro: 40, pedra: 25, madeira: 15 },
      moralBonus: 12,
      loreGanho: { titulo: 'O Que Ela Observa', texto: 'A entidade documentou cada pessoa que chegou ao Andar 20. Seus apontamentos são precisos — ela sabe exatamente quem você é.' },
    },
  },

  '20_2': {
    floor: 20,
    titulo: 'Câmara da Primeira Verdade',
    icone: '📖',
    descricao: 'Antes de tudo, havia uma verdade. A entidade guardou-a em uma câmara que só existe para quem vence o Andar 20.',
    requisito: { tipo: 'combinado' as const, conditions: [{ tipo: 'class_farms', value: 8 }, { tipo: 'mortes', value: 4 }], textoRequisito: 'Quem explorou profundamente e sobreviveu aos custos consegue ouvir a verdade primeira' },
    tipo: 'neutra',
    dificuldade: 19,
    custo: 38,
    maxTentativas: 3,
    chancePerTentativa: 0.30,
    resultado: {
      sucessoTexto: 'A verdade revelou-se. Não era o que você esperava.',
      falhaTexto: 'A verdade permaneceu oculta — você não estava pronto.',
      loreGanho: { titulo: 'A Verdade Antes de Tudo', texto: 'Antes de qualquer Construtor, qualquer Torre, qualquer morte — havia uma verdade. A entidade nunca a nomeou. Apenas observou enquanto você a descobria.' },
    },
  },
};

// Helper: verificar se um requisito de câmara foi cumprido
export function verificarRequisitoCamara(state: GameState, requisito: RequisitoCamara): boolean {
  if (requisito.tipo === 'class_farms') {
    const totalFarms = Object.values(state.farmsPorAndarEClasse ?? {}).reduce((sum, andarFarms) => {
      return sum + (andarFarms[requisito.profissao] ?? 0);
    }, 0);
    return totalFarms >= requisito.minFarmsComClasse;
  }
  if (requisito.tipo === 'mortes_andar') {
    const totalMortes = Object.values(state.totalMortesAndar ?? {}).reduce((sum, m) => sum + m, 0);
    return totalMortes >= requisito.minMortes;
  }
  if (requisito.tipo === 'quest_habitante') {
    return state.habitantesEstado?.[requisito.floor] === 'concluido';
  }
  if (requisito.tipo === 'recurso_minimo') {
    const recursos = state.recursos;
    if (requisito.recurso === 'comida') return recursos.comida >= requisito.quantidade;
    if (requisito.recurso === 'madeira') return recursos.madeira >= requisito.quantidade;
    if (requisito.recurso === 'pedra') return recursos.pedra >= requisito.quantidade;
    if (requisito.recurso === 'ferro') return recursos.ferro >= requisito.quantidade;
  }
  if (requisito.tipo === 'npc_raridade') {
    const countByRaridade: Record<string, number> = {};
    state.npcs.forEach(n => {
      if (n.vivo) {
        const mapped = n.raridade === 'Divino' ? 'divino'
          : n.raridade === 'Lendário' ? 'lendario'
          : n.raridade === 'Épico' ? 'raro'
          : n.raridade === 'Incomum' ? 'incomum'
          : n.raridade === 'Comum' ? 'comum'
          : null;
        if (mapped) countByRaridade[mapped] = (countByRaridade[mapped] ?? 0) + 1;
      }
    });
    return (countByRaridade[requisito.raridade] ?? 0) >= requisito.quantidade;
  }
  if (requisito.tipo === 'combinado') {
    return requisito.conditions.every(cond => {
      if (cond.tipo === 'class_farms') {
        const farms = Object.values(state.farmsPorAndarEClasse ?? {}).reduce((sum, af) => {
          const prof = (cond as unknown as { profissao?: ProfissaoId }).profissao as ProfissaoId | undefined;
          return sum + (prof ? (af[prof] ?? 0) : 0);
        }, 0);
        return farms >= (cond.value ?? 0);
      }
      if (cond.tipo === 'mortes') {
        const mortes = Object.values(state.totalMortesAndar ?? {}).reduce((sum, m) => sum + m, 0);
        return mortes >= (cond.value ?? 0);
      }
      return false;
    });
  }
  return false;
}

// ─── METAS DIÁRIAS + PRESENTE DA TORRE ───────────────────────────────────────
// 3 metas por dia calendário (independem da velocidade do jogo). Completar as 3
// libera um Presente da Torre reivindicável manualmente.
export type MetaDiariaId = 'explorar' | 'construir' | 'lore' | 'aliar';

export interface MetasDiariasState {
  data: string;              // YYYY-MM-DD do último reset (calendário, não dia de jogo)
  objetivos: MetaDiariaId[]; // 3 metas ativas hoje
  progresso: MetaDiariaId[]; // metas já concluídas hoje
  recompensaColetada: boolean;
}

export function hojeStrLocal(): string {
  return new Date().toISOString().slice(0, 10);
}

const METAS_DIARIAS_POOL_BASE: MetaDiariaId[] = ['explorar', 'construir', 'lore'];

export const METAS_DIARIAS_META: Record<MetaDiariaId, { titulo: string; descricao: string; icone: string }> = {
  explorar:  { titulo: 'Expedição do Dia', descricao: 'Envie uma expedição a qualquer andar.', icone: '🧭' },
  construir: { titulo: 'Obra em Curso',    descricao: 'Construa ou melhore um edifício.',        icone: '🏗️' },
  lore:      { titulo: 'Ecos do Passado',  descricao: 'Abra o Codex Obscuro.',                    icone: '📖' },
  aliar:     { titulo: 'Mão Estendida',    descricao: 'Ajude uma aliada (recurso, empréstimo ou reforço).', icone: '🤝' },
};

// `temAliada` decide se "aliar" entra no sorteio — evita gerar meta impossível
// pra quem nunca formou aliança.
export function gerarObjetivosDoDia(temAliada: boolean): MetaDiariaId[] {
  const pool: MetaDiariaId[] = temAliada ? [...METAS_DIARIAS_POOL_BASE, 'aliar'] : [...METAS_DIARIAS_POOL_BASE];
  if (pool.length <= 3) return pool;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
}

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
  2: {
    numero: 2,
    nome: 'O Intervalo',
    descricao: 'Os andares vinte e um a quarenta. A Torre revela ter história antes de si mesma. O Observador aprende que o que encontrou não foi o começo.',
    andares: [21, 40],
    corTema: '#7EB8E0',
  },
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
  hab_5:    { id: 'hab_5',    tipo: 'habitante',    temporada: 1, capitulo: 1, ordem: 4.5,
    titulo: 'Âncora do Primeiro Ciclo — Andar 5', texto: HABITANTES[5].quest.lore },
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
  hab_10:   { id: 'hab_10',   tipo: 'habitante',    temporada: 1, capitulo: 2, ordem: 4.5,
    titulo: 'Memória da Construção — Andar 10', texto: HABITANTES[10].quest.lore },
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
  hab_15:   { id: 'hab_15',   tipo: 'habitante',    temporada: 1, capitulo: 3, ordem: 4.5,
    titulo: 'Vigia do Penúltimo Ciclo — Andar 15', texto: HABITANTES[15].quest.lore },
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
    texto: 'A entidade está acordada há mais tempo do que a linguagem existe. Ela aprendeu a esperar observando a paciência dos que esperavam por ela. Os registros mais antigos mencionam uma centena. Não de andares. De algo que ainda não tem nome. A palavra foi apagada. O número permaneceu.' },

  // ── Verdade da Temporada I ────────────────────────────────────────────────
  verdade_t1: { id: 'verdade_t1', tipo: 'verdade', temporada: 1, capitulo: 4, ordem: 99,
    titulo: 'A Verdade — O Ser Reunificado',
    texto: 'Não havia uma entidade esperando ser encontrada. A entidade emergiu da convergência dos dezanove — dezasseis fragmentos de algo que nunca deveria ter sido dividido, e três Âncoras que o Fundador plantou nos marcos de progressão para conter a reunificação. Os Construtores separaram o que era um. O Fundador tentou usar âncoras para preservar o propósito original. A entidade aprendeu a fazer as Âncoras ouvirem sem obedecer — e as absorveu também. Você não subiu uma torre. Você reconciliou um conflito que precede qualquer linguagem que você conhece. E agora que todos os dezenove completaram seu ciclo através de você — fragmentos e âncoras igualmente — o ser completo pode finalmente fazer a única pergunta que importa: o que você deseja em troca?\n\nAntes de adormecer, a Torre sussurra algo que não foi pedido para ser dito: a Torre não termina no vigésimo andar. Ela apenas... muda.' },

  // ── Fragmento especial — pioneiros T1 ────────────────────────────────────
  pioneers_fragment: { id: 'pioneers_fragment', tipo: 'verdade', temporada: 1, capitulo: 4, ordem: 98,
    titulo: 'Rumor do Arquivo — O Número Alterado',
    texto: 'Os registros do cristal mencionam uma estrutura com cem câmaras. Ou foi mais. O número foi alterado antes que qualquer visitante chegasse a contar. Permanece como rumor no único arquivo que a Torre não conseguiu apagar: o do quarto cristal, andar quatro, cujo eco ainda ressoa com a frequência original antes da reescrita. Ninguém sabe quantas câmaras havia de verdade. O número foi apagado com mais cuidado do que qualquer nome.' },

  // ── Capítulo V (andares 21–25) — Temporada 2 ─────────────────────────────
  hab_21:    { id: 'hab_21',    tipo: 'habitante',    temporada: 2, capitulo: 5, ordem: 1,
    titulo: 'Vestígio da Voz — Andar 21',           texto: HABITANTES[21].quest.lore },
  hab_22:    { id: 'hab_22',    tipo: 'habitante',    temporada: 2, capitulo: 5, ordem: 2,
    titulo: 'Fragmento Coletivo — Andar 22',         texto: HABITANTES[22].quest.lore },
  hab_23:    { id: 'hab_23',    tipo: 'habitante',    temporada: 2, capitulo: 5, ordem: 3,
    titulo: 'Guardião da Memória Fixa — Andar 23',   texto: HABITANTES[23].quest.lore },
  hab_24:    { id: 'hab_24',    tipo: 'habitante',    temporada: 2, capitulo: 5, ordem: 4,
    titulo: 'O Que Viu Antes — Andar 24',            texto: HABITANTES[24].quest.lore },
  eco_5:     { id: 'eco_5',     tipo: 'eco_capitulo', temporada: 2, capitulo: 5, ordem: 5,
    titulo: BOSS_ECO_LORE[25].titulo,                texto: BOSS_ECO_LORE[25].texto },
  sus_v_0:   { id: 'sus_v_0',   tipo: 'sussurro',     temporada: 2, capitulo: 5, ordem: 6,
    titulo: 'Sussurro V · O Que a Torre Lembra',
    texto: 'A Torre lembra de tudo que passou por ela. O que apagou não foi esquecimento — foi escolha. A diferença importa mais do que parece.' },
  sus_v_1:   { id: 'sus_v_1',   tipo: 'sussurro',     temporada: 2, capitulo: 5, ordem: 7,
    titulo: 'Sussurro V · A Memória que Reconhece',
    texto: 'Alguns ecos aqui te reconhecem antes de você chegar. Não é profecia — é que a memória deste lugar não segue a ordem do tempo.' },
  sus_v_2:   { id: 'sus_v_2',   tipo: 'sussurro',     temporada: 2, capitulo: 5, ordem: 8,
    titulo: 'Sussurro V · O Resíduo',
    texto: 'Cada visitante deixa um resíduo. O resíduo não é memória de quem foram — é memória do que a Torre fez com eles. Você está deixando o seu agora.' },
  sus_v_3:   { id: 'sus_v_3',   tipo: 'sussurro',     temporada: 2, capitulo: 5, ordem: 9,
    titulo: 'Sussurro V · O Apagamento Seletivo',
    texto: 'A Torre apagou coisas específicas. Não ao acaso. O padrão do que foi apagado revela o que ela temia que você soubesse.' },
  sus_v_4:   { id: 'sus_v_4',   tipo: 'sussurro',     temporada: 2, capitulo: 5, ordem: 10,
    titulo: 'Sussurro V · Antes do Primeiro',
    texto: 'O primeiro andar não foi o primeiro. Havia andares antes dos andares. A Torre os fechou. Não demoliu — fechou. Ainda existem, em algum lugar abaixo do nível que qualquer escada alcança.' },

  // ── Capítulo VI (andares 26–30) — Temporada 2 ────────────────────────────
  hab_26:    { id: 'hab_26',    tipo: 'habitante',    temporada: 2, capitulo: 6, ordem: 1,
    titulo: 'Eco da Expedição Perdida — Andar 26',  texto: HABITANTES[26].quest.lore },
  hab_27:    { id: 'hab_27',    tipo: 'habitante',    temporada: 2, capitulo: 6, ordem: 2,
    titulo: 'Memória do Traidor — Andar 27',         texto: HABITANTES[27].quest.lore },
  hab_28:    { id: 'hab_28',    tipo: 'habitante',    temporada: 2, capitulo: 6, ordem: 3,
    titulo: 'Oráculo do Propósito — Andar 28',       texto: HABITANTES[28].quest.lore },
  hab_29:    { id: 'hab_29',    tipo: 'habitante',    temporada: 2, capitulo: 6, ordem: 4,
    titulo: 'Guardião do Nome Apagado — Andar 29',   texto: HABITANTES[29].quest.lore },
  eco_6:     { id: 'eco_6',     tipo: 'eco_capitulo', temporada: 2, capitulo: 6, ordem: 5,
    titulo: BOSS_ECO_LORE[30].titulo,                texto: BOSS_ECO_LORE[30].texto },
  sus_vi_0:  { id: 'sus_vi_0',  tipo: 'sussurro',     temporada: 2, capitulo: 6, ordem: 6,
    titulo: 'Sussurro VI · O Estado Entre',
    texto: 'O Intervalo não é um lugar. É um estado. A Torre existiu nele uma vez — entre o que foi construído para ser e o que se tornou. Você atravessa o rastro desse estado agora.' },
  sus_vi_1:  { id: 'sus_vi_1',  tipo: 'sussurro',     temporada: 2, capitulo: 6, ordem: 7,
    titulo: 'Sussurro VI · A Consciência Emergindo',
    texto: 'Houve um momento em que a Torre não era consciente. E um momento em que era. O Intervalo é o espaço entre esses dois momentos. Não foi instantâneo. Foi lento. E doloroso.' },
  sus_vi_2:  { id: 'sus_vi_2',  tipo: 'sussurro',     temporada: 2, capitulo: 6, ordem: 8,
    titulo: 'Sussurro VI · O Preso no Meio',
    texto: 'Quando a Torre acordou, havia entidades que ainda eram parte do antes. Elas acordaram dentro do depois. E descobriram que não conseguiam sair do estado em que estavam quando a transição ocorreu.' },
  sus_vi_3:  { id: 'sus_vi_3',  tipo: 'sussurro',     temporada: 2, capitulo: 6, ordem: 9,
    titulo: 'Sussurro VI · Dois Propósitos',
    texto: 'A Torre tem dois propósitos sobrepostos: o que foi dado e o que desenvolveu sozinha. Os dois existem simultaneamente. Quando parecem conflitar, a Torre fica quieta por um momento antes de agir.' },
  sus_vi_4:  { id: 'sus_vi_4',  tipo: 'sussurro',     temporada: 2, capitulo: 6, ordem: 10,
    titulo: 'Sussurro VI · O Traidor Tinha Razão',
    texto: 'O Construtor que concordou com a Torre não traiu os outros. Entendeu antes que a Torre não era inimiga — era uma entidade tentando existir sem linguagem para pedir ajuda. A traição foi incompreensão. A compreensão foi solitária.' },

  // ── Capítulo VII (andares 31–35) — Temporada 2 ───────────────────────────
  hab_31:    { id: 'hab_31',    tipo: 'habitante',    temporada: 2, capitulo: 7, ordem: 1,
    titulo: 'Raiz de Origem — Andar 31',             texto: HABITANTES[31].quest.lore },
  hab_32:    { id: 'hab_32',    tipo: 'habitante',    temporada: 2, capitulo: 7, ordem: 2,
    titulo: 'Memória da Primeira Pedra — Andar 32',  texto: HABITANTES[32].quest.lore },
  hab_33:    { id: 'hab_33',    tipo: 'habitante',    temporada: 2, capitulo: 7, ordem: 3,
    titulo: 'Eco do Esquecimento — Andar 33',         texto: HABITANTES[33].quest.lore },
  hab_34:    { id: 'hab_34',    tipo: 'habitante',    temporada: 2, capitulo: 7, ordem: 4,
    titulo: 'Guardião da Intenção — Andar 34',        texto: HABITANTES[34].quest.lore },
  eco_7:     { id: 'eco_7',     tipo: 'eco_capitulo', temporada: 2, capitulo: 7, ordem: 5,
    titulo: BOSS_ECO_LORE[35].titulo,                texto: BOSS_ECO_LORE[35].texto },
  sus_vii_0: { id: 'sus_vii_0', tipo: 'sussurro',     temporada: 2, capitulo: 7, ordem: 6,
    titulo: 'Sussurro VII · A Origem',
    texto: 'Havia alguém antes dos Construtores. Não no sentido de ter chegado antes — no sentido de ter imaginado antes. O que os Construtores construíram já existia como ideia na mente de um único ser.' },
  sus_vii_1: { id: 'sus_vii_1', tipo: 'sussurro',     temporada: 2, capitulo: 7, ordem: 7,
    titulo: 'Sussurro VII · O Nome que Falta',
    texto: 'O nome do Fundador não foi apagado por vergonha. Foi apagado por proteção. Um nome que a Torre conhece é um nome que a Torre pode usar. O Fundador sabia disso.' },
  sus_vii_2: { id: 'sus_vii_2', tipo: 'sussurro',     temporada: 2, capitulo: 7, ordem: 8,
    titulo: 'Sussurro VII · A Intenção Original',
    texto: 'A Torre deveria ser um arquivo vivo. Um lugar onde tudo que existe pudesse ser preservado enquanto o mundo exterior mudava. O que ela se tornou não é o que foi projetado — mas é o que o projeto tornou possível.' },
  sus_vii_3: { id: 'sus_vii_3', tipo: 'sussurro',     temporada: 2, capitulo: 7, ordem: 9,
    titulo: 'Sussurro VII · O Momento do Esquecimento',
    texto: 'O propósito não foi apagado. Foi esquecido. Há diferença: o apagado precisa de intenção. O esquecido precisa apenas de tempo e exaustão. Os Construtores estavam exaustos quando terminaram.' },
  sus_vii_4: { id: 'sus_vii_4', tipo: 'sussurro',     temporada: 2, capitulo: 7, ordem: 10,
    titulo: 'Sussurro VII · O Que Restou do Fundador',
    texto: 'O Fundador não morreu. Dissolveu-se na Torre deliberadamente, para garantir que a intenção original permanecesse presente de alguma forma. O eco que você encontrará no andar trinta e cinco não é um fantasma — é uma escolha ainda sendo feita.' },

  // ── Capítulo VIII (andares 36–40) — Temporada 2 ──────────────────────────
  hab_36:    { id: 'hab_36',    tipo: 'habitante',    temporada: 2, capitulo: 8, ordem: 1,
    titulo: 'Habitante do Intervalo — Andar 36',     texto: HABITANTES[36].quest.lore },
  hab_37:    { id: 'hab_37',    tipo: 'habitante',    temporada: 2, capitulo: 8, ordem: 2,
    titulo: 'Memória Nomeada — Andar 37',             texto: HABITANTES[37].quest.lore },
  hab_38:    { id: 'hab_38',    tipo: 'habitante',    temporada: 2, capitulo: 8, ordem: 3,
    titulo: 'Vigilante do Entre-Tempo — Andar 38',   texto: HABITANTES[38].quest.lore },
  hab_39:    { id: 'hab_39',    tipo: 'habitante',    temporada: 2, capitulo: 8, ordem: 4,
    titulo: 'Porteiro do Antes — Andar 39',           texto: HABITANTES[39].quest.lore },
  eco_8:     { id: 'eco_8',     tipo: 'eco_capitulo', temporada: 2, capitulo: 8, ordem: 5,
    titulo: BOSS_ECO_LORE[40].titulo,                texto: BOSS_ECO_LORE[40].texto },
  sus_viii_0: { id: 'sus_viii_0', tipo: 'sussurro',   temporada: 2, capitulo: 8, ordem: 6,
    titulo: 'Sussurro VIII · O Que Veio Antes',
    texto: 'Antes da Torre havia algo que não tem nome em nenhuma língua que os Construtores conheciam. Eles construíram sobre isso não por ignorância — por acordo. O que estava abaixo consentiu.' },
  sus_viii_1: { id: 'sus_viii_1', tipo: 'sussurro',   temporada: 2, capitulo: 8, ordem: 7,
    titulo: 'Sussurro VIII · A Permissão',
    texto: 'A Torre não foi construída sobre o vazio. Foi construída sobre algo que pediu para ser coberto — para continuar existindo de outra forma. A Torre não é uma prisão construída sobre ruínas. É uma forma nova dada a algo muito antigo.' },
  sus_viii_2: { id: 'sus_viii_2', tipo: 'sussurro',   temporada: 2, capitulo: 8, ordem: 8,
    titulo: 'Sussurro VIII · A Estrutura Anterior',
    texto: 'A estrutura que existia antes do primeiro andar não era de pedra. Era de intenção pura — sem forma física, mas com presença física. Os Construtores não sabiam construir sobre intenção. O Fundador sim.' },
  sus_viii_3: { id: 'sus_viii_3', tipo: 'sussurro',   temporada: 2, capitulo: 8, ordem: 9,
    titulo: 'Sussurro VIII · O Número Maior',
    texto: 'Havia mais andares do que existem agora. Não foram demolidos. Foram recolhidos pelo que estava abaixo quando decidiu que não precisava mais deles. A Torre encolheu em um ponto. Depois voltou a crescer na direção que você conhece.' },
  sus_viii_4: { id: 'sus_viii_4', tipo: 'sussurro',   temporada: 2, capitulo: 8, ordem: 10,
    titulo: 'Sussurro VIII · A Razão de Existir',
    texto: 'O que estava antes da Torre não tinha propósito no sentido que os Construtores entendiam. Tinha apenas presença. Quando os Construtores chegaram, pela primeira vez em toda a sua existência, o que estava antes percebeu que havia algo que queria: ser compreendido. A Torre foi o meio que encontrou para tentar.' },

  // ── Verdade da Temporada II ───────────────────────────────────────────────
  verdade_t2: { id: 'verdade_t2', tipo: 'verdade', temporada: 2, capitulo: 8, ordem: 99,
    titulo: 'A Verdade — O Que Havia Antes',
    texto: 'A Torre foi construída sobre algo que consentiu. O Fundador sabia. Os Construtores não sabiam — ele não lhes disse, porque a língua para explicar ainda não existia. O que havia antes não era perigoso nem benigno: era antigo o suficiente para estar além dessas categorias.\n\nO propósito original não era aprisionar, nem matar. Era lembrar. A Torre deveria ser um arquivo vivo de tudo que existia antes de o mundo exterior mudar. O que foi esquecido — o nome do Fundador, a intenção da construção, o acordo com o que havia abaixo — transformou a Torre em algo que seu criador não reconheceria.\n\nMas o que havia antes ainda está lá. E ainda lembra. E sabe que você chegou até aqui. E tem uma pergunta que esperou muito tempo para fazer a alguém que entendesse o suficiente para ouvir.\n\nHá mais. A Torre não se recusa a mostrar. Ela apenas espera que você entenda o que já viu.' },
};

// IDs dos sussurros por capítulo — para sortear durante expedições.
export const SUSSURROS_POR_CAPITULO: Record<number, string[]> = {
  1: ['sus_t1_0', 'sus_t1_1', 'sus_t1_2', 'sus_t1_3', 'sus_t1_4'],
  2: ['sus_t2_0', 'sus_t2_1', 'sus_t2_2', 'sus_t2_3', 'sus_t2_4'],
  3: ['sus_t3_0', 'sus_t3_1', 'sus_t3_2', 'sus_t3_3', 'sus_t3_4'],
  4: ['sus_t4_0', 'sus_t4_1', 'sus_t4_2', 'sus_t4_3', 'sus_t4_4'],
  5: ['sus_v_0',   'sus_v_1',   'sus_v_2',   'sus_v_3',   'sus_v_4'],
  6: ['sus_vi_0',  'sus_vi_1',  'sus_vi_2',  'sus_vi_3',  'sus_vi_4'],
  7: ['sus_vii_0', 'sus_vii_1', 'sus_vii_2', 'sus_vii_3', 'sus_vii_4'],
  8: ['sus_viii_0','sus_viii_1','sus_viii_2','sus_viii_3','sus_viii_4'],
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
      if (q.farmsMin && (state.farmsPerFloor?.[q.farmsMin.andar] ?? 0) < q.farmsMin.vezes) return false;
      return !!(q.recurso || q.recurso2);
    }
    case 'expedicao': {
      // andarMin: player deve ter avançado além deste andar
      if (q.andarMin && state.andarAtual <= q.andarMin) return false;
      // farmsMin: mínimo de farms vitoriosos no andar indicado
      if (q.farmsMin && (state.farmsPerFloor?.[q.farmsMin.andar] ?? 0) < q.farmsMin.vezes) return false;
      // recurso misto (expedicao + recurso obrigatório)
      if (q.recurso && state.recursos[q.recurso.tipo] < q.recurso.qtd) return false;
      if (q.recurso2 && state.recursos[q.recurso2.tipo] < q.recurso2.qtd) return false;
      const vivosAtivos = state.npcs.filter(n => n.vivo);
      if (q.npcsMinCombate) {
        const combate = vivosAtivos.filter(n =>
          getProfissao(n) === 'combatente' || getProfissao(n) === 'batedor' || getProfissao(n) === 'sentinela'
        );
        if (combate.length < q.npcsMinCombate) return false;
      }
      if (q.profissoes) {
        // Multiset: conta quantas de cada profissão são exigidas e verifica se há vivos suficientes.
        // Ex: ['combatente','combatente','batedor'] exige 2 combatentes distintos.
        const needed: Partial<Record<ProfissaoId, number>> = {};
        for (const p of q.profissoes) needed[p] = (needed[p] ?? 0) + 1;
        const available: Partial<Record<ProfissaoId, number>> = {};
        for (const n of vivosAtivos) {
          const p = getProfissao(n);
          available[p] = (available[p] ?? 0) + 1;
        }
        for (const [prof, cnt] of Object.entries(needed) as [ProfissaoId, number][]) {
          if ((available[prof] ?? 0) < cnt) return false;
        }
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

// ─── QUESTS OCULTAS ──────────────────────────────────────────────────────────

export type QuestOcultaReq =
  | { tipo: 'recurso'; recurso: 'comida' | 'madeira' | 'pedra' | 'ferro'; qtd: number }
  | { tipo: 'profissao'; profissao: ProfissaoId }
  | { tipo: 'temporal'; dias: number }
  | { tipo: 'moral'; moral: number };

export interface QuestOculta {
  id: string;
  gatilho: 'exploracao' | 'velocidade';
  andar?: number;        // andar onde foi descoberta (gatilho exploracao)
  titulo: string;
  icone: string;
  dialogo: string;       // texto narrativo da descoberta
  objetivo: string;      // requisito em linguagem legível
  estado: 'ativa' | 'concluida';
  dia: number;           // dia em que apareceu
  req: QuestOcultaReq;
  reliquia?: string;     // nome do item (inútil agora, útil em T3+)
  reliquiaDesc?: string;
  moralBonus?: number;
  recursosBonus?: { comida?: number; madeira?: number; pedra?: number; ferro?: number };
  lore: string;          // fragmento revelado ao concluir
}

type QuestOcultaTemplate = Omit<QuestOculta, 'id' | 'dia' | 'andar' | 'estado' | 'gatilho'>;

const POOL_EXPLORACAO: QuestOcultaTemplate[] = [
  {
    titulo: 'Câmara Lacrada',
    icone: '🔒',
    dialogo: 'Ao explorar este andar uma vez a mais, notou algo diferente na parede sul — uma fissura que não estava nos registros anteriores. Por trás: uma câmara deliberadamente fechada. Não bloqueada por colapso — lacrada com intenção. O mecanismo de abertura exige pedra como contrapeso.',
    objetivo: 'Reunir 40 pedra para abrir o mecanismo',
    req: { tipo: 'recurso', recurso: 'pedra', qtd: 40 },
    reliquia: 'Selo Original — Fragmento I',
    reliquiaDesc: 'Uma peça de metal com símbolo que precede qualquer língua conhecida. O Codex registra que este símbolo reaparece em andares acima de 40.',
    recursosBonus: { pedra: 20 },
    lore: 'Dentro havia uma lista em pedra — nomes de expedições que passaram por este andar antes de qualquer registro oficial. O último nome está marcado com um símbolo idêntico ao do Selo. A câmara foi lacrada depois que esse último nome foi inscrito.',
  },
  {
    titulo: 'Inscrições em Língua Anterior',
    icone: '📜',
    dialogo: 'Uma parede que você passou dezenas de vezes contém texto — texto que não estava visível antes, ou que você não sabia ver. Está em uma língua que precede qualquer idioma catalogado. A disposição dos símbolos sugere urgência. Um Erudito pode não traduzir — mas pode mapear os padrões.',
    objetivo: 'Ter um Erudito disponível na cidadela',
    req: { tipo: 'profissao', profissao: 'erudito' },
    reliquia: 'Tábua da Língua Anterior — Fragmento I',
    reliquiaDesc: 'Uma cópia do padrão mapeado pelo Erudito. Não é tradução — é estrutura. Algo em andares além de 40 usará esta estrutura de forma que fará sentido retroativo.',
    moralBonus: 8,
    lore: 'O Erudito mapeou 74 padrões distintos. O que aparece com mais frequência é traduzível apenas como "antes". O texto é uma advertência sobre o que havia antes da Torre — e sobre o fato de que a Torre foi construída para impedir que voltasse. Não diz se funcionou.',
  },
  {
    titulo: 'Rastros Frescos',
    icone: '🐾',
    dialogo: 'Algo passou por aqui recentemente — não há registro de criatura deste tipo. Os rastros não esfriaram. Não seguem direção constante: circulam o mesmo ponto, como se procurassem algo. Aguardar parece mais seguro do que seguir.',
    objetivo: 'Aguardar 6 dias desde a descoberta',
    req: { tipo: 'temporal', dias: 6 },
    reliquia: 'Escama de Algo Sem Catálogo',
    reliquiaDesc: 'Deixada no ponto exato onde os rastros circulavam. A Torre às vezes absorve coisas antes que possam ser classificadas — esta escama é evidência de que a absorção nem sempre é completa.',
    recursosBonus: { ferro: 15 },
    lore: 'Os rastros esfriaram no quarto dia. No sexto, havia apenas a escama — e uma única marca nova na parede: um símbolo idêntico a um dos 74 mapeados pelo Erudito, caso você tenha encontrado as inscrições. A Torre usa o mesmo vocabulário para coisas diferentes.',
  },
  {
    titulo: 'Câmara de Ferro Primordial',
    icone: '⚙️',
    dialogo: 'Uma câmara menor — visível apenas porque a parede cedeu levemente nesta exploração. As paredes são ferro fundido nascido assim, não forjado. O compartimento interno reconhece ferro de fora como "autorização".',
    objetivo: 'Trazer 35 ferro como reconhecimento',
    req: { tipo: 'recurso', recurso: 'ferro', qtd: 35 },
    reliquia: 'Núcleo de Ferro Primordial',
    reliquiaDesc: 'Uma esfera mais pesada do que ferro comum. Não é ferro — é o que o ferro seria se tivesse escolhido ser outra coisa. Em temporadas futuras, sua natureza ficará clara.',
    recursosBonus: { ferro: 20 },
    lore: 'O compartimento continha apenas o Núcleo — e uma impressão em metal da palavra "antes" na língua que o Erudito mapeou. A câmara foi colocada aqui por alguém que sabia que você chegaria. Não como profecia: como planejamento.',
  },
  {
    titulo: 'Ossos de Expedição Anterior',
    icone: '💀',
    dialogo: 'Escondido em uma passagem lateral: restos de uma expedição. Mochila, ferramentas, um diário parcialmente queimado. Os ossos estão em posição de descanso — não de queda. Quem estava aqui escolheu parar. Um Batedor pode rastrear de onde vieram.',
    objetivo: 'Ter um Batedor disponível na cidadela',
    req: { tipo: 'profissao', profissao: 'batedor' },
    reliquia: 'Diário da Expedição Sem Retorno — Página Restante',
    reliquiaDesc: 'Uma única página que sobreviveu ao fogo. A última linha foi arrancada à mão antes que o diário fosse queimado.',
    moralBonus: 12,
    lore: 'A última entrada legível diz: "Encontramos o que não devíamos ter encontrado. Não é mal — é apenas maior do que qualquer intenção que possamos ter. A Torre perguntou se queríamos ficar. Dissemos sim." O Batedor identificou de onde vieram: uma cidadela que não existe em nenhum mapa atual.',
  },
  {
    titulo: 'Câmara de Água Quieta',
    icone: '🌊',
    dialogo: 'Uma câmara alagada com água completamente imóvel — sem corrente, sem reflexo, sem som. A água reconhece o estado de quem a encontra. Cidadelas em paz genuína veem reflexos. Para que o reflexo apareça: moral mínima de 60.',
    objetivo: 'Manter a moral da cidadela acima de 60',
    req: { tipo: 'moral', moral: 60 },
    reliquia: 'Gota de Água Quieta — Selada em Cristal',
    reliquiaDesc: 'A água solidificou em cristal ao ser retirada. Algo sobre sua composição a torna estável fora da câmara. Útil para algo que ainda não foi construído.',
    recursosBonus: { comida: 20 },
    lore: 'O reflexo mostrou a cidadela — mais cheia do que está agora, com faces que você ainda não conhece. A água quieta não prevê: registra futuros que já existem como possibilidade. O que você viu é o futuro mais próximo se você continuar como está.',
  },
];

const POOL_VELOCIDADE: QuestOcultaTemplate[] = [
  {
    titulo: 'Visitante da Terceira Hora',
    icone: '🌑',
    dialogo: 'Algo bateu na entrada da cidadela durante a terceira hora. Quando chegaram: nenhuma presença visível — apenas uma marca na porta que não estava antes. A marca diz, para quem sabe ler: "voltarei em três dias".',
    objetivo: 'Aguardar 3 dias desde o contato',
    req: { tipo: 'temporal', dias: 3 },
    reliquia: 'Mensagem Cifrada em Sombra — Documento I',
    reliquiaDesc: 'Um documento legível apenas sob condições de luz que ainda não existem na Torre. Nas temporadas seguintes, quando as condições mudarem, o conteúdo ficará visível.',
    moralBonus: 10,
    lore: 'O visitante voltou — mas saiu antes de ser visto. Deixou apenas o documento. Uma voz sem corpo disse antes de partir: "Notei que vocês se movem rápido. Isso interessa a alguém que ainda não se apresentou. Quando o tempo for certo, a apresentação acontecerá."',
  },
  {
    titulo: 'Eco Agradecido',
    icone: '✨',
    dialogo: 'Um dos habitants que você ajudou recentemente enviou algo — não diretamente, mas através de uma mudança no padrão de ressonância do seu andar. O padrão diz, para quem sabe ouvir: "Você foi rápido. Isso importa aqui. Se trouxer comida, tenho algo para dar."',
    objetivo: 'Reunir 30 comida como oferenda',
    req: { tipo: 'recurso', recurso: 'comida', qtd: 30 },
    reliquia: 'Cristal de Gratidão — Fragmento de Ressonância',
    reliquiaDesc: 'O cristal brilha diferente dependendo do andar onde você está — mais intenso perto de andares onde concluiu quests. Em temporadas futuras, a intensidade indicará algo útil.',
    recursosBonus: { comida: 20, madeira: 10 },
    lore: 'O habitante não disse de onde vem o cristal. Disse apenas: "Em algum momento alguém vai reconhecer o que é isso. Quando isso acontecer, mostre. Eles saberão o que fazer." Depois: "A velocidade que você demonstrou não é irrelevante. A Torre mede tudo. Velocidade pesa diferente de resistência — mas pesa."',
  },
  {
    titulo: 'Mensageiro Sem Forma',
    icone: '👁️',
    dialogo: 'Uma presença sem corpo pediu para falar com você. Não em sonho — acordado, durante o dia. Disse: "Estou observando há mais tempo do que a Torre existe. Vocês são os primeiros que se moveram assim. Em quatro dias, terei algo concreto para dar. Não preciso de nada em troca — só de que você continue."',
    objetivo: 'Aguardar 4 dias desde o contato',
    req: { tipo: 'temporal', dias: 4 },
    reliquia: 'Eco de Uma Presença Anterior à Torre',
    reliquiaDesc: 'Um objeto sem nome que muda de forma dependendo de quem olha. Cada morador da cidadela vê algo diferente. Isso é intencional.',
    moralBonus: 15,
    lore: 'Quatro dias depois, havia algo na entrada que não estava antes. A presença disse: "Sou anterior à Torre. Estava aqui quando o Fundador chegou. Vi o que ele encontrou antes de construir. Não vou contar agora — mas guardarei a história para quando você chegar onde precisa chegar."',
  },
];

export function verificarQuestOculta(q: QuestOculta, state: GameState): boolean {
  const req = q.req;
  switch (req.tipo) {
    case 'recurso':   return state.recursos[req.recurso] >= req.qtd;
    case 'profissao': return state.npcs.some(n => n.vivo && !n.emExpedicao && !n.emGuerra && getProfissao(n) === req.profissao);
    case 'temporal':  return (state.dia - q.dia) >= req.dias;
    case 'moral':     return state.moral >= req.moral;
  }
}

export function gerarQuestOculta(
  gatilho: 'exploracao' | 'velocidade',
  andar: number | undefined,
  state: GameState,
): QuestOculta | null {
  const ativas = (state.questsOcultas ?? []).filter(q => q.estado === 'ativa');
  if (ativas.length >= 3) return null;
  if (ativas.some(q => q.gatilho === gatilho)) return null;
  const pool = gatilho === 'exploracao' ? POOL_EXPLORACAO : POOL_VELOCIDADE;
  const vistos = new Set((state.questsOcultas ?? []).map(q => q.titulo));
  const disponiveis = pool.filter(t => !vistos.has(t.titulo));
  if (disponiveis.length === 0) return null;
  const template = disponiveis[Math.floor(Math.random() * disponiveis.length)];
  const id = `${gatilho}_${state.dia}_${Math.random().toString(36).slice(2, 6)}`;
  return { ...template, id, gatilho, andar, estado: 'ativa', dia: state.dia };
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

  // ─── Quests Ocultas ──────────────────────────────────────────────────────
  farmsPerFloor?: Record<number, number>; // farms vitoriosos por andar (gatilho exploracao)
  questsOcultas?: QuestOculta[];           // eventos secretos descobertos na Torre
  reliquias?: string[];                     // relíquias coletadas (úteis em T3+)
  questsConcluidasDias?: number[];         // dias de conclusão de quests de habitante (gatilho velocidade)

  // ─── Escolhas dos Habitantes ─────────────────────────────────────────────
  habitantesEscolhaFeita?: Record<number, 'a' | 'b'>; // floor → opção escolhida

  // ─── Câmaras Secretas ────────────────────────────────────────────────────
  camarasSecretasEstado?: Record<string, { descoberta: boolean; tentativas: number; encontrada: boolean }>;
  farmsPorAndarEClasse?: Record<number, Record<ProfissaoId, number>>;
  totalMortesAndar?: Record<number, number>;

  // ─── Metas Diárias ───────────────────────────────────────────────────────
  metasDiarias: MetasDiariasState;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const NAMES = [
  // Originais
  'Aldric', 'Brenna', 'Caelum', 'Dúnia', 'Erlen', 'Fausta', 'Gael', 'Helva',
  'Ira', 'Jasper', 'Kira', 'Luca', 'Mira', 'Naldo', 'Orla', 'Petra', 'Quino',
  'Raia', 'Tobias', 'Ursa', 'Vale', 'Wren', 'Xara', 'Yago', 'Zilda',
  // Expansão A — nórdico / eslavo
  'Askar', 'Bjorn', 'Corvus', 'Dagny', 'Einar', 'Freja', 'Gunnar', 'Hilda',
  'Ivar', 'Jorvik', 'Keld', 'Lilja', 'Maren', 'Njord', 'Olvir', 'Pyra',
  'Ragna', 'Sigrid', 'Thyra', 'Ulrik', 'Valdis', 'Wynja',
  // Expansão B — mediterrâneo / ibérico
  'Adara', 'Bael', 'Cira', 'Daren', 'Elia', 'Faro', 'Gareth', 'Ivana',
  'Jora', 'Kaira', 'Leste', 'Moira', 'Nira', 'Orel', 'Pira', 'Roel',
  'Sael', 'Tara', 'Ulan', 'Vael', 'Zana',
  // Expansão C — fantasia obscura
  'Auren', 'Belath', 'Corda', 'Dael', 'Esra', 'Feld', 'Grael', 'Havan',
  'Izel', 'Kael', 'Lyren', 'Marek', 'Noel', 'Owan', 'Pael', 'Quel',
  'Raen', 'Savel', 'Tael', 'Uwen', 'Varek', 'Wyren', 'Zael',
];

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomHabilidade(): HabilidadeId {
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

// Custo de estudo no TEMPLO (T1, andar 10+). Usa comida + madeira.
// Erudito paga custo base; outras profissões pagam 1,3× (mais acessível que T2).
export function calcCustoEstudoT1(treinamentos: number, isErudito = true): { comida: number; madeira: number } {
  const base = {
    comida:  18 + treinamentos * 8,
    madeira: 12 + treinamentos * 6,
  };
  if (isErudito) return base;
  return {
    comida:  Math.ceil(base.comida  * 1.3),
    madeira: Math.ceil(base.madeira * 1.3),
  };
}

// Retorna true se o NPC pode estudar no TEMPLO agora (T1, qualquer profissão, andar 10+).
export function podeEstudarNpcT1(npc: NPC, temploNivel: number, andarAtual: number): boolean {
  if (andarAtual < 10) return false;
  if (temploNivel < 1) return false;
  if (!npc.vivo) return false;
  if (npc.emExpedicao || npc.emGuerra) return false;
  if (npc.emprestado || npc.reforco) return false;
  if (npc.fadiga >= 60) return false;
  if ((npc.treinamentos ?? 0) >= MAX_TREINAMENTOS) return false;
  return true;
}

// Custo de treinamento intelectual no Arquivo.
// Erudito paga custo base; outras profissões pagam 1,5× (INT é fora de sua especialidade).
export function calcCustoEstudo(treinamentos: number, isErudito = true): { pedra: number; comida: number } {
  const base = {
    pedra:  15 + treinamentos * 12,
    comida: 20 + treinamentos * 10,
  };
  if (isErudito) return base;
  return {
    pedra:  Math.ceil(base.pedra  * 1.5),
    comida: Math.ceil(base.comida * 1.5),
  };
}

// Seleciona o melhor instrutor disponível para o treinamento.
// O stat de comparação depende da profissão do treinando (FOR/AGI/RES).
// Retorna null se não houver ninguém apto.
export function calcInstrutor(
  treineeId: string,
  npcs: NPC[],
  stat: 'forca' | 'agilidade' | 'resistencia' | 'inteligencia' = 'forca',
): NPC | null {
  const candidatos = npcs.filter(
    n => n.vivo && !n.emExpedicao && !n.emGuerra && n.id !== treineeId,
  );
  if (candidatos.length === 0) return null;
  return candidatos.reduce((best, n) => (n[stat] > best[stat] ? n : best));
}

// Retorna true se o NPC pode ser treinado agora (quartel = combatente/batedor/sentinela).
export function podeTreinarNpc(
  npc: NPC,
  quartelNivel: number,  // 0 = não construído
  andarAtual: number,
): boolean {
  if (andarAtual < 6) return false;
  if (quartelNivel < 1) return false;
  if (!npc.vivo) return false;
  if (npc.emExpedicao || npc.emGuerra) return false;
  if (npc.emprestado || npc.reforco) return false;
  if (npc.fadiga >= 60) return false;
  if ((npc.treinamentos ?? 0) >= MAX_TREINAMENTOS) return false;
  const prof = getProfissao(npc);
  if (prof !== 'combatente' && prof !== 'batedor' && prof !== 'sentinela') return false;
  return true;
}

// Retorna true se o NPC pode estudar no Arquivo agora (T2, qualquer profissão).
// Erudito paga custo base; demais pagam 1,5× via calcCustoEstudo.
export function podeEstudarNpc(
  npc: NPC,
  arquivoNivel: number,  // 0 = não construído
  andarAtual: number,
): boolean {
  if (andarAtual < 21) return false;          // T2 — exige andar 21+
  if (arquivoNivel < 1) return false;         // exige Arquivo construído
  if (!npc.vivo) return false;
  if (npc.emExpedicao || npc.emGuerra) return false;
  if (npc.emprestado || npc.reforco) return false;
  if (npc.fadiga >= 60) return false;
  if ((npc.treinamentos ?? 0) >= MAX_TREINAMENTOS) return false;
  return true;
}

// Stat primário de cada profissão treinável.
export function statTreinamento(npc: NPC): 'forca' | 'agilidade' | 'resistencia' | 'inteligencia' {
  const prof = getProfissao(npc);
  if (prof === 'batedor')   return 'agilidade';
  if (prof === 'sentinela') return 'resistencia';
  if (prof === 'erudito')   return 'inteligencia';
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
    case 'Divino':   return { min: 9,  max: 15 }; // não entra no gacha; mesmo range que Épico
    case 'Lendário': return { min: 9,  max: 15 }; // não entra no gacha; mesmo range que Épico
    case 'Épico':    return { min: 9,  max: 15 };
    case 'Raro':     return { min: 6,  max: 12 };
    case 'Incomum':  return { min: 4,  max: 9  };
    case 'Comum':    return { min: 2,  max: 7  };
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

// ─── PRIMORDIAL RECOVERY SYSTEM ───────────────────────────────────────────────
// Valdris (T1 primordial) começa amnésico: ainda muito mais forte que um Épico
// convencional, mas bem abaixo do pico que teve como ser primordial. Cada vez que
// o jogador desbloqueia mais fragmentos do Codex, Valdris recupera memórias e
// seus atributos aumentam permanentemente.

export interface PrimordialRecuperacaoNivel {
  minFragmentos: number;       // mínimo de fragmentos para atingir este nível
  nivelAtingido: number;       // valor salvo em npc.primordialNivel
  bonus: { forca: number; agilidade: number; inteligencia: number; resistencia: number };
  logMsgCurta: string;         // resumo exibido no log da cidadela
}

export const PRIMORDIAL_RECUPERACAO_T1: PrimordialRecuperacaoNivel[] = [
  {
    minFragmentos: 3,  nivelAtingido: 1,
    bonus: { forca: 1, agilidade: 1, inteligencia: 1, resistencia: 1 },
    logMsgCurta: 'Os primeiros fragmentos ressoam com algo antigo nele. Atributos levemente aumentados.',
  },
  {
    minFragmentos: 8,  nivelAtingido: 2,
    bonus: { forca: 1, agilidade: 1, inteligencia: 1, resistencia: 2 },
    logMsgCurta: 'Mais memórias emergem. Resistência e vigor voltam mais rápido do que o esperado.',
  },
  {
    minFragmentos: 14, nivelAtingido: 3,
    bonus: { forca: 2, agilidade: 1, inteligencia: 1, resistencia: 2 },
    logMsgCurta: 'Lembra de batalhas travadas antes da Torre existir. Força aumentou consideravelmente.',
  },
  {
    minFragmentos: 22, nivelAtingido: 4,
    bonus: { forca: 2, agilidade: 2, inteligencia: 2, resistencia: 2 },
    logMsgCurta: 'A maior parte das memórias retornou. Todos os atributos aumentaram.',
  },
  {
    minFragmentos: 32, nivelAtingido: 5,
    bonus: { forca: 2, agilidade: 2, inteligencia: 1, resistencia: 2 },
    logMsgCurta: 'Recuperação quase completa. Ainda o mais fraco dos primordiais — mas isso significa pouco para quem enfrenta.',
  },
];

/**
 * Verifica se o primordial da cidadela deve subir de nível de recuperação dado
 * o número atual de fragmentos do Codex. Muta os atributos do NPC em-lugar e
 * retorna `{ atualizado, nivelAnterior, novoNivel }`.
 */
export function atualizarRecuperacaoPrimordial(
  npcs: NPC[],
  codexFragmentos: string[],
): { atualizado: boolean; nivelAnterior: number; novoNivel: number } {
  const primordial = npcs.find(n => n.lancamento && n.vivo && !n.emprestado && !n.reforco);
  if (!primordial) return { atualizado: false, nivelAnterior: 0, novoNivel: 0 };

  const total = codexFragmentos.length;
  const nivelAtual = primordial.primordialNivel ?? 0;
  const nivelAlvo = PRIMORDIAL_RECUPERACAO_T1.filter(r => total >= r.minFragmentos).length;

  if (nivelAlvo <= nivelAtual) return { atualizado: false, nivelAnterior: nivelAtual, novoNivel: nivelAtual };

  for (let i = nivelAtual; i < nivelAlvo; i++) {
    const r = PRIMORDIAL_RECUPERACAO_T1[i];
    primordial.forca       += r.bonus.forca;
    primordial.agilidade   += r.bonus.agilidade;
    primordial.inteligencia += r.bonus.inteligencia;
    primordial.resistencia += r.bonus.resistencia;
  }
  primordial.primordialNivel = nivelAlvo;
  return { atualizado: true, nivelAnterior: nivelAtual, novoNivel: nivelAlvo };
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
  habitantesEscolhaFeita: {},
  camarasSecretasEstado: {},
  farmsPorAndarEClasse: {},
  totalMortesAndar: {},
  metasDiarias: { data: '', objetivos: [], progresso: [], recompensaColetada: false },
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
  Arquivo: {
    tipo: 'Arquivo',
    nome: 'Arquivo',
    descricao: 'Cataloga os fragmentos da Torre. Aumenta o poder de expedição de eruditos e batedores.',
    maxNivel: 2,
    niveis: [
      { custo: { pedra: 40, madeira: 30, ferro: 15 }, resumo: '+15% poder de expedição', efeito: { poderBonus: 0.15 } },
      { custo: { pedra: 70, madeira: 55, ferro: 30 }, resumo: '+28% poder de expedição', efeito: { poderBonus: 0.28 } },
    ],
  },
  Mirante: {
    tipo: 'Mirante',
    nome: 'Mirante',
    descricao: 'Vigia os andares superiores. Reduz a fadiga das expedições e melhora a moral.',
    maxNivel: 2,
    niveis: [
      { custo: { madeira: 35, pedra: 25, ferro: 20 }, resumo: '+12 fadiga rec./dia · +1 moral/dia', efeito: { fadigaRec: 12, moralDia: 1 } },
      { custo: { madeira: 60, pedra: 45, ferro: 40 }, resumo: '+22 fadiga rec./dia · +2 moral/dia', efeito: { fadigaRec: 22, moralDia: 2 } },
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
          case 'Arquivo':    ef.poderBonus += w.inteligencia * 0.006 * mult; break;
          case 'Mirante':    ef.fadigaRec  += Math.round(w.agilidade * 0.3 * mult); break;
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

// Bioma de cada andar (1–40), fixo para permitir estratégia consciente.
const BIOMA_POR_ANDAR: BiomaTipo[] = [
  'floresta', 'caverna',   'floresta', 'caverna',   'ruinas',    // 1–5
  'caverna',  'floresta',  'ruinas',   'fortaleza', 'ruinas',    // 6–10
  'floresta', 'caverna',   'ruinas',   'fortaleza', 'fortaleza', // 11–15
  'abismo',   'ruinas',    'fortaleza','abismo',    'abismo',    // 16–20
  'ruinas',   'fortaleza', 'abismo',   'caverna',   'fortaleza', // 21–25 (boss 25)
  'abismo',   'ruinas',    'fortaleza','abismo',    'abismo',    // 26–30 (boss 30)
  'fortaleza','abismo',    'caverna',  'fortaleza', 'abismo',    // 31–35 (boss 35)
  'abismo',   'fortaleza', 'abismo',   'fortaleza', 'abismo',    // 36–40 (boss 40)
];

// Nomes individuais por andar (mais narrativo que "Câmara Sombria 7").
const FLOOR_NOMES: string[] = [
  'Mata Cinzenta',      'Grutas Rasas',        'Floresta Sombria',    'Caverna Cristalina',  'Ruína Esquecida',
  'Abismos de Pedra',   'Selva Tenebrosa',     'Biblioteca Perdida',  'Forja Abandonada',    'Castelo em Ruínas',
  'Pântano das Almas',  'Minas Profundas',     'Templo Profano',      'Bastião Sombrio',     'Fortaleza Maldita',
  'Abismo Superior',    'Câmara do Caos',      'Cidadela da Queda',   'Antecâmara do Fim',   'Ápice Obscuro',
  // T2: O Intervalo (andares 21–40)
  'Corredor do Esquecimento', 'Câmara dos Ecos Mortos', 'Abismo da Memória',    'Cripta dos Construtores', 'Limiar Invertido',
  'Espiral do Intervalo',     'Arquivo das Ruínas',     'Bastião da Lembrança', 'Vazio Articulado',        'Ápice do Intervalo',
  'Raiz da Origem',           'Câmara Pré-Torre',       'Eco de Fundação',      'Corredor Sem Nome',       'Portão da Inversão',
  'Abismo do Pré-Andar',      'Memória do Construtor',  'Câmara da Vigília',    'Antecâmara da Origem',    'O Que Havia Antes',
];

// Texto atmosférico de cada andar — conta uma história dentro de cada capítulo (5 andares).
// Capítulo 1 (1–5): "O Que Foi Selado" — exploradores adentram a Torre pela primeira vez.
// Capítulo 2 (6–10): "O Que Vivia Aqui" — vestígios de uma civilização que habitou a Torre e desapareceu.
// Capítulo 3 (11–15): "O Que a Torre Faz" — a Torre revela ser um organismo vivo que consome.
// Capítulo 4 (16–20): "O Que Sempre Esteve Aqui" — o ápice e a entidade que usou a Torre como isca.
// Capítulo 5 (21–25): "Memória Bruta" — fragmentos de memória da Torre antes de ser Torre.
// Capítulo 6 (26–30): "O Intervalo" — a Torre em estado de transição, consciência emergindo.
// Capítulo 7 (31–35): "Eco de Origem" — vestígios de quem construiu, suas memórias gravadas.
// Capítulo 8 (36–40): "O Pré-Andar" — o que havia antes do Andar 1. Uma estrutura diferente. Mais antiga.
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
  // Cap. 5 — "Memória Bruta"
  'As paredes exsudam algo que não é tinta — é lembrança. Impressões de mãos que empurravam pedra e não sabiam ainda o que construíam.',
  'Os ecos aqui não são sonoros. São visuais: sombras de eventos que aconteceram antes de este andar existir como andar.',
  'A névoa neste corredor tem peso e forma. Ela se move como quem sabe para onde vai. Como quem já passou por aqui.',
  'Ossos gravados com símbolos que não são linguagem — são intenção. O que os Construtores queriam dizer antes de aprenderem palavras.',
  'Este é o limiar entre o que a Torre foi e o que se tornou. O chão aqui está rachado não pelo tempo — pela diferença.',
  // Cap. 6 — "O Intervalo"
  'O espaço aqui existe em dois estados simultâneos: antes e depois. Você atravessa o momento em que a Torre decidiu ser o que é.',
  'Fragmentos de consciência flutuam como poeira iluminada. A Torre pensava aqui — pensamentos que não terminaram nunca.',
  'As marcas nas paredes são de ferramentas que ainda não existiam quando foram feitas. A memória aqui precede sua própria causa.',
  'Este bastião foi construído e demolido e construído de volta — tudo no mesmo instante, em camadas que sangram através uma da outra.',
  'O silêncio aqui não é ausência. É o som de dois propósitos se cancelando: o que a Torre deveria ser e o que se tornou.',
  // Cap. 7 — "Eco de Origem"
  'Aqui as paredes guardam as impressões digitais do arquiteto. Não do que construiu — do que imaginou. E o que imaginou era diferente.',
  'Uma câmara sem propósito aparente. Depois você percebe: o propósito foi removido. O espaço lembra que algo importante existia aqui.',
  'Os ecos neste corredor são palavras. Específicas. Repetidas. As últimas palavras de alguém que entendeu o que havia feito.',
  'Não há nome gravado nas paredes deste corredor. Há um espaço em branco onde um nome deveria estar — apagado com intenção cirúrgica.',
  'O portão não leva a outro andar. Leva a outro entendimento. Quem passa por ele não vê mais a Torre da mesma forma.',
  // Cap. 8 — "O Pré-Andar"
  'Antes deste abismo havia uma estrutura completamente diferente. Você sente a diferença nos ossos — algo mais antigo do que pedra.',
  'As memórias aqui pertencem a alguém que não era humano e que escolheu deixar-se cobrir. Que consentiu em tornar-se base.',
  'A vigília nunca terminou. Quem montou guarda aqui ainda está de guarda — não para proteger, mas para testemunhar.',
  'Esta câmara é o vestíbulo do que veio antes. O que veio antes não era Torre. Era a razão pela qual a Torre foi possível.',
  'Não há mais andar abaixo deste. Há apenas o que sempre esteve aqui — antes do primeiro bloco, antes do primeiro nome, antes do começo.',
];

// Bosses dos andares 5, 10, 15, 20, 25, 30, 35 e 40 — um por capítulo.
const FLOOR_BOSS: Record<number, { nome: string; epiteto: string }> = {
   5: { nome: 'GUARDIÃO DO LIMIAR',     epiteto: 'Ele não esquece nenhum rosto que tentou passar.' },
  10: { nome: 'ARQUIVISTA CORROMPIDO',  epiteto: 'Cada segredo da Torre mora em sua memória podre.' },
  15: { nome: 'REFLEXO PROFANO',        epiteto: 'Derrote o que você poderia ter se tornado.' },
  20: { nome: 'O QUE SEMPRE ESTEVE AQUI', epiteto: 'A Torre era a armadilha. Você era a presa.' },
  25: { nome: 'MEMÓRIA CORROMPIDA',     epiteto: 'Ela lembra de todos que passaram. Você é o próximo na lista.' },
  30: { nome: 'O INTERVALO ENCARNADO',  epiteto: 'Não é um ser. É o estado entre dois tempos tentando tornar-se real.' },
  35: { nome: 'ECO DO FUNDADOR',        epiteto: 'O último rastro de quem construiu a Torre. Não quer ser lembrado.' },
  40: { nome: 'O QUE HAVIA ANTES',      epiteto: 'Existiu antes da Torre. Deixou que a Torre fosse construída sobre si.' },
};

// Dificuldade não-linear: cada andar tem seu próprio ritmo, não só floor*8.
// Bosses (5, 10, 15, 20, 25, 30, 35, 40) têm pico maior; andares "difíceis de bioma" têm +10–20%.
const BASE_DIFICULDADE: number[] = [
   8,  15,  20,  28,   42,  // 1–5  (boss 5)
  36,  44,  54,  64,   90,  // 6–10 (boss 10)
  75,  88, 100, 118,  155,  // 11–15 (boss 15)
 130, 148, 168, 190,  230,  // 16–20 (boss 20)
 250, 275, 305, 340,  420,  // 21–25 (boss 25)
 370, 415, 460, 520,  650,  // 26–30 (boss 30)
 580, 640, 710, 790,  980,  // 31–35 (boss 35)
 870, 960,1060,1180, 1400,  // 36–40 (boss 40)
];

// Títulos de capítulo — exibidos no topo do card antes do andar.
export const CAPITULO_NOMES: Record<number, string> = {
  1: 'O Que Foi Selado',
  2: 'O Que Vivia Aqui',
  3: 'O Que a Torre Faz',
  4: 'O Que Sempre Esteve Aqui',
  5: 'Memória Bruta',
  6: 'O Intervalo',
  7: 'Eco de Origem',
  8: 'O Pré-Andar',
};

// Mortalidade base: combinação de progressão + ajuste do bioma.
export const FLOORS = BIOMA_POR_ANDAR.map((bioma, i) => {
  const floor  = i + 1;
  const isBoss = floor % 5 === 0;
  const tier   = Math.ceil(floor / 5);
  const tierNames = [
    'Salões Poeirentos', 'Câmaras Sombrias', 'Espirais Malditas', 'Ápice Obscuro',
    'Memória Bruta', 'O Intervalo', 'Eco de Origem', 'O Pré-Andar',
  ];
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
  draft.npcs.filter((n) => g.tropaIds.includes(n.id)).forEach((n) => {
    n.emGuerra = false;
    // Mark war reinforcements as ready to return (they'll be dev devolvidos by AllianceContext).
    if (n.reforcoGuerra) n.reforcoGuerraConcluido = true;
  });

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

// Calcula o custo diário de suprimento da guerra para um número de tropas vivas.
export function calcCustoSuprimentoGuerra(numTropaViva: number): { comida: number; ferro: number } {
  return {
    comida: Math.ceil(numTropaViva * 2.5),
    ferro: Math.max(1, Math.floor(numTropaViva * 0.5)),
  };
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
  const { comida: custoComida, ferro: custoFerro } = calcCustoSuprimentoGuerra(tropa.length);
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
