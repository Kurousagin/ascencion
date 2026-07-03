import { integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Resumo (snapshot) da cidadela de uma jogadora, sincronizado periodicamente.
// A simulação continua 100% no cliente; isto é apenas um retrato para a aliada ver.
export interface ResumoCidadela {
  dia: number;
  populacao: number;
  andarAtual: number;
  profissoes: {
    combatente: number;
    batedor: number;
    erudito: number;
    sentinela: number;
  };
}

export const playersTable = pgTable("players", {
  id: serial("id").primaryKey(),
  // Identidade anônima atrelada ao dispositivo (localStorage no cliente).
  deviceId: text("device_id").notNull().unique(),
  nome: text("nome").notNull(),
  // Código curto e compartilhável usado para parear alianças.
  codigoAlianca: text("codigo_alianca").notNull().unique(),
  // Último resumo sincronizado da cidadela (null até a primeira sincronização).
  resumo: jsonb("resumo").$type<ResumoCidadela>(),
  // Controle do limite diário de envio de recursos (reinicia a cada dia de calendário).
  enviadoHoje: integer("enviado_hoje").notNull().default(0),
  dataEnvio: text("data_envio"), // YYYY-MM-DD do último envio contabilizado
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Player = typeof playersTable.$inferSelect;
export type InsertPlayer = typeof playersTable.$inferInsert;
