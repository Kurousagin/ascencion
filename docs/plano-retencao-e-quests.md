# Torre Obscura — Metas Diárias, Escolhas Reais nas Quests de Habitante (35) e Câmaras Secretas nos Chefes

> **Este documento é o plano completo.** Ele deve ser usado por outro agente, sem memória desta conversa, para executá-lo de forma autocontida. Nada foi implementado — apenas planejado e escrito.

## Contexto

O jogo já tem uma boa lore, mas dois problemas de design foram identificados:

1. **Retenção de curto prazo tem um buraco real**: não existe missão diária, streak, ou qualquer recompensa variável **incondicional**. Toda aleatoriedade boa que já existe (resgate de sobrevivente 12%/35% em vitória, sussurro da torre 15%/30%, evento diário 15%) só dispara jogando ativamente. Meta: dar 2-3 motivos objetivos e garantidos pra abrir o app várias vezes ao dia.
2. **As 35 quests de "Habitante da Torre"** (`HABITANTES` em `game-data.ts`) são checagens de estado determinísticas ("tenha 2 batedores", "tenha 50 pedra") sem ramificação — apesar de o diálogo às vezes *falar* sobre escolha (ex. Andar 15: "a escolha precisa ser sua... Construí uma pergunta"), mecanicamente nada se ramifica. O jogador não sente peso nem consequência.

Adicionalmente, os andares de chefe (5/10/15/20/25/30/35/40) hoje só têm o combate + um lore fixo (`BOSS_ECO_LORE`) — nenhuma interação pós-vitória. Vira oportunidade de uma mecânica nova de exploração opcional: **Câmaras Secretas**.

Este plano cobre três entregas, pensadas para serem implementadas **nesta ordem** (risco crescente):

1. **Metas Diárias + Presente da Torre** — sistema novo, isolado, baixo risco.
2. **Câmaras Secretas nos andares de chefe** — sistema novo, isolado, baixo risco.
3. **Escolhas reais nas 35 quests de Habitante** — modifica um sistema existente e usado; maior risco de regressão. A engine deve ser construída com **retrocompatibilidade total** (quest sem o novo campo `escolha` continua funcionando exatamente como hoje), permitindo migrar o conteúdo das 35 quests incrementalmente e testar em lotes.

Ficou fora deste plano (ver "Backlog futuro" ao final): tornar o ranking Pioneer (hoje binário — chegou no andar 20 ou não) em algo com posição relativa contínua entre jogadores. Não implementar isso agora; é uma extensão de backend (agregação nova, decisão de privacidade) sem relação direta com os três itens acima.

---

## Parte 1 — Metas Diárias + Presente da Torre

### Ideia central
3 metas simples por **dia calendário** (não dia de jogo — o reset independe da velocidade 1x/2x/5x do jogo), cobrindo sistemas diferentes (exploração, construção, lore, aliança). Completar as 3 libera um "Presente da Torre" que precisa ser reivindicado manualmente (momento extra de retorno + satisfação de coletar). Recompensa pequena e garantida, com 15% de chance de bônus (mesma cadência dos sussurros já existentes) — recompensa variável incondicional, que hoje não existe.

### Modelo de dados
Novo bloco em `artifacts/torre-obscura/src/lib/game-data.ts`:
```ts
export type MetaDiariaId = 'explorar' | 'construir' | 'lore' | 'aliar';

export interface MetasDiariasState {
  data: string;              // YYYY-MM-DD do último reset (calendário, não dia de jogo)
  objetivos: MetaDiariaId[]; // 3 metas ativas hoje
  progresso: MetaDiariaId[]; // metas já concluídas hoje
  recompensaColetada: boolean;
}

export function hojeStrLocal(): string {
  return new Date().toISOString().slice(0, 10);
}

const METAS_DIARIAS_POOL_BASE: MetaDiariaId[] = ['explorar', 'construir', 'lore'];

export const METAS_DIARIAS_META: Record<MetaDiariaId, { titulo: string; descricao: string; icone: string }> = {
  explorar:  { titulo: 'Expedição do Dia', descricao: 'Envie uma expedição a qualquer andar.', icone: '🧭' },
  construir: { titulo: 'Obra em Curso',    descricao: 'Construa ou melhore um edifício.',        icone: '🏗️' },
  lore:      { titulo: 'Ecos do Passado',  descricao: 'Abra o Codex Obscuro.',                    icone: '📖' },
  aliar:     { titulo: 'Mão Estendida',    descricao: 'Ajude uma aliada (recurso, empréstimo ou reforço).', icone: '🤝' },
};

// `temAliada` decide se "aliar" entra no sorteio — evita gerar meta impossível
// pra quem nunca formou aliança.
export function gerarObjetivosDoDia(temAliada: boolean): MetaDiariaId[] {
  const pool = temAliada ? [...METAS_DIARIAS_POOL_BASE, 'aliar' as MetaDiariaId] : [...METAS_DIARIAS_POOL_BASE];
  if (pool.length <= 3) return pool;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 3);
}
```
Adicionar `metasDiarias: MetasDiariasState` ao `GameState`. Em `startNewGame()`: inicializar com `{ data: '', objetivos: [], progresso: [], recompensaColetada: false }` (string vazia garante geração na primeira renderização). Em `continueGame()` (bloco de migração de saves antigos, seguir o padrão já usado ali para `habitantesEstado` etc.): `if (!parsed.metasDiarias) parsed.metasDiarias = { data: '', objetivos: [], progresso: [], recompensaColetada: false };`.

