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

## Gacha de lançamento (v2)

O NPC já não é dado diretamente — passa por um gacha gratuito de 3 cartas (flip CSS 3D).

**Pool:** `primordial` (Valdris, 5% via `chanceValdris`) + `marcados[]` (5 Sobreviventes Marcados).
**Fluxo de fases:** `ritual → revelando → lore → stats → confirmar`
- Fase `lore`: card full-screen com `cardLore[]` + `cardLoreFinal` (só Primordiais).
- Fase `stats`: atributos + badge IMORTAL (se `primordial: true`).

**Garantia de atomicidade:**
- `GACHA_LANCAMENTO_RESULT` (localStorage): sorteio gravado antes de qualquer interação.
- `GACHA_LANCAMENTO_DONE` (localStorage): gravado APÓS `adicionarNpcLancamento` ter sucesso.
- Recovery automático: se player refresca mid-ritual, App.tsx detecta RESULT sem DONE e reabre gacha na fase `lore`.

**`startNewGame(lancamento)`** não cria mais NPC — só aplica bônus de recursos/moral.
**`adicionarNpcLancamento(NpcLancamento)`** cria o NPC completo e o adiciona ao estado.

## Arquivos criados/modificados
- `src/lib/lancamento.ts` — estrutura com primordial + marcados pool + cardLore
- `src/lib/onboarding-keys.ts` — GACHA_LANCAMENTO_DONE/PENDING/RESULT
- `src/components/GachaLancamento.tsx` — gacha experience completa
- `src/components/LancamentoModal.tsx` — sem NPC card; botão "REALIZAR O RITUAL"
- `src/components/Onboarding.tsx`
- `src/context/GameContext.tsx` — adicionarNpcLancamento + startNewGame refatorado
