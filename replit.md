# Torre Obscura

Jogo de simulação e gerenciamento em texto com estética terminal cyberpunk. O jogador é o Observador — monitora um grupo de humanos que tenta conquistar uma torre mística de 20 andares.

## Run & Operate

- `pnpm --filter @workspace/torre-obscura run dev` — run the game frontend (port auto-assigned)
- `pnpm --filter @workspace/torre-obscura run typecheck` — typecheck the frontend
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS
- Font: JetBrains Mono (Google Fonts)
- State: React useState + localStorage (key: `torre_obscura_save`)
- Routing: wouter (single "/" route, tab navigation in React state)

## Where things live

- `artifacts/torre-obscura/src/context/GameContext.tsx` — all game state, idle loop, day processing, expedition and building mechanics
- `artifacts/torre-obscura/src/lib/game-data.ts` — floor data, building costs, NPC generation, initial state
- `artifacts/torre-obscura/src/pages/` — 6 screens: TitleScreen, Dashboard, Tower, Citadel, People, LogScreen + GameOver
- `artifacts/torre-obscura/src/components/layout/BottomNav.tsx` — fixed bottom navigation (5 tabs)
- `artifacts/torre-obscura/src/index.css` — full cyberpunk palette, JetBrains Mono import

## Architecture decisions

- **Frontend-only**: No backend. All state stored in localStorage as a single JSON object.
- **Functional setState in idle loop**: `advanceDay` uses `setState(prev => ...)` functional form to avoid stale closure in the setInterval callback.
- **Day processing order**: food consumption → building production → fatigue recovery → moral/loyalty drift → betrayal checks → random events → emergency summons → warehouse overflow → day increment → game over check.
- **Permanent death**: NPC death triggers -5 global moral and -3 sanidade for all surviving NPCs.
- **Offline progress**: On load, calculates missed days from `lastTimestamp`, processes up to 30 days.

## Product

- 6 telas com barra de navegação inferior fixa: Obs / Torre / Cidadela / Povo / Log
- Loop idle: tempo avança sozinho (1x/2x/5x) ou via botão "AVANÇAR DIA"
- Sistema de expedição: seleção de NPCs, cálculo poder vs dificuldade, mortes permanentes
- Construção de edifícios: Fogueira, Fazenda, Enfermaria, Quartel, Templo, Armazém (3 níveis)
- Vitória: conquistar o andar 20. Derrota: todos os NPCs mortos.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The interval in GameContext depends on `velocidade/gameOver/vitoria` — changing speed correctly recreates the interval with the new delay.
- Building validation happens in context (not just UI) — buildEdificio guards affordability and duplicate builds.
- Expedition validation happens in context — sendExpedition guards food cost and NPC eligibility.
- If localStorage save is corrupted, continueGame clears it and starts a fresh game.
- After each OpenAPI spec change, re-run codegen: `pnpm --filter @workspace/api-spec run codegen`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
