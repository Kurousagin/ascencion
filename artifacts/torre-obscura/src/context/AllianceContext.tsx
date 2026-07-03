import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import {
  registrarPerfil, obterAliada, parearAlianca, enviarRecursos, listarCaixa, receberItem,
  emprestarMorador, reforcarMorador, devolverMorador,
  type Perfil, type Aliada, type Exchange, type ResumoCidadela,
} from '@workspace/api-client-react';
import { useGame, Recursos } from './GameContext';
import { getProfissao, GameState, NPC, MoradorBase, moradorBase } from '../lib/game-data';
import { getDeviceId, getNomeLocal, setNomeLocal } from '../lib/alliance-identity';

// ─── Histórico de empréstimos (persistido em localStorage) ────────────────────

export interface EmprestimoRegistro {
  id: string;
  npcId: string;
  npcNome: string;
  profissao: string;       // ProfissaoId serializado como string
  raridade: string;
  tipo: 'emprestimo' | 'reforco';
  estado: 'em_curso' | 'retornou' | 'caiu';
  diaEnvio: number;
  prazoDias: number;       // 0 para reforços
  aliadaNome: string;
  diaRetorno?: number;
}

const HISTORICO_KEY = 'torre_obscura_emprestimos_historico';
const MAX_HISTORICO = 50;

