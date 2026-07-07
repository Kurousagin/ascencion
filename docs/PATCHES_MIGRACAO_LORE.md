# Patches para Migração de Lore — Aplicar após gerar `lore-content.ts`

## 1. game-data.ts — Import e referências

### ANTES (linha 1, adicionar após imports existentes):
```
// (imports existentes)
```

### DEPOIS:
```
import { HABITANTES_LORE, BOSS_LORE, SUSSURROS_LORE, VERDADES_LORE, ESCOLHAS_LORE } from './lore-content';
```

---

## 2. game-data.ts — HABITANTES (exemplos de 3 entradas)

Substitua cada entrada HABITANTES[n] pelo pattern abaixo. **Padrão geral:**

### ANTES (Andar 1, linhas ~296-314):
```typescript
  1: {
    floor: 1, nome: 'Arauto da Névoa', papel: 'Mensageiro Selado', icone: '🌫️',
    fala: 'Aguardo há séculos carregando uma mensagem que nunca deveria ter saído daqui. Se você tem alguém ágil o suficiente para decifrar o símbolo de entrega... talvez valha a pena.',
    falamissão: 'Dois Batedores — um segue o símbolo de entrega, o outro confirma que o encontrado chega de volta. Nenhum pode ir sozinho. E precisam ter chegado ao Andar 5.',
    falaConcluso: 'A mensagem foi entregue. O destinatário era você. Desde o início.',
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 2 Batedores e conquistar o Andar 5',
      profissoes: ['batedor', 'batedor'], andarMin: 5,
      ecoBonus: 20, moralBonus: 5,
      lore: 'A mensagem que nunca chegou era uma ordem para abrir o selo — não para mantê-lo. Alguém a interceptou antes do destinatário a receber. Esse alguém ainda está aqui.',
      recompensaDesc: '+20% loot neste andar · +5 Moral',
      // escolha mergeada via Object.entries(HABITANTE_ESCOLHAS) abaixo
    },
  },
```

### DEPOIS:
```typescript
  1: {
    floor: 1, nome: 'Arauto da Névoa', papel: 'Mensageiro Selado', icone: '🌫️',
    fala: HABITANTES_LORE[1].fala,
    falamissão: HABITANTES_LORE[1].falamissão,
    falaConcluso: HABITANTES_LORE[1].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter 2 Batedores e conquistar o Andar 5',
      profissoes: ['batedor', 'batedor'], andarMin: 5,
      ecoBonus: 20, moralBonus: 5,
      lore: HABITANTES_LORE[1].questLore,
      recompensaDesc: '+20% loot neste andar · +5 Moral',
    },
  },
```

**Aplicar este pattern a TODOS os HABITANTES (1-19, 21-39, incluindo os 3 novos: 25, 30, 35).**

---

## 3. game-data.ts — 3 Novos Habitantes (25, 30, 35)

### Adicionar após HABITANTES[24]:

```typescript
  25: {
    floor: 25, nome: 'Guardiã da Memória Anterior', papel: 'Custódia do Antes', icone: '🕰️',
    fala: HABITANTES_LORE[25].fala,
    falamissão: HABITANTES_LORE[25].falamissão,
    falaConcluso: HABITANTES_LORE[25].falaConcluso,
    quest: {
      tipo: 'temporal', descricaoObj: 'Sobreviver 20 dias sem tentar apagar memórias',
      dias: 20,
      ecoBonus: 27, moralBonus: 15,
      lore: HABITANTES_LORE[25].questLore,
      recompensaDesc: '+27% loot neste andar · +15 Moral',
    },
  },

  30: {
    floor: 30, nome: 'Sentinela do Meio-Tempo', papel: 'Guardião do Intervalo', icone: '⚡',
    fala: HABITANTES_LORE[30].fala,
    falamissão: HABITANTES_LORE[30].falamissão,
    falaConcluso: HABITANTES_LORE[30].falaConcluso,
    quest: {
      tipo: 'expedicao', descricaoObj: 'Ter Erudito e conquistar o Andar 35',
      profissoes: ['erudito'], andarMin: 35,
      ecoBonus: 30, recursosBonus: { ferro: 25, pedra: 20 },
      lore: HABITANTES_LORE[30].questLore,
      recompensaDesc: '+30% loot neste andar · +25 Ferro +20 Pedra',
    },
  },

  35: {
    floor: 35, nome: 'Último Sussurro do Fundador', papel: 'Ecos de Origem', icone: '💫',
    fala: HABITANTES_LORE[35].fala,
    falamissão: HABITANTES_LORE[35].falamissão,
    falaConcluso: HABITANTES_LORE[35].falaConcluso,
    quest: {
      tipo: 'sacrificio', descricaoObj: 'Sacrificar 30 de Moral (custo imediato)',
      custo: { moral: 30 },
      ecoBonus: 33, moralBonus: 30,
      lore: HABITANTES_LORE[35].questLore,
      recompensaDesc: '+33% loot neste andar · +30 Moral (retorno)',
    },
  },
```