### Novas ações em `GameContext.tsx`
Seguir o padrão já usado por `addLog`/`desbloquearFragmento` (helper que muta um `draft`/`s` local) e pelas ações expostas (`JSON.parse(JSON.stringify(state))` + `saveState`):

1. **`gerarMetasDiarias(temAliada: boolean)`** — no-op se `state.metasDiarias.data === hojeStrLocal()`; senão gera `objetivos` via `gerarObjetivosDoDia`, zera `progresso`/`recompensaColetada`, `saveState`.
2. **Helper interno `registrarProgressoMetaDiaria(draft, id)`** — se `id` está em `objetivos` e ainda não em `progresso`, adiciona e loga via `addLog(draft, 'info', ...)`. Chamado diretamente (mesmo `draft`/`s` já em escopo) a partir de:
   - `sendExpedition()` — logo após validar que o grupo é válido (não exigir vitória, só a tentativa, pra garantir que a meta seja sempre alcançável).
   - `buildEdificio()` — logo após uma construção/melhoria bem-sucedida, antes do `saveState`.
3. **Ação exposta `registrarMetaDiaria(id: MetaDiariaId)`** — wrapper que clona o estado, chama o helper, salva. Usada por consumidores externos ao `GameProvider`:
   - `Tower.tsx` — no `onClick` do botão do Codex (linha ~141, ao lado da chamada existente a `abrirCodex()`): `registrarMetaDiaria('lore')`.
   - `AllianceContext.tsx` — nos branches de sucesso de `enviar()`, `emprestar()`, `reforcar()` e `reforcarGuerra()` (todos já importam `useGame()`): `registrarMetaDiaria('aliar')`.
4. **`reivindicarPresenteDaTorre()`** — no-op se `progresso.length < objetivos.length` ou `recompensaColetada` já true. Senão: recompensa base escalando levemente com `andarAtual` (ex.: `15 + andarAtual*2` de comida, 60% disso em madeira), 15% de chance de multiplicador 3x, marca `recompensaColetada = true`, loga (`tipo: 'descoberta'` se teve sorte, `'info'` caso contrário), `saveState`.

Adicionar as 3 funções à `GameContextType` e ao value do Provider.

### UI — nova seção em `Dashboard.tsx`
- `useEffect` no mount: `Dashboard` já roda dentro do `AllianceProvider` (que consome `useGame()`), então `useAlliance()` é importável ali sem reestruturar a árvore de providers. Chamar `gerarMetasDiarias(aliadas.length > 0)` uma vez ao montar (a função já é no-op se já gerado hoje).
- Nova seção "METAS DE HOJE": lista os 3 `objetivos` com ícone/título de `METAS_DIARIAS_META`, checkmark quando o id está em `progresso`.
- Botão "REIVINDICAR PRESENTE DA TORRE": habilitado só quando `progresso.length === objetivos.length && !recompensaColetada`. Depois de coletado, mostra "✓ Coletado hoje" no lugar do botão.

### Não fazer
- Não sincronizar com o backend — 100% estado local, mesmo tratamento que as quests de Habitante já recebem.
- Não adicionar tipo de recompensa novo (fragmento cosmético, vestígio) nesta primeira versão — só recursos, pra não abrir escopo de conteúdo. Fácil de estender depois.
- Não mexer no texto da notificação push Tier 1 nesta rodada (o backend não tem visibilidade desse estado local; ficaria dessincronizado).

---

## Parte 2 — Câmaras Secretas nos andares de chefe

### Ideia central
Os 8 andares de chefe (5/10/15/20/25/30/35/40) hoje só têm combate + `BOSS_ECO_LORE` fixo — zero interação pós-vitória. Cada um ganha uma **Câmara Secreta** opcional: depois de vencer o chefe, o jogador pode "vasculhar os destroços" até 3 vezes (uma ação explícita, não passiva como as Quests Ocultas já existentes), com chance de achar por tentativa. Ao achar, é permanente (não pode ser re-triggada) e concede recompensa + fragmento de lore único daquele andar.

