// ─── Regras de câmara (stat gating, dificuldade, rolagem) ────────────────────
// Corpo das regras do domínio de câmaras. Depende de game-data (tipos + helpers
// puros) numa única direção — GameContext/pages consomem daqui pela façade
// (index.ts). Não há ciclo: game-data NÃO importa deste arquivo.

import {
  BASE_DIFICULDADE, PROFISSOES, CODEX_FRAGMENTOS,
  calcPoderGrupo, fadigaMediaGrupo, getProfissao,
  type GameState, type NPC, type Raridade,
  type CamaraSecreta, type RequisitoCamara,
} from '../lib/game-data';

// ─── Stat gating: a PISTA (requisito) foi atingida? ──────────────────────────
// Requisitos estritos e escalados — no Early Game o esquadrão não os alcança.
export function verificarRequisitoCamara(state: GameState, requisito: RequisitoCamara): boolean {
  if (requisito.tipo === 'npc_atributo_alto') {
    const count = state.npcs.filter(n => n.vivo && n[requisito.stat] >= requisito.minValor).length;
    return count >= requisito.quantidade;
  }
  if (requisito.tipo === 'classe_desenvolvida') {
    const stat = PROFISSOES[requisito.profissao].stat;
    const count = state.npcs.filter(n =>
      n.vivo && getProfissao(n) === requisito.profissao && n[stat] >= requisito.minStat).length;
    return count >= requisito.quantidade;
  }
  if (requisito.tipo === 'sussurros_capitulo') {
    const count = (state.codexFragmentos ?? []).filter(id => {
      const frag = CODEX_FRAGMENTOS[id];
      return frag && frag.tipo === 'sussurro' && frag.capitulo === requisito.capitulo;
    }).length;
    return count >= requisito.quantidade;
  }
  if (requisito.tipo === 'npc_raridade') {
    // Conta por tier: uma raridade maior satisfaz um requisito de raridade menor.
    const tierAlvo: Record<string, number> = { comum: 0, incomum: 1, raro: 2, lendario: 4 };
    const tierNpc = (r: Raridade): number =>
      r === 'Divino' ? 5 : r === 'Lendário' ? 4 : r === 'Épico' ? 3 : r === 'Raro' ? 2 : r === 'Incomum' ? 1 : 0;
    const alvo = tierAlvo[requisito.raridade] ?? 0;
    const count = state.npcs.filter(n => n.vivo && tierNpc(n.raridade) >= alvo).length;
    return count >= requisito.quantidade;
  }
  if (requisito.tipo === 'farms_andar') {
    return (state.farmsPerFloor?.[requisito.floor] ?? 0) >= requisito.minFarms;
  }
  // ─── Requisitos legados (câmaras curadas antigas / saves) ──────────────────
  if (requisito.tipo === 'class_farms') {
    const totalFarms = Object.values(state.farmsPorAndarEClasse ?? {}).reduce((sum, andarFarms) => {
      return sum + (andarFarms[requisito.profissao] ?? 0);
    }, 0);
    return totalFarms >= requisito.minFarmsComClasse;
  }
  if (requisito.tipo === 'mortes_andar') {
    const totalMortes = Object.values(state.totalMortesAndar ?? {}).reduce((sum, m) => sum + m, 0);
    return totalMortes >= requisito.minMortes;
  }
  if (requisito.tipo === 'quest_habitante') {
    return state.habitantesEstado?.[requisito.floor] === 'concluido';
  }
  if (requisito.tipo === 'recurso_minimo') {
    const recursos = state.recursos;
    if (requisito.recurso === 'comida') return recursos.comida >= requisito.quantidade;
    if (requisito.recurso === 'madeira') return recursos.madeira >= requisito.quantidade;
    if (requisito.recurso === 'pedra') return recursos.pedra >= requisito.quantidade;
    if (requisito.recurso === 'ferro') return recursos.ferro >= requisito.quantidade;
  }
  if (requisito.tipo === 'combinado') {
    return requisito.conditions.every(cond => {
      if (cond.tipo === 'class_farms') {
        const farms = Object.values(state.farmsPorAndarEClasse ?? {}).reduce((sum, af) => {
          return sum + Object.values(af).reduce((a, b) => a + b, 0);
        }, 0);
        return farms >= (cond.value ?? 0);
      }
      if (cond.tipo === 'mortes') {
        const mortes = Object.values(state.totalMortesAndar ?? {}).reduce((sum, m) => sum + m, 0);
        return mortes >= (cond.value ?? 0);
      }
      return false;
    });
  }
  return false;
}

