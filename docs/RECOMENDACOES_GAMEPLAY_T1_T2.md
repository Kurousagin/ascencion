# Torre Obscura — Recomendações de Gameplay (Temporadas I e II)
### Construções, Câmaras Secretas, Relíquias e Codex Obscuro

> Este documento é fruto de uma revisão do código real (`game-data.ts`, `GameContext.tsx`, `Tower.tsx`) — não são só ideias soltas. Separei em duas categorias em cada seção: **🔴 Bugs/gaps que já quebram a experiência hoje** (achados lendo o código, não é opinião) e **💡 Melhorias propostas** (sugestão de design, aberta a discussão). Comece pelos 🔴 — são baratos de corrigir e o impacto no jogador é imediato.

---

## 1. Câmaras Secretas

Essa é a seção mais urgente. Encontrei **dois bugs que, juntos, tornam a feature inteira invisível para o jogador hoje** — nenhum jogador consegue ver o botão de Câmara Secreta em lugar nenhum, mesmo cumprindo todos os requisitos.

### ✅ DONE — Bug 1 — a chave de lookup está errada

Em `Tower.tsx`, a condição que decide se mostra o botão "VASCULHAR OS DESTROÇOS" estava usando lookup incorreto.

**Problema (resolvido):** `CAMARAS_SECRETAS` é indexado por **chave composta** (`'1_1'`, `'4_1'`, `'4_2'`, etc), não pelo número do andar puro. O lookup original `CAMARAS_SECRETAS[f.floor]` sempre retornava `undefined`.

**Solução implementada:** Implementado filtro dinâmico por chave composta:
```ts
const camarasDoAndar = Object.entries(CAMARAS_SECRETAS).filter(([id]) => id.startsWith(`${f.floor}_`));
```
Agora itera corretamente sobre andares com múltiplas câmaras (4, 7, 10, 15, 20).

### ✅ DONE — Bug 2 — a condição `isBossFloor` exclui a maioria das câmaras

**Problema (resolvido):** 17 das 25 câmaras estavam em andares que não são de chefe, mas a UI exigia `isBossFloor`, ocultando-as completamente.

**Solução implementada:** Removido `isBossFloor` da condição de exibição. O gate correto é apenas "existe uma câmara para este andar E o andar já foi conquistado".

### 📝 NÃO IMPLEMENTADO — Gap — Câmaras Secretas não existem para Temporada II

**Status:** Estrutura corrigida e funcionando. Conteúdo pendente.

Todas as 25 câmaras hoje cobrem só os andares 1–20 (T1). Nenhuma existe para 21–40 (T2). Os requisitos (`class_farms`, `mortes_andar`, `quest_habitante`, `recurso_minimo`, `npc_raridade`, `combinado`) já estão prontos no sistema.

**Trabalho futuro (T3):** Escrever ~20 câmaras de T2:
- 16 andares não-boss: 21,22,23,24,26,27,28,29,31,32,33,34,36,37,38,39 (1 câmara cada)
- 4 chefes: 25,30,35,40 (1-2 câmaras cada)

### ✅ DONE — Melhoria — dificuldade escalonada de câmaras

**Implementado:** `chancePerTentativa` agora varia inversamente com o andar (dificuldade).

**Valores escalados:**
- Andares 1–5: 0.35–0.40 (entrada)
- Andares 6–10: 0.30–0.33 (intermediário)
- Andares 11–15: 0.25–0.28 (avançado)
- Andares 16–20: 0.20–0.23 (desafio final)

Câmaras finais agora têm ~50% menos chance de sucesso, criando progressão mecânica genuína.

### 📝 NÃO IMPLEMENTADO — Melhoria — relíquias de câmaras secretas

**Status:** Sistema de relíquias (coleta, display) está pronto. Recompensas de câmaras ainda fixas.

**Proposta (T3):** Câmaras dos chefes (andares 5, 10, 15, 20) poderiam dropar relíquias adicionais além de recursos/moral, elevando seu valor narrativo.

Hoje recompensas de Câmara Secreta são: recursos + moral apenas.

---

## 2. Relíquias

