---
name: Combatant training system
description: Permanent FOR upgrade for Combatente NPCs via Quartel — unlock conditions, cost scaling, ally bonus, UI placement.
---

## Rule
Combatentes can be trained in the Quartel to permanently gain +1 FOR (or +2 with a borrowed combatant ally in the citadel).

**Why:** Player progression gate at floor 5+ boss; madeira/ferro sink to spend farming resources on.

**Unlock guard (podeTreinarNpc):**
- andarAtual >= 6 (past boss floor 5)
- Quartel built (nivel >= 1)
- NPC: vivo, profissao === 'combatente', fadiga < 60, not emExpedicao/emGuerra, not emprestado/reforco
- treinamentos < MAX_TREINAMENTOS (5)

**Cost:** calcCustoTreinamento(treinamentos) → { madeira: 10 + n*8, ferro: 5 + n*4 }

**Ally bonus:** any borrowed NPC (emprestado && vivo && !emExpedicao && profissao==='combatente') present → +2 FOR instead of +1.

**Effects:** forca += ganho, fadiga += 25, treinamentos++, raridade = recalcRaridade(npc).

**Migration:** treinamentos is optional on NPC; all reads use `npc.treinamentos ?? 0` — existing saves are safe.

**UI:** People.tsx expanded card → section "TREINAMENTO — QUARTEL" only shown when andar >= 6 OR quartel >= 1 (teaches path). Disabled button shows explicit reason for each blocked state.
