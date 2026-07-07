import { GameState, generateNPC, HABITANTES, CODEX_FRAGMENTOS, CAPACIDADE_BASE } from './game-data';

/**
 * Cidadelas de teste pré-populadas para validar features durante desenvolvimento.
 * Use código na TitleScreen para carregar.
 */

export const TEST_CODES = {
  'TEST123': 'cidadela-teste-basica',
  'FULL': 'cidadela-teste-completa',
  'T2': 'cidadela-teste-t2',
} as const;

// Helper: preenche habitantesEstado para todos os Habitantes até maxFloor
function populateHabitanteEstado(maxFloor: number): Record<number, 'oculto' | 'descoberto' | 'quest_ativa' | 'aguardando_escolha' | 'concluido'> {
  const estado: Record<number, 'oculto' | 'descoberto' | 'quest_ativa' | 'aguardando_escolha' | 'concluido'> = {};
  // Popula todos os Habitantes que existem até maxFloor
  Object.entries(HABITANTES).forEach(([floorStr, _]) => {
    const floor = parseInt(floorStr);
    if (floor <= maxFloor) {
      estado[floor] = 'concluido'; // Todos os habitantes já foram descobertos e completados
    }
  });
  return estado;
}

function createTestSaveBasic(): GameState {
  return {
    dia: 1,
    moral: 75,
    diasSemComida: 0,
    velocidade: 1,
    andarAtual: 5,
    lastTimestamp: Date.now(),
    gameOver: false,
    vitoria: false,
    recursos: {
      comida: 200,
      madeira: 150,
      pedra: 120,
      ferro: 100,
      capacidadeArmazem: CAPACIDADE_BASE,
    },
    npcs: [
      generateNPC(),
      generateNPC(),
      generateNPC(),
      generateNPC(),
    ],
    edificios: [
      { tipo: 'Fogueira', nivel: 1 },
      { tipo: 'Fazenda', nivel: 2 },
      { tipo: 'Enfermaria', nivel: 1 },
      { tipo: 'Arquivo', nivel: 1 },
    ],
    log: [
      { id: '1', tipo: 'info', mensagem: '🧪 MODO DE TESTE ATIVADO — cidadela básica', dia: 1 },
      { id: '2', tipo: 'info', mensagem: '📋 Recursos: 200 comida, 150 madeira, 120 pedra, 100 ferro', dia: 1 },
      { id: '3', tipo: 'info', mensagem: '👥 4 NPCs recrutados (mistos de raridade)', dia: 1 },
      { id: '4', tipo: 'info', mensagem: '🏢 Edifícios básicos construídos (Fogueira L1, Fazenda L2, Enfermaria L1, Arquivo L1)', dia: 1 },
      { id: '5', tipo: 'info', mensagem: '📍 Andar 5 conquistado — teste câmaras secretas e expedições', dia: 1 },
    ],
    guerra: null,
    guerraPendente: null,
    guerrasHistorico: [],
    habitantesEstado: populateHabitanteEstado(5),
    habitantesDiaDescoberta: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
    habitantesQuestResetDia: {},
    ecos: [],
    ecosCapitulo: [],
    lores: [],
    codexFragmentos: [
      'hab_1', 'hab_2', 'hab_3', 'hab_4', 'hab_5',
      'sus_t1_1', 'sus_t1_2', 'sus_t1_3',
    ],
    codexNovoFragmento: false,
    habitantesEscolhaFeita: {},
    camarasSecretasEstado: {},
    farmsPorAndarEClasse: {},
    totalMortesAndar: {},
    reliquias: [
      'mensagem-selada',
      'palavras-fundador',
    ],
    metasDiarias: { data: '', objetivos: [], progresso: [], recompensaColetada: false },
  };
}

