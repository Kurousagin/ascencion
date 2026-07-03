---
name: Expedition reinforcement (reforço) multiplayer
description: Full flow for phase-3 async co-op reinforcement, including new tipo, NPC markers, auto-return trigger, and all touched files.
---

# Expedition Reinforcement (Reforço) — Phase 3 Multiplayer

## Rule
A reinforcement resident (`tipo: 'reforco'` in exchanges) participates in exactly one expedition on the ally's side, then returns to the owner via the existing `devolver` endpoint. The `devolver` server route now accepts `tipo IN ('emprestimo','reforco')`.

**Why:** Reuses the full phase-2 transport (exchange table, devolver idempotency, inbox polling) without a separate return mechanism. The single-expedition constraint is enforced client-side via the `reforcoConcluido` flag set in `sendExpedition`.

## How to apply
- NPC carries `reforco?: boolean` and `reforcoConcluido?: boolean` (receptora side only).
- `moradorBase()` strips both fields before sending over the network (same Omit pattern as phase-2 fields).
- `podeEmprestar()` excludes `reforco` residents from being re-loaned/re-reinforced.
- `sendExpedition` sets `reforcoConcluido = true` on surviving reforço group members after mortality resolution.
- `AllianceContext` scanner effect: `(n.reforco && (!n.vivo || n.reforcoConcluido))` triggers `devolver()`.
- `removerEmprestado` handles both `emprestado` and `reforco` residents.
- Owner side: `removerParaEmprestimo` / `restaurarMorador` reused unchanged.
- Limit: `LIMITE_REFORCOS = 2` active reinforcements (status pendente/recebido) per sender.
- DB: no migration needed — `exchanges.tipo` is a free-text column.
