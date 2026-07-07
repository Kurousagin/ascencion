# Torre Obscura — Reestruturação de Arquitetura
### Padrões de projeto escolhidos: Módulos por Domínio + Facade + Reducers por Fatia (+ Factory pontual)

> Este documento define **como** o código vai deixar de estar concentrado em `game-data.ts` (4000+ linhas) e `GameContext.tsx` (1700+ linhas), e complementa (não substitui) o plano de centralização de texto em `lore-content.ts` já combinado antes. Serve de referência pra qualquer sessão futura que for mexer na estrutura do projeto.
>
> **Contexto que motivou a escolha:** os dois bugs encontrados na revisão de gameplay (Codex com capítulos hardcoded `[1,2,3,4]`, ignorando T2; Câmaras Secretas com lookup por chave errada `CAMARAS_SECRETAS[f.floor]`) nasceram exatamente porque **não existe uma camada única de acesso aos dados** — cada componente reimplementa sua própria lógica de "qual capítulo pertence a essa temporada", "qual câmara pertence a esse andar", etc. Os padrões abaixo existem pra isso não se repetir.

---

## 0. Padrões avaliados e descartados

- **ECS (Entity-Component-System):** não se aplica. ECS compensa quando há milhares de entidades homogêneas atualizadas por frame (jogos de ação/simulação em tempo real). Torre Obscura é idle-sim por turno/dia, com dezenas de NPCs de forma fixa — adotar ECS seria reescrever a arquitetura toda pra resolver um problema inexistente aqui.
- **Redux/Zustand como biblioteca nova:** não é necessário trocar de tecnologia. O `GameContext.tsx` já usa Immer (drafts) — o problema é de **organização interna**, não da ferramenta. O padrão de *reducers por fatia* (abaixo) resolve isso sem trocar de lib.

## 1. Padrões escolhidos (resumo)

| Padrão | Resolve | Onde se aplica |
|---|---|---|
| **Módulos por domínio** | Arquivo gigante, difícil de navegar/revisar | Quebrar `game-data.ts` em vários arquivos coesos |
| **Facade** | Cada componente reimplementando acesso aos dados (causa raiz dos 2 bugs) | Nova camada `lib/facades/` entre dados e UI |
| **Reducers por fatia** ("slices", sem precisar de lib nova) | `GameContext.tsx` fazendo tudo num contexto só | Quebrar lógica de mutação de estado por domínio |
| **Factory** (pontual) | Garantir consistência ao criar NPCs/Habitantes-Âncora novos | Criação de NPC e das novas Âncoras de T2/T3 |

---

## 2. Módulos por domínio — nova estrutura de `lib/`

Estrutura atual (tudo em `game-data.ts`) vira:

```
src/lib/
  lore-content.ts        // (já combinado antes) — só texto narrativo puro, zero mecânica
  habitantes.ts           // HABITANTES + HABITANTE_ESCOLHAS (mecânica; texto vem de lore-content.ts)
  bosses.ts               // BOSS_ECO_LORE, FLOOR_BOSS
  camaras-secretas.ts      // CAMARAS_SECRETAS (+ verificarRequisitoCamara)
  codex.ts                 // CODEX_FRAGMENTOS, SUSSURROS_POR_CAPITULO, TEMPORADAS, CAPITULO_NOMES, totalFragmentosTemporada, capituloDoAndar
  buildings.ts             // BUILDINGS, getEfeitos, POP_BASE, CAPACIDADE_BASE
  formulas.ts              // calcNpcPower, calcBiomaMultiplier, calcRecompensaAndar, calcCustoExpedicao, calcCustoInvocacao
  npc.ts                   // generateNPC, PROFISSOES, HABILIDADES, NAMES
  quests-ocultas.ts        // POOL_EXPLORACAO, POOL_VELOCIDADE, verificarQuestOculta
  types.ts                 // interfaces compartilhadas (HabitanteAndar, BuildingDef, FragmentoCodex, NPC, GameState, etc.)
  facades/
    lore-facade.ts          // ver seção 3
    edificios-facade.ts
    habitantes-facade.ts
  index.ts                  // reexporta tudo (import único pra quem só quer os dados brutos, sem quebrar imports existentes)
```

