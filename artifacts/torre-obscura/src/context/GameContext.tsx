import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { flushSync } from 'react-dom';
import {
  GameState, NPC, Raridade, createInitialState, LogEntry, generateNPC, getRandomInt,
  BUILDINGS, getEfeitos, FLOORS, calcNpcPower,
  calcCustoExpedicao, calcRecompensaAndar, calcBiomaMultiplier, autoExplorar,
  getProfissao, aceitaTrabalho, EdificioTipo, MoradorBase, ProfissaoId, HabilidadeId,
  podeEmprestar, debitarArmazem, creditarArmazem,
  RivalCidadela, GuerraPendente, avancarGuerra, podeGuerrear, calcCustoMobilizacao,
  GUERRA_DURACAO, GUERRA_MIN_TROPA, gerarRivalAgressor, chanceBotWar,
  podeTreinarNpc, podeEstudarNpc, podeEstudarNpcT1, calcCustoTreinamento, calcCustoEstudo, calcCustoEstudoT1,
  MAX_TREINAMENTOS, recalcRaridade, calcInstrutor,
  statTreinamento,
  generateNpcGacha, calcCustoGacha, GACHA_BATCH,
  HABITANTES, BOSS_ECO_LORE, verificarQuestAndar, HabitanteAndar,
  CODEX_FRAGMENTOS, SUSSURROS_POR_CAPITULO, FragmentoCodex,
  idFragmentoHabitante, idFragmentoEco, floorsHabitantesTemporada, capituloDoAndar,
  getRandomHabilidade,
  QuestOculta, gerarQuestOculta, verificarQuestOculta,
  atualizarRecuperacaoPrimordial, PRIMORDIAL_RECUPERACAO_T1,
  MetaDiariaId, hojeStrLocal, gerarObjetivosDoDia, METAS_DIARIAS_META,
  CAMARAS_SECRETAS, verificarRequisitoCamara,
} from '../lib/game-data';
import type { LancamentoTemporada, NpcLancamento } from '../lib/lancamento';
import { LANCAMENTO_ATIVO, LANCAMENTO_T2 } from '../lib/lancamento';
import { getDeviceId } from '../lib/alliance-identity';
import { releaseAllPrimordialClaims } from '../lib/primordial-api';

export interface ExpeditionResult {
  vitoria: boolean;
  isFarming: boolean;
  floor: number;
  poder: number;
  dificuldade: number;
  loot: { comida: number; madeira: number; pedra: number; ferro: number };
  mortos: Array<{ nome: string; profissao: ProfissaoId; habilidade: HabilidadeId; raridade: Raridade }>;
  resgatado: { nome: string; raridade: Raridade } | null;
  habitanteDescoberto?: string;                    // nome do habitante descoberto neste andar
  bossEco?: { titulo: string; texto: string };     // lore do capítulo desbloqueado ao derrotar boss
  sussurro?: FragmentoCodex;                       // sussurro da Torre desbloqueado nesta expedição
  questOculta?: { titulo: string; icone: string }; // câmara oculta descoberta ao explorar
}

interface GameContextType {
  state: GameState;
  hasSave: boolean;
  startNewGame: (lancamento?: LancamentoTemporada) => void;
  startTestGame: (testSave: GameState) => void;
  adicionarNpcLancamento: (npcConfig: NpcLancamento) => void;
  continueGame: () => void;
  advanceDay: () => void;
  setSpeed: (speed: 1 | 2 | 5) => void;
  buildEdificio: (tipo: EdificioTipo) => void;
  sendExpedition: (npcIds: string[], targetFloor?: number) => void;
  invocarGacha: () => NPC[]; // retorna os NPCs gerados (já adicionados ao estado)
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
  // Aliança: reforço de guerra (ajuda aliada em conflito).
  receberReforcoGuerra: (base: MoradorBase, donoNome: string, origemExchangeId: number) => void; // receptora: adiciona reforço de guerra
  // Guerra: declara guerra a uma cidadela-bot (ofensiva) ou responde a uma invasão (defensiva).
  declararGuerra: (rival: RivalCidadela, tropaIds: string[]) => boolean;
  // Responde à invasão pendente mobilizando a tropa escolhida (sem custo — é defesa).
  responderGuerra: (tropaIds: string[]) => boolean;
  // Treinamento: aumenta stat primário permanentemente no Quartel (requer andar >= 6).
  treinarNpc: (npcId: string) => void;
  estudarNpc: (npcId: string) => void;
  // Habitantes da Torre: interação com entidades descobertas nos andares.
  // Aceita quest (descoberto→quest_ativa) ou conclui (quest_ativa→concluido).
  interagirHabitante: (floor: number) => void;
  // Habitantes: resolve a escolha ramificada de uma quest em 'aguardando_escolha'.
  resolverEscolhaHabitante: (floor: number, opcaoId: 'a' | 'b') => void;
  // TODO: Câmaras Secretas: vasculha os destroços de um andar de chefe já conquistado.
  // vasculharCamaraSecreta: (floor: number) => void;
  // Metas Diárias: gera as metas do dia (no-op se já geradas hoje).
  gerarMetasDiarias: (temAliada: boolean) => void;
  // Metas Diárias: registra progresso de uma meta a partir de consumidores externos.
  registrarMetaDiaria: (id: MetaDiariaId) => void;
  // Metas Diárias: reivindica o Presente da Torre (as 3 metas concluídas).
  reivindicarPresenteDaTorre: () => void;
  // Codex Obscuro: marca fragmentos como vistos (limpa badge de notificação).
  abrirCodex: () => void;
  // Quests Ocultas: concluir evento secreto descoberto na Torre.
  concluirQuestOculta: (id: string) => void;
  // Resultado da última expedição (exibido em modal; nulo quando fechado).
  lastExpeditionResult: ExpeditionResult | null;
  clearExpeditionResult: () => void;
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
const MS_PER_GAME_DAY_BASE =  2 * 60 * 60 * 1000;
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
  const [expeditionResult, setExpeditionResult] = useState<ExpeditionResult | null>(null);
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

  // Desbloqueia um fragmento do Codex (idempotente). Retorna true se foi novo.
  const desbloquearFragmento = (s: GameState, id: string): boolean => {
    if (!CODEX_FRAGMENTOS[id]) return false;
    if (s.codexFragmentos.includes(id)) return false;
    s.codexFragmentos.push(id);
    s.codexNovoFragmento = true;
    return true;
  };

  // Registra progresso de uma meta diária no draft (idempotente por dia).
  // Só marca metas que estão nos objetivos de hoje e ainda não concluídas.
  const registrarProgressoMetaDiaria = (draft: GameState, id: MetaDiariaId) => {
    const md = draft.metasDiarias;
    if (!md || md.data !== hojeStrLocal()) return;
    if (!md.objetivos.includes(id)) return;
    if (md.progresso.includes(id)) return;
    md.progresso.push(id);
    addLog(draft, 'info', `META DIÁRIA CUMPRIDA — ${METAS_DIARIAS_META[id].titulo}. (${md.progresso.length}/${md.objetivos.length})`);
  };

