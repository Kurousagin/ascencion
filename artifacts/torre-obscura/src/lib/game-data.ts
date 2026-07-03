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
}

export type EdificioTipo = 'Fogueira' | 'Fazenda' | 'Enfermaria' | 'Quartel' | 'Templo' | 'Armazem';

export interface Edificio {
  tipo: EdificioTipo;
  nivel: number;
}

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
};

// Aggregate all built levels into the daily effect bundle.
export function getEfeitos(edificios: Edificio[]): Required<EfeitoEdificio> {
  const ef: Required<EfeitoEdificio> = {
    comidaDia: 0, moralDia: 0, sanidadeDia: 0, fadigaRec: 0, poderBonus: 0,
    capacidadeArmazem: CAPACIDADE_BASE,
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
