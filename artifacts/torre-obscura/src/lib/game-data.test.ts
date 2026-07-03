import { describe, it, expect } from 'vitest';
import { debitarArmazem, creditarArmazem } from './game-data';

const armazem = (over: Partial<ReturnType<typeof base>> = {}) => ({ ...base(), ...over });
const base = () => ({ comida: 100, madeira: 50, pedra: 30, ferro: 10, capacidadeArmazem: 300 });

describe('debitarArmazem (reserva de envio à aliada)', () => {
  it('debita o valor exato quando há saldo', () => {
    const r = debitarArmazem(armazem(), { comida: 40, madeira: 10, pedra: 0, ferro: 5 });
    expect(r).not.toBeNull();
    expect(r).toMatchObject({ comida: 60, madeira: 40, pedra: 30, ferro: 5, capacidadeArmazem: 300 });
  });

  it('retorna null sem debitar quando falta saldo em qualquer recurso', () => {
    const r = debitarArmazem(armazem(), { comida: 0, madeira: 0, pedra: 0, ferro: 999 });
    expect(r).toBeNull();
  });

  it('CASO DE CORRIDA: se o loop de dias reduziu os recursos abaixo do pedido entre a validação e o commit, o débito é rejeitado por inteiro (nunca parcial)', () => {
    // Usuária pediu 40 de madeira quando tinha 50; um tick de dia consumiu madeira
    // e agora o estado atual (o `prev` do updater) só tem 30. A reserva DEVE falhar
    // por completo — não pode debitar 30 e deixar o servidor entregar os 40.
    const aposTick = armazem({ madeira: 30 });
    const r = debitarArmazem(aposTick, { comida: 0, madeira: 40, pedra: 0, ferro: 0 });
    expect(r).toBeNull();
  });

  it('permite debitar até o saldo exato (limite)', () => {
    const r = debitarArmazem(armazem({ madeira: 40 }), { comida: 0, madeira: 40, pedra: 0, ferro: 0 });
    expect(r).not.toBeNull();
    expect(r!.madeira).toBe(0);
  });
});

describe('creditarArmazem (recebimento / estorno)', () => {
  it('credita respeitando o saldo sem perda quando cabe', () => {
    const { recursos, perdeu } = creditarArmazem(armazem(), { comida: 50, madeira: 0, pedra: 0, ferro: 0 });
    expect(perdeu).toBe(false);
    expect(recursos.comida).toBe(150);
  });

  it('limita à capacidade e sinaliza perda por transbordo', () => {
    const { recursos, perdeu } = creditarArmazem(armazem({ comida: 290, capacidadeArmazem: 300 }), { comida: 50, madeira: 0, pedra: 0, ferro: 0 });
    expect(perdeu).toBe(true);
    expect(recursos.comida).toBe(300);
  });
});