  // Bloco compartilhado de "finalizar quest de habitante" — extraído para não
  // duplicar entre o fluxo direto (interagirHabitante) e o de escolha
  // (resolverEscolhaHabitante). Ativa eco, empurra lore, desbloqueia fragmentos
  // e checa as Verdades da Temporada + quest oculta de velocidade.
  const finalizarQuestHabitante = (s: GameState, floor: number, hab: HabitanteAndar) => {
    if (!s.ecos.includes(floor)) s.ecos.push(floor);
    s.lores.push({ floor, titulo: `${hab.nome} — Andar ${floor}`, texto: hab.quest.lore });
    s.habitantesEstado[floor] = 'concluido';
    const habFragId = idFragmentoHabitante(floor);
    if (habFragId) desbloquearFragmento(s, habFragId);
    const todosFloors = floorsHabitantesTemporada(1);
    if (todosFloors.every(f => s.habitantesEstado[f] === 'concluido')) {
      if (desbloquearFragmento(s, 'verdade_t1')) {
        addLog(s, 'descoberta', 'A VERDADE DA TEMPORADA I DESBLOQUEADA — todos os habitantes responderam ao chamado. Acesse o Codex Obscuro.');
      }
      desbloquearFragmento(s, 'pioneers_fragment');
    }
    const todosFloorsT2 = floorsHabitantesTemporada(2);
    if (todosFloorsT2.length > 0 && todosFloorsT2.every(f => s.habitantesEstado[f] === 'concluido')) {
      if (desbloquearFragmento(s, 'verdade_t2')) {
        addLog(s, 'descoberta', 'A VERDADE DA TEMPORADA II DESBLOQUEADA — o Intervalo revelou o que sempre esteve antes. Acesse o Codex Obscuro.');
      }
    }
    const hoje = s.dia;
    const recentes = (s.questsConcluidasDias ?? []).filter(d => hoje - d < 5);
    s.questsConcluidasDias = [...recentes, hoje];
    if (recentes.length >= 2 && Math.random() < 0.35) {
      const nova = gerarQuestOculta('velocidade', undefined, s);
      if (nova) {
        s.questsOcultas = [...(s.questsOcultas ?? []), nova];
        addLog(s, 'descoberta', `VISÃO DA TORRE — "${nova.titulo}": algo quer falar com você. Verifique a lista de andares conquistados.`);
      }
    }
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
          // NPCs de lançamento são imunes à morte por inanição.
          if (n.lancamento) return;
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

    // 2.5 Superlotação — penalidades quando moradores próprios excedem capPopulacao.
    // Moradores emprestados e reforços de aliança não contam contra o limite (são hóspedes).
    const vivosProprios = vivos.filter(n => !n.emprestado && !n.reforco);
    const excedente = Math.max(0, vivosProprios.length - ef.capPopulacao);
    if (excedente > 0) {
      // Extra consumo de comida: 1,5 por excedente/dia (além do consumo normal)
      const extraComida = excedente * 1.5;
      draft.recursos.comida = Math.max(0, draft.recursos.comida - extraComida);

      // Decaimento de moral: -1 por NPC excedente, máx -5/dia
      draft.moral -= Math.min(5, excedente);

      // Decaimento de sanidade e lealdade: condições precárias afetam todos
      const sanPenalty  = Math.min(6, excedente * 2); // 1 exc = -2, 3 = -6
      const lealPenalty = Math.min(4, excedente);     // 1 exc = -1, 4+ = -4
      vivos.forEach(n => { n.sanidade -= sanPenalty; n.lealdade -= lealPenalty; });

      // Fadiga: superlotação reduz a recuperação diária em step 4 (via `excedente`).
      // Não adicionamos fadiga aqui para não ser cancelado imediatamente pela recovery.

      // Log diário — nível de gravidade cresce com excedente
      if (excedente >= 4) {
        addLog(draft, 'alerta',
          `SUPERLOTAÇÃO SEVERA (+${excedente}): -${sanPenalty} Sanidade, -${lealPenalty} Lealdade, -${Math.min(5, excedente)} Moral. Construa Alojamento urgente!`);
      } else if (excedente >= 2) {
        addLog(draft, 'alerta',
          `SUPERLOTAÇÃO CRÍTICA (+${excedente}): condições precárias corroem sanidade e lealdade.`);
      } else {
        addLog(draft, 'alerta',
          `SUPERLOTAÇÃO (+${excedente}): espaço insuficiente. Amplie o Alojamento.`);
      }
    }

    // 3. Outros efeitos de edifícios (moral / sanidade)
    // Edifícios contribuem, mas limitados a +2/dia — múltiplos edifícios não devem
    // cancelar o decaimento natural indefinidamente.
    draft.moral += Math.min(2, ef.moralDia);
    if (ef.sanidadeDia) vivos.forEach(n => { n.sanidade += ef.sanidadeDia; });

    // 3.5 Decaimento natural da moral — A Torre corrói tudo. Acima de 80 decai mais
    // rápido (estado de euforia insustentável). A moral exige atenção constante.
    draft.moral -= draft.moral >= 80 ? 2 : 1;

    // 4. Recuperação de fadiga (base + enfermaria + curandeiro) — não vale para
    //    quem está mobilizado na guerra (o front acumula fadiga em avancarGuerra).
    // Superlotação reduz a recuperação: cada NPC excedente corta 4 pontos de rec.
    // (excedente=1 → -4 rec, excedente=3 → rec zerada, excedente≥3+ sem recuperação)
    vivos.filter(n => !n.emGuerra).forEach(n => {
      let rec = 10 + ef.fadigaRec;
      if (n.habilidade === 'curandeiro') rec += 15;
      if (excedente > 0) rec = Math.max(0, rec - excedente * 4);
      n.fadiga = Math.max(0, n.fadiga - rec);
    });

    // 4. Habilidades passivas diárias
    vivos.forEach(n => {
      if (n.habilidade === 'berserker') n.lealdade = Math.max(0, n.lealdade - 1);
      if (n.habilidade === 'oraculo')   n.sanidade  = Math.min(100, n.sanidade + 5);
    });

    // 5. Variação de moral/lealdade por estado geral
    // Bônus de lealdade só em moral alta (>70) e reduzido — recompensa manutenção.
    if (draft.moral > 70) vivos.forEach(n => { n.lealdade = Math.min(100, n.lealdade + 0.2); });
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

    // 7. Eventos aleatórios (15% por dia) — mais negativos, moral mais difícil
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
        () => { draft.moral -= 5; addLog(draft, 'evento', 'Tensão interna: -5 Moral.'); },
        () => { draft.moral -= 10; vivosCopy.forEach(n => { n.sanidade -= 2; }); addLog(draft, 'evento', 'Eco maldito da Torre: -10 Moral, -2 Sanidade.'); },
        () => { draft.moral += 2; addLog(draft, 'evento', 'Visão favorável: +2 Moral.'); },
      ];
      eventos[getRandomInt(0, eventos.length - 1)]();
    }

    // 7.5 Exploração autônoma: NPCs de combate ociosos e descansados exploram
    //     o último andar conquistado sem intervenção do jogador. Taxa 30% para
    //     não drenar comida/fadiga excessivamente em modo passivo.
    if (!draft.guerra && !draft.guerraPendente && Math.random() < 0.30) {
      autoExplorar(draft).forEach(l => addLog(draft, l.tipo, l.mensagem));
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

    // 9.6 Invasão pendente: decrementa o prazo de resposta.
    //     Se expirar sem resposta → auto-defesa (todos os aptos marcham) ou
    //     derrota imediata por saque se ninguém estiver disponível.
    if (draft.guerraPendente && !draft.guerra) {
      draft.guerraPendente.prazoResposta--;
      if (draft.guerraPendente.prazoResposta <= 0) {
        const rival = draft.guerraPendente.rival;
        const disponiveis = draft.npcs.filter(n => podeGuerrear(n));
        if (disponiveis.length === 0) {
          // Sem defesa: saque imediato, guerra registrada como derrota.
          const frac = 0.25;
          const perda = {
            comida:  Math.floor(draft.recursos.comida  * frac),
            madeira: Math.floor(draft.recursos.madeira * frac),
            pedra:   Math.floor(draft.recursos.pedra   * frac),
            ferro:   Math.floor(draft.recursos.ferro   * frac),
          };
          draft.recursos.comida  = Math.max(0, draft.recursos.comida  - perda.comida);
          draft.recursos.madeira = Math.max(0, draft.recursos.madeira - perda.madeira);
          draft.recursos.pedra   = Math.max(0, draft.recursos.pedra   - perda.pedra);
          draft.recursos.ferro   = Math.max(0, draft.recursos.ferro   - perda.ferro);
          draft.moral = Math.max(0, draft.moral - 20);
          addLog(draft, 'alerta', `SAQUE DE ${rival.nome.toUpperCase()} — Sem defesa, perdeu ${perda.comida} comida, ${perda.madeira} madeira, ${perda.pedra} pedra, ${perda.ferro} ferro.`);
          draft.guerrasHistorico.unshift({
            id: crypto.randomUUID(),
            rivalNome: rival.nome,
            resultado: 'derrota',
            diaInicio: draft.guerraPendente.diaDeclarado,
            diaFim: draft.dia,
            duracaoDias: 0,
            baixasJogador: 0,
            baixasRival: 0,
            espolio: { comida: -perda.comida, madeira: -perda.madeira, pedra: -perda.pedra, ferro: -perda.ferro },
          });
        } else {
          // Auto-defesa: todos os disponíveis marcham sem custo de mobilização.
          disponiveis.forEach(n => { n.emGuerra = true; n.posto = null; n.emExpedicao = false; });
          draft.guerra = {
            rival,
            rivalIntegridade: 1,
            rivalSuprimento: rival.suprimento,
            tropaIds: disponiveis.map(n => n.id),
            duracao: GUERRA_DURACAO,
            diasDecorridos: 0,
            diaInicio: draft.dia,
            momento: 0,
            suprido: true,
            baixasJogador: 0,
            feridosJogador: 0,
            baixasRival: 0,
            ultimoRelato: `Auto-defesa: ${disponiveis.length} defensor(es) mobilizados às pressas.`,
          };
          addLog(draft, 'evento', `INVASÃO DE ${rival.nome.toUpperCase()} — Defesa automática: ${disponiveis.length} combatente(s) marcharam ao front sem mobilização prévia.`);
        }
        draft.guerraPendente = null;
      }
    }

    // 9.7 Probabilidade de nova invasão declarada por bot rival.
    if (!draft.guerra && !draft.guerraPendente) {
      const chance = chanceBotWar(draft);
      if (chance > 0 && Math.random() < chance) {
        const rival = gerarRivalAgressor(draft);
        draft.guerraPendente = { rival, prazoResposta: 3, diaDeclarado: draft.dia };
        addLog(draft, 'evento', `INVASÃO IMINENTE: ${rival.nome.toUpperCase()} marchou em direção à sua cidadela! Você tem 3 dias para mobilizar defesa — acesse a aba GUERRA.`);
      }
    }

    // 9.8 Habitantes da Torre — temporal+semGuerra: reset do contador quando em guerra.
    // Se uma quest do tipo temporal com semGuerra=true está ativa e há guerra em curso,
    // o contador é reiniciado para hoje (o jogador precisará sobreviver os dias exigidos
    // sem guerra a partir deste dia, não contando o período de guerra).
    if (draft.guerra || draft.guerraPendente) {
      Object.entries(draft.habitantesEstado).forEach(([floorStr, est]) => {
        if (est !== 'quest_ativa') return;
        const fl = Number(floorStr);
        const hab = HABITANTES[fl];
        if (hab?.quest.tipo === 'temporal' && hab.quest.semGuerra) {
          // Registra o dia atual como novo "dia zero" para o contador de paz.
          if (!draft.habitantesQuestResetDia) draft.habitantesQuestResetDia = {};
          draft.habitantesQuestResetDia[fl] = draft.dia;
        }
      });
    }

    // 10. Recuperação primordial — verifica se Valdris (ou outro primordial) sobe de nível
    {
      const rec = atualizarRecuperacaoPrimordial(draft.npcs, draft.codexFragmentos);
      if (rec.atualizado) {
        const primordial = draft.npcs.find(n => n.lancamento && n.vivo && !n.emprestado && !n.reforco);
        const nivel = PRIMORDIAL_RECUPERACAO_T1[rec.novoNivel - 1];
        if (primordial && nivel) {
          const b = nivel.bonus;
          const partes = [
            b.forca       > 0 ? `+${b.forca} FOR` : '',
            b.agilidade   > 0 ? `+${b.agilidade} AGI` : '',
            b.inteligencia > 0 ? `+${b.inteligencia} INT` : '',
            b.resistencia > 0 ? `+${b.resistencia} RES` : '',
          ].filter(Boolean).join(' · ');
          addLog(draft, 'descoberta',
            `${primordial.nome.toUpperCase()} SE LEMBRA — Nível ${rec.novoNivel}/${PRIMORDIAL_RECUPERACAO_T1.length}: ${nivel.logMsgCurta} (${partes})`
          );
        }
      }
    }

    // 11. Fim do dia
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

  const startNewGame = (lancamento?: LancamentoTemporada) => {
    // Libera o claim global do primordial para que outro jogador possa recebê-lo.
    // Verifica o state em memória (caminho GameOver) ou o save no localStorage
    // (caminho TitleScreen — state ainda é null quando o app foi fechado e reaberto).
    const temPrimordialEmMemoria = state?.npcs.some(n => n.lancamento) ?? false;
    let temPrimordialNoSave = false;
    if (!temPrimordialEmMemoria) {
      try {
        const saved = localStorage.getItem('torre_obscura_save');
        if (saved) {
          const parsed = JSON.parse(saved) as { npcs?: Array<{ lancamento?: boolean }> };
          temPrimordialNoSave = parsed.npcs?.some(n => n.lancamento) ?? false;
        }
      } catch { /* save corrompido — ignora */ }
    }
    if (temPrimordialEmMemoria || temPrimordialNoSave) {
      void releaseAllPrimordialClaims(getDeviceId());
    }
    const s = createInitialState();
    if (lancamento) {
      // O NPC especial é adicionado DEPOIS via adicionarNpcLancamento (gacha de lançamento).
      // Aqui apenas aplicamos bônus de recursos e moral.
      const cap = s.recursos.capacidadeArmazem;
      s.recursos.comida   = Math.min(cap, s.recursos.comida   + (lancamento.bonusRecursos.comida   ?? 0));
      s.recursos.madeira  = Math.min(cap, s.recursos.madeira  + (lancamento.bonusRecursos.madeira  ?? 0));
      s.recursos.pedra    = Math.min(cap, s.recursos.pedra    + (lancamento.bonusRecursos.pedra    ?? 0));
      s.recursos.ferro    = Math.min(cap, s.recursos.ferro    + (lancamento.bonusRecursos.ferro    ?? 0));
      if (lancamento.bonusMoral) s.moral = Math.min(100, s.moral + lancamento.bonusMoral);
      lancamento.logsBoas.forEach(msg => {
        s.log.unshift({ id: crypto.randomUUID(), tipo: 'descoberta', mensagem: msg, dia: 1 });
      });
    }
    saveState(s);
  };

  const startTestGame = (testSave: GameState) => {
    // Carrega cidadela de teste pré-populada para desenvolvimento/QA.
    // Não libera primordials (test save não usa sistema de lançamento).
    console.log('[startTestGame] Loading test save:', { dia: testSave.dia, andar: testSave.andarAtual });
    // saveState já chama setState internamente
    saveState(testSave);
    console.log('[startTestGame] Test save loaded, state should be updated');
  };

  // Adiciona o NPC sorteado no gacha de lançamento ao estado do jogo.
  // Chamado pelo GachaLancamento após o jogador confirmar o resultado.
  const adicionarNpcLancamento = (npcConfig: NpcLancamento) => {
    if (!state) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const npc: NPC = {
      id:           crypto.randomUUID(),
      nome:         npcConfig.nome,
      forca:        npcConfig.forca,
      agilidade:    npcConfig.agilidade,
      inteligencia: npcConfig.inteligencia,
      resistencia:  npcConfig.resistencia,
      sanidade:     100,
      lealdade:     100,
      fadiga:       0,
      vivo:         true,
      obscuro:      false,
      emExpedicao:  false,
      raridade:     npcConfig.divino ? 'Divino' : npcConfig.primordial ? 'Lendário' : npcConfig.vestigio ? 'Épico' : 'Raro',
      habilidade:   npcConfig.habilidade,
      posto:        null,
      lancamento:   npcConfig.primordial ?? false,
      vestigio:     npcConfig.vestigio ?? false,
      passivaId:    npcConfig.passivaId,
    };
    s.npcs.push(npc);
    addLog(s, 'descoberta', `${npcConfig.nome.toUpperCase()} une-se à sua cidadela.`);
    saveState(s);
  };

  const continueGame = () => {
    const saved = localStorage.getItem('torre_obscura_save');
    if (!saved) return;
    let parsed: GameState;
    try {
      parsed = JSON.parse(saved) as GameState;
      console.log('[continueGame] Loaded from storage:', { dia: parsed.dia, andar: parsed.andarAtual });
      setState(parsed);
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
    if (parsed.guerraPendente === undefined) parsed.guerraPendente = null;
    if (!parsed.guerrasHistorico) parsed.guerrasHistorico = [];
    // Migração: sistema de Habitantes da Torre.
    if (!parsed.habitantesEstado)        parsed.habitantesEstado = {};
    if (!parsed.habitantesDiaDescoberta) parsed.habitantesDiaDescoberta = {};
    if (!parsed.habitantesQuestResetDia) parsed.habitantesQuestResetDia = {};
    if (!parsed.ecos)                    parsed.ecos = [];
    if (!parsed.ecosCapitulo)            parsed.ecosCapitulo = [];
    if (!parsed.lores)                   parsed.lores = [];
    // Migração: Codex Obscuro — converte ecos/ecosCapitulo existentes para IDs.
    if (!parsed.codexFragmentos) {
      parsed.codexFragmentos = [];
      // Andares com eco ativo = habitante concluído → fragmento hab_X desbloqueado.
      parsed.ecos.forEach(floor => {
        const id = idFragmentoHabitante(floor);
        if (id && !parsed.codexFragmentos.includes(id)) parsed.codexFragmentos.push(id);
      });
      // Tiers com eco de boss desbloqueado → fragmento eco_X desbloqueado.
      parsed.ecosCapitulo.forEach(tier => {
        const id = idFragmentoEco(tier);
        if (id && !parsed.codexFragmentos.includes(id)) parsed.codexFragmentos.push(id);
      });
    }
    if (parsed.codexNovoFragmento === undefined) parsed.codexNovoFragmento = false;
    // Migração: escolhas dos habitantes, câmaras secretas e metas diárias.
    if (!parsed.habitantesEscolhaFeita)  parsed.habitantesEscolhaFeita = {};
    if (!parsed.camarasSecretasEstado)   parsed.camarasSecretasEstado = {};
    if (!parsed.farmsPorAndarEClasse)    parsed.farmsPorAndarEClasse = {};
    if (!parsed.totalMortesAndar)        parsed.totalMortesAndar = {};
    if (!parsed.metasDiarias) parsed.metasDiarias = { data: '', objetivos: [], progresso: [], recompensaColetada: false };
    // Migração: campo lancamento nos NPCs (saves anteriores não têm)
    parsed.npcs.forEach(n => { if (n.lancamento === undefined) n.lancamento = false; });
    // Migração: campo primordialNivel + normalização de stats base canônicos.
    // Saves antigos guardam os stats originais (ex.: Valdris 15/12/11/15). Ao detectar
    // um primordial sem primordialNivel, reseta seus stats para os valores canônicos
    // atuais (definidos em lancamento.ts) e zera primordialNivel — o próximo processDay
    // aplicará os bônus de recuperação correspondentes ao número de fragmentos já obtidos.
    {
      const todosLancamentos = [LANCAMENTO_ATIVO, LANCAMENTO_T2].filter(Boolean) as import('../lib/lancamento').LancamentoTemporada[];
      parsed.npcs.forEach(n => {
        if (!n.lancamento) return;
        if (n.primordialNivel !== undefined) return; // já migrado
        // Encontrar dados canônicos pelo nome do NPC
        let base: import('../lib/lancamento').NpcLancamento | undefined;
        for (const lanc of todosLancamentos) {
          if (lanc.primordial.nome === n.nome) { base = lanc.primordial; break; }
        }
        if (base) {
          n.forca       = base.forca;
          n.agilidade   = base.agilidade;
          n.inteligencia = base.inteligencia;
          n.resistencia = base.resistencia;
          // Normaliza raridade: saves antigos tinham 'Épico'; primordiais são Lendários
          n.raridade = base.divino ? 'Divino' : 'Lendário';
        }
        n.primordialNivel = 0;
      });
    }
    // Migração independente de raridade: normaliza TODOS os primordiais para Lendário/Divino,
    // independente do estado de primordialNivel (cobre saves já migrados que ainda têm 'Épico').
    {
      const todosLancamentosRar = [LANCAMENTO_ATIVO, LANCAMENTO_T2].filter(Boolean) as import('../lib/lancamento').LancamentoTemporada[];
      parsed.npcs.forEach(n => {
        if (!n.lancamento) return;
        if (n.raridade === 'Lendário' || n.raridade === 'Divino') return; // já normalizado
        let base: import('../lib/lancamento').NpcLancamento | undefined;
        for (const lanc of todosLancamentosRar) {
          if (lanc.primordial.nome === n.nome) { base = lanc.primordial; break; }
        }
        n.raridade = (base?.divino) ? 'Divino' : 'Lendário';
      });
    }
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
    // Meta diária: obra concluída.
    registrarProgressoMetaDiaria(s, 'construir');
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
    if (group.some(n => !n.vivo || n.fadiga >= 90 || n.emExpedicao || n.emGuerra || (n.reforcoGuerra && !n.reforcoGuerraConcluido))) return;
    const cost = calcCustoExpedicao(npcIds.length, floorData.tier);
    if (s.recursos.comida < cost) return;
    s.recursos.comida -= cost;

    // Meta diária: expedição enviada (conta a tentativa, não exige vitória).
    registrarProgressoMetaDiaria(s, 'explorar');

    // Power uses calcNpcPower (skill bonuses) + Quartel bonus
    const ef = getEfeitos(s.edificios, s.npcs);
    const cap = ef.capacidadeArmazem;
    s.recursos.capacidadeArmazem = cap;
    const basePower = group.reduce((sum, n) => sum + calcNpcPower(n), 0);
    // O bioma afeta o poder efetivo do grupo: profissão certa = +30%, errada = -20%.
    const biomaMultiplier = calcBiomaMultiplier(group, floorData.bioma);
    const groupPower = basePower * (1 + ef.poderBonus) * biomaMultiplier;
    const isVictory = groupPower >= floorData.difficulty;

    // Passivas de vestígios ativas nesta expedição (escopo de sendExpedition inteiro)
    const hasVeterano = group.some(n => n.passivaId === 'veterano_das_profundezas');
    const hasLeitura  = group.some(n => n.passivaId === 'leitura_da_torre');
    const hasRastro   = group.some(n => n.passivaId === 'rastro_vivo');

    if (isVictory) {
      const r = calcRecompensaAndar(floorData.floor, floorData.bioma);
      // Batedores no grupo aumentam o loot (+15% por batedor).
      // Modo farm: loot reduzido a 70% (sem o incentivo de avançar).
      // Eco ativo no andar: aplica bônus percentual sobre o loot base.
      const batedores = group.filter(n => getProfissao(n) === 'batedor').length;
      const ecoBonus = s.ecos.includes(floorData.floor)
        ? (HABITANTES[floorData.floor]?.quest.ecoBonus ?? 0) / 100
        : 0;
      const lootMult = (isFarming ? 0.7 : 1.0) * (1 + batedores * 0.15) * (1 + ecoBonus) * (hasLeitura ? 1.20 : 1.0);
      const comidaG = Math.round(r.comida * lootMult);
      const madeiraG = Math.round(r.madeira * lootMult);
      const pedraG = Math.round(r.pedra * lootMult);
      const ferroG = r.ferro ? Math.round(r.ferro * lootMult) : 0;
      // Tower loot is banked into the warehouse, clamped to its capacity
      s.recursos.comida  = Math.min(cap, s.recursos.comida  + comidaG);
      s.recursos.madeira = Math.min(cap, s.recursos.madeira + madeiraG);
      s.recursos.pedra   = Math.min(cap, s.recursos.pedra   + pedraG);
      if (ferroG) s.recursos.ferro = Math.min(cap, s.recursos.ferro + ferroG);
      // Só avança o andar em modo avançar.
      if (!isFarming) {
        s.andarAtual++;
        if (s.andarAtual > 40) s.vitoria = true;
      }
      group.forEach(n => { n.lealdade = Math.min(100, n.lealdade + 3); });
      const modoStr = isFarming ? `EXPLORAÇÃO ANDAR ${floorData.floor}` : `ANDAR ${floorData.floor} CONQUISTADO`;
      const biomaStr = biomaMultiplier !== 1.0 ? ` [Bioma ${biomaMultiplier > 1 ? '+30% poder' : '−20% poder'}]` : '';
      const ecoStr     = ecoBonus > 0 ? ` [Eco +${Math.round(ecoBonus * 100)}% loot]` : '';
      const leituraStr = hasLeitura ? ' [Leitura da Torre +20% loot]' : '';
      const veteranoStr = hasVeterano ? ' [Veterano das Profundezas −30% mort.]' : '';
      addLog(s, 'vitoria', `${modoStr}. +${madeiraG} madeira, +${pedraG} pedra${ferroG ? `, +${ferroG} ferro` : ''}, +${comidaG} comida.${batedores ? ` (Batedores +${Math.round(batedores * 15)}% loot)` : ''}${isFarming ? ' (modo exploração — 70% loot)' : ''}${biomaStr}${ecoStr}${leituraStr}${veteranoStr}`);

      // Descoberta de habitante (ao avançar — inclui andares-boss se houver habitante definido)
      let habitanteDescoberto: string | undefined;
      if (!isFarming && HABITANTES[floorData.floor]
          && !s.habitantesEstado[floorData.floor]) {
        s.habitantesEstado[floorData.floor] = 'descoberto';
        s.habitantesDiaDescoberta[floorData.floor] = s.dia;
        const hab = HABITANTES[floorData.floor];
        habitanteDescoberto = hab.nome;
        addLog(s, 'descoberta', `HABITANTE DETECTADO — ${hab.nome} (${hab.papel}) aguarda contato no andar ${floorData.floor}.`);
      }

      // Eco do boss (apenas ao avançar andares-boss)
      let bossEco: { titulo: string; texto: string } | undefined;
      if (!isFarming && floorData.isBoss) {
        const tier = floorData.tier;
        if (!s.ecosCapitulo.includes(tier)) {
          s.ecosCapitulo.push(tier);
          const bossLore = BOSS_ECO_LORE[floorData.floor];
          if (bossLore) {
            bossEco = bossLore;
            s.lores.push({ floor: floorData.floor, titulo: bossLore.titulo, texto: bossLore.texto });
            addLog(s, 'descoberta', `ECO DO CAPÍTULO ${tier} DESBLOQUEADO — ${bossLore.titulo}`);
            // Codex: unlock boss eco fragment
            const ecoId = idFragmentoEco(tier);
            if (ecoId) desbloquearFragmento(s, ecoId);
          }
        }
      }

      // Sussurro da Torre: 15% de chance em qualquer vitória (farm ou avançar).
      // Bônus: +15% se Rastro_Vivo passiva, +8% por nível de Arquivo.
      // Sorteia entre os sussurros do capítulo ainda não desbloqueados.
      let sussurro: FragmentoCodex | undefined;
      {
        const cap = capituloDoAndar(floorData.floor);
        const candidatos = (SUSSURROS_POR_CAPITULO[cap] ?? []).filter(id => !s.codexFragmentos.includes(id));
        const arquivoEd = s.edificios.find(e => e.tipo === 'Arquivo');
        const arquivoBonus = arquivoEd ? arquivoEd.nivel * 0.08 : 0;
        const sussurroChance = 0.15 + (hasRastro ? 0.15 : 0) + arquivoBonus;
        if (candidatos.length > 0 && Math.random() < sussurroChance) {
          const id = candidatos[Math.floor(Math.random() * candidatos.length)];
          desbloquearFragmento(s, id);
          sussurro = CODEX_FRAGMENTOS[id];
          addLog(s, 'descoberta', `SUSSURRO DA TORRE — "${sussurro.titulo}" registrado no Codex.`);
        }
      }

      // Resgate: chance de encontrar um sobrevivente (apenas ao avançar, chefes têm mais chance)
      let resgatado: { nome: string; raridade: Raridade } | null = null;
      if (!isFarming) {
        const popViva = s.npcs.filter(n => n.vivo).length;
        if (popViva < ef.capPopulacao) {
          const chanceResgate = floorData.isBoss ? 0.35 : 0.12;
          if (Math.random() < chanceResgate) {
            const novo = generateNPC(Math.random() < 0.1);
            s.npcs.push(novo);
            resgatado = { nome: novo.nome, raridade: novo.raridade };
            addLog(s, 'descoberta', `SOBREVIVENTE RESGATADO no andar ${floorData.floor}: ${novo.nome.toUpperCase()} juntou-se ao grupo.`);
          }
        }
      }

      // Farm: rastrear exploração e potencialmente revelar câmara oculta
      let novaQuestOculta: { titulo: string; icone: string } | undefined;
      if (isFarming) {
        const farmCount = ((s.farmsPerFloor ?? {})[floorData.floor] ?? 0) + 1;
        s.farmsPerFloor = { ...(s.farmsPerFloor ?? {}), [floorData.floor]: farmCount };
        // A partir da 3ª exploração bem-sucedida do mesmo andar: 20% de chance por vez
        if (farmCount >= 3 && Math.random() < (hasRastro ? 0.40 : 0.20)) {
          const nova = gerarQuestOculta('exploracao', floorData.floor, s);
          if (nova) {
            s.questsOcultas = [...(s.questsOcultas ?? []), nova];
            novaQuestOculta = { titulo: nova.titulo, icone: nova.icone };
            addLog(s, 'descoberta', `CÂMARA OCULTA — "${nova.titulo}" detectada no andar ${floorData.floor}. Verifique a lista de andares conquistados.`);
          }
        }

        // Rastrear farms por classe e andar para requisitos de câmaras secretas
        s.farmsPorAndarEClasse = s.farmsPorAndarEClasse ?? {};
        group.forEach(n => {
          const prof = getProfissao(n) as import('../lib/game-data').ProfissaoId;
          if (prof && s.farmsPorAndarEClasse) {
            if (!s.farmsPorAndarEClasse[floorData.floor]) s.farmsPorAndarEClasse[floorData.floor] = { combatente: 0, batedor: 0, erudito: 0, sentinela: 0 };
            s.farmsPorAndarEClasse[floorData.floor][prof] = (s.farmsPorAndarEClasse[floorData.floor][prof] ?? 0) + 1;
          }
        });
      }

      // Monta resultado para o card pós-expedição (vitória)
      const resultVitoria: ExpeditionResult = {
        vitoria: true, isFarming, floor: floorData.floor,
        poder: groupPower, dificuldade: floorData.difficulty,
        loot: { comida: comidaG, madeira: madeiraG, pedra: pedraG, ferro: ferroG },
        mortos: [], resgatado, habitanteDescoberto, bossEco, sussurro,
        questOculta: novaQuestOculta,
      };

      // Mortality per NPC (vitória)
      group.forEach(n => {
        let mort = floorData.mortality;
        if (groupPower > floorData.difficulty) {
          const red = Math.min(((groupPower - floorData.difficulty) / floorData.difficulty) * 50, 80);
          mort = mort * (1 - red / 100);
        }
        // NPCs de lançamento são quase imortais: chance de morte reduzida a 1/10.
        if (n.lancamento) mort *= 0.1;
        // Passiva: Veterano das Profundezas — −30% mortalidade para mortais do grupo.
        if (hasVeterano && !n.lancamento) mort *= 0.70;
        if (Math.random() * 100 < mort) {
          n.vivo = false; n.emExpedicao = false; n.posto = null;
          s.moral -= 5;
          s.npcs.filter(x => x.vivo && x.id !== n.id).forEach(x => { x.sanidade -= 3; });
          addLog(s, 'morte', `${n.nome.toUpperCase()} CAIU NO ANDAR ${floorData.floor}.`);
          resultVitoria.mortos.push({ nome: n.nome, profissao: getProfissao(n), habilidade: n.habilidade, raridade: n.raridade });
          // Rastrear morte por andar para requisitos de câmaras secretas
          s.totalMortesAndar = s.totalMortesAndar ?? {};
          s.totalMortesAndar[floorData.floor] = (s.totalMortesAndar[floorData.floor] ?? 0) + 1;
        } else {
          let fatigueGain = getRandomInt(28, 45);
          if (n.habilidade === 'veterano') fatigueGain = Math.round(fatigueGain * 0.75);
          if (getProfissao(n) === 'batedor') fatigueGain = Math.round(fatigueGain * 0.8);
          n.fadiga = Math.min(100, n.fadiga + fatigueGain);
          n.emExpedicao = false;
        }
      });
      group.forEach(n => { if (n.reforco && n.vivo) n.reforcoConcluido = true; });

      // Verificar câmaras secretas desbloqueadas
      Object.entries(CAMARAS_SECRETAS).forEach(([camaraId, camara]) => {
        if (!s.camarasSecretasEstado?.[camaraId]?.descoberta && verificarRequisitoCamara(s, camara.requisito)) {
          if (!s.camarasSecretasEstado) s.camarasSecretasEstado = {};
          if (!s.camarasSecretasEstado[camaraId]) s.camarasSecretasEstado[camaraId] = { descoberta: true, tentativas: 0, encontrada: false };
          else s.camarasSecretasEstado[camaraId].descoberta = true;
          addLog(s, 'descoberta', `CÂMARA SECRETA REVELADA — ${camara.titulo} (Andar ${camara.floor}) pode ser explorada!`);
        }
      });

      saveState(s);
      setExpeditionResult(resultVitoria);
    } else {
      // Falha: penalidades reduzidas (era -5/-5, agora -3/-3) e loot parcial
      // de 30% do andar — garante algum progresso mesmo travado.
      group.forEach(n => { n.lealdade -= 3; n.sanidade -= 3; });
      const r = calcRecompensaAndar(floorData.floor, floorData.bioma);
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

      // Monta resultado para o card pós-expedição (falha)
      const resultFalha: ExpeditionResult = {
        vitoria: false, isFarming, floor: floorData.floor,
        poder: groupPower, dificuldade: floorData.difficulty,
        loot: { comida: consolaComida, madeira: consolaMadeira, pedra: consolaPedra, ferro: consolaFerro },
        mortos: [], resgatado: null,
      };

      // Mortality per NPC (falha)
      group.forEach(n => {
        // NPCs de lançamento também têm 1/10 de chance de morte em derrota.
        let mortFalha = n.lancamento ? floorData.mortality * 0.1 : floorData.mortality;
        // Passiva: Veterano das Profundezas — −30% mortalidade para mortais do grupo.
        if (hasVeterano && !n.lancamento) mortFalha *= 0.70;
        if (Math.random() * 100 < mortFalha) {
          n.vivo = false; n.emExpedicao = false; n.posto = null;
          s.moral -= 5;
          s.npcs.filter(x => x.vivo && x.id !== n.id).forEach(x => { x.sanidade -= 3; });
          addLog(s, 'morte', `${n.nome.toUpperCase()} CAIU NO ANDAR ${floorData.floor}.`);
          resultFalha.mortos.push({ nome: n.nome, profissao: getProfissao(n), habilidade: n.habilidade, raridade: n.raridade });
          // Rastrear morte por andar para requisitos de câmaras secretas
          s.totalMortesAndar = s.totalMortesAndar ?? {};
          s.totalMortesAndar[floorData.floor] = (s.totalMortesAndar[floorData.floor] ?? 0) + 1;
        } else {
          let fatigueGain = getRandomInt(28, 45);
          if (n.habilidade === 'veterano') fatigueGain = Math.round(fatigueGain * 0.75);
          if (getProfissao(n) === 'batedor') fatigueGain = Math.round(fatigueGain * 0.8);
          n.fadiga = Math.min(100, n.fadiga + fatigueGain);
          n.emExpedicao = false;
        }
      });
      group.forEach(n => { if (n.reforco && n.vivo) n.reforcoConcluido = true; });
      saveState(s);
      setExpeditionResult(resultFalha);
    }
  };

  const invocarGacha = (): NPC[] => {
    if (!state) return [];
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const popViva = s.npcs.filter(n => n.vivo).length;
    const ef = getEfeitos(s.edificios, s.npcs);
    const slots = ef.capPopulacao - popViva;
    if (slots <= 0) return [];
    const custo = calcCustoGacha(popViva);
    if (s.recursos.comida < custo.comida) return [];
    if (s.recursos.madeira < custo.madeira) return [];
    if (s.recursos.ferro < custo.ferro) return [];
    s.recursos.comida  -= custo.comida;
    s.recursos.madeira -= custo.madeira;
    s.recursos.ferro   -= custo.ferro;
    const batch = Math.min(GACHA_BATCH, slots);
    const novos: NPC[] = [];
    for (let i = 0; i < batch; i++) {
      const npc = generateNpcGacha();
      s.npcs.push(npc);
      novos.push(npc);
    }
    const nomes = novos.map(n => n.nome).join(', ');
    addLog(s, 'descoberta', `RITUAL EM TRINDADE: ${nomes} responderam ao chamado do Observador.`);
    saveState(s);
    return novos;
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

  // Receptor: recebe um morador para lutar na guerra com reforço-de-guerra.
  // Se já há guerra ativa, entra direto no front; senão fica ocioso até a
  // próxima mobilização.
  const receberReforcoGuerra = (
    base: MoradorBase, donoNome: string, origemExchangeId: number,
  ) => {
    setState(prev => {
      if (!prev) return prev;
      const s = JSON.parse(JSON.stringify(prev)) as GameState;
      if (s.npcs.some(n => n.id === base.id)) return prev; // já recebido
      const emGuerraAgora = !!s.guerra;
      const morador: NPC = {
        ...base,
        emExpedicao: false,
        posto: null,
        reforco: true,
        reforcoGuerra: true,
        reforcoConcluido: false,
        reforcoGuerraConcluido: false,
        emGuerra: emGuerraAgora,
        donoNome,
        origemExchangeId,
      };
      s.npcs.push(morador);
      if (emGuerraAgora && s.guerra) {
        s.guerra.tropaIds.push(morador.id);
        addLog(s, 'evento', `${base.nome.toUpperCase()} chegou como REFORÇO DE GUERRA de ${donoNome.toUpperCase()} e já se junta ao front contra ${s.guerra.rival.nome.toUpperCase()}!`);
      } else {
        addLog(s, 'descoberta', `${base.nome.toUpperCase()} chegou como REFORÇO DE GUERRA de ${donoNome.toUpperCase()} — pronto para a próxima mobilização.`);
      }
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

  // Responde à invasão pendente: mobiliza a tropa escolhida SEM custo (defesa forçada).
  const responderGuerra = (tropaIds: string[]): boolean => {
    if (!state || !state.guerraPendente || state.guerra) return false;
    if (tropaIds.length < GUERRA_MIN_TROPA) return false;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const rival = s.guerraPendente!.rival;
    const tropa = s.npcs.filter(n => tropaIds.includes(n.id) && podeGuerrear(n));
    if (tropa.length < GUERRA_MIN_TROPA) return false;
    tropa.forEach(n => { n.emGuerra = true; n.posto = null; n.emExpedicao = false; });
    s.guerra = {
      rival,
      rivalIntegridade: 1,
      rivalSuprimento: rival.suprimento,
      tropaIds: tropa.map(n => n.id),
      duracao: GUERRA_DURACAO,
      diasDecorridos: 0,
      diaInicio: s.dia,
      momento: 0,
      suprido: true,
      baixasJogador: 0,
      feridosJogador: 0,
      baixasRival: 0,
      ultimoRelato: `${tropa.length} defensor(es) posicionados no front.`,
    };
    s.guerraPendente = null;
    addLog(s, 'evento', `DEFESA ORGANIZADA: ${tropa.length} combatente(s) marcharam para defender a cidadela contra ${rival.nome}.`);
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
    const arquivoEd = s.edificios.find(e => e.tipo === 'Arquivo');
    const arquivoNivel = arquivoEd?.nivel ?? 0;

    const isErudito = getProfissao(npc) === 'erudito';

    // Erudito usa o Arquivo (INT); demais profissões usam o Quartel.
    if (isErudito) {
      if (!podeEstudarNpc(npc, arquivoNivel, s.andarAtual)) return;
    } else {
      if (!podeTreinarNpc(npc, quartelNivel, s.andarAtual)) return;
    }

    const treinamentos = npc.treinamentos ?? 0;
    const statKey = statTreinamento(npc);
    const instrutor = calcInstrutor(npcId, s.npcs, statKey);
    const instrutorStat = instrutor ? instrutor[statKey] : 0;
    const ganho = (instrutor && instrutorStat > npc[statKey]) ? 2 : 1;

    if (isErudito) {
      const custo = calcCustoEstudo(treinamentos);
      if (s.recursos.pedra < custo.pedra || s.recursos.comida < custo.comida) return;
      s.recursos.pedra  -= custo.pedra;
      s.recursos.comida -= custo.comida;
    } else {
      const custo = calcCustoTreinamento(treinamentos);
      if (s.recursos.madeira < custo.madeira || s.recursos.ferro < custo.ferro) return;
      s.recursos.madeira -= custo.madeira;
      s.recursos.ferro   -= custo.ferro;
    }

    npc[statKey] += ganho;
    npc.fadiga = Math.min(100, npc.fadiga + 25);
    npc.treinamentos = treinamentos + 1;
    npc.raridade = recalcRaridade(npc);

    const statLabel = statKey === 'agilidade' ? 'AGI' : statKey === 'resistencia' ? 'RES' : statKey === 'inteligencia' ? 'INT' : 'FOR';
    const local = isErudito ? 'ARQUIVO' : 'QUARTEL';
    const instrutorStr = instrutor
      ? ` orientado por ${instrutor.nome} (${statLabel}:${instrutor[statKey]})`
      : '';
    addLog(s, 'info',
      `${npc.nome.toUpperCase()} ESTUDOU NO ${local} — +${ganho} ${statLabel} permanente${instrutorStr}. [${npc.treinamentos}/${MAX_TREINAMENTOS} sessões]`
    );
    saveState(s);
  };

  // ─── ESTUDO (INT — qualquer profissão, T1 via Templo ≥ andar 10 / T2 via Arquivo ≥ andar 21) ──
  // Prefere Arquivo (T2) quando disponível; cai para Templo (T1) caso contrário.
  const estudarNpc = (npcId: string) => {
    if (!state) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const npc = s.npcs.find(n => n.id === npcId);
    if (!npc) return;

    const arquivoEd = s.edificios.find(e => e.tipo === 'Arquivo');
    const arquivoNivel = arquivoEd?.nivel ?? 0;
    const temploEd = s.edificios.find(e => e.tipo === 'Templo');
    const temploNivel = temploEd?.nivel ?? 0;

    const podeT2 = podeEstudarNpc(npc, arquivoNivel, s.andarAtual);
    const podeT1 = podeEstudarNpcT1(npc, temploNivel, s.andarAtual);
    if (!podeT2 && !podeT1) return;

    const isErudito = getProfissao(npc) === 'erudito';
    const treinamentos = npc.treinamentos ?? 0;
    const instrutor = calcInstrutor(npcId, s.npcs, 'inteligencia');
    const instrutorStat = instrutor ? instrutor.inteligencia : 0;
    const ganho = (instrutor && instrutorStat > npc.inteligencia) ? 2 : 1;

    let local: string;
    if (podeT2) {
      const custo = calcCustoEstudo(treinamentos, isErudito);
      if (s.recursos.pedra < custo.pedra || s.recursos.comida < custo.comida) return;
      s.recursos.pedra  -= custo.pedra;
      s.recursos.comida -= custo.comida;
      local = 'ARQUIVO';
    } else {
      const custo = calcCustoEstudoT1(treinamentos, isErudito);
      if (s.recursos.comida < custo.comida || s.recursos.madeira < custo.madeira) return;
      s.recursos.comida  -= custo.comida;
      s.recursos.madeira -= custo.madeira;
      local = 'TEMPLO';
    }

    npc.inteligencia  += ganho;
    npc.fadiga = Math.min(100, npc.fadiga + 25);
    npc.treinamentos = treinamentos + 1;
    npc.raridade = recalcRaridade(npc);

    const instrutorStr = instrutor
      ? ` orientado por ${instrutor.nome} (INT:${instrutor.inteligencia})`
      : '';
    addLog(s, 'info',
      `${npc.nome.toUpperCase()} ESTUDOU NO ${local} — +${ganho} INT permanente${instrutorStr}. [${npc.treinamentos}/${MAX_TREINAMENTOS} sessões]`
    );
    saveState(s);
    setState(s);
  };

  // ─── HABITANTES DA TORRE ─────────────────────────────────────────────────
  // Aceita ou conclui a quest de um habitante descoberto num andar conquistado.
  const interagirHabitante = (floor: number) => {
    if (!state) return;
    const hab = HABITANTES[floor];
    if (!hab) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const est = s.habitantesEstado[floor] ?? 'oculto';

    if (est === 'descoberto') {
      const q = hab.quest;
      // Missão de sacrifício: custo imediato ao aceitar
      if (q.tipo === 'sacrificio' && q.custo) {
        if (q.custo.moral !== undefined && s.moral < q.custo.moral) return;
        if (q.custo.comida !== undefined && s.recursos.comida < q.custo.comida) return;
        if (q.custo.ferro !== undefined && s.recursos.ferro < q.custo.ferro) return;
        if (q.custo.moral)  s.moral = Math.max(0, s.moral - q.custo.moral);
        if (q.custo.comida) s.recursos.comida -= q.custo.comida;
        if (q.custo.ferro)  s.recursos.ferro  -= q.custo.ferro;
      }
      s.habitantesEstado[floor] = 'quest_ativa';
      if (!s.habitantesDiaDescoberta[floor]) s.habitantesDiaDescoberta[floor] = s.dia;
      addLog(s, 'descoberta', `${hab.nome.toUpperCase()}: missão aceita — ${q.descricaoObj}.`);
      saveState(s);
      return;
    }

    if (est === 'quest_ativa' && verificarQuestAndar(s, floor)) {
      const q = hab.quest;
      const ef = getEfeitos(s.edificios, s.npcs);
      const cap = ef.capacidadeArmazem;
      // Consumir recurso(s) exigido(s) — representa "entregar" o pedido, acontece
      // independente de haver escolha depois.
      if (q.tipo === 'recurso') {
        if (q.recurso)  s.recursos[q.recurso.tipo]  -= q.recurso.qtd;
        if (q.recurso2) s.recursos[q.recurso2.tipo] -= q.recurso2.qtd;
      }

      // Quest COM escolha: não concede nada ainda — aguarda o jogador decidir.
      if (q.escolha) {
        s.habitantesEstado[floor] = 'aguardando_escolha';
        addLog(s, 'info', `${hab.nome.toUpperCase()}: missão pronta para conclusão — uma escolha aguarda.`);
        saveState(s);
        return;
      }

      // Quest SEM escolha (comportamento legado): concede a recompensa da quest.
      if (q.recursosBonus) {
        if (q.recursosBonus.comida)  s.recursos.comida  = Math.min(cap, s.recursos.comida  + q.recursosBonus.comida);
        if (q.recursosBonus.madeira) s.recursos.madeira = Math.min(cap, s.recursos.madeira + q.recursosBonus.madeira);
        if (q.recursosBonus.pedra)   s.recursos.pedra   = Math.min(cap, s.recursos.pedra   + q.recursosBonus.pedra);
        if (q.recursosBonus.ferro)   s.recursos.ferro   = Math.min(cap, s.recursos.ferro   + q.recursosBonus.ferro);
      }
      if (q.moralBonus) s.moral = Math.min(100, s.moral + q.moralBonus);
      addLog(s, 'descoberta', `ECO ATIVADO — ${hab.nome} (Andar ${floor}): ${q.recompensaDesc}.`);
      finalizarQuestHabitante(s, floor, hab);
      saveState(s);
    }
  };

  // ─── ESCOLHA DO HABITANTE ────────────────────────────────────────────────
  // Resolve a escolha ramificada de uma quest em 'aguardando_escolha'.
  const resolverEscolhaHabitante = (floor: number, opcaoId: 'a' | 'b') => {
    if (!state) return;
    const hab = HABITANTES[floor];
    if (!hab?.quest.escolha) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    if (s.habitantesEstado[floor] !== 'aguardando_escolha') return;
    const opcao = hab.quest.escolha.opcoes.find(o => o.id === opcaoId);
    if (!opcao) return;

    // Valida e debita custo (aborta sem alterar nada se não houver saldo).
    if (opcao.custo) {
      if (opcao.custo.moral   !== undefined && s.moral            < opcao.custo.moral)   return;
      if (opcao.custo.comida  !== undefined && s.recursos.comida  < opcao.custo.comida)  return;
      if (opcao.custo.madeira !== undefined && s.recursos.madeira < opcao.custo.madeira) return;
      if (opcao.custo.pedra   !== undefined && s.recursos.pedra   < opcao.custo.pedra)   return;
      if (opcao.custo.ferro   !== undefined && s.recursos.ferro   < opcao.custo.ferro)   return;
      if (opcao.custo.moral)   s.moral = Math.max(0, s.moral - opcao.custo.moral);
      if (opcao.custo.comida)  s.recursos.comida  -= opcao.custo.comida;
      if (opcao.custo.madeira) s.recursos.madeira -= opcao.custo.madeira;
      if (opcao.custo.pedra)   s.recursos.pedra   -= opcao.custo.pedra;
      if (opcao.custo.ferro)   s.recursos.ferro   -= opcao.custo.ferro;
    }

    const ef = getEfeitos(s.edificios, s.npcs);
    const cap = ef.capacidadeArmazem;
    if (opcao.recursosBonus?.comida)  s.recursos.comida  = Math.min(cap, s.recursos.comida  + opcao.recursosBonus.comida);
    if (opcao.recursosBonus?.madeira) s.recursos.madeira = Math.min(cap, s.recursos.madeira + opcao.recursosBonus.madeira);
    if (opcao.recursosBonus?.pedra)   s.recursos.pedra   = Math.min(cap, s.recursos.pedra   + opcao.recursosBonus.pedra);
    if (opcao.recursosBonus?.ferro)   s.recursos.ferro   = Math.min(cap, s.recursos.ferro   + opcao.recursosBonus.ferro);
    if (opcao.moralBonus) s.moral = Math.min(100, s.moral + opcao.moralBonus);
    if (opcao.reliquia) s.reliquias = [...(s.reliquias ?? []), opcao.reliquia];

    // Efeito especial hardcoded — Andar 26 opção "a": procurar entre os corpos.
    // 30% de chance de recuperar um sobrevivente (que pode vir corrompido).
    if (floor === 26 && opcaoId === 'a') {
      const popViva = s.npcs.filter(n => n.vivo).length;
      if (popViva < ef.capPopulacao && Math.random() < 0.30) {
        const novo = generateNPC(Math.random() < 0.35); // maior chance de vir obscuro
        s.npcs.push(novo);
        addLog(s, 'descoberta', `SOBREVIVENTE RECUPERADO no Andar 26: ${novo.nome.toUpperCase()}${novo.obscuro ? ' — mas algo voltou com ela.' : ' juntou-se ao grupo.'}`);
      } else {
        addLog(s, 'info', 'Entre os corpos da expedição perdida, nada respirava. Você os deixou onde estavam.');
      }
    }

    s.habitantesEscolhaFeita = { ...(s.habitantesEscolhaFeita ?? {}), [floor]: opcaoId };
    finalizarQuestHabitante(s, floor, hab);
    addLog(s, 'descoberta', `${hab.nome.toUpperCase()}: ${opcao.label} — ${opcao.falaResultado}`);
    saveState(s);
  };

  // ─── CÂMARAS SECRETAS ────────────────────────────────────────────────────
  // TODO: Implement vasculharCamaraSecreta function for camera exploration
  // const vasculharCamaraSecreta = (floor: number) => {
  // };

  // ─── METAS DIÁRIAS ───────────────────────────────────────────────────────
  const gerarMetasDiarias = (temAliada: boolean) => {
    if (!state) return;
    if (state.metasDiarias.data === hojeStrLocal()) return; // já geradas hoje
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    s.metasDiarias = {
      data: hojeStrLocal(),
      objetivos: gerarObjetivosDoDia(temAliada),
      progresso: [],
      recompensaColetada: false,
    };
    saveState(s);
  };

  const registrarMetaDiaria = (id: MetaDiariaId) => {
    if (!state) return;
    const md = state.metasDiarias;
    if (!md || md.data !== hojeStrLocal()) return;
    if (!md.objetivos.includes(id) || md.progresso.includes(id)) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    registrarProgressoMetaDiaria(s, id);
    saveState(s);
  };

  const reivindicarPresenteDaTorre = () => {
    if (!state) return;
    const md = state.metasDiarias;
    if (!md || md.progresso.length < md.objetivos.length || md.objetivos.length === 0) return;
    if (md.recompensaColetada) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const ef = getEfeitos(s.edificios, s.npcs);
    const cap = ef.capacidadeArmazem;
    const sorte = Math.random() < 0.15;
    const mult = sorte ? 3 : 1;
    const comida  = (15 + s.andarAtual * 2) * mult;
    const madeira = Math.round((15 + s.andarAtual * 2) * 0.6) * mult;
    s.recursos.comida  = Math.min(cap, s.recursos.comida  + comida);
    s.recursos.madeira = Math.min(cap, s.recursos.madeira + madeira);
    s.metasDiarias = { ...md, recompensaColetada: true };
    addLog(s, sorte ? 'descoberta' : 'info',
      `PRESENTE DA TORRE${sorte ? ' (BÔNUS 3×!)' : ''} — +${comida} comida, +${madeira} madeira.`);
    saveState(s);
  };

  const abrirCodex = () => {
    if (!state || !state.codexNovoFragmento) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    s.codexNovoFragmento = false;
    saveState(s);
  };

  const concluirQuestOculta = (id: string) => {
    if (!state) return;
    const s = JSON.parse(JSON.stringify(state)) as GameState;
    const q = (s.questsOcultas ?? []).find(q => q.id === id);
    if (!q || q.estado !== 'ativa') return;
    if (!verificarQuestOculta(q, s)) return;
    const ef = getEfeitos(s.edificios, s.npcs);
    const cap = ef.capacidadeArmazem;
    // Consumir recurso se o requisito for recurso
    if (q.req.tipo === 'recurso') s.recursos[q.req.recurso] -= q.req.qtd;
    // Recompensas
    if (q.recursosBonus) {
      if (q.recursosBonus.comida)  s.recursos.comida  = Math.min(cap, s.recursos.comida  + q.recursosBonus.comida);
      if (q.recursosBonus.madeira) s.recursos.madeira = Math.min(cap, s.recursos.madeira + q.recursosBonus.madeira);
      if (q.recursosBonus.pedra)   s.recursos.pedra   = Math.min(cap, s.recursos.pedra   + q.recursosBonus.pedra);
      if (q.recursosBonus.ferro)   s.recursos.ferro   = Math.min(cap, s.recursos.ferro   + q.recursosBonus.ferro);
    }
    if (q.moralBonus) s.moral = Math.min(100, s.moral + q.moralBonus);
    // Registrar relíquia e lore
    if (q.reliquia) s.reliquias = [...(s.reliquias ?? []), q.reliquia];
    s.lores.push({ floor: 0, titulo: q.titulo, texto: q.lore });
    q.estado = 'concluida';
    const recompStr = [
      q.moralBonus ? `+${q.moralBonus} Moral` : '',
      q.recursosBonus?.comida  ? `+${q.recursosBonus.comida} comida`   : '',
      q.recursosBonus?.madeira ? `+${q.recursosBonus.madeira} madeira` : '',
      q.recursosBonus?.pedra   ? `+${q.recursosBonus.pedra} pedra`     : '',
      q.recursosBonus?.ferro   ? `+${q.recursosBonus.ferro} ferro`     : '',
      q.reliquia ? `Relíquia: ${q.reliquia}` : '',
    ].filter(Boolean).join(' · ');
    addLog(s, 'descoberta', `CÂMARA OCULTA CONCLUÍDA — "${q.titulo}". ${recompStr}.`);
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
      startTestGame,
      adicionarNpcLancamento,
      continueGame,
      advanceDay,
      setSpeed,
      buildEdificio,
      sendExpedition,
      invocarGacha,
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
      receberReforcoGuerra,
      declararGuerra,
      responderGuerra,
      treinarNpc,
      estudarNpc,
      interagirHabitante,
      resolverEscolhaHabitante,
      gerarMetasDiarias,
      registrarMetaDiaria,
      reivindicarPresenteDaTorre,
      abrirCodex,
      concluirQuestOculta,
      lastExpeditionResult: expeditionResult,
      clearExpeditionResult: () => setExpeditionResult(null),
    }}>
      {children}
    </GameContext.Provider>
  );
};
