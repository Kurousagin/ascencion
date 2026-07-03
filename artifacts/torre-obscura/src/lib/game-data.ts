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
  // Empréstimo: preenchido somente na receptora (undefined no lado da dono).
  // emprestadoDe armazena o NOME DE EXIBIÇÃO da dono (remetenteNome), não um deviceId.
  // Usado apenas como flag (truthy = NPC está emprestado) e para exibição na UI.
  emprestadoDe?: string; // nome da cidadela dono (para exibição)
  retornaEm?: number;   // dia de jogo (da receptora) em que o empréstimo vence
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
  const difficulty = isBoss ? Math.floor(baseDifficulty * 1.8) : baseDifficulty;
  const baseMortality = floor * 2.5;
  const mortality = isBoss ? floor * 4 : baseMortality;
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
export function calcRecompensaAndar(floor: number, tier: number): RecompensaAndar {
  return {
    comida:  floor * 2 + 6,
    madeira: floor * 3 + tier * 3,
    pedra:   floor * 2 + tier * 2,
    ferro:   floor >= 4 ? floor + tier : 0,
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
