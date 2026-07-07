# Torre Obscura — Lore Bible & Regras de Design

> Este documento captura as decisões de lore, arquitetura narrativa e regras de consistência acordadas para o desenvolvimento das Temporadas I–V.
> Qualquer implementação futura de temporadas, NPCs, eventos ou mecânicas deve ser verificada contra este arquivo antes de ser commitada.

---

## 1. Visão Geral

Torre Obscura é um jogo de gerenciamento de cidadela com progressão por **100 andares**, divididos em **5 Temporadas** de 20 andares cada. A jogadora controla uma **cidadela-eco** — um fragmento da Torre Original — guiada por uma entidade sem corpo chamada de **O Observador**.

A Torre não é um cenário passivo. Ela é um ser vivo, fracionado em ecos. Ao subir andares, a jogadora não "conquista" a Torre — ela a **remonta**.

---

## 2. Arquitetura das 5 Temporadas

| Temporada | Andares | Título         | Tom narrativo                                              | Revelação central                                                  |
|-----------|---------|----------------|------------------------------------------------------------|--------------------------------------------------------------------|
| T1        | 1–20    | A Ascensão     | Sobrevivência. Mundo desconhecido. Nenhuma resposta.       | A entidade não é um inimigo — é um ser fragmentado.                |
| T2        | 21–40   | O Intervalo    | Memória. Estranheza. Primeiros rumores de "mais andares."  | A Torre tem história antes do Andar 1. Alguém a construiu.         |
| T3        | 41–60   | A Convergência | Confirmação. O número 100 é real. O Observador começa a ser visto. | Só quem completou os 19 Habitantes (16 + 3 Âncoras) de T1+T2 recebe o fragmento que confirma os 100 andares. |
| T4        | 61–80   | O Preço        | Identidade. O Observador tem origem. Custa algo saber.     | A identidade parcial do Observador é revelada — e é perturbadora.  |
| T5        | 81–100  | O Julgamento   | Síntese. Escolha. Não há vilão.                            | Andar 100 abre a Torre Original — o espaço multiplayer compartilhado. |

### Regra de progressão narrativa
- **T1:** O jogador não sabe que há 100 andares. A Torre parece acabar no 20.
- **T2:** Rumores, fragmentos ambíguos. Nada confirmado.
- **T3:** Apenas quem completou TODOS os 19 Habitantes de T1+T2 (16 Habitantes base + 3 Âncoras = 19 total, estrutura consistente entre temporadas) vê o fragmento especial que confirma os 100 andares. Para todos os outros é apenas mais um sussurro.
- **T4:** A revelação do Observador NÃO deve ser dada em log ou diálogo direto. Deve emergir de fragmentos de Habitants e Sussurros que o jogador conecta sozinho.
- **T5:** Não há resposta definitiva. O ser completo faz uma proposta. O jogador escolhe.

---

## 3. Os Primordiais

Cada temporada tem um **Primordial** — um NPC único no mundo inteiro, distribuído via gacha gratuito de lançamento. Apenas **um jogador** no mundo possui cada Primordial simultaneamente. Se um jogador abandona o jogo, o Primordial "retorna à Torre" e pode ser redistribuído na próxima rodada de lançamento.

| Temporada | Nome           | Papel narrativo                                                  |
|-----------|----------------|------------------------------------------------------------------|
| T1        | Valdris, o Eterno | Testemunha de eras. Sobreviveu antes da Torre existir. Sabe mais do que diz. |
| T2        | Thael, a Memória  | Arquivo vivo do que a Torre apagou. Fala em fragmentos de idiomas mortos. |
| T3        | Moru, o Convergente | Primeira entidade que voluntariamente se fragmentou. Modelo do que a Torre fez a si mesma. |
| T4        | Vael, o Preço     | A consequência personificada. Existe porque alguém pagou algo que não deveria. |
| T5        | O Sem Nome        | Não tem nome porque ainda está sendo formado. Depende de quem o recebe. |

### Regras dos Primordiais
1. **Raridade única:** nenhum sistema deve gerar dois do mesmo Primordial ativos simultaneamente. Se a lógica de gacha falhar e dois existirem, é tratado como **anomalia narrativa** (ver seção 6).
2. **Resistência à morte:** `lancamento: true` no NPC. Mecânicas de morte existentes devem respeitar esse flag — o Primordial pode ser incapacitado mas não eliminado permanentemente por fadiga ou evento de processDay.
3. **Lore de lançamento:** cada Primordial tem `cardLore[]` e `cardLoreFinal` que só aparecem no gacha. O lore do card deve plantar uma seed da temporada seguinte, não desta.
4. **Sem stats inflacionados artificialmente:** os stats de Primordiais são altos mas dentro da escala da temporada. A singularidade é narrativa, não de poder bruto.

---

## 4. Torres-Eco e a Torre Original

