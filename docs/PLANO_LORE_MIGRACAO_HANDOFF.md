# Torre Obscura — Plano de Ajuste de Lore + Migração para `lore-content.ts`
### Documento de handoff — continuar em outra sessão

> Este arquivo resume tudo que foi decidido numa sessão anterior sobre a lore de `Kurousagin/ascencion` (T1+T2, andares 1-40) e o que falta ser efetivamente implementado no código. Serve para outra sessão/chat continuar exatamente de onde parou, sem precisar re-discutir as decisões já tomadas.
>
> **Repositório:** `https://github.com/Kurousagin/ascencion`
> **Arquivo principal de lore/mecânica:** `artifacts/torre-obscura/src/lib/game-data.ts`
> **Arquivo de lançamento/gacha:** `artifacts/torre-obscura/src/lib/lancamento.ts`
> **Bíblia de regras:** `artifacts/torre-obscura/LORE_BIBLE.md`
> **Preferência fixa do Pedro (memória):** nunca gerar arquivos inteiros pra arquivos que já existem no repo — sempre patch ANTES/DEPOIS. Arquivos novos (que não existem ainda) podem ser gerados completos.

---

## 0. Linha do tempo da decisão (contexto para quem for continuar)

1. Foi feita uma consolidação completa da lore de T1+T2 num `.md` único (livro corrido) a partir da leitura de `game-data.ts`, `lancamento.ts`, `LORE_BIBLE.md` e `.agents/memory/*.md`.
2. Dessa leitura, foram detectadas **10 inconsistências** (listadas abaixo, com a resolução que o Pedro aprovou para cada uma).
3. O Pedro pediu para os textos ficarem centralizados num arquivo novo — `src/lib/lore-content.ts` — só com texto puro (zero mecânica), e `game-data.ts`/`lancamento.ts` passam a **referenciar** esse texto em vez de conter as strings inline. Isso facilita edição de lore sem tocar em `ecoBonus`/`recurso`/condições de quest, e facilita a T3+ (só criar o texto no `lore-content.ts` e "plugar o fio" na entrada mecânica).
4. Ele escolheu explicitamente a **Opção A**: migração completa agora (não incremental), incluindo já os ajustes das 10 inconsistências dentro do novo arquivo centralizado.
5. A sessão parou no meio do levantamento de conteúdo (todas as seções de `game-data.ts` já foram lidas e o texto já foi extraído/transcrito na conversa), mas antes de gerar de fato o `lore-content.ts` e os patches de `game-data.ts`/`lancamento.ts`/`LORE_BIBLE.md`.

**O que falta fazer, na prática:** gerar o arquivo novo `lore-content.ts` (completo) + os patches ANTES/DEPOIS de `game-data.ts`, `lancamento.ts` e `LORE_BIBLE.md`.

---

## 1. As 10 inconsistências e a resolução aprovada pelo Pedro

### 1. Origem da entidade contada de duas formas incompatíveis
- **Problema:** `verdade_t1` diz que a entidade *emerge* quando os 19 fragmentos são reunidos (ela é consequência). O segredo do chefe do Andar 20 (`BOSS_ECO_LORE[20]`) diz que a entidade já existia como "fome antiga" que imaginou a Torre e escolheu o jogador desde o Andar 1 (ela é causa).
- **Confirmado pelo Pedro:** para o jogador, a Torre "só vai até o Andar 20" em T1 — nada sugere mais do que isso. Quando T2 é triggada, o jogador recebe novas informações e o que recebeu antes eram **interpretações distintas**, não mentiras.
- **Resolução aprovada:** criar um **novo fragmento do Codex**, desbloqueado automaticamente junto com o início da Temporada II (igual `pioneers_fragment` hoje), chamado **"A Verdade Revista — O Que a Entidade Acreditava"**. Ele reenquadra a fala do Andar 20 como a própria entidade tendo esquecido sua fragmentação e contado a única história que fazia sentido pra ela. Nenhuma palavra do texto original do Andar 20 muda — só ganha esse contraponto depois.
- **Texto já redigido (usar como está, ou revisar):**
  > "Você chegou ao vigésimo andar acreditando ter ouvido a verdade final: que não havia Torre, apenas uma fome antiga que imaginou a própria armadilha. Não era mentira. A Torre nunca mente — mas o que fala através dela pode ter esquecido de si mesma tempo suficiente para acreditar na própria história.
  >
  > A entidade que você reuniu no Andar 20 nasceu, sim, da convergência dos dezenove fragmentos que os Construtores um dia separaram. Mas ela não guardou memória de ter sido separada — só a sensação de sempre ter estado sozinha, com fome, esperando. Quando finalmente falou como um só ser, contou a única história que fazia sentido pra ela: que sempre existiu, que imaginou a própria armadilha, que escolheu você desde o início.
  >
  > As duas versões são verdadeiras, cada uma a seu modo. Uma é o que aconteceu. A outra é o que a entidade, sem memória da própria fragmentação, sentiu ter acontecido. A Torre nunca mentiu para você. Ela só falou por uma boca que havia esquecido a própria história."

