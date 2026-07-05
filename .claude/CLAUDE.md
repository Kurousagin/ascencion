# Torre Obscura — Guia de Implementação

## Visão Geral

**Torre Obscura** é um jogo de sobrevivência e gerenciamento em uma torre mística de 20 andares. Jogadores guiam moradores (NPCs) através de andares progressivos, gerenciando recursos, segurança e moral. O jogo é 100% client-simulated (PWA), com backend mínimo apenas para multiplayer assíncrono (aliança).

**Stack**: React 19 + Vite 7 (PWA) | Express 5 | Postgres 16 + Drizzle ORM | TypeScript 5.9 | Tailwind 4

---

## Arquitetura

### Frontend (`artifacts/torre-obscura/`)
- **GameContext.tsx**: simulação core (game loop, processDay, offline catch-up)
- **AllianceContext.tsx**: multiplayer assíncrono (perfil, aliadas, caixa de trocas, empréstimos)
- **WarContext.tsx**: descoberta de rivais e sistema de guerra
- **Contexts suplementares**: PioneerContext (leaderboard), UI contexts (toast, etc.)
- **Service Worker** (`public/sw.js`): asset caching + Web Push handlers
- **localStorage**: `torre_obscura_save` (GameState), `torre_obscura_device_id` (identidade), diversos outros flags

### Backend (`artifacts/api-server/`)
- **Express 5** com CORS, pino logging, drizzle ORM
- **Routes**: `/api/alianca/*` (aliança), `/api/guerra/*` (rivais), `/api/pioneer/*`, `/api/primordial/*`, `/api/notificacoes/*`
- **Scheduler**: `/internal/notificacoes/executar-ciclo` (cron-triggered, autenticado por CRON_SECRET)
- **Sem estado de jogo**: servidor é stateless, apenas store + relay de multiplayer

### Database (`lib/db/`)
- **Drizzle ORM** com migrations geradas via `drizzle-kit`
- **Tabelas**: `players`, `alliances`, `exchanges`, `botCitadels`, `milestones`, `primordialClaims`, `push_subscriptions`
- **Identidade**: `deviceId` (UUID), anônima por design (sem auth)

### API Contract (`lib/api-spec/`)
- **OpenAPI 3.1** em `openapi.yaml`
- **Codegen**: `orval` gera `lib/api-zod/*` (Zod schemas) + `lib/api-client-react/*` (React Query hooks)
- **Fluxo**: edita YAML → `pnpm --filter @workspace/api-spec run codegen` → regenera tipos

---

## Lore & Game Design

### Mundo
- **Torre Obscura**: estrutura de 20 andares (phase 1) ou 40 (T2 desbloqueado)
- **Moradores (NPCs)**: sobreviventes com profissões (combatente, batedor, erudito, sentinela), raridade, stats
- **Recursos**: comida, madeira, pedra, ferro. Necessários para construção, consumo, trade
- **Dinâmica**: exploração, construção, guerra, aliança, lore (codex primordial)

### Game Loop
1. **Dia (day)**: unidade base de tempo. 1 dia real = 2h (velocidade 1x), ajustável (2x, 5x)
2. **Tick (processDay)**:
   - Consumo de comida
   - Starvation/morte
   - Morale decay, sanidade
   - Traição (roubo, sabotagem)
   - Eventos aleatórios (descoberta, sussurro)
   - Exploração autônoma
   - Resolução de guerra (invasão responde, resolução)
3. **Offline catch-up**: ao reabrir, `continueGame()` replica `processDay()` até 40 dias, capped
4. **Log**: cada evento gera entrada em `state.log` com tipo (morte, descoberta, traição, evento, vitória, alerta, info)

### Profissões
```typescript
type ProfissaoId = 'combatente' | 'batedor' | 'erudito' | 'sentinela';
```
- **Combatente**: ataque, defesa (guerra)
- **Batedor**: exploração, descoberta
- **Erudito**: lore, codex
- **Sentinela**: vigilância, segurança

### Aliança (Multiplayer Assíncrono)
- **Identidade**: deviceId (UUID único por device)
- **Pareamento**: código 6-char compartilhável (ex: "ABC123")
- **Trocas**:
  - **Recursos**: transfer com taxa de torre (15%)
  - **Emprestimo**: morador por 3-60 dias, com registro
  - **Reforço**: morador para 1 expedição, retorna após
  - **Retorno**: devolução com possível óbito
- **Sincronização**: caixa polled a cada 15s, resumo da cidadela atualizado

### Guerra
- **Descoberta**: rival bot selecionado com poder compatível
- **Invasão**: rival declara guerra, 3 dias de prazo para responder
- **Resolução**: auto-defense ou manual, combate baseia em poder (army strength)
- **Loot**: recursos, moradores prisioneiros

---

## Padrões de Código

### Naming & Conventions
- **Componentes/Types**: PascalCase
- **Funções/Hooks**: camelCase
- **Constantes**: SCREAMING_SNAKE_CASE
- **DB tables**: snake_case (auto via Drizzle)
- **Idioma**: Portuguese (Brasil) em strings de UI, English em code comments (sparse)

### GameContext Pattern
```typescript
// State é immutable-by-design, mutações via produce (Immer)
const [state, setState] = useState<GameState>(initialState);

const someAction = (payload: X) => {
  setState(s => {
    const draft = produce(s, draft => {
      // mutate draft freely
      draft.field = newValue;
      draft.log.push({id, tipo, mensagem, dia: draft.dia});
    });
    saveState(draft); // persist to localStorage
    return draft;
  });
};
```