function carregarHistorico(): EmprestimoRegistro[] {
  try {
    const raw = localStorage.getItem(HISTORICO_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function salvarHistoricoStorage(h: EmprestimoRegistro[]): void {
  try { localStorage.setItem(HISTORICO_KEY, JSON.stringify(h)); } catch { /* quota */ }
}

// ─── Tipo do contexto ─────────────────────────────────────────────────────────

interface AllianceContextType {
  perfil: Perfil | null;
  aliada: Aliada | null;
  caixa: Exchange[];
  online: boolean;
  historico: EmprestimoRegistro[];
  parear: (codigo: string) => Promise<{ ok: boolean; erro?: string }>;
  enviar: (r: Recursos) => Promise<{ ok: boolean; erro?: string }>;
  emprestar: (npcId: string, prazoDias: number) => Promise<{ ok: boolean; erro?: string }>;
  reforcar: (npcId: string) => Promise<{ ok: boolean; erro?: string }>;
  receber: (exchangeId: number) => Promise<{ ok: boolean; erro?: string }>;
  renomear: (nome: string) => Promise<void>;
  refresh: () => void;
}

const AllianceContext = createContext<AllianceContextType | null>(null);

export const useAlliance = () => {
  const ctx = useContext(AllianceContext);
  if (!ctx) throw new Error('useAlliance must be used within AllianceProvider');
  return ctx;
};

function resumoDoEstado(state: GameState): ResumoCidadela {
  const vivos = state.npcs.filter(n => n.vivo);
  const profissoes = { combatente: 0, batedor: 0, erudito: 0, sentinela: 0 };
  vivos.forEach(n => { profissoes[getProfissao(n)]++; });
  return {
    dia: state.dia,
    populacao: vivos.length,
    andarAtual: state.andarAtual,
    profissoes,
  };
}

function msgErro(e: unknown): string {
  const data = (e as { data?: { error?: string } })?.data;
  if (data?.error) return data.error;
  if ((e as { status?: number })?.status === 404) return 'Não encontrado.';
  return 'Falha de conexão com a torre. Tente novamente.';
}

const SYNC_MS = 20_000;
const POLL_MS = 15_000;

export const AllianceProvider = ({ children }: { children: ReactNode }) => {
  const {
    state, creditarRecursos,
    removerParaEmprestimo, restaurarMorador, receberEmprestado, removerEmprestado, reintegrarMorador,
    receberReforco,
  } = useGame();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [aliada, setAliada] = useState<Aliada | null>(null);
  const [caixa, setCaixa] = useState<Exchange[]>([]);
  const [online, setOnline] = useState(false);
  const [historico, setHistorico] = useState<EmprestimoRegistro[]>(carregarHistorico);

  const deviceId = useRef(getDeviceId());
  const stateRef = useRef<GameState | null>(state);
  const aliadaRef = useRef<Aliada | null>(aliada);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { aliadaRef.current = aliada; }, [aliada]);

  // ─── Helpers de histórico ───────────────────────────────────────────────────

  const adicionarRegistro = useCallback((reg: EmprestimoRegistro) => {
    setHistorico(prev => {
      const novo = [reg, ...prev].slice(0, MAX_HISTORICO);
      salvarHistoricoStorage(novo);
      return novo;
    });
  }, []);

  const atualizarRegistro = useCallback(
    (npcId: string, estado: 'retornou' | 'caiu', diaRetorno: number) => {
      setHistorico(prev => {
        const novo = prev.map(r =>
          r.npcId === npcId && r.estado === 'em_curso'
            ? { ...r, estado, diaRetorno }
            : r,
        );
        salvarHistoricoStorage(novo);
        return novo;
      });
    },
    [],
  );

  // ─── Rede ───────────────────────────────────────────────────────────────────

  const sincronizarPerfil = useCallback(async () => {
    const s = stateRef.current;
    try {
      const p = await registrarPerfil({
        deviceId: deviceId.current,
        nome: getNomeLocal() ?? undefined,
        resumo: s ? resumoDoEstado(s) : undefined,
      });
      setPerfil(p);
      setOnline(true);
      if (!getNomeLocal()) setNomeLocal(p.nome);
    } catch {
      setOnline(false);
    }
  }, []);

  const puxarAliadaECaixa = useCallback(async () => {
    try {
      const a = await obterAliada(deviceId.current);
      setAliada(a);
    } catch (e) {
      if ((e as { status?: number })?.status === 404) setAliada(null);
    }
    try {
      const c = await listarCaixa(deviceId.current);
      setCaixa(c);
    } catch { /* mantém estado anterior */ }
  }, []);

  const refresh = useCallback(() => {
    void sincronizarPerfil();
    void puxarAliadaECaixa();
  }, [sincronizarPerfil, puxarAliadaECaixa]);

  useEffect(() => {
    refresh();
    const t1 = setInterval(() => { void sincronizarPerfil(); }, SYNC_MS);
    const t2 = setInterval(() => { void puxarAliadaECaixa(); }, POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [sincronizarPerfil, puxarAliadaECaixa, refresh]);

  // ─── Parear ────────────────────────────────────────────────────────────────
  const parear = useCallback(async (codigo: string) => {
    try {
      const a = await parearAlianca({ deviceId: deviceId.current, codigo: codigo.trim().toUpperCase() });
      setAliada(a);
      await sincronizarPerfil();
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: msgErro(e) };
    }
  }, [sincronizarPerfil]);

  // ─── Enviar recursos ───────────────────────────────────────────────────────
  const enviar = useCallback(async (r: Recursos) => {
    try {
      await enviarRecursos({ deviceId: deviceId.current, recursos: r });
      await sincronizarPerfil();
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: msgErro(e) };
    }
  }, [sincronizarPerfil]);

  // ─── Emprestar morador ─────────────────────────────────────────────────────
  const emprestar = useCallback(async (npcId: string, prazoDias: number) => {
    const removido = removerParaEmprestimo(npcId);
    if (!removido) return { ok: false, erro: 'Morador indisponível para empréstimo.' };

    try {
      await emprestarMorador({
        deviceId: deviceId.current,
        morador: moradorBase(removido),
        prazoDias,
      });
    } catch (e) {
      restaurarMorador(removido);
      return { ok: false, erro: msgErro(e) };
    }

    // Registrar no histórico após sucesso confirmado
    adicionarRegistro({
      id: crypto.randomUUID(),
      npcId: removido.id,
      npcNome: removido.nome,
      profissao: getProfissao(removido),
      raridade: removido.raridade,
      tipo: 'emprestimo',
      estado: 'em_curso',
      diaEnvio: stateRef.current?.dia ?? 0,
      prazoDias,
      aliadaNome: aliadaRef.current?.nome ?? '—',
    });

    try { await puxarAliadaECaixa(); } catch { /* poll vai corrigir */ }
    return { ok: true };
  }, [removerParaEmprestimo, restaurarMorador, puxarAliadaECaixa, adicionarRegistro]);

  // ─── Enviar reforço (fase 3) ──────────────────────────────────────────────
  const reforcar = useCallback(async (npcId: string) => {
    const removido = removerParaEmprestimo(npcId);
    if (!removido) return { ok: false, erro: 'Morador indisponível para reforço.' };

    try {
      await reforcarMorador({ deviceId: deviceId.current, morador: moradorBase(removido) });
    } catch (e) {
      restaurarMorador(removido);
      return { ok: false, erro: msgErro(e) };
    }

    adicionarRegistro({
      id: crypto.randomUUID(),
      npcId: removido.id,
      npcNome: removido.nome,
      profissao: getProfissao(removido),
      raridade: removido.raridade,
      tipo: 'reforco',
      estado: 'em_curso',
      diaEnvio: stateRef.current?.dia ?? 0,
      prazoDias: 0,
      aliadaNome: aliadaRef.current?.nome ?? '—',
    });

    try { await puxarAliadaECaixa(); } catch { /* poll vai corrigir */ }
    return { ok: true };
  }, [removerParaEmprestimo, restaurarMorador, puxarAliadaECaixa, adicionarRegistro]);

  // ─── Receber item ──────────────────────────────────────────────────────────
  const receber = useCallback(async (exchangeId: number) => {
    try {
      const item = await receberItem({ deviceId: deviceId.current, exchangeId });
      if (item.tipo === 'emprestimo' && item.morador) {
        receberEmprestado(item.morador as MoradorBase, item.prazoDias ?? 1, item.remetenteNome, item.id);
      } else if (item.tipo === 'reforco' && item.morador) {
        receberReforco(item.morador as MoradorBase, item.remetenteNome, item.id);
      } else if (item.tipo === 'retorno' && item.morador) {
        reintegrarMorador(item.morador as MoradorBase, !!item.morreu);
        // Atualiza o histórico do dono com o resultado do retorno
        if (item.morador.id) {
          atualizarRegistro(
            item.morador.id,
            item.morreu ? 'caiu' : 'retornou',
            stateRef.current?.dia ?? 0,
          );
        }
      } else if (item.recursos) {
        creditarRecursos(item.recursos, item.remetenteNome);
      }
      setCaixa(prev => prev.filter(i => i.id !== exchangeId));
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: msgErro(e) };
    }
  }, [creditarRecursos, receberEmprestado, receberReforco, reintegrarMorador, atualizarRegistro]);

  // ─── Devolução automática dos emprestados ─────────────────────────────────
  const devolvendoRef = useRef<Set<string>>(new Set());
  const devolver = useCallback(async (npc: NPC) => {
    if (npc.origemExchangeId == null) return;
    if (devolvendoRef.current.has(npc.id)) return;
    devolvendoRef.current.add(npc.id);
    try {
      await devolverMorador({
        deviceId: deviceId.current,
        origemExchangeId: npc.origemExchangeId,
        morador: moradorBase(npc),
        morreu: !npc.vivo,
      });
      removerEmprestado(npc.id);
    } catch {
      /* tenta de novo no próximo avanço */
    } finally {
      devolvendoRef.current.delete(npc.id);
    }
  }, [removerEmprestado]);

  useEffect(() => {
    if (!state) return;
    const vencidos = state.npcs.filter(
      n =>
        (n.emprestado && (!n.vivo || (n.emprestadoAte != null && state.dia >= n.emprestadoAte))) ||
        (n.reforco && (!n.vivo || n.reforcoConcluido)),
    );
    vencidos.forEach(n => { void devolver(n); });
  }, [state?.dia, state?.npcs, devolver]);

  // ─── Renomear cidadela ─────────────────────────────────────────────────────
  const renomear = useCallback(async (nome: string) => {
    const limpo = nome.trim();
    if (!limpo) return;
    setNomeLocal(limpo);
    try {
      const p = await registrarPerfil({ deviceId: deviceId.current, nome: limpo });
      setPerfil(p);
    } catch { /* reenviado na próxima sync */ }
  }, []);

  return (
    <AllianceContext.Provider value={{
      perfil, aliada, caixa, online, historico,
      parear, enviar, emprestar, reforcar, receber, renomear, refresh,
    }}>
      {children}
    </AllianceContext.Provider>
  );
};
