# Motor de Vida dos NPCs (`src/npc-engine`)

Módulo dono do comportamento de NPC. Objetivo de longo prazo: que os moradores
pareçam **pessoas vivas** — gerando tensão ao descartá-los ou forçá-los ao extremo.

## Arquitetura

- **Pipeline de sistemas (Strategy).** Cada subsistema implementa `SistemaVida` e é
  registrado em `SISTEMAS_VIDA`; `tickNpcs(ctx)` roda todos **uma vez por dia de jogo**
  (o pipeline É o "tick interno" — sem sub-tick; seguro para o catch-up offline).
- **Direção de dependência (sem ciclos):** `GameContext → npc-engine → game-data`.
  O módulo importa tipos/constantes de `game-data` e **re-exporta** os helpers de
  domínio (façade). `game-data` **nunca** importa do motor.
- **Layout:** `tick.ts` (driver/tipos), `systems/{decaimento,traicao,convivio}.ts`,
  `relationships.ts`, `houses.ts`, `grief.ts`, `mood.ts`, `fama.ts`, `index.ts` (façade).

## ✅ Done (Fase 1)

- **Extração do `processDay`** para o motor (fórmulas idênticas): fome/inanição,
  sanidade de edifícios, recuperação de fadiga, passivas diárias (berserker/oráculo),
  lealdade pela moral, clamps → `systems/decaimento.ts`; traição → `systems/traicao.ts`.
  O `processDay` agora só monta `CondicoesColonia` e chama `tickNpcs`.
- **Relacionamentos** (`relationships.ts`): afinidade por par em `GameState.relacionamentos`
  (−100..100), chave canônica `parKey`, `getAfinidade`/`ajustarAfinidade`/`vinculosDe`.
- **Convívio** (`systems/convivio.ts`): afinidade cresce entre quem compartilha posto /
  última expedição / casa; atrito em fome/superlotação; logs de vida esparsos.
- **Luto** (`grief.ts` `aplicarLuto`): ao morrer, quem tinha vínculo positivo perde
  sanidade/lealdade. Ligado em: inanição (decaimento), expedição (2 pontos), câmara.
- **Casas / nobreza** (`houses.ts` `promoverParaNobre`): ao ser promovido a Raro+ no
  treino/estudo, o plebeu é **adotado** por uma casa nobre a que tem vínculo forte
  (afinidade ≥ `LIMIAR_ADOCAO`), ou, com `fama ≥ FAMA_CASA` e rolagem rara
  (`CHANCE_FUNDAR_CASA`), **funda a própria casa**; senão herda sobrenome próprio.
- **Fama** (`fama.ts` `registrarFeito`): acumulada por sobreviver a expedição, vencer
  câmara e treinar. Habilita fundar casa.
- **Humor** (`mood.ts` `humorDe`): rótulo derivado de sanidade/lealdade/fadiga.
- **Dados**: `NPC.sobrenome/casaFundador/fama`, `GameState.relacionamentos`;
  `gerarNomeNpc` separa `{nome, sobrenome}`. Migração no `continueGame`
  (init de `relacionamentos`/`fama` + backfill de casa em nobres legados).
- **UI** (`pages/People.tsx`): card expandido mostra **Poder**, efeito da **habilidade**,
  stat dominante, e **Humor / Casa / Vínculos**.
- **Testes**: `src/npc-engine/npc-engine.test.ts` (relacionamentos, convívio, decaimento,
  traição, luto, adoção/fundação/fallback, humor). `pnpm --filter @workspace/torre-obscura run test`.
- **Luto na guerra** (opção (a) do plano): `avancarGuerra` retorna `ResultadoDiaGuerra`
  (`{ logs, mortos, vitoriaIds? }`); o `GameContext` aplica `aplicarLuto` nos mortos do dia
  e registra `guerra_vencida` nos sobreviventes da vitória. Feito `andar_conquistado`
  registrado na vitória de expedição em modo avançar. Testes em `game-data.test.ts`.
- **Vínculos tipados** (`systems/vinculos-tipados.ts`): amizade (af ≥ 50) e rivalidade
  (af ≤ −40) derivadas da afinidade; **romance** e **mentoria** são arcos persistidos em
  `GameState.vinculosEspeciais` (chave `parKey`), criados pelo sistema com rolagem rara
  (máx. 1 arco/dia — protege o catch-up) e dissolvidos se a afinidade cair abaixo de 20.
  Efeitos: luto de romance dói o dobro (`grief.ts`); `bonusMentor` dá +1 no ganho de
  treino/estudo quando um mentor vivo supera o aprendiz no stat treinado. UI mostra o
  tipo no card (`People.tsx`). Consulta via `tipoVinculo(state, a, b)`.
- **Convívio com impacto** (Fase 3): `fatorHumor` (`mood.ts`) escala produção
  (injetado em `getEfeitos` via parâmetro `fatorNpc` — sem ciclo de import) e o poder
  individual na expedição; vínculo forte (af ≥ `AF_AMIZADE`) dá 30% de chance de salvar
  um companheiro sorteado para morrer na expedição (`tentarResgateVinculo`, GameContext);
  **eventos sociais raros** (`systems/eventos-sociais.ts`): brigas, reconciliações e juras
  de lealdade, máx. 1/dia; buff de câmara agora também enobrece
  (`promoverEnobrecer(s, npc, null)` no bloco `buff_permanente`).

## ⏳ TODO / Fases futuras

### 1. Migrar os corpos do domínio para o módulo
Hoje `generateNPC`, `calcNpcPower`, `getProfissao`, treino etc. ainda **residem** em
`game-data.ts` e são re-exportados pela façade. Passo futuro: mover os corpos para
`npc-engine/domain.ts` e fazer `game-data` re-exportar do módulo (cuidando para não
reintroduzir ciclos — mover junto os tipos base se necessário).

### 2. Balanceamento
Revisar constantes: deltas de convívio (`CONVIVIO_*`, `ATRITO`), `LIMIAR_ADOCAO`,
`FAMA_CASA`/`CHANCE_FUNDAR_CASA`, penalidades de luto (`grief.ts`), chances dos novos
arcos/eventos (`vinculos-tipados.ts`, `eventos-sociais.ts`) e os degraus de `fatorHumor`
(`mood.ts`). Idealmente com telemetria/observação de partidas.

## Como estender (checklist)

1. Criar `systems/<novo>.ts` exportando um `SistemaVida` (`processarDia(ctx)` puro,
   usando `ctx.rng`/`ctx.log`, mutando `ctx.draft`).
2. Registrar em `SISTEMAS_VIDA` (`tick.ts`) na ordem correta.
3. Se precisar de estado novo, adicionar campo opcional em `GameState`/`NPC`
   (`game-data.ts`) + migração em `continueGame`.
4. Testes em `npc-engine.test.ts` com `rng` semeado.
5. `pnpm --filter @workspace/torre-obscura run typecheck && run test`.
