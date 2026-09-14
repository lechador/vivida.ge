import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Short-lived distributed claims for expensive AI/PDF work. Unlike an
 * in-memory mutex this coordinates every Vercel instance; expiry lets another
 * invocation recover a job if the original worker is terminated.
 */
export const generationLocks = pgTable(
  "generation_lock",
  {
    key: text("key").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("generation_lock_expires_idx").on(t.expiresAt)],
);
