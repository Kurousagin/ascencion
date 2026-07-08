import { describe, it, expect } from 'vitest';
import type { GameState, NPC } from '../lib/game-data';
import type { CtxVida, CondicoesColonia } from './tick';
import { parKey, getAfinidade, ajustarAfinidade, vinculosDe } from './relationships';
import { sistemaDecaimento } from './systems/decaimento';
import { sistemaTraicao } from './systems/traicao';
import { sistemaConvivio } from './systems/convivio';
import { aplicarLuto } from './grief';
import { promoverParaNobre } from './houses';
import { humorDe } from './mood';

let idc = 0;
const mkNpc = (over: Partial<NPC> = {}): NPC => ({
  id: `n${++idc}`, nome: 'Teste',
  forca: 5, agilidade: 5, inteligencia: 5, resistencia: 5,
  sanidade: 80, lealdade: 80, fadiga: 20,
  vivo: true, obscuro: false, emExpedicao: false,
  raridade: 'Comum', habilidade: 'guardiao', posto: null,
  ...over,
});

const mkState = (npcs: NPC[], over: Partial<GameState> = {}): GameState => ({
  npcs,
  relacionamentos: {},
  moral: 70,
  recursos: { comida: 100, madeira: 0, pedra: 0, ferro: 0, capacidadeArmazem: 300 },
  ultimaExpedicaoGrupo: [],
  ...over,
} as unknown as GameState);

const colonia = (over: Partial<CondicoesColonia> = {}): CondicoesColonia => ({
  fome: false, diasSemComida: 0, excedente: 0, moral: 70, sanidadeDia: 0, fadigaRec: 0, ...over,
});

// rng estável a partir de uma fila (repete o último valor se esgotar).
const seq = (vals: number[]) => { let i = 0; return () => vals[Math.min(i++, vals.length - 1)]; };
const ctx = (draft: GameState, col: CondicoesColonia, rng: () => number): CtxVida =>
  ({ draft, colonia: col, rng, log: () => {} });

describe('relationships', () => {
  it('parKey é canônico (independe da ordem)', () => {
    expect(parKey('a', 'b')).toBe(parKey('b', 'a'));
  });
  it('ajustarAfinidade acumula, clampa e remove no zero', () => {
    const s = mkState([]);
    ajustarAfinidade(s, 'a', 'b', 30);
    expect(getAfinidade(s, 'a', 'b')).toBe(30);
    ajustarAfinidade(s, 'a', 'b', 999);
    expect(getAfinidade(s, 'b', 'a')).toBe(100);
    ajustarAfinidade(s, 'a', 'b', -100);
    expect(getAfinidade(s, 'a', 'b')).toBe(0);
    expect(s.relacionamentos!['a__b']).toBeUndefined();
  });
  it('vinculosDe ordena aliados antes de rivais', () => {
    const s = mkState([]);
    ajustarAfinidade(s, 'x', 'ally', 40);
    ajustarAfinidade(s, 'x', 'foe', -30);
    const v = vinculosDe(s, 'x');
    expect(v[0]).toEqual({ id: 'ally', afinidade: 40 });
    expect(v[1]).toEqual({ id: 'foe', afinidade: -30 });
  });
});

describe('sistemaConvivio', () => {
  it('aproxima colegas do mesmo posto', () => {
    const a = mkNpc({ posto: 'Fazenda' });
    const b = mkNpc({ posto: 'Fazenda' });
    const s = mkState([a, b]);
    sistemaConvivio.processarDia(ctx(s, colonia(), seq([0.9]))); // sem atrito/log
    expect(getAfinidade(s, a.id, b.id)).toBeGreaterThan(0);
  });
});

