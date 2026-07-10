// ─── quest-engine — motor de quests ───────────────────────────────────────────
// Façade única dos 3 subsistemas de quest: quests de Habitante, Quests Ocultas e
// Metas Diárias. Espelha npc-engine/floor-engine: as REGRAS PURAS vivem em
// ./rules (movidas de game-data, importando dados numa direção só — sem ciclo); os
// DADOS (HABITANTES, pools, METAS_DIARIAS_META) e tipos ficam em game-data. A
// orquestração de estado segue no GameContext, consumindo daqui.
// Direção única: GameContext/pages → quest-engine → game-data.

// Regras puras (verificação/geração) — agora no motor.
export {
  verificarQuestAndar,
  verificarQuestOculta,
  gerarQuestOculta,
  gerarObjetivosDoDia,
} from './rules';

// Dado de apresentação das metas (permanece em game-data).
export { METAS_DIARIAS_META } from '../lib/game-data';

// Tipos do domínio de quests
export type {
  QuestTipo,
  HabitanteQuest,
  HabitanteAndar,
  QuestOculta,
  QuestOcultaReq,
  MetaDiariaId,
  MetasDiariasState,
} from '../lib/game-data';
