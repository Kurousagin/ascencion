import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { flushSync } from 'react-dom';
import {
  GameState, NPC, createInitialState, LogEntry, generateNPC, getRandomInt,
  BUILDINGS, getEfeitos, FLOORS, calcNpcPower,
  calcCustoExpedicao, calcRecompensaAndar, calcCustoInvocacao,
  getProfissao, aceitaTrabalho, EdificioTipo, MoradorBase,
  podeEmprestar, debitarArmazem, creditarArmazem,
  RivalCidadela, avancarGuerra, podeGuerrear, calcCustoMobilizacao,
  GUERRA_DURACAO, GUERRA_MIN_TROPA,
  podeTreinarNpc, calcCustoTreinamento, MAX_TREINAMENTOS, recalcRaridade,
} from '../lib/game-data';

interface GameContextType {
  state: GameState;
  hasSave: boolean;
  startNewGame: () => void;
  continueGame: () => void;
  advanceDay: () => void;
  setSpeed: (speed: 1 | 2 | 5) => void;
  buildEdificio: (tipo: EdificioTipo) => void;
  sendExpedition: (npcIds: string[], targetFloor?: number) => void;
  invocarMorador: () => void;
  assignPosto: (npcId: string, tipo: EdificioTipo | null) => void;
  // Aliança: movimentação de recursos no armazém (a rede fica no AllianceContext).
  debitarRecursos: (r: Recursos) => boolean;
  estornarRecursos: (r: Recursos) => void;
  creditarRecursos: (r: Recursos, remetente: string) => void;
  // Aliança: empréstimo de moradores (a rede fica no AllianceContext).
  removerParaEmprestimo: (npcId: string) => NPC | null;   // dono: remove p/ emprestar
  restaurarMorador: (npc: NPC) => void;                    // dono: estorna se a rede falhar
  receberEmprestado: (base: MoradorBase, prazoDias: number, donoNome: string, origemExchangeId: number) => void;
  removerEmprestado: (npcId: string) => void;              // receptora: sai após devolução (empréstimo ou reforço)
  reintegrarMorador: (base: MoradorBase, morreu: boolean) => void; // dono: recebe de volta
  // Aliança: reforço de expedição (fase 3).
  receberReforco: (base: MoradorBase, donoNome: string, origemExchangeId: number) => void; // receptora: adiciona reforço
  // Guerra: declara guerra a uma cidadela-bot, mobilizando a tropa escolhida.
  declararGuerra: (rival: RivalCidadela, tropaIds: string[]) => boolean;
  // Treinamento: aumenta FOR permanentemente no Quartel (requer andar >= 6).
  treinarNpc: (npcId: string) => void;
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
      draft.diasSemComida = 0; // alimentados — zera o contador
    } else {
      draft.recursos.comida = 0;
      draft.diasSemComida = (draft.diasSemComida ?? 0) + 1;

      // Penalidade base (todo dia de fome)
      vivos.forEach(n => { n.sanidade -= 5; n.lealdade -= 3; });

      if (draft.diasSemComida >= 2) {
        // A partir do 2º dia consecutivo: chance crescente de morte por inanição.
        // Fórmula: 5% por dia extra (dia 2 = 5%, dia 3 = 10%, dia 4 = 15%, …, max 50%).
        const chanceBase = Math.min(0.50, (draft.diasSemComida - 1) * 0.05);
        let mortes = 0;
        vivos.forEach(n => {
          if (Math.random() < chanceBase) {
            n.vivo = false;
            n.posto = null;
            n.emExpedicao = false;
            mortes++;
          }
        });
        const diasStr = `${draft.diasSemComida}º dia`;
        if (mortes > 0) {
          addLog(draft, 'morte',
            `INANIÇÃO (${diasStr} sem comida): ${mortes} morador(es) pereceu de fome.`);
        } else {
          addLog(draft, 'alerta',
            `FOME CRÍTICA (${diasStr}): chance de morte ${Math.round(chanceBase * 100)}% por dia. Providencie comida!`);
        }
      } else {
        addLog(draft, 'alerta', 'FOME: Suprimentos insuficientes. Moral e sanidade caindo.');
      }
    }

    // 3. Outros efeitos de edifícios (moral / sanidade)
    draft.moral += ef.moralDia;
    if (ef.sanidadeDia) vivos.forEach(n => { n.sanidade += ef.sanidadeDia; });

    // 4. Recuperação de fadiga (base + enfermaria + curandeiro) — não vale para
    //    quem está mobilizado na guerra (o front acumula fadiga em avancarGuerra).
    vivos.filter(n => !n.emGuerra).forEach(n => {
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

    // 9.5 Guerra em curso: resolve o dia de campanha (suprimento, escaramuça,
    //     baixas, término). Muta o draft e devolve as entradas de log.
    avancarGuerra(draft).forEach(l => addLog(draft, l.tipo, l.mensagem));

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
    // Migração da guerra: defaults para saves anteriores ao sistema de guerra.
    parsed.npcs.forEach(n => { if (n.emGuerra === undefined) n.emGuerra = false; });
    if (parsed.guerra === undefined) parsed.guerra = null;
    if (!parsed.guerrasHistorico) parsed.guerrasHistorico = [];
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

  const sendExpedition = (npcIds: string[], targetFloor?: number) => {
    if (!state || npcIds.length === 0) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;

    // targetFloor permite explorar andares já conquistados (modo farm).
    // Sem targetFloor (ou igual a andarAtual) → modo avançar.
    const isFarming = targetFloor !== undefined && targetFloor < s.andarAtual && targetFloor >= 1;
    const efectiveFloor = isFarming ? targetFloor : s.andarAtual;
    const floorData = FLOORS[efectiveFloor - 1];
    if (!floorData) return;

    const group = s.npcs.filter(n => npcIds.includes(n.id));
    if (group.length === 0) return;
    if (group.some(n => !n.vivo || n.fadiga >= 90 || n.emExpedicao || n.emGuerra)) return;
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
      // Batedores no grupo aumentam o loot (+15% por batedor).
      // Modo farm: loot reduzido a 70% (sem o incentivo de avançar).
      const batedores = group.filter(n => getProfissao(n) === 'batedor').length;
      const lootMult = (isFarming ? 0.7 : 1.0) * (1 + batedores * 0.15);
      const comidaG = Math.round(r.comida * lootMult);
      const madeiraG = Math.round(r.madeira * lootMult);
      const pedraG = Math.round(r.pedra * lootMult);
      const ferroG = r.ferro ? Math.round(r.ferro * lootMult) : 0;
      // Tower loot is banked into the warehouse, clamped to its capacity
      s.recursos.comida  = Math.min(cap, s.recursos.comida  + comidaG);
      s.recursos.madeira = Math.min(cap, s.recursos.madeira + madeiraG);
      s.recursos.pedra   = Math.min(cap, s.recursos.pedra   + pedraG);
      if (ferroG) s.recursos.ferro = Math.min(cap, s.recursos.ferro + ferroG);
      // Só avança o andare em modo avançar.
      if (!isFarming) {
        s.andarAtual++;
        if (s.andarAtual > 20) s.vitoria = true;
      }
      group.forEach(n => { n.lealdade = Math.min(100, n.lealdade + 3); });
      const modoStr = isFarming ? `EXPLORAÇÃO ANDAR ${floorData.floor}` : `ANDAR ${floorData.floor} CONQUISTADO`;
      addLog(s, 'vitoria', `${modoStr}. +${madeiraG} madeira, +${pedraG} pedra${ferroG ? `, +${ferroG} ferro` : ''}, +${comidaG} comida.${batedores ? ` (Batedores +${Math.round(batedores * 15)}% loot)` : ''}${isFarming ? ' (modo exploração — 70% loot)' : ''}`);

      // Resgate: chance de encontrar um sobrevivente (apenas ao avançar, chefes têm mais chance)
      if (!isFarming) {
        const popViva = s.npcs.filter(n => n.vivo).length;
        if (popViva < ef.capPopulacao) {
          const chanceResgate = floorData.isBoss ? 0.35 : 0.12;
          if (Math.random() < chanceResgate) {
            const novo = generateNPC(Math.random() < 0.1);
            s.npcs.push(novo);
            addLog(s, 'descoberta', `SOBREVIVENTE RESGATADO no andar ${floorData.floor}: ${novo.nome.toUpperCase()} juntou-se ao grupo.`);
          }
        }
      }
    } else {
      // Falha: penalidades reduzidas (era -5/-5, agora -3/-3) e loot parcial
      // de 30% do andar — garante algum progresso mesmo travado.
      group.forEach(n => { n.lealdade -= 3; n.sanidade -= 3; });
      const r = calcRecompensaAndar(floorData.floor, floorData.tier);
      const consolaMadeira = Math.round(r.madeira * 0.30);
      const consolaPedra   = Math.round(r.pedra   * 0.30);
      const consolaFerro   = r.ferro ? Math.round(r.ferro * 0.30) : 0;
      const consolaComida  = Math.round(r.comida  * 0.30);
      s.recursos.madeira = Math.min(cap, s.recursos.madeira + consolaMadeira);
      s.recursos.pedra   = Math.min(cap, s.recursos.pedra   + consolaPedra);
      if (consolaFerro) s.recursos.ferro = Math.min(cap, s.recursos.ferro + consolaFerro);
      s.recursos.comida  = Math.min(cap, s.recursos.comida  + consolaComida);
      const falta = Math.ceil(floorData.difficulty - groupPower);
      const fatigados = group.filter(n => n.fadiga >= 50).length;
      let motivo = `Poder insuficiente (${groupPower.toFixed(0)}/${floorData.difficulty}, faltaram ${falta}).`;
      if (fatigados > 0) motivo += ` ${fatigados} membro(s) fatigado(s) reduziram o poder.`;
      const consStr = `Recuperados: +${consolaMadeira} madeira, +${consolaPedra} pedra${consolaFerro ? `, +${consolaFerro} ferro` : ''}, +${consolaComida} comida.`;
      const falhaLabel = isFarming
        ? `EXPLORAÇÃO ANDAR ${floorData.floor} — falha`
        : `FALHA NO ANDAR ${floorData.floor}`;
      addLog(s, 'alerta', `${falhaLabel} — ${motivo} ${consStr}`);
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

    // Reforço: marca sobreviventes como concluídos para retorno automático (fase 3).
    group.forEach(n => { if (n.reforco && n.vivo) n.reforcoConcluido = true; });

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

  // ─── Empréstimo de moradores ────────────────────────────────────────────────
  // Dono: remove o morador do estado ATOMICAMENTE (contra o estado mais recente)
  // e devolve o snapshot removido, para que a rede possa ser chamada em seguida.
  // Retorna null (sem alterar nada) se o morador não existir ou estiver inelegível
  // (morto, em expedição, trabalhando, ou já emprestado). Espelha debitarRecursos.
  const removerParaEmprestimo = (npcId: string): NPC | null => {
    let removido: NPC | null = null;
    flushSync(() => {
      setState(prev => {
        if (!prev) return prev;
        const alvo = prev.npcs.find(n => n.id === npcId);
        if (!alvo || !podeEmprestar(alvo)) return prev; // inelegível: nada muda
        const s = JSON.parse(JSON.stringify(prev)) as GameState;
        removido = s.npcs.find(n => n.id === npcId) ?? null;
        s.npcs = s.npcs.filter(n => n.id !== npcId);
        addLog(s, 'info', `${alvo.nome.toUpperCase()} partiu emprestado para a aliada.`);
        s.lastTimestamp = Date.now();
        localStorage.setItem('torre_obscura_save', JSON.stringify(s));
        return s;
      });
    });
    return removido;
  };

  // Dono: reintegra o morador ao estado quando o envio do empréstimo falha na rede
  // após a remoção. Limpa quaisquer marcadores de empréstimo por segurança.
  const restaurarMorador = (npc: NPC) => {
    setState(prev => {
      if (!prev) return prev;
      const s = JSON.parse(JSON.stringify(prev)) as GameState;
      if (s.npcs.some(n => n.id === npc.id)) return prev; // já presente: evita duplicar
      const limpo: NPC = { ...npc };
      delete limpo.emprestado; delete limpo.emprestadoAte;
      delete limpo.donoNome; delete limpo.origemExchangeId;
      s.npcs.push(limpo);
      addLog(s, 'alerta', `EMPRÉSTIMO FALHOU - ${npc.nome.toUpperCase()} permaneceu na cidadela.`);
      s.lastTimestamp = Date.now();
      localStorage.setItem('torre_obscura_save', JSON.stringify(s));
      return s;
    });
  };

  // Receptora: adiciona o morador emprestado à cidadela, marcado e com prazo de
  // retorno contado nos SEUS dias (dia atual + prazo). Ignora se já estiver presente
  // (recebimento repetido — o servidor também protege via status da troca).
  const receberEmprestado = (
    base: MoradorBase, prazoDias: number, donoNome: string, origemExchangeId: number,
  ) => {
    setState(prev => {
      if (!prev) return prev;
      const s = JSON.parse(JSON.stringify(prev)) as GameState;
      if (s.npcs.some(n => n.id === base.id)) return prev; // já recebido
      const morador: NPC = {
        ...base,
        emExpedicao: false,
        posto: null,
        emprestado: true,
        emprestadoAte: s.dia + Math.max(1, Math.floor(prazoDias)),
        donoNome,
        origemExchangeId,
      };
      s.npcs.push(morador);
      addLog(s, 'descoberta', `${base.nome.toUpperCase()} chegou emprestado de ${donoNome.toUpperCase()} (retorna no dia ${morador.emprestadoAte}).`);
      s.lastTimestamp = Date.now();
      localStorage.setItem('torre_obscura_save', JSON.stringify(s));
      return s;
    });
  };

  // Receptora: remove o morador emprestado/reforço após a devolução ser registrada
  // na rede. Idempotente (ignora se já saiu).
  const removerEmprestado = (npcId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const alvo = prev.npcs.find(n => n.id === npcId);
      if (!alvo || (!alvo.emprestado && !alvo.reforco)) return prev;
      const s = JSON.parse(JSON.stringify(prev)) as GameState;
      s.npcs = s.npcs.filter(n => n.id !== npcId);
      const causa = alvo.vivo
        ? alvo.reforco ? 'retornou após a expedição' : 'retornou ao dono'
        : 'foi devolvido (perdido em expedição)';
      addLog(s, 'info', `${alvo.nome.toUpperCase()} ${causa}.`);
      s.lastTimestamp = Date.now();
      localStorage.setItem('torre_obscura_save', JSON.stringify(s));
      return s;
    });
  };

  // Receptora: adiciona o morador de reforço à cidadela, marcado como reforço e
  // sem prazo por dias (o retorno acontece após a próxima expedição que disputar).
  const receberReforco = (
    base: MoradorBase, donoNome: string, origemExchangeId: number,
  ) => {
    setState(prev => {
      if (!prev) return prev;
      const s = JSON.parse(JSON.stringify(prev)) as GameState;
      if (s.npcs.some(n => n.id === base.id)) return prev; // já recebido
      const morador: NPC = {
        ...base,
        emExpedicao: false,
        posto: null,
        reforco: true,
        reforcoConcluido: false,
        donoNome,
        origemExchangeId,
      };
      s.npcs.push(morador);
      addLog(s, 'descoberta', `${base.nome.toUpperCase()} chegou como REFORÇO de ${donoNome.toUpperCase()} — participa de uma expedição e retorna.`);
      s.lastTimestamp = Date.now();
      localStorage.setItem('torre_obscura_save', JSON.stringify(s));
      return s;
    });
  };

  // Dono: reintegra o morador que voltou do empréstimo com o estado atualizado.
  // Se morreu na aliada, é perdido e apenas registrado no log. Reintegração não
  // respeita o limite de população (é o seu próprio morador voltando para casa).
  const reintegrarMorador = (base: MoradorBase, morreu: boolean) => {
    setState(prev => {
      if (!prev) return prev;
      const s = JSON.parse(JSON.stringify(prev)) as GameState;
      if (morreu) {
        addLog(s, 'morte', `${base.nome.toUpperCase()} MORREU numa expedição da aliada e não retornará.`);
      } else if (s.npcs.some(n => n.id === base.id)) {
        return prev; // já reintegrado (recebimento repetido)
      } else {
        const limpo: NPC = { ...base, emExpedicao: false, posto: null };
        delete (limpo as Partial<NPC>).emprestado;
        delete (limpo as Partial<NPC>).emprestadoAte;
        delete (limpo as Partial<NPC>).donoNome;
        delete (limpo as Partial<NPC>).origemExchangeId;
        s.npcs.push(limpo);
        addLog(s, 'descoberta', `${base.nome.toUpperCase()} retornou do empréstimo, são e salvo.`);
      }
      s.lastTimestamp = Date.now();
      localStorage.setItem('torre_obscura_save', JSON.stringify(s));
      return s;
    });
  };

  // ─── Guerra entre cidadelas ─────────────────────────────────────────────────
  // Declara guerra a uma cidadela-bot: valida a tropa, cobra o custo de mobilização
  // e marca os moradores como emGuerra (indisponíveis até o fim). Retorna false sem
  // alterar nada se já houver guerra, a tropa for inválida ou faltarem recursos.
  const declararGuerra = (rival: RivalCidadela, tropaIds: string[]): boolean => {
    if (!state || state.guerra) return false;
    if (tropaIds.length < GUERRA_MIN_TROPA) return false;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const tropa = s.npcs.filter(n => tropaIds.includes(n.id));
    if (tropa.length !== tropaIds.length) return false;
    if (!tropa.every(podeGuerrear)) return false;
    const custo = calcCustoMobilizacao(tropa.length);
    const debitado = debitarArmazem(s.recursos, custo);
    if (!debitado) return false; // recursos insuficientes: nada muda
    s.recursos = debitado;
    tropa.forEach(n => { n.emGuerra = true; n.posto = null; n.emExpedicao = false; });
    s.guerra = {
      rival,
      rivalIntegridade: 1,
      rivalSuprimento: rival.suprimento,
      tropaIds: [...tropaIds],
      duracao: GUERRA_DURACAO,
      diasDecorridos: 0,
      diaInicio: s.dia,
      momento: 0,
      suprido: true,
      baixasJogador: 0,
      feridosJogador: 0,
      baixasRival: 0,
      ultimoRelato: 'Tropas mobilizadas. A campanha começa.',
    };
    addLog(s, 'evento', `GUERRA DECLARADA contra ${rival.nome.toUpperCase()} — ${tropa.length} combatente(s) marcham ao front (custo: ${custo.comida} comida, ${custo.madeira} madeira, ${custo.ferro} ferro).`);
    saveState(s);
    return true;
  };

  const treinarNpc = (npcId: string) => {
    if (!state) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const npc = s.npcs.find(n => n.id === npcId);
    if (!npc) return;

    const quartelEd = s.edificios.find(e => e.tipo === 'Quartel');
    const quartelNivel = quartelEd?.nivel ?? 0;

    if (!podeTreinarNpc(npc, quartelNivel, s.andarAtual)) return;

    const treinamentos = npc.treinamentos ?? 0;
    const custo = calcCustoTreinamento(treinamentos);
    if (s.recursos.madeira < custo.madeira || s.recursos.ferro < custo.ferro) return;

    // Verifica bônus de aliado: NPC emprestado, vivo, profissão combatente, na cidadela.
    const aliado = s.npcs.find(
      n => n.emprestado && n.vivo && !n.emExpedicao && getProfissao(n) === 'combatente'
    );
    const ganho = aliado ? 2 : 1;

    s.recursos.madeira -= custo.madeira;
    s.recursos.ferro   -= custo.ferro;
    npc.forca += ganho;
    npc.fadiga = Math.min(100, npc.fadiga + 25);
    npc.treinamentos = treinamentos + 1;
    npc.raridade = recalcRaridade(npc);

    const aliadoStr = aliado ? ` (treinamento conjunto com ${aliado.nome} +1 bônus)` : '';
    addLog(s, 'info',
      `${npc.nome.toUpperCase()} TREINOU NO QUARTEL — +${ganho} FOR permanente${aliadoStr}. [${npc.treinamentos}/${MAX_TREINAMENTOS} sessões]`
    );
    saveState(s);
  };

  const assignPosto = (npcId: string, tipo: EdificioTipo | null) => {
    if (!state) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const npc = s.npcs.find(n => n.id === npcId);
    if (!npc || !npc.vivo || npc.emExpedicao || npc.emGuerra) return;
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
      removerParaEmprestimo,
      restaurarMorador,
      receberEmprestado,
      removerEmprestado,
      reintegrarMorador,
      receberReforco,
      declararGuerra,
      treinarNpc,
    }}>
      {children}
    </GameContext.Provider>
  );
};
