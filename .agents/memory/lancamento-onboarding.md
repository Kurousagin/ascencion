---
name: Sistema de lançamento e onboarding
description: Evento de lançamento de temporada (NPC especial + bônus) e tutorial de onboarding — arquitetura, fluxo e decisões de design.
---

## Onboarding Tutorial

**Componente:** `src/components/Onboarding.tsx` — 8 slides, Radix Dialog, Framer Motion.
**Constantes de storage:** `src/lib/onboarding-keys.ts` — fonte única de verdade.
- `ONBOARDING_KEY` (localStorage): marcado após primeira exibição → suprime auto-open futuro.
- `ONBOARDING_PENDING` (sessionStorage): sinal transitório deixado pelo TitleScreen para o MainGameArea.

**Fluxo crítico (por que sessionStorage):** `MainGameArea` monta quando `state=null` e exibe `TitleScreen`. Quando o usuário clica "NOVO JOGO", `startNewGame()` seta o state → TitleScreen desmonta → MainGameArea não remonta (já estava montado). Por isso o flag de "mostrar onboarding" não pode ser lido no mount — é lido no `useEffect([state])` que dispara quando `state` muda de null para não-nulo.

**Why:** Um `useEffect([])` leria o sessionStorage antes do TitleScreen setar o flag. O `useEffect([state])` lê depois da transição.

**Dois pontos de entrada:**
1. Após novo jogo (primeira vez): MainGameArea lê ONBOARDING_PENDING em `useEffect([state])`.
2. Botão "COMO JOGAR" no TitleScreen: estado local `onboardingOpen`, funciona sem state de jogo.

## Sistema de Lançamento de Temporada

**Arquivo de configuração:** `src/lib/lancamento.ts` — edite `LANCAMENTO_ATIVO` para cada temporada.
- Defina `null` para desativar o evento de lançamento fora do período.
- Para Temporada II: substituir o objeto `LANCAMENTO_ATIVO` por um novo.

**NPC especial de lançamento:**
- `NPC.lancamento?: boolean` adicionado ao tipo em `game-data.ts`.
- Criado em `startNewGame(lancamento?)` no GameContext com stats fixos (15/12/11/15), fadiga=0, lealdade=100, sanidade=100.
- `processDay` starvation death: `if (n.lancamento) return;` — imune à inanição.
- `sendExpedition` vitória e derrota: `mort *= 0.1` se `n.lancamento` — chance de morte 10× menor.

**How to apply:** Para nova temporada, crie um novo objeto `LancamentoTemporada` e atribua a `LANCAMENTO_ATIVO`. Não há mudanças de schema no GameState. A migração em continueGame já inicializa `lancamento: false` em NPCs de saves antigos.

## Arquivos criados
- `src/lib/lancamento.ts`
- `src/lib/onboarding-keys.ts`
- `src/components/Onboarding.tsx`
- `src/components/LancamentoModal.tsx`