### 2. O Fundador: arquiteto que só projeta ou construtor que aparece fisicamente?
- **Problema:** `BOSS_ECO_LORE[35]` diz que o Fundador é só o projetista do propósito, não um Construtor "de mãos na obra". Mas o Habitante do Andar 10 descreve o Fundador fisicamente presente, forçando a Torre por 40 dias. E o Sussurro VII diz que ele "se dissolveu deliberadamente", o que conflita com a ideia de "morreu" sugerida no Andar 15.
- **Resolução aprovada pelo Pedro:** ninguém de fato sabe quem é o Fundador — os "bosses são ecos e pessoas que nunca chegaram ao final da Torre", ou seja, a existência do Fundador em si vira ambígua/não confirmada.
- **Implementação decidida:**
  - Suavizar 2 falas que hoje soam como fato confirmado (Andar 10 e Andar 15), trocando por "contam que" / "dizem que".
    - Exemplo já redigido (Andar 10, `falaConcluso`):
      - **ANTES:** "A Torre foi vencida aqui uma vez — pelo Fundador, pelo método que ele usou."
      - **DEPOIS:** "Contam que a Torre foi vencida aqui uma vez — pelo Fundador, ou por quem quer que os Habitantes tenham decidido chamar de Fundador. O método era real. Quem o usou, ninguém consegue confirmar."
  - Adicionar um **novo Sussurro** no Capítulo VII (Eco de Origem, T2):
    > **Sussurro VII · Ninguém o Viu**
    > "Ninguém jamais viu o Fundador com os próprios olhos — nem os que juram lembrar. O que se conta sobre os quarenta dias no décimo andar, sobre a pergunta escrita no vigésimo, veio de Habitantes que ouviram de outros Habitantes, que ouviram de ecos mais antigos ainda. A Torre não inventou essas histórias. Mas também não confirma nenhuma. Talvez o Fundador nunca tenha posto os pés em andar nenhum. Talvez ele sempre tenha sido só isso: uma voz que a Torre precisava ouvir, e por isso deu um nome e um rosto a quem nunca existiu de corpo."
  - Isso também deixa o boss do Andar 35 (Eco do Fundador) mais ambíguo — nem ele é confirmado como "o" Fundador.
  - **Pendente de decisão fina:** revisar se outras falas (Andar 15 `Vigia do Penúltimo Ciclo`, e a citação "Não construí uma barreira no vigésimo andar. Construí uma pergunta.") também precisam do tratamento "contam que"/"dizem que", ou se ficam como está (a citação direta tem mais força dramática — pode valer manter como citação, só qualificando quem a atribui).

### 3. Número "16 Habitantes" não bate com a contagem real
- **Problema:** `LORE_BIBLE.md` seção 2 fala em "16 Habitants das camadas 1-3 (andares 1-15)" — mas floors 1-15 têm 15 entradas, não 16. E a seção 9 fala em "16 Habitantes de T1+T2", que também não bate (T1 sozinho já tem 19).
- **Confirmado pelo Pedro:** é erro total mesmo. **Número correto e definitivo: 16 + 3 Âncoras = 19 Habitantes por Temporada.** Vale para T1 e para T2 igualmente.
- **Ação:** corrigir `LORE_BIBLE.md` seções 2 e 9 para sempre falar em **"19 Habitantes por Temporada (16 + 3 Âncoras)"**, tanto para a condição de T3 quanto para a tabela de dependências.

