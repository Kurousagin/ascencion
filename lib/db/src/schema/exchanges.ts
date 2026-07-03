import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { playersTable } from "./players";

// ─── Tipos de conteúdo para cada tipo de troca ────────────────────────────────

// Tipo "recursos": envio de comida/madeira/pedra/ferro (já com taxa descontada).
export interface ConteudoRecursos {
  comida: number;
  madeira: number;
  pedra: number;
  ferro: number;
}

// Tipo "morador": envio de um NPC em empréstimo da remetente para a destinatária.
// `npc` é o NPC serializado do game-data (opaco ao servidor).
export interface ConteudoMorador {
  npc: unknown;
  diasEmprestimo: number;
  donoDeviceId: string; // deviceId da dono original (remetente)
}

// Tipo "retorno_morador": NPC sendo devolvido pela destinatária à dono original.
export interface ConteudoRetornoMorador {
  npc: unknown;
  morreu: boolean; // true se o NPC faleceu durante o empréstimo
  donoDeviceId: string;
}

export type ConteudoExchange =
  | ConteudoRecursos
  | ConteudoMorador
  | ConteudoRetornoMorador;

// ─── Tabela de trocas ─────────────────────────────────────────────────────────
// Caixa de trocas: itens enviados de uma jogadora para a aliada, aguardando
// serem recebidos (status pendente -> recebido).
// Tipos: "recursos" | "morador" | "retorno_morador"
export const exchangesTable = pgTable("exchanges", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull().default("recursos"),
  fromPlayerId: integer("from_player_id")
    .notNull()
    .references(() => playersTable.id),
  toPlayerId: integer("to_player_id")
    .notNull()
    .references(() => playersTable.id),
  // Nome do remetente denormalizado para exibição na caixa de entrada.
  remetenteNome: text("remetente_nome").notNull(),
  conteudo: jsonb("conteudo").$type<ConteudoExchange>().notNull(),
  status: text("status").notNull().default("pendente"), // 'pendente' | 'recebido'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  receivedAt: timestamp("received_at", { withTimezone: true }),
});

export type Exchange = typeof exchangesTable.$inferSelect;
export type InsertExchange = typeof exchangesTable.$inferInsert;