describe('sistemaDecaimento', () => {
  it('fome aplica penalidade base sem mortes no 1º dia', () => {
    const a = mkNpc();
    const s = mkState([a]);
    sistemaDecaimento.processarDia(ctx(s, colonia({ fome: true, diasSemComida: 1 }), seq([0.9])));
    expect(a.sanidade).toBe(75);
    expect(a.lealdade).toBe(77);
    expect(a.vivo).toBe(true);
  });
  it('inanição mata a partir do 2º dia (rng forçado)', () => {
    const a = mkNpc();
    const s = mkState([a]);
    sistemaDecaimento.processarDia(ctx(s, colonia({ fome: true, diasSemComida: 2 }), seq([0])));
    expect(a.vivo).toBe(false);
  });
  it('recupera fadiga e aplica passivas diárias', () => {
    const brut = mkNpc({ habilidade: 'berserker', fadiga: 50, lealdade: 60 });
    const ora  = mkNpc({ habilidade: 'oraculo', sanidade: 50 });
    const s = mkState([brut, ora]);
    sistemaDecaimento.processarDia(ctx(s, colonia(), seq([0.9])));
    expect(brut.fadiga).toBe(40);       // 50 − (10 + 0)
    expect(brut.lealdade).toBe(59);     // berserker −1
    expect(ora.sanidade).toBe(55);      // oráculo +5
  });
});

describe('sistemaTraicao', () => {
  it('lealdade baixa + rng forçado → rouba comida', () => {
    const a = mkNpc({ lealdade: 20 });
    const s = mkState([a]);
    sistemaTraicao.processarDia(ctx(s, colonia(), seq([0, 0, 0]))); // gatilho, roubo, valor=5
    expect(s.recursos.comida).toBe(95);
  });
});

describe('aplicarLuto', () => {
  it('quem tinha vínculo positivo sofre e o vínculo do morto é limpo', () => {
    const a = mkNpc({ sanidade: 80, lealdade: 80 });
    const s = mkState([a]);
    ajustarAfinidade(s, a.id, 'morto', 80);
    const logs = aplicarLuto(s, 'morto', 'Morto');
    expect(a.sanidade).toBe(70); // −(2 + 80/10)
    expect(a.lealdade).toBe(76); // −(80/20)
    expect(logs.length).toBe(1);
    expect(getAfinidade(s, a.id, 'morto')).toBe(0);
  });
});

describe('promoverParaNobre', () => {
  it('adota o promovido na casa de um nobre vinculado', () => {
    const plebeu = mkNpc({ raridade: 'Raro', nome: 'Kael' });
    const nobre  = mkNpc({ raridade: 'Épico', nome: 'Sigrid de Corval', sobrenome: 'de Corval' });
    const s = mkState([plebeu, nobre]);
    ajustarAfinidade(s, plebeu.id, nobre.id, 50);
    const r = promoverParaNobre(s, plebeu, seq([0.99]));
    expect(r?.tipo).toBe('adocao');
    expect(plebeu.sobrenome).toBe('de Corval');
    expect(plebeu.nome).toBe('Kael de Corval');
  });
  it('funda a própria casa com fama alta e rolagem rara', () => {
    const heroi = mkNpc({ raridade: 'Raro', nome: 'Kael', fama: 40 });
    const s = mkState([heroi]);
    const r = promoverParaNobre(s, heroi, seq([0]));
    expect(r?.tipo).toBe('fundacao');
    expect(heroi.casaFundador).toBe(true);
    expect(heroi.sobrenome).toBeTruthy();
  });
  it('fallback: sobrenome próprio quando sem vínculo nem fama', () => {
    const npc = mkNpc({ raridade: 'Raro', nome: 'Kael', fama: 0 });
    const s = mkState([npc]);
    const r = promoverParaNobre(s, npc, seq([0.99]));
    expect(r?.tipo).toBe('propria');
    expect(npc.sobrenome).toBeTruthy();
  });
  it('não faz nada com plebeu (raridade baixa)', () => {
    const npc = mkNpc({ raridade: 'Comum' });
    const s = mkState([npc]);
    expect(promoverParaNobre(s, npc, seq([0]))).toBeNull();
  });
});

describe('humorDe', () => {
  it('sanidade no fundo → crítico', () => {
    expect(humorDe(mkNpc({ sanidade: 10 })).tom).toBe('critico');
  });
  it('tudo alto → bom', () => {
    expect(humorDe(mkNpc({ sanidade: 85, lealdade: 85, fadiga: 20 })).tom).toBe('bom');
  });
});
