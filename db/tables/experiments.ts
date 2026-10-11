import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Durable per-user experiment assignments. Assignment happens once and never
 * changes on later requests, so product outcomes can be joined back to the
 * exact cohort without relying on browser cookies or analytics identifiers.
 */
export const experimentAssignments = pgTable(
  "experiment_assignment",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    experiment: text("experiment").notNull(),
    variant: text("variant").notNull(),
    eligibility: text("eligibility").notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    /** First product surface that reported the assignment to analytics. */
    exposedAt: timestamp("exposed_at", { withTimezone: true }),
    /** Experiment-specific completion, e.g. the staged return grant landing. */
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.experiment] }),
    index("experiment_assignment_cohort_idx").on(
      t.experiment,
      t.variant,
      t.assignedAt,
    ),
  ],
);

export type ExperimentAssignment = typeof experimentAssignments.$inferSelect;

/**
 * Append-only experiment observations. Assignments answer “which cohort?”,
 * while these rows answer “where was it seen?” and “what happened next?”.
 * `eventKey` makes retries idempotent without collapsing distinct sessions.
 */
export const experimentEvents = pgTable(
  "experiment_event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    experiment: text("experiment").notNull(),
    variant: text("variant").notNull(),
    /** exposure | outcome */
    eventType: text("event_type").notNull(),
    eventName: text("event_name").notNull(),
    surface: text("surface").notNull(),
    eventKey: text("event_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("experiment_event_dedupe_idx").on(
      t.userId,
      t.experiment,
      t.eventType,
      t.eventName,
      t.eventKey,
    ),
    index("experiment_event_analysis_idx").on(
      t.experiment,
      t.variant,
      t.eventType,
      t.createdAt,
    ),
  ],
);

export type ExperimentEvent = typeof experimentEvents.$inferSelect;

/**
 * Stripe-backed Premium entitlement. One current subscription per user keeps
 * the app-side access check cheap while Stripe remains the billing authority.
 */
/**
 * Who is billing this subscription. Stripe is the website's processor; the
 * store builds cannot use it (Apple 3.1.1 / Play Billing), so an app purchase
 * arrives through RevenueCat instead. The English site's crypto rail sells
 * one-time PRO passes — source "crypto", never auto-renewing. One user still
 * has at most one PRO row — `source` says which processor owns it, and a
 * webhook may only deactivate a row whose source matches, so neither can
 * cancel the other's subscription.
 */
export type PremiumSource = "stripe" | "revenuecat" | "crypto";
