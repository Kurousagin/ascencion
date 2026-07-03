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

export const createInitialState = (): GameState => ({
  dia: 1,
  moral: 70,
  velocidade: 1,
  andarAtual: 1,
  lastTimestamp: Date.now(),
  gameOver: false,
  vitoria: false,
  recursos: {
    comida: 30,
    madeira: 20,
    pedra: 10,
    ferro: 5,
    capacidadeArmazem: 60,
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

// ─── BUILDINGS ────────────────────────────────────────────────────────────────

export const EDIFICIOS_CUSTOS: Record<string, { madeira?: number; pedra?: number; ferro?: number }> = {
  Fogueira:    { madeira: 5 },
  Fazenda:     { madeira: 15, pedra: 5 },
  Enfermaria:  { madeira: 15, pedra: 10 },
  Quartel:     { madeira: 25, pedra: 20, ferro: 10 },
  Templo:      { pedra: 30, madeira: 20 },
  Armazem_1:   { madeira: 20, pedra: 10 },
  Armazem_2:   { madeira: 40, pedra: 25 },
  Armazem_3:   { madeira: 60, pedra: 40, ferro: 15 },
};

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
