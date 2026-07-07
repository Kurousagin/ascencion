# 🧪 Modo de Teste — Test Mode Guide

O **Test Mode** permite carregar cidadelas pré-populadas para testes de features durante desenvolvimento e QA, sem precisar jogar até um andar específico.

## Como usar

1. Na **TitleScreen** (tela inicial), clique no botão **TESTE** (canto inferior direito)
2. Uma janela será aberta pedindo um **código de teste**
3. Insira um dos códigos abaixo
4. Clique em **CARREGAR**

## Códigos disponíveis

### `TEST123` — Cidadela Básica
- **Andar:** 5 conquistado
- **Recursos:** 200 comida, 150 madeira, 120 pedra, 100 ferro
- **NPCs:** 4 (mistos de raridade)
- **Edifícios:** Fogueira L1, Fazenda L2, Enfermaria L1, Arquivo L1
- **Uso:** Testar câmaras secretas, exploração, expansão básica

### `FULL` — Cidadela Completa
- **Andar:** 20 conquistado (final de T1)
- **Recursos:** 1000 comida, 800 madeira, 600 pedra, 400 ferro
- **NPCs:** 6 épicos/raros
- **Edifícios:** Todos os 9 edifícios em L3 (máximo nível)
- **Codex:** Todos os fragmentos de T1 desbloqueados
- **Relíquias:** 5 coletadas
- **Uso:** Testar Codex T1, câmaras L20, Arquivo↔Sussurro, relíquias

### `T2` — Cidadela Temporada II
- **Andar:** 30 conquistado (T2 avançado)
- **Recursos:** 2000 comida, 1600 madeira, 1200 pedra, 800 ferro
- **NPCs:** 6 épicos
- **Edifícios:** Todos os 9 edifícios em L3
- **Codex:** Fragmentos T1 + T2 (capítulos 5-7)
- **Relíquias:** 7 incluindo novos de T2
- **Uso:** Testar Codex T2, câmaras de andares 21-30, progressão T1→T2

---

## Features de teste cobertas

### 🔴 **Bug #1 — Câmaras Secretas lookup**
- **Use:** `TEST123` ou `FULL`
- **Teste:** Clica em um andar (não-boss, como 1-4) → deve ver "VASCULHAR OS DESTROÇOS"
- **Validação:** Câmara pode ser descoberta repetindo tentativas

### 🔴 **Bug #2 — Codex Temporada II invisível**
- **Use:** `T2`
- **Teste:** Abre Codex → Temporada II → deve ver abas "Memória Bruta", "O Intervalo", "Eco de Origem", "O Pré-Andar" (capítulos 5-8)
- **Validação:** Todos os capítulos de T2 aparecem e mostram fragmentos

### 🔴 **Bug #3 — Câmaras gate (isBossFloor)**
- **Use:** `TEST123` em andares 1-5
- **Teste:** Andares não-boss (1,2,3,4) também têm botão de câmara
- **Validação:** Antes só andares 5, 10, 15, 20 mostravam o botão

### 💡 **Melhoria #1 — Escalonamento de câmaras**
- **Use:** `FULL`
- **Teste:** Compara número de tentativas até achar câmara no Andar 1 vs Andar 20
- **Validação:** Andar 20 deve levar ~2x mais tentativas que Andar 1

### 💡 **Melhoria #2 — Relíquias no Codex**
- **Use:** `FULL` ou `T2`
- **Teste:** Abre Codex → clica em aba **RELÍQUIAS**
- **Validação:** Mostra lista com nome, descrição e origem de cada relíquia coletada

### 💡 **Melhoria #3 — Sussurros marcados "RARO"**
- **Use:** `FULL`
- **Teste:** Abre Codex Fragmentos → procura Sussurros (tipo "Sus...")
- **Validação:** Vê badge "✦ RARO" diferenciando Sussurros de Habitantes

### 💡 **Melhoria #4 — Arquivo ↔ Sussurro mechanic**
- **Use:** `FULL` (tem Arquivo L1)
- **Teste:** Faz 20 expedições, conta Sussurros descobertos; upgrade Arquivo para L3; repete expedições
- **Validação:** Com Arquivo L3, chance de Sussurro aumenta notavelmente

### 💡 **Melhoria #5 — L3 em Arquivo/Mirante**
- **Use:** `FULL`
- **Teste:** Vai a Edifícios → clica em Arquivo L2 → vê opção de L3
- **Validação:** Arquivo L3: +42% poder, +24% Sussurro; Mirante L3: +35 fadiga, +3 moral

---

## Adicionando novos códigos de teste

Para adicionar um novo código de teste:

1. Abra `src/lib/test-saves.ts`
2. Adicione entrada em `TEST_CODES`:
   ```ts
   export const TEST_CODES = {
     'TEST123': 'cidadela-teste-basica',
     'NOVO_CODIGO': 'cidadela-novo-teste',  // ← adicione aqui
   } as const;
   ```
3. Crie função `createTestSaveNovo()` que retorna `GameState`
4. Adicione case em `getTestSave()`
5. Adicione documentação aqui em `TEST_MODE_README.md`

---

## Debug útil

Se o teste carregar mas parecer vazio/quebrado:

1. Abra console (F12) → **Application** → **LocalStorage**
2. Procure por `torre_obscura_save`
3. Verifique que o JSON tem `dia`, `andarAtual`, `npcs`, `recursos`, etc.
4. Se corrompido, delete e recarregue a página (novo click em TESTE)

---

**Última atualização:** 2026-07-07 · Mantido por: Kurousagin