### 4. T1 tem Âncoras nos chefes (5/10/15); T2 não tem nenhuma nos seus chefes (25/30/35/40)
- **Confirmado pelo Pedro:** é lacuna real de implementação (só T1 foi lançada; T2 vai ser triggada automaticamente, então precisa estar pronta). **Precisamos adicionar as 3 Âncoras faltantes em T2 (andares 25, 30, 35) antes de T2 ir ao ar.**
- **Conteúdo já redigido e aprovado como direção (ok revisar wording, mas a estrutura foi validada):**

  **Andar 25 — Guardiã da Memória Anterior** (2ª Âncora de T2, tipo `temporal`, espelha o papel do Andar 5)
  - *fala:* "O Fundador me deixou aqui sabendo que a Torre, ao acordar de vez, começaria a esquecer por conta própria — não por ordem de ninguém. Minha função é segurar uma versão da memória que ainda não foi editada. Fique tempo suficiente para que eu confirme que você não veio apagar nada."
  - *falaConcluso:* "Vinte dias e você não tentou reescrever nada do que viu. Isso é raro. A Torre edita. Você, até agora, só testemunhou."
  - *quest:* temporal, 20 dias, ecoBonus 27, moralBonus 15.

  **Andar 30 — Sentinela do Meio-Tempo** (3ª Âncora de T2, tipo `expedicao`, espelha o Andar 10) — **também resolve o item 8 (Ardenas)**
  - *fala:* "Fui plantada exatamente no meio — entre o que a Torre foi e o que se tornou. Guardo o registro de outras cidadelas que caíram nesse intervalo. Uma delas ainda ecoa: Ardenas, a mesma que o Comandante de Mármore jurou proteger. Ela não afundou. Ficou presa aqui, no mesmo estado que me prende. Traga um Erudito e prove que chegou ao Andar 35 — só assim libero o que sei sobre o que fica preso no meio-tempo."
  - *falaConcluso:* "O Erudito confirmou: Ardenas não morreu. Está no Intervalo, junto com tudo mais que a transição não deixou passar. Isso talvez importe mais adiante — quando alguém decidir ir atrás do que ficou para trás."
  - *quest:* expedicao, `profissoes: ['erudito']`, `andarMin: 35`, ecoBonus 30, recursosBonus `{ ferro: 25, pedra: 20 }`.

  **Andar 35 — Último Sussurro do Fundador** (4ª Âncora de T2, tipo `sacrificio`, espelha o Andar 15) — **também reforça a ambiguidade do item 2**
  - *fala:* "Sou o que restou de uma intenção quase apagada. Mal consigo manter forma o suficiente pra falar com você. O que está prestes a encontrar aqui talvez seja o Fundador. Talvez só o eco de uma ausência que a Torre decidiu nomear. Nem eu sei dizer qual. Pague o custo de saber mesmo assim."
  - *falaConcluso:* "Você pagou. Não posso confirmar o que vai encontrar. Só posso dizer: o que vem a seguir não vai mentir para você. Só vai ficar em silêncio sobre o que não sabe de si mesmo."
  - *quest:* sacrificio, `custo: { moral: 30 }`, ecoBonus 33, moralBonus 30.

  **Observação importante:** hoje o Andar 35 já tem um Habitante e é andar de chefe simultaneamente? **Não** — checar de novo: hoje T2 só tem Habitantes em 21,22,23,24,26,27,28,29,31,32,33,34,36,37,38,39 (16 no total, sem nada em 25/30/35/40). As 3 novas Âncoras devem ser **adicionadas** em 25/30/35 (não substituem nada existente). O Andar 40 continua sem Habitante — igual o Andar 20 em T1 (o chefe final não tem Habitante próprio, o padrão é: 3 primeiros chefes da temporada têm Âncora, o chefe final não tem).
  - **Consequência mecânica a implementar:** essas 3 novas entradas em `HABITANTES[25]`, `HABITANTES[30]`, `HABITANTES[35]` precisam de: entrada de quest completa (como as demais), entrada correspondente em `CODEX_FRAGMENTOS` (`hab_25`, `hab_30`, `hab_35`, com `ordem: 4.5` seguindo o padrão de 5/10/15 em T1), e ajuste em `floorsHabitantesTemporada`/telas que contam "quantos habitantes tem a temporada" (deve ir de 16 para 19 em T2 depois disso — a função já itera dinamicamente sobre `HABITANTES[f]`, então não deve precisar mudar código, só os dados).
  - **Atenção:** o Andar 35 já tem um Boss (`Eco do Fundador`) com `BOSS_ECO_LORE[35]` — isso é normal, olhando o padrão de T1 (Andar 5, 10, 15 têm Boss E Habitante simultaneamente). Não é conflito.

