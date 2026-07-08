# Câmaras Secretas — Dificuldade + Recompensas + Codex

> **Status:** Pontos 1, 2 e 3 **✅ implementados**.
> Contexto/decisões do usuário estão no plano completo:
> `~/.claude-pessoal/plans/pontos-as-camaras-tem-fizzy-garden.md`.
> Este doc é o registro do que foi entregue.

## O que já foi feito (Ponto 1)

- `CamaraSecreta.multiplicadorDificuldade?: number` (default 1.25).
- `dificuldadeCamara(camara)` = `BASE_DIFICULDADE[floor-1] * (multiplicadorDificuldade ?? 1.25)`.
- `calcAfinidadeCamara(group, camara)` — espelha `calcBiomaMultiplier`, usando
  `requisito.profissao` (só `class_farms`): ≥50% → 1.30, ≥20% → 1.00, senão 0.80;
  câmaras sem profissão → 1.0.
- **Curadoria por lore** (`multiplicadorDificuldade` > 1.25 em 6 câmaras):
  Câmara da Primeira Verdade (1.6), Câmara da Entidade Dormida (1.5),
  Câmara da Pergunta Sem Resposta (1.5), Câmara do Reflexo (1.4),
  Semente Primordial (1.4), Câmara do Limiar (1.35). Demais ficam em 1.25.
- `calcExploracaoCamara` retorna `{ poder, dificuldade, afinidade, sucesso, chanceMorteFalha }`,
  com `poder = calcPoderGrupo × afinidade` e `sucesso = poder >= dificuldade`.
- Tower.tsx: modal da câmara exibe `dificuldadeCamara(cam)` e a linha de AFINIDADE.
- Campos legados `dificuldade` / `chancePerTentativa` marcados `@deprecated` (não mais lidos).

---

## Ponto 2 — Recompensas variadas e por desempenho ✅

**Objetivo:** o alto risco não pode entregar só "texto". Cada câmara dá recompensa
tangível, e **dois jogadores diferentes devem ganhar coisas diferentes** — sorteio
ponderado pelo desempenho para não ser repetitivo.

### Regras puras (`game-data.ts`)

- Fazer `calcExploracaoCamara` retornar também `desempenho` (0–1):
  `clamp(poder/dificuldade - 1, 0, 1)` combinado com frescor `(1 - fadigaMediaGrupo/100)`.
- **Recompensa primária (sempre), escalada ao andar:** recursos derivados de
  `calcRecompensaAndar(floor, bioma)` (bem acima dos ~18 atuais) + `resultado.moralBonus`
  + relíquia **se** `resultado.reliquia` existir.
- **Recompensa de desempenho (condicional/RNG):** `sortearRecompensaCamara(camara, desempenho, rng)`
  sorteia **um** bônus de tabela ponderada pelo desempenho:
  `{ buff_permanente | sobrevivente | reliquia_bonus | recursos_extra }`.
  - `buff_permanente`: um morador do grupo ganha +N em `statTreinamento(npc)` e recalcula
    raridade via `recalcRaridade` (mesmo padrão de `treinarNpc`).
  - `sobrevivente`: `generateNPC()` se `pop viva < capPopulacao` (padrão do resgate em `sendExpedition`).
  - `reliquia_bonus` / `recursos_extra`: como já suportado.

### Orquestração (`GameContext.tsx` → `explorarCamaraSecreta`)

- Aplicar primária + bônus sorteado.
- Preencher `ResultadoExploracaoCamara` com a **lista de recompensas concedidas** nesta
  incursão (novos campos: `recompensas: string[]`, `buffNpc?`, `sobrevivente?`).

### UI (`ResultadoCamaraModal.tsx`)

- Além de `sucessoTexto`/`loreGanho`, listar as recompensas efetivamente concedidas
  (recursos, relíquia, buff em NPC nomeado, sobrevivente) — deixando claro que variou.

---

## Ponto 3 — Lore da câmara → Codex ("páginas rasgadas") ✅

**Objetivo:** a lore de cada câmara (`resultado.loreGanho`) hoje só aparece no modal e
some. Deve ir para o Codex — "o livro que teve páginas rasgadas e espalhadas pela Torre";
cada página encontrada retorna ao livro, com ícone/rótulo próprios ("Página Recuperada").

### Dados (`game-data.ts`)

- `FragmentoTipo` += `'camara'`.
- **Gerar** fragmentos a partir de `CAMARAS_SECRETAS` (DRY, sem duplicar texto): para cada
  câmara com `resultado.loreGanho`, criar `cam_<key>` (ex.: `cam_5_1`):
  `{ tipo:'camara', temporada: floor<=20?1:2, capitulo: capituloDoAndar(floor),
     ordem: 20 + idxNoCapitulo, titulo: loreGanho.titulo, texto: loreGanho.texto }`
  e **mesclar** em `CODEX_FRAGMENTOS`. `totalFragmentosTemporada` passa a contá-los.

### Desbloqueio (`GameContext.tsx`)

- No sucesso: `desbloquearFragmento(s, 'cam_' + camaraId)` — reutiliza a função existente,
  aciona o badge `codexNovoFragmento`.

### UI do Codex (`Tower.tsx`, ~linha 522)

- Adicionar `camara: '📖'` ao mapa `tipoIcon` + rótulo/legenda "Página Recuperada" com
  estilo distinto. A renderização já é genérica por `tipoIcon[frag.tipo]` e agrupada por
  capítulo — as páginas aparecem junto, visualmente diferenciadas.

---

## Verificação (quando retomar)

1. `pnpm --filter @workspace/torre-obscura run typecheck` + `run test`.
2. Chrome headless (`--remote-debugging-port=9222` + driver CDP em Node):
   - Concluir a mesma câmara em execuções diferentes (limpar save entre elas) →
     recompensas de desempenho **variam**.
   - Codex → página da câmara aparece desbloqueada com ícone/rótulo próprios; badge acende.
   - `body pointer-events` limpo ao fechar modais.