### ✅ DONE — Gap — relíquias eram coletadas e nunca mais apareciam

**Problema (resolvido):** Relíquias só existiam em logs, sem UI de visualização ou descrição.

**Solução implementada:**
- Criado `RELIQUIAS_CATALOGO` centralizado com 18 relíquias (nome, descrição, origem)
- Aba "Relíquias" adicionada ao modal do Codex (ao lado dos capítulos)
- Grid de relíquias coletadas com descrição narrativa completa
- Relíquias agora têm contexto visual permanente no jogo

Hoje uma jogadora pode ganhar "Mensagem Selada", "Palavras do Fundador", "A Pergunta Não Respondida" — itens com nome e peso narrativo — e nunca mais ver menção a eles de novo depois do log daquele dia. Isso é desperdício de trabalho de escrita (cada relíquia tem um nome cuidadoso) e também frustra quem gosta de colecionar.

### ✅ DONE — Melhoria 1 — aba "Relíquias" dentro do modal do Codex

**Implementado:** Aba "Relíquias" adicionada junto aos capítulos de temporada, listando:
- Nome da relíquia
- Descrição narrativa
- Origem (de qual fonte foi obtida)
- Visual diferenciado com grid/cards

Centralizado em `RELIQUIAS_CATALOGO` para evitar duplicação.

### 📝 NÃO IMPLEMENTADO — Melhoria 2 — efeitos passivos de relíquias em T1/T2

**Status:** Sistema de relíquias catalogado e visível. Efeitos ainda associados apenas a T3+.

**Proposta (T3):** Dar cada relíquia um efeito passivo pequeno já em T1/T2 (ex.: +1% loot permanente, redução mínima de custo) para evitar que a escolha "guardar relíquia" pareça sempre inferior comparada a recompensas imediatas.

Entendimento: intenção é "relíquia = seed pra T3+", mas isso cria desincentivo de curto prazo.

### 📝 NÃO IMPLEMENTADO — Melhoria 3 — histórico de escolhas de Habitantes no Codex

**Status:** Dados já existem em `habitantesEscolhaFeita?: Record<number, 'a' | 'b'>`. UI pendente.

**Proposta (T3):** Mostrar histórico de escolha + item ganho lado a lado na aba de Relíquias, conectando narrativa de escolha à recompensa obtida.

---

## 3. Codex Obscuro

### ✅ DONE — Bug — Temporada II era invisível dentro do modal do Codex

**Problema (resolvido):** Capítulos estavam hardcoded como `[1,2,3,4]` para todas as temporadas, deixando T2 (capítulos 5–8) invisível.

**Solução implementada:** Capítulos derivados dinamicamente:
```ts
const capitulos = Object.values(CODEX_FRAGMENTOS)
  .filter(f => f.temporada === temporada.numero)
  .map(f => f.capitulo)
  .filter((v, i, a) => a.indexOf(v) === i)
  .sort((a, b) => a - b);
```

Agora `nomesCap` é construído dinamicamente para qualquer temporada, suportando capítulos 1–8 (e além).

### ✅ DONE — Melhoria — diferenciação visual de Sussurros (RARO)

**Implementado:** Sussurros agora exibem badge "✦ RARO" com styling diferenciado.

Isso comunica visualmente que Sussurros são descobertas aleatórias (15-30% de chance) vs. Habitantes/Ecos que são garantidos. Reforça valor de continuar explorando mesmo após completar quests obrigatórias.

### 📝 NÃO IMPLEMENTADO — Melhoria — indicador de progresso por tipo de fragmento

**Proposta (T3):** Mostrar “Habitantes: 14/16” separado de Sussurros no Codex.

Ofereceria motivação de progresso (jogadora sabia se está “quase lá”) sem revelar diretamente que zerar Habitantes desbloqueia a Verdade.

**Status atual:** Barra de progresso mostra total de fragmentos apenas.

### ✅ DONE — Melhoria — ligação Arquivo ↔ Sussurro

**Implementado:** Arquivo agora incrementa chance de Sussurro baseado em nível.