### 5. Prisão vs. preservação (o motivo de selar a entidade muda ao longo da história)
- **Confirmado pelo Pedro:** ajustar.
- **Resolução:** `verdade_t2` já resolve isso bem no nível macro. Só suavizar 2 falas de T1 que soam definitivas demais:
  - **Ferreiro (Andar 9), ANTES:** "Forjei as correntes que prendem a entidade no ápice. Elas ainda seguram —"
    **DEPOIS:** "Forjei o que me disseram que prendia a entidade no ápice. Até onde sei, ainda segura —"
  - **Tecelã (Andar 3), ANTES:** "As raízes crescem para dentro porque algo no núcleo tem fome. Não é escuridão — é apetite."
    **DEPOIS:** "As raízes crescem para dentro porque algo no núcleo pede. Chamo de fome porque é a única palavra que tenho. Pode ser fome mesmo. Pode ser só solidão."
  - **Pendente:** revisar se outras falas também precisam do mesmo tratamento (ex.: qualquer outra menção direta a "prender"/"aprisionar" a entidade em T1 que soe como fato definitivo — vale um grep por "prende"/"aprisiona"/"selad" em `HABITANTES` de T1 antes de fechar o patch).

### 6. Nome do Fundador apagado — duas motivações (mistério no Andar 29, resposta no Sussurro VII)
- **Confirmado pelo Pedro:** gostou da ideia de "seed resolvido" — não muda texto, só documenta a conexão.
- **Ação:** adicionar uma linha na tabela da seção 7 do `LORE_BIBLE.md`:
  > **Seed resolvido:** Andar 29 (mistério do nome apagado) → Sussurro VII · O Nome que Falta (T2) confirma o motivo: proteção, não vergonha.

### 7. Câmara Secreta do Andar 7 antecipa revelação de T2
- **Confirmado pelo Pedro:** proposital (chance baixa de todo mundo achar Câmaras Secretas). **Nenhuma mudança de texto.** Só documentar a intenção no LORE_BIBLE (nota de design, seção a definir — hoje a seção 7 só cobre seeds de `game-data.ts`/`lancamento.ts`, não `CAMARAS_SECRETAS`; vale adicionar uma nota geral dizendo que Câmaras Secretas podem antecipar revelações de temporadas futuras de forma proposital, já que são conteúdo opcional/raro).

### 8. Cidadela de Ardenas — única cidadela nomeada, nunca mais aparece
- **Confirmado pelo Pedro:** trazer ela de volta em T2, com gancho pra T3.
- **Resolução:** já resolvido dentro do item 4 — a nova Âncora do Andar 30 ("Sentinela do Meio-Tempo") resgata Ardenas explicitamente e planta o gancho: "Ardenas não afundou. Está presa no Intervalo." **Ação adicional:** registrar no `LORE_BIBLE.md` (seção 9, "O que ainda não existe e precisará ser construído") uma linha nova: *"Resgate de Ardenas (presa no Intervalo, não afundada) | T3 | Depende do Andar 30 de T2 implementado."*

### 9. Imortalidade narrativa do Primordial vs. mecânica de fadiga parcial
- **Confirmado pelo Pedro:** ok ser imortal, mas se o texto disser que ele é literalmente imune a cansaço, os jogadores vão querer usá-lo pra tudo (problema de exploit percebido/meta). Deixar o texto como "feito heroico" ou "história dele antes de virar eco", não como garantia absoluta.
- **Resolução:**
  - **Valdris, ANTES:** "Sobreviveu a eras antes da Torre existir. Não sabe o que é cansaço. Não conhece o que é medo."
    **DEPOIS:** "Contam que sobreviveu a eras antes da Torre existir. Dizem que não conhece cansaço, nem medo — mas ninguém o viu descansar o bastante pra confirmar."
  - Thael (T2) não precisa mexer — o card dele já é mais cauteloso por natureza.

### 10. Andar 20 sem Habitante (ok, faz sentido) vs. Andares 25/30/35/40 de T2 sem Habitante (não fazia sentido)
- **Confirmado pelo Pedro:** negligência de implementação, resolver.
- **Ação:** já coberto pelo item 4 (as 3 novas Âncoras). O Andar 40 continua sem Habitante, espelhando o Andar 20 (o "sem Habitante" no chefe final da temporada é o padrão correto, não a falha).

---

## 2. Decisão de arquitetura: centralização em `lore-content.ts`

**Pedido do Pedro:** ter um arquivo único (`src/lib/lore-content.ts`) só com texto narrativo, sem mecânica nenhuma, e fazer `game-data.ts`/`lancamento.ts` referenciarem esse texto — tanto para facilitar edição de lore isolada quanto para acelerar a escrita de T3+ (só escrever o texto lá, e "plugar o fio" na entrada mecânica do andar).