Isso é deliberadamente **diferente** do sistema de Quests Ocultas (`POOL_EXPLORACAO`/`POOL_VELOCIDADE`, que já existe e é 100% passivo/aleatório): aqui a busca é uma ação do jogador, ligada a um andar específico e nomeado, não a um template genérico reciclável.

### ⚠️ Passo obrigatório antes de escrever o conteúdo
Antes de preencher `CAMARAS_SECRETAS` com texto final, **ler `FLOOR_BOSS` (`game-data.ts:2061-2070`) e `BOSS_ECO_LORE` (`game-data.ts:742-775`)** para os 8 andares (5/10/15/20/25/30/35/40) — a lore da câmara secreta precisa ser consistente com o nome/epíteto do chefe e o lore já revelado naquele andar. Não inventar lore desconectada do que já existe (ex.: já se sabe que o chefe do Andar 10 é o "ARQUIVISTA CORROMPIDO" — a câmara secreta desse andar deveria remeter a isso).

### Modelo de dados
```ts
export interface CamaraSecreta {
  floor: number;                // 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40
  titulo: string;
  icone: string;
  descoberta: string;           // flavor text mostrado ao encontrar
  chancePerTentativa: number;   // ex.: 0.3
  maxTentativas: number;        // ex.: 3
  recompensa: {
    recursosBonus?: Partial<Record<'comida' | 'madeira' | 'pedra' | 'ferro', number>>;
    moralBonus?: number;
    reliquia?: string;          // mesmo inventário de relíquias das Quests Ocultas (state.reliquias)
    loreTitulo: string;
    loreTexto: string;
  };
}

export const CAMARAS_SECRETAS: Record<number, CamaraSecreta> = {
  5: { /* ... */ }, 10: { /* ... */ }, 15: { /* ... */ }, 20: { /* ... */ },
  25: { /* ... */ }, 30: { /* ... */ }, 35: { /* ... */ }, 40: { /* ... */ },
};
```
Novo campo no `GameState`: `camarasSecretasEstado?: Record<number, { tentativas: number; encontrada: boolean }>`. Default `{}` em `startNewGame` + migração em `continueGame`.

### Nova ação em `GameContext.tsx`
```ts
const vasculharCamaraSecreta = (floor: number) => {
  if (!state) return;
  const camara = CAMARAS_SECRETAS[floor];
  if (!camara) return;
  const s = JSON.parse(JSON.stringify(state)) as GameState;
  const est = s.camarasSecretasEstado?.[floor] ?? { tentativas: 0, encontrada: false };
  if (est.encontrada || est.tentativas >= camara.maxTentativas) return;
  if (s.andarAtual <= floor) return; // só buscável depois de já ter passado o chefe
  est.tentativas++;
  const achou = Math.random() < camara.chancePerTentativa;
  if (achou) {
    est.encontrada = true;
    const ef = getEfeitos(s.edificios, s.npcs);
    const cap = ef.capacidadeArmazem;
    const r = camara.recompensa;
    if (r.recursosBonus?.comida)  s.recursos.comida  = Math.min(cap, s.recursos.comida  + r.recursosBonus.comida);
    if (r.recursosBonus?.madeira) s.recursos.madeira = Math.min(cap, s.recursos.madeira + r.recursosBonus.madeira);
    if (r.recursosBonus?.pedra)   s.recursos.pedra   = Math.min(cap, s.recursos.pedra   + r.recursosBonus.pedra);
    if (r.recursosBonus?.ferro)   s.recursos.ferro   = Math.min(cap, s.recursos.ferro   + r.recursosBonus.ferro);
    if (r.moralBonus) s.moral = Math.min(100, s.moral + r.moralBonus);
    if (r.reliquia) s.reliquias = [...(s.reliquias ?? []), r.reliquia];
    s.lores.push({ floor, titulo: r.loreTitulo, texto: r.loreTexto });
    addLog(s, 'descoberta', `CÂMARA SECRETA ENCONTRADA — ${camara.titulo}: ${camara.descoberta}`);
  } else {
    addLog(s, 'info', `Vasculhou os destroços do Andar ${floor} — nada encontrado (tentativa ${est.tentativas}/${camara.maxTentativas}).`);
  }
  s.camarasSecretasEstado = { ...(s.camarasSecretasEstado ?? {}), [floor]: est };
  saveState(s);
};
```
Expor em `GameContextType` + Provider.

### UI (`Tower.tsx`)
Nas linhas de andar já conquistado (`conquistadosMostrados.map`, mesmo bloco onde já existe o botão do Habitante), quando `FLOORS[f.floor-1].isBoss && CAMARAS_SECRETAS[f.floor]` existir e a câmara não estiver `encontrada`/esgotada: botão "🔍 VASCULHAR (tentativas restantes)". Ao encontrar, abrir um modal reaproveitando o estilo visual do modal de Habitante (`Dialog.Root`, mesmo gradiente/borda) mostrando `descoberta` + lore + recompensa — pode ser um novo `camaraSecretaModalFloor` state espelhando `habitanteModalFloor`.

