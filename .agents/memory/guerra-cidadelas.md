---
name: Guerra entre cidadelas (war system)
description: How Torre Obscura's declared-war feature is architected — client-local sim, bot-only rivals, integration touchpoints.
---

# Guerra entre cidadelas

Declared war vs **bot citadels only**. Player commits combatants; they go `emGuerra`
and become unavailable for tower/work/expedition. Duration 15 game-days. Mixed
casualties: frequent wounds/fatigue, LOW permanent-death chance.

## Where the logic lives
- **War is CLIENT-LOCAL**: lives in `GameState.guerra` + `guerrasHistorico`, resolved
  entirely inside `processDay` via `avancarGuerra(draft)` (one tick/day). The server
  only supplies the target pool.
- **Server = pool only**: `POST /api/guerra/rivais` returns nearest-power bots from the
  `bot_citadels` table (seeded by `lib/db/scripts/seed-bots.mjs`, ~100 bots). There is
  **no server-side war-result endpoint** — intentional drift; nothing would consume it.
- Rival fetch: `WarContext` refreshes on mount + `visibilitychange` (background tabs
  throttle timers), using refs to avoid stale-closure refetch churn as `state` changes.

## Power model — reuse, don't reinvent
- `calcPoderMilitar(state)` (matchmaking) and `calcPoderTropa(tropa, poderBonus)` both
  build on the existing `calcNpcPower` + Quartel `poderBonus` from `getEfeitos`. Do NOT
  add a second power system.

## Integration touchpoints (must stay in lockstep)
- `podeGuerrear(npc)` gates eligibility (excludes emprestado/reforço/expedição/dead;
  ALLOWS npcs with a posto — they leave work on mobilization).
- Guards that must exclude `emGuerra`: fatigue recovery loop, `sendExpedition`,
  `assignPosto`, Tower eligibles, People posto UI. Save migration defaults
  `emGuerra=false`, `guerra=null`, `guerrasHistorico=[]`.

## Invariant that bit us
- **Clear `emGuerra` on ALL committed troops at resolution**, not just survivors — a
  mobilized NPC can die from a non-war cause (starvation/event) mid-campaign and would
  otherwise keep a stale `emGuerra=true` on the dead record. `resolverGuerra` now clears
  the flag across all `tropaIds` up front.

## Known accepted limitation
- `declararGuerra` uses snapshot + `saveState` (not functional `setState`), matching the
  pre-existing pattern of every other user action (buildEdificio, sendExpedition, etc.).
  A day tick committing at the exact declaration instant could overwrite. Accepted for
  consistency; revisit only if the whole codebase moves to functional updates.
