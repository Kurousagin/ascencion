---
name: Async multiplayer (alliance) polling
description: Why the alliance inbox/ally sync refreshes on tab-open + visibilitychange, not just setInterval
---

# Async multiplayer inbox/sync must refresh on focus, not only on a timer

The alliance feature (device-based identity, ally pairing, periodic citadel summary
sync, async resource inbox) polls the api-server from the client. Polling is driven by
`setInterval`, but that alone is **not reliable**: browsers heavily throttle (or pause)
`setInterval` in backgrounded / non-visible tabs.

**Why:** during two-context e2e tests, a resource gift was correctly created server-side
and returned by the caixa endpoint, but the recipient's UI showed an empty inbox for
over a minute — the recipient tab was backgrounded while focus was on the sender tab, so
its poll timer was throttled and never fired near the check window. The server and client
render code were both correct; only the fetch *cadence* was the problem.

**How to apply:** any client-side polling for cross-player state (inbox, ally summary,
lending/co-op status in later phases) must ALSO trigger an immediate fetch when the
relevant tab/screen mounts and on `document` `visibilitychange` → visible, in addition to
the interval. Expose a `refresh()` from the context and call it from the screen's mount
effect. Do not tighten the interval to compensate — that does not fix background throttling
and just adds load.

Also: e2e testers drive multiple browser contexts and will hit this same throttling; a
single-context deterministic test (seed a `deviceId` in localStorage that already has a
pending server row, then open the screen) is the fast way to prove render/credit logic
independent of cross-tab timing.
