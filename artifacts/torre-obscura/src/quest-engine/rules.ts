// ─── Regras puras de quest (verificação + geração) ───────────────────────────
// Corpo das regras dos 3 subsistemas de quest, movido de game-data. Depende de
// game-data (dados + helpers) numa única direção — GameContext/pages consomem
// daqui pela façade (index.ts). Sem ciclo: game-data NÃO importa deste arquivo.
// Os DADOS (HABITANTES, pools, METAS_DIARIAS_*) permanecem em game-data.

import {
  HABITANTES, getProfissao,
  POOL_EXPLORACAO, POOL_VELOCIDADE, METAS_DIARIAS_POOL_BASE,
  type GameState, type QuestOculta, type MetaDiariaId, type ProfissaoId,
} from '../lib/game-data';

// ─── Quests de Habitante ─────────────────────────────────────────────────────
// O requisito da quest do habitante do andar foi cumprido? (GameContext orquestra
// o estado/log; aqui é só a verificação pura.)
export function verificarQuestAndar(state: GameState, floor: number): boolean {
  const hab = HABITANTES[floor];
  if (!hab) return false;
  if (state.habitantesEstado[floor] !== 'quest_ativa') return false;

  const q = hab.quest;
  switch (q.tipo) {
    case 'recurso': {
      if (q.recurso && state.recursos[q.recurso.tipo] < q.recurso.qtd) return false;
      if (q.recurso2 && state.recursos[q.recurso2.tipo] < q.recurso2.qtd) return false;
      if (q.farmsMin && (state.farmsPerFloor?.[q.farmsMin.andar] ?? 0) < q.farmsMin.vezes) return false;
      return !!(q.recurso || q.recurso2);
    }
    case 'expedicao': {
      // andarMin: player deve ter avançado além deste andar
      if (q.andarMin && state.andarAtual <= q.andarMin) return false;
      // farmsMin: mínimo de farms vitoriosos no andar indicado
      if (q.farmsMin && (state.farmsPerFloor?.[q.farmsMin.andar] ?? 0) < q.farmsMin.vezes) return false;
      // recurso misto (expedicao + recurso obrigatório)
      if (q.recurso && state.recursos[q.recurso.tipo] < q.recurso.qtd) return false;
      if (q.recurso2 && state.recursos[q.recurso2.tipo] < q.recurso2.qtd) return false;
      const vivosAtivos = state.npcs.filter(n => n.vivo);
      if (q.npcsMinCombate) {
        const combate = vivosAtivos.filter(n =>
          getProfissao(n) === 'combatente' || getProfissao(n) === 'batedor' || getProfissao(n) === 'sentinela'
        );
        if (combate.length < q.npcsMinCombate) return false;
      }
      if (q.profissoes) {
        // Multiset: conta quantas de cada profissão são exigidas e verifica se há vivos suficientes.
        const needed: Partial<Record<ProfissaoId, number>> = {};
        for (const p of q.profissoes) needed[p] = (needed[p] ?? 0) + 1;
        const available: Partial<Record<ProfissaoId, number>> = {};
        for (const n of vivosAtivos) {
          const p = getProfissao(n);
          available[p] = (available[p] ?? 0) + 1;
        }
        for (const [prof, cnt] of Object.entries(needed) as [ProfissaoId, number][]) {
          if ((available[prof] ?? 0) < cnt) return false;
        }
      }
      return true;
    }
    case 'temporal': {
      // Para quests com semGuerra: o contador reseta quando guerra ocorre durante o intervalo.
      const baseDate = q.semGuerra
        ? Math.max(
            state.habitantesDiaDescoberta[floor] ?? state.dia,
            state.habitantesQuestResetDia?.[floor] ?? 0
          )
        : (state.habitantesDiaDescoberta[floor] ?? state.dia);
      return (state.dia - baseDate) >= (q.dias ?? 1);
    }
    case 'sacrificio':
      return true; // custo pago ao aceitar; conclusão sempre disponível
  }
}

// ─── Quests Ocultas ──────────────────────────────────────────────────────────
export function verificarQuestOculta(q: QuestOculta, state: GameState): boolean {
  const req = q.req;
  switch (req.tipo) {
    case 'recurso':   return state.recursos[req.recurso] >= req.qtd;
    case 'profissao': return state.npcs.some(n => n.vivo && !n.emExpedicao && !n.emGuerra && getProfissao(n) === req.profissao);
    case 'temporal':  return (state.dia - q.dia) >= req.dias;
    case 'moral':     return state.moral >= req.moral;
  }
}

export function gerarQuestOculta(
  gatilho: 'exploracao' | 'velocidade',
  andar: number | undefined,
  state: GameState,
): QuestOculta | null {
  const ativas = (state.questsOcultas ?? []).filter(q => q.estado === 'ativa');
  if (ativas.length >= 3) return null;
  if (ativas.some(q => q.gatilho === gatilho)) return null;
  const pool = gatilho === 'exploracao' ? POOL_EXPLORACAO : POOL_VELOCIDADE;
  const vistos = new Set((state.questsOcultas ?? []).map(q => q.titulo));
  const disponiveis = pool.filter(t => !vistos.has(t.titulo));
  if (disponiveis.length === 0) return null;
  const template = disponiveis[Math.floor(Math.random() * disponiveis.length)];
  const id = `${gatilho}_${state.dia}_${Math.random().toString(36).slice(2, 6)}`;
  return { ...template, id, gatilho, andar, estado: 'ativa', dia: state.dia };
}

// ─── Metas Diárias ───────────────────────────────────────────────────────────
// `temAliada` decide se "aliar" entra no sorteio — evita gerar meta impossível
// pra quem nunca formou aliança.
export function gerarObjetivosDoDia(temAliada: boolean): MetaDiariaId[] {
  const pool: MetaDiariaId[] = temAliada ? [...METAS_DIARIAS_POOL_BASE, 'aliar'] : [...METAS_DIARIAS_POOL_BASE];
  if (pool.length <= 3) return pool;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
}