**Critério de corte usado:** cada arquivo corresponde a um "substantivo" do domínio do jogo (Habitantes, Câmaras, Codex, Edifícios), não a uma camada técnica genérica. Isso é o que já orientou a separação de `lore-content.ts` — aqui só se estende pro resto do arquivo.

**Migração sem quebrar nada:** `index.ts` reexporta tudo (`export * from './habitantes'`, etc.), então qualquer import existente tipo `import { HABITANTES } from '../lib/game-data'` continua funcionando trocando só o caminho pra `'../lib'` (ou mantendo `game-data.ts` como um arquivo-ponte que só faz `export * from './index'` durante a transição, se quiser trocar aos poucos em vez de tudo de uma vez).

---

## 3. Facade — camada única de acesso aos dados

Hoje `Tower.tsx` importa os `Record`s brutos e faz a lógica de filtro/lookup **dentro do componente**:
```tsx
// HOJE — lógica de domínio dentro do componente de UI
const capitulos = [1, 2, 3, 4]; // ← hardcoded, quebra em T2
{isBossFloor && CAMARAS_SECRETAS[f.floor] && ...} // ← chave errada
```

Isso passa a virar uma chamada de função de uma camada `facades/`, que é a única autorizada a indexar os `Record`s de dados diretamente. Componentes de UI nunca mais tocam em `CODEX_FRAGMENTOS`/`CAMARAS_SECRETAS` crus.

```ts
// lib/facades/lore-facade.ts
import { CODEX_FRAGMENTOS, CAPITULO_NOMES, TEMPORADAS } from '../codex';
import type { FragmentoCodex } from '../types';

/** Retorna os números de capítulo que realmente existem para uma temporada,
 *  derivados dos fragmentos cadastrados — nunca hardcoded. */
export function getCapitulosDaTemporada(temporadaNum: number): { numero: number; nome: string }[] {
  const numeros = [...new Set(
    Object.values(CODEX_FRAGMENTOS)
      .filter(f => f.temporada === temporadaNum)
      .map(f => f.capitulo)
  )].sort((a, b) => a - b);
  return numeros.map(n => ({ numero: n, nome: CAPITULO_NOMES[n] }));
}

export function getFragmentosDoCapitulo(temporadaNum: number, capitulo: number): FragmentoCodex[] {
  return Object.values(CODEX_FRAGMENTOS)
    .filter(f => f.temporada === temporadaNum && f.capitulo === capitulo)
    .sort((a, b) => a.ordem - b.ordem);
}
```

```ts
// lib/facades/camaras-facade.ts
import { CAMARAS_SECRETAS } from '../camaras-secretas';
import type { CamaraSecreta } from '../types';

/** Câmaras de um andar — chave composta 'floor_índice', nunca floor puro. */
export function getCamarasDoAndar(floor: number): CamaraSecreta[] {
  return Object.entries(CAMARAS_SECRETAS)
    .filter(([id]) => id.startsWith(`${floor}_`))
    .map(([id, cam]) => ({ id, ...cam }));
}
```

`Tower.tsx` passa a só chamar:
```tsx
const capitulos = getCapitulosDaTemporada(temporada.numero);
// ...
const camarasDoAndar = getCamarasDoAndar(f.floor);
{camarasDoAndar.map(cam => ( /* renderiza botão por câmara, suporta múltiplas por andar */ ))}
```

**Por que isso evita os bugs de novo:** a função `getCapitulosDaTemporada` e `getCamarasDoAndar` só existem **uma vez**, então se T3 adicionar capítulos 9-12 ou uma câmara nova, funciona automaticamente sem precisar lembrar de atualizar um array hardcoded em outro arquivo. O "hardcode" só pode existir se alguém escrever `[1,2,3,4]` de novo dentro do componente — e a revisão de código/PR passa a poder cobrar "isso devia vir do facade" como regra simples.