### Não fazer
- Não reaproveitar o pool de Quests Ocultas nem misturar os dois sistemas — são intencionalmente distintos (um é passivo/genérico, o outro é ativo/nomeado por andar).
- Não estender Câmaras Secretas a andares não-chefe nesta rodada — ficaria competindo por espaço de UI com o botão de Habitante, que já existe em todo andar não-chefe.

---

## Parte 3 — Escolhas reais nas 35 quests de Habitante

### Por que essa é a mais arriscada
`interagirHabitante()` (`GameContext.tsx:1348-1430`) é uma função dupla: o mesmo clique aceita a quest (`descoberto → quest_ativa`) e, depois, conclui (`quest_ativa → concluido`, creditando recompensa). As 35 entradas de `HABITANTES` dependem 100% desse fluxo. Qualquer mudança precisa manter **retrocompatibilidade total**: uma quest sem o novo campo `escolha` deve continuar se comportando exatamente como hoje.

### Mudança de engine (fazer isso primeiro, testar, só depois migrar conteúdo)

**Novo estado intermediário.** Em `game-data.ts`, estender:
```ts
export type HabitanteEstado = 'oculto' | 'descoberto' | 'quest_ativa' | 'aguardando_escolha' | 'concluido';

export interface HabitanteEscolhaOpcao {
  id: 'a' | 'b';
  label: string;         // texto curto do botão
  descricao: string;     // custo/ganho, mostrado antes de confirmar
  custo?: Partial<{ moral: number; comida: number; madeira: number; pedra: number; ferro: number }>;
  recursosBonus?: Partial<Record<'comida' | 'madeira' | 'pedra' | 'ferro', number>>;
  moralBonus?: number;
  reliquia?: string;      // mesmo inventário de relíquias das Quests Ocultas
  falaResultado: string;  // substitui falaConcluso quando esta opção foi escolhida
}

export interface HabitanteEscolha {
  prompt: string;                              // framing do dilema
  opcoes: [HabitanteEscolhaOpcao, HabitanteEscolhaOpcao];
}
```
Adicionar `escolha?: HabitanteEscolha;` à interface `HabitanteQuest` (`game-data.ts:240-263`) — **opcional**, é o que garante retrocompatibilidade.

Novo campo no `GameState`: `habitantesEscolhaFeita?: Record<number, 'a' | 'b'>` (lembra qual opção foi tomada, pra exibir o `falaResultado` certo depois e pra eventuais callbacks futuros). Default `{}` + migração em `continueGame`.

**Extrair a lógica de "finalizar quest" pra um helper compartilhado** (evita duplicar ~30 linhas entre o fluxo antigo e o novo — DRY). Em `GameContext.tsx`, extrair de dentro de `interagirHabitante` o bloco que hoje roda após conceder a recompensa (ativar eco, empurrar lore, desbloquear fragmento do Codex, checar "Verdade da Temporada" I/II, rolar quest oculta de velocidade) para:
```ts
const finalizarQuestHabitante = (s: GameState, floor: number, hab: HabitanteAndar) => {
  if (!s.ecos.includes(floor)) s.ecos.push(floor);
  s.lores.push({ floor, titulo: `${hab.nome} — Andar ${floor}`, texto: hab.quest.lore });
  s.habitantesEstado[floor] = 'concluido';
  const habFragId = idFragmentoHabitante(floor);
  if (habFragId) desbloquearFragmento(s, habFragId);
  const todosFloors = floorsHabitantesTemporada(1);
  if (todosFloors.every(f => s.habitantesEstado[f] === 'concluido')) {
    if (desbloquearFragmento(s, 'verdade_t1')) {
      addLog(s, 'descoberta', 'A VERDADE DA TEMPORADA I DESBLOQUEADA — todos os habitantes responderam ao chamado. Acesse o Codex Obscuro.');
    }
    desbloquearFragmento(s, 'pioneers_fragment');
  }
  const todosFloorsT2 = floorsHabitantesTemporada(2);
  if (todosFloorsT2.length > 0 && todosFloorsT2.every(f => s.habitantesEstado[f] === 'concluido')) {
    if (desbloquearFragmento(s, 'verdade_t2')) {
      addLog(s, 'descoberta', 'A VERDADE DA TEMPORADA II DESBLOQUEADA — o Intervalo revelou o que sempre esteve antes. Acesse o Codex Obscuro.');
    }
  }
  const hoje = s.dia;
  const recentes = (s.questsConcluidasDias ?? []).filter(d => hoje - d < 5);
  s.questsConcluidasDias = [...recentes, hoje];
  if (recentes.length >= 2 && Math.random() < 0.35) {
    const nova = gerarQuestOculta('velocidade', undefined, s);
    if (nova) {
      s.questsOcultas = [...(s.questsOcultas ?? []), nova];
      addLog(s, 'descoberta', `VISÃO DA TORRE — "${nova.titulo}": algo quer falar com você. Verifique a lista de andares conquistados.`);
    }
  }
};
```

