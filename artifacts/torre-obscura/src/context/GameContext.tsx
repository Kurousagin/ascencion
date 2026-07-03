import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { GameState, createInitialState, LogEntry, generateNPC, getRandomInt, EDIFICIOS_CUSTOS, FLOORS } from '../lib/game-data';

interface GameContextType {
  state: GameState;
  hasSave: boolean;
  startNewGame: () => void;
  continueGame: () => void;
  advanceDay: () => void;
  setSpeed: (speed: 1 | 2 | 5) => void;
  buildEdificio: (tipo: string, nextLevel?: number) => void;
  sendExpedition: (npcIds: string[]) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<GameState | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('torre_obscura_save');
    if (saved) setHasSave(true);
  }, []);

  const saveState = (newState: GameState) => {
    newState.lastTimestamp = Date.now();
    localStorage.setItem('torre_obscura_save', JSON.stringify(newState));
    setState(newState);
  };

  const addLog = (draft: GameState, tipo: LogEntry['tipo'], mensagem: string) => {
    draft.log.unshift({ id: crypto.randomUUID(), tipo, mensagem, dia: draft.dia });
    if (draft.log.length > 200) draft.log = draft.log.slice(0, 200);
  };

  const processDay = (draft: GameState) => {
    if (draft.gameOver || draft.vitoria) return draft;

    const vivos = draft.npcs.filter(n => n.vivo);
    if (vivos.length === 0) {
      draft.gameOver = true;
      return draft;
    }

    // 1. Consumo de comida
    const comidaNecessaria = vivos.length * 1.5;
    if (draft.recursos.comida >= comidaNecessaria) {
      draft.recursos.comida -= comidaNecessaria;
    } else {
      draft.recursos.comida = 0;
      vivos.forEach(n => {
        n.sanidade -= 5;
        n.lealdade -= 3;
      });
      addLog(draft, 'alerta', 'FOME: Suprimentos insuficientes. Moral e sanidade caindo.');
    }

    // 2. Produção de edifícios
    const hasFazenda = draft.edificios.some(e => e.tipo === 'Fazenda');
    const hasEnfermaria = draft.edificios.some(e => e.tipo === 'Enfermaria');
    const hasTemplo = draft.edificios.some(e => e.tipo === 'Templo');
    const hasFogueira = draft.edificios.some(e => e.tipo === 'Fogueira');

    if (hasFazenda) draft.recursos.comida += 5;
    if (hasTemplo) {
      draft.moral += 2;
      vivos.forEach(n => n.sanidade += 0.5);
    }
    if (hasFogueira) draft.moral += 1;

    // 3. Recuperação de fadiga
    const fadigaRecuperada = 15 + (hasEnfermaria ? 5 : 0);
    vivos.forEach(n => {
      n.fadiga = Math.max(0, n.fadiga - fadigaRecuperada);
    });

    // 4. Variação de moral/sanidade/lealdade
    if (draft.moral > 60) vivos.forEach(n => n.lealdade += 0.5);
    if (draft.moral < 40) vivos.forEach(n => n.lealdade -= 1);

    draft.moral = Math.max(0, Math.min(100, draft.moral));
    vivos.forEach(n => {
      n.lealdade = Math.max(0, Math.min(100, n.lealdade));
      n.sanidade = Math.max(0, Math.min(100, n.sanidade));
    });

    // 5. Traição
    vivos.forEach(n => {
      if (n.lealdade < 30) {
        const chance = n.obscuro ? 0.2 : 0.1;
        if (Math.random() < chance) {
          if (Math.random() < 0.5) {
            const roubo = getRandomInt(5, 20);
            draft.recursos.comida = Math.max(0, draft.recursos.comida - roubo);
            addLog(draft, 'traicao', `${n.nome.toUpperCase()} ROUBOU COMIDA (${roubo})`);
          } else {
            draft.moral -= 8;
            addLog(draft, 'traicao', `${n.nome.toUpperCase()} SABOTOU O GRUPO (-8 Moral)`);
          }
        }
      }
    });

    // 6. Eventos aleatórios
    if (Math.random() < 0.15) {
      const eventos = [
        () => { vivos.forEach(n => n.sanidade -= 3); addLog(draft, 'evento', 'Chuva de cinzas: -3 Sanidade para todos.'); },
        () => { const n = vivos[getRandomInt(0, vivos.length - 1)]; n.lealdade -= 5; addLog(draft, 'evento', `Sussurros da torre afetaram ${n.nome} (-5 Lealdade).`); },
        () => { 
          const isIron = Math.random() < 0.3;
          const qtd = getRandomInt(3, 8);
          if (isIron) draft.recursos.ferro += qtd; else draft.recursos.pedra += qtd;
          addLog(draft, 'descoberta', `Achado misterioso: +${qtd} ${isIron ? 'Ferro' : 'Pedra'}.`);
        },
        () => { vivos.forEach(n => n.fadiga = Math.max(0, n.fadiga - 10)); addLog(draft, 'evento', 'Descanso coletivo: -10 Fadiga para todos.'); },
        () => { draft.moral -= 3; addLog(draft, 'evento', 'Tensão interna: -3 Moral.'); },
        () => { draft.moral += 5; addLog(draft, 'evento', 'Visão favorável: +5 Moral.'); },
      ];
      eventos[getRandomInt(0, eventos.length - 1)]();
    }

    // 7. Invocação emergencial
    if (vivos.length <= 3 && Math.random() < 0.3) {
      const novos = getRandomInt(1, 2);
      for(let i=0; i<novos; i++) {
        const obs = Math.random() < 0.12;
        draft.npcs.push(generateNPC(obs));
      }
      addLog(draft, 'info', 'NOVA PRESENÇA DETECTADA nos arredores.');
    }

    // 8. Overflow de armazém
    let lost = false;
    ['comida', 'madeira', 'pedra', 'ferro'].forEach(res => {
      const r = res as keyof typeof draft.recursos;
      if (typeof draft.recursos[r] === 'number') {
        if (draft.recursos[r] > draft.recursos.capacidadeArmazem) {
          draft.recursos[r] = draft.recursos.capacidadeArmazem;
          lost = true;
        }
      }
    });
    if (lost) addLog(draft, 'alerta', 'ARMAZÉM CHEIO - recursos excedentes foram perdidos.');

    // 9. Fim do dia
    draft.dia++;
    const vivosFinal = draft.npcs.filter(n => n.vivo);
    if (vivosFinal.length === 0) {
      draft.gameOver = true;
      addLog(draft, 'morte', 'TODOS OS SOBREVIVENTES PERECERAM.');
    }

    return draft;
  };

  // Use functional setState so the interval callback never captures stale state
  const advanceDay = () => {
    setState(prev => {
      if (!prev || prev.gameOver || prev.vitoria) return prev;
      const newState = processDay(JSON.parse(JSON.stringify(prev)));
      newState.lastTimestamp = Date.now();
      localStorage.setItem('torre_obscura_save', JSON.stringify(newState));
      return newState;
    });
  };

  // Keep a stable ref to velocidade so the interval effect only re-runs on speed changes
  const velocidadeRef = useRef<1 | 2 | 5>(1);
  const gameEndedRef = useRef(false);

  useEffect(() => {
    if (!state) return;
    velocidadeRef.current = state.velocidade;
    gameEndedRef.current = state.gameOver || state.vitoria;
  }, [state?.velocidade, state?.gameOver, state?.vitoria]);

  useEffect(() => {
    if (!state) return;
    if (state.gameOver || state.vitoria) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const msPerDay = state.velocidade === 1 ? 12000 : state.velocidade === 2 ? 6000 : 2400;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!gameEndedRef.current) advanceDay();
    }, msPerDay);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // Re-create interval only when speed or game-over status changes
  }, [state?.velocidade, state?.gameOver, state?.vitoria]);

  const startNewGame = () => {
    const s = createInitialState();
    saveState(s);
  };

  const continueGame = () => {
    const saved = localStorage.getItem('torre_obscura_save');
    if (!saved) return;
    let parsed: GameState;
    try {
      parsed = JSON.parse(saved) as GameState;
    } catch {
      localStorage.removeItem('torre_obscura_save');
      setHasSave(false);
      startNewGame();
      return;
    }
    {
      const now = Date.now();
      const diffMs = now - parsed.lastTimestamp;
      const msPerDay = parsed.velocidade === 1 ? 12000 : parsed.velocidade === 2 ? 6000 : 2400;
      let daysMissed = Math.floor(diffMs / msPerDay);
      if (daysMissed > 0) {
        daysMissed = Math.min(daysMissed, 30);
        for(let i=0; i<daysMissed; i++) {
          parsed = processDay(parsed);
          if (parsed.gameOver || parsed.vitoria) break;
        }
        parsed.log.unshift({ id: crypto.randomUUID(), tipo: 'info', mensagem: `O tempo passou... (${daysMissed} dias)`, dia: parsed.dia });
      }
      saveState(parsed);
    }
  };

  const setSpeed = (speed: 1 | 2 | 5) => {
    if (!state) return;
    const newState = { ...state, velocidade: speed };
    saveState(newState);
  };

  const buildEdificio = (tipo: string, nextLevel?: number) => {
    if (!state) return;
    const newState = JSON.parse(JSON.stringify(state)) as GameState;

    // Guard: already built (non-Armazem)
    if (tipo !== 'Armazem' && newState.edificios.some(e => e.tipo === tipo)) return;

    // Deduct cost and update
    const costKey = nextLevel ? `${tipo}_${nextLevel}` : tipo;
    const cost = EDIFICIOS_CUSTOS[costKey];

    // Guard: validate affordability before deducting
    if (cost) {
      if ((cost.madeira ?? 0) > newState.recursos.madeira) return;
      if ((cost.pedra ?? 0) > newState.recursos.pedra) return;
      if ((cost.ferro ?? 0) > newState.recursos.ferro) return;
      if (cost.madeira) newState.recursos.madeira -= cost.madeira;
      if (cost.pedra) newState.recursos.pedra -= cost.pedra;
      if (cost.ferro) newState.recursos.ferro -= cost.ferro;
    }

    if (tipo === 'Armazem') {
      const exist = newState.edificios.find(e => e.tipo === 'Armazem');
      if (exist) {
        exist.nivel = nextLevel!;
      } else {
        newState.edificios.push({ tipo: 'Armazem', nivel: nextLevel! });
      }
      newState.recursos.capacidadeArmazem = nextLevel === 2 ? 120 : nextLevel === 3 ? 250 : 60;
    } else {
      newState.edificios.push({ tipo: tipo as any, nivel: 1 });
    }
    
    addLog(newState, 'info', `${tipo.toUpperCase()} construído.`);
    saveState(newState);
  };

  const sendExpedition = (npcIds: string[]) => {
    if (!state || npcIds.length === 0) return;
    const newState = JSON.parse(JSON.stringify(state)) as GameState;
    const floorData = FLOORS[newState.andarAtual - 1];
    if (!floorData) return;

    // Guard: validate all selected NPCs are eligible
    const group = newState.npcs.filter(n => npcIds.includes(n.id));
    if (group.length === 0) return;
    if (group.some(n => !n.vivo || n.fadiga >= 90 || n.emExpedicao)) return;

    const cost = npcIds.length * (3 + floorData.tier);
    // Guard: validate food cost
    if (newState.recursos.comida < cost) return;
    newState.recursos.comida -= cost;

    let groupPower = 0;
    group.forEach(n => {
      let p = (n.forca * 0.3) + (n.agilidade * 0.25) + (n.resistencia * 0.25) + (n.inteligencia * 0.2);
      if (n.fadiga >= 50 && n.fadiga <= 69) p *= 0.85;
      else if (n.fadiga >= 70 && n.fadiga <= 89) p *= 0.65;
      groupPower += p;
    });

    const isVictory = groupPower >= floorData.difficulty;

    if (isVictory) {
      // Award
      newState.recursos.comida += floorData.floor * 3;
      newState.recursos.madeira += floorData.floor * 2;
      newState.recursos.pedra += Math.round(floorData.floor * 1.5);
      if (floorData.floor >= 5) newState.recursos.ferro += Math.round(floorData.floor * 0.8);
      
      newState.andarAtual++;
      group.forEach(n => n.lealdade += 3);
      addLog(newState, 'vitoria', `ANDAR ${floorData.floor} CONQUISTADO.`);
      
      if (newState.andarAtual > 20) {
        newState.vitoria = true;
      }
    } else {
      group.forEach(n => {
        n.lealdade -= 5;
        n.sanidade -= 5;
      });
      addLog(newState, 'alerta', `FALHA NO ANDAR ${floorData.floor}.`);
    }

    // Mortality
    group.forEach(n => {
      let mort = floorData.mortality;
      if (isVictory && groupPower > floorData.difficulty) {
        const red = Math.min(((groupPower - floorData.difficulty) / floorData.difficulty) * 50, 80);
        mort = mort * (1 - red / 100);
      }
      
      if (Math.random() * 100 < mort) {
        n.vivo = false;
        n.emExpedicao = false;
        newState.moral -= 5;
        newState.npcs.filter(x => x.vivo && x.id !== n.id).forEach(x => x.sanidade -= 3);
        addLog(newState, 'morte', `${n.nome.toUpperCase()} CAIU NO ANDAR ${floorData.floor}.`);
      } else {
        n.fadiga += getRandomInt(20, 35);
      }
    });

    saveState(newState);
  };

  return (
    <GameContext.Provider value={{
      state: state as GameState,
      hasSave,
      startNewGame,
      continueGame,
      advanceDay,
      setSpeed,
      buildEdificio,
      sendExpedition
    }}>
      {children}
    </GameContext.Provider>
  );
};