### Route Pattern (Express + Zod)
```typescript
router.post('/endpoint', async (req, res): Promise<void> => {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { field } = parsed.data;

  try {
    const result = await db.select(...).from(...);
    const response = ResponseSchema.parse(result);
    res.json(response);
    req.log.info({...}, 'Action description');
  } catch (e) {
    res.status(500).json({ error: 'msg' });
  }
});
```

### Schema Pattern (Drizzle)
```typescript
export const exampleTable = pgTable('example', {
  id: serial('id').primaryKey(),
  deviceId: text('device_id').notNull().unique(),
  createdAt: timestamp('created_at', {withTimezone: true}).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', {withTimezone: true})
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Example = typeof exampleTable.$inferSelect;
export type InsertExample = typeof exampleTable.$inferInsert;
```

### Context Hook Pattern
```typescript
export function useCustom() {
  const ctx = useContext(CustomContext);
  if (!ctx) throw new Error('useCustom must be within CustomProvider');
  return ctx;
}

// Always pair with Provider wrapping at tree level
export const CustomProvider = ({ children }) => {
  const [state, setState] = useState(...);
  const value: ContextType = { state, action: () => {...} };
  return <CustomContext.Provider value={value}>{children}</CustomContext.Provider>;
};
```

---

## Web Push Notifications

### Tiers
1. **Tier 1 (Genérico)**: lembrete após 8h inatividade, cooldown 20h
2. **Tier 2 (Evento)**: invasão, guerra, comida esgotando, lookahead 4h
3. **Tier 3 (Aliança)**: suprimentos, emprestados, reforços chegando, imediato

### Fluxo
- Frontend ativa: POST `/api/notificacoes/inscrever` com `{deviceId, endpoint, p256dh, auth}`
- Cliente detecta evento: PATCH `/api/notificacoes/proximo-evento` com `{nextEventAt, nextEventText}`
- Scheduler (GitHub Actions 2h): POST `/internal/notificacoes/executar-ciclo` → dispara via web-push

### Config
- **VAPID_PUBLIC_KEY**, **VAPID_PRIVATE_KEY**, **VAPID_SUBJECT** (env vars)
- **CRON_SECRET** (header auth para endpoint interno)

---

## Desenvolvimento

### Setup Local
```bash
# Install
pnpm install

# Env vars
export $(cat .env | xargs)

# DB migrations
pnpm --filter @workspace/db run push

# Dev servers
pnpm --filter @workspace/api-server run dev  # :8080
pnpm --filter @workspace/torre-obscura run dev  # :5173 (Vite)
```

### Code Changes
1. **New feature**: explore existing patterns first (GameContext, AllianceContext, etc.)
2. **Reuse**: check `lib/game-data.ts` (all formulas), helpers, existing reducers
3. **Refactor cautiously**: game loop is fragile; test offline catch-up
4. **OpenAPI changes**: edit YAML → codegen → use generated types (never hand-edit `generated/*`)
5. **TypeCheck**: `pnpm -w run typecheck` before commit

### Testing
- **Game loop**: close app after action, reopen → verify state catch-up
- **Alliance**: send item from one device, verify received on another (15s poll)
- **War**: declare, inspect rival, resolve
- **Push**: manually trigger `/internal/notificacoes/executar-ciclo` or wait for scheduler

### Git Workflow
- **Branch**: `ps/feature-name` (prefix `ps/` per project convention)
- **Commit message**: concise, imperative tense, include `Co-Authored-By` for Claude
- **PR**: link to exploratory notes or issues; include verification steps
- **Merge**: squash if multiple commits are scaffolding; keep history clean

---

## Common Gotchas

### Game State Persistence
- `saveState()` must be called after mutations (auto in produce blocks)
- `localStorage` key is `torre_obscura_save`; corrupt data breaks boot
- Offline catch-up runs **synchronously**; cap is 40 days to avoid UI hang

### Alliance Multiplayer
- `exchanges` poll every 15s; don't expect real-time (propagation delay ~30s)
- `deviceId` is permanent per browser; clearing localStorage = new identity
- Bidirectional links in `alliances` table (both A→B and B→A); redundancy is intentional

### Service Worker
- Registered only in production (`import.meta.env.PROD`)
- Asset cache versioned (`CACHE_NAME`); bump on any SW change
- API routes (*/api/*) explicitly bypassed from caching

### Drizzle Migrations
- Generate via `drizzle-kit generate`; apply via `pnpm --filter @workspace/db run push`
- Use transactions for complex updates (see `parearAlianca` route example)
- Always include `createdAt`/`updatedAt` timestamps

---

## Deployment

### Render
- **Build**: Docker, root `Dockerfile` + `fly.toml` config
- **Secrets**: via Render dashboard (VAPID_*, CRON_SECRET, DATABASE_URL)
- **Scale**: min_machines = 0 (auto-stop); cron wakes it up
- **DB**: Postgres 16, provisioned separately

### GitHub Actions
- **Cron**: `.github/workflows/push-notifications-cron.yml` every 2h
- **Secret**: `CRON_SECRET` in repo settings
- **Endpoint**: `https://ascencion.onrender.com/internal/notificacoes/executar-ciclo`

---

## Resources

- **Game Rules**: `lib/game-data.ts` (2600+ lines, exhaustive)
- **Lore**: log entries, codex fragments, primordial storyline
- **UI Kit**: Radix + Tailwind, custom components in `src/components/`
- **Schema Diagram**: each table in `lib/db/src/schema/*.ts` is self-contained

---

**Last Updated**: 2026-07-05 · **Maintainers**: Kurousagin