**Regra de ouro pra manter isso:** nenhum componente em `pages/` ou `components/` importa `CODEX_FRAGMENTOS`, `CAMARAS_SECRETAS`, `HABITANTES` etc. diretamente de `lib/` — só importa de `lib/facades/`. Isso pode até virar um lint rule (ESLint `no-restricted-imports`) se quiser forçar isso de verdade.

---

## 4. Reducers por fatia — quebrando o `GameContext.tsx`

Hoje o `GameContext.tsx` (1700+ linhas) mistura, num contexto React só: processamento de expedição, tentativa de vasculhar câmara, construção de edifício, avanço de dia (`processDay`), interação com Habitante, resolução de escolha, etc. — tudo manipulando o mesmo `draft` do Immer dentro do mesmo arquivo.

**Proposta:** manter o Context/Provider como está (não precisa trocar de tecnologia), mas extrair cada bloco de lógica de mutação para uma função pura de "reducer de fatia", que recebe o `draft` (ou o `state` + parâmetros) e devolve/mutação local — o Context vira só o orquestrador que chama essas funções.

```
src/reducers/
  expedicao-reducer.ts    // processarExpedicao(draft, floor, isFarming)  ← hoje é um bloco gigante dentro do GameContext
  camaras-reducer.ts      // tentarVasculharCamara(draft, camaraId)
  construcao-reducer.ts   // construirEdificio(draft, tipo)
  habitante-reducer.ts    // interagirHabitante(draft, floor), resolverEscolhaHabitante(draft, floor, opcao)
  day-reducer.ts          // processDay(draft)  ← consumo de comida, fadiga, moral, sanidade diários
```

```ts
// context/GameContext.tsx (depois da extração)
import { processarExpedicao } from '../reducers/expedicao-reducer';
import { tentarVasculharCamara } from '../reducers/camaras-reducer';
import { construirEdificio } from '../reducers/construcao-reducer';
// ...

function sendExpedition(floor: number, isFarming: boolean) {
  setState(produce(draft => { processarExpedicao(draft, floor, isFarming); }));
}
```

**Ganhos práticos:**
- Cada reducer fica pequeno o bastante pra revisar/testar isoladamente (hoje seria preciso ler o arquivo de 1700 linhas inteiro pra garantir que uma mudança em "construir edifício" não afeta "processar expedição" sem querer, mesmo estando em blocos separados dentro do mesmo arquivo).
- Fica trivial escrever teste unitário tipo `expect(tentarVasculharCamara(mockState, '4_1')).toMatchObject(...)`, sem precisar montar um Provider React inteiro.
- Quando T3 chegar com novos tipos de interação, só se cria `reducers/t3-nova-mecanica-reducer.ts`, sem tocar nos existentes.

---

## 5. Factory — criação consistente de NPCs e Habitantes-Âncora

`generateNPC` já existe e já cumpre parcialmente esse papel para NPCs recrutados. Proposta é estender o mesmo princípio para as **novas Âncoras de T2** (Andares 25/30/35, do plano de lore) e qualquer conteúdo futuro de T3: uma função de factory que garante que toda Âncora nova nasce com os campos obrigatórios coerentes entre si (entrada em `HABITANTES`, entrada correspondente em `CODEX_FRAGMENTOS` com `ordem` certa, tipo de quest válido), em vez de cada uma ser copiada manualmente e arriscar esquecer um campo (foi exatamente esquecer isso, em T2, que gerou a inconsistência nº 4/10 do documento de lore).

