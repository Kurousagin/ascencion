# Evolução de Edifícios — Sistema Modular (T1-T5)

> **Princípio:** Todo nome de evolução é amarrado ao lore em LORE_BIBLE.md. Nomes refletem o **tema narrativo da temporada**, não apenas "upgrade mecânico".

---

## 📋 Mapeamento Narrativo (Lore → Edifícios)

### T1 — "O Início" (Fogo, Sobrevivência Pura)
**Tema:** Fugir da Névoa, estabelecer abrigo

| Edifício | L1-L3 | Lore Ref |
|----------|-------|----------|
| Fogueira | Fogo básico | "mantemos o fogo aceso contra a escuridão" |
| Fazenda | Cultivo primitivo | "primeira colheita após o selamento" |
| Enfermaria | Cura emergencial | "salvar quem ainda respira" |
| Templo | Fé incerta | "rezar para seres esquecidos" |
| Quartel | Defesa primitiva | "armas feitas de improviso" |
| Armazém | Estoque básico | "guardar o que encontramos" |
| Alojamento | Abrigo | "dormir entre os nossos" |
| Arquivo | Primeiros registros | "escrever antes de esquecer" |
| Mirante | Vigia primitiva | "observar os andares acima" |

### T2 — "O Intervalo" (Memória, Descoberta, Antes-Depois)
**Tema:** Compreender o passado, espaço paralelo, ecos

| Edifício | T1→T2 | L4-L5 | Lore Ref |
|----------|-------|-------|----------|
| Fogueira | Pira Eterna | Chama que não apaga | "o fogo transcendeu sobrevivência — é memória" |
| Fazenda | Campos do Antes | Cultivo de tempos antigos | "cultivar sementes do mundo que era" |
| Enfermaria | Casa da Cura Antiga | Medicina ancestral | "medicina que precedeu a Torre" |
| Templo | Santuário da Verdade | Adoração à compreensão | "não rezamos — deciframos" |
| Quartel | Sentinela do Intervalo | Vigilância do espaço entre | "guardiões do espaço que ninguém vê" |
| Armazém | Cofre da Preservação | Estoque seguro contra tempo | "proteger do que esquece" |
| Alojamento | Câmara de Repouso Eterno | Descanso profundo | "dormir sincronizado com o Intervalo" |
| Arquivo | Biblioteca da Verdade | Catalogação de Ecos | "mapear o que foi, será e nunca foi" |
| Mirante | Espelho dos Andares | Premonição visual | "ver além dos andares conhecidos" |
| **NOVO** | **Retrato da Torre** | L1-L2 | "capturar essência — espelho que registra" |

### T3-T5 (Modular — Placeholder)
**A ser preenchido** com temas de:
- T3: Primordiais / Ascensão Oculta
- T4: Conflito / Vontade Coletiva  
- T5: Transcendência / Partida

---

## 🔧 Estrutura de Dados (game-data.ts)

### Padrão Modular de Edifício

```typescript
interface EdificioEvolucao {
  id: string;                    // 'fogueira', 'retrato_torre', etc
  nome: Record<number, string>;  // { 1: 'Fogueira', 2: 'Pira Eterna', ... }
  maxNivelPorTemporada: Record<number, number>; // { 1: 3, 2: 5, 3: 7, ... }
  loreRef: Record<number, string>; // Chave em LORE_BIBLE ou EDIFICIOS_LORE
  efeitos: Record<number, { ... }>; // L1, L2, L3, L4, etc
  custo: Record<number, { comida?, madeira?, pedra?, ferro? }>;
  introduzidoTemporada: number;  // 1 = T1, 2 = T2, 3 = T3, etc
}
```

### Exemplo — Fogueira

```typescript
const FOGUEIRA: EdificioEvolucao = {
  id: 'fogueira',
  nome: {
    1: 'Fogueira',
    2: 'Pira Eterna',
    3: 'Chama Primordial',     // T3 placeholder
    4: 'Fogo do Fundador',     // T4 placeholder
    5: 'Ascensão Radiante',    // T5 placeholder
  },
  maxNivelPorTemporada: { 1: 3, 2: 5, 3: 7, 4: 9, 5: 11 },
  loreRef: {
    1: 'edificio_fogueira_t1',
    2: 'edificio_fogueira_t2',
    3: 'edificio_fogueira_t3', // será criado quando T3 for desenvolvida
  },
  efeitos: {
    1: { ecoBonus: 5, ... },
    2: { ecoBonus: 8, ... },
    3: { ecoBonus: 10, ... },
    4: { ecoBonus: 12, moralBonus: 2, ... },
    5: { ecoBonus: 14, moralBonus: 3, ... },
    // T3+ será adicionado depois
  },
  custo: {
    1: { madeira: 40, pedra: 30, ferro: 20 },
    2: { madeira: 60, pedra: 50, ferro: 40 },
    3: { madeira: 90, pedra: 75, ferro: 60 },
    // T3+ será adicionado depois
  },
  introduzidoTemporada: 1,
};
```