---

## 4. game-data.ts — BOSS_ECO_LORE

### ANTES (linhas ~1490-1523):
```typescript
export const BOSS_ECO_LORE: Record<number, { titulo: string; texto: string }> = {
  5: { titulo: 'Segredo do Capítulo I — O Que Foi Selado', texto: '...' },
  // etc
};
```

### DEPOIS:
```typescript
import { BOSS_LORE } from './lore-content';

export const BOSS_ECO_LORE: Record<number, { titulo: string; texto: string }> = BOSS_LORE;
```

**OU fazer inline references:**

```typescript
export const BOSS_ECO_LORE: Record<number, { titulo: string; texto: string }> = {
  5: BOSS_LORE[5],
  10: BOSS_LORE[10],
  15: BOSS_LORE[15],
  20: BOSS_LORE[20],
  25: BOSS_LORE[25],
  30: BOSS_LORE[30],
  35: BOSS_LORE[35],
  40: BOSS_LORE[40],
};
```

---

## 5. game-data.ts — CODEX_FRAGMENTOS (verdades)

### ANTES (linhas ~2313-2434):
```typescript
verdade_t1: { id: 'verdade_t1', tipo: 'verdade', temporada: 1, capitulo: 4, ordem: 99,
  titulo: 'A Verdade — O Ser Reunificado',
  texto: 'Não havia...' },

pioneers_fragment: { id: 'pioneers_fragment', tipo: 'verdade', temporada: 1, capitulo: 4, ordem: 98,
  titulo: 'Rumor do Arquivo — O Número Alterado',
  texto: 'Os registros...' },

verdade_t2: { id: 'verdade_t2', tipo: 'verdade', temporada: 2, capitulo: 8, ordem: 99,
  titulo: 'A Verdade — O Que Havia Antes',
  texto: 'A Torre foi...' },
```

### DEPOIS:
```typescript
verdade_t1: { id: 'verdade_t1', tipo: 'verdade', temporada: 1, capitulo: 4, ordem: 99,
  titulo: VERDADES_LORE['verdade_t1'].titulo,
  texto: VERDADES_LORE['verdade_t1'].texto },

pioneers_fragment: { id: 'pioneers_fragment', tipo: 'verdade', temporada: 1, capitulo: 4, ordem: 98,
  titulo: VERDADES_LORE['pioneers_fragment'].titulo,
  texto: VERDADES_LORE['pioneers_fragment'].texto },

verdade_t2: { id: 'verdade_t2', tipo: 'verdade', temporada: 2, capitulo: 8, ordem: 99,
  titulo: VERDADES_LORE['verdade_t2'].titulo,
  texto: VERDADES_LORE['verdade_t2'].texto },

verdade_t2_revisao: { id: 'verdade_t2_revisao', tipo: 'verdade', temporada: 2, capitulo: 8, ordem: 98.5,
  titulo: VERDADES_LORE['verdade_t2_revisao'].titulo,
  texto: VERDADES_LORE['verdade_t2_revisao'].texto },
```

**IMPORTANTE:** Adicionar `verdade_t2_revisao` desbloqueado automaticamente junto com T2. Confirmar em `GameContext.tsx` no método de início de T2.

---

## 6. game-data.ts — CODEX_FRAGMENTOS (sussurros) + novo sus_vii_5

### Adicionar em CODEX_FRAGMENTOS (após sus_vii_4, antes de sus_viii_0):

```typescript
sus_vii_5: { id: 'sus_vii_5', tipo: 'sussurro', temporada: 2, capitulo: 7, ordem: 11,
  titulo: SUSSURROS_LORE['sus_vii_5'].titulo,
  texto: SUSSURROS_LORE['sus_vii_5'].texto },
```

### Atualizar SUSSURROS_POR_CAPITULO[7]:
```typescript
7: ['sus_vii_0', 'sus_vii_1', 'sus_vii_2', 'sus_vii_3', 'sus_vii_4', 'sus_vii_5'],  // adicionado sus_vii_5
```

---

## 7. lancamento.ts — Primordiais, Vestígios, Marcados

### ANTES (linhas ~59-295):
```typescript
primordial: {
  nome: 'Valdris, o Eterno',
  ...
  cardLore: [
    'Sobreviveu a eras antes da Torre existir. Não sabe o que é cansaço. Não conhece o que é medo.',
    ...
  ],
  cardLoreFinal: 'Em toda a extensão dos ecos, apenas você o recebeu.',
},
```