```ts
// lib/factories/habitante-factory.ts
interface AncoraConfig {
  floor: number;
  nome: string; papel: string; icone: string;
  loreKey: number;               // chave em HABITANTES_LORE (lore-content.ts)
  quest: HabitanteAndar['quest'];
}

export function criarAncora(cfg: AncoraConfig): { habitante: HabitanteAndar; codexEntry: FragmentoCodex } {
  return {
    habitante: {
      floor: cfg.floor, nome: cfg.nome, papel: cfg.papel, icone: cfg.icone,
      fala: HABITANTES_LORE[cfg.loreKey].fala,
      falamissão: HABITANTES_LORE[cfg.loreKey].falamissao,
      falaConcluso: HABITANTES_LORE[cfg.loreKey].falaConcluso,
      quest: { ...cfg.quest, lore: HABITANTES_LORE[cfg.loreKey].questLore },
    },
    codexEntry: {
      id: `hab_${cfg.floor}`, tipo: 'habitante', temporada: Math.ceil(cfg.floor / 20),
      capitulo: capituloDoAndar(cfg.floor), ordem: (cfg.floor % 20) / 5,
      titulo: cfg.nome, texto: HABITANTES_LORE[cfg.loreKey].questLore,
    },
  };
}
```

Isso é opcional/pontual — não precisa migrar os 39 Habitantes existentes pra esse formato agora (seria retrabalho sem ganho imediato), só usar esse padrão **a partir das 3 Âncoras novas de T2** e de todo conteúdo de T3 em diante, garantindo que a dupla "entrada mecânica + entrada de Codex" nunca mais saia dessincronizada.

---

## 5.5. Extensibilidade de Temporada — o que já funciona e o que trava T3 hoje

> **Nota de prioridade:** isso foi levantado numa revisão de código, não é um problema atual — a base de jogadores ainda é pequena e ninguém chegou perto do Andar 40 (nem do 15). Não precisa virar tarefa urgente. Registrando aqui só pra não se perder até o momento em que a base de jogadores crescer e a T3 realmente entrar em produção — nesse ponto, corrigir isso rápido evita ter que fazer sob pressão.

Essa pergunta ("isso foi pensado pra facilitar adicionar novas temporadas?") mereceu conferir o código de novo, porque os padrões das seções 2-5 ajudam mas **não são suficientes sozinhos** — achei um bloqueio real, só que sem urgência prática hoje.

### ✅ O que já está bem desenhado pra extensão
- `TEMPORADAS` já tem o comentário certo no código: *"Para adicionar uma nova temporada: inserir entrada em TEMPORADAS e os fragmentos correspondentes em CODEX_FRAGMENTOS — nenhuma mudança no GameState."* Isso é verdade hoje — `TemporadaData.andares: [primeiro, último]` e `CODEX_FRAGMENTOS` são de fato só dados.
- `capituloDoAndar(floor) = Math.ceil(floor / 5)` já é uma fórmula global (capítulo 1-8 cobre T1+T2 sem reset por temporada), então capítulos de T3 (9-12) nascem automaticamente certos, sem precisar tocar na função.
- O Facade proposto na seção 3 (`getCapitulosDaTemporada`) deriva os capítulos a partir dos dados — então o bug do Codex (`[1,2,3,4]` hardcoded) não vai se repetir quando T3 chegar, **desde que a correção use o facade e não outro hardcode local**.

### 🔴 O que travaria T3 quando chegar a hora — achado nesta revisão, sem pressa pra corrigir agora

**1. O jogo termina no Andar 40, não só a Temporada 2.**
```ts
// GameContext.tsx:805
if (s.andarAtual > 40) s.vitoria = true;
```
`vitoria` é uma flag **global de fim de jogo** — uma vez `true`, `processDay` e novas expedições param de rodar (`if (draft.gameOver || draft.vitoria) return draft;`, linha 207). Ou seja: hoje, passar do Andar 40 não "aguarda a próxima temporada", **encerra a partida permanentemente**. Quando a base de jogadores crescer e alguém chegar lá, T3 não seria "triggada automática" nesse estado — seria preciso resetar/migrar o save dessa jogadora manualmente.

