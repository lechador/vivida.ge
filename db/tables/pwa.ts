import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Anonymous installed-web-app instance, recorded only after analytics consent.
 * An instance is a browser storage profile, not necessarily one human/device. */
export const pwaInstallations = pgTable(
  "pwa_installation",
  {
    id: text("id").primaryKey(),
    platform: text("platform").notNull(),
    firstOpenedAt: timestamp("first_opened_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastOpenedAt: timestamp("last_opened_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("pwa_installation_last_opened_idx").on(t.lastOpenedAt)],
);