**Modificar `interagirHabitante`** no branch `est === 'quest_ativa' && verificarQuestAndar(s, floor)`:
- Se `q.tipo === 'recurso'`, continuar consumindo o(s) recurso(s) exigido(s) normalmente (isso representa "entregar" o pedido — acontece independente da escolha vir depois).
- **Se `!q.escolha`** (quest ainda não migrada): manter o comportamento atual — conceder `recursosBonus`/`moralBonus` da própria `q`, chamar `finalizarQuestHabitante(s, floor, hab)`, `saveState`. Nada muda pra quests não migradas.
- **Se `q.escolha` existir**: NÃO conceder `recursosBonus`/`moralBonus`/eco/lore ainda. Setar `s.habitantesEstado[floor] = 'aguardando_escolha'`. Logar "Missão pronta para conclusão — uma escolha aguarda." `saveState`, `return`.

**Nova ação exposta `resolverEscolhaHabitante(floor: number, opcaoId: 'a' | 'b')`**:
```ts
const resolverEscolhaHabitante = (floor: number, opcaoId: 'a' | 'b') => {
  if (!state) return;
  const hab = HABITANTES[floor];
  if (!hab?.quest.escolha) return;
  const s = JSON.parse(JSON.stringify(state)) as GameState;
  if (s.habitantesEstado[floor] !== 'aguardando_escolha') return;
  const opcao = hab.quest.escolha.opcoes.find(o => o.id === opcaoId);
  if (!opcao) return;
  if (opcao.custo) {
    if (opcao.custo.moral   !== undefined && s.moral             < opcao.custo.moral)   return;
    if (opcao.custo.comida  !== undefined && s.recursos.comida   < opcao.custo.comida)  return;
    if (opcao.custo.madeira !== undefined && s.recursos.madeira  < opcao.custo.madeira) return;
    if (opcao.custo.pedra   !== undefined && s.recursos.pedra    < opcao.custo.pedra)   return;
    if (opcao.custo.ferro   !== undefined && s.recursos.ferro    < opcao.custo.ferro)   return;
    if (opcao.custo.moral)   s.moral = Math.max(0, s.moral - opcao.custo.moral);
    if (opcao.custo.comida)  s.recursos.comida  -= opcao.custo.comida;
    if (opcao.custo.madeira) s.recursos.madeira -= opcao.custo.madeira;
    if (opcao.custo.pedra)   s.recursos.pedra   -= opcao.custo.pedra;
    if (opcao.custo.ferro)   s.recursos.ferro   -= opcao.custo.ferro;
  }
  const ef = getEfeitos(s.edificios, s.npcs);
  const cap = ef.capacidadeArmazem;
  if (opcao.recursosBonus?.comida)  s.recursos.comida  = Math.min(cap, s.recursos.comida  + opcao.recursosBonus.comida);
  if (opcao.recursosBonus?.madeira) s.recursos.madeira = Math.min(cap, s.recursos.madeira + opcao.recursosBonus.madeira);
  if (opcao.recursosBonus?.pedra)   s.recursos.pedra   = Math.min(cap, s.recursos.pedra   + opcao.recursosBonus.pedra);
  if (opcao.recursosBonus?.ferro)   s.recursos.ferro   = Math.min(cap, s.recursos.ferro   + opcao.recursosBonus.ferro);
  if (opcao.moralBonus) s.moral = Math.min(100, s.moral + opcao.moralBonus);
  if (opcao.reliquia) s.reliquias = [...(s.reliquias ?? []), opcao.reliquia];
  s.habitantesEscolhaFeita = { ...(s.habitantesEscolhaFeita ?? {}), [floor]: opcaoId };
  finalizarQuestHabitante(s, floor, hab);
  addLog(s, 'descoberta', `${hab.nome.toUpperCase()}: ${opcao.label} — ${opcao.falaResultado}`);
  saveState(s);
};
```
Expor `resolverEscolhaHabitante` em `GameContextType` + Provider.

