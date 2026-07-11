import { describe, it, expect } from 'vitest';
import { descricaoVivaDoAndar } from './lugar';
import { DESCRICOES_ANDAR_LORE } from './lore-content';

// Andar 1 = Mata Cinzenta (floresta)
const base = { dia: 30, farmsPerFloor: {}, andarConquistadoDia: {}, memoriais: {} };

describe('descricaoVivaDoAndar', () => {
  it('recém-conquistado (≤5 dias) usa a frase "recente"', () => {
    const s = { ...base, andarConquistadoDia: { 1: 27 } };
    expect(descricaoVivaDoAndar(s, 1)).toContain(DESCRICOES_ANDAR_LORE.floresta.recente);
  });

  it('sem explorações e conquista antiga usa "quieto"; com 1–4 usa "visitado"; com 5+ usa "batido"', () => {
    const antigo = { ...base, andarConquistadoDia: { 1: 2 } };
    expect(descricaoVivaDoAndar(antigo, 1)).toContain(DESCRICOES_ANDAR_LORE.floresta.quieto);
    expect(descricaoVivaDoAndar({ ...antigo, farmsPerFloor: { 1: 2 } }, 1)).toContain(DESCRICOES_ANDAR_LORE.floresta.visitado);
    expect(descricaoVivaDoAndar({ ...antigo, farmsPerFloor: { 1: 7 } }, 1)).toContain(DESCRICOES_ANDAR_LORE.floresta.batido);
  });

  it('quando alguém caiu no andar, o lugar lembra o último pelo nome', () => {
    const s = { ...base, andarConquistadoDia: { 1: 2 }, memoriais: { 1: [{ nome: 'Soren', dia: 10 }, { nome: 'Irae', dia: 20 }] } };
    const d = descricaoVivaDoAndar(s, 1);
    expect(d).toContain('Irae');
    expect(d).not.toContain('{nome}');
  });

  it('todos os biomas têm textos completos para todos os estados', () => {
    for (const t of Object.values(DESCRICOES_ANDAR_LORE)) {
      for (const chave of ['recente', 'quieto', 'visitado', 'batido', 'memoria'] as const) {
        expect(t[chave].length).toBeGreaterThan(10);
      }
    }
  });
});
