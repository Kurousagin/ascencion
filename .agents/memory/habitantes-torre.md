---
name: Habitantes da Torre system
description: Quest/eco system for floor inhabitants in Torre Obscura — design decisions, data model, state machine, and validation rules.
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

## GameState New Fields
- `habitantesEstado: Record<number, HabitanteEstado>` — floor → state
- `habitantesDiaDescoberta: Record<number, number>` — floor → discovery day
- `habitantesQuestResetDia: Record<number, number>` — floor → last war reset day (semGuerra only)
- `ecos: number[]` — floors with eco active
- `ecosCapitulo: number[]` — tiers with boss eco
- `lores: {floor, titulo, texto}[]` — unlocked lore fragments

## Save Migration
All 5 new fields default to `{}` or `[]` in continueGame. Safe for old saves.

## UI (Tower.tsx)
- Conquered floor card: shows 👁/⚡/✦ icon button per habitant state; eco "+XX% LOOT" badge; pulse animation when completable.
- Habitante modal: shows fala (state-dependent), quest conditions with live progress, action button (Aceitar/Concluir/Fechar).
- ExpeditionResultCard: shows `habitanteDescoberto` (name) on first conquest + `bossEco` lore block on boss defeat.
