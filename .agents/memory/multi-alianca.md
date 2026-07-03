---
name: Multiple alliances model
description: Torre Obscura moved from strict 1:1 alliance to multi-ally (max 3) with dissolve; how limits, pairing atomicity, and dissolve behave.
---

# Modelo de múltiplas alianças (Torre Obscura)

O sistema de aliança deixou de ser 1:1 e passou a permitir várias aliadas simultâneas.

- **Teto:** 3 aliadas simultâneas por cidadela (`MAX_ALIADAS`).
- **Limites são GLOBAIS, não por-aliada:** o limite diário de envio (300), os 2 empréstimos e os 2 reforços simultâneos são somados entre TODAS as aliadas. As queries de contagem por `fromPlayerId` (sem filtrar aliada) permanecem corretas justamente por isso.
  - **Why:** decisão explícita do usuário — múltiplas aliadas não devem multiplicar a capacidade de troca.
- **Unicidade do par:** unique composto em `(playerId, allyId)` (não mais `unique` em `playerId`). Cada aliança grava as DUAS direções.
- **Ações direcionadas:** enviar/emprestar/reforçar exigem `aliadaDeviceId`; o backend valida que existe vínculo entre as duas jogadoras antes de agir.
- **Desfazer:** remove as duas direções do par. Empréstimos/reforços em trânsito **sobrevivem** ao desfazer, porque `devolver` usa `origemExchangeId` e não exige vínculo ativo.

## Pareamento precisa ser atômico
`parear` faz checagem de duplicata + teto e insere dentro de UMA transação, com `SELECT ... FOR UPDATE` nas duas linhas de `players` (ids em ordem crescente para evitar deadlock). Fora de transação, requisições concorrentes furam o teto ou estouram o unique como erro 500.

**Why:** sem o lock, pareamentos paralelos passavam as pré-checagens e ultrapassavam 3 aliadas; corridas de duplicata viravam 500.

**How to apply:** qualquer regra "contar-depois-inserir" sobre alianças (teto, unicidade) deve rodar dentro da transação com lock nas linhas envolvidas; trate `code === "23505"` (unique violation do Postgres) como 409 determinístico, não deixe vazar.
