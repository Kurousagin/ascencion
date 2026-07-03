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

export const NAMES = [
  'Aldric', 'Brenna', 'Caelum', 'Dúnia', 'Erlen', 'Fausta', 'Gael', 'Helva', 
  'Ira', 'Jasper', 'Kira', 'Luca', 'Mira', 'Naldo', 'Orla', 'Petra', 'Quino', 
  'Raia', 'Seren', 'Tobias', 'Ursa', 'Vale', 'Wren', 'Xara', 'Yago', 'Zilda'
];

export const generateNPC = (isObscuro = false): NPC => {
  return {
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
};

export const createInitialState = (): GameState => {
  return {
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
      capacidadeArmazem: 60
    },
    npcs: Array.from({ length: 6 }).map(() => generateNPC()),
    edificios: [],
    log: [{
      id: crypto.randomUUID(),
      tipo: 'info',
      mensagem: 'O ciclo começa. O Observador desperta.',
      dia: 1
    }]
  };
};

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const EDIFICIOS_CUSTOS: Record<string, { madeira?: number; pedra?: number; ferro?: number }> = {
  Fogueira: { madeira: 5 },
  Fazenda: { madeira: 15, pedra: 5 },
  Enfermaria: { madeira: 15, pedra: 10 },
  Quartel: { madeira: 25, pedra: 20, ferro: 10 },
  Templo: { pedra: 30, madeira: 20 },
  'Armazem_2': { madeira: 20, pedra: 10 },
  'Armazem_3': { madeira: 40, pedra: 25, ferro: 15 },
};

export const FLOORS = Array.from({ length: 20 }).map((_, i) => {
  const floor = i + 1;
  const isBoss = floor % 5 === 0;
  const tier = Math.ceil(floor / 5);
  let tierName = "Salões Poeirentos";
  if (tier === 2) tierName = "Câmaras Sombrias";
  if (tier === 3) tierName = "Espirais Malditas";
  if (tier === 4) tierName = "Ápice Obscuro";
  
  const baseDifficulty = floor * 8;
  const difficulty = isBoss ? Math.floor(baseDifficulty * 1.8) : baseDifficulty;
  
  const baseMortality = floor * 2.5;
  const mortality = isBoss ? floor * 4 : baseMortality;
  
  return {
    floor,
    tierName,
    isBoss,
    difficulty,
    mortality,
    tier
  };
});
