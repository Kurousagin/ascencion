import { HABITANTES_LORE, BOSS_LORE, SUSSURROS_LORE, VERDADES_LORE, ESCOLHAS_LORE, PRIMORDIAIS_LORE, VESTIGIOS_LORE, MARCADOS_LORE } from './lore-content';
import { CAMARAS_LORE } from './lore-camaras';

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
  // ─── Motor de vida (npc-engine) ───────────────────────────────────────────
  // `nome` continua sendo a string de exibição completa. `sobrenome` isola a CASA
  // (linhagem) para a lógica social/adoção. `casaFundador` marca quem ergueu a
  // própria casa (prestígio). `fama` acumula feitos e habilita fundar casa.
  sobrenome?: string;
  casaFundador?: boolean;
  fama?: number;
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

export type EdificioTipo = 'Fogueira' | 'Fazenda' | 'Enfermaria' | 'Quartel' | 'Templo' | 'Armazem' | 'Alojamento' | 'Arquivo' | 'Mirante' | 'RetratoTorre';

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
  RetratoTorre: 'erudito',
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

// ─── Acontecimentos (feed de vida + toasts) ───────────────────────────────────
// Entrega orgânica dos eventos de autonomia dos NPCs/mundo — sem exigir que o
// jogador abra o log. Importância deriva do tipo do evento.
export type ImportanciaAcontecimento = 'baixa' | 'media' | 'alta';
export interface Acontecimento {
  id: string;
  tipo: LogTipo;
  mensagem: string;
  dia: number;
  importancia: ImportanciaAcontecimento;
}
export function importanciaDe(tipo: LogTipo): ImportanciaAcontecimento {
  if (tipo === 'morte' || tipo === 'traicao' || tipo === 'vitoria') return 'alta';
  if (tipo === 'descoberta' || tipo === 'evento' || tipo === 'alerta') return 'media';
  return 'baixa';
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
    fala: HABITANTES_LORE[1].fala,
    falamissão: HABITANTES_LORE[1].falamissão,
    falaConcluso: HABITANTES_LORE[1].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 2 Batedores e conquistar o Andar 5',
      profissoes: ['batedor', 'batedor'], andarMin: 5,
      ecoBonus: 20, moralBonus: 5,
      lore: HABITANTES_LORE[1].questLore,
      recompensaDesc: '+20% loot neste andar · +5 Moral',
    },
  },
  2: {
    floor: 2, nome: 'Eco dos Construtores', papel: 'Memória Coletiva', icone: '⚒️',
    fala: HABITANTES_LORE[2].fala,
    falamissão: HABITANTES_LORE[2].falamissão,
    falaConcluso: HABITANTES_LORE[2].falaConcluso,
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 2 ao menos 3 vezes e ter 45 pedra',
      recurso: { tipo: 'pedra', qtd: 45 }, farmsMin: { andar: 2, vezes: 3 },
      ecoBonus: 25, recursosBonus: { pedra: 10 },
      lore: HABITANTES_LORE[2].questLore,
      recompensaDesc: '+25% loot neste andar · +10 Pedra',
    },
  },
  3: {
    floor: 3, nome: 'Tecelã de Raízes', papel: 'Guardiã do Crescimento', icone: '🌱',
    fala: HABITANTES_LORE[3].fala,
    falamissão: HABITANTES_LORE[3].falamissão,
    falaConcluso: HABITANTES_LORE[3].falaConcluso,
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 8 de Moral (custo imediato)',
      custo: { moral: 8 },
      ecoBonus: 20, recursosBonus: { madeira: 8 },
      lore: HABITANTES_LORE[3].questLore,
      recompensaDesc: '+20% loot neste andar · +8 Madeira',
    },
  },
  4: {
    floor: 4, nome: 'Voz do Cristal', papel: 'Arquivo Vivo', icone: '💎',
    fala: HABITANTES_LORE[4].fala,
    falamissão: HABITANTES_LORE[4].falamissão,
    falaConcluso: HABITANTES_LORE[4].falaConcluso,
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 28 dias após descobrir o Cristal',
      dias: 28,
      ecoBonus: 25, recursosBonus: { ferro: 10 },
      lore: HABITANTES_LORE[4].questLore,
      recompensaDesc: '+25% loot neste andar · +10 Ferro',
    },
  },
  5: {
    floor: 5, nome: 'Âncora do Primeiro Ciclo', papel: 'Fundação Consciente', icone: '⚓',
    fala: HABITANTES_LORE[5].fala,
    falamissão: HABITANTES_LORE[5].falamissão,
    falaConcluso: HABITANTES_LORE[5].falaConcluso,
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 15 dias desde a descoberta',
      dias: 15,
      ecoBonus: 22, moralBonus: 10,
      lore: HABITANTES_LORE[5].questLore,
      recompensaDesc: '+22% loot neste andar · +10 Moral',
    },
  },
  6: {
    floor: 6, nome: 'Sentinela Sem Nome', papel: 'Guardião Perdido', icone: '🗿',
    fala: HABITANTES_LORE[6].fala,
    falamissão: HABITANTES_LORE[6].falamissão,
    falaConcluso: HABITANTES_LORE[6].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 2 Combatentes e conquistar o Andar 10',
      profissoes: ['combatente', 'combatente'], andarMin: 10,
      ecoBonus: 25, recursosBonus: { madeira: 10 },
      lore: HABITANTES_LORE[6].questLore,
      recompensaDesc: '+25% loot neste andar · +10 Madeira',
    },
  },
  7: {
    floor: 7, nome: 'Jardineira Esquecida', papel: 'Curadora do Impossível', icone: '🌿',
    fala: HABITANTES_LORE[7].fala,
    falamissão: HABITANTES_LORE[7].falamissão,
    falaConcluso: HABITANTES_LORE[7].falaConcluso,
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 7 ao menos 3 vezes e ter 55 comida',
      recurso: { tipo: 'comida', qtd: 55 }, farmsMin: { andar: 7, vezes: 3 },
      ecoBonus: 25, moralBonus: 8,
      lore: HABITANTES_LORE[7].questLore,
      recompensaDesc: '+25% loot neste andar · +8 Moral',
    },
  },
  8: {
    floor: 8, nome: 'Estudioso do Infinito', papel: 'Arquivista Exilado', icone: '📚',
    fala: HABITANTES_LORE[8].fala,
    falamissão: HABITANTES_LORE[8].falamissão,
    falaConcluso: HABITANTES_LORE[8].falaConcluso,
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 8 ao menos 3 vezes e ter 30 ferro',
      recurso: { tipo: 'ferro', qtd: 30 }, farmsMin: { andar: 8, vezes: 3 },
      ecoBonus: 30, recursosBonus: { pedra: 15 },
      lore: HABITANTES_LORE[8].questLore,
      recompensaDesc: '+30% loot neste andar · +15 Pedra',
    },
  },
  9: {
    floor: 9, nome: 'Ferreiro Espectral', papel: 'Forjador das Correntes', icone: '🔥',
    fala: HABITANTES_LORE[9].fala,
    falamissão: HABITANTES_LORE[9].falamissão,
    falaConcluso: HABITANTES_LORE[9].falaConcluso,
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 9 ao menos 4 vezes e ter 40 ferro',
      recurso: { tipo: 'ferro', qtd: 40 }, farmsMin: { andar: 9, vezes: 4 },
      ecoBonus: 30, recursosBonus: { ferro: 15 },
      lore: HABITANTES_LORE[9].questLore,
      recompensaDesc: '+30% loot neste andar · +15 Ferro',
    },
  },
  10: {
    floor: 10, nome: 'Memória da Construção', papel: 'Arquivo do Processo', icone: '🏛️',
    fala: HABITANTES_LORE[10].fala,
    falamissão: HABITANTES_LORE[10].falamissão,
    falaConcluso: HABITANTES_LORE[10].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter um Erudito e conquistar o Andar 12',
      profissoes: ['erudito'], andarMin: 12,
      ecoBonus: 28, recursosBonus: { ferro: 15, pedra: 10 },
      lore: HABITANTES_LORE[10].questLore,
      recompensaDesc: '+28% loot neste andar · +15 Ferro +10 Pedra',
    },
  },
  11: {
    floor: 11, nome: 'Afogado Lúcido', papel: 'Transformado Consciente', icone: '💧',
    fala: HABITANTES_LORE[11].fala,
    falamissão: HABITANTES_LORE[11].falamissão,
    falaConcluso: HABITANTES_LORE[11].falaConcluso,
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 18 dias após descobri-lo',
      dias: 18,
      ecoBonus: 30, moralBonus: 8,
      lore: HABITANTES_LORE[11].questLore,
      recompensaDesc: '+30% loot neste andar · +8 Moral',
    },
  },
  12: {
    floor: 12, nome: 'Percussão Profunda', papel: 'Pulso da Torre', icone: '🥁',
    fala: HABITANTES_LORE[12].fala,
    falamissão: HABITANTES_LORE[12].falamissão,
    falaConcluso: HABITANTES_LORE[12].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 3+ NPCs de combate vivos e 50 pedra',
      npcsMinCombate: 3, recurso: { tipo: 'pedra', qtd: 50 },
      ecoBonus: 30, recursosBonus: { pedra: 20 },
      lore: HABITANTES_LORE[12].questLore,
      recompensaDesc: '+30% loot neste andar · +20 Pedra',
    },
  },
  13: {
    floor: 13, nome: 'Oráculo Invertido', papel: 'Vidente do Passado', icone: '🔮',
    fala: HABITANTES_LORE[13].fala,
    falamissão: HABITANTES_LORE[13].falamissão,
    falaConcluso: HABITANTES_LORE[13].falaConcluso,
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 15 de Moral (custo imediato)',
      custo: { moral: 15 },
      ecoBonus: 30, moralBonus: 15,
      lore: HABITANTES_LORE[13].questLore,
      recompensaDesc: '+30% loot neste andar · +15 Moral (retorno)',
    },
  },
  14: {
    floor: 14, nome: 'Comandante de Mármore', papel: 'General do Vazio', icone: '⚔️',
    fala: HABITANTES_LORE[14].fala,
    falamissão: HABITANTES_LORE[14].falamissão,
    falaConcluso: HABITANTES_LORE[14].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter Combatente + Sentinela e conquistar o Andar 18',
      profissoes: ['combatente', 'sentinela'], andarMin: 18,
      ecoBonus: 35, recursosBonus: { ferro: 20 },
      lore: HABITANTES_LORE[14].questLore,
      recompensaDesc: '+35% loot neste andar · +20 Ferro',
    },
  },
  15: {
    floor: 15, nome: 'Vigia do Penúltimo Ciclo', papel: 'Preparador do Que Vem Depois', icone: '🗼',
    fala: HABITANTES_LORE[15].fala,
    falamissão: HABITANTES_LORE[15].falamissão,
    falaConcluso: HABITANTES_LORE[15].falaConcluso,
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 18 de Moral (custo imediato ao aceitar)',
      custo: { moral: 18 },
      ecoBonus: 32, moralBonus: 20,
      lore: HABITANTES_LORE[15].questLore,
      recompensaDesc: '+32% loot neste andar · +20 Moral (retorno)',
    },
  },
  16: {
    floor: 16, nome: 'Eco Faminto', papel: 'Apetite da Entidade', icone: '🌀',
    fala: HABITANTES_LORE[16].fala,
    falamissão: HABITANTES_LORE[16].falamissão,
    falaConcluso: HABITANTES_LORE[16].falaConcluso,
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 16 ao menos 3 vezes e ter 70 comida',
      recurso: { tipo: 'comida', qtd: 70 }, farmsMin: { andar: 16, vezes: 3 },
      ecoBonus: 35, recursosBonus: { comida: 25 },
      lore: HABITANTES_LORE[16].questLore,
      recompensaDesc: '+35% loot neste andar · +25 Comida',
    },
  },
  17: {
    floor: 17, nome: 'Paradoxo Ambulante', papel: 'Memória do Que Poderia Ser', icone: '⏳',
    fala: HABITANTES_LORE[17].fala,
    falamissão: HABITANTES_LORE[17].falamissão,
    falaConcluso: HABITANTES_LORE[17].falaConcluso,
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 25 dias após encontrá-lo',
      dias: 25,
      ecoBonus: 35, recursosBonus: { ferro: 20 },
      lore: HABITANTES_LORE[17].questLore,
      recompensaDesc: '+35% loot neste andar · +20 Ferro',
    },
  },
  18: {
    floor: 18, nome: 'Último Defensor', papel: 'Construído Para Falhar', icone: '🛡️',
    fala: HABITANTES_LORE[18].fala,
    falamissão: HABITANTES_LORE[18].falamissão,
    falaConcluso: HABITANTES_LORE[18].falaConcluso,
    quest: {
      tipo: 'recurso', descricaoObj: 'Trazer 55 ferro e 55 pedra',
      recurso: { tipo: 'ferro', qtd: 55 },
      recurso2: { tipo: 'pedra', qtd: 55 },
      recursosBonus: { ferro: 25 },
      ecoBonus: 35,
      lore: HABITANTES_LORE[18].questLore,
      recompensaDesc: '+35% loot neste andar · +25 Ferro',
    },
  },
  19: {
    floor: 19, nome: 'Susurro do Limiar', papel: 'Espaço Entre', icone: '🌑',
    fala: HABITANTES_LORE[19].fala,
    falamissão: HABITANTES_LORE[19].falamissão,
    falaConcluso: HABITANTES_LORE[19].falaConcluso,
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 10 dias sem entrar em guerra',
      dias: 10, semGuerra: true,
      ecoBonus: 35, moralBonus: 15,
      lore: HABITANTES_LORE[19].questLore,
      recompensaDesc: '+35% loot neste andar · +15 Moral',
    },
  },

  // ─── TEMPORADA 2 — O Intervalo (andares 21–40) ──────────────────────────────
  21: {
    floor: 21, nome: 'Vestígio da Voz', papel: 'Memória que Reconhece', icone: '👁️',
    fala: HABITANTES_LORE[21].fala,
    falamissão: HABITANTES_LORE[21].falamissão,
    falaConcluso: HABITANTES_LORE[21].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 2 Batedores e conquistar o Andar 26',
      profissoes: ['batedor', 'batedor'], andarMin: 26,
      ecoBonus: 20, moralBonus: 8,
      lore: HABITANTES_LORE[21].questLore,
      recompensaDesc: '+20% loot neste andar · +8 Moral',
    },
  },
  22: {
    floor: 22, nome: 'Fragmento Coletivo', papel: 'Eco dos Que Construíram', icone: '⚒️',
    fala: HABITANTES_LORE[22].fala,
    falamissão: HABITANTES_LORE[22].falamissão,
    falaConcluso: HABITANTES_LORE[22].falaConcluso,
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 22 ao menos 4 vezes e ter 85 ferro',
      recurso: { tipo: 'ferro', qtd: 85 }, farmsMin: { andar: 22, vezes: 4 },
      ecoBonus: 25, recursosBonus: { ferro: 20 },
      lore: HABITANTES_LORE[22].questLore,
      recompensaDesc: '+25% loot neste andar · +20 Ferro',
    },
  },
  23: {
    floor: 23, nome: 'Guardião da Memória Fixa', papel: 'Preservador do Instante', icone: '🕯️',
    fala: HABITANTES_LORE[23].fala,
    falamissão: HABITANTES_LORE[23].falamissão,
    falaConcluso: HABITANTES_LORE[23].falaConcluso,
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 18 dias após encontrá-lo',
      dias: 18,
      ecoBonus: 22, recursosBonus: { pedra: 25 },
      lore: HABITANTES_LORE[23].questLore,
      recompensaDesc: '+22% loot neste andar · +25 Pedra',
    },
  },
  24: {
    floor: 24, nome: 'O Que Viu Antes', papel: 'Testemunha do Início', icone: '🪨',
    fala: HABITANTES_LORE[24].fala,
    falamissão: HABITANTES_LORE[24].falamissão,
    falaConcluso: HABITANTES_LORE[24].falaConcluso,
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 20 de Moral (custo imediato)',
      custo: { moral: 20 },
      ecoBonus: 28, moralBonus: 20,
      lore: HABITANTES_LORE[24].questLore,
      recompensaDesc: '+28% loot neste andar · +20 Moral (retorno)',
    },
  },
  25: {
    floor: 25, nome: 'Guardiã da Memória Anterior', papel: 'Custódia do Antes', icone: '🕰️',
    fala: HABITANTES_LORE[25].fala,
    falamissão: HABITANTES_LORE[25].falamissão,
    falaConcluso: HABITANTES_LORE[25].falaConcluso,
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 20 dias sem tentar apagar memórias',
      dias: 20,
      ecoBonus: 27, moralBonus: 15,
      lore: HABITANTES_LORE[25].questLore,
      recompensaDesc: '+27% loot neste andar · +15 Moral',
    },
  },
  26: {
    floor: 26, nome: 'Eco da Expedição Perdida', papel: 'Memória de Quem Não Voltou', icone: '🗺️',
    fala: HABITANTES_LORE[26].fala,
    falamissão: HABITANTES_LORE[26].falamissão,
    falaConcluso: HABITANTES_LORE[26].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter Combatente + Batedor e conquistar o Andar 30',
      profissoes: ['combatente', 'batedor'], andarMin: 30,
      ecoBonus: 25, recursosBonus: { madeira: 30 },
      lore: HABITANTES_LORE[26].questLore,
      recompensaDesc: '+25% loot neste andar · +30 Madeira',
    },
  },
  27: {
    floor: 27, nome: 'Memória do Traidor', papel: 'Eco de uma Decisão', icone: '🗡️',
    fala: HABITANTES_LORE[27].fala,
    falamissão: HABITANTES_LORE[27].falamissão,
    falaConcluso: HABITANTES_LORE[27].falaConcluso,
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 27 ao menos 4 vezes e ter 100 madeira',
      recurso: { tipo: 'madeira', qtd: 100 }, farmsMin: { andar: 27, vezes: 4 },
      ecoBonus: 25, recursosBonus: { madeira: 25 },
      lore: HABITANTES_LORE[27].questLore,
      recompensaDesc: '+25% loot neste andar · +25 Madeira',
    },
  },
  28: {
    floor: 28, nome: 'Oráculo do Propósito', papel: 'Vidente do Destino da Torre', icone: '🔭',
    fala: HABITANTES_LORE[28].fala,
    falamissão: HABITANTES_LORE[28].falamissão,
    falaConcluso: HABITANTES_LORE[28].falaConcluso,
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 28 dias após encontrá-lo',
      dias: 28,
      ecoBonus: 28, recursosBonus: { ferro: 25 },
      lore: HABITANTES_LORE[28].questLore,
      recompensaDesc: '+28% loot neste andar · +25 Ferro',
    },
  },
  29: {
    floor: 29, nome: 'Guardião do Nome Apagado', papel: 'Custódio do Esquecido', icone: '📛',
    fala: HABITANTES_LORE[29].fala,
    falamissão: HABITANTES_LORE[29].falamissão,
    falaConcluso: HABITANTES_LORE[29].falaConcluso,
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 70 comida (custo imediato)',
      custo: { comida: 70 },
      ecoBonus: 30, recursosBonus: { comida: 35 },
      lore: HABITANTES_LORE[29].questLore,
      recompensaDesc: '+30% loot neste andar · +35 Comida',
    },
  },
  30: {
    floor: 30, nome: 'Sentinela do Meio-Tempo', papel: 'Guardião do Intervalo', icone: '⚡',
    fala: HABITANTES_LORE[30].fala,
    falamissão: HABITANTES_LORE[30].falamissão,
    falaConcluso: HABITANTES_LORE[30].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter Erudito e conquistar o Andar 35',
      profissoes: ['erudito'], andarMin: 35,
      ecoBonus: 30, recursosBonus: { ferro: 25, pedra: 20 },
      lore: HABITANTES_LORE[30].questLore,
      recompensaDesc: '+30% loot neste andar · +25 Ferro +20 Pedra',
    },
  },
  31: {
    floor: 31, nome: 'Raiz de Origem', papel: 'Ponto de Partida', icone: '🌿',
    fala: HABITANTES_LORE[31].fala,
    falamissão: HABITANTES_LORE[31].falamissão,
    falaConcluso: HABITANTES_LORE[31].falaConcluso,
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 31 ao menos 4 vezes e ter 90 pedra',
      recurso: { tipo: 'pedra', qtd: 90 }, farmsMin: { andar: 31, vezes: 4 },
      ecoBonus: 27, recursosBonus: { pedra: 30 },
      lore: HABITANTES_LORE[31].questLore,
      recompensaDesc: '+27% loot neste andar · +30 Pedra',
    },
  },
  32: {
    floor: 32, nome: 'Memória da Primeira Pedra', papel: 'Eco do Ato Fundador', icone: '🪨',
    fala: HABITANTES_LORE[32].fala,
    falamissão: HABITANTES_LORE[32].falamissão,
    falaConcluso: HABITANTES_LORE[32].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter Erudito ou Sentinela e conquistar o Andar 36',
      profissoes: ['erudito', 'sentinela'], andarMin: 36,
      ecoBonus: 28, recursosBonus: { pedra: 20, ferro: 15 },
      lore: HABITANTES_LORE[32].questLore,
      recompensaDesc: '+28% loot neste andar · +20 Pedra +15 Ferro',
    },
  },
  33: {
    floor: 33, nome: 'Eco do Esquecimento', papel: 'Momento em que o Propósito se Perdeu', icone: '💨',
    fala: HABITANTES_LORE[33].fala,
    falamissão: HABITANTES_LORE[33].falamissão,
    falaConcluso: HABITANTES_LORE[33].falaConcluso,
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 30 dias após encontrá-lo',
      dias: 30,
      ecoBonus: 30, moralBonus: 18,
      lore: HABITANTES_LORE[33].questLore,
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
    fala: HABITANTES_LORE[34].fala,
    falamissão: HABITANTES_LORE[34].falamissão,
    falaConcluso: HABITANTES_LORE[34].falaConcluso,
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 25 de Moral (custo imediato)',
      custo: { moral: 25 },
      ecoBonus: 32, moralBonus: 28,
      lore: HABITANTES_LORE[34].questLore,
      recompensaDesc: '+32% loot neste andar · +28 Moral (retorno)',
    },
  },
  35: {
    floor: 35, nome: 'Último Sussurro do Fundador', papel: 'Ecos de Origem', icone: '💫',
    fala: HABITANTES_LORE[35].fala,
    falamissão: HABITANTES_LORE[35].falamissão,
    falaConcluso: HABITANTES_LORE[35].falaConcluso,
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 30 de Moral (custo imediato)',
      custo: { moral: 30 },
      ecoBonus: 33, moralBonus: 30,
      lore: HABITANTES_LORE[35].questLore,
      recompensaDesc: '+33% loot neste andar · +30 Moral (retorno)',
    },
  },
  36: {
    floor: 36, nome: 'Habitante do Intervalo', papel: 'Ser Exclusivo desta Estação', icone: '🌙',
    fala: HABITANTES_LORE[36].fala,
    falamissão: HABITANTES_LORE[36].falamissão,
    falaConcluso: HABITANTES_LORE[36].falaConcluso,
    quest: {
      tipo: 'recurso', descricaoObj: 'Explorar o Andar 36 ao menos 4 vezes, ter 110 comida e 55 ferro',
      recurso: { tipo: 'comida', qtd: 110 },
      recurso2: { tipo: 'ferro', qtd: 55 },
      farmsMin: { andar: 36, vezes: 4 },
      ecoBonus: 30, recursosBonus: { comida: 30, ferro: 15 },
      lore: HABITANTES_LORE[36].questLore,
      recompensaDesc: '+30% loot neste andar · +30 Comida +15 Ferro',
    },
  },
  37: {
    floor: 37, nome: 'Memória Nomeada', papel: 'Rastro de um Construtor Específico', icone: '🧑‍🔧',
    fala: HABITANTES_LORE[37].fala,
    falamissão: HABITANTES_LORE[37].falamissão,
    falaConcluso: HABITANTES_LORE[37].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 2 Combatentes + Batedor e conquistar o Andar 39',
      profissoes: ['combatente', 'combatente', 'batedor'], andarMin: 39,
      ecoBonus: 32, recursosBonus: { ferro: 30, madeira: 20 },
      lore: HABITANTES_LORE[37].questLore,
      recompensaDesc: '+32% loot neste andar · +30 Ferro +20 Madeira',
    },
  },
  38: {
    floor: 38, nome: 'Vigilante do Entre-Tempo', papel: 'Guardião do Intervalo Puro', icone: '⏱️',
    fala: HABITANTES_LORE[38].fala,
    falamissão: HABITANTES_LORE[38].falamissão,
    falaConcluso: HABITANTES_LORE[38].falaConcluso,
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 35 dias após encontrá-lo',
      dias: 35,
      ecoBonus: 33, recursosBonus: { pedra: 35, madeira: 25 },
      lore: HABITANTES_LORE[38].questLore,
      recompensaDesc: '+33% loot neste andar · +35 Pedra +25 Madeira',
    },
  },
  39: {
    floor: 39, nome: 'Porteiro do Antes', papel: 'Guardião da Transição Final', icone: '🚪',
    fala: HABITANTES_LORE[39].fala,
    falamissão: HABITANTES_LORE[39].falamissão,
    falaConcluso: HABITANTES_LORE[39].falaConcluso,
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 40 ferro e 80 comida (custo imediato)',
      custo: { ferro: 40, comida: 80 },
      ecoBonus: 35, moralBonus: 25,
      lore: HABITANTES_LORE[39].questLore,
      recompensaDesc: '+35% loot neste andar · +25 Moral',
    },
  },
};

