import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import {
  registrarPerfil, listarAliadas, parearAlianca, desfazerAlianca,
  enviarRecursos, listarCaixa, receberItem,
  emprestarMorador, reforcarMorador, devolverMorador,
  reforcarMoradorGuerra, pedirAjudaGuerra,
  type Perfil, type Aliada, type Exchange, type ResumoCidadela,
} from '@workspace/api-client-react';
import { useGame, Recursos } from './GameContext';
import { getProfissao, GameState, NPC, MoradorBase, moradorBase } from '../lib/game-data';
import { getDeviceId, resetDeviceId, getNomeLocal, setNomeLocal, isAllianceAtivada, marcarAllianceAtivada, desativarAlianca } from '../lib/alliance-identity';
import { updateNextEvent, isPushEnabled } from '../lib/push-notifications';

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
  aliadas: Aliada[];
  caixa: Exchange[];
  online: boolean;
  historico: EmprestimoRegistro[];
  ativar: () => void;
  parear: (codigo: string) => Promise<{ ok: boolean; erro?: string }>;
  desfazer: (aliadaDeviceId: string) => Promise<{ ok: boolean; erro?: string }>;
  dissolveAll: () => Promise<void>;
  enviar: (aliadaDeviceId: string, r: Recursos) => Promise<{ ok: boolean; erro?: string }>;
  emprestar: (aliadaDeviceId: string, npcId: string, prazoDias: number) => Promise<{ ok: boolean; erro?: string }>;
  reforcar: (aliadaDeviceId: string, npcId: string) => Promise<{ ok: boolean; erro?: string }>;
  reforcarGuerra: (aliadaDeviceId: string, npcId: string) => Promise<{ ok: boolean; erro?: string }>;
  pedirAjuda: (rivalNome: string, diasRestantes: number) => Promise<{ ok: boolean; erro?: string }>;
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
    emGuerra: !!state.guerra,
    guerraRivalNome: state.guerra?.rival.nome ?? null,
    guerraDiasRestantes: state.guerra ? state.guerra.duracao - state.guerra.diasDecorridos : null,
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
    receberReforco, receberReforcoGuerra,
  } = useGame();

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [aliadas, setAliadas] = useState<Aliada[]>([]);
  const [caixa, setCaixa] = useState<Exchange[]>([]);
  const [online, setOnline] = useState(false);
  const [historico, setHistorico] = useState<EmprestimoRegistro[]>(carregarHistorico);
  const [ativo, setAtivo] = useState(isAllianceAtivada());

  const deviceId = useRef(getDeviceId());
  const stateRef = useRef<GameState | null>(state);
  const aliadasRef = useRef<Aliada[]>(aliadas);
  // Contador de geração: evita que um request antigo (iniciado antes do parear)
  // sobrescreva o estado com lista vazia depois que um request mais novo já
  // entregou o resultado correto.
  const aliadasGen = useRef(0);
  // Rastreia IDs de items já vistos para detectar novos itens de aliança
  const seenExchangeIds = useRef<Set<number>>(new Set());
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { aliadasRef.current = aliadas; }, [aliadas]);

  const nomeAliada = useCallback((aliadaDeviceId: string) => {
    return aliadasRef.current.find(a => a.deviceId === aliadaDeviceId)?.nome ?? '—';
  }, []);

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

  const puxarAliadasECaixa = useCallback(async () => {
    // Incrementa geração antes de qualquer await. Se um request mais novo
    // terminar primeiro (e incrementar novamente), o resultado deste é descartado.
    const gen = ++aliadasGen.current;
    // cache: 'no-store' evita 304 sem corpo (Express ETag padrão).
    try {
      const as = await listarAliadas(deviceId.current, { cache: 'no-store' });
      if (gen === aliadasGen.current && Array.isArray(as)) setAliadas(as);
    } catch { /* mantém estado anterior */ }
    try {
      const c = await listarCaixa(deviceId.current, { cache: 'no-store' });
      if (gen === aliadasGen.current && Array.isArray(c)) {
        // Detecta novos items de aliança e dispara notificação (Tier 3)
        const novoIds = new Set(c.map(item => item.id));
        const novosItems = c.filter(item => !seenExchangeIds.current.has(item.id));

        if (novosItems.length > 0) {
          // Texto descriptivo baseado no tipo
          const textos = novosItems.map(item => {
            const tipo = item.tipo;
            const remetente = item.remetenteNome || 'Aliada';

            if (tipo === 'recursos') return `Suprimentos de ${remetente}`;
            if (tipo === 'emprestimo') return `Morador emprestado de ${remetente}`;
            if (tipo === 'reforco') return `Reforço de ${remetente}`;
            if (tipo === 'reforco_guerra') return `Reforço de guerra de ${remetente}`;
            if (tipo === 'pedido_socorro') return `${remetente} pede reforços na guerra!`;
            if (tipo === 'retorno') return `Morador retornou de ${remetente}`;
            return `Novo item de ${remetente}`;
          });

          // Atualiza próximo evento com timestamp imediato (now)
          // não precisa checar isPushEnabled - servidor vai ignorar se não há subscription
          const msg = textos.join(', ');
          void updateNextEvent(deviceId.current, new Date(), msg).catch(() => {});
        }

        seenExchangeIds.current = novoIds;
        setCaixa(c);
      }
    } catch { /* mantém estado anterior */ }
  }, []);

  // Sequencial: garante que o perfil esteja registrado antes de buscar aliadas.
  // Sem isso, puxarAliadasECaixa pode rodar antes de sincronizarPerfil e
  // o servidor retorna [] (jogador não existe ainda), apagando a lista de aliadas.
  const refresh = useCallback(() => {
    void sincronizarPerfil().then(() => puxarAliadasECaixa());
  }, [sincronizarPerfil, puxarAliadasECaixa]);

  // Ativa o registro de aliança: passa de "preguiçoso" para "ativo", disparando
  // sincronização e polling.
  const ativar = useCallback(() => {
    if (!ativo) {
      marcarAllianceAtivada();
      setAtivo(true);
    }
  }, [ativo]);

  useEffect(() => {
    if (!ativo) return;
    refresh();
    const t1 = setInterval(() => { void sincronizarPerfil(); }, SYNC_MS);
    const t2 = setInterval(() => { void puxarAliadasECaixa(); }, POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [sincronizarPerfil, puxarAliadasECaixa, refresh, ativo]);

  // ─── Parear ────────────────────────────────────────────────────────────────
  const parear = useCallback(async (codigo: string) => {
    try {
      ativar();
      const a = await parearAlianca({ deviceId: deviceId.current, codigo: codigo.trim().toUpperCase() });
      // Atualização optimista: mostra a aliada antes mesmo do poll
      setAliadas(prev => (prev.some(x => x.deviceId === a.deviceId) ? prev : [...prev, a]));
      await sincronizarPerfil();
      // Confirma com o servidor para garantir consistência bidirecional
      void puxarAliadasECaixa();
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: msgErro(e) };
    }
  }, [sincronizarPerfil, puxarAliadasECaixa, ativar]);

  // ─── Desfazer aliança ────────────────────────────────────────────────────────
  const desfazer = useCallback(async (aliadaDeviceId: string) => {
    try {
      await desfazerAlianca({ deviceId: deviceId.current, aliadaDeviceId });
      setAliadas(prev => prev.filter(a => a.deviceId !== aliadaDeviceId));
      await sincronizarPerfil();
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: msgErro(e) };
    }
  }, [sincronizarPerfil]);

  // ─── Enviar recursos ───────────────────────────────────────────────────────
  const enviar = useCallback(async (aliadaDeviceId: string, r: Recursos) => {
    try {
      await enviarRecursos({ deviceId: deviceId.current, aliadaDeviceId, recursos: r });
      await sincronizarPerfil();
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: msgErro(e) };
    }
  }, [sincronizarPerfil]);

  // ─── Emprestar morador ─────────────────────────────────────────────────────
  const emprestar = useCallback(async (aliadaDeviceId: string, npcId: string, prazoDias: number) => {
    const removido = removerParaEmprestimo(npcId);
    if (!removido) return { ok: false, erro: 'Morador indisponível para empréstimo.' };

    try {
      await emprestarMorador({
        deviceId: deviceId.current,
        aliadaDeviceId,
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
      aliadaNome: nomeAliada(aliadaDeviceId),
    });

    try { await puxarAliadasECaixa(); } catch { /* poll vai corrigir */ }
    return { ok: true };
  }, [removerParaEmprestimo, restaurarMorador, puxarAliadasECaixa, adicionarRegistro, nomeAliada]);

  // ─── Enviar reforço (fase 3) ──────────────────────────────────────────────
  const reforcar = useCallback(async (aliadaDeviceId: string, npcId: string) => {
    const removido = removerParaEmprestimo(npcId);
    if (!removido) return { ok: false, erro: 'Morador indisponível para reforço.' };

    try {
      await reforcarMorador({ deviceId: deviceId.current, aliadaDeviceId, morador: moradorBase(removido) });
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
      aliadaNome: nomeAliada(aliadaDeviceId),
    });

    try { await puxarAliadasECaixa(); } catch { /* poll vai corrigir */ }
    return { ok: true };
  }, [removerParaEmprestimo, restaurarMorador, puxarAliadasECaixa, adicionarRegistro, nomeAliada]);

  // ─── Enviar reforço de guerra ─────────────────────────────────────────────
  const reforcarGuerra = useCallback(async (aliadaDeviceId: string, npcId: string) => {
    const removido = removerParaEmprestimo(npcId);
    if (!removido) return { ok: false, erro: 'Morador indisponível para reforço de guerra.' };

    try {
      await reforcarMoradorGuerra({ deviceId: deviceId.current, aliadaDeviceId, morador: moradorBase(removido) });
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
      aliadaNome: nomeAliada(aliadaDeviceId),
    });

    try { await puxarAliadasECaixa(); } catch { /* poll vai corrigir */ }
    return { ok: true };
  }, [removerParaEmprestimo, restaurarMorador, puxarAliadasECaixa, adicionarRegistro, nomeAliada]);

  // ─── Pedir ajuda em guerra ────────────────────────────────────────────────
  const pedirAjuda = useCallback(async (rivalNome: string, diasRestantes: number) => {
    try {
      await pedirAjudaGuerra({ deviceId: deviceId.current, rivalNome, diasRestantes });
      try { await puxarAliadasECaixa(); } catch { /* poll vai corrigir */ }
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: msgErro(e) };
    }
  }, [puxarAliadasECaixa]);

  // ─── Receber item ──────────────────────────────────────────────────────────
  const receber = useCallback(async (exchangeId: number) => {
    try {
      const item = await receberItem({ deviceId: deviceId.current, exchangeId });
      if (item.tipo === 'emprestimo' && item.morador) {
        receberEmprestado(item.morador as MoradorBase, item.prazoDias ?? 1, item.remetenteNome, item.id);
      } else if (item.tipo === 'reforco' && item.morador) {
        receberReforco(item.morador as MoradorBase, item.remetenteNome, item.id);
      } else if (item.tipo === 'reforco_guerra' && item.morador) {
        receberReforcoGuerra(item.morador as MoradorBase, item.remetenteNome, item.id);
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
      } else if (item.tipo === 'pedido_socorro') {
        // Notificação apenas: aliada está pedindo reforço para guerra
        // Sem ação automática no cliente
      } else if (item.recursos) {
        creditarRecursos(item.recursos, item.remetenteNome);
      }
      setCaixa(prev => prev.filter(i => i.id !== exchangeId));
      return { ok: true };
    } catch (e) {
      return { ok: false, erro: msgErro(e) };
    }
  }, [creditarRecursos, receberEmprestado, receberReforco, receberReforcoGuerra, reintegrarMorador, atualizarRegistro]);

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
        (n.reforco && (!n.vivo || n.reforcoConcluido)) ||
        (n.reforcoGuerra && (!n.vivo || n.reforcoGuerraConcluido)),
    );
    vencidos.forEach(n => { void devolver(n); });
  }, [state?.dia, state?.npcs, devolver]);

  // ─── Novo jogo: rotacionar deviceId ────────────────────────────────────────
  // Gera um novo código de aliança — as alianças do ciclo anterior ficam
  // órfãs no servidor automaticamente, sem precisar de chamadas de rede.
  // Robusto a offline: funciona sempre, independente de conectividade.
  // Condicional: só reseta se a aliança já estava ativada. Caso contrário,
  // é um no-op de rede (só limpa estado local).
  const dissolveAll = useCallback(async () => {
    if (ativo) {
      const novoId = resetDeviceId();
      deviceId.current = novoId;
      desativarAlianca();
      setAtivo(false);
    }
    setPerfil(null);
    setAliadas([]);
    setCaixa([]);
    setHistorico([]);
    salvarHistoricoStorage([]);
  }, [ativo]);

  // ─── Renomear cidadela ─────────────────────────────────────────────────────
  const renomear = useCallback(async (nome: string) => {
    const limpo = nome.trim();
    if (!limpo) return;
    ativar();
    setNomeLocal(limpo);
    try {
      const p = await registrarPerfil({ deviceId: deviceId.current, nome: limpo });
      setPerfil(p);
    } catch { /* reenviado na próxima sync */ }
  }, [ativar]);

  return (
    <AllianceContext.Provider value={{
      perfil, aliadas, caixa, online, historico,
      ativar, parear, desfazer, dissolveAll, enviar, emprestar, reforcar, reforcarGuerra, pedirAjuda, receber, renomear, refresh,
    }}>
      {children}
    </AllianceContext.Provider>
  );
};
