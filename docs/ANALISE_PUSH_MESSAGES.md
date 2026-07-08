# Análise — Implementação das Push Messages

Revisão da implementação atual de Web Push (notificações). Objetivo: mapear o
fluxo, apontar bugs/riscos e priorizar correções. Nenhuma alteração de código
neste PR — é um documento de análise.

## Arquitetura (como funciona hoje)

**Frontend** (`artifacts/torre-obscura/`)
- `main.tsx:15` — registra o Service Worker (`/sw.js`) só em produção.
- `public/sw.js` — cache de assets + handlers `push` e `notificationclick`.
- `lib/push-notifications.ts` — `subscribeToPush`/`unsubscribeFromPush`/`updateNextEvent` + helpers de permissão.
- `pages/Dashboard.tsx` — toggle de ativar/desativar notificações.
- `hooks/useNotificationsHeartbeat.ts` — mantém `lastActiveAt` fresco (re-inscreve no mount/visibilidade).
- `hooks/useTier2EventUpdate.ts` — no `visibilitychange→hidden`, calcula o próximo evento (invasão / guerra / comida acabando) e faz `PATCH /proximo-evento`.
- `context/AllianceContext.tsx:206` — Tier 3: ao detectar novas trocas de aliança, `PATCH /proximo-evento` com timestamp "agora".

**Backend** (`artifacts/api-server/`)
- `routes/notificacoes.ts` — `GET /chave-publica`, `POST /inscrever` (upsert por `deviceId`), `POST /desinscrever`, `PATCH /proximo-evento` (grava próximo evento e, se ≤ 1 min, dispara push imediato — Tier 3).
- `app.ts:35` — `POST /internal/notificacoes/executar-ciclo` protegido por header `X-Cron-Secret` == `CRON_SECRET`.
- `lib/push-tick.ts` — `runNotificationTick()`: varre inscrições e envia Tier 1 (genérico por inatividade) e Tier 2 (evento em lookahead 4 h).

**Infra**
- `lib/db/src/schema/pushSubscriptions.ts` — tabela `push_subscriptions` (deviceId único, chaves, `lastActiveAt`, `lastNotifiedAt`, `nextEventAt`, `nextEventText`, `lastNotifiedEventAt`).
- `.github/workflows/push-notifications-cron.yml` — cron a cada 2 h chama o endpoint interno.
- Contrato em `lib/api-spec/openapi.yaml` + tipos gerados (`@workspace/api-zod`). ✅

## Bugs e riscos (priorizados)

### 🔴 CRÍTICO — Timing do Tier 2 está 12× errado
`hooks/useTier2EventUpdate.ts` calcula `msPerDay = (24*60*60*1000) / state.velocidade`,
mas a duração real de um dia de jogo é **2 h** na base (`GameContext.tsx:136`
`MS_PER_GAME_DAY_BASE = 2h`, `getMsPerDay = 2h/velocidade`). Ou seja, o `nextEventAt`
previsto fica **12× mais no futuro** do que o evento real.
Consequência: o `runNotificationTick` (lookahead de 4 h) quase nunca vê o evento a
tempo; quando dispara, o evento (comida acabando, prazo de invasão) já passou há
horas. **O Tier 2 essencialmente não funciona.**
→ **Fix:** importar/replicar `getMsPerDay(velocidade)` (2 h base) no hook, em vez de 24 h.

### 🟠 ALTO — Dedup de evento compara `Date` por referência
`lib/push-tick.ts:92` e `:103` usam `sub.lastNotifiedEventAt !== sub.nextEventAt`.
São dois objetos `Date` distintos → `!==` é **sempre verdadeiro** (comparação de
referência). O guarda "já notifiquei este evento" nunca detecta duplicata, então o
mesmo evento é reenviado **a cada tick** enquanto `nextEventAt` estiver na janela.
→ **Fix:** comparar por valor: `sub.lastNotifiedEventAt?.getTime() !== sub.nextEventAt?.getTime()`.

### 🟠 ALTO — Tier 3 pode duplicar (imediato + cron) e marca timestamp errado
No caminho imediato (`routes/notificacoes.ts:164`) grava `lastNotifiedEventAt = now`,
mas `nextEventAt` foi setado como outro `new Date()`. No cron, além do bug de
referência acima, mesmo corrigido os dois `getTime()` diferem por milissegundos →
o cron reenviaria o mesmo evento de aliança. → **Fix:** gravar `lastNotifiedEventAt = nextEventAt`
(o mesmo valor), e manter a comparação por `getTime()`.

