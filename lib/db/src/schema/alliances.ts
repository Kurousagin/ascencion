import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { playersTable } from "./players";

// Vínculo de aliança. Uma jogadora pode ter várias aliadas simultâneas
// (o teto é aplicado na camada de rotas). Armazenamos uma linha por direção;
// o pareamento cria as duas direções. O par (playerId, allyId) é único para
// impedir vínculos duplicados; desfazer a aliança remove ambas as direções.
export const alliancesTable = pgTable(
  "alliances",
  {
    id: serial("id").primaryKey(),
    playerId: integer("player_id")
      .notNull()
      .references(() => playersTable.id),
    allyId: integer("ally_id")
      .notNull()
      .references(() => playersTable.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    parUnico: unique("alliances_player_ally_unq").on(t.playerId, t.allyId),
  }),
);

export type Alliance = typeof alliancesTable.$inferSelect;
export type InsertAlliance = typeof alliancesTable.$inferInsert;
