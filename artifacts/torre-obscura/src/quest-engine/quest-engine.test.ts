import { describe, it, expect } from 'vitest';
import type { GameState, QuestOculta } from '../lib/game-data';
import { verificarQuestOculta, gerarObjetivosDoDia, gerarQuestOculta } from './rules';

const st = (over: Partial<GameState>): GameState => ({
  dia: 10, moral: 50, npcs: [],
  recursos: { comida: 0, madeira: 0, pedra: 0, ferro: 0, capacidadeArmazem: 300 },
  questsOcultas: [],
  ...over,
} as unknown as GameState);
const quest = (req: any, dia = 1): QuestOculta => ({ req, dia } as unknown as QuestOculta);

describe('verificarQuestOculta (regra pura movida ao motor)', () => {
  it('recurso: satisfaz quando o estoque alcança a meta', () => {
    expect(verificarQuestOculta(quest({ tipo: 'recurso', recurso: 'comida', qtd: 50 }), st({ recursos: { comida: 50, madeira: 0, pedra: 0, ferro: 0, capacidadeArmazem: 300 } }))).toBe(true);
    expect(verificarQuestOculta(quest({ tipo: 'recurso', recurso: 'comida', qtd: 50 }), st({ recursos: { comida: 49, madeira: 0, pedra: 0, ferro: 0, capacidadeArmazem: 300 } }))).toBe(false);
  });
  it('moral e temporal', () => {
    expect(verificarQuestOculta(quest({ tipo: 'moral', moral: 60 }), st({ moral: 60 }))).toBe(true);
    expect(verificarQuestOculta(quest({ tipo: 'temporal', dias: 5 }, 3), st({ dia: 10 }))).toBe(true);  // 10-3 >= 5
    expect(verificarQuestOculta(quest({ tipo: 'temporal', dias: 5 }, 7), st({ dia: 10 }))).toBe(false); // 10-7 < 5
  });
});

describe('gerarObjetivosDoDia', () => {
  it('sem aliada → exatamente as 3 metas base', () => {
    expect(gerarObjetivosDoDia(false)).toEqual(['explorar', 'construir', 'lore']);
  });
  it('com aliada → 3 metas de um pool que inclui aliar', () => {
    const objs = gerarObjetivosDoDia(true);
    expect(objs.length).toBe(3);
    expect(objs.every(o => ['explorar', 'construir', 'lore', 'aliar'].includes(o))).toBe(true);
  });
});

describe('gerarQuestOculta (limites)', () => {
  it('não gera quando já há 3 quests ativas', () => {
    const ativas = [1, 2, 3].map(i => ({ estado: 'ativa', gatilho: 'x' + i, titulo: 't' + i } as unknown as QuestOculta));
    expect(gerarQuestOculta('exploracao', 5, st({ questsOcultas: ativas }))).toBeNull();
  });
  it('não gera duas do mesmo gatilho', () => {
    const ativas = [{ estado: 'ativa', gatilho: 'exploracao', titulo: 't' } as unknown as QuestOculta];
    expect(gerarQuestOculta('exploracao', 5, st({ questsOcultas: ativas }))).toBeNull();
  });
});