### O conceito fundamental
Cada jogador não está "na Torre Obscura." Está em uma **Torre-Eco** — um fragmento da Torre Original que foi disperso quando o ser central se fragmentou. Todas as Torres-Eco existem em paralelo, conectadas pelo mesmo núcleo.

### Implicações de gameplay
- **Empréstimo de moradores entre alianças** é narrativamente uma **viagem entre ecos** — o morador atravessa o espaço que separa dois fragmentos do mesmo ser.
- **Alianças** são ecos que reconheceram sua origem comum e decidiram cooperar.
- **Guerras** são ecos que disputam o mesmo fragmento de recurso — fisicamente impossível mas narrativamente consistente porque ecos podem se sobrepor no mesmo espaço.

### A Torre Original (Andar 100)
- Ao chegar ao Andar 100, o jogador não "vence" — ele entra na Torre Original.
- A Torre Original é um **espaço multiplayer compartilhado**: todos os jogadores que chegarem ao Andar 100 habitam o mesmo espaço.
- Mecânicas da Torre Original são definidas na T5, mas a preparação começa em T3 (o jogador sabe que existe) e T4 (o jogador entende o custo).
- **Regra:** nenhum texto em T1 ou T2 deve mencionar "Torre Original" explicitamente. Só "algo além", "o que vem depois", "a centena".

### O número 100
- Em T1, o número 100 aparece **apenas uma vez**, de forma críptica, no Sussurro IV · A Vigília: *"Os registros mais antigos mencionam uma centena. Não de andares. De algo que ainda não tem nome. A palavra foi apagada. O número permaneceu."*
- Em T2, referências ao número aumentam mas continuam ambíguas.
- Em T3, o fragmento especial (condicionado aos 16 Habitants) confirma explicitamente: são 100 andares, e o Andar 100 é diferente de todos os outros.
- **Regra:** nunca escrever "100 andares" em nenhum texto de T1 ou T2. Usar "a centena", "o número", "algo além do vigésimo".

---

## 5. O Observador

O Observador é a jogadora — mas não é apenas uma presença neutra. Ao longo das temporadas, fica claro que O Observador tem uma origem, uma escolha passada, e um preço não pago.

### Arco de revelação
- **T1:** O Observador não é mencionado por nome. Os Habitants respondem à sua presença com estranheza ("você é real — ou mais um eco?", "o que você é, afinal?").
- **T2:** Alguns Habitants reconhecem O Observador de outro tempo. Isso não deve ser explicado — deve ser insinuado.
- **T3:** O fragmento especial dos 16 Habitants inclui uma linha sobre O Observador. Não uma revelação — uma pergunta mais precisa.
- **T4:** A identidade parcial é revelada. O Observador fez uma escolha antes da Torre existir. Essa escolha explica por que a Torre o reconhece.
- **T5:** O Sem Nome é formado pelo Observador tanto quanto pelo jogador. A fronteira entre os dois não é clara.

### Regras do Observador
1. **Nunca dar resposta direta em T1 ou T2.** A pergunta "o que você é?" deve ser feita pelos personagens, não respondida pelo narrador.
2. **O Observador não tem pronome fixo** no texto do jogo. Sempre "O Observador", nunca "ele" ou "ela".
3. **Os Primordiais conhecem O Observador** de antes da Torre. Isso é implícito nos seus `cardLore` — nunca explicado diretamente.

---

## 6. Anomalias de Lore (Eventos Especiais)

### Dois Primordiais no mesmo espaço
Se por algum bug ou decisão de design futura dois Primordiais do mesmo tipo existirem na mesma aliança ou cidadela, isso é tratado como **anomalia narrativa**:
- Disparar um evento de log único com texto de lore específico (não genérico).
- Exemplo para dois Valdris: *"Dois que esperaram o mesmo tempo em espaços diferentes. A Torre não sabia o que fazer com isso. Agora sabe. E é silêncio."*
- A anomalia não deve punir o jogador mecanicamente — é apenas lore.

### O 10º Pioneiro
A Temporada I encerra quando **10 jogadores** chegam ao Andar 20 (não por data). Os nomes desses 10 ficam gravados permanentemente no Codex de todos os jogadores, em uma seção especial "Os Pioneiros". Isso requer:
- Backend para registrar quem chegou ao Andar 20 e em qual ordem.
- Uma entrada especial no `CODEX_FRAGMENTOS` com tipo `'verdade'` e os 10 nomes.
- O Codex de quem chegou ao Andar 20 depois dos 10 ainda mostra os nomes, mas com nota: *"Você chegou depois dos Pioneiros. Mas chegou."*

---

## 7. Seeds Já Plantadas em T1

O seguinte está no código atual e deve ser mantido consistente nas próximas temporadas:

