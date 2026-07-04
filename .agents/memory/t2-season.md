---
name: Temporada 2 — O Intervalo
description: Tudo implementado para T2: andares 21-40, habitants, codex, pioneer system, Thael gacha, novos edifícios.
---

## O que foi implementado

**game-data.ts:**
- TEMPORADAS[2]: andares [21, 40], corTema '#7EB8E0'
- BIOMA_POR_ANDAR estendido para 40 andares (T2 usa fortaleza/abismo pesados)
- CAPITULO_NOMES 5–8: 'Memória Bruta', 'O Intervalo', 'Eco de Origem', 'O Pré-Andar'
- tierNames estendido para tiers 5–8
- FLOOR_NOMES, FLOOR_DESCRICOES, BASE_DIFICULDADE para andares 21–40
- FLOOR_BOSS para andares 25, 30, 35, 40
- BOSS_ECO_LORE para andares 25, 30, 35, 40
- 16 novos HABITANTES (floors 21–24, 26–29, 31–34, 36–39)
- CODEX_FRAGMENTOS T2: hab_21–39, eco_5–8, sus_v_0–sus_viii_4, verdade_t2, pioneers_fragment
- SUSSURROS_POR_CAPITULO capítulos 5–8
- EdificioTipo estendido: 'Arquivo' e 'Mirante' (edifícios simples T2)
- BUILDINGS, POSTO_AFIM, getEfeitos atualizados para Arquivo/Mirante

**lancamento.ts:**
- LANCAMENTO_T2 exportado: Thael (primordial, chanceValdris 0.04) + 6 Marcados de T2

**GameContext.tsx:**
- vitoria movida do andar 20 para o andar 40 (>40)
- pioneers_fragment desbloqueado junto com verdade_t1 (todos 16 T1 concluídos)
- verdade_t2 desbloqueado quando todos 16 T2 habitants concluídos

**Pioneer system (backend + frontend):**
- lib/db/src/schema/milestones.ts: tabela milestones (deviceId, tipo, nome) com unique(deviceId, tipo)
- DB push executado — tabela criada
- artifacts/api-server/src/routes/pioneer.ts: POST /pioneer (idempotente) + GET /pioneer/:tipo
- Position calculada por deviceId (não por nome) para evitar colisão
- LS_PIONEER só gravado após POST com sucesso (não antes)
- posicao (top10) persistida em LS_POSICAO para recuperação após reload
- artifacts/torre-obscura/src/hooks/usePioneer.ts: polling 30s + visibilitychange
- artifacts/torre-obscura/src/components/PioneerBanner.tsx: PioneerPessoal + T2GlobalBanner
- App.tsx: banners integrados, condições corretas

## Regras importantes
- T2 desbloqueia quando 10 players atingem andar 20 (PIONEER_THRESHOLD=10)
- pioneers_fragment: rumor dos 100 andares — só aparece com T1 completo, NUNCA confirma, apenas rumora
- Edifícios Arquivo e Mirante disponíveis a partir de T2 (sem gate hardcoded — player constrói quando tiver recursos)
- LANCAMENTO_T2 está exportado mas NÃO está conectado ao gacha flow ainda (LANCAMENTO_ATIVO ainda aponta para T1); conectar quando T2 lançar oficialmente
