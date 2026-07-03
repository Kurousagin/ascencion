import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import {
  registrarPerfil, obterAliada, parearAlianca, enviarRecursos, listarCaixa, receberItem,
  emprestarMorador, reforcarMorador, devolverMorador,
  type Perfil, type Aliada, type Exchange, type ResumoCidadela,
} from '@workspace/api-client-react';
import { useGame, Recursos } from './GameContext';
import { getProfissao, GameState, NPC, MoradorBase, moradorBase } from '../lib/game-data';
import { getDeviceId, getNomeLocal, setNomeLocal } from '../lib/alliance-identity';

interface AllianceContextType {
  perfil: Perfil | null;
  aliada: Aliada | null;
  caixa: Exchange[];
  online: boolean;
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
  const status = (e as { status?: number })?.status;
  const data = (e as { data?: { error?: string } })?.data;
  if (data?.error) return data.error;
  if (status === 404) return 'Não encontrado.';
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

  const deviceId = useRef(getDeviceId());
  const stateRef = useRef<GameState | null>(state);
  useEffect(() => { stateRef.current = state; }, [state]);

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
    } catch {
      /* mantém caixa anterior em caso de falha momentânea */
    }
  }, []);

  const refresh = useCallback(() => {
    void sincronizarPerfil();
    void puxarAliadaECaixa();
  }, [sincronizarPerfil, puxarAliadaECaixa]);

  // Registro inicial + timers. Atualiza também ao voltar o foco da aba (abas em
  // segundo plano têm setInterval estrangulado pelos navegadores).
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
    // Remove o morador do estado ANTES de chamar a rede (some da cidadela na hora).
    // O rollback (restaurarMorador) só acontece se o POST falhar — nunca depois de
    // um insert bem-sucedido no servidor, para evitar duplicação cross-player.
    const removido = removerParaEmprestimo(npcId);
    if (!removido) return { ok: false, erro: 'Morador indisponível para empréstimo.' };

    // Fase 1: mutação no servidor. Se falhar, o estado local é revertido.
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

    // Fase 2: atualização da caixa/aliada. Falha aqui NÃO reverte o empréstimo
    // (o servidor já registrou). O polling periódico vai corrigir o estado.
    try {
      await puxarAliadaECaixa();
    } catch {
      /* falha silenciosa — o empréstimo foi registrado; o poll vai atualizar */
    }

    return { ok: true };
  }, [removerParaEmprestimo, restaurarMorador, puxarAliadaECaixa]);

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

    try {
      await puxarAliadaECaixa();
    } catch {
      /* falha silenciosa — o reforço foi registrado; o poll vai atualizar */
    }

    return { ok: true };
  }, [removerParaEmprestimo, restaurarMorador, puxarAliadaECaixa]);

  // ─── Receber item da caixa (recursos, morador, reforço ou retorno) ─────────
  const receber = useCallback(async (exchangeId: number) => {
    try {
      const item = await receberItem({ deviceId: deviceId.current, exchangeId });
      if (item.tipo === 'emprestimo' && item.morador) {
        // Recebe o morador emprestado; item.id é o empréstimo de origem (p/ devolução).
        receberEmprestado(item.morador as MoradorBase, item.prazoDias ?? 1, item.remetenteNome, item.id);
      } else if (item.tipo === 'reforco' && item.morador) {
        // Reforço: entra como membro temporário de expedição.
        receberReforco(item.morador as MoradorBase, item.remetenteNome, item.id);
      } else if (item.tipo === 'retorno' && item.morador) {
        // Morador próprio voltando (ou aviso de morte).
        reintegrarMorador(item.morador as MoradorBase, !!item.morreu);
      } else if (item.recursos) {
        creditarRecursos(item.recursos, item.remetenteNome);
      }
      setCaixa(prev => prev.filter(i => i.id !== exchangeId));
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: msgErro(e) };
    }
  }, [creditarRecursos, receberEmprestado, receberReforco, reintegrarMorador]);

  // ─── Devolução automática dos emprestados ────────────────────────────────────
  // A receptora devolve o morador quando o prazo (nos SEUS dias) vence, ou
  // imediatamente se ele morreu numa expedição. A devolução trafega pela caixa de
  // entrada do dono; o status da troca no servidor impede duplicação.
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
      // Sucesso (inclusive devolução já registrada): sai do estado local.
      removerEmprestado(npc.id);
    } catch {
      /* rede indisponível: tenta de novo no próximo avanço de dia/poll */
    } finally {
      devolvendoRef.current.delete(npc.id);
    }
  }, [removerEmprestado]);

  useEffect(() => {
    if (!state) return;
    const vencidos = state.npcs.filter(
      n =>
        // Emprestado: prazo vencido ou morreu
        (n.emprestado && (!n.vivo || (n.emprestadoAte != null && state.dia >= n.emprestadoAte))) ||
        // Reforço: expedição concluída ou morreu
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
    } catch {
      /* será reenviado na próxima sincronização */
    }
  }, []);

  return (
    <AllianceContext.Provider value={{ perfil, aliada, caixa, online, parear, enviar, emprestar, reforcar, receber, renomear, refresh }}>
      {children}
    </AllianceContext.Provider>
  );
};