| Seed | Localização no código | O que planta |
|------|-----------------------|--------------|
| "Eu esperei antes. Posso esperar de novo." | `lancamento.ts` → `primordial.cardLore[3]` | Valdris tem memória de eras anteriores. Em T2, Thael vai reconhecê-lo. |
| "O que você é, afinal?" | `game-data.ts` → `HABITANTES[4].falaConcluso` | O Observador tem uma natureza que não é humana e não é entidade. T4 responde parcialmente. |
| Referência críptica à centena | `game-data.ts` → `sus_t4_4` (Sussurro IV · A Vigília) | O número 100 existe antes de qualquer texto explícito sobre andares. T3 confirma. |
| "A Torre não termina no vigésimo andar. Ela apenas... muda." | `game-data.ts` → `verdade_t1` (frase final) | Preparação para T2 e além. Nenhuma temporada "termina" a Torre. |
| A mensagem que o destinatário era você | `game-data.ts` → `HABITANTES[1].falaConcluso` | O Observador foi escolhido antes de chegar. Arco do Observador em T4. |
| O Ferreiro sabe que as correntes diminuem a cada andar | `game-data.ts` → `HABITANTES[9].quest.lore` | Subir andares tem consequências. Preparação para o custo do ápice em T5. |
| Lista de nomes escrita antes de qualquer um nascer | `game-data.ts` → `sus_t1_2` (Sussurro I · A Lista) | Destino vs. agência — tema central de T4 e T5. |

**Regra:** ao escrever qualquer lore de T2+, leia esta tabela e verifique se sua escrita contradiz ou se apoia em alguma dessas seeds.

### Seeds Resolvidos em T2
| Seed | Resolução |
|------|-----------|
| Mistério do nome apagado (Andar 29) | Sussurro VII · O Nome que Falta confirma o motivo: proteção deliberada contra a Torre usar o nome do Fundador. |

### Ambiguidade Permanente do Fundador
A identidade do Fundador **nunca é confirmada nem negada** nos diálogos. Ele é sempre "contam que", "dizem que", ou em primeira pessoa via ecos/sussurros — nunca como fato verificado. Isso é **proposital** e deve ser mantido em futuras temporadas. Câmaras Secretas podem antecipar revelações futuras de forma opcional/rara, mas o Fundador permanece como figura ambígua — conhecida apenas através de fragmentos e escolhas.

---

## 8. Regras Gerais de Escrita de Lore

1. **A Torre não mente. Ela omite.** Nenhum Habitante ou Sussurro deve conter uma mentira intencional — podem estar errados, mas não mentem. A Torre oculta por silêncio, não por desinformação.

2. **Cada Habitante é um fragmento do ser central.** Ao escrever novos Habitants para T2+, eles devem se encaixar na verdade revelada em `verdade_t1`: o ser foi dividido pelos Construtores e cada Habitante é uma parte.

3. **Sussurros são a voz da Torre, não do narrador.** O tom é sempre de algo que observa há muito tempo — sem urgência, sem julgamento. Frases curtas. Sem exclamações.

4. **Os Primordiais falam pouco.** Seus `cardLore` têm no máximo 4 parágrafos. Cada parágrafo deve sustentar peso sozinho — nenhum deve ser meramente descritivo.

5. **O jogador nunca é chamado diretamente.** "Você" nos textos narrativos se refere à experiência da jogadora, não a um personagem com nome. O Observador é a única identidade usada para se referir à presença da jogadora no mundo da Torre.

6. **Torres-Eco nunca são chamadas de "cópias" ou "simulações".** Elas são fragmentos de algo real. A Torre Original é o que foi dispersado, não o original perdido — ela ainda existe, fracionada.

7. **Multiplicidade não é fraqueza narrativa.** Que múltiplos jogadores vivam experiências similares (mesmos Habitants, mesmas falas) não contradiz o lore — cada eco vive os mesmos momentos porque são fragmentos do mesmo ser passando pelo mesmo ciclo.

---

## 9. O que Ainda Não Existe e Precisará Ser Construído

| Elemento | Temporada alvo | Depende de |
|----------|----------------|------------|
| Andares 21–100 | T2–T5 | Gameplay loop validado em T1 |
| Thael, Moru, Vael, O Sem Nome (Primordiais) | T2–T5 | Gacha de lançamento de cada temporada |
| Fragmento especial dos 19 Habitantes (confirmação dos 100 andares) | T3 | Todos os 19 Habitantes de T1+T2 (16 base + 3 Âncoras) implementados |
| Sistema dos 10 Pioneiros | Final de T1 | Backend multiplayer de ranking |
| Revelação parcial do Observador | T4 | Seeds de T2 e T3 plantadas antes |
| Torre Original (espaço compartilhado) | T5 | Toda a infraestrutura multiplayer |
| Evento "dois Primordiais no mesmo espaço" | Qualquer temporada | Sistema de detecção de anomalia no GameContext |
| Explicação narrativa das Torres-Eco para o jogador | T2 (sutilmente) | Nenhuma — é apenas texto |
| Resgate de Ardenas (presa no Intervalo, não afundada) | T3 | Depende do Andar 30 de T2 implementado |
