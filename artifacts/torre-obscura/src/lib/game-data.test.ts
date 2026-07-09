import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  debitarArmazem, creditarArmazem,
  dificuldadeCamara, calcAfinidadeCamara, sortearRecompensaCamara,
  CAMARAS_SECRETAS,
  getMsPerDay, MS_PER_GAME_DAY_BASE, verificarRequisitoCamara, calcNpcPower, gerarNomeNpc,
  temporadaDeAndar, temporadaAtiva, andarMaxTemporada,
  avancarGuerra, getEfeitos,
  type CamaraSecreta, type NPC, type ProfissaoId, type GameState, type GuerraAtiva,
} from './game-data';

const armazem = (over: Partial<ReturnType<typeof base>> = {}) => ({ ...base(), ...over });
const base = () => ({ comida: 100, madeira: 50, pedra: 30, ferro: 10, capacidadeArmazem: 300 });

describe('selectors de temporada', () => {
  it('temporadaDeAndar mapeia andares em temporadas (20/andar)', () => {
    expect(temporadaDeAndar(1)).toBe(1);
    expect(temporadaDeAndar(20)).toBe(1);
    expect(temporadaDeAndar(21)).toBe(2);
    expect(temporadaDeAndar(40)).toBe(2);
    expect(temporadaDeAndar(100)).toBe(5);
  });
  it('temporadaAtiva + andarMaxTemporada seguem o desbloqueio de T2', () => {
    expect(temporadaAtiva(false)).toBe(1);
    expect(temporadaAtiva(true)).toBe(2);
    expect(andarMaxTemporada(false)).toBe(20);
    expect(andarMaxTemporada(true)).toBe(40);
  });
});

describe('getMsPerDay (duração real do dia de jogo)', () => {
  it('base é 2h e escala com a velocidade', () => {
    expect(MS_PER_GAME_DAY_BASE).toBe(2 * 60 * 60 * 1000);
    expect(getMsPerDay(1)).toBe(2 * 60 * 60 * 1000);
    expect(getMsPerDay(2)).toBe(60 * 60 * 1000);
    expect(getMsPerDay(5)).toBe(24 * 60 * 1000);
  });
});

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

// NPC completo p/ testes de requisito/poder (o mkNpc acima só tem stats).
const npcFull = (over: Partial<NPC>): NPC => ({
  id: Math.random().toString(36), nome: 'T',
  forca: 5, agilidade: 5, inteligencia: 5, resistencia: 5,
  sanidade: 80, lealdade: 80, fadiga: 0,
  vivo: true, obscuro: false, emExpedicao: false,
  raridade: 'Comum', habilidade: 'guardiao', posto: null, ...over,
});
const stateReq = (over: Partial<GameState>): GameState => ({
  npcs: [], farmsPorAndarEClasse: {}, totalMortesAndar: {}, habitantesEstado: {},
  recursos: { comida: 0, madeira: 0, pedra: 0, ferro: 0, capacidadeArmazem: 300 },
  ...over,
} as unknown as GameState);

describe('verificarRequisitoCamara — npc_raridade por tier', () => {
  it('Épico satisfaz requisito de "raro" (bug antigo omitia Raro)', () => {
    const s = stateReq({ npcs: [npcFull({ raridade: 'Épico' }), npcFull({ raridade: 'Épico' })] });
    expect(verificarRequisitoCamara(s, { tipo: 'npc_raridade', raridade: 'raro', quantidade: 2, textoRequisito: '' })).toBe(true);
  });
  it('conta Raro exato', () => {
    const s = stateReq({ npcs: [npcFull({ raridade: 'Raro' })] });
    expect(verificarRequisitoCamara(s, { tipo: 'npc_raridade', raridade: 'raro', quantidade: 2, textoRequisito: '' })).toBe(false);
  });
  it('Comum não satisfaz "raro"', () => {
    const s = stateReq({ npcs: [npcFull({ raridade: 'Comum' }), npcFull({ raridade: 'Comum' })] });
    expect(verificarRequisitoCamara(s, { tipo: 'npc_raridade', raridade: 'raro', quantidade: 1, textoRequisito: '' })).toBe(false);
  });
});

describe('verificarRequisitoCamara — combinado class_farms soma todas as classes', () => {
  it('soma farms de qualquer profissão (antes somava 0)', () => {
    const s = stateReq({ farmsPorAndarEClasse: { 5: { combatente: 5, batedor: 4 } } as GameState['farmsPorAndarEClasse'] });
    const req = { tipo: 'combinado' as const, conditions: [{ tipo: 'class_farms', value: 8 }, { tipo: 'mortes', value: 0 }], textoRequisito: '' };
    expect(verificarRequisitoCamara(s, req)).toBe(true);
  });
});