// ─── Dificuldade da câmara ───────────────────────────────────────────────────
// Escalada à dificuldade da expedição do andar (BASE_DIFICULDADE), com multiplicador
// padrão de 1.5 — câmaras são CLARAMENTE mais duras que conquistar o andar. Câmaras
// que a lore justifica serem excepcionais definem `multiplicadorDificuldade` próprio.
export function dificuldadeCamara(camara: CamaraSecreta): number {
  const base = BASE_DIFICULDADE[camara.floor - 1] ?? camara.dificuldade;
  return Math.round(base * (camara.multiplicadorDificuldade ?? 1.5));
}

// Afinidade do grupo com a câmara: quando o requisito define uma profissão temática
// (class_farms legado ou classe_desenvolvida), levar o grupo alinhado amplifica o
// poder efetivo; grupo destoante penaliza. Câmaras neutras retornam 1.0.
export function calcAfinidadeCamara(group: NPC[], camara: CamaraSecreta): number {
  const req = camara.requisito;
  const profTema =
    req.tipo === 'class_farms' ? req.profissao :
    req.tipo === 'classe_desenvolvida' ? req.profissao : undefined;
  if (!profTema) return 1.0;
  const ideais = group.filter(n => getProfissao(n) === profTema).length;
  const ratio = ideais / Math.max(1, group.length);
  if (ratio >= 0.5) return 1.30;  // grupo temático: vantagem
  if (ratio >= 0.2) return 1.00;  // parcialmente temático: neutro
  return 0.80;                     // grupo destoante: −20%
}

// ─── Rolagem de dados: investigar a pista NÃO garante 100% ───────────────────
// Confronta o poder efetivo do grupo (poder bruto × afinidade) contra a
// dificuldade estocástica da câmara. A CHANCE (nunca 0/100%) cresce com o
// over-level — recompensa fortemente voltar mais forte a andares já vistos.
// A fadiga também eleva a mortalidade em caso de falha.
const clamp = (min: number, max: number, v: number) => Math.max(min, Math.min(max, v));

export function chanceAbrirCamara(
  camara: CamaraSecreta,
  group: NPC[],
  poderBonus = 0,
): { chance: number; poder: number; dificuldade: number; afinidade: number; chanceMorteFalha: number; desempenho: number } {
  const afinidade = calcAfinidadeCamara(group, camara);
  const poder = Math.round(calcPoderGrupo(group, poderBonus) * afinidade);
  const dificuldade = dificuldadeCamara(camara);
  const ratio = poder / Math.max(1, dificuldade);
  // ratio 0.7→10% · 1.0→27% · 1.3→43% · 1.6→60% · 2.0→82% (piso 5%, teto 90%).
  const chance = clamp(0.05, 0.90, 0.10 + 0.55 * (ratio - 0.70));
  const avgFadiga = fadigaMediaGrupo(group);
  const base = camara.resultado.chanceMorteNPC ?? 0.12;
  const chanceMorteFalha = Math.min(0.6, base * (0.6 + avgFadiga / 100));
  // Desempenho (0–1): margem de poder sobre a dificuldade, temperada pelo frescor
  // do grupo. Só é usado no sucesso — alimenta o sorteio de recompensa (variedade).
  const margem = Math.max(0, Math.min(1, ratio - 1));
  const frescor = 1 - avgFadiga / 100;
  const desempenho = Math.max(0, Math.min(1, margem * 0.7 + frescor * 0.3));
  return { chance, poder, dificuldade, afinidade, chanceMorteFalha, desempenho };
}
