import { relations } from "drizzle-orm";
import { libraryEntries } from "./archive";
import { payments } from "./credits";
import { dailyHoroscopes } from "./email";
import { charts, profiles } from "./profiles";
import { accounts, sessions, users } from "./users";

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  chart: one(charts, {
    fields: [users.id],
    references: [charts.userId],
  }),
  accounts: many(accounts),
  sessions: many(sessions),
  payments: many(payments),
  dailyHoroscopes: many(dailyHoroscopes),
  libraryEntries: many(libraryEntries),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const chartsRelations = relations(charts, ({ one }) => ({
  user: one(users, {
    fields: [charts.userId],
    references: [users.id],
  }),
}));
