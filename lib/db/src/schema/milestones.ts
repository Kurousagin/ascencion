import { pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

// Marcos de progressão dos jogadores — usado para rastrear pioneers globalmente.
// Um registro por (deviceId, tipo) — idempotente via constraint UNIQUE.
export const milestonesTable = pgTable(
  "milestones",
  {
    id: serial("id").primaryKey(),
    deviceId: text("device_id").notNull(),
    nome: text("nome").notNull().default("Desconhecido"),
    // Tipo do marco: ex. 'andar_20' = chegou ao andar 20
    tipo: text("tipo").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("milestones_device_tipo_unique").on(t.deviceId, t.tipo)],
);

export type Milestone = typeof milestonesTable.$inferSelect;
export type InsertMilestone = typeof milestonesTable.$inferInsert;
