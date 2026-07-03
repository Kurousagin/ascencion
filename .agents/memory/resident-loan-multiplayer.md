---
name: Resident loan multiplayer
description: Durable architectural decisions for the async NPC loan system in Torre Obscura.
---

# Resident loan (empréstimo) multiplayer

## The rule
Loans reuse the `exchanges` table with `tipo='emprestimo'` (outbound) and `tipo='retorno'` (return to owner). Status flow: `pendente → recebido → devolvido`.

**Why:** Reuses existing async inbox infrastructure; no shared real-time state needed.

## Key architectural decisions

### Two-phase error handling in `emprestar()`
Network mutation and cache refresh must be in **separate try/catch blocks**. Rollback (`restaurarMorador`) only fires if the POST itself fails — never after a successful insert. If the cache refresh fails, the periodic poll corrects state without duplicating the NPC cross-player.

**Why:** A single try/catch wrapping both POST + refresh causes `restaurarMorador` to fire on transient poll errors after a committed server insert, duplicating the NPC (owner gets it back while ally still receives it).

### Idempotency on `devolver`
Server atomically flips `recebido → devolvido` once; subsequent calls see no matching row and return `{ok:true, duplicado:true}` without side effects.

### Loan eligibility (`podeEmprestar`)
`vivo && !emExpedicao && !emprestado && posto===null`. Borrowed NPCs have `emprestado:true`, so they cannot be re-loaned.

### Prazo counted in borrower's game days
`emprestadoAte = borrower.dia + prazoDias` — not wall time.

### Auto-return guard
`devolvendoRef: Set<string>` in `AllianceContext` prevents concurrent duplicate calls for the same NPC when `useEffect` re-fires on `[state.dia, state.npcs]`.

## How to apply
- Passive damage events in `processDay` (fatigue, disease) should skip NPCs with `emprestado:true` — only expedition combat should kill them.
- `moradorBase(npc)` strips loan fields before network transport.
- Server cap: `LIMITE_EMPRESTIMOS = 2` simultaneous active loans per player.