// ─── ESCOLHAS DOS HABITANTES ─────────────────────────────────────────────────
// Cada quest pode ganhar uma escolha ramificada opcional. Definida separadamente
// e mesclada em HABITANTES abaixo — quests sem entrada aqui concluem como antes.
// Mescla o texto canônico de ESCOLHAS_LORE (única fonte narrativa) com a
// mecânica de cada opção, definida aqui. Texto vive em lore-content.ts.
type EscolhaMecanica = Omit<HabitanteEscolhaOpcao, 'id' | 'label' | 'descricao' | 'falaResultado'>;
function escolhaComLore(floor: number, mecA: EscolhaMecanica, mecB: EscolhaMecanica): HabitanteEscolha {
  const lore = ESCOLHAS_LORE[floor];
  return {
    prompt: lore.prompt,
    opcoes: [
      { id: 'a', ...lore.opcaoA, ...mecA },
      { id: 'b', ...lore.opcaoB, ...mecB },
    ],
  };
}

export const HABITANTE_ESCOLHAS: Record<number, HabitanteEscolha> = {
  1: escolhaComLore(1, { moralBonus: 15 }, { reliquia: 'Mensagem Selada' }),
  2: escolhaComLore(2, { recursosBonus: { pedra: 20, madeira: 15 } }, { moralBonus: 18 }),
  3: escolhaComLore(3, { recursosBonus: { madeira: 20 } }, { moralBonus: 15 }),
  4: escolhaComLore(4, { custo: { moral: 10 }, reliquia: 'Frequência Gravada' }, { moralBonus: 15 }),
  5: escolhaComLore(5, { recursosBonus: { pedra: 20 } }, { moralBonus: 22 }),
  6: escolhaComLore(6, { moralBonus: 16 }, { reliquia: 'Ordem Sem Autoridade', recursosBonus: { madeira: 20 } }),
  7: escolhaComLore(7, { recursosBonus: { comida: 25 } }, { reliquia: 'Semente do Impossível' }),
  8: escolhaComLore(8, { recursosBonus: { pedra: 25 } }, { moralBonus: 15 }),
  9: escolhaComLore(9, { recursosBonus: { ferro: 25 } }, { reliquia: 'Elo das Correntes', recursosBonus: { ferro: 12 } }),
  10: escolhaComLore(10, { custo: { moral: 12 }, recursosBonus: { pedra: 20, ferro: 15 } }, { reliquia: 'Palavras do Fundador' }),
  11: escolhaComLore(11, { moralBonus: 25 }, { reliquia: 'Consciência Preenchida' }),
  12: escolhaComLore(12, { custo: { moral: 12 }, recursosBonus: { pedra: 35 } }, { recursosBonus: { pedra: 22 } }),
  13: escolhaComLore(13, { custo: { moral: 12 }, reliquia: 'Visão Invertida' }, { moralBonus: 18 }),
  14: escolhaComLore(14, { recursosBonus: { ferro: 25 } }, { moralBonus: 16 }),
  15: escolhaComLore(15, { recursosBonus: { pedra: 25, madeira: 15 } }, { moralBonus: 15, reliquia: 'A Pergunta Não Respondida' }),
  16: escolhaComLore(16, { custo: { comida: 40 }, recursosBonus: { ferro: 40, pedra: 20 } }, { moralBonus: 18 }),
  17: escolhaComLore(17, { custo: { moral: 12 }, recursosBonus: { ferro: 35 } }, { recursosBonus: { ferro: 20 } }),
  18: escolhaComLore(18, { recursosBonus: { ferro: 25, pedra: 15 } }, { moralBonus: 18 }),
  19: escolhaComLore(19, { custo: { moral: 10 }, reliquia: 'Sussurro do Limiar' }, { moralBonus: 22 }),
  21: escolhaComLore(21, { custo: { moral: 10 } }, { moralBonus: 12 }),
  22: escolhaComLore(22, { recursosBonus: { ferro: 30 } }, { reliquia: 'Fragmento Bruto', moralBonus: 12 }),
  23: escolhaComLore(23, { moralBonus: 18 }, { recursosBonus: { pedra: 22 } }),
  24: escolhaComLore(24, { custo: { moral: 12 }, reliquia: 'Borda do Antes' }, { moralBonus: 20 }),
  26: escolhaComLore(26, {}, { moralBonus: 15, recursosBonus: { madeira: 25 } }),
  27: escolhaComLore(27, { moralBonus: 22 }, { recursosBonus: { madeira: 30 } }),
  28: escolhaComLore(28, { moralBonus: 8 }, { moralBonus: 14 }),
  29: escolhaComLore(29, { moralBonus: 18 }, { recursosBonus: { comida: 30 } }),
  31: escolhaComLore(31, { recursosBonus: { pedra: 25 } }, { moralBonus: 15 }),
  32: escolhaComLore(32, { moralBonus: 25 }, { recursosBonus: { pedra: 25, ferro: 18 } }),
  33: escolhaComLore(33, { custo: { moral: 12 }, reliquia: 'Propósito Reaprendido' }, { moralBonus: 18 }),
  34: escolhaComLore(34, { recursosBonus: { pedra: 30, ferro: 20 } }, { moralBonus: 20, reliquia: 'Intenção Própria' }),
  36: escolhaComLore(36, { moralBonus: 22 }, { recursosBonus: { comida: 30, ferro: 18 } }),
  37: escolhaComLore(37, { moralBonus: 22 }, { recursosBonus: { ferro: 30, madeira: 18 } }),
  38: escolhaComLore(38, { custo: { pedra: 50, madeira: 40 }, moralBonus: 25 }, { recursosBonus: { pedra: 30 } }),
  39: escolhaComLore(39, { moralBonus: 25 }, { recursosBonus: { ferro: 20, comida: 25 }, moralBonus: 12 }),
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
  5: BOSS_LORE[5],
  10: BOSS_LORE[10],
  15: BOSS_LORE[15],
  20: BOSS_LORE[20],
  25: BOSS_LORE[25],
  30: BOSS_LORE[30],
  35: BOSS_LORE[35],
  40: BOSS_LORE[40],
};

