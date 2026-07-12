// ─── npc-engine — motor de vida e domínio dos NPCs ───────────────────────────
// Façade única do comportamento de NPC. Regras novas (social/vida) vivem aqui;
// os helpers de domínio ainda residem em game-data.ts e são re-exportados para
// que o resto do app tenha um único lar de import. Direção de dependência:
// GameContext → npc-engine → game-data (nunca o contrário — evita ciclos).

// Motor de vida (novo)
export * from './tick';
export * from './relationships';
export * from './houses';
export * from './grief';
export * from './mood';
export * from './fama';
export * from './cronica';
export * from './systems/vinculos-tipados';
export * from './systems/eventos-sociais';

// Domínio de NPC (re-export de game-data — façade de compatibilidade)
export {
  generateNPC,
  generateNpcGacha,
  gerarNomeNpc,
  ehRaridadeNobre,
  calcNpcPower,
  calcPoderGrupo,
  getProfissao,
  statTreinamento,
  recalcRaridade,
} from '../lib/game-data';
