// ─── quest-engine — motor de quests ───────────────────────────────────────────
// Façade única dos 3 subsistemas de quest: quests de Habitante, Quests Ocultas e
// Metas Diárias. Espelha npc-engine/floor-engine: por ora RE-EXPORTA as regras
// puras + tipos de game-data; a orquestração de estado segue no GameContext, mas
// consumindo daqui. Direção única GameContext → quest-engine → game-data.

// Regras puras (verificação/geração)
export {
  verificarQuestAndar,
  verificarQuestOculta,
  gerarQuestOculta,
  gerarObjetivosDoDia,
  METAS_DIARIAS_META,
} from '../lib/game-data';

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
