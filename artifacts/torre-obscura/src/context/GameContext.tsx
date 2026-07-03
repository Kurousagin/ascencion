import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { flushSync } from 'react-dom';
import {
  GameState, createInitialState, LogEntry, generateNPC, getRandomInt,
  BUILDINGS, getEfeitos, FLOORS, calcNpcPower,
  calcCustoExpedicao, calcRecompensaAndar, calcCustoInvocacao,
  getProfissao, aceitaTrabalho, EdificioTipo,
  debitarArmazem, creditarArmazem,
} from '../lib/game-data';

interface GameContextType {
  state: GameState;
  hasSave: boolean;
  startNewGame: () => void;
  continueGame: () => void;
  advanceDay: () => void;
  setSpeed: (speed: 1 | 2 | 5) => void;
  buildEdificio: (tipo: EdificioTipo) => void;
  sendExpedition: (npcIds: string[]) => void;
  invocarMorador: () => void;
  assignPosto: (npcId: string, tipo: EdificioTipo | null) => void;
  // Aliança: movimentação de recursos no armazém (a rede fica no AllianceContext).
  debitarRecursos: (r: Recursos) => boolean;
  estornarRecursos: (r: Recursos) => void;
  creditarRecursos: (r: Recursos, remetente: string) => void;
}

export interface Recursos {
  comida: number;
  madeira: number;
  pedra: number;
  ferro: number;
}

const RES_LABEL: Record<keyof Recursos, string> = {
  comida: 'comida', madeira: 'madeira', pedra: 'pedra', ferro: 'ferro',
};

const resumoRecursos = (r: Recursos, sinal: '+' | '-') =>
  (Object.keys(RES_LABEL) as (keyof Recursos)[])
    .filter(k => r[k] > 0)
    .map(k => `${sinal}${r[k]} ${RES_LABEL[k]}`)
    .join(', ');