function createTestSaveCompleta(): GameState {
  return {
    dia: 45,
    moral: 95,
    diasSemComida: 0,
    velocidade: 1,
    andarAtual: 20,
    lastTimestamp: Date.now(),
    gameOver: false,
    vitoria: false,
    recursos: {
      comida: 1000,
      madeira: 800,
      pedra: 600,
      ferro: 400,
      capacidadeArmazem: CAPACIDADE_BASE + 500,
    },
    npcs: [
      generateNPC(),
      generateNPC(),
      generateNPC(),
      generateNPC(),
      generateNPC(),
      generateNPC(),
    ],
    edificios: [
      { tipo: 'Fogueira', nivel: 3 },
      { tipo: 'Fazenda', nivel: 3 },
      { tipo: 'Enfermaria', nivel: 3 },
      { tipo: 'Templo', nivel: 3 },
      { tipo: 'Quartel', nivel: 3 },
      { tipo: 'Armazem', nivel: 3 },
      { tipo: 'Alojamento', nivel: 3 },
      { tipo: 'Arquivo', nivel: 3 },
      { tipo: 'Mirante', nivel: 3 },
    ],
    log: [
      { id: '1', tipo: 'info', mensagem: '🧪 MODO DE TESTE COMPLETO ATIVADO', dia: 1 },
      { id: '2', tipo: 'info', mensagem: '⭐ Todos os edifícios em máximo nível (L3)', dia: 1 },
      { id: '3', tipo: 'info', mensagem: '👥 6 NPCs épicos/raros recrutados', dia: 1 },
      { id: '4', tipo: 'info', mensagem: '📍 Andares 1-20 conquistados', dia: 1 },
      { id: '5', tipo: 'info', mensagem: '📜 Todos os fragmentos de T1 desbloqueados', dia: 1 },
      { id: '6', tipo: 'info', mensagem: '💎 5 Relíquias coletadas', dia: 1 },
      { id: '7', tipo: 'info', mensagem: '🎯 Pronto para testar: câmaras, Codex, Arquivo↔Sussurro, tudo!', dia: 1 },
    ],
    guerra: null,
    guerraPendente: null,
    guerrasHistorico: [],
    habitantesEstado: populateHabitanteEstado(20),
    habitantesDiaDescoberta: Object.fromEntries(Array.from({ length: 20 }, (_, i) => [i + 1, 1])),
    habitantesQuestResetDia: {},
    ecos: [],
    ecosCapitulo: [],
    lores: [],
    codexFragmentos: Object.keys(CODEX_FRAGMENTOS)
      .filter(k => {
        const f = CODEX_FRAGMENTOS[k as keyof typeof CODEX_FRAGMENTOS];
        return f.temporada === 1;
      }),
    codexNovoFragmento: false,
    habitantesEscolhaFeita: {},
    camarasSecretasEstado: {},
    farmsPorAndarEClasse: {},
    totalMortesAndar: {},
    reliquias: [
      'mensagem-selada',
      'palavras-fundador',
      'pergunta-nao-respondida',
      'eco-memoria',
      'sussurro-antes-torre',
    ],
    metasDiarias: { data: '', objetivos: [], progresso: [], recompensaColetada: false },
  };
}

function createTestSaveT2(): GameState {
  return {
    dia: 60,
    moral: 95,
    diasSemComida: 0,
    velocidade: 1,
    andarAtual: 30,
    lastTimestamp: Date.now(),
    gameOver: false,
    vitoria: false,
    recursos: {
      comida: 2000,
      madeira: 1600,
      pedra: 1200,
      ferro: 800,
      capacidadeArmazem: CAPACIDADE_BASE + 800,
    },
    npcs: [
      generateNPC(),
      generateNPC(),
      generateNPC(),
      generateNPC(),
      generateNPC(),
      generateNPC(),
    ],
    edificios: [
      { tipo: 'Fogueira', nivel: 3 },
      { tipo: 'Fazenda', nivel: 3 },
      { tipo: 'Enfermaria', nivel: 3 },
      { tipo: 'Templo', nivel: 3 },
      { tipo: 'Quartel', nivel: 3 },
      { tipo: 'Armazem', nivel: 3 },
      { tipo: 'Alojamento', nivel: 3 },
      { tipo: 'Arquivo', nivel: 3 },
      { tipo: 'Mirante', nivel: 3 },
    ],
    log: [
      { id: '1', tipo: 'info', mensagem: '🧪 MODO T2 ATIVADO — cidadela de testes Temporada II', dia: 1 },
      { id: '2', tipo: 'info', mensagem: '⭐ Todos os edifícios em L3', dia: 1 },
      { id: '3', tipo: 'info', mensagem: '📍 Andares 1-30 conquistados (T1 + início T2)', dia: 1 },
      { id: '4', tipo: 'info', mensagem: '📜 Fragmentos de T1 + T2 capítulos 5-7 desbloqueados', dia: 1 },
      { id: '5', tipo: 'info', mensagem: '💎 7 Relíquias incluindo novos de T2', dia: 1 },
      { id: '6', tipo: 'info', mensagem: '🎯 Perfeito para testar: Codex T2, câmaras de andares 21-30, progressão', dia: 1 },
    ],
    guerra: null,
    guerraPendente: null,
    guerrasHistorico: [],
    habitantesEstado: populateHabitanteEstado(30),
    habitantesDiaDescoberta: Object.fromEntries(Array.from({ length: 30 }, (_, i) => [i + 1, 1])),
    habitantesQuestResetDia: {},
    ecos: [],
    ecosCapitulo: [],
    lores: [],
    codexFragmentos: Object.keys(CODEX_FRAGMENTOS)
      .filter(k => {
        const f = CODEX_FRAGMENTOS[k as keyof typeof CODEX_FRAGMENTOS];
        return f.temporada <= 2;
      }),
    codexNovoFragmento: false,
    habitantesEscolhaFeita: {},
    camarasSecretasEstado: {},
    farmsPorAndarEClasse: {},
    totalMortesAndar: {},
    reliquias: [
      'mensagem-selada',
      'palavras-fundador',
      'pergunta-nao-respondida',
      'eco-memoria',
      'sussurro-antes-torre',
      'marca-intervalo',
      'luz-entre-fragmentos',
    ],
    metasDiarias: { data: '', objetivos: [], progresso: [], recompensaColetada: false },
  };
}

export function getTestSave(code: string): GameState | null {
  const saveType = TEST_CODES[code as keyof typeof TEST_CODES];

  if (!saveType) return null;

  switch (saveType) {
    case 'cidadela-teste-basica':
      return createTestSaveBasic();
    case 'cidadela-teste-completa':
      return createTestSaveCompleta();
    case 'cidadela-teste-t2':
      return createTestSaveT2();
    default:
      return null;
  }
}

export function isValidTestCode(code: string): boolean {
  return code in TEST_CODES;
}