**Mecânica:**
- Base Sussurro: 15% (sem Rastro) ou 30% (com Rastro)
- Bônus Arquivo: +8% por nível (até +24% em L3)
- Total máximo: 30% (sem Rastro) → 54% (com Rastro + Arquivo L3)

Cria razão estratégica de construir Arquivo, alinhando nome “Cataloga os fragmentos” à mecânica real.

---

## 4. Construções (Edifícios)

### 📝 NÃO IMPLEMENTADO — Observação — construções exclusivas de lore

**Proposta (T3+):** Edifícios temáticos atrelados a momentos narrativos específicos.

Exemplo: Guardião da Intenção (Andar 34) desbloqueia "Santuário" especial que dá bônus único, sinalizando que decisões narrativas têm consequências mecânicas duradouras.

**Status atual:** Todos os 9 edifícios são puramente utilitários.

### ✅ DONE — Melhoria — Arquivo/Mirante agora têm 3 níveis (padrão T1)

**Implementado:** Ambos os edifícios de T2 expandidos de `maxNivel: 2` → `maxNivel: 3`.

**Arquivo L3:**
- Custo: 120 pedra, 90 madeira, 60 ferro
- Efeito: +42% poder expedição, +24% Sussurro

**Mirante L3:**
- Custo: 105 madeira, 75 pedra, 65 ferro
- Efeito: +35 fadiga rec./dia, +3 moral/dia

Elimina saturação de recursos em T2 e padroniza progressão de edifícios.

### 📝 NÃO IMPLEMENTADO — Melhoria — edifícios afetando descoberta de câmaras

**Proposta (T3+):** Prédio (ex.: Mirante — "Vigia os andares superiores") que aumente `chancePerTentativa` de Câmaras Secretas.

Criaria segunda razão de escolha entre edifícios, além de poder/recursos bruto.

**Pré-requisito:** Bugs 1/2 de câmaras já estão corrigidos.

---

## 5. Resumo — implementação completada

### ✅ BUGS CRÍTICOS CORRIGIDOS (PR #8)

| Item | Status |
|------|--------|
| 🔴 Bug Codex — capítulos hardcoded 1-4 | ✅ FEITO |
| 🔴 Bug Câmaras — chave de lookup errada | ✅ FEITO |
| 🔴 Bug Câmaras — gate `isBossFloor` indevido | ✅ FEITO |

### ✅ MELHORIAS IMPLEMENTADAS

| Item | Status | PR |
|------|--------|-----|
| Aba "Relíquias" no Codex | ✅ FEITO | #8 |
| RELIQUIAS_CATALOGO centralizado | ✅ FEITO | #8 |
| Escalonamento de dificuldade das câmaras | ✅ FEITO | #8 |
| Diferenciação visual de Sussurros (badge "RARO") | ✅ FEITO | #8 |
| Ligação Arquivo ↔ Sussurro (+8% por nível) | ✅ FEITO | #8 |
| 3º nível Arquivo/Mirante (padrão T1) | ✅ FEITO | #8 |

---

## 6. Recomendações pendentes para T3+

### 📝 NÃO IMPLEMENTADO

| Item | Temporada | Razão | Impacto |
|------|-----------|-------|---------|
| Câmaras Secretas de T2 (20 câmaras) | T3 | Conteúdo novo requer escrita narrativa | Cobertura de T2 completa |
| Efeitos passivos de relíquias | T3 | Rebalanceia escolhas de Habitante | Validação mecânica de coleta |
| Histórico de escolhas no Codex | T3 | UI depende de Relíquias visualizável | Rastreabilidade narrativa |
| Indicador "Habitantes: X/16" no Codex | T3 | Pistas de progresso sem revelar gate | Motivação clara |
| Edifícios exclusivos de lore | T3+ | Requer integração narrativa profunda | Peso de decisões do jogador |
| Edifícios afetando descoberta de câmaras | T3+ | Adiciona profundidade de escolha | Diversidade de builds |

---

**PR associada:** [#8 - fix & refactor: critical Codex/Câmaras bugs + gameplay improvements](https://github.com/Kurousagin/ascencion/pull/8)
