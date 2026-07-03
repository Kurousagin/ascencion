import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import {
  registrarPerfil, obterAliada, parearAlianca, enviarRecursos, listarCaixa, receberItem,
  emprestarMorador as emprestarMoradorApi,
  retornarMorador as retornarMoradorApi,
  type Perfil, type Aliada, type Exchange, type ResumoCidadela,
} from '@workspace/api-client-react';
import { useGame, Recursos } from './GameContext';
import { getProfissao, GameState, NPC } from '../lib/game-data';
import { getDeviceId, getNomeLocal, setNomeLocal } from '../lib/alliance-identity';

interface AllianceContextType {
  perfil: Perfil | null;
  aliada: Aliada | null;
  caixa: Exchange[];
  online: boolean;
  parear: (codigo: string) => Promise<{ ok: boolean; erro?: string }>;
  enviar: (r: Recursos) => Promise<{ ok: boolean; erro?: string }>;
  receber: (exchangeId: number) => Promise<{ ok: boolean; erro?: string }>;
  emprestar: (npcId: string, dias: number) => Promise<{ ok: boolean; erro?: string }>;
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
    state,
    creditarRecursos,
    emprestarMorador,
    estornarMoradorEmprestado,
    receberMoradorEmprestado,
    removerMoradorEmprestado,
    creditarMoradorRetornado,
  } = useGame();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [aliada, setAliada] = useState<Aliada | null>(null);
  const [caixa, setCaixa] = useState<Exchange[]>([]);
  const [online, setOnline] = useState(false);

  const deviceId = useRef(getDeviceId());
  const stateRef = useRef<GameState | null>(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Rastreia NPCs emprestados cujo retorno já está sendo processado (evita duplicatas).
  const retornosEmAndamento = useRef(new Set<string>());

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

  // ─── Auto-retorno de NPCs emprestados ──────────────────────────────────────
  // Detecta NPCs com emprestadoDe definido que expiraram (dia >= retornaEm)
  // ou que morreram, e envia o retorno automaticamente ao servidor.
  const processarRetorno = useCallback(async (npc: NPC) => {
    const morreu = !npc.vivo;
    try {
      // Chama a rede ANTES de remover do estado local.
      // Se a rede falhar, o NPC permanece em state.npcs e será
      // reprocessado na próxima mudança de estado (retry automático).
      await retornarMoradorApi({
        deviceId: deviceId.current,
        npc: npc as unknown as Record<string, unknown>,
        morreu,
      });
      // Sucesso: agora é seguro remover o NPC do estado local.
      removerMoradorEmprestado(npc.id);
    } catch {
      // API indisponível — remove do set para liberar retry no
      // próximo ciclo do useEffect (NPC ainda está em state.npcs).
    } finally {
      retornosEmAndamento.current.delete(npc.id);
    }
  }, [removerMoradorEmprestado]);

  useEffect(() => {
    if (!state) return;
    const paraRetornar = state.npcs.filter(n =>
      n.emprestadoDe &&
      !retornosEmAndamento.current.has(n.id) &&
      (!n.vivo || (n.retornaEm !== undefined && state.dia >= n.retornaEm)),
    );
    for (const npc of paraRetornar) {
      retornosEmAndamento.current.add(npc.id);
      void processarRetorno(npc);
    }
  }, [state, processarRetorno]);

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

  // ─── Receber item da caixa (recursos, morador ou retorno) ─────────────────
  const receber = useCallback(async (exchangeId: number) => {
    try {
      const item = await receberItem({ deviceId: deviceId.current, exchangeId });
      if (item.tipo === 'recursos' && item.recursos) {
        creditarRecursos(item.recursos, item.remetenteNome);
      } else if (item.tipo === 'morador' && item.morador) {
        receberMoradorEmprestado(
          item.morador as unknown as NPC,
          item.remetenteNome,
          item.diasEmprestimo ?? 7,
        );
      } else if (item.tipo === 'retorno_morador') {
        creditarMoradorRetornado(
          item.morador as unknown as NPC,
          item.morreu ?? false,
          item.remetenteNome,
        );
      }
      setCaixa(prev => prev.filter(i => i.id !== exchangeId));
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: msgErro(e) };
    }
  }, [creditarRecursos, receberMoradorEmprestado, creditarMoradorRetornado]);

  // ─── Emprestar morador ─────────────────────────────────────────────────────
  const emprestar = useCallback(async (npcId: string, dias: number) => {
    const npc = emprestarMorador(npcId);
    if (!npc) return { ok: false, erro: 'Morador não encontrado ou indisponível.' };
    try {
      await emprestarMoradorApi({
        deviceId: deviceId.current,
        npc: npc as unknown as Record<string, unknown>,
        diasEmprestimo: dias,
      });
      await sincronizarPerfil();
      return { ok: true };
    } catch (e) {
      // Rede falhou: devolve o NPC para a cidadela
      estornarMoradorEmprestado(npc);
      return { ok: false, erro: msgErro(e) };
    }
  }, [emprestarMorador, estornarMoradorEmprestado, sincronizarPerfil]);

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
    <AllianceContext.Provider value={{ perfil, aliada, caixa, online, parear, enviar, receber, emprestar, renomear, refresh }}>
      {children}
    </AllianceContext.Provider>
  );
};
