import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const pushSubscriptionsTable = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull().unique(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  authKey: text("auth_key").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true }),
  nextEventAt: timestamp("next_event_at", { withTimezone: true }),
  nextEventText: text("next_event_text"),
  lastNotifiedEventAt: timestamp("last_notified_event_at", {
    withTimezone: true,
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type PushSubscription = typeof pushSubscriptionsTable.$inferSelect;
export type InsertPushSubscription =
  typeof pushSubscriptionsTable.$inferInsert;
