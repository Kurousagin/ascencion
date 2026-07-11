// ─── RELATOS DE EXPEDIÇÃO — vozes do grupo no Mural ──────────────────────────
// Transforma o resultado numérico de uma expedição em uma frase assinada por um
// sobrevivente do grupo. Raridade controlada pelo chamador (anti-spam do Mural).
// Textos em RELATOS_LORE (lore-content.ts).

import { RELATOS_LORE } from './lore-content';

export type RelatoResultado = 'vitoria' | 'falha' | 'farm';

export function gerarRelato(
  bioma: string,
  resultado: RelatoResultado,
  sobreviventes: string[],
  andarNome: string,
): string | null {
  const pool = RELATOS_LORE[bioma]?.[resultado];
  if (!pool || pool.length === 0 || sobreviventes.length === 0) return null;
  const template = pool[Math.floor(Math.random() * pool.length)];
  const nome = sobreviventes[Math.floor(Math.random() * sobreviventes.length)];
  return template.replaceAll('{nome}', nome).replaceAll('{andar}', andarNome);
}