// ─── CÂMARAS SECRETAS (andares de chefe) ─────────────────────────────────────
// Após vencer um chefe, o jogador pode "vasculhar os destroços" até maxTentativas
// vezes; ao achar, é permanente e concede recompensa + fragmento de lore único.
export type RequisitoCamara =
  // ─── Arquétipos ativos (stat gating estrito, gerados por floor-engine) ───────
  | { tipo: 'npc_atributo_alto'; stat: 'forca' | 'agilidade' | 'inteligencia' | 'resistencia'; minValor: number; quantidade: number; textoRequisito: string }
  | { tipo: 'classe_desenvolvida'; profissao: ProfissaoId; minStat: number; quantidade: number; textoRequisito: string }
  | { tipo: 'sussurros_capitulo'; capitulo: number; quantidade: number; textoRequisito: string }
  | { tipo: 'npc_raridade'; raridade: 'comum' | 'incomum' | 'raro' | 'lendario'; quantidade: number; textoRequisito: string }
  | { tipo: 'farms_andar'; floor: number; minFarms: number; textoRequisito: string }
  // ─── Legado (câmaras curadas antigas / saves) — ainda verificados ────────────
  | { tipo: 'class_farms'; profissao: ProfissaoId; minFarmsComClasse: number; textoRequisito: string }
  | { tipo: 'mortes_andar'; minMortes: number; textoRequisito: string }
  | { tipo: 'quest_habitante'; floor: number; textoRequisito: string }
  | { tipo: 'recurso_minimo'; recurso: 'comida' | 'madeira' | 'pedra' | 'ferro'; quantidade: number; textoRequisito: string }
  | { tipo: 'combinado'; conditions: Array<{ tipo: string; value: number }>; textoRequisito: string };

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
  /** @deprecated dificuldade fixa do modelo antigo de RNG. A dificuldade real é
   *  calculada por `dificuldadeCamara()` (escalada ao andar). Mantido só p/ dados legados. */
  dificuldade: number;
  /** Multiplicador sobre a dificuldade do andar (default 1.25). Preencher só nas
   *  câmaras que a lore justifica serem mais duras. Ver `dificuldadeCamara()`. */
  multiplicadorDificuldade?: number;
  custo: number;               // comida exigida
  maxTentativas: number;       // máximo de tentativas (default 3)
  /** @deprecated chance de sucesso do modelo antigo de RNG — não mais lida. */
  chancePerTentativa: number;
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
    descricao: CAMARAS_LORE['1_1'].descricao,
    requisito: { tipo: 'class_farms' as const, profissao: 'batedor', minFarmsComClasse: 8, textoRequisito: 'Só um rastreador experiente percebe as marcas na floresta' },
    tipo: 'benéfica',
    dificuldade: 12,
    custo: 20,
    maxTentativas: 3,
    chancePerTentativa: 0.4,
    resultado: {
      ...CAMARAS_LORE['1_1'].resultado,
      recursosBonus: { comida: 20, madeira: 12 },
      moralBonus: 4,
    },
  },

  // Andar 2 — 1 câmara
  '2_1': {
    floor: 2,
    titulo: 'Conhecimento Cristalizado',
    icone: '📚',
    descricao: CAMARAS_LORE['2_1'].descricao,
    requisito: { tipo: 'class_farms' as const, profissao: 'erudito', minFarmsComClasse: 8, textoRequisito: 'Apenas um erudito consegue decodificar os símbolos antigos' },
    tipo: 'neutra',
    dificuldade: 13,
    custo: 22,
    maxTentativas: 3,
    chancePerTentativa: 0.38,
    resultado: {
      ...CAMARAS_LORE['2_1'].resultado,
    },
  },

  // Andar 3 — 1 câmara
  '3_1': {
    floor: 3,
    titulo: 'Ecos da Raiz Primária',
    icone: '🌿',
    descricao: CAMARAS_LORE['3_1'].descricao,
    requisito: { tipo: 'mortes_andar' as const, minMortes: 10, textoRequisito: 'A câmara só revela-se quando a morte é suficientemente familiar' },
    tipo: 'maléfica',
    dificuldade: 14,
    custo: 25,
    maxTentativas: 3,
    chancePerTentativa: 0.36,
    resultado: {
      ...CAMARAS_LORE['3_1'].resultado,
      moralPerdido: 10,
      chanceMorteNPC: 0.1,
    },
  },

  // Andar 4 — 2 câmaras
  '4_1': {
    floor: 4,
    titulo: 'Sussurro Cristalino',
    icone: '🔮',
    descricao: CAMARAS_LORE['4_1'].descricao,
    requisito: { tipo: 'quest_habitante' as const, floor: 4, textoRequisito: 'Completar a quest do Habitante do Andar 4 permite ouvir o caminho' },
    tipo: 'neutra',
    dificuldade: 13,
    custo: 24,
    maxTentativas: 3,
    chancePerTentativa: 0.35,
    resultado: {
      ...CAMARAS_LORE['4_1'].resultado,
    },
  },

  '4_2': {
    floor: 4,
    titulo: 'Memória Fraturada',
    icone: '💎',
    descricao: CAMARAS_LORE['4_2'].descricao,
    requisito: { tipo: 'recurso_minimo' as const, recurso: 'ferro', quantidade: 80, textoRequisito: 'Ferro suficiente para reparar o caminho quebrado' },
    tipo: 'benéfica',
    dificuldade: 12,
    custo: 20,
    maxTentativas: 3,
    chancePerTentativa: 0.35,
    resultado: {
      ...CAMARAS_LORE['4_2'].resultado,
      recursosBonus: { pedra: 25, ferro: 15 },
      moralBonus: 3,
    },
  },

  // Andar 5 — 1 câmara
  '5_1': {
    floor: 5,
    titulo: 'Câmara do Limiar',
    icone: '🚪',
    descricao: CAMARAS_LORE['5_1'].descricao,
    requisito: { tipo: 'class_farms' as const, profissao: 'sentinela', minFarmsComClasse: 6, textoRequisito: 'Uma sentinela experiente percebe o vazio que o Guardião protege' },
    tipo: 'benéfica',
    dificuldade: 13,
    multiplicadorDificuldade: 1.35,  // limiar do 1º chefe — mais dura que o andar
    custo: 26,
    maxTentativas: 3,
    chancePerTentativa: 0.35,
    resultado: {
      ...CAMARAS_LORE['5_1'].resultado,
      recursosBonus: { madeira: 18, pedra: 12 },
      moralBonus: 6,
    },
  },

  // Andar 6 — 1 câmara
  '6_1': {
    floor: 6,
    titulo: 'Rastro do Construtor',
    icone: '🔨',
    descricao: CAMARAS_LORE['6_1'].descricao,
    requisito: { tipo: 'class_farms' as const, profissao: 'batedor', minFarmsComClasse: 7, textoRequisito: 'Um batedor consegue reconhecer pegadas de quem construiu a Torre' },
    tipo: 'neutra',
    dificuldade: 12,
    custo: 21,
    maxTentativas: 3,
    chancePerTentativa: 0.33,
    resultado: {
      ...CAMARAS_LORE['6_1'].resultado,
    },
  },

  // Andar 7 — 2 câmaras
  '7_1': {
    floor: 7,
    titulo: 'Jardim Esquecido',
    icone: '🌱',
    descricao: CAMARAS_LORE['7_1'].descricao,
    requisito: { tipo: 'quest_habitante' as const, floor: 7, textoRequisito: 'Completar a quest da Jardineira abre o caminho para seu jardim secreto' },
    tipo: 'benéfica',
    dificuldade: 11,
    custo: 19,
    maxTentativas: 3,
    chancePerTentativa: 0.32,
    resultado: {
      ...CAMARAS_LORE['7_1'].resultado,
      recursosBonus: { comida: 22, madeira: 16 },
      moralBonus: 5,
    },
  },

  '7_2': {
    floor: 7,
    titulo: 'Semente Primordial',
    icone: '🌾',
    descricao: CAMARAS_LORE['7_2'].descricao,
    requisito: { tipo: 'npc_raridade' as const, raridade: 'raro', quantidade: 2, textoRequisito: 'Apenas moradores raros conseguem perceber onde a vida começou' },
    tipo: 'neutra',
    dificuldade: 14,
    multiplicadorDificuldade: 1.4,  // primordial — germinou antes da Torre
    custo: 28,
    maxTentativas: 3,
    chancePerTentativa: 0.32,
    resultado: {
      ...CAMARAS_LORE['7_2'].resultado,
    },
  },

  // Andar 8 — 1 câmara
  '8_1': {
    floor: 8,
    titulo: 'Arquivo do Estudo Infinito',
    icone: '🔬',
    descricao: CAMARAS_LORE['8_1'].descricao,
    requisito: { tipo: 'class_farms' as const, profissao: 'erudito', minFarmsComClasse: 9, textoRequisito: 'Um erudito que explorou o suficiente consegue acessar o conhecimento guardado' },
    tipo: 'benéfica',
    dificuldade: 14,
    custo: 27,
    maxTentativas: 3,
    chancePerTentativa: 0.31,
    resultado: {
      ...CAMARAS_LORE['8_1'].resultado,
      recursosBonus: { ferro: 20, pedra: 15 },
      moralBonus: 7,
    },
  },

  // Andar 9 — 1 câmara
  '9_1': {
    floor: 9,
    titulo: 'Câmara da Forja Perdida',
    icone: '⚒️',
    descricao: CAMARAS_LORE['9_1'].descricao,
    requisito: { tipo: 'mortes_andar' as const, minMortes: 8, textoRequisito: 'A forja reage ao calor da morte — quanto mais morte, mais quente arde' },
    tipo: 'maléfica',
    dificuldade: 15,
    custo: 30,
    maxTentativas: 3,
    chancePerTentativa: 0.3,
    resultado: {
      ...CAMARAS_LORE['9_1'].resultado,
      recursosBonus: { ferro: 35, pedra: 10 },
      moralPerdido: 8,
      chanceMorteNPC: 0.12,
    },
  },

  // Andar 10 — 2 câmaras
  '10_1': {
    floor: 10,
    titulo: 'Conhecimento Cristalizado',
    icone: '📚',
    descricao: CAMARAS_LORE['10_1'].descricao,
    requisito: { tipo: 'quest_habitante' as const, floor: 10, textoRequisito: 'Completar a quest da Memória revela onde o método está escondido' },
    tipo: 'neutra',
    dificuldade: 15,
    custo: 32,
    maxTentativas: 3,
    chancePerTentativa: 0.3,
    resultado: {
      ...CAMARAS_LORE['10_1'].resultado,
    },
  },

  '10_2': {
    floor: 10,
    titulo: 'Catálogo Apagado',
    icone: '🗂️',
    descricao: CAMARAS_LORE['10_2'].descricao,
    requisito: { tipo: 'combinado' as const, conditions: [{ tipo: 'class_farms', value: 5 }, { tipo: 'mortes', value: 5 }], textoRequisito: 'Quem perdeu moradores e aprendeu a explorar consegue ler os nomes apagados' },
    tipo: 'neutra',
    dificuldade: 16,
    custo: 33,
    maxTentativas: 3,
    chancePerTentativa: 0.3,
    resultado: {
      ...CAMARAS_LORE['10_2'].resultado,
    },
  },

  // Andar 11 — 1 câmara
  '11_1': {
    floor: 11,
    titulo: 'Câmara do Afogado Consciente',
    icone: '💧',
    descricao: CAMARAS_LORE['11_1'].descricao,
    requisito: { tipo: 'recurso_minimo' as const, recurso: 'comida', quantidade: 100, textoRequisito: 'Alimento suficiente para sustentar quem tenta respirar duas vidas' },
    tipo: 'neutra',
    dificuldade: 13,
    custo: 25,
    maxTentativas: 3,
    chancePerTentativa: 0.28,
    resultado: {
      ...CAMARAS_LORE['11_1'].resultado,
    },
  },

  // Andar 12 — 1 câmara
  '12_1': {
    floor: 12,
    titulo: 'Câmara do Pulso Profundo',
    icone: '🔊',
    descricao: CAMARAS_LORE['12_1'].descricao,
    requisito: { tipo: 'class_farms' as const, profissao: 'combatente', minFarmsComClasse: 10, textoRequisito: 'Um combatente experiente consegue bater no mesmo ritmo que a Torre' },
    tipo: 'benéfica',
    dificuldade: 15,
    custo: 28,
    maxTentativas: 3,
    chancePerTentativa: 0.27,
    resultado: {
      ...CAMARAS_LORE['12_1'].resultado,
      recursosBonus: { ferro: 30, pedra: 18 },
      moralBonus: 8,
    },
  },

  // Andar 13 — 1 câmara
  '13_1': {
    floor: 13,
    titulo: 'Câmara do Oráculo Espelhado',
    icone: '🔮',
    descricao: CAMARAS_LORE['13_1'].descricao,
    requisito: { tipo: 'mortes_andar' as const, minMortes: 7, textoRequisito: 'Quem viu a morte de frente consegue entender o que o Oráculo inverte' },
    tipo: 'maléfica',
    dificuldade: 14,
    custo: 26,
    maxTentativas: 3,
    chancePerTentativa: 0.26,
    resultado: {
      ...CAMARAS_LORE['13_1'].resultado,
      moralPerdido: 12,
      chanceMorteNPC: 0.08,
    },
  },

  // Andar 14 — 1 câmara
  '14_1': {
    floor: 14,
    titulo: 'Câmara do Comandante de Mármore',
    icone: '👑',
    descricao: CAMARAS_LORE['14_1'].descricao,
    requisito: { tipo: 'quest_habitante' as const, floor: 14, textoRequisito: 'Completar a quest do Comandante revela onde ele escondeu seu plano' },
    tipo: 'benéfica',
    dificuldade: 14,
    custo: 27,
    maxTentativas: 3,
    chancePerTentativa: 0.25,
    resultado: {
      ...CAMARAS_LORE['14_1'].resultado,
      recursosBonus: { ferro: 28, pedra: 14 },
      moralBonus: 9,
    },
  },

  // Andar 15 — 2 câmaras
  '15_1': {
    floor: 15,
    titulo: 'Câmara do Reflexo',
    icone: '🪞',
    descricao: CAMARAS_LORE['15_1'].descricao,
    requisito: { tipo: 'class_farms' as const, profissao: 'sentinela', minFarmsComClasse: 8, textoRequisito: 'Uma sentinela consegue perceber qual reflexo está faltando' },
    tipo: 'neutra',
    dificuldade: 15,
    multiplicadorDificuldade: 1.4,  // câmara do Vigia — reflexo que falta
    custo: 30,
    maxTentativas: 3,
    chancePerTentativa: 0.25,
    resultado: {
      ...CAMARAS_LORE['15_1'].resultado,
    },
  },

  '15_2': {
    floor: 15,
    titulo: 'Câmara da Pergunta Sem Resposta',
    icone: '❓',
    descricao: CAMARAS_LORE['15_2'].descricao,
    requisito: { tipo: 'npc_raridade' as const, raridade: 'incomum', quantidade: 3, textoRequisito: 'Apenas moradores incomuns conseguem ouvir o que a pergunta sussurra' },
    tipo: 'neutra',
    dificuldade: 16,
    multiplicadorDificuldade: 1.5,  // a pergunta do Vigia do Penúltimo Ciclo
    custo: 31,
    maxTentativas: 3,
    chancePerTentativa: 0.25,
    resultado: {
      ...CAMARAS_LORE['15_2'].resultado,
    },
  },

  // Andar 16 — 1 câmara
  '16_1': {
    floor: 16,
    titulo: 'Câmara do Eco Faminto',
    icone: '🌑',
    descricao: CAMARAS_LORE['16_1'].descricao,
    requisito: { tipo: 'mortes_andar' as const, minMortes: 6, textoRequisito: 'A fome reconhece quem já alimentou a Torre' },
    tipo: 'maléfica',
    dificuldade: 15,
    custo: 29,
    maxTentativas: 3,
    chancePerTentativa: 0.23,
    resultado: {
      ...CAMARAS_LORE['16_1'].resultado,
      moralPerdido: 10,
      chanceMorteNPC: 0.1,
    },
  },

  // Andar 17 — 1 câmara
  '17_1': {
    floor: 17,
    titulo: 'Câmara do Paradoxo Possível',
    icone: '🌀',
    descricao: CAMARAS_LORE['17_1'].descricao,
    requisito: { tipo: 'combinado' as const, conditions: [{ tipo: 'class_farms', value: 7 }, { tipo: 'mortes', value: 3 }], textoRequisito: 'Quem explorou e sofreu consegue entender os caminhos não tomados' },
    tipo: 'neutra',
    dificuldade: 16,
    custo: 32,
    maxTentativas: 3,
    chancePerTentativa: 0.22,
    resultado: {
      ...CAMARAS_LORE['17_1'].resultado,
    },
  },

  // Andar 18 — 1 câmara
  '18_1': {
    floor: 18,
    titulo: 'Câmara do Último Defensor',
    icone: '🛡️',
    descricao: CAMARAS_LORE['18_1'].descricao,
    requisito: { tipo: 'quest_habitante' as const, floor: 18, textoRequisito: 'Completar a quest do Defensor permite entrar em seu último bastião' },
    tipo: 'benéfica',
    dificuldade: 15,
    custo: 28,
    maxTentativas: 3,
    chancePerTentativa: 0.21,
    resultado: {
      ...CAMARAS_LORE['18_1'].resultado,
      recursosBonus: { madeira: 32, pedra: 16 },
      moralBonus: 10,
    },
  },

  // Andar 19 — 1 câmara
  '19_1': {
    floor: 19,
    titulo: 'Câmara do Susurro do Limiar',
    icone: '🌬️',
    descricao: CAMARAS_LORE['19_1'].descricao,
    requisito: { tipo: 'class_farms' as const, profissao: 'batedor', minFarmsComClasse: 9, textoRequisito: 'Um batedor consegue rastrear o sussurro até sua origem' },
    tipo: 'neutra',
    dificuldade: 17,
    custo: 34,
    maxTentativas: 3,
    chancePerTentativa: 0.2,
    resultado: {
      ...CAMARAS_LORE['19_1'].resultado,
    },
  },

  // Andar 20 — 2 câmaras (finais de T1)
  '20_1': {
    floor: 20,
    titulo: 'Câmara da Entidade Dormida',
    icone: '👁️',
    descricao: CAMARAS_LORE['20_1'].descricao,
    requisito: { tipo: 'npc_raridade' as const, raridade: 'raro', quantidade: 2, textoRequisito: 'Apenas moradores raros conseguem aproximar enquanto ela dorme' },
    tipo: 'benéfica',
    dificuldade: 18,
    multiplicadorDificuldade: 1.5,  // a entidade do Andar 20
    custo: 36,
    maxTentativas: 3,
    chancePerTentativa: 0.2,
    resultado: {
      ...CAMARAS_LORE['20_1'].resultado,
      recursosBonus: { ferro: 40, pedra: 25, madeira: 15 },
      moralBonus: 12,
    },
  },

  '20_2': {
    floor: 20,
    titulo: 'Câmara da Primeira Verdade',
    icone: '📖',
    descricao: CAMARAS_LORE['20_2'].descricao,
    requisito: { tipo: 'combinado' as const, conditions: [{ tipo: 'class_farms', value: 8 }, { tipo: 'mortes', value: 4 }], textoRequisito: 'Quem explorou profundamente e sobreviveu aos custos consegue ouvir a verdade primeira' },
    tipo: 'neutra',
    dificuldade: 19,
    multiplicadorDificuldade: 1.6,  // clímax de T1 — a primeira verdade
    custo: 38,
    maxTentativas: 3,
    chancePerTentativa: 0.2,
    resultado: {
      ...CAMARAS_LORE['20_2'].resultado,
    },
  },
};

