import { describe, it, expect } from 'vitest';
import { climaDoDia } from './clima';

describe('climaDoDia', () => {
  it('é determinístico: mesma seed e dia → mesmo clima', () => {
    const a = climaDoDia(12345, 7);
    const b = climaDoDia(12345, 7);
    expect(a).toEqual(b);
  });

  it('dias diferentes produzem sequências diferentes (ao longo de 30 dias)', () => {
    const assinaturas = new Set<string>();
    for (let dia = 1; dia <= 30; dia++) {
      const c = climaDoDia(999, dia);
      assinaturas.add(Object.values(c).map(x => x.estado).join(','));
    }
    expect(assinaturas.size).toBeGreaterThan(1);
  });

  it('multiplicadores casam com o estado', () => {
    for (let dia = 1; dia <= 50; dia++) {
      for (const c of Object.values(climaDoDia(42, dia))) {
        const esperado = c.estado === 'favoravel' ? 1.1 : c.estado === 'adverso' ? 0.9 : 1.0;
        expect(c.multLoot).toBe(esperado);
        expect(c.nome.length).toBeGreaterThan(0);
      }
    }
  });
});
