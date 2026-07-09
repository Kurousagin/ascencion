import { describe, it, expect } from 'vitest';
import type { GameState } from '../lib/game-data';
import { mulberry32, rngPara } from './rng';
import { camarasDaTorre, gerarCamarasDoAndar } from './generate';

const stateComSeed = (seed: number) => ({ camaraSeed: seed } as Pick<GameState, 'camaraSeed'>);

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
