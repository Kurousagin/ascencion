import { describe, it, expect } from 'vitest';
import { CAMARAS_SECRETAS, type GameState, type NPC, type ProfissaoId, type CamaraSecreta } from '../lib/game-data';
import { mulberry32, rngPara } from './rng';
import { camarasDaTorre, gerarCamarasDoAndar, ecossistemaDoAndar } from './generate';
import { dificuldadeCamara, calcAfinidadeCamara, verificarRequisitoCamara, chanceAbrirCamara } from './rules';

const stateComSeed = (seed: number) => ({ camaraSeed: seed } as Pick<GameState, 'camaraSeed'>);

// ─── Helpers (grupo/estado) ───────────────────────────────────────────────────
// Só os 4 stats importam para getProfissao/afinidade; o resto é casteado.
const mkNpc = (prof: ProfissaoId): NPC => {
  const stats = { forca: 1, agilidade: 1, inteligencia: 1, resistencia: 1 };
  const key = prof === 'combatente' ? 'forca' : prof === 'batedor' ? 'agilidade' : prof === 'erudito' ? 'inteligencia' : 'resistencia';
  stats[key] = 10;
  return stats as unknown as NPC;
};
const mkCamara = (over: Partial<CamaraSecreta>): CamaraSecreta => ({
  floor: 20, titulo: 't', icone: '?', descricao: 'd',
  requisito: { tipo: 'mortes_andar', minMortes: 1, textoRequisito: '' },
  tipo: 'benéfica', dificuldade: 18, custo: 20, maxTentativas: 3, chancePerTentativa: 0.4,
  resultado: { sucessoTexto: 's', falhaTexto: 'f' },
  ...over,
});
const npcFull = (over: Partial<NPC>): NPC => ({
  id: Math.random().toString(36), nome: 'T',
  forca: 5, agilidade: 5, inteligencia: 5, resistencia: 5,
  sanidade: 80, lealdade: 80, fadiga: 0,
  vivo: true, obscuro: false, emExpedicao: false,
  raridade: 'Comum', habilidade: 'guardiao', posto: null, ...over,
} as unknown as NPC);
const stateReq = (over: Partial<GameState>): GameState => ({
  npcs: [], farmsPorAndarEClasse: {}, farmsPerFloor: {}, totalMortesAndar: {},
  habitantesEstado: {}, codexFragmentos: [],
  recursos: { comida: 0, madeira: 0, pedra: 0, ferro: 0, capacidadeArmazem: 300 },
  ...over,
} as unknown as GameState);