### UI (`Tower.tsx`)
No modal de Habitante (`Tower.tsx:528-735`):
- Badge de status: adicionar caso para `'aguardando_escolha'` (ex.: "ESCOLHA PENDENTE", cor de destaque pulsante).
- `falaAtual`: quando `est === 'aguardando_escolha'`, mostrar `hab.quest.escolha.prompt` no lugar da fala normal. Quando `est === 'concluido'` **e** `hab.quest.escolha` **e** `state.habitantesEscolhaFeita?.[floor]` existir, mostrar `opcao.falaResultado` correspondente em vez de `hab.falaConcluso` (fallback pro texto antigo se não houver escolha registrada — cobre quests não migradas).
- Quando `est === 'aguardando_escolha'`: renderizar as duas `opcoes` como cards clicáveis (label + descricao, prévia de custo/ganho), cada um chamando `resolverEscolhaHabitante(floor, opcao.id)`. Substitui o botão único "CONCLUIR MISSÃO" só nesse estado.

### Conteúdo — eixo de escolha por andar (grounding pra quem for escrever o texto final)
Cada uma das 35 quests deve ganhar um `escolha` com 2 opções. Abaixo, um eixo de escolha sugerido por andar, já ancorado no nome/tema/lore que a quest **já tem** — a redação final (prompt, labels, falaResultado) fica a cargo de quem for implementar, seguindo o tom estabelecido nos exemplos completos da seção seguinte.

| Andar | Nome | Eixo de escolha sugerido |
|---|---|---|
| 1 | Arauto da Névoa | Revelar a mensagem agora (+moral) vs. guardá-la em segredo (relíquia "Mensagem Selada", pagamento futuro T3+) |
| 2 | Eco dos Construtores | Usar o método pra reforçar prédios (+recursos) vs. preservar a memória intacta (+ecoBonus) |
| 3 | Tecelã de Raízes | Dedicar o crescimento a um morador específico (esse NPC ganha um pequeno buff permanente) vs. dedicar à cidadela toda (+recursos gerais) |
| 4 | Voz do Cristal | Interrogar o cristal mais a fundo (custo moral, +relíquia) vs. deixá-lo em paz (+ecoBonus, sem risco) |
| 5 | Âncora do Primeiro Ciclo | Ancorar um morador à cidadela pra sempre (não pode mais ser emprestado/ir à guerra; ganha +resistência) vs. manter todos livres (+moral maior) |
| 6 | Sentinela Sem Nome | Dar um nome ao sentinela (ele se junta como NPC extra fraco) vs. deixar seu nome perdido (+ecoBonus, +relíquia) |
| 7 | Jardineira Esquecida | Plantar a semente agora (pequeno ganho de comida recorrente) vs. guardar a semente (relíquia rara) |
| 8 | Estudioso do Infinito | Copiar o conhecimento (um Erudito vivo ganha bônus de stat permanente) vs. deixá-lo intacto (+ecoBonus maior) |
| 9 | Ferreiro Espectral | Forjar uma arma agora (buff de combate temporário) vs. guardar o metal (+ferro, +relíquia) |
| 10 | Memória da Construção | Aprender o método agora (custo moral, +ecoBonus nesse andar) vs. guardar o método (relíquia "Palavras do Fundador", útil T3+) |
| 11 | Afogado Lúcido | Libertar o afogado (ele desaparece; +moral grande) vs. deixá-lo preso e observar (+ecoBonus, +relíquia perturbadora) |
| 12 | Percussão Profunda | Seguir o pulso mais fundo (fadiga extra nos combatentes enviados) vs. parar aqui (recompensa segura) |
| 13 | Oráculo Invertido | Perguntar sobre o futuro (relíquia "Visão Invertida", moral reduzido) vs. perguntar sobre o passado (+moral cheio, sem relíquia) |
| 14 | Comandante de Mármore | Assumir o comando dele (um combatente vivo ganha stat de liderança permanente) vs. deixá-lo comandar os ecos (+ecoBonus maior) |
| 15 | Vigia do Penúltimo Ciclo | **(fala já é sobre escolha)** Construir a barreira que ele recusou (+recursos grande, fecha a pergunta) vs. deixar a pergunta em aberto (relíquia "A Pergunta Não Respondida", +moral maior) |
| 16 | Eco Faminto | Alimentar mais a entidade (ela para de drenar comida no futuro) vs. negar comida (+moral por resistir, pequeno risco) |
| 17 | Paradoxo Ambulante | Seguir o caminho que "poderia ter sido" (+ecoBonus maior, custo aleatório) vs. manter o caminho real (recompensa previsível) |
| 18 | Último Defensor | Reconstruí-lo como aliado (ganha um NPC "sentinela" extra fraco) vs. homenagear sua queda (+ecoBonus, +moral) |
| 19 | Susurro do Limiar | Perguntar mais agora sobre o Andar 20 (custo sanidade geral, spoiler do chefe) vs. esperar descobrir sozinho (+moral maior) |
| 21 | Vestígio da Voz | Seguir o vestígio até a origem (um Batedor fica fatigado/indisponível temporariamente) vs. registrar e seguir (+ecoBonus, sem custo) |
| 22 | Fragmento Coletivo | Fundir o fragmento em equipamento (buff de combate) vs. preservar intacto (+relíquia, +ecoBonus) |
| 23 | Guardião da Memória Fixa | Deixar a memória mudar (+moral) vs. forçar preservação (+pedra extra) |
| 24 | O Que Viu Antes | Ouvir o que ele viu (custo sanidade de um Erudito específico, +relíquia rara) vs. recusar ouvir (+moral cheio) |
| 26 | Eco da Expedição Perdida | Procurar os corpos (chance de recuperar um NPC — risco de vir `obscuro`) vs. deixá-los descansar (+moral, +ecoBonus seguro) |
| 27 | Memória do Traidor | Perdoar na memória (+moral grande) vs. condenar (+ecoBonus maior) |
| 28 | Oráculo do Propósito | Saber seu destino final da run (flavor puro, sem efeito mecânico) vs. recusar saber (+moral por "coragem de não saber") |
| 29 | Guardião do Nome Apagado | Devolver o nome a um NPC vivo (ganha traço cosmético/nome alternativo) vs. deixar apagado (+comida maior) |
| 31 | Raiz de Origem | Replantar na cidadela (bônus passivo pequeno por X dias) vs. deixar onde está (+ecoBonus imediato maior) |
| 32 | Memória da Primeira Pedra | Gravar seu nome junto ao Ato Fundador (+moral grande, temático) vs. deixar como estava (+recursos maior) |
| 33 | Eco do Esquecimento | Tentar lembrar o propósito perdido (custo moral, +relíquia) vs. aceitar o esquecimento (+ecoBonus maior, sem risco) |
| 34 | Guardião da Intenção | Seguir a intenção original da Torre (+recursos, fecha uma rota narrativa) vs. seguir sua própria intenção (+moral maior, +relíquia) |
| 36 | Habitante do Intervalo | Convidá-lo a ficar (vira NPC frágil extra) vs. deixá-lo partir (+ecoBonus maior) |
| 37 | Memória Nomeada | Descobrir de quem é a memória (revela um nome — callback emocional se houver NPC morto relevante; +moral) vs. deixar anônimo (+recursos maior) |
| 38 | Vigilante do Entre-Tempo | Atravessar o intervalo agora (custo grande de recursos, +ecoBonus enorme) vs. esperar o momento certo (recompensa normal) |
| 39 | Porteiro do Antes | Deixar o depósito ser permanente (+moral grande, tema "provar que pode abrir mão") vs. pedir de volta uma fração (recursos parciais devolvidos, +moral menor) |