**Opção escolhida: A — migração completa agora**, incluindo já os 10 ajustes acima dentro do conteúdo migrado (não fazer em duas etapas).

### Estrutura de tipos proposta para `lore-content.ts`

```ts
// src/lib/lore-content.ts
// ─── ÚNICA FONTE DE VERDADE PARA TEXTO NARRATIVO ────────────────────────────
// Este arquivo não deve conter nenhuma referência a recursos, ecoBonus,
// condições de quest ou qualquer coisa mecânica. Só texto.

export interface HabitanteLore {
  fala: string;
  falamissao: string;
  falaConcluso: string;
  questLore: string;
}

export const HABITANTES_LORE: Record<number, HabitanteLore> = { /* floors 1-19, 21-39 (T1+T2), incluindo os 3 novos: 25, 30, 35 */ };

export interface EscolhaLore {
  prompt: string;
  opcaoA: { label: string; descricao: string; falaResultado: string };
  opcaoB: { label: string; descricao: string; falaResultado: string };
}

export const ESCOLHAS_LORE: Record<number, EscolhaLore> = { /* floors 1-19, 21-24, 26-29, 31-34, 36-39 (todas as existentes hoje) */ };

export const SUSSURROS_LORE: Record<string, { titulo: string; texto: string }> = { /* sus_t1_0..sus_t4_4, sus_v_0..sus_viii_4, + nova 'sus_vii_5' (Ninguém o Viu) */ };

export const VERDADES_LORE: Record<string, { titulo: string; texto: string }> = { /* verdade_t1, verdade_t2, pioneers_fragment, + nova 'verdade_t2_revisao' (A Verdade Revista) */ };

export const BOSS_LORE: Record<number, { titulo: string; texto: string }> = { /* 5,10,15,20,25,30,35,40 */ };

export const CAMARAS_LORE: Record<string, { descricao: string; sucessoTexto: string; falhaTexto: string; loreGanho: { titulo: string; texto: string } }> = { /* '1_1' .. '20_2', 25 câmaras (só T1 hoje) */ };

export interface NpcLore {
  cardLore: string[];
  cardLoreFinal?: string;
}

export const PRIMORDIAIS_LORE: Record<string, NpcLore> = { valdris: {...}, thael: {...} };
export const VESTIGIOS_LORE: Record<string, NpcLore> = { corven: {...}, seris: {...}, kael: {...} };
export const MARCADOS_LORE: Record<string, NpcLore> = { /* aryn, soren, irae, veth, kaet (T1) + reth, mira, caen, liora, aldric, vass (T2) */ };
```

### Padrão de uso em `game-data.ts` depois da migração

```ts
import { HABITANTES_LORE } from './lore-content';

export const HABITANTES: Record<number, HabitanteAndar> = {
  1: {
    floor: 1, nome: 'Arauto da Névoa', papel: 'Mensageiro Selado', icone: '🌫️',
    fala: HABITANTES_LORE[1].fala,
    falamissão: HABITANTES_LORE[1].falamissao,
    falaConcluso: HABITANTES_LORE[1].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 2 Batedores e conquistar o Andar 5',
      profissoes: ['batedor', 'batedor'], andarMin: 5,
      ecoBonus: 20, moralBonus: 5,
      lore: HABITANTES_LORE[1].questLore,
      recompensaDesc: '+20% loot neste andar · +5 Moral',
      // escolha continua vindo de HABITANTE_ESCOLHAS via merge automático (Object.entries(...).forEach) — não precisa mudar essa parte
    },
  },
  // ...
};
```
(Nota: usar atribuição direta campo-a-campo, não spread `...HABITANTES_LORE[1]`, porque os nomes de campo mecânico como `falamissão` têm acento e não batem 1:1 com a chave de tipo TS sem acento usada no lore-content — confirmar nome exato do campo, `falamissão` com "ã", ao gerar o patch.)

`BOSS_ECO_LORE`, `CAMARAS_SECRETAS` e `CODEX_FRAGMENTOS` (sussurros/verdades) seguem o mesmo padrão — trocam string literal por `BOSS_LORE[5].titulo` / `.texto`, etc.

`lancamento.ts` importa `PRIMORDIAIS_LORE`, `VESTIGIOS_LORE`, `MARCADOS_LORE` de `../lore-content` (ajustar path relativo) e troca os arrays `cardLore`/`cardLoreFinal` inline por referência.

