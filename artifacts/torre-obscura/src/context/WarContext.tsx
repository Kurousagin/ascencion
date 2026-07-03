import {
  createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback,
} from 'react';
import { listarRivais, type Rival } from '@workspace/api-client-react';
import { useGame } from './GameContext';
import { calcPoderMilitar, RivalCidadela, Postura } from '../lib/game-data';

// A guerra é resolvida localmente (dentro de processDay no GameContext). O servidor
// só fornece o POOL de alvos (cidadelas-bot). Este contexto cuida apenas de buscar
// e atualizar a lista rotativa de "rivais avistados" próximos ao poder militar da
// cidadela. Declarar guerra e simular a campanha ficam no GameContext.

interface WarContextType {
  rivais: RivalCidadela[];
  online: boolean;
  carregando: boolean;
  refresh: () => Promise<void>;
}

const WarContext = createContext<WarContextType | null>(null);

export const useWar = () => {
  const ctx = useContext(WarContext);
  if (!ctx) throw new Error('useWar must be used within WarProvider');
  return ctx;
};

function paraRival(r: Rival): RivalCidadela {
  return {
    slug: r.slug,
    nome: r.nome,
    dia: r.dia,
    andar: r.andar,
    populacao: r.populacao,
    profissoes: r.profissoes,
    poderBase: r.poderBase,
    suprimento: r.suprimento,
    recursos: r.recursos,
    postura: r.postura as Postura,
  };
}

export const WarProvider = ({ children }: { children: ReactNode }) => {
  const { state } = useGame();
  const [rivais, setRivais] = useState<RivalCidadela[]>([]);
  const [online, setOnline] = useState(true);
  const [carregando, setCarregando] = useState(false);

  // Refs para não recriar `refresh` a cada dia (o poder muda com o estado) e evitar
  // refetch em cascata. Sempre lê o valor mais recente no momento da busca.
  const poderRef = useRef(0);
  poderRef.current = calcPoderMilitar(state);
  const guerraSlugRef = useRef<string | undefined>(undefined);
  guerraSlugRef.current = state.guerra?.rival.slug;

  const refresh = useCallback(async () => {
    setCarregando(true);
    try {
      const excluir = guerraSlugRef.current ? [guerraSlugRef.current] : [];
      const resp = await listarRivais({ poder: poderRef.current, excluir });
      setRivais(resp.rivais.map(paraRival));
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Busca inicial ao montar + ao voltar o foco à aba (abas em segundo plano
  // estrangulam timers, então dependemos de eventos de visibilidade também).
  useEffect(() => {
    refresh();
    const onVis = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [refresh]);

  return (
    <WarContext.Provider value={{ rivais, online, carregando, refresh }}>
      {children}
    </WarContext.Provider>
  );
};