describe('calcNpcPower — sanidade influencia o poder', () => {
  it('sanidade baixa reduz o poder efetivo', () => {
    const forte = npcFull({ sanidade: 80 });
    const abalado = npcFull({ sanidade: 20 });
    expect(calcNpcPower(abalado)).toBeLessThan(calcNpcPower(forte));
    expect(calcNpcPower(abalado)).toBeCloseTo(calcNpcPower(forte) * 0.75, 5);
  });
});

describe('gerarNomeNpc (nobreza no nome)', () => {
  it('plebeus (Comum/Incomum) recebem só o primeiro nome, sem casa', () => {
    for (let i = 0; i < 30; i++) {
      expect(gerarNomeNpc('Comum').sobrenome).toBeUndefined();
      expect(gerarNomeNpc('Incomum').sobrenome).toBeUndefined();
    }
  });

  it('nobres (Raro+) recebem sobrenome/casa embutido no nome de exibição', () => {
    for (const r of ['Raro', 'Épico', 'Lendário', 'Divino'] as const) {
      const { nome, sobrenome } = gerarNomeNpc(r);
      expect(sobrenome).toBeTruthy();
      expect(nome).toContain(sobrenome!);
    }
  });
});

describe('getEfeitos — fatorNpc escala a contribuição do trabalhador', () => {
  it('fator 0.75 reduz a comida produzida pelo fazendeiro', () => {
    const fazendeiro = npcFull({ inteligencia: 10, posto: 'Fazenda' });
    const edificios = [{ tipo: 'Fazenda' as const, nivel: 1 }];
    const sem = getEfeitos(edificios, [fazendeiro]);
    const com = getEfeitos(edificios, [fazendeiro], () => 0.75);
    // Contribuição base do trabalhador: round(10 × 0.5 × mult).
    expect(com.comidaDia).toBeLessThan(sem.comidaDia);
    expect(sem.comidaDia - com.comidaDia).toBeGreaterThanOrEqual(1);
  });
  it('sem fatorNpc o comportamento é o de sempre (fator 1)', () => {
    const fazendeiro = npcFull({ inteligencia: 10, posto: 'Fazenda' });
    const edificios = [{ tipo: 'Fazenda' as const, nivel: 1 }];
    expect(getEfeitos(edificios, [fazendeiro], () => 1))
      .toEqual(getEfeitos(edificios, [fazendeiro]));
  });
});

// ─── Guerra ───────────────────────────────────────────────────────────────────

const mkGuerra = (over: Partial<GuerraAtiva>): GuerraAtiva => ({
  rival: {
    slug: 'rival', nome: 'Rival', dia: 1, andar: 5, populacao: 10,
    profissoes: { combatente: 3, batedor: 3, erudito: 2, sentinela: 2 },
    poderBase: 50, suprimento: 100,
    recursos: { comida: 100, madeira: 100, pedra: 100, ferro: 100 },
    postura: 'equilibrada',
  },
  rivalIntegridade: 1, rivalSuprimento: 100, tropaIds: [],
  duracao: 10, diasDecorridos: 0, diaInicio: 1, momento: 0,
  suprido: true, baixasJogador: 0, feridosJogador: 0, baixasRival: 0,
  ultimoRelato: '', ...over,
});

const stateGuerra = (npcs: NPC[], guerra: GuerraAtiva): GameState => ({
  npcs, guerra, edificios: [], moral: 70, dia: 5, guerrasHistorico: [],
  recursos: { comida: 100, madeira: 50, pedra: 30, ferro: 10, capacidadeArmazem: 300 },
} as unknown as GameState);

describe('avancarGuerra (mortos do dia + feitos de vitória)', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reporta os ids/nomes de quem tombou no front', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // força ferimento e morte
    const soldado = npcFull({ nome: 'Bren', emGuerra: true });
    const s = stateGuerra([soldado], mkGuerra({ tropaIds: [soldado.id] }));
    const r = avancarGuerra(s);
    expect(soldado.vivo).toBe(false);
    expect(r.mortos).toEqual([{ id: soldado.id, nome: 'Bren' }]);
    expect(r.vitoriaIds).toBeUndefined(); // tropa colapsou → derrota
    expect(s.guerra).toBeNull();
  });

  it('vitória devolve os ids da tropa sobrevivente', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // sem ferida/morte/desertor
    const soldado = npcFull({ nome: 'Bren', emGuerra: true });
    // Integridade rival quase zerada: o dano do dia encerra em vitória.
    const s = stateGuerra([soldado], mkGuerra({ tropaIds: [soldado.id], rivalIntegridade: 0.005 }));
    const r = avancarGuerra(s);
    expect(r.mortos).toEqual([]);
    expect(r.vitoriaIds).toEqual([soldado.id]);
    expect(s.guerrasHistorico[0].resultado).toBe('vitoria');
  });

  it('sem guerra em curso devolve resultado vazio', () => {
    const s = stateReq({ guerra: null } as Partial<GameState>);
    expect(avancarGuerra(s)).toEqual({ logs: [], mortos: [] });
  });
});

