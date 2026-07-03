import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { playersTable } from "./players";

// Vínculo de aliança (v0: no máximo uma aliada por jogadora).
// Armazenamos uma linha por direção; `playerId` é único, então cada jogadora
// só pode estar em uma aliança por vez. O pareamento cria as duas direções.
export const alliancesTable = pgTable("alliances", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id")
    .notNull()
    .unique()
    .references(() => playersTable.id),
  allyId: integer("ally_id")
    .notNull()
    .references(() => playersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Alliance = typeof alliancesTable.$inferSelect;
export type InsertAlliance = typeof alliancesTable.$inferInsert;