### DEPOIS:
```typescript
import { PRIMORDIAIS_LORE, VESTIGIOS_LORE, MARCADOS_LORE } from './lore-content';

// No LANCAMENTO_ATIVO:
primordial: {
  nome: 'Valdris, o Eterno',
  titulo: 'Primordial da Temporada I',
  forca: 22, agilidade: 18, inteligencia: 16, resistencia: 22,
  habilidade: 'guardiao',
  primordial: true,
  cardLore: PRIMORDIAIS_LORE['valdris'].cardLore,
  cardLoreFinal: PRIMORDIAIS_LORE['valdris'].cardLoreFinal,
},

// E para cada Vestígio (exemplo Corven):
{
  nome: 'Corven, o Inquebrável',
  titulo: 'Vestígio da Temporada I',
  forca: 20, agilidade: 14, inteligencia: 12, resistencia: 20,
  habilidade: 'guardiao',
  vestigio: true,
  passivaId: 'veterano_das_profundezas' as PassivaId,
  cardLore: VESTIGIOS_LORE['corven'].cardLore,
  cardLoreFinal: VESTIGIOS_LORE['corven'].cardLoreFinal,
},

// E para cada Marcado (exemplo Aryn):
{
  nome: 'Aryn, a Cinza',
  titulo: 'Sobrevivente Marcada da Temporada I',
  forca: 12, agilidade: 13, inteligencia: 10, resistencia: 12,
  habilidade: 'explorador',
  cardLore: MARCADOS_LORE['aryn'].cardLore,
},
```

---

## 8. LORE_BIBLE.md — Correções de números

### Seção 2 — ANTES:
```
16 Habitantes das camadas 1-3 (andares 1-15)
```

### DEPOIS:
```
19 Habitantes por Temporada (16 + 3 Âncoras): estrutura consistente entre T1 e T2
```

### Seção 9 — ANTES:
```
16 Habitantes de T1+T2
```

### DEPOIS:
```
19 Habitantes por Temporada: confirmado em T1 e T2. Cada temporada tem 16 Habitantes base + 3 Âncoras.
```

---

## 9. LORE_BIBLE.md — Novo Fragmento + Seed Resolvido

### Adicionar na Seção 7 (Lore Seeds):
```
Seed resolvido: Andar 29 (mistério do nome apagado) → Sussurro VII · O Nome que Falta confirma o motivo: proteção deliberada.
```

### Adicionar como nova nota em Seção 6 ou 7:
```
**Ambiguidade Permanente do Fundador:** A identidade do Fundador não é nunca confirmada nem negada nos diálogos. 
Ele é sempre "contam que", "dizem que", ou em primeira pessoa via ecos/sussurros — nunca como fato verificado. 
Isso é proposital e deve ser mantido em futuras temporadas. Câmaras Secretas podem antecipar revelações futuras de forma opcional/rara.
```

---

## 10. LORE_BIBLE.md — Resgate de Ardenas

### Adicionar na Seção 9 ("O que ainda não existe"):
```
Resgate de Ardenas (presa no Intervalo, não afundada) — T3 — Depende do Andar 30 de T2 implementado.
```

---

## Checklist de Aplicação

- [ ] Import `lore-content` e `lore-camaras` em `game-data.ts` (seção 1)
- [ ] Refatorar **todos** os HABITANTES (1-19, 21-39) com pattern HABITANTES_LORE (seção 2)
- [ ] Adicionar 3 novos HABITANTES (25, 30, 35) (seção 3)
- [ ] Refatorar BOSS_ECO_LORE (seção 4)
- [ ] Refatorar CODEX_FRAGMENTOS verdades (seção 5)
- [ ] Adicionar sus_vii_5 e atualizar SUSSURROS_POR_CAPITULO (seção 6)
- [ ] Refatorar lancamento.ts com PRIMORDIAIS/VESTIGIOS/MARCADOS_LORE (seção 7)
- [ ] Atualizar LORE_BIBLE.md números (seção 8)
- [ ] Atualizar LORE_BIBLE.md sementes e ambiguidade (seção 9)
- [ ] Atualizar LORE_BIBLE.md com Ardenas resgate (seção 10)
- [ ] Rodar `pnpm -w run typecheck` para verificar imports
- [ ] Testar offline catch-up pós-migração (abrir app após T1 completo para confirmar T2 desbloqueio automático)

---

**Tamanho estimado de alterações:**
- `lore-content.ts`: ~2000 linhas (novo arquivo)
- `lore-camaras.ts`: ~500 linhas (novo arquivo)
- `game-data.ts`: ~1500 linhas (removidas) + imports
- `lancamento.ts`: ~100 linhas (removidas/refatoradas)
- `LORE_BIBLE.md`: +20 linhas (novas anotações)