### 🟠 ALTO — Service Worker sem `pushsubscriptionchange`
`public/sw.js` não trata o evento `pushsubscriptionchange`. Quando o navegador
rotaciona/expira a subscription, o cliente **perde o push silenciosamente** até
reabrir o app e o heartbeat re-inscrever. → **Fix:** adicionar handler que re-inscreve
com a chave VAPID e re-envia ao `/inscrever` (precisa da chave pública embarcada ou
buscada; avaliar guardar deviceId acessível ao SW).

### 🟡 MÉDIO — Heartbeat não atualiza com app aberto e visível
`useNotificationsHeartbeat.ts` só dispara no mount e no `visibilitychange`. Não há
`setInterval` (apesar de `HEARTBEAT_INTERVAL_MS`). Com o app aberto e visível por
horas, `lastActiveAt` não é renovado → após 8 h o servidor considera "inativo" e pode
mandar lembrete Tier 1 a quem está jogando. → **Fix:** adicionar um `setInterval` de
~30 min (respeitando o throttle) e/ou um POST leve só de `lastActiveAt`.

### 🟡 MÉDIO — `runNotificationTick` carrega todas as inscrições
`lib/push-tick.ts:69` tem o filtro de cooldown **comentado**; a query traz todas as
`enabled` e filtra em JS. Não escala (memória/tempo lineares com a base) e envia em
paralelo sem limite (`Promise.allSettled`). → **Fix:** empurrar os filtros de
elegibilidade para o SQL (`lastActiveAt`, `lastNotifiedAt`, `nextEventAt`) e enviar em
lotes com concorrência limitada.

### 🟡 MÉDIO — Segredo do cron comparado sem tempo constante
`app.ts:38` faz `cronSecret !== authHeader` (string). Vulnerável a timing attack
(baixo risco sobre HTTPS) e falha se o header vier duplicado (array). → **Fix:**
normalizar o header e comparar com `crypto.timingSafeEqual`.

### 🔵 BAIXO
- **SW ignora `tag`/`icon`/`badge` do payload** (`sw.js:65`, hardcoded). O Tier 3
  (`notificacoes.ts:143`) envia esses campos à toa; o `tag` fixo ainda **coalesce**
  notificações distintas numa só.
- **`subscribeToPush` a cada heartbeat** é pesado (re-fetch da chave + `pushManager.subscribe` + POST). Um endpoint leve de "ping" seria melhor.
- **`updateNextEvent` é fire-and-forget** (`push-notifications.ts:148`) sem checar `res.ok`; `getKey()` pode ser `null` e é casteado direto.
- **`notificationclick`** foca a janela existente mas **não navega** para `data.url`.
- **`event.data.json()`** (`sw.js:63`) pode lançar se o payload não for JSON.
- **Sem rate-limit** em `/inscrever` e `/proximo-evento`; `deviceId` é público e
  forjável → é possível escrever no registro de outro dispositivo. Risco baixo dado o
  design anônimo, mas convém limitar.

## O que está bom ✅
- Upsert idempotente por `deviceId` (`onConflictDoUpdate`).
- Limpeza de subscriptions mortas em 404/410 (imediato e cron).
- Timeout por envio no cron (`PER_SEND_TIMEOUT_MS`).
- Endpoint interno protegido por segredo; cron isolado no GitHub Actions.
- Contrato OpenAPI + Zod gerado; validação de body com `safeParse`.
- Bypass correto de `/api/*` e navegação network-first no SW.

## Cobertura de testes
**Nenhuma.** Não há testes para `push-tick`, rotas de notificação ou os hooks.
A lógica de elegibilidade (Tier 1/2/3, cooldowns, dedup) é pura o suficiente para
testar com `db` mockado ou extraindo a decisão para uma função pura
`decidirNotificacao(sub, now)` testável.

## Plano de correção sugerido (ordem)
1. **Timing Tier 2** (crítico, 1 linha de lógica) — usar `getMsPerDay`.
2. **Dedup por `getTime()`** no `push-tick` + gravar `lastNotifiedEventAt = nextEventAt` no caminho imediato.
3. **`pushsubscriptionchange`** no SW.
4. **Heartbeat com intervalo** + endpoint leve de atividade.
5. **Filtros de elegibilidade no SQL** + concorrência limitada.
6. **`timingSafeEqual`** no segredo do cron; **rate-limit** nos endpoints públicos.
7. **Extrair `decidirNotificacao` puro + testes**; corrigir os itens BAIXO.