// `verificarRequisitoCamara`, `dificuldadeCamara`, `calcAfinidadeCamara` e a rolagem
// `chanceAbrirCamara` vivem agora em `floor-engine/rules.ts` (importam estes tipos +
// helpers numa direção só, sem ciclo). Consumidores usam a façade `../floor-engine`.

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

export const METAS_DIARIAS_POOL_BASE: MetaDiariaId[] = ['explorar', 'construir', 'lore'];

export const METAS_DIARIAS_META: Record<MetaDiariaId, { titulo: string; descricao: string; icone: string }> = {
  explorar:  { titulo: 'Expedição do Dia', descricao: 'Envie uma expedição a qualquer andar.', icone: '🧭' },
  construir: { titulo: 'Obra em Curso',    descricao: 'Construa ou melhore um edifício.',        icone: '🏗️' },
  lore:      { titulo: 'Ecos do Passado',  descricao: 'Abra o Codex Obscuro (ícone do livro, na aba Torre).', icone: '📖' },
  aliar:     { titulo: 'Mão Estendida',    descricao: 'Ajude uma aliada (recurso, empréstimo ou reforço).', icone: '🤝' },
};

// `gerarObjetivosDoDia`, `verificarQuestAndar`, `verificarQuestOculta` e
// `gerarQuestOculta` vivem agora em `quest-engine/rules.ts` (regras puras). Os
// DADOS que elas consomem (METAS_DIARIAS_POOL_BASE, POOL_EXPLORACAO/VELOCIDADE,
// HABITANTES) permanecem aqui. Consumidores usam a façade `../quest-engine`.

