import { describe, it, expect } from 'vitest';
import {
  debitarArmazem, creditarArmazem,
  dificuldadeCamara, calcAfinidadeCamara, sortearRecompensaCamara,
  idFragmentoCamara, CODEX_FRAGMENTOS, CAMARAS_SECRETAS,
  type CamaraSecreta, type NPC, type ProfissaoId,
} from './game-data';

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

// ─── Câmaras secretas ─────────────────────────────────────────────────────────

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

describe('dificuldadeCamara (escala ao andar)', () => {
  it('usa 1.25× a dificuldade do andar por padrão', () => {
    expect(dificuldadeCamara(mkCamara({ floor: 20 }))).toBe(Math.round(230 * 1.25)); // 288
    expect(dificuldadeCamara(mkCamara({ floor: 5 }))).toBe(Math.round(42 * 1.25));    // 53
  });

  it('respeita multiplicadorDificuldade quando definido', () => {
    expect(dificuldadeCamara(mkCamara({ floor: 20, multiplicadorDificuldade: 1.5 }))).toBe(Math.round(230 * 1.5)); // 345
  });

  it('é muito maior que o campo legado para andares altos', () => {
    const cam = mkCamara({ floor: 20, dificuldade: 18 });
    expect(dificuldadeCamara(cam)).toBeGreaterThan(cam.dificuldade * 10);
  });

  it('câmaras curadas pela lore são mais duras que o padrão do andar', () => {
    const curadas: Record<string, number> = {
      'Câmara da Primeira Verdade': Math.round(230 * 1.6),   // 368
      'Câmara da Entidade Dormida': Math.round(230 * 1.5),   // 345
      'Câmara da Pergunta Sem Resposta': Math.round(155 * 1.5), // 233
      'Câmara do Limiar': Math.round(42 * 1.35),             // 57
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
  const camBatedor = mkCamara({ requisito: { tipo: 'class_farms', profissao: 'batedor', minFarmsComClasse: 8, textoRequisito: '' } });

  it('bonifica grupo majoritariamente temático (+30%)', () => {
    expect(calcAfinidadeCamara([mkNpc('batedor'), mkNpc('batedor'), mkNpc('combatente')], camBatedor)).toBe(1.30);
  });

  it('penaliza grupo destoante (−20%)', () => {
    expect(calcAfinidadeCamara([mkNpc('combatente'), mkNpc('erudito')], camBatedor)).toBe(0.80);
  });

  it('é neutro quando o requisito não tem profissão temática', () => {
    expect(calcAfinidadeCamara([mkNpc('combatente')], mkCamara({}))).toBe(1.0);
  });
});

describe('sortearRecompensaCamara (bônus por desempenho)', () => {
  // rng estável a partir de uma sequência de valores.
  const seq = (vals: number[]) => { let i = 0; return () => vals[i++ % vals.length]; };

  it('não concede bônus quando o rol de chance falha', () => {
    expect(sortearRecompensaCamara(0, seq([0.99]))).toEqual({ tipo: 'nenhum' });
    expect(sortearRecompensaCamara(1, seq([0.99]))).toEqual({ tipo: 'nenhum' });
  });

  it('sorteia recursos extras no primeiro balde', () => {
    expect(sortearRecompensaCamara(0, seq([0, 0]))).toEqual({ tipo: 'recursos_extra', multiplicador: 1 });
  });

  it('desempenho alto libera buff permanente de +2', () => {
    expect(sortearRecompensaCamara(1, seq([0, 0.6]))).toEqual({ tipo: 'buff_permanente', incremento: 2 });
  });
});

describe('páginas de câmara no Codex', () => {
  it('gera um fragmento cam_<id> para cada câmara com loreGanho', () => {
    Object.entries(CAMARAS_SECRETAS).forEach(([key, cam]) => {
      if (!cam.resultado.loreGanho) return;
      const frag = CODEX_FRAGMENTOS[idFragmentoCamara(key)];
      expect(frag).toBeDefined();
      expect(frag.tipo).toBe('camara');
      expect(frag.titulo).toBe(cam.resultado.loreGanho.titulo);
      expect(frag.capitulo).toBe(Math.ceil(cam.floor / 5));
    });
  });
});