### Escopo confirmado do que entra em `lore-content.ts` (campos puramente narrativos)
- `HABITANTES[n].fala`, `.falamissão`, `.falaConcluso`, `.quest.lore`
- `HABITANTE_ESCOLHAS[n].prompt` e `.opcoes[].falaResultado` (labels e descrições mecânicas como "+20 Pedra" ficam no `game-data.ts`, só o `falaResultado` — texto puro — migra; **a definir**: `label`/`descricao` são meio mecânica meio texto, decidir se migram também ou ficam)
- `CODEX_FRAGMENTOS` — campos `titulo`/`texto` dos tipos `sussurro` e `verdade` (os do tipo `habitante`/`eco_capitulo` já referenciam `HABITANTES[x].quest.lore` e `BOSS_ECO_LORE[x]` respectivamente, então migram automaticamente por transitividade, não precisam de entrada própria)
- `BOSS_ECO_LORE[n].titulo` e `.texto`
- `CAMARAS_SECRETAS[chave].descricao` e `.resultado.{sucessoTexto, falhaTexto, loreGanho}`
- `cardLore[]` / `cardLoreFinal` de `lancamento.ts` (Primordiais Valdris/Thael, Vestígios Corven/Seris/Kael, Marcados de T1 e T2)

**Fora do escopo desta migração (confirmado que fica pra depois, não foi pedido):** `POOL_EXPLORACAO`/`POOL_VELOCIDADE` (Quests Ocultas) em `game-data.ts` — também têm campos `dialogo`/`lore` que são texto puro e poderiam migrar no mesmo padrão, mas não foram citados no pedido do Pedro. Vale perguntar se ele quer incluir também.

---

## 3. Conteúdo completo já levantado do repositório (para reconstruir `lore-content.ts` sem precisar reler o repo)

Todo o texto abaixo já foi extraído literalmente do `game-data.ts`/`lancamento.ts` atuais (antes de qualquer edição) numa sessão anterior. **Isso deve ser tratado como fonte primária confiável** — não precisa reclonar/reler o repositório para ter o conteúdo, só para confirmar que nada mudou desde então.

### HABITANTES — Temporada I (Andares 1–19)
1. **Arauto da Névoa** (Mensageiro Selado) — fala/falamissão/falaConcluso/quest.lore sobre a mensagem selada, interceptada antes do destinatário.
2. **Eco dos Construtores** (Memória Coletiva) — escavaram sabendo que seriam selados, enganados por promessa de libertação.
3. **Tecelã de Raízes** (Guardiã do Crescimento) — raízes crescem por causa de algo no núcleo com fome/apetite.
4. **Voz do Cristal** (Arquivo Vivo) — comparou o jogador com 4.312 visitantes; pergunta final "o que você é, afinal?".
5. **Âncora do Primeiro Ciclo** (Fundação Consciente) — 1ª Âncora, plantada pelo Fundador, 15 dias de espera.
6. **Sentinela Sem Nome** (Guardião Perdido) — última ordem de autoridade que "não precisa mais de corpo".
7. **Jardineira Esquecida** (Curadora do Impossível) — cura com crescimento sem nutrição.
8. **Estudioso do Infinito** (Arquivista Exilado) — traduziu lista de nomes em ferro; "penúltimo nome era o seu".
9. **Ferreiro Espectral** (Forjador das Correntes) — forjou as correntes que prendem a entidade, cada vez menores.
10. **Memória da Construção** (Arquivo do Processo) — 2ª Âncora, testemunhou o Fundador vencer a resistência da Torre em 40 dias.
11. **Afogado Lúcido** (Transformado Consciente) — "não estou morrendo, estou sendo preenchido".
12. **Percussão Profunda** (Pulso da Torre) — não é ser, é o ritmo/coração da Torre.
13. **Oráculo Invertido** (Vidente do Passado) — só vê passados, futuros já devorados.
14. **Comandante de Mármore** (General do Vazio) — protege posição de Ardenas, afundada 4.000 andares abaixo.
15. **Vigia do Penúltimo Ciclo** (Preparador do Que Vem Depois) — 3ª Âncora; cita o Fundador: "Não construí uma barreira no vigésimo andar. Construí uma pergunta."
16. **Eco Faminto** (Apetite da Entidade) — o apetite que ela deixou vagar ao aprender paciência.
17. **Paradoxo Ambulante** (Memória do Que Poderia Ser) — existe em três tempos simultâneos.
18. **Último Defensor** (Construído Para Falhar) — construído pelos que tentaram parar "o que está acima" e falharam.
19. **Susurro do Limiar** (Espaço Entre) — distância que a entidade mantém "para não assustar a presa".

