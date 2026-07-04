---
name: Alliance dissolve on new game
description: How alliances are cleared when a player starts a new game — deviceId rotation approach.
---

## Rule
On new game, rotate the `deviceId` (generate a new UUID). Do NOT dissolve server-side.

**Why:** Dissolving via server calls is fragile (offline, race conditions, silent failures). Rotating the deviceId is always instant and requires no network — old alliances become orphaned on the server automatically. The new game has a fresh code with zero alliances.

**How to apply:**
- `resetDeviceId()` in `alliance-identity.ts` generates and persists new UUID
- `dissolveAll()` in `AllianceContext` calls `resetDeviceId()`, updates `deviceId.current` ref immediately, clears local state (aliadas, caixa, historico, perfil)
- `dissolveAll()` is called from `TitleScreen` and `GameOverScreen` before `startNewGame()`
- `AllianceProvider` wraps `MainGameInner` (not just the active game), so TitleScreen/GameOverScreen can call `useAlliance()` — they're inside the provider via `MainGameInner`