// ─── CODEX OBSCURO — SISTEMA DE TEMPORADAS ───────────────────────────────────
// Fragmentos coletáveis organizados por Temporada → Capítulo.
// Para adicionar uma nova temporada: inserir entrada em TEMPORADAS e os
// fragmentos correspondentes em CODEX_FRAGMENTOS — nenhuma mudança no GameState.

export type FragmentoTipo = 'habitante' | 'eco_capitulo' | 'sussurro' | 'verdade' | 'camara';

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

// ─── Temporada (fonte única para telas/lore/gatilhos) ─────────────────────────
// Temporada de um andar (T1=1–20, T2=21–40, …). Fonte única para modularidade —
// T3–T5 plugam só estendendo TEMPORADAS.
export const temporadaDeAndar = (floor: number): number => Math.min(5, Math.max(1, Math.ceil(floor / 20)));

// Temporada "ativa" do save: até onde o conteúdo está liberado. Por ora, T2 quando
// desbloqueado globalmente (10 pioneiros no Andar 20); senão T1.
export const temporadaAtiva = (t2Desbloqueado: boolean): number => (t2Desbloqueado ? 2 : 1);

// Último andar visível/jogável na temporada ativa.
export const andarMaxTemporada = (t2Desbloqueado: boolean): number =>
  TEMPORADAS[temporadaAtiva(t2Desbloqueado)].andares[1];

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
    titulo: SUSSURROS_LORE['sus_t1_0'].titulo,
    texto: SUSSURROS_LORE['sus_t1_0'].texto },
  sus_t1_1: { id: 'sus_t1_1', tipo: 'sussurro',     temporada: 1, capitulo: 1, ordem: 7,
    titulo: SUSSURROS_LORE['sus_t1_1'].titulo,
    texto: SUSSURROS_LORE['sus_t1_1'].texto },
  sus_t1_2: { id: 'sus_t1_2', tipo: 'sussurro',     temporada: 1, capitulo: 1, ordem: 8,
    titulo: SUSSURROS_LORE['sus_t1_2'].titulo,
    texto: SUSSURROS_LORE['sus_t1_2'].texto },
  sus_t1_3: { id: 'sus_t1_3', tipo: 'sussurro',     temporada: 1, capitulo: 1, ordem: 9,
    titulo: SUSSURROS_LORE['sus_t1_3'].titulo,
    texto: SUSSURROS_LORE['sus_t1_3'].texto },
  sus_t1_4: { id: 'sus_t1_4', tipo: 'sussurro',     temporada: 1, capitulo: 1, ordem: 10,
    titulo: SUSSURROS_LORE['sus_t1_4'].titulo,
    texto: SUSSURROS_LORE['sus_t1_4'].texto },

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
    titulo: SUSSURROS_LORE['sus_t2_0'].titulo,
    texto: SUSSURROS_LORE['sus_t2_0'].texto },
  sus_t2_1: { id: 'sus_t2_1', tipo: 'sussurro',     temporada: 1, capitulo: 2, ordem: 7,
    titulo: SUSSURROS_LORE['sus_t2_1'].titulo,
    texto: SUSSURROS_LORE['sus_t2_1'].texto },
  sus_t2_2: { id: 'sus_t2_2', tipo: 'sussurro',     temporada: 1, capitulo: 2, ordem: 8,
    titulo: SUSSURROS_LORE['sus_t2_2'].titulo,
    texto: SUSSURROS_LORE['sus_t2_2'].texto },
  sus_t2_3: { id: 'sus_t2_3', tipo: 'sussurro',     temporada: 1, capitulo: 2, ordem: 9,
    titulo: SUSSURROS_LORE['sus_t2_3'].titulo,
    texto: SUSSURROS_LORE['sus_t2_3'].texto },
  sus_t2_4: { id: 'sus_t2_4', tipo: 'sussurro',     temporada: 1, capitulo: 2, ordem: 10,
    titulo: SUSSURROS_LORE['sus_t2_4'].titulo,
    texto: SUSSURROS_LORE['sus_t2_4'].texto },

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
    titulo: SUSSURROS_LORE['sus_t3_0'].titulo,
    texto: SUSSURROS_LORE['sus_t3_0'].texto },
  sus_t3_1: { id: 'sus_t3_1', tipo: 'sussurro',     temporada: 1, capitulo: 3, ordem: 7,
    titulo: SUSSURROS_LORE['sus_t3_1'].titulo,
    texto: SUSSURROS_LORE['sus_t3_1'].texto },
  sus_t3_2: { id: 'sus_t3_2', tipo: 'sussurro',     temporada: 1, capitulo: 3, ordem: 8,
    titulo: SUSSURROS_LORE['sus_t3_2'].titulo,
    texto: SUSSURROS_LORE['sus_t3_2'].texto },
  sus_t3_3: { id: 'sus_t3_3', tipo: 'sussurro',     temporada: 1, capitulo: 3, ordem: 9,
    titulo: SUSSURROS_LORE['sus_t3_3'].titulo,
    texto: SUSSURROS_LORE['sus_t3_3'].texto },
  sus_t3_4: { id: 'sus_t3_4', tipo: 'sussurro',     temporada: 1, capitulo: 3, ordem: 10,
    titulo: SUSSURROS_LORE['sus_t3_4'].titulo,
    texto: SUSSURROS_LORE['sus_t3_4'].texto },

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
    titulo: SUSSURROS_LORE['sus_t4_0'].titulo,
    texto: SUSSURROS_LORE['sus_t4_0'].texto },
  sus_t4_1: { id: 'sus_t4_1', tipo: 'sussurro',     temporada: 1, capitulo: 4, ordem: 7,
    titulo: SUSSURROS_LORE['sus_t4_1'].titulo,
    texto: SUSSURROS_LORE['sus_t4_1'].texto },
  sus_t4_2: { id: 'sus_t4_2', tipo: 'sussurro',     temporada: 1, capitulo: 4, ordem: 8,
    titulo: SUSSURROS_LORE['sus_t4_2'].titulo,
    texto: SUSSURROS_LORE['sus_t4_2'].texto },
  sus_t4_3: { id: 'sus_t4_3', tipo: 'sussurro',     temporada: 1, capitulo: 4, ordem: 9,
    titulo: SUSSURROS_LORE['sus_t4_3'].titulo,
    texto: SUSSURROS_LORE['sus_t4_3'].texto },
  sus_t4_4: { id: 'sus_t4_4', tipo: 'sussurro',     temporada: 1, capitulo: 4, ordem: 10,
    titulo: SUSSURROS_LORE['sus_t4_4'].titulo,
    texto: SUSSURROS_LORE['sus_t4_4'].texto },

  // ── Verdade da Temporada I ────────────────────────────────────────────────
  verdade_t1: { id: 'verdade_t1', tipo: 'verdade', temporada: 1, capitulo: 4, ordem: 99,
    titulo: VERDADES_LORE['verdade_t1'].titulo,
    texto: VERDADES_LORE['verdade_t1'].texto },

  // ── Fragmento especial — pioneiros T1 ────────────────────────────────────
  pioneers_fragment: { id: 'pioneers_fragment', tipo: 'verdade', temporada: 1, capitulo: 4, ordem: 98,
    titulo: VERDADES_LORE['pioneers_fragment'].titulo,
    texto: VERDADES_LORE['pioneers_fragment'].texto },

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
    titulo: SUSSURROS_LORE['sus_v_0'].titulo,
    texto: SUSSURROS_LORE['sus_v_0'].texto },
  sus_v_1:   { id: 'sus_v_1',   tipo: 'sussurro',     temporada: 2, capitulo: 5, ordem: 7,
    titulo: SUSSURROS_LORE['sus_v_1'].titulo,
    texto: SUSSURROS_LORE['sus_v_1'].texto },
  sus_v_2:   { id: 'sus_v_2',   tipo: 'sussurro',     temporada: 2, capitulo: 5, ordem: 8,
    titulo: SUSSURROS_LORE['sus_v_2'].titulo,
    texto: SUSSURROS_LORE['sus_v_2'].texto },
  sus_v_3:   { id: 'sus_v_3',   tipo: 'sussurro',     temporada: 2, capitulo: 5, ordem: 9,
    titulo: SUSSURROS_LORE['sus_v_3'].titulo,
    texto: SUSSURROS_LORE['sus_v_3'].texto },
  sus_v_4:   { id: 'sus_v_4',   tipo: 'sussurro',     temporada: 2, capitulo: 5, ordem: 10,
    titulo: SUSSURROS_LORE['sus_v_4'].titulo,
    texto: SUSSURROS_LORE['sus_v_4'].texto },

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
    titulo: SUSSURROS_LORE['sus_vi_0'].titulo,
    texto: SUSSURROS_LORE['sus_vi_0'].texto },
  sus_vi_1:  { id: 'sus_vi_1',  tipo: 'sussurro',     temporada: 2, capitulo: 6, ordem: 7,
    titulo: SUSSURROS_LORE['sus_vi_1'].titulo,
    texto: SUSSURROS_LORE['sus_vi_1'].texto },
  sus_vi_2:  { id: 'sus_vi_2',  tipo: 'sussurro',     temporada: 2, capitulo: 6, ordem: 8,
    titulo: SUSSURROS_LORE['sus_vi_2'].titulo,
    texto: SUSSURROS_LORE['sus_vi_2'].texto },
  sus_vi_3:  { id: 'sus_vi_3',  tipo: 'sussurro',     temporada: 2, capitulo: 6, ordem: 9,
    titulo: SUSSURROS_LORE['sus_vi_3'].titulo,
    texto: SUSSURROS_LORE['sus_vi_3'].texto },
  sus_vi_4:  { id: 'sus_vi_4',  tipo: 'sussurro',     temporada: 2, capitulo: 6, ordem: 10,
    titulo: SUSSURROS_LORE['sus_vi_4'].titulo,
    texto: SUSSURROS_LORE['sus_vi_4'].texto },

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
    titulo: SUSSURROS_LORE['sus_vii_0'].titulo,
    texto: SUSSURROS_LORE['sus_vii_0'].texto },
  sus_vii_1: { id: 'sus_vii_1', tipo: 'sussurro',     temporada: 2, capitulo: 7, ordem: 7,
    titulo: SUSSURROS_LORE['sus_vii_1'].titulo,
    texto: SUSSURROS_LORE['sus_vii_1'].texto },
  sus_vii_2: { id: 'sus_vii_2', tipo: 'sussurro',     temporada: 2, capitulo: 7, ordem: 8,
    titulo: SUSSURROS_LORE['sus_vii_2'].titulo,
    texto: SUSSURROS_LORE['sus_vii_2'].texto },
  sus_vii_3: { id: 'sus_vii_3', tipo: 'sussurro',     temporada: 2, capitulo: 7, ordem: 9,
    titulo: SUSSURROS_LORE['sus_vii_3'].titulo,
    texto: SUSSURROS_LORE['sus_vii_3'].texto },
  sus_vii_4: { id: 'sus_vii_4', tipo: 'sussurro',     temporada: 2, capitulo: 7, ordem: 10,
    titulo: SUSSURROS_LORE['sus_vii_4'].titulo,
    texto: SUSSURROS_LORE['sus_vii_4'].texto },
  sus_vii_5: { id: 'sus_vii_5', tipo: 'sussurro',     temporada: 2, capitulo: 7, ordem: 11,
    titulo: SUSSURROS_LORE['sus_vii_5'].titulo,
    texto: SUSSURROS_LORE['sus_vii_5'].texto },

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
    titulo: SUSSURROS_LORE['sus_viii_0'].titulo,
    texto: SUSSURROS_LORE['sus_viii_0'].texto },
  sus_viii_1: { id: 'sus_viii_1', tipo: 'sussurro',   temporada: 2, capitulo: 8, ordem: 7,
    titulo: SUSSURROS_LORE['sus_viii_1'].titulo,
    texto: SUSSURROS_LORE['sus_viii_1'].texto },
  sus_viii_2: { id: 'sus_viii_2', tipo: 'sussurro',   temporada: 2, capitulo: 8, ordem: 8,
    titulo: SUSSURROS_LORE['sus_viii_2'].titulo,
    texto: SUSSURROS_LORE['sus_viii_2'].texto },
  sus_viii_3: { id: 'sus_viii_3', tipo: 'sussurro',   temporada: 2, capitulo: 8, ordem: 9,
    titulo: SUSSURROS_LORE['sus_viii_3'].titulo,
    texto: SUSSURROS_LORE['sus_viii_3'].texto },
  sus_viii_4: { id: 'sus_viii_4', tipo: 'sussurro',   temporada: 2, capitulo: 8, ordem: 10,
    titulo: SUSSURROS_LORE['sus_viii_4'].titulo,
    texto: SUSSURROS_LORE['sus_viii_4'].texto },

  // ── Verdade da Temporada II ───────────────────────────────────────────────
  verdade_t2: { id: 'verdade_t2', tipo: 'verdade', temporada: 2, capitulo: 8, ordem: 99,
    titulo: VERDADES_LORE['verdade_t2'].titulo,
    texto: VERDADES_LORE['verdade_t2'].texto },

  verdade_t2_revisao: { id: 'verdade_t2_revisao', tipo: 'verdade', temporada: 2, capitulo: 8, ordem: 98.5,
    titulo: VERDADES_LORE['verdade_t2_revisao'].titulo,
    texto: VERDADES_LORE['verdade_t2_revisao'].texto },
};