**2. A tela trava numa mensagem fixa, sem checar se há mais conteúdo.**
```tsx
// Tower.tsx:87
if (state.andarAtual > 40) {
  return <div ...>ÁPICE ALCANÇADO</div>;
}
```
Isso faz um `return` antecipado que impede a tela de renderizar qualquer coisa depois do Andar 40 — de novo, hardcoded em `40`, sem olhar pra `TEMPORADAS`.

**3. `FLOORS` é gerado a partir de um array fixo de 40 posições.**
```ts
const BIOMA_POR_ANDAR: BiomaTipo[] = [ /* 40 entradas fixas */ ];
export const FLOORS = BIOMA_POR_ANDAR.map((bioma, i) => { ... });
```
Isso é esperado ter que crescer manualmente a cada temporada (bioma é conteúdo autoral, não dá pra gerar sozinho) — não é bug, mas significa que `FLOORS.length` é a fonte real de "andar máximo implementado", e é ela (não um literal `40` solto em 2 lugares diferentes) que devia ser consultada.

### Correção recomendada, pra quando fizer sentido priorizar — derivar o "topo" de um único lugar

```ts
// lib/facades/temporadas-facade.ts
import { TEMPORADAS } from '../codex';
import { FLOORS } from '../formulas';

/** Último andar com conteúdo implementado — cresce sozinho quando FLOORS crescer. */
export function getUltimoAndarImplementado(): number {
  return FLOORS.length; // ou Math.max(...Object.values(TEMPORADAS).map(t => t.andares[1]))
}

export function chegouAoTopoAtual(andarAtual: number): boolean {
  return andarAtual > getUltimoAndarImplementado();
}
```

E trocar os dois pontos hardcoded, quando for a hora:
- `GameContext.tsx:805` → `if (chegouAoTopoAtual(s.andarAtual)) s.aguardandoProximaTemporada = true;` (uma flag nova, **diferente** de `vitoria` — pausa a progressão de andar sem travar `processDay`/economia, permitindo a jogadora seguir jogando expedições de farm, construindo, etc., enquanto espera a próxima temporada — em vez de a partida "acabar").
- `Tower.tsx:87` → checar `chegouAoTopoAtual(state.andarAtual)` em vez de `> 40`, e mostrar uma mensagem que deixa claro que é "fim do conteúdo atual", não "fim de jogo" (ex.: "VOCÊ ALCANÇOU O LIMITE ATUAL DA TORRE — mais andares em breve", reaproveitando o tom do próprio `verdade_t1`: *"a Torre não termina... ela apenas muda"*).

Com isso, adicionar T3 (quando a lore e o design de T3 estiverem prontos) vira **só**: (1) estender `BIOMA_POR_ANDAR`/`FLOORS` com os andares 41-60, (2) adicionar a entrada `3` em `TEMPORADAS`, (3) popular `HABITANTES`/`BOSS_ECO_LORE`/`CODEX_FRAGMENTOS`/`CAMARAS_SECRETAS` de 41-60 (dados, via os módulos da seção 2) — **sem tocar em nenhuma lógica de `GameContext.tsx` ou `Tower.tsx` de novo**, porque o "topo" passa a ser lido dinamicamente de `FLOORS.length`. Mas repetindo: **isso pode esperar** — o gargalo real do jogo agora é base de jogadores chegando até T2, não infraestrutura pra T3.

---

## 6. Ordem de execução recomendada

Isso complementa (não substitui) o plano de migração de lore já combinado. Sugestão de sequência, pra não fazer tudo de uma vez e arriscar quebrar o jogo:

### ✅ CONCLUÍDO (Sessão atual — PR #8)

1. **✅ Corrigir os 2 bugs pontuais primeiro** (Codex hardcoded, Câmaras chave errada) — **FEITO.** Ver PR #8 "fix & refactor: critical Codex/Câmaras bugs + gameplay improvements".

### 🎯 PRÓXIMAS ETAPAS (Pós-T2)