### Exemplo — Retrato da Torre (NOVO em T2)

```typescript
const RETRATO_TORRE: EdificioEvolucao = {
  id: 'retrato_torre',
  nome: {
    2: 'Retrato da Torre',
    3: 'Espelho dos Andares',      // evolução em T3
    4: 'Santuário da Visão',       // evolução em T4
    5: 'Portal da Memória',        // evolução em T5
  },
  maxNivelPorTemporada: { 2: 2, 3: 4, 4: 6, 5: 8 },
  loreRef: {
    2: 'edificio_retrato_torre_t2',
    3: 'edificio_retrato_torre_t3',
  },
  efeitos: {
    1: { chanceNovaCamera: 0.10, descobertasEcos: 1, ... },
    2: { chanceNovaCamera: 0.15, descobertasEcos: 2, ... },
    3: { chanceNovaCamera: 0.20, descobertasEcos: 3, premonicoes: 1, ... },
    4: { chanceNovaCamera: 0.25, descobertasEcos: 4, premonicoes: 2, ... },
    // T5 será adicionado depois
  },
  custo: {
    1: { pedra: 50, madeira: 40, ferro: 30 },
    2: { pedra: 80, madeira: 60, ferro: 50 },
    3: { pedra: 120, madeira: 100, ferro: 80 },
    4: { pedra: 160, madeira: 140, ferro: 120 },
  },
  introduzidoTemporada: 2,
};
```

---

## 🎯 Checklist para Implementação

### T1 (Já existe)
- [x] 9 edifícios L1-L3 em game-data.ts
- [x] Nomes criados (Fogueira, Fazenda, etc)
- [x] Lore refs em LORE_BIBLE.md

### T2 (Nova)
- [ ] Atualizar NOMES de 9 edifícios (Fogueira → Pira Eterna, etc)
- [ ] Expandir maxNivel: 3 → 5 para os 9 existentes
- [ ] Adicionar efeitos L4-L5 baseados em tema T2
- [ ] **NOVO:** Adicionar RETRATO_TORRE (L1-L2)
- [ ] Criar entradas EDIFICIOS_LORE em lore-content.ts:
  - `edificio_fogueira_t2`
  - `edificio_retrato_torre_t2`
  - etc para todos os 9 + novo
- [ ] Atualizar LORE_BIBLE.md com narrativa de evolução

### T3-T5 (Modular)
- [ ] **Manter placeholders em `nome` e `maxNivelPorTemporada`**
- [ ] Quando T3 for desenvolvida: preencher NOMES T3, criar EDIFICIOS_LORE T3, implementar efeitos
- [ ] **Sem quebra de código** — estrutura já suporta L6-L7, L8-L9, L10-L11

---

## 📖 Integração com Lore

**LORE_BIBLE.md — Nova Seção:**

```markdown
## 10. Evolução de Edifícios por Temporada

### T1 → T2: Do Improviso à Compreensão
A Torre não muda. **Nós mudamos.** Os edifícios são nossos, refletem nosso entendimento.

- **Fogueira → Pira Eterna:** O fogo que começou como "escapar da escuridão" 
  agora é "memória que não apaga". Transição de sobrevivência para compreensão.
  
- **Arquivo → Biblioteca da Verdade:** Deixamos de apenas "registrar" para 
  "mapear a estrutura da realidade". Codex muda de ferramenta para arma de conhecimento.

- **NOVO: Retrato da Torre:** Descoberta de que a Torre pode ser "capturada" — 
  não fisicamente, mas em essência. Premonições e ecos se tornam visíveis.

### T3-T5: (A ser desenvolvido)
...
```

---

## 🔑 Chave de Modularidade

**Quando adicionar T3:**
1. Preencher `nome[3]`, `nome[4]`, `nome[5]` com placeholders
2. Criar `lore-content.ts` → `EDIFICIOS_T3_LORE`
3. Implementar `efeitos[5]` e `efeitos[6]` apenas
4. **Resto do código não quebra** — acessa via chave, ignora o que não existe

**Exemplo:** Se código tenta acessar L8 mas estamos em T2:
```typescript
if (nivel > maxNivelPorTemporada[temporadaAtual]) {
  return (efeitos[maxNivelPorTemporada[temporadaAtual]] || efeitos[1]);
}
```

---

**PR associada:** #8 (T2 implementation — nomes + Retrato da Torre)
