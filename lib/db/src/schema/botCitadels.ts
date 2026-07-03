import { integer, jsonb, pgTable, serial, text } from "drizzle-orm/pg-core";

// Cidadelas-bot: alvos de guerra semeados no servidor. NÃO são jogadoras reais —
// não entram em pareamento, alianças ou trocas. São apenas snapshots ricos o
// suficiente para a guerra ser simulada no cliente (poder de exército, suprimento
// e um estoque de recursos que vira espólio na vitória).
export interface BotProfissoes {
  combatente: number;
  batedor: number;
  erudito: number;
  sentinela: number;
}

export interface BotRecursos {
  comida: number;
  madeira: number;
  pedra: number;
  ferro: number;
}

export type BotPostura = "agressiva" | "defensiva" | "equilibrada";

export const botCitadelsTable = pgTable("bot_citadels", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nome: text("nome").notNull(),
  dia: integer("dia").notNull(),
  andar: integer("andar").notNull(),
  populacao: integer("populacao").notNull(),
  profissoes: jsonb("profissoes").$type<BotProfissoes>().notNull(),
  // Poder de combate do exército da cidadela (comparável ao poder de um grupo).
  poderBase: integer("poder_base").notNull(),
  // Reserva de suprimento: sustenta o exército; ao esgotar, o poder do bot cai.
  suprimento: integer("suprimento").notNull(),
  // Estoque de recursos — vira espólio (saque) quando a jogadora vence.
  recursos: jsonb("recursos").$type<BotRecursos>().notNull(),
  postura: text("postura").$type<BotPostura>().notNull(),
});

export type BotCitadel = typeof botCitadelsTable.$inferSelect;
export type InsertBotCitadel = typeof botCitadelsTable.$inferInsert;
