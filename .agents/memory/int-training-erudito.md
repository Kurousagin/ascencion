---
name: INT training for Erudito
description: How INT stat training is implemented for Erudito via Arquivo building (T2 gate).
---

Erudito can train INT in the Arquivo building (T2, andar 21+).

- Gate: `podeEstudarNpc(npc, arquivoNivel, andarAtual)` — requires andar >= 21 AND arquivoNivel >= 1
- Cost: pedra + comida via `calcCustoEstudo(treinamentos)`
- Stat: `statTreinamento` returns 'inteligencia' for erudito
- In GameContext.treinarNpc: `isErudito` branches to different cost/gate check
- In People.tsx: separate "ESTUDO — ARQUIVO" section shown for eruditos (hidden until andar >= 18)
- buildingOrder in Citadel.tsx MUST include 'Arquivo' and 'Mirante' so players can build them

**Why:** Quartel is FOR/AGI/RES only (combat professions). Erudito is a civil profession needing a separate intellectual training path.

**How to apply:** Any future training feature for new professions: add new gate function (podeX), new cost function (calcCustoX), update statTreinamento, add section in People.tsx, add building to buildingOrder in Citadel.