**Nota sobre custo permanente de NPC ("sacrifício que dói de verdade")**: nem toda quest precisa disso — usar com moderação (sugestão: andares 5, 12, 21, 26 já têm esse tipo de custo no eixo acima; não generalizar pra todas as 35, senão vira punitivo em vez de significativo).

**Nota sobre discrepâncias existentes**: andares 4, 33 e 38 têm `descricaoObj` (texto) mencionando um número de dias diferente do campo `dias` real usado pela engine (ex.: andar 4 diz "12 dias" no texto mas o campo vale 28). Isso já existe hoje, sem relação com este plano — decidir ao migrar o conteúdo se corrige o texto pra bater com o campo, ou vice-versa (registrar a decisão, não deixar como estava por omissão).

### Exemplos completos (calibração de tom)
Usar como referência de "voz" e de como o JSON final deve ficar. Adaptar o padrão pros outros 32 andares.

**Andar 15 — Vigia do Penúltimo Ciclo** (já tem a fala mais explícita sobre escolha — o candidato mais natural pra ancorar o padrão):
```ts
escolha: {
  prompt: 'A pergunta que ele recusou responder agora é sua: construir a barreira, ou deixá-la em aberto?',
  opcoes: [
    {
      id: 'a',
      label: 'Construir a barreira',
      descricao: '+40 Pedra, +30 Madeira — mas a pergunta se fecha para sempre.',
      recursosBonus: { pedra: 40, madeira: 30 },
      falaResultado: 'A barreira foi construída. A pergunta que ele guardou por tanto tempo finalmente tem uma resposta física. Ele parece aliviado — e um pouco menor por isso.',
    },
    {
      id: 'b',
      label: 'Deixar a pergunta em aberto',
      descricao: '+25 Moral, Relíquia "A Pergunta Não Respondida" — nenhum recurso imediato.',
      moralBonus: 25,
      reliquia: 'A Pergunta Não Respondida',
      falaResultado: 'Você não construiu nada. Ele entende. "Talvez essa seja a resposta certa", diz, antes de guardar a pergunta de volta — agora sua também.',
    },
  ],
},
```

