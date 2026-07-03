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
  guerra: GuerraAtiva | null;       // guerra em curso (uma por vez), ou null
  guerrasHistorico: GuerraRegistro[]; // registro local das guerras encerradas
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
// Critérios: vivo, presente na cidadela (não em expedição/guerra), não é o próprio
// treinando. Ordenado por Força decrescente — o mais forte treina os outros.
// Retorna null se não houver ninguém apto.
export function calcInstrutor(treineeId: string, npcs: NPC[]): NPC | null {
  const candidatos = npcs.filter(
    n =>
      n.vivo &&
      !n.emExpedicao &&
      !n.emGuerra &&
      n.id !== treineeId,
  );
  if (candidatos.length === 0) return null;
  return candidatos.reduce((best, n) => (n.forca > best.forca ? n : best));
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
  if (getProfissao(npc) !== 'combatente') return false;
  return true;
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
  guerrasHistorico: [],
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

export const FLOORS = Array.from({ length: 20 }).map((_, i) => {
  const floor = i + 1;
  const isBoss = floor % 5 === 0;
  const tier = Math.ceil(floor / 5);
  const tierNames = ['Salões Poeirentos', 'Câmaras Sombrias', 'Espirais Malditas', 'Ápice Obscuro'];
  const tierName = tierNames[tier - 1];
  const baseDifficulty = floor * 8;
  // Multiplicador de chefe escalado por tier: menor no início para não travar o
  // jogador no andar 5 antes de ter recursos para construir edifícios de suporte.
  const bossMultiplier = tier === 1 ? 1.4 : tier === 2 ? 1.6 : tier === 3 ? 1.8 : 2.0;
  const difficulty = isBoss ? Math.floor(baseDifficulty * bossMultiplier) : baseDifficulty;
  // Mortalidade reduzida levemente para dar margem a tentativas repetidas.
  const baseMortality = floor * 2;
  const mortality = isBoss ? floor * 3 : baseMortality;
  return { floor, tierName, isBoss, difficulty, mortality, tier };
});

// ─── EXPEDITION ECONOMY ────────────────────────────────────────────────────────

export interface RecompensaAndar {
  comida: number;
  madeira: number;
  pedra: number;
  ferro: number;
}

// Resources credited to the warehouse on a successful floor climb.
// Madeira e pedra foram aumentados para garantir recursos suficientes mesmo quando
// o jogador precisa repetir andares já conquistados (modo exploração/farm).
// Ferro disponível a partir do andar 3 para destravar construções mais cedo.
export function calcRecompensaAndar(floor: number, tier: number): RecompensaAndar {
  return {
    comida:  floor * 2 + 8,
    madeira: floor * 4 + tier * 4,
    pedra:   floor * 3 + tier * 3,
    ferro:   floor >= 3 ? floor + tier : 0,
  };
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