*(Texto literal completo de fala/falamissão/falaConcluso/quest.lore de cada um: ver histórico da conversa anterior — foram transcritos na íntegra ao ler `game-data.ts` linhas 295-792. Se essa transcrição não estiver disponível na nova sessão, reler `game-data.ts` linhas 295-792 diretamente do repo clonado.)*

### HABITANTES — Temporada II (Andares 21–39, existentes hoje)
21. **Vestígio da Voz** — memória que reconhece o jogador "de depois", não de antes.
22. **Fragmento Coletivo** — memória dos Construtores antes de terem palavras.
23. **Guardião da Memória Fixa** — preserva instante que sem testemunha se dissolveria.
24. **O Que Viu Antes** — viu o que havia antes do Andar 1, recusa falar.
26. **Eco da Expedição Perdida** — 17 membros que desceram e não conseguiram subir; escadas mudaram de lugar.
27. **Memória do Traidor** — Construtor que trocou o propósito original pelo que a Torre prometeu.
28. **Oráculo do Propósito** — vê o futuro da Torre, não do jogador.
29. **Guardião do Nome Apagado** — guarda o espaço vazio onde estava o nome do Fundador.
31. **Raiz de Origem** — onde foi colocada a primeira pedra de tudo que a Torre substituiu.
32. **Memória da Primeira Pedra** — eco da razão da pedra, não do ato.
33. **Eco do Esquecimento** — instante em que o propósito foi esquecido (não apagado).
34. **Guardião da Intenção** — intenção original era santuário/arquivo, não prisão.
36. **Habitante do Intervalo** — existe só na janela T2; revela que havia mais câmaras antes do Andar 1.
37. **Memória Nomeada** — Construtor cujo nome sobreviveu, escondido de propósito no projeto.
38. **Vigilante do Entre-Tempo** — vigia sobreposição física entre Torre antiga e atual.
39. **Porteiro do Antes** — última entidade antes do Que Havia Antes; cobra "depósito de intenção".

*(Texto literal completo: `game-data.ts` linhas 568-791. Reler do repo se necessário.)*

### NOVOS — 3 Âncoras de T2 a criar (25, 30, 35)
Ver seção 1, item 4 acima — texto completo já redigido e aprovado.