// IDs dos sussurros por capítulo — para sortear durante expedições.
export const SUSSURROS_POR_CAPITULO: Record<number, string[]> = {
  1: ['sus_t1_0', 'sus_t1_1', 'sus_t1_2', 'sus_t1_3', 'sus_t1_4'],
  2: ['sus_t2_0', 'sus_t2_1', 'sus_t2_2', 'sus_t2_3', 'sus_t2_4'],
  3: ['sus_t3_0', 'sus_t3_1', 'sus_t3_2', 'sus_t3_3', 'sus_t3_4'],
  4: ['sus_t4_0', 'sus_t4_1', 'sus_t4_2', 'sus_t4_3', 'sus_t4_4'],
  5: ['sus_v_0',   'sus_v_1',   'sus_v_2',   'sus_v_3',   'sus_v_4'],
  6: ['sus_vi_0',  'sus_vi_1',  'sus_vi_2',  'sus_vi_3',  'sus_vi_4'],
  7: ['sus_vii_0', 'sus_vii_1', 'sus_vii_2', 'sus_vii_3', 'sus_vii_4', 'sus_vii_5'],
  8: ['sus_viii_0','sus_viii_1','sus_viii_2','sus_viii_3','sus_viii_4'],
};

// Id do fragmento de Codex de uma câmara ("página recuperada").
export function idFragmentoCamara(camaraId: string): string {
  return `cam_${camaraId}`;
}

// NOTA: as câmaras agora são PROCEDURAIS por-save (ver src/floor-engine), então
// suas "páginas recuperadas" não podem ser fragmentos estáticos em CODEX_FRAGMENTOS.
// A lore de câmara descoberta é guardada em `state.camaraLoresDescobertas` e a
// apresentação no Codex fica para o PR de livros. `idFragmentoCamara` é mantido
// para compatibilidade de id.

// Total de fragmentos de uma temporada (para a barra de progresso na UI).
export function totalFragmentosTemporada(temporada: number): number {
  return Object.values(CODEX_FRAGMENTOS).filter(f => f.temporada === temporada).length;
}

// ─── LIVRO DA TEMPORADA (história principal montável) ─────────────────────────
// Fragmento PRINCIPAL = espinha dorsal da história (Verdades + arco dos Habitantes).
// Secundário = sussurro/eco/câmara (flavor, pontas soltas, "Fragmentos Dispersos").
// Deriva do tipo — sem marcar entrada por entrada.
export function ehFragmentoPrincipal(frag: FragmentoCodex): boolean {
  return frag.tipo === 'verdade' || frag.tipo === 'habitante';
}

// Páginas do Livro de uma temporada: os fragmentos PRINCIPAIS em ordem narrativa
// (capítulo, ordem). O "livro" reusa os textos canônicos dos fragmentos.
export function paginasDoLivro(temporada: number): FragmentoCodex[] {
  return Object.values(CODEX_FRAGMENTOS)
    .filter(f => f.temporada === temporada && ehFragmentoPrincipal(f))
    .sort((a, b) => a.capitulo - b.capitulo || a.ordem - b.ordem);
}

// Progresso do livro (páginas principais desbloqueadas / total).
export function progressoLivroTemporada(
  state: Pick<GameState, 'codexFragmentos'>, temporada: number,
): { desbloqueadas: number; total: number } {
  const paginas = paginasDoLivro(temporada);
  return { desbloqueadas: paginas.filter(f => state.codexFragmentos.includes(f.id)).length, total: paginas.length };
}

export interface CapituloLivro {
  capitulo: number;
  nome: string;
  paragrafos: string[]; // textos canônicos dos fragmentos principais, em ordem
}

// Capítulos do Livro: agrupa os fragmentos principais por capítulo e entrega os
// textos canônicos como PARÁGRAFOS de prosa contínua — para o leitor apresentar um
// capítulo por vez, como um livro (não passagens isoladas com título por fragmento).
export function capitulosDoLivro(temporada: number): CapituloLivro[] {
  const grupos = new Map<number, string[]>();
  for (const f of paginasDoLivro(temporada)) {
    if (!grupos.has(f.capitulo)) grupos.set(f.capitulo, []);
    grupos.get(f.capitulo)!.push(f.texto);
  }
  return [...grupos.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([capitulo, paragrafos]) => ({
      capitulo,
      nome: CAPITULO_NOMES[capitulo] ?? `Capítulo ${capitulo}`,
      paragrafos,
    }));
}