describe('rng (mulberry32)', () => {
  it('é determinístico: mesma seed → mesma sequência', () => {
    const a = mulberry32(123); const b = mulberry32(123);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('seeds diferentes → sequências diferentes', () => {
    const a = mulberry32(1); const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });
  it('rngPara isola canais (andares)', () => {
    expect(rngPara(99, 1)()).not.toBe(rngPara(99, 2)());
  });
});

describe('gerarCamarasDoAndar', () => {
  it('mesma seed+andar → câmaras idênticas', () => {
    expect(gerarCamarasDoAndar(3, 777)).toEqual(gerarCamarasDoAndar(3, 777));
  });
  it('gera câmaras válidas (id, floor, requisito, dificuldade escalável)', () => {
    const cams = Object.values(gerarCamarasDoAndar(5, 42));
    expect(cams.length).toBeGreaterThanOrEqual(1);
    for (const c of cams) {
      expect(c.floor).toBe(5);
      expect(c.requisito.textoRequisito.length).toBeGreaterThan(0);
      expect(c.multiplicadorDificuldade).toBeGreaterThanOrEqual(1.25);
      expect(c.custo).toBeGreaterThan(0);
    }
  });
});

describe('camarasDaTorre', () => {
  it('mesma seed → mesma torre; seeds diferentes → torres diferentes', () => {
    const t1 = camarasDaTorre(stateComSeed(1000));
    const t1b = camarasDaTorre(stateComSeed(1000));
    const t2 = camarasDaTorre(stateComSeed(2000));
    // memoização devolve a mesma referência p/ a mesma seed
    expect(t1).toBe(t1b);
    // conteúdo difere entre seeds (títulos/requisitos por andar)
    const chave = (t: Record<string, { titulo: string; requisito: { textoRequisito: string } }>) =>
      Object.entries(t).map(([id, c]) => `${id}:${c.titulo}:${c.requisito.textoRequisito}`).join('|');
    expect(chave(t1)).not.toBe(chave(t2));
  });
  it('cobre andares de T1 e T2 (1–40)', () => {
    const torre = camarasDaTorre(stateComSeed(555));
    const andares = new Set(Object.values(torre).map(c => c.floor));
    expect(Math.max(...andares)).toBeGreaterThan(20); // chega em T2
    expect(Math.min(...andares)).toBe(1);
  });
  it('seed ausente → torre vazia', () => {
    expect(camarasDaTorre({ camaraSeed: undefined })).toEqual({});
  });
});

describe('ecossistemaDoAndar (FloorEcosystem)', () => {
  it('agrupa as câmaras do andar e projeta activeClues do estado (ids estáveis)', () => {
    const chambers = gerarCamarasDoAndar(3, 4242);
    const anyId = Object.keys(chambers)[0];
    const eco = ecossistemaDoAndar(
      { camaraSeed: 4242, camarasSecretasEstado: { [anyId]: { descoberta: true, tentativas: 0, encontrada: false } } },
      3,
    );
    expect(eco.floor).toBe(3);
    expect(Object.keys(eco.chambers)).toEqual(Object.keys(chambers));
    expect(eco.activeClues).toContain(anyId);          // pista revelada aparece
  });
  it('orphan-safe: câmara já encontrada não fica em activeClues', () => {
    const chambers = gerarCamarasDoAndar(3, 4242);
    const anyId = Object.keys(chambers)[0];
    const eco = ecossistemaDoAndar(
      { camaraSeed: 4242, camarasSecretasEstado: { [anyId]: { descoberta: true, tentativas: 1, encontrada: true } } },
      3,
    );
    expect(eco.activeClues).not.toContain(anyId);
  });
});

describe('dificuldadeCamara (escala ao andar)', () => {
  it('usa 1.5× a dificuldade do andar por padrão', () => {
    expect(dificuldadeCamara(mkCamara({ floor: 20 }))).toBe(Math.round(230 * 1.5)); // 345
    expect(dificuldadeCamara(mkCamara({ floor: 5 }))).toBe(Math.round(42 * 1.5));    // 63
  });
  it('respeita multiplicadorDificuldade quando definido', () => {
    expect(dificuldadeCamara(mkCamara({ floor: 20, multiplicadorDificuldade: 1.6 }))).toBe(Math.round(230 * 1.6)); // 368
  });
  it('câmaras curadas pela lore mantêm seus multiplicadores próprios', () => {
    const curadas: Record<string, number> = {
      'Câmara da Primeira Verdade': Math.round(230 * 1.6),
      'Câmara da Entidade Dormida': Math.round(230 * 1.5),
      'Câmara do Limiar': Math.round(42 * 1.35),
    };
    Object.values(CAMARAS_SECRETAS).forEach(cam => {
      const esperado = curadas[cam.titulo];
      if (esperado === undefined) return;
      expect(cam.multiplicadorDificuldade).toBeDefined();
      expect(dificuldadeCamara(cam)).toBe(esperado);
    });
  });
});

describe('calcAfinidadeCamara (grupo temático)', () => {
  it('bonifica grupo temático (+30%) tanto em class_farms quanto em classe_desenvolvida', () => {
    const camLegado = mkCamara({ requisito: { tipo: 'class_farms', profissao: 'batedor', minFarmsComClasse: 8, textoRequisito: '' } });
    const camNovo = mkCamara({ requisito: { tipo: 'classe_desenvolvida', profissao: 'batedor', minStat: 20, quantidade: 2, textoRequisito: '' } });
    expect(calcAfinidadeCamara([mkNpc('batedor'), mkNpc('batedor'), mkNpc('combatente')], camLegado)).toBe(1.30);
    expect(calcAfinidadeCamara([mkNpc('batedor'), mkNpc('batedor'), mkNpc('combatente')], camNovo)).toBe(1.30);
  });
  it('penaliza grupo destoante (−20%)', () => {
    const cam = mkCamara({ requisito: { tipo: 'classe_desenvolvida', profissao: 'batedor', minStat: 20, quantidade: 2, textoRequisito: '' } });
    expect(calcAfinidadeCamara([mkNpc('combatente'), mkNpc('erudito')], cam)).toBe(0.80);
  });
  it('é neutro quando o requisito não tem profissão temática', () => {
    expect(calcAfinidadeCamara([mkNpc('combatente')], mkCamara({}))).toBe(1.0);
  });
});

describe('verificarRequisitoCamara — stat gating estrito', () => {
  it('npc_atributo_alto exige K moradores com o stat ≥ limiar', () => {
    const req = { tipo: 'npc_atributo_alto' as const, stat: 'forca' as const, minValor: 15, quantidade: 2, textoRequisito: '' };
    expect(verificarRequisitoCamara(stateReq({ npcs: [npcFull({ forca: 15 }), npcFull({ forca: 16 })] }), req)).toBe(true);
    expect(verificarRequisitoCamara(stateReq({ npcs: [npcFull({ forca: 15 }), npcFull({ forca: 10 })] }), req)).toBe(false);
    // Early Game: stats baixos não alcançam o limiar.
    expect(verificarRequisitoCamara(stateReq({ npcs: [npcFull({ forca: 8 }), npcFull({ forca: 9 })] }), req)).toBe(false);
  });
  it('classe_desenvolvida exige a CLASSE com o stat da classe ≥ limiar', () => {
    const req = { tipo: 'classe_desenvolvida' as const, profissao: 'combatente' as const, minStat: 18, quantidade: 1, textoRequisito: '' };
    // combatente (forca dominante) e forte o bastante → conta
    expect(verificarRequisitoCamara(stateReq({ npcs: [npcFull({ forca: 20, agilidade: 5, inteligencia: 5, resistencia: 5 })] }), req)).toBe(true);
    // forca alta mas classe é erudito (int dominante) → não conta como combatente
    expect(verificarRequisitoCamara(stateReq({ npcs: [npcFull({ forca: 18, inteligencia: 25 })] }), req)).toBe(false);
  });
  it('sussurros_capitulo conta fragmentos sussurro desbloqueados do capítulo', () => {
    const req = { tipo: 'sussurros_capitulo' as const, capitulo: 1, quantidade: 2, textoRequisito: '' };
    expect(verificarRequisitoCamara(stateReq({ codexFragmentos: ['sus_t1_0', 'sus_t1_1'] }), req)).toBe(true);
    expect(verificarRequisitoCamara(stateReq({ codexFragmentos: ['sus_t1_0'] }), req)).toBe(false);
    // fragmentos de outro capítulo não contam
    expect(verificarRequisitoCamara(stateReq({ codexFragmentos: ['sus_t2_0', 'sus_t2_1'] }), req)).toBe(false);
  });
  it('farms_andar (fallback) usa farmsPerFloor', () => {
    const req = { tipo: 'farms_andar' as const, floor: 7, minFarms: 6, textoRequisito: '' };
    expect(verificarRequisitoCamara(stateReq({ farmsPerFloor: { 7: 6 } }), req)).toBe(true);
    expect(verificarRequisitoCamara(stateReq({ farmsPerFloor: { 7: 3 } }), req)).toBe(false);
  });
  it('npc_raridade (legado) conta por tier — Épico satisfaz "raro"', () => {
    const s = stateReq({ npcs: [npcFull({ raridade: 'Épico' }), npcFull({ raridade: 'Épico' })] });
    expect(verificarRequisitoCamara(s, { tipo: 'npc_raridade', raridade: 'raro', quantidade: 2, textoRequisito: '' })).toBe(true);
  });
});

describe('chanceAbrirCamara (rolagem: nunca 0/100%, cresce com over-level)', () => {
  const camFraca = mkCamara({ floor: 1, multiplicadorDificuldade: 1.5 });   // dificuldade baixa
  const camDura = mkCamara({ floor: 40, multiplicadorDificuldade: 1.5 });   // dificuldade altíssima
  const fortes = () => Array.from({ length: 6 }, () => npcFull({ forca: 30, agilidade: 30, inteligencia: 30, resistencia: 30 }));
  const fraco = () => [npcFull({ forca: 3, agilidade: 3, inteligencia: 3, resistencia: 3 })];

  it('piso 5% mesmo com grupo muito fraco vs câmara dura', () => {
    expect(chanceAbrirCamara(camDura, fraco()).chance).toBeCloseTo(0.05, 5);
  });
  it('teto 90% mesmo com grupo muito forte vs câmara fraca', () => {
    expect(chanceAbrirCamara(camFraca, fortes()).chance).toBeCloseTo(0.90, 5);
  });
  it('é monotônica: mais poder → chance ≥', () => {
    const menos = chanceAbrirCamara(camDura, fraco()).chance;
    const mais = chanceAbrirCamara(camDura, fortes()).chance;
    expect(mais).toBeGreaterThanOrEqual(menos);
    // nunca 0 nem 1
    expect(menos).toBeGreaterThan(0);
    expect(mais).toBeLessThan(1);
  });
});
