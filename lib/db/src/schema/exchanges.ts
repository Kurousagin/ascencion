import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { playersTable } from "./players";

// Conteúdo de um envio de recursos (já com a taxa da torre descontada — o que a
// destinatária efetivamente recebe ao aceitar).
export interface ConteudoRecursos {
  comida: number;
  madeira: number;
  pedra: number;
  ferro: number;
}

// Caixa de trocas: itens enviados de uma jogadora para a aliada, aguardando
// serem recebidos (status pendente -> recebido).
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
  conteudo: jsonb("conteudo").$type<ConteudoRecursos>().notNull(),
  status: text("status").notNull().default("pendente"), // 'pendente' | 'recebido'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  receivedAt: timestamp("received_at", { withTimezone: true }),
});

export type Exchange = typeof exchangesTable.$inferSelect;
export type InsertExchange = typeof exchangesTable.$inferInsert;
