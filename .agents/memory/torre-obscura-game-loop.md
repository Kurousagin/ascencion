---
name: Torre Obscura — game loop quirks
description: Non-obvious behaviors in the tower game's day loop, expeditions, and worker/population systems
---

# Torre Obscura — game loop quirks

- **Expeditions resolve instantly.** `sendExpedition` computes victory, loot, mortality and returns in one synchronous call. Nobody is ever left "on expedition" in stored state, so the `NPC.emExpedicao` flag is effectively **vestigial** — it is checked (worker exclusion in `getEfeitos`, Tower eligibility filter, `assignPosto` guard) but never set to `true`. Don't waste time debugging "why doesn't a worker stop producing while adventuring" — that tradeoff was designed but never triggers because expeditions aren't time-based.
  - **Why:** a code review flagged the dead flag as a bug; it's harmless. If you ever make expeditions multi-day, you'd need to actually set `emExpedicao=true` on dispatch.

- **Population growth is two-step gated on purpose.** Pop starts at cap (6 = `POP_BASE`), so the "Ritual de Invocação" (`invocarMorador`) is blocked until an **Alojamento** is built to raise `capPopulacao`. Invocation cost also rises with living pop (`calcCustoInvocacao`). Tower victories give a small rescue chance (bigger on boss floors), also cap-respecting.
  - **How to apply:** when tuning "start is too hard/easy", the earliest lever is Fazenda (food) vs Alojamento (madeira) competition — both drain madeira, so building one delays the other by design.

- **Professions are derived, not stored** (`getProfissao` = dominant stat). Combatente's +8% power lives inside `calcNpcPower`, so it's already baked into any power total — do not add it again elsewhere. Worker bonuses live in `getEfeitos` (slots = building level, matching profession = 1.5x).
