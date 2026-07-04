---
name: Habitantes da Torre system
description: Quest/eco system for floor inhabitants in Torre Obscura — design decisions, data model, state machine, validation rules, and Codex integration.
---

## System Overview
Each non-boss floor (1-4, 6-9, 11-14, 16-19) has one `HabitanteAndar` entry in `HABITANTES` (game-data.ts). Boss floors (5, 10, 15, 20) unlock lore via `BOSS_ECO_LORE` on conquest. Inhabitants are ethereal — no new NPCs, no new tabs.

## State Machine
`oculto` → `descoberto` (on floor conquest in sendExpedition) → `quest_ativa` (on interagirHabitante accept) → `concluido` (on interagirHabitante complete when conditions met).

## Quest Types
- `recurso`: deducts resource(s) on `concluido`. Supports dual-resource via `recurso` + `recurso2` fields.
- `expedicao`: checks `profissoes[]` (AND: all must be alive) or `npcsMinCombate` (count of combat NPCs alive).
- `temporal`: checks `dia - baseDate >= q.dias`. If `semGuerra=true`, `baseDate = max(diaDescoberta, habitantesQuestResetDia[floor])`. processDay resets the reset-day whenever war is active + quest is active.
- `sacrificio`: cost consumed immediately on accept (no second verification needed). Always `true` from verificarQuestAndar.

## Critical Implementation Rules
- `verificarQuestAndar()` in game-data.ts is the single source of truth for completion — uses `habitantesQuestResetDia` for semGuerra tracking.
- `interagirHabitante()` in GameContext.tsx: deducts BOTH `recurso` and `recurso2` at completion for recurso-type quests.
- Eco bonus (`ecoBonus: number`) applied in `sendExpedition` loot calc: `ecoBonus / 100` multiplied into `lootMult`. Only active floors in `state.ecos[]` get the bonus.
- Boss eco stored in `state.ecosCapitulo[]` (tier 1-4) and `state.lores[]`.

**Why:** Dual-resource fix prevents completing floor 18 by paying only iron. semGuerra reset ensures "no war during X days" is measured from last war day, not discovery day.

## GameState Fields (Habitants)
- `habitantesEstado: Record<number, HabitanteEstado>` — floor → state
- `habitantesDiaDescoberta: Record<number, number>` — floor → discovery day
- `habitantesQuestResetDia: Record<number, number>` — floor → last war reset day (semGuerra only)
- `ecos: number[]` — floors with eco active
- `ecosCapitulo: number[]` — tiers with boss eco
- `lores: {floor, titulo, texto}[]` — unlocked lore fragments (legacy, superseded by Codex)

## Codex Obscuro Integration
Each completed habitante quest → `desbloquearFragmento(s, 'hab_${floor}')` in interagirHabitante.
Each boss defeated → `desbloquearFragmento(s, 'eco_${tier}')` in sendExpedition.
All 16 habitants concluido → `desbloquearFragmento(s, 'verdade_t1')`.
Sussurros: 15% chance per victorious expedition → random unseen sussurro from that chapter.

## UI (Tower.tsx)
- Codex button in header (BookOpen icon) with gold pulse badge when `state.codexNovoFragmento = true`.
- Codex modal: collapsible chapters, progress bar per temporada, locked entries show ████.
- Habitante floor cards: 👁/⚡/✦ icon button, eco "+XX% LOOT" badge, pulse when completable.
- ExpeditionResultCard: habitanteDescoberto + bossEco lore + sussurro card.