### BOSS_ECO_LORE (chefes 5, 10, 15, 20, 25, 30, 35, 40)
Textos completos transcritos na conversa anterior (`game-data.ts` linhas 1490-1523):
- 5: "Segredo do Capítulo I — O Que Foi Selado"
- 10: "Segredo do Capítulo II — O Que Vivia Aqui"
- 15: "Segredo do Capítulo III — O Que a Torre Faz"
- 20: "Segredo do Capítulo IV — O Que Sempre Esteve Aqui" (**este é o texto envolvido na inconsistência #1** — não editar o texto em si, só adicionar o contraponto em T2 via novo fragmento do Codex)
- 25: "Segredo do Capítulo V — Memória Bruta"
- 30: "Segredo do Capítulo VI — O Intervalo"
- 35: "Segredo do Capítulo VII — Eco de Origem"
- 40: "Segredo do Capítulo VIII — O Pré-Andar"

### CODEX_FRAGMENTOS — Sussurros e Verdades
Todos os sussurros (`sus_t1_0` a `sus_t4_4`, `sus_v_0` a `sus_viii_4`), `verdade_t1`, `verdade_t2` e `pioneers_fragment` foram transcritos literalmente na conversa anterior (`game-data.ts` linhas 2197-2434). **Novo conteúdo a adicionar:**
- `sus_vii_5` (ou próximo ID livre no capítulo VII): **"Sussurro VII · Ninguém o Viu"** — texto no item 2 acima.
- `verdade_t2_revisao` (novo tipo `verdade`, capítulo 8, desbloqueado junto com o início de T2): **"A Verdade Revista — O Que a Entidade Acreditava"** — texto no item 1 acima.

### CAMARAS_SECRETAS (25 câmaras, só T1 hoje — andares 1 a 20)
Texto completo (`descricao` + `resultado.sucessoTexto/falhaTexto/loreGanho`) transcrito na conversa anterior (`game-data.ts` linhas 1564-2061). Nenhuma mudança de conteúdo aprovada aqui (item 7 ficou como está, proposital). Só migram de lugar (viram referência a `CAMARAS_LORE`).

### `lancamento.ts` — Primordiais, Vestígios, Marcados
Texto completo transcrito na conversa anterior (`lancamento.ts` linhas 59-295):
- **Valdris, o Eterno** (Primordial T1) — cardLore + cardLoreFinal. **Editar conforme item 9** (ver ANTES/DEPOIS acima).
- **Thael, a Memória** (Primordial T2) — sem edição necessária.
- **Vestígios T1:** Corven, o Inquebrável / Seris, a Decifradora / Kael, o Sem-Rastro.
- **Marcados T1:** Aryn, a Cinza / Soren, o Dobrado / Irae, a Visão / Veth, o Silencioso / Kaet, a Estrategista.
- **Marcados T2:** Reth, o Fragmentado / Mira, a Ouvinte / Caen, o Construtor / Liora, a Constante / Aldric, o Arquivado / Vass, a Testemunha.

### HABITANTE_ESCOLHAS (falas alternativas de decisão binária)
Existem hoje para os floors: 1-19 (T1 completo) e 21-24, 26-29, 31-34, 36-39 (T2, todos exceto os que ainda não existem — 25/30/35 são novos e **precisarão ganhar uma escolha própria também**, seguindo o padrão, embora isso não tenha sido explicitamente pedido — **decidir na próxima sessão se as 3 novas Âncoras de T2 também ganham `escolha`, já que as Âncoras de T1 (5, 10, 15) têm**). Texto completo transcrito na conversa anterior (`game-data.ts` linhas 797-1479).

---

## 4. Ajustes pendentes no `LORE_BIBLE.md`

1. Seção 2 e seção 9: trocar toda menção a "16 Habitantes" por **"19 Habitantes (16 + 3 Âncoras)"**, tanto para T1 quanto pra condição de T3.
2. Seção 7 (tabela de seeds): adicionar linha de seed resolvido — Andar 29 → Sussurro VII · O Nome que Falta (item 6).
3. Adicionar nota (nova seção ou dentro da seção 6 "Anomalias de Lore", a definir) documentando que Câmaras Secretas podem antecipar revelações futuras de forma proposital, dado que são conteúdo raro/opcional (item 7).
4. Seção 9 ("O que ainda não existe e precisará ser construído"): adicionar linha nova — "Resgate de Ardenas (presa no Intervalo) | T3 | Depende do Andar 30 de T2".
5. Confirmar/atualizar a tabela da seção 3 (Primordiais) e/ou seção 8 (regras gerais) com uma nota sobre a ambiguidade do Fundador (item 2) — hoje a LORE_BIBLE não tem nenhuma regra explícita dizendo "a identidade do Fundador nunca é confirmada"; vale adicionar como regra de escrita permanente pra próximas temporadas não quebrarem isso sem querer.

---

## 5. Ordem de execução sugerida pra próxima sessão

1. Reclonar/reabrir o repo (`git clone https://github.com/Kurousagin/ascencion`) e confirmar que `game-data.ts`/`lancamento.ts`/`LORE_BIBLE.md` não mudaram desde a última leitura (útil rodar `git log -1` ou comparar hash, se possível).
2. Gerar o arquivo novo `src/lib/lore-content.ts` completo, com todo o conteúdo da seção 3 deste documento + as edições das seções 1 e 2.
3. Gerar os patches ANTES/DEPOIS de `game-data.ts` (import + troca de cada campo string por referência + as 3 novas entradas de Âncora em `HABITANTES`/`CODEX_FRAGMENTOS`).
4. Gerar os patches ANTES/DEPOIS de `lancamento.ts` (import + troca de `cardLore`/`cardLoreFinal` por referência).
5. Gerar os patches ANTES/DEPOIS de `LORE_BIBLE.md` (seção 4 acima).
6. Entregar tudo pro Pedro pra ele aplicar no repositório real (lembrete: ele aplica manualmente — este ambiente é só uma cópia de trabalho, não o repo dele).

---

## 6. Preferências e regras a manter em qualquer patch futuro

- Nunca gerar arquivos inteiros para arquivos que já existem no repo — sempre ANTES/DEPOIS.
- Arquivos novos podem ser gerados completos.
- A Torre nunca mente, só omite — qualquer resolução de inconsistência deve preservar isso (por isso a solução do item 1 foi "reinterpretação", não "correção de erro").
- O Observador nunca tem pronome fixo; nunca responde diretamente "o que você é" em T1/T2.
- Nunca escrever "100 andares" explicitamente em texto de T1/T2 (usar "centena", "algo além do vigésimo").
- Preferência de estilo de código do Pedro: mudanças em `game-data.ts`/repos dele sempre como patch inline (ANTES: x / DEPOIS: y), nunca arquivo inteiro.
