import { pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

// Rastreia qual jogador (deviceId) reivindicou cada primordial por temporada.
// A constraint unique em `tipo` garante que apenas UM jogador global pode ter
// cada primordial. Tentativas adicionais de INSERT geram violação 23505.
export const primordialClaimsTable = pgTable(
  "primordial_claims",
  {
    id: serial("id").primaryKey(),
    deviceId: text("device_id").notNull(),
    // Ex: 'primordial_t1', 'primordial_t2'
    tipo: text("tipo").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("primordial_claims_tipo_unique").on(t.tipo)],
);

export type PrimordialClaim = typeof primordialClaimsTable.$inferSelect;
export type InsertPrimordialClaim = typeof primordialClaimsTable.$inferInsert;