2. **Criar `lib/facades/` e migrar só essas duas telas** (Codex modal, botão de Câmara Secreta) pra usar as funções de facade — valida o padrão num escopo pequeno antes de expandir. **Pré-requisito:** Bugs corrigidos (✅ pronto). **Dependência:** Etapa 3 (módulos).

3. **Quebrar `game-data.ts` em módulos por domínio** (seção 2), com `index.ts` reexportando tudo pra não quebrar imports existentes de uma vez. **Escopo:** Extracto `inhabitants.ts`, `bosses.ts`, `camaras-secretas.ts`, `codex.ts`, `buildings.ts`, `formulas.ts`, `npc.ts`, `quests-ocultas.ts`.

4. **Migrar o texto pra `lore-content.ts`** (já combinado antes) — **parcialmente FEITO** (HABITANTES, BOSS, SUSSURROS, etc.). Nesse ponto os módulos já estão separados, então essa etapa fica mais simples. **Restante:** CAMARAS_LORE se necessário.

5. **Extrair os reducers do `GameContext.tsx`** por fatia — pode ser feito em paralelo com os itens acima, um reducer por vez, sem dependência forte entre eles. **Componentes:** `expedicao-reducer.ts`, `camaras-reducer.ts`, `construcao-reducer.ts`, `habitante-reducer.ts`, `day-reducer.ts`.

6. **Aplicar o Factory** só quando for criar as 3 novas Âncoras de T2 (ou preparação de T3) — não precisa migrar o legado. **Use:** `criarAncora()` pra garantir sincronização HABITANTES ↔ CODEX_FRAGMENTOS.

---

## 7. Regras de manutenção (pra não voltar ao estado atual)

- Nenhum componente de UI (`pages/`, `components/`) importa `Record`s de dados brutos diretamente — sempre via `lib/facades/`.
- Todo cálculo de "quais capítulos/câmaras/fragmentos existem para X" deve ser **derivado dos dados**, nunca um array literal escrito à mão (`[1,2,3,4]`) — se aparecer um array hardcoded desses de novo numa revisão de código, é sinal de que devia estar num facade.
- Toda nova entidade de progressão (Habitante, Âncora, Boss) que precisa aparecer tanto em `HABITANTES`/`BOSS_ECO_LORE` quanto em `CODEX_FRAGMENTOS` deve nascer pela função de factory (seção 5), nunca copiada manualmente campo a campo.
- Texto narrativo puro sempre em `lore-content.ts` (regra já combinada antes) — mecânica (recursos, condições, bônus) sempre nos módulos de domínio (`habitantes.ts`, `buildings.ts`, etc.), nunca misturados no mesmo objeto literal inline.

---

## Apêndice — Status por sessão

### Sessão atual (2026-07-07)

**Trabalho concluído:**
- ✅ Corrigidos 3 bugs críticos de UI (Codex T2 invisível, Câmaras lookup errado, gate isBossFloor)
- ✅ Implementadas 6 melhorias de gameplay (Relíquias no Codex, escalonamento de câmaras, badge RARO, Arquivo↔Sussurro, L3 buildings)
- ✅ Centralizado lore em `lore-content.ts` (~2500 linhas), `lancamento.ts` refatorado

**Validação:** Todas as mudanças testadas, typecheck limpo, PR #8 criada e aguardando review.

**Próximo passo:** Pós-aprovação de PR #8, avaliar prioridade da refatoração de arquitetura (seção 6, etapas 2–6). O padrão de Facade já foi experimentado implicitamente na correção dos bugs — formalizar isso com `lib/facades/` viria naturalmente na próxima sessão de refactor.

**Referências de implementação:**
- `Tower.tsx`: Novo lookup dinâmico (linhas ~381–402 câmaras, ~457–465 capítulos), aba Relíquias
- `GameContext.tsx`: Bônus Arquivo em sussurroChance (linhas ~844–856)
- `game-data.ts`: RELIQUIAS_CATALOGO, escalonamento câmaras, L3 buildings

---

**Última atualização:** 2026-07-07 · Mantido por: Kurousagin