**Andar 26 — Eco da Expedição Perdida** (exemplo de opção com custo/risco real ligado a NPC):
```ts
escolha: {
  prompt: 'Os corpos da expedição perdida ainda estão lá. Procurar entre eles pode trazer alguém de volta — ou não trazer nada bom.',
  opcoes: [
    {
      id: 'a',
      label: 'Procurar entre os corpos',
      descricao: '30% de chance de recuperar um sobrevivente — que pode vir corrompido (obscuro).',
      // implementação: rolar separadamente no resolverEscolhaHabitante (ou expor um "efeitoEspecial" idêntico
      // ao já usado no resgate de sobrevivente em sendExpedition, reaproveitando generateNPC(Math.random() < X))
      falaResultado: 'Entre os ossos, um pulso fraco. Alguém sobreviveu ao impossível — mas o que voltou com ela nem sempre é só ela.',
    },
    {
      id: 'b',
      label: 'Deixá-los descansar',
      descricao: '+15 Moral, +ecoBonus garantido — sem risco.',
      moralBonus: 15,
      falaResultado: 'Você não perturba os mortos. Eles já pagaram o preço da Torre. Isso basta.',
    },
  ],
},
```
> Nota de implementação para este caso específico: a opção "a" precisa de um efeito além do modelo genérico (`recursosBonus`/`moralBonus`/`reliquia`) — chance de spawnar um NPC via `generateNPC(Math.random() < 0.1)`, mesmo padrão já usado em `GameContext.tsx:796`. Tratar como um "efeito especial" hardcoded dentro de `resolverEscolhaHabitante` para o `floor === 26 && opcaoId === 'a'` (não vale a pena generalizar um campo de efeito arbitrário na interface `HabitanteEscolhaOpcao` só por causa de um caso — YAGNI).

### Ordem de execução recomendada para a Parte 3
1. Implementar a mudança de engine (tipos + `finalizarQuestHabitante` + `interagirHabitante` modificado + `resolverEscolhaHabitante`) SEM adicionar `escolha` a nenhuma quest ainda.
2. Rodar `pnpm --filter @workspace/torre-obscura run typecheck` e testar manualmente que as 35 quests continuam completáveis exatamente como antes (nenhuma tem `escolha` ainda, então tudo cai no branch de retrocompatibilidade).
3. Migrar o conteúdo em lotes pequenos (ex.: 5-8 quests por vez, cobrindo early/mid/late game), testando cada lote antes de seguir pro próximo.
4. Só então mexer na UI do modal em `Tower.tsx` pra suportar o estado `aguardando_escolha` (pode ser feito em paralelo ao passo 1, já que a UI só precisa existir quando a primeira quest migrada for testada).

---

## Backlog futuro (não implementar agora)

**Ranking social mais rico** (era chamado de "ponto 5" nas discussões anteriores): hoje `artifacts/api-server/src/routes/pioneer.ts` só sabe "chegou no andar 20 ou não" (`milestones` table, tipo único `andar_20`). Quando for retomar: estender `milestones` pra registrar checkpoints intermediários (a cada 5 andares) sem expor `deviceId`, e o cliente calcula "você está à frente de X% dos exploradores" comparando seu andar contra a distribuição agregada. Não depende de nada implementado neste plano.

---

## Verificação

**Parte 1 (Metas Diárias)**:
1. Save novo → Dashboard mostra 3 metas (sem "aliar" se não há aliança formada).
2. Enviar expedição / construir edifício / abrir Codex / ajudar aliada → cada meta correspondente marca concluída na hora.
3. Completar as 3 → botão de reivindicar habilita; clicar credita recursos e trava até o próximo dia calendário.
4. Trocar a data do sistema (ou esperar virar o dia) → novo sorteio de metas, progresso zera.
5. Save antigo sem `metasDiarias` → migração não quebra.

**Parte 2 (Câmaras Secretas)**:
1. Vencer um chefe (ex. Andar 10) → botão "VASCULHAR" aparece na linha do andar.
2. Vasculhar até esgotar tentativas sem achar → mensagens de "nada encontrado" incrementam contador corretamente.
3. Achar a câmara → recompensa creditada, lore registrado, botão desaparece/trava permanentemente.
4. Verificar que os 8 andares de chefe têm lore consistente com `FLOOR_BOSS`/`BOSS_ECO_LORE` (não inventada solta).

**Parte 3 (Escolhas nas quests)**:
1. Antes de migrar qualquer conteúdo: as 35 quests continuam funcionando exatamente como hoje (regressão zero).
2. Uma quest migrada (ex. Andar 15): ao cumprir a condição, estado vira `aguardando_escolha` em vez de `concluido` direto; modal mostra as 2 opções; escolher uma credita a recompensa certa e define `falaConcluso` alternativo.
3. `habitantesEscolhaFeita` persiste no save e sobrevive a fechar/reabrir o app.
4. `pnpm -w run typecheck` limpo após cada lote de migração.
