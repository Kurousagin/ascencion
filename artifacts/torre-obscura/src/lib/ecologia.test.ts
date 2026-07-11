import { describe, it, expect } from 'vitest';
import { folegoEfetivo, nivelFolego, multFolego, multCadeia, usarFolego } from './folego';
import { estacaoDoDia, multEstacao } from './estacao';
import { eventoDoDia, multEventoParaAndar, multCustoEvento, eventoVisivel } from './eventos-andar';
import type { GameState } from './game-data';

describe('fôlego dos andares', () => {
  it('sem uso, o andar está pleno (mult 1.0)', () => {
    const s = { dia: 10, fadigaAndar: {}, andarAtual: 10 };
    expect(nivelFolego(s, 3)).toBe('pleno');
    expect(multFolego(s, 3)).toBe(1.0);
  });

  it('acumula usos até cansado (85%) e exausto (70%)', () => {
    const s = { dia: 10, fadigaAndar: {}, andarAtual: 10 } as unknown as GameState;
    for (let i = 0; i < 3; i++) usarFolego(s, 3);
    expect(nivelFolego(s, 3)).toBe('cansado');
    expect(multFolego(s, 3)).toBe(0.85);
    for (let i = 0; i < 2; i++) usarFolego(s, 3);
    expect(nivelFolego(s, 3)).toBe('exausto');
    expect(multFolego(s, 3)).toBe(0.7);
  });

  it('regenera com os dias (0.5/dia) sem processDay', () => {
    const s = { dia: 10, fadigaAndar: { 3: { usos: 5, dia: 10 } }, andarAtual: 10 };
    expect(nivelFolego(s, 3)).toBe('exausto');
    expect(folegoEfetivo({ ...s, dia: 14 }, 3)).toBe(3);       // 5 − 0.5×4
    expect(nivelFolego({ ...s, dia: 14 }, 3)).toBe('cansado');
    expect(nivelFolego({ ...s, dia: 20 }, 3)).toBe('pleno');
  });

  it('cadeia: irmão de bioma exausto dá +10% aos demais conquistados', () => {
    // Andares 1 e 3 são floresta; exaurir o 1 beneficia o 3 (não o próprio 1)
    const s = { dia: 10, fadigaAndar: { 1: { usos: 6, dia: 10 } }, andarAtual: 10 };
    expect(multCadeia(s, 3, 'floresta')).toBe(1.10);
    expect(multCadeia(s, 1, 'floresta')).toBe(1.0);
    expect(multCadeia(s, 2, 'caverna')).toBe(1.0);
  });
});

describe('estações da Torre', () => {
  it('ciclo de 30 dias: 1–15 inspira, 16–30 expira, 31 reinicia', () => {
    expect(estacaoDoDia(1).id).toBe('inspira');
    expect(estacaoDoDia(15).id).toBe('inspira');
    expect(estacaoDoDia(16).id).toBe('expira');
    expect(estacaoDoDia(30).id).toBe('expira');
    expect(estacaoDoDia(31).id).toBe('inspira');
    expect(estacaoDoDia(1).diaNoCiclo).toBe(1);
    expect(estacaoDoDia(16).diaNoCiclo).toBe(1);
  });

  it('inspira favorece profundezas; expira favorece superfície; fortaleza neutra', () => {
    const inspira = estacaoDoDia(5);
    expect(multEstacao(inspira, 'caverna')).toBe(1.08);
    expect(multEstacao(inspira, 'floresta')).toBe(0.92);
    expect(multEstacao(inspira, 'fortaleza')).toBe(1.0);
    const expira = estacaoDoDia(20);
    expect(multEstacao(expira, 'floresta')).toBe(1.08);
    expect(multEstacao(expira, 'abismo')).toBe(0.92);
    expect(multEstacao(expira, 'fortaleza')).toBe(1.0);
  });
});

describe('eventos de andar', () => {
  it('é determinístico e ocorre em ~25% dos dias', () => {
    let comEvento = 0;
    for (let dia = 1; dia <= 200; dia++) {
      const a = eventoDoDia(777, dia);
      const b = eventoDoDia(777, dia);
      expect(a).toEqual(b);
      if (a) comEvento++;
    }
    expect(comEvento).toBeGreaterThan(20);
    expect(comEvento).toBeLessThan(90);
  });

  it('migração: origem −15%, destino +15%; textos interpolados', () => {
    for (let dia = 1; dia <= 300; dia++) {
      const ev = eventoDoDia(42, dia);
      if (ev?.tipo === 'migracao') {
        expect(multEventoParaAndar(ev, ev.origem!)).toBe(0.85);
        expect(multEventoParaAndar(ev, ev.destino!)).toBe(1.15);
        expect(ev.origem).not.toBe(ev.destino);
        expect(ev.texto).not.toContain('{');
        return;
      }
    }
    throw new Error('nenhuma migração em 300 dias — improvável');
  });

  it('escadas erradias barateiam a expedição; visibilidade respeita o progresso', () => {
    for (let dia = 1; dia <= 300; dia++) {
      const ev = eventoDoDia(99, dia);
      if (ev?.tipo === 'escadas') {
        expect(multCustoEvento(ev)).toBe(0.75);
        expect(eventoVisivel(ev, 1)).toBe(true);
      }
      if (ev?.tipo === 'eco_errante' && (ev.andar ?? 0) > 5) {
        expect(eventoVisivel(ev, 5)).toBe(false);
      }
    }
    expect(multCustoEvento(null)).toBe(1.0);
  });
});