// Time: at 1x, one real-world day equals five in-game days.
// (24h / 5 game days = 4.8h of real time per game day at 1x; 2x and 5x accelerate.)
const MS_PER_GAME_DAY_BASE = 86_400_000 / 5;
const getMsPerDay = (velocidade: number) => MS_PER_GAME_DAY_BASE / velocidade;

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

  const processDay = (draft: GameState): GameState => {
    if (draft.gameOver || draft.vitoria) return draft;

    const vivos = draft.npcs.filter(n => n.vivo);
    if (vivos.length === 0) { draft.gameOver = true; return draft; }

    // Aggregate building effects (levels + workers) once per day
    const ef = getEfeitos(draft.edificios, draft.npcs);
    draft.recursos.capacidadeArmazem = ef.capacidadeArmazem;

    // 1. Produção de comida (edifícios) — creditada ANTES do consumo
    draft.recursos.comida += ef.comidaDia;

    // 2. Consumo de comida
    const comidaNecessaria = vivos.length * 1.2;
    if (draft.recursos.comida >= comidaNecessaria) {
      draft.recursos.comida -= comidaNecessaria;
    } else {
      draft.recursos.comida = 0;
      vivos.forEach(n => { n.sanidade -= 5; n.lealdade -= 3; });
      addLog(draft, 'alerta', 'FOME: Suprimentos insuficientes. Moral e sanidade caindo.');
    }

    // 3. Outros efeitos de edifícios (moral / sanidade)
    draft.moral += ef.moralDia;
    if (ef.sanidadeDia) vivos.forEach(n => { n.sanidade += ef.sanidadeDia; });

    // 4. Recuperação de fadiga (base + enfermaria + curandeiro)
    vivos.forEach(n => {
      let rec = 12 + ef.fadigaRec;
      if (n.habilidade === 'curandeiro') rec += 15;
      n.fadiga = Math.max(0, n.fadiga - rec);
    });

    // 4. Habilidades passivas diárias
    vivos.forEach(n => {
      if (n.habilidade === 'berserker') n.lealdade = Math.max(0, n.lealdade - 1);
      if (n.habilidade === 'oraculo')   n.sanidade  = Math.min(100, n.sanidade + 5);
    });

    // 5. Variação de moral/lealdade por estado geral
    if (draft.moral > 60) vivos.forEach(n => { n.lealdade += 0.5; });
    if (draft.moral < 40) vivos.forEach(n => { n.lealdade -= 1; });

    draft.moral = Math.max(0, Math.min(100, draft.moral));
    vivos.forEach(n => {
      n.lealdade = Math.max(0, Math.min(100, n.lealdade));
      n.sanidade = Math.max(0, Math.min(100, n.sanidade));
      n.fadiga   = Math.max(0, Math.min(100, n.fadiga));
    });

    // 6. Traição (habilidade 'sombra' reduz chance à metade)
    vivos.forEach(n => {
      if (n.lealdade < 30) {
        let chance = n.obscuro ? 0.2 : 0.1;
        if (n.habilidade === 'sombra') chance *= 0.5;
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

    // 7. Eventos aleatórios (15% por dia)
    if (Math.random() < 0.15) {
      const vivosCopy = [...vivos];
      const eventos = [
        () => { vivosCopy.forEach(n => { n.sanidade -= 3; }); addLog(draft, 'evento', 'Chuva de cinzas: -3 Sanidade para todos.'); },
        () => { const n = vivosCopy[getRandomInt(0, vivosCopy.length - 1)]; n.lealdade -= 5; addLog(draft, 'evento', `Sussurros da torre afetaram ${n.nome} (-5 Lealdade).`); },
        () => {
          const isIron = Math.random() < 0.3;
          const qtd = getRandomInt(3, 8);
          if (isIron) draft.recursos.ferro += qtd; else draft.recursos.pedra += qtd;
          addLog(draft, 'descoberta', `Achado misterioso: +${qtd} ${isIron ? 'Ferro' : 'Pedra'}.`);
        },
        () => { vivosCopy.forEach(n => { n.fadiga = Math.max(0, n.fadiga - 10); }); addLog(draft, 'evento', 'Descanso coletivo: -10 Fadiga para todos.'); },
        () => { draft.moral -= 3; addLog(draft, 'evento', 'Tensão interna: -3 Moral.'); },
        () => { draft.moral += 5; addLog(draft, 'evento', 'Visão favorável: +5 Moral.'); },
      ];
      eventos[getRandomInt(0, eventos.length - 1)]();
    }

    // 8. Invocação emergencial (pop ≤ 3)
    if (vivos.length <= 3 && Math.random() < 0.3) {
      const novos = getRandomInt(1, 2);
      for (let i = 0; i < novos; i++) {
        const obs = Math.random() < 0.12;
        draft.npcs.push(generateNPC(obs));
      }
      addLog(draft, 'info', 'NOVA PRESENÇA DETECTADA nos arredores.');
    }

    // 9. Overflow de armazém
    let lost = false;
    (['comida', 'madeira', 'pedra', 'ferro'] as const).forEach(res => {
      if (draft.recursos[res] > draft.recursos.capacidadeArmazem) {
        draft.recursos[res] = draft.recursos.capacidadeArmazem;
        lost = true;
      }
    });
    if (lost) addLog(draft, 'alerta', 'ARMAZÉM CHEIO - recursos excedentes foram perdidos.');

    // 10. Fim do dia
    draft.dia++;
    if (draft.npcs.filter(n => n.vivo).length === 0) {
      draft.gameOver = true;
      addLog(draft, 'morte', 'TODOS OS SOBREVIVENTES PERECERAM.');
    }

    return draft;
  };

  // Functional setState so the interval never captures stale state
  const advanceDay = () => {
    setState(prev => {
      if (!prev || prev.gameOver || prev.vitoria) return prev;
      const next = processDay(JSON.parse(JSON.stringify(prev)));
      next.lastTimestamp = Date.now();
      localStorage.setItem('torre_obscura_save', JSON.stringify(next));
      return next;
    });
  };

  const gameEndedRef = useRef(false);
  useEffect(() => {
    if (!state) return;
    gameEndedRef.current = state.gameOver || state.vitoria;
  }, [state?.gameOver, state?.vitoria]);

  useEffect(() => {
    if (!state) return;
    if (state.gameOver || state.vitoria) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const ms = getMsPerDay(state.velocidade);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!gameEndedRef.current) advanceDay();
    }, ms);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state?.velocidade, state?.gameOver, state?.vitoria]);

  const startNewGame = () => saveState(createInitialState());

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
    // Migração de saves antigos: garante o campo posto em todos os NPCs
    parsed.npcs.forEach(n => { if (n.posto === undefined) n.posto = null; });
    // Normalize derived fields from buildings (keeps old saves' capacity in sync)
    parsed.recursos.capacidadeArmazem = getEfeitos(parsed.edificios, parsed.npcs).capacidadeArmazem;
    const msPerDay = getMsPerDay(parsed.velocidade);
    let missed = Math.min(40, Math.floor((Date.now() - parsed.lastTimestamp) / msPerDay));
    if (missed > 0) {
      for (let i = 0; i < missed; i++) {
        parsed = processDay(parsed);
        if (parsed.gameOver || parsed.vitoria) break;
      }
      parsed.log.unshift({ id: crypto.randomUUID(), tipo: 'info', mensagem: `O tempo passou... (${missed} dias)`, dia: parsed.dia });
    }
    saveState(parsed);
  };

  const setSpeed = (speed: 1 | 2 | 5) => {
    if (!state) return;
    saveState({ ...state, velocidade: speed });
  };

  const buildEdificio = (tipo: EdificioTipo) => {
    if (!state) return;
    const def = BUILDINGS[tipo];
    if (!def) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const existente = s.edificios.find(e => e.tipo === tipo);
    const nivelAtual = existente?.nivel ?? 0;
    if (nivelAtual >= def.maxNivel) return;
    const proximo = nivelAtual + 1;
    const cost = def.niveis[proximo - 1].custo;
    if ((cost.madeira ?? 0) > s.recursos.madeira) return;
    if ((cost.pedra   ?? 0) > s.recursos.pedra)   return;
    if ((cost.ferro   ?? 0) > s.recursos.ferro)   return;
    if (cost.madeira) s.recursos.madeira -= cost.madeira;
    if (cost.pedra)   s.recursos.pedra   -= cost.pedra;
    if (cost.ferro)   s.recursos.ferro   -= cost.ferro;
    if (existente) existente.nivel = proximo;
    else s.edificios.push({ tipo, nivel: proximo });
    // Keep storage capacity in sync immediately after building
    s.recursos.capacidadeArmazem = getEfeitos(s.edificios).capacidadeArmazem;
    const acao = nivelAtual === 0 ? 'construído' : `melhorado (Nvl ${proximo})`;
    addLog(s, 'info', `${def.nome.toUpperCase()} ${acao}.`);
    saveState(s);
  };

  const sendExpedition = (npcIds: string[]) => {
    if (!state || npcIds.length === 0) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const floorData = FLOORS[s.andarAtual - 1];
    if (!floorData) return;
    const group = s.npcs.filter(n => npcIds.includes(n.id));
    if (group.length === 0) return;
    if (group.some(n => !n.vivo || n.fadiga >= 90 || n.emExpedicao)) return;
    const cost = calcCustoExpedicao(npcIds.length, floorData.tier);
    if (s.recursos.comida < cost) return;
    s.recursos.comida -= cost;

    // Power uses calcNpcPower (skill bonuses) + Quartel bonus
    const ef = getEfeitos(s.edificios, s.npcs);
    const cap = ef.capacidadeArmazem;
    s.recursos.capacidadeArmazem = cap;
    const basePower = group.reduce((sum, n) => sum + calcNpcPower(n), 0);
    const groupPower = basePower * (1 + ef.poderBonus);
    const isVictory = groupPower >= floorData.difficulty;

    if (isVictory) {
      const r = calcRecompensaAndar(floorData.floor, floorData.tier);
      // Batedores no grupo aumentam o loot (+15% por batedor)
      const batedores = group.filter(n => getProfissao(n) === 'batedor').length;
      const lootMult = 1 + batedores * 0.15;
      const comidaG = Math.round(r.comida * lootMult);
      const madeiraG = Math.round(r.madeira * lootMult);
      const pedraG = Math.round(r.pedra * lootMult);
      const ferroG = r.ferro ? Math.round(r.ferro * lootMult) : 0;
      // Tower loot is banked into the warehouse, clamped to its capacity
      s.recursos.comida  = Math.min(cap, s.recursos.comida  + comidaG);
      s.recursos.madeira = Math.min(cap, s.recursos.madeira + madeiraG);
      s.recursos.pedra   = Math.min(cap, s.recursos.pedra   + pedraG);
      if (ferroG) s.recursos.ferro = Math.min(cap, s.recursos.ferro + ferroG);
      s.andarAtual++;
      group.forEach(n => { n.lealdade = Math.min(100, n.lealdade + 3); });
      addLog(s, 'vitoria', `ANDAR ${floorData.floor} CONQUISTADO. +${madeiraG} madeira, +${pedraG} pedra${ferroG ? `, +${ferroG} ferro` : ''}, +${comidaG} comida.${batedores ? ` (Batedores +${Math.round(batedores * 15)}% loot)` : ''}`);
      if (s.andarAtual > 20) s.vitoria = true;

      // Resgate: chance de encontrar um sobrevivente (maior em andares de chefe)
      const popViva = s.npcs.filter(n => n.vivo).length;
      if (popViva < ef.capPopulacao) {
        const chanceResgate = floorData.isBoss ? 0.35 : 0.12;
        if (Math.random() < chanceResgate) {
          const novo = generateNPC(Math.random() < 0.1);
          s.npcs.push(novo);
          addLog(s, 'descoberta', `SOBREVIVENTE RESGATADO no andar ${floorData.floor}: ${novo.nome.toUpperCase()} juntou-se ao grupo.`);
        }
      }
    } else {
      group.forEach(n => { n.lealdade -= 5; n.sanidade -= 5; });
      const falta = Math.ceil(floorData.difficulty - groupPower);
      const fatigados = group.filter(n => n.fadiga >= 50).length;
      let motivo = `Poder insuficiente (${groupPower.toFixed(0)}/${floorData.difficulty}, faltaram ${falta}).`;
      if (fatigados > 0) motivo += ` ${fatigados} membro(s) fatigado(s) reduziram o poder.`;
      addLog(s, 'alerta', `FALHA NO ANDAR ${floorData.floor} — ${motivo}`);
    }

    // Mortality per NPC
    group.forEach(n => {
      let mort = floorData.mortality;
      if (isVictory && groupPower > floorData.difficulty) {
        const red = Math.min(((groupPower - floorData.difficulty) / floorData.difficulty) * 50, 80);
        mort = mort * (1 - red / 100);
      }
      if (Math.random() * 100 < mort) {
        n.vivo = false;
        n.emExpedicao = false;
        n.posto = null;
        s.moral -= 5;
        s.npcs.filter(x => x.vivo && x.id !== n.id).forEach(x => { x.sanidade -= 3; });
        addLog(s, 'morte', `${n.nome.toUpperCase()} CAIU NO ANDAR ${floorData.floor}.`);
      } else {
        // Veterano (-25%) e Batedor (-20%) sofrem menos fadiga
        let fatigueGain = getRandomInt(20, 35);
        if (n.habilidade === 'veterano') fatigueGain = Math.round(fatigueGain * 0.75);
        if (getProfissao(n) === 'batedor') fatigueGain = Math.round(fatigueGain * 0.8);
        n.fadiga = Math.min(100, n.fadiga + fatigueGain);
        n.emExpedicao = false;
      }
    });

    saveState(s);
  };

  const invocarMorador = () => {
    if (!state) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const popViva = s.npcs.filter(n => n.vivo).length;
    const ef = getEfeitos(s.edificios, s.npcs);
    if (popViva >= ef.capPopulacao) return; // sem espaço no alojamento
    const custo = calcCustoInvocacao(popViva);
    if (s.recursos.comida < custo.comida) return;
    if (s.recursos.madeira < custo.madeira) return;
    if (s.recursos.ferro < custo.ferro) return;
    s.recursos.comida -= custo.comida;
    s.recursos.madeira -= custo.madeira;
    s.recursos.ferro -= custo.ferro;
    const novo = generateNPC(false);
    s.npcs.push(novo);
    addLog(s, 'descoberta', `RITUAL DE INVOCAÇÃO: ${novo.nome.toUpperCase()} respondeu ao chamado do Observador.`);
    saveState(s);
  };

  // Reserva (debita) recursos do armazém para enviar à aliada. A validação e a
  // subtração acontecem ATOMICAMENTE contra o estado mais recente (`prev`), dentro
  // de flushSync, para que o resultado booleano seja confiável mesmo com o loop de
  // dias alterando recursos em paralelo. Retorna false (sem alterar nada) se não
  // houver saldo suficiente. Deve ser chamada ANTES do envio à rede, com estorno
  // em caso de falha — assim nunca há envio remoto sem débito local correspondente.
  const debitarRecursos = (r: Recursos): boolean => {
    let ok = false;
    flushSync(() => {
      setState(prev => {
        if (!prev) return prev;
        const debitado = debitarArmazem(prev.recursos, r);
        if (!debitado) return prev; // saldo insuficiente no estado atual: nada muda
        ok = true;
        const s = JSON.parse(JSON.stringify(prev)) as GameState;
        s.recursos = debitado;
        addLog(s, 'info', `ENVIO À ALIADA: ${resumoRecursos(r, '-')}.`);
        s.lastTimestamp = Date.now();
        localStorage.setItem('torre_obscura_save', JSON.stringify(s));
        return s;
      });
    });
    return ok;
  };

  // Estorna (devolve) recursos ao armazém quando um envio falha na rede após a
  // reserva. Respeita a capacidade (transbordo se perde, caso raro).
  const estornarRecursos = (r: Recursos) => {
    setState(prev => {
      if (!prev) return prev;
      const s = JSON.parse(JSON.stringify(prev)) as GameState;
      const { recursos } = creditarArmazem(s.recursos, r);
      s.recursos = recursos;
      addLog(s, 'alerta', `ENVIO FALHOU - ${resumoRecursos(r, '+')} devolvidos ao armazém.`);
      s.lastTimestamp = Date.now();
      localStorage.setItem('torre_obscura_save', JSON.stringify(s));
      return s;
    });
  };

  // Credita recursos recebidos da aliada, respeitando a capacidade do armazém
  // (excedente se perde, como já ocorre no restante do jogo).
  const creditarRecursos = (r: Recursos, remetente: string) => {
    setState(prev => {
      if (!prev) return prev;
      const s = JSON.parse(JSON.stringify(prev)) as GameState;
      const { recursos, perdeu } = creditarArmazem(s.recursos, r);
      s.recursos = recursos;
      addLog(s, 'descoberta', `RECEBIDO DE ${remetente.toUpperCase()}: ${resumoRecursos(r, '+')}.`);
      if (perdeu) addLog(s, 'alerta', 'ARMAZÉM CHEIO - parte do envio da aliada foi perdida.');
      s.lastTimestamp = Date.now();
      localStorage.setItem('torre_obscura_save', JSON.stringify(s));
      return s;
    });
  };

  const assignPosto = (npcId: string, tipo: EdificioTipo | null) => {
    if (!state) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const npc = s.npcs.find(n => n.id === npcId);
    if (!npc || !npc.vivo || npc.emExpedicao) return;
    if (tipo === null) { npc.posto = null; saveState(s); return; }
    if (!aceitaTrabalho(tipo)) return; // não é um edifício de trabalho
    const ed = s.edificios.find(e => e.tipo === tipo);
    if (!ed || ed.nivel < 1) return; // edifício não construído
    // Slots disponíveis = nível do edifício
    const ocupados = s.npcs.filter(n => n.vivo && n.posto === tipo && n.id !== npcId).length;
    if (ocupados >= ed.nivel) return; // sem vaga
    npc.posto = tipo;
    saveState(s);
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
      sendExpedition,
      invocarMorador,
      assignPosto,
      debitarRecursos,
      estornarRecursos,
      creditarRecursos,
    }}>
      {children}
    </GameContext.Provider>
  );
};