// Livro liberado p/ leitura = todas as páginas principais desbloqueadas (e há conteúdo).
export function livroDaTemporadaDisponivel(
  state: Pick<GameState, 'codexFragmentos'>, temporada: number,
): boolean {
  const { desbloqueadas, total } = progressoLivroTemporada(state, temporada);
  return total > 0 && desbloqueadas === total;
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

// `verificarQuestAndar` foi movida para `quest-engine/rules.ts` (regra pura).

// ─── RELÍQUIAS CENTRALIZADAS ─────────────────────────────────────────────────

export interface ReliquiaData {
  nome: string;
  descricao: string;
  origem: string;  // 'Habitante', 'Quest Oculta', 'Câmara Secreta', etc
}

export const RELIQUIAS_CATALOGO: Record<string, ReliquiaData> = {
  // Habitante 1 — escolha B
  'Mensagem Selada': {
    nome: 'Mensagem Selada',
    descricao: 'Uma mensagem que nunca foi entregue, guardada com cuidado. O que não é dito não pode ser roubado de novo.',
    origem: 'Arauto da Névoa (Andar 1)',
  },
  // Habitante 4 — escolha A
  'Frequência Gravada': {
    nome: 'Frequência Gravada',
    descricao: 'O registro das 4.312 vozes que vieram antes. A palavra mais repetida nunca foi "ajuda".',
    origem: 'Voz do Cristal (Andar 4)',
  },
  // Habitante 6 — escolha B
  'Ordem Sem Autoridade': {
    nome: 'Ordem Sem Autoridade',
    descricao: 'Uma ordem guardada sem dono. O guardião serve agora sem necessidade de mandato.',
    origem: 'Sentinela (Andar 6)',
  },
  // Habitante 7 — escolha B
  'Semente do Impossível': {
    nome: 'Semente do Impossível',
    descricao: 'O que germinaria se plantado, mas é mais valioso selado. Nutrição de outra era.',
    origem: 'Jardineira (Andar 7)',
  },
  // Habitante 9 — escolha B
  'Elo das Correntes': {
    nome: 'Elo das Correntes',
    descricao: 'Um elo que diminui a cada andar conquistado. Quanto menos pesa, mais próximo você está.',
    origem: 'Ferreiro Espectral (Andar 9)',
  },
  // Habitante 10 — escolha B
  'Palavras do Fundador': {
    nome: 'Palavras do Fundador',
    descricao: 'Fragmentos de linguagem que o Fundador usou. Palavras que ninguém mais fala.',
    origem: 'Memória da Construção (Andar 10)',
  },
  // Habitante 11 — escolha B
  'Consciência Preenchida': {
    nome: 'Consciência Preenchida',
    descricao: 'O que o Afogado deixou para trás quando deixou de ser gente. A respiração antes da água.',
    origem: 'Afogado Lúcido (Andar 11)',
  },
  // Habitante 13 — escolha B
  'Visão Invertida': {
    nome: 'Visão Invertida',
    descricao: 'O Oráculo viu seu futuro ao contrário. Agora você sabe onde termina.',
    origem: 'Oráculo Invertido (Andar 13)',
  },
  // Habitante 15 — escolha B
  'A Pergunta Não Respondida': {
    nome: 'A Pergunta Não Respondida',
    descricao: 'A pergunta que o Vigia recusou responder. Ainda faz perguntas, mesmo guardada.',
    origem: 'Vigia da Pergunta (Andar 15)',
  },
  // Habitante 19 — escolha B
  'Sussurro do Limiar': {
    nome: 'Sussurro do Limiar',
    descricao: 'Um aviso que não é para você — é para quem vier depois de você. Você consegue ler de qualquer forma.',
    origem: 'Susurro do Limiar (Andar 19)',
  },
  // Habitante 20 — escolha B
  'Fragmento Bruto': {
    nome: 'Fragmento Bruto',
    descricao: 'O que a Torre tentou apagar antes de você chegar. Evidência de que ela tenta.',
    origem: 'Memória Observadora (Andar 20)',
  },
  // Habitante 24 — (novo, assumindo escolha B se existir)
  'Borda do Antes': {
    nome: 'Borda do Antes',
    descricao: 'O que ficou da estrutura que existia antes da Torre. Não era de pedra — era de intenção.',
    origem: 'O Que Viu Antes (Andar 24)',
  },
  // Habitante 34 — (assumindo escolha B se existir)
  'Propósito Reaprendido': {
    nome: 'Propósito Reaprendido',
    descricao: 'A intenção original do Fundador, registrada por quem a guardava. Santuário vs. Prisão.',
    origem: 'Guardião da Intenção (Andar 34)',
  },
  // Habitante 35 — (assumindo escolha B se existir)
  'Intenção Própria': {
    nome: 'Intenção Própria',
    descricao: 'O último sussurro do Fundador, guardado como prova de que a intenção ainda é feita.',
    origem: 'Último Sussurro do Fundador (Andar 35)',
  },
  // Quests Ocultas — POOL_EXPLORACAO
  'Selo Original — Fragmento I': {
    nome: 'Selo Original — Fragmento I',
    descricao: 'Uma peça de metal com símbolo que precede qualquer língua conhecida. O Codex registra que este símbolo reaparece em andares acima de 40.',
    origem: 'Quest Oculta (Exploração)',
  },
  'Tábua da Língua Anterior — Fragmento I': {
    nome: 'Tábua da Língua Anterior — Fragmento I',
    descricao: 'Uma cópia do padrão mapeado pelo Erudito. Não é tradução — é estrutura. Algo em andares além de 40 usará esta estrutura de forma que fará sentido retroativo.',
    origem: 'Quest Oculta (Exploração)',
  },
  'Escama de Algo Sem Catálogo': {
    nome: 'Escama de Algo Sem Catálogo',
    descricao: 'Deixada no ponto exato onde os rastros circulavam. A Torre às vezes absorve coisas antes que possam ser classificadas — esta escama é evidência de que a absorção nem sempre é completa.',
    origem: 'Quest Oculta (Exploração)',
  },
  'Núcleo de Ferro Primordial': {
    nome: 'Núcleo de Ferro Primordial',
    descricao: 'Uma esfera mais pesada do que ferro comum. Não é ferro — é o que o ferro seria se tivesse escolhido ser outra coisa. Em temporadas futuras, sua natureza ficará clara.',
    origem: 'Quest Oculta (Exploração)',
  },
  // Quests Ocultas — POOL_VELOCIDADE
  'Diário da Expedição Sem Retorno — Página Restante': {
    nome: 'Diário da Expedição Sem Retorno — Página Restante',
    descricao: 'Uma única página que sobreviveu ao fogo. A última linha foi arrancada à mão antes que o diário fosse queimado.',
    origem: 'Quest Oculta (Velocidade)',
  },
  'Gota de Água Quieta — Selada em Cristal': {
    nome: 'Gota de Água Quieta — Selada em Cristal',
    descricao: 'A água solidificou em cristal ao ser retirada. Algo sobre sua composição a torna estável fora da câmara. Útil para algo que ainda não foi construído.',
    origem: 'Quest Oculta (Velocidade)',
  },
  'Resina Que Não Seca': {
    nome: 'Resina Que Não Seca',
    descricao: 'Uma seiva que saiu de algo que não existe no terceiro andar. Continua pegajosa, continuará pegajosa. Espécie perdida de quando a Torre era diferente.',
    origem: 'Quest Oculta (Velocidade)',
  },
  'Flor Que Não Morre': {
    nome: 'Flor Que Não Morre',
    descricao: 'Colhida no Andar 17 onde a morte se respira como ar. Flores normais não existem lá. Esta existe.',
    origem: 'Quest Oculta (Velocidade)',
  },
};

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

export const POOL_EXPLORACAO: QuestOcultaTemplate[] = [
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

export const POOL_VELOCIDADE: QuestOcultaTemplate[] = [
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

// `verificarQuestOculta` e `gerarQuestOculta` foram movidas para
// `quest-engine/rules.ts` (regras puras). Os pools (POOL_EXPLORACAO/VELOCIDADE)
// permanecem aqui como dados.

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
  // Feed de acontecimentos (mural) — ring-buffer dos eventos notáveis recentes.
  feed?: Acontecimento[];
  // Fila de acontecimentos de alta importância a exibir como toast (drenada pela UI).
  toastsPendentes?: Acontecimento[];

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
  // Seed procedural do save: define QUAIS câmaras (tema/requisito/dureza) existem
  // em cada andar desta torre. Duas torres com seeds diferentes têm câmaras
  // diferentes → guias "faça X,Y,Z" não funcionam. Ver src/floor-engine.
  camaraSeed?: number;
  // Lore recuperada de câmaras exploradas (as câmaras são per-save, então a página
  // não vem do CODEX_FRAGMENTOS estático). Apresentação no Codex fica p/ o PR de livros.
  camaraLoresDescobertas?: Array<{ id: string; floor: number; titulo: string; texto: string }>;
  camarasSecretasEstado?: Record<string, { descoberta: boolean; tentativas: number; encontrada: boolean }>;
  // Fila de câmaras (por camaraId) recém-reveladas pelo processDay, aguardando o
  // modal de evento que avisa o jogador. Esvaziada conforme o jogador reconhece.
  camarasNovasDescobertas?: string[];
  // IDs do último grupo enviado em expedição — usado pelo "explorar agora" da
  // câmara recém-descoberta (reaproveita o mesmo grupo cansado da conquista).
  ultimaExpedicaoGrupo?: string[];
  farmsPorAndarEClasse?: Record<number, Record<ProfissaoId, number>>;
  totalMortesAndar?: Record<number, number>;

  // ─── Atlas da Torre ──────────────────────────────────────────────────────
  // História local de cada andar, visível na ficha do Atlas.
  andarConquistadoDia?: Record<number, number>;                      // floor → dia da conquista
  memoriais?: Record<number, Array<{ nome: string; dia: number }>>;  // quem caiu em cada andar (cap 5)
  ultimoSussurroLugarDia?: number;                                   // fôlego dos sussurros de lugar (anti-spam)
  fadigaAndar?: Record<number, { usos: number; dia: number }>;       // fôlego dos andares (decaimento lazy, ver folego.ts)

  // ─── Metas Diárias ───────────────────────────────────────────────────────
  metasDiarias: MetasDiariasState;

  // ─── Motor de vida (npc-engine) ───────────────────────────────────────────
  // Afinidade entre NPCs, por par. Chave canônica `parKey(idA,idB)` (ids ordenados);
  // valor −100..100. Ausência = 0 (desconhecidos). Ver src/npc-engine/relationships.
  relacionamentos?: Record<string, number>;
  // Arcos persistidos por par (mesma chave canônica). Amizade/rivalidade são
  // derivadas da afinidade; romance/mentoria são eventos e ficam gravados aqui.
  // Ver src/npc-engine/systems/vinculos-tipados.
  vinculosEspeciais?: Record<string, 'romance' | 'mentoria'>;
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
  // Expansão D — ampliação (reduz colisões de nome)
  'Alric', 'Bryn', 'Cael', 'Dorn', 'Edda', 'Fenn', 'Gerda', 'Hakon',
  'Ilsa', 'Joran', 'Katla', 'Leif', 'Morwen', 'Nael', 'Odra', 'Perrin',
  'Ragnvald', 'Sela', 'Torvald', 'Undis', 'Vesna', 'Wulf', 'Ysera', 'Zeru',
  'Aveline', 'Boran', 'Cressa', 'Doran', 'Emeric', 'Fiora', 'Galen', 'Hesper',
  'Ingrid', 'Joris', 'Kestra', 'Lorne', 'Maeve', 'Nero', 'Ondine', 'Peregrin',
  'Rurik', 'Solveig', 'Tamsin', 'Ulfr', 'Vidar', 'Wilda', 'Yorick', 'Zephyra',
];

// Sobrenomes / casas — sabor medieval. Concedidos apenas a NPCs nobres (Raro+)
// em gerarNomeNpc; plebeus permanecem com nome único. Misto de casas ("de X",
// "da Torre Negra") e patronímicos/epítetos de linhagem.
export const SOBRENOMES = [
  'de Corval', 'de Vhalen', 'de Ashryn', 'de Morgane', 'de Sorne', 'de Brakka',
  'da Torre Negra', 'da Ravina', 'do Vão', 'do Ocaso', 'da Foz Cinzenta', 'do Ermo',
  'Bramido', 'Coração-de-Pedra', 'Mão-de-Ferro', 'Punho-Cinza', 'Olho-Torto',
  'Corvo', 'Lobo', 'Alcateia', 'Escudo-Rúnico', 'Sangue-Frio', 'Voz-Cava',
  'Vael', 'Corne', 'Draven', 'Halloran', 'Verrick', 'Osric', 'Malvos', 'Renard',
  'Thornwald', 'Greymoor', 'Ravenshold', 'Blackmere', 'Duskbane', 'Ironvale',
  'Wyrmsbane', 'Ashford', 'Grimsdottir', 'Karsgaard', 'Nordval', 'Sturmhal',
  'da Fenda', 'do Selo', 'da Névoa', 'dos Ecos', 'do Limiar', 'da Vigília',
];

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// True para raridades consideradas "nobres" (recebem casa/sobrenome ao nascer).
export function ehRaridadeNobre(raridade: Raridade): boolean {
  return raridade === 'Raro' || raridade === 'Épico' || raridade === 'Lendário' || raridade === 'Divino';
}

// Nome de um NPC gerado. Plebeus (Comum/Incomum) recebem só o primeiro nome;
// nobres (Raro+) ganham um sobrenome/casa medieval, reforçando o status e
// praticamente eliminando colisões. Retorna nome de exibição + a casa isolada
// (undefined para plebeus). Vestígios/primordiais têm nomes próprios
// (lancamento.ts) e não passam por aqui.
export function gerarNomeNpc(raridade: Raridade): { nome: string; sobrenome?: string } {
  const primeiro = NAMES[Math.floor(Math.random() * NAMES.length)];
  if (!ehRaridadeNobre(raridade)) return { nome: primeiro };
  const sobrenome = SOBRENOMES[Math.floor(Math.random() * SOBRENOMES.length)];
  return { nome: `${primeiro} ${sobrenome}`, sobrenome };
}

export function getRandomHabilidade(): HabilidadeId {
  const ids = Object.keys(HABILIDADES) as HabilidadeId[];
  return ids[Math.floor(Math.random() * ids.length)];
}

function calcRaridade(npc: Pick<NPC, 'forca' | 'agilidade' | 'inteligencia' | 'resistencia'>): Raridade {
  const total = npc.forca + npc.agilidade + npc.inteligencia + npc.resistencia;
  if (total >= 44) return 'Épico';
  if (total >= 34) return 'Raro';
  if (total >= 24) return 'Incomum';
  return 'Comum';
}

// Recalcula a raridade de um NPC existente após mudança de atributos.
// Berço: fama inicial concedida pela raridade de nascença. Raridade é potencial
// (o que a Torre entregou); nobreza é biografia — o berço só dá vantagem de
// partida na fama, nunca o título em si.
export function famaDeBerco(raridade: Raridade): number {
  switch (raridade) {
    case 'Raro':     return 5;
    case 'Épico':    return 10;
    case 'Lendário':
    case 'Divino':   return 15;
    default:         return 0;
  }
}

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
  const raridade = calcRaridade(base);
  const { nome, sobrenome } = gerarNomeNpc(raridade);
  return {
    ...base,
    nome,
    sobrenome,
    raridade,
    fama: famaDeBerco(raridade),
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
  const { nome, sobrenome } = gerarNomeNpc(raridade);
  const base = {
    id: crypto.randomUUID(),
    nome,
    sobrenome,
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
  return { ...base, raridade, fama: famaDeBerco(raridade), habilidade: getRandomHabilidade() };
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

  // Sanidade também pesa: mente abalada rende menos em expedição/combate.
  if (npc.sanidade < 30) p *= 0.75;
  else if (npc.sanidade < 50) p *= 0.90;

  return p;
}

// Poder somado de um grupo, com o bônus de poder da cidadela (Quartel etc.).
// calcNpcPower já embute a penalidade de fadiga individual, então grupos cansados
// naturalmente rendem menos poder. Reutilizável por expedições e câmaras.
export function calcPoderGrupo(group: NPC[], poderBonus = 0): number {
  return group.reduce((sum, n) => sum + calcNpcPower(n), 0) * (1 + poderBonus);
}

export function fadigaMediaGrupo(group: NPC[]): number {
  if (group.length === 0) return 0;
  return group.reduce((sum, n) => sum + n.fadiga, 0) / group.length;
}

// `dificuldadeCamara`, `calcAfinidadeCamara` e a rolagem `chanceAbrirCamara`
// (que substitui a antiga `calcExploracaoCamara`) vivem em `floor-engine/rules.ts`.

// Bônus de desempenho sorteado ao concluir uma câmara — além da recompensa
// primária (recursos + moral + relíquia fixa). Puro: decide QUAL bônus e a
// magnitude; a aplicação (buffar NPC, adicionar sobrevivente, escolher relíquia)
// fica no GameContext, que tem acesso ao estado. O sorteio ponderado pelo
// desempenho garante que jogadores diferentes recebam coisas diferentes.
export type RecompensaCamaraBonus =
  | { tipo: 'buff_permanente'; incremento: number }
  | { tipo: 'sobrevivente' }
  | { tipo: 'reliquia_bonus' }
  | { tipo: 'recursos_extra'; multiplicador: number }
  | { tipo: 'nenhum' };

export function sortearRecompensaCamara(
  desempenho: number,
  rng: () => number = Math.random,
): RecompensaCamaraBonus {
  const d = Math.max(0, Math.min(1, desempenho));
  // Chance de haver bônus extra cresce com o desempenho (0.35 → 0.85).
  if (rng() > 0.35 + d * 0.5) return { tipo: 'nenhum' };
  // Tabela ponderada — desempenho alto valoriza recompensas raras.
  const tabela: Array<{ tipo: RecompensaCamaraBonus['tipo']; peso: number }> = [
    { tipo: 'recursos_extra',  peso: 3 },
    { tipo: 'sobrevivente',    peso: 1 + d * 2 },
    { tipo: 'buff_permanente', peso: 1 + d * 3 },
    { tipo: 'reliquia_bonus',  peso: d * 2 },
  ];
  const total = tabela.reduce((s, t) => s + t.peso, 0);
  let roll = rng() * total;
  for (const t of tabela) {
    roll -= t.peso;
    if (roll > 0) continue;
    if (t.tipo === 'buff_permanente') return { tipo: 'buff_permanente', incremento: d >= 0.6 ? 2 : 1 };
    if (t.tipo === 'recursos_extra')  return { tipo: 'recursos_extra', multiplicador: 1 + d };
    if (t.tipo === 'sobrevivente')    return { tipo: 'sobrevivente' };
    return { tipo: 'reliquia_bonus' };
  }
  return { tipo: 'nenhum' };
}

// ─── TEMPO DE JOGO ─────────────────────────────────────────────────────────────
// Duração real de um dia de jogo. Fonte única de verdade — usada pelo catch-up
// offline (GameContext) e pela previsão de próximo evento das notificações push.
export const MS_PER_GAME_DAY_BASE = 2 * 60 * 60 * 1000; // 2h na velocidade 1x
export const getMsPerDay = (velocidade: number) => MS_PER_GAME_DAY_BASE / velocidade;

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
  nomeT2?: string;         // nome exibido na Temporada 2 (andar >= 21); cai p/ nome se ausente
  descricao: string;
  maxNivel: number;
  niveis: NivelEdificio[];
}

export const BUILDINGS: Record<EdificioTipo, BuildingDef> = {
  Fogueira: {
    tipo: 'Fogueira',
    nome: 'Fogueira',
    nomeT2: 'Pira Eterna',
    descricao: 'Aquece a alma e eleva o moral do grupo.',
    maxNivel: 5,
    niveis: [
      { custo: { madeira: 5 },              resumo: '+1 moral/dia',  efeito: { moralDia: 1 } },
      { custo: { madeira: 15, pedra: 10 },  resumo: '+2 moral/dia',  efeito: { moralDia: 2 } },
      { custo: { madeira: 30, pedra: 20 },  resumo: '+4 moral/dia',  efeito: { moralDia: 4 } },
      { custo: { madeira: 50, pedra: 35, ferro: 20 },  resumo: '+6 moral/dia · +1 sanidade/dia',  efeito: { moralDia: 6, sanidadeDia: 1 } },
      { custo: { madeira: 70, pedra: 50, ferro: 35 },  resumo: '+8 moral/dia · +2 sanidade/dia',  efeito: { moralDia: 8, sanidadeDia: 2 } },
    ],
  },
  Fazenda: {
    tipo: 'Fazenda',
    nome: 'Fazenda',
    nomeT2: 'Campos do Antes',
    descricao: 'Produz comida diária para sustentar a população.',
    maxNivel: 5,
    niveis: [
      { custo: { madeira: 15, pedra: 5 },            resumo: '+10 comida/dia', efeito: { comidaDia: 10 } },
      { custo: { madeira: 35, pedra: 20 },           resumo: '+22 comida/dia', efeito: { comidaDia: 22 } },
      { custo: { madeira: 60, pedra: 40, ferro: 10 }, resumo: '+40 comida/dia', efeito: { comidaDia: 40 } },
      { custo: { madeira: 90, pedra: 60, ferro: 25 }, resumo: '+58 comida/dia', efeito: { comidaDia: 58 } },
      { custo: { madeira: 120, pedra: 80, ferro: 40 }, resumo: '+80 comida/dia', efeito: { comidaDia: 80 } },
    ],
  },
  Enfermaria: {
    tipo: 'Enfermaria',
    nome: 'Enfermaria',
    nomeT2: 'Casa da Cura Antiga',
    descricao: 'Acelera a recuperação de fadiga de todos.',
    maxNivel: 5,
    niveis: [
      { custo: { madeira: 15, pedra: 10 },            resumo: '+8 fadiga rec./dia',  efeito: { fadigaRec: 8 } },
      { custo: { madeira: 35, pedra: 25 },            resumo: '+18 fadiga rec./dia', efeito: { fadigaRec: 18 } },
      { custo: { madeira: 60, pedra: 45, ferro: 12 }, resumo: '+30 fadiga rec./dia', efeito: { fadigaRec: 30 } },
      { custo: { madeira: 85, pedra: 65, ferro: 20 }, resumo: '+42 fadiga rec./dia', efeito: { fadigaRec: 42 } },
      { custo: { madeira: 115, pedra: 90, ferro: 35 }, resumo: '+56 fadiga rec./dia', efeito: { fadigaRec: 56 } },
    ],
  },
  Templo: {
    tipo: 'Templo',
    nome: 'Templo',
    nomeT2: 'Santuário da Verdade',
    descricao: 'Restaura a sanidade e fortalece o moral.',
    maxNivel: 5,
    niveis: [
      { custo: { pedra: 30, madeira: 20 },            resumo: '+2 moral, +0.5 sanidade/dia', efeito: { moralDia: 2, sanidadeDia: 0.5 } },
      { custo: { pedra: 55, madeira: 40, ferro: 10 }, resumo: '+4 moral, +1.5 sanidade/dia', efeito: { moralDia: 4, sanidadeDia: 1.5 } },
      { custo: { pedra: 80, madeira: 60, ferro: 25 }, resumo: '+6 moral, +3 sanidade/dia',   efeito: { moralDia: 6, sanidadeDia: 3 } },
      { custo: { pedra: 110, madeira: 85, ferro: 40 }, resumo: '+8 moral, +4.5 sanidade/dia', efeito: { moralDia: 8, sanidadeDia: 4.5 } },
      { custo: { pedra: 140, madeira: 110, ferro: 60 }, resumo: '+10 moral, +6 sanidade/dia', efeito: { moralDia: 10, sanidadeDia: 6 } },
    ],
  },
  Quartel: {
    tipo: 'Quartel',
    nome: 'Quartel',
    nomeT2: 'Sentinela do Intervalo',
    descricao: 'Treina o grupo, aumentando o poder nas expedições.',
    maxNivel: 5,
    niveis: [
      { custo: { madeira: 25, pedra: 20, ferro: 10 }, resumo: '+10% poder de expedição', efeito: { poderBonus: 0.10 } },
      { custo: { madeira: 45, pedra: 40, ferro: 25 }, resumo: '+22% poder de expedição', efeito: { poderBonus: 0.22 } },
      { custo: { madeira: 70, pedra: 60, ferro: 45 }, resumo: '+38% poder de expedição', efeito: { poderBonus: 0.38 } },
      { custo: { madeira: 100, pedra: 85, ferro: 65 }, resumo: '+52% poder de expedição', efeito: { poderBonus: 0.52 } },
      { custo: { madeira: 130, pedra: 110, ferro: 90 }, resumo: '+68% poder de expedição', efeito: { poderBonus: 0.68 } },
    ],
  },
  Armazem: {
    tipo: 'Armazem',
    nome: 'Armazém',
    nomeT2: 'Cofre da Preservação',
    descricao: 'Expande a capacidade de estocagem de recursos.',
    maxNivel: 5,
    niveis: [
      { custo: { madeira: 20, pedra: 10 },            resumo: 'Capacidade 150', efeito: { capacidadeArmazem: 150 } },
      { custo: { madeira: 40, pedra: 25 },            resumo: 'Capacidade 300', efeito: { capacidadeArmazem: 300 } },
      { custo: { madeira: 60, pedra: 40, ferro: 15 }, resumo: 'Capacidade 600', efeito: { capacidadeArmazem: 600 } },
      { custo: { madeira: 90, pedra: 60, ferro: 30 }, resumo: 'Capacidade 900', efeito: { capacidadeArmazem: 900 } },
      { custo: { madeira: 120, pedra: 80, ferro: 50 }, resumo: 'Capacidade 1200', efeito: { capacidadeArmazem: 1200 } },
    ],
  },
  Alojamento: {
    tipo: 'Alojamento',
    nome: 'Alojamento',
    nomeT2: 'Câmara de Repouso Eterno',
    descricao: 'Abriga sobreviventes. Define o limite de população da cidadela.',
    maxNivel: 5,
    niveis: [
      { custo: { madeira: 20, pedra: 8 },             resumo: 'Limite de 9 moradores',  efeito: { capPopulacao: 9 } },
      { custo: { madeira: 40, pedra: 25 },            resumo: 'Limite de 12 moradores', efeito: { capPopulacao: 12 } },
      { custo: { madeira: 70, pedra: 45, ferro: 15 }, resumo: 'Limite de 16 moradores', efeito: { capPopulacao: 16 } },
      { custo: { madeira: 100, pedra: 65, ferro: 30 }, resumo: 'Limite de 18 moradores', efeito: { capPopulacao: 18 } },
      { custo: { madeira: 140, pedra: 90, ferro: 50 }, resumo: 'Limite de 20 moradores', efeito: { capPopulacao: 20 } },
    ],
  },
  Arquivo: {
    tipo: 'Arquivo',
    nome: 'Arquivo',
    nomeT2: 'Biblioteca da Verdade',
    descricao: 'Cataloga os fragmentos da Torre. Aumenta o poder de expedição de eruditos e batedores.',
    maxNivel: 5,
    niveis: [
      { custo: { pedra: 40, madeira: 30, ferro: 15 }, resumo: '+15% poder de expedição', efeito: { poderBonus: 0.15 } },
      { custo: { pedra: 70, madeira: 55, ferro: 30 }, resumo: '+28% poder de expedição', efeito: { poderBonus: 0.28 } },
      { custo: { pedra: 120, madeira: 90, ferro: 60 }, resumo: '+42% poder de expedição · +8% Sussurro', efeito: { poderBonus: 0.42 } },
      { custo: { pedra: 160, madeira: 125, ferro: 85 }, resumo: '+56% poder de expedição · +12% Sussurro', efeito: { poderBonus: 0.56 } },
      { custo: { pedra: 200, madeira: 160, ferro: 120 }, resumo: '+72% poder de expedição · +16% Sussurro', efeito: { poderBonus: 0.72 } },
    ],
  },
  Mirante: {
    tipo: 'Mirante',
    nome: 'Mirante',
    nomeT2: 'Espelho dos Andares',
    descricao: 'Vigia os andares superiores. Reduz a fadiga das expedições e melhora a moral.',
    maxNivel: 5,
    niveis: [
      { custo: { madeira: 35, pedra: 25, ferro: 20 }, resumo: '+12 fadiga rec./dia · +1 moral/dia', efeito: { fadigaRec: 12, moralDia: 1 } },
      { custo: { madeira: 60, pedra: 45, ferro: 40 }, resumo: '+22 fadiga rec./dia · +2 moral/dia', efeito: { fadigaRec: 22, moralDia: 2 } },
      { custo: { madeira: 105, pedra: 75, ferro: 65 }, resumo: '+35 fadiga rec./dia · +3 moral/dia', efeito: { fadigaRec: 35, moralDia: 3 } },
      { custo: { madeira: 140, pedra: 100, ferro: 85 }, resumo: '+48 fadiga rec./dia · +4 moral/dia', efeito: { fadigaRec: 48, moralDia: 4 } },
      { custo: { madeira: 180, pedra: 130, ferro: 110 }, resumo: '+63 fadiga rec./dia · +5 moral/dia', efeito: { fadigaRec: 63, moralDia: 5 } },
    ],
  },
  RetratoTorre: {
    tipo: 'RetratoTorre',
    nome: 'Retrato da Torre',
    nomeT2: 'Retrato da Torre',
    descricao: 'Captura a essência da Torre em espelho. Aumenta descoberta de câmaras e eventos raros.',
    maxNivel: 2,
    niveis: [
      { custo: { pedra: 50, madeira: 40, ferro: 30 }, resumo: '+10% câmaras/semana · +1 eco/semana', efeito: { poderBonus: 0.05 } },
      { custo: { pedra: 80, madeira: 60, ferro: 50 }, resumo: '+15% câmaras/semana · +2 ecos/semana', efeito: { poderBonus: 0.10 } },
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
// `fatorNpc` (opcional) escala a contribuição individual de cada trabalhador —
// o GameContext injeta o fator de humor do motor de vida por aqui (game-data
// não pode importar o npc-engine). Ausente ⇒ fator 1 (chamadas internas).
export function getEfeitos(
  edificios: Edificio[],
  npcs: NPC[] = [],
  fatorNpc?: (n: NPC) => number,
): Required<EfeitoEdificio> {
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
        const mult = (getProfissao(w) === afim ? 1.5 : 1) * (fatorNpc?.(w) ?? 1);
        switch (e.tipo) {
          case 'Fazenda':    ef.comidaDia += Math.round(w.inteligencia * 0.5 * mult); break;
          case 'Enfermaria': ef.fadigaRec += Math.round(w.inteligencia * 0.4 * mult); break;
          case 'Quartel':    ef.poderBonus += w.forca * 0.006 * mult; break;
          case 'Templo':     ef.moralDia += Math.round(w.resistencia * 0.25 * mult); break;
          case 'Fogueira':   ef.moralDia += Math.round(w.resistencia * 0.2 * mult); break;
          case 'Arquivo':    ef.poderBonus += w.inteligencia * 0.006 * mult; break;
          case 'Mirante':    ef.fadigaRec  += Math.round(w.agilidade * 0.3 * mult); break;
          case 'RetratoTorre': ef.poderBonus += w.inteligencia * 0.004 * mult; break;
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

// Retorna o nome do edifício baseado na temporada (andarAtual)
export function nomeEdificio(tipo: EdificioTipo, andarAtual: number): string {
  const def = BUILDINGS[tipo];
  if (!def) return tipo;
  // T2 começa no andar 21
  const temporada = andarAtual >= 21 ? 2 : 1;
  return temporada === 2 && def.nomeT2 ? def.nomeT2 : def.nome;
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
export const BASE_DIFICULDADE: number[] = [
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

export type LogGuerra = { tipo: LogTipo; mensagem: string };

// Encerra a guerra: apura vencedor, devolve sobreviventes, aplica espólio/pilhagem
// e registra no histórico. Muta `draft`. Chamada de dentro de avancarGuerra.
// Em vitória devolve os ids da tropa sobrevivente (para o caller registrar feitos).
function resolverGuerra(
  draft: GameState,
  motivo: 'prazo' | 'colapso' | 'exercito_rival_quebrado',
): { logs: LogGuerra[]; vitoriaIds?: string[] } {
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
  return vitoria ? { logs, vitoriaIds: tropaViva.map((n) => n.id) } : { logs };
}

// Calcula o custo diário de suprimento da guerra para um número de tropas vivas.
export function calcCustoSuprimentoGuerra(numTropaViva: number): { comida: number; ferro: number } {
  return {
    comida: Math.ceil(numTropaViva * 2.5),
    ferro: Math.max(1, Math.floor(numTropaViva * 0.5)),
  };
}

// Resultado de um dia de guerra: logs + quem tombou hoje (para o GameContext
// aplicar luto — game-data não pode importar o motor de vida) e, se a guerra
// terminou em vitória, os ids dos sobreviventes (para registrar o feito).
export interface ResultadoDiaGuerra {
  logs: LogGuerra[];
  mortos: { id: string; nome: string }[];
  vitoriaIds?: string[];
}

// Avança um dia da guerra em curso. Muta `draft` (guerra, moradores, recursos,
// moral, histórico) e retorna as entradas de log a serem registradas. Deve ser
// chamada uma vez por dia dentro de processDay.
export function avancarGuerra(draft: GameState): ResultadoDiaGuerra {
  const g = draft.guerra;
  if (!g) return { logs: [], mortos: [] };
  const logs: LogGuerra[] = [];
  const mortos: ResultadoDiaGuerra['mortos'] = [];
  const ef = getEfeitos(draft.edificios, draft.npcs);

  g.diasDecorridos += 1;

  const tropa = draft.npcs.filter((n) => g.tropaIds.includes(n.id) && n.vivo);

  // Sem tropa viva → colapso imediato (derrota).
  if (tropa.length === 0) {
    return { ...resolverGuerra(draft, 'colapso'), mortos };
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
      mortos.push({ id: n.id, nome: n.nome });
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
  let vitoriaIds: string[] | undefined;
  const encerrar = (motivo: 'prazo' | 'colapso' | 'exercito_rival_quebrado') => {
    const fim = resolverGuerra(draft, motivo);
    logs.push(...fim.logs);
    vitoriaIds = fim.vitoriaIds;
  };
  if (g.rivalIntegridade <= 0) encerrar('exercito_rival_quebrado');
  else if (tropaViva.length === 0) encerrar('colapso');
  else if (g.diasDecorridos >= g.duracao) encerrar('prazo');

  return { logs, mortos, vitoriaIds };
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
