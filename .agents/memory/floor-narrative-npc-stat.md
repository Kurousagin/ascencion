---
name: Floor narrative arcs + NPC stat UX
description: 5-floor chapter stories leading to boss; NPC selection modal shows biome-relevant stat
---

## Rule
Each chapter (5 floors) tells a self-contained story arc that closes on the boss floor. The floor data object has `descricao` (atmospheric text) and `boss` (nome + epiteto) fields baked in from FLOOR_DESCRICOES/FLOOR_BOSS in game-data.ts.

The NPC selection modal in Tower.tsx:
- Derives `statPrimario` from `BIOMA_META[floorData.bioma]` (forca/agilidade/resistencia/inteligencia)
- Sorts eligibles by that stat descending
- Shows the stat label+value (FOR/AGI/RES/INT) on each card
- Highlights NPCs whose `getProfissao(n)` matches the ideal profession with a ★ badge and green border

## Why
Users were sending NPCs as "cannon fodder" without understanding which stats mattered. Showing the relevant stat contextually (not always FOR) lets players make informed choices. Chapter names + floor lore give narrative continuity across each 5-floor arc.

## How to apply
When adding new biomes or floors: update FLOOR_DESCRICOES (array indexed by floor-1), FLOOR_BOSS (boss floor number → {nome, epiteto}), CAPITULO_NOMES (tier → chapter name). The modal stat display is automatic from BIOMA_META.statPrimario.
