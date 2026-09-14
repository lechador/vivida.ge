import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import type { PremiumSource } from "./experiments";
import { users } from "./users";

/**
 * Credit wallet — one row per user, atomically updated. Balance is authoritative
 * and always kept in sync with the ledger (credit_transaction). We spend with a
 * single conditional UPDATE (`balance >= cost`) so two concurrent requests can
 * never overspend.
 */
export const creditAccounts = pgTable("credit_account", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Append-only credit ledger — every grant (+) and spend (−) with a reason, for
 * audit + the account history. `ref` links to the source (referral's invited
 * user id, stripe session id, the synastry/partner id spent on, …).
 */
export const creditTransactions = pgTable(
  "credit_transaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Signed: positive = earned/bought, negative = spent. */
    amount: integer("amount").notNull(),
    /** e.g. 'signup_bonus' | 'referral' | 'purchase' | 'spend_synastry' |
     *  'spend_chat' | 'grandfather' | 'admin_grant'. */
    reason: text("reason").notNull(),
    ref: text("ref"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("credit_tx_user_created_idx").on(t.userId, t.createdAt),
    index("credit_tx_user_reason_ref_idx").on(t.userId, t.reason, t.ref),
  ],
);

/**
 * Referrals — one row per invited user (unique), so a person can be referred by
 * at most one referrer. `status` goes pending → qualified when the invited user
 * verifies email AND completes birth data (the anti-fraud gate: a dead/duplicate
 * signup never qualifies, and only a qualified referral pays out, once).
 */
export const referrals = pgTable(
  "referral",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    referrerId: text("referrer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Unique: the invited user can only ever be attributed to one referrer. */
    invitedUserId: text("invited_user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"), // 'pending' | 'qualified'
    creditedAt: timestamp("credited_at", { withTimezone: true }),
    qualifiedAt: timestamp("qualified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("referral_referrer_idx").on(t.referrerId)],
);

export type CreditAccount = typeof creditAccounts.$inferSelect;

export type CreditTransaction = typeof creditTransactions.$inferSelect;

export type Referral = typeof referrals.$inferSelect;

export const premiumSubscriptions = pgTable(
  "premium_subscription",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    planKey: text("plan_key").notNull(),
    countryCode: text("country_code").notNull(),
    source: text("source").$type<PremiumSource>().notNull().default("stripe"),
    /** Stripe-only. Null on a store purchase. */
    stripeSubscriptionId: text("stripe_subscription_id").unique(),
    /** Stripe-only. Null on a store purchase. */
    stripePriceId: text("stripe_price_id"),
    /**
     * RevenueCat-only. The *original* transaction id, which is stable across
     * renewals — the per-renewal id is not, and keying on it would create a
     * new row every month.
     */
    rcOriginalTransactionId: text("rc_original_transaction_id").unique(),
    /** RevenueCat-only: the store product id, e.g. `ge.vivida.pro.monthly`. */
    rcProductId: text("rc_product_id"),
    /** RevenueCat-only: "APP_STORE" | "PLAY_STORE" — decides where we send the
     *  user to cancel, since we cannot cancel a store subscription ourselves. */
    rcStore: text("rc_store"),
    status: text("status").notNull(),
    currency: text("currency").notNull(),
    amountMinor: integer("amount_minor").notNull(),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
    }).notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("premium_subscription_status_idx").on(t.status)],
);

export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;

// Retained for the historical Flitt payment audit log below. New purchases use
// Stripe Checkout and the credit ledger.
export const billingIntervalEnum = pgEnum("billing_interval", [
  "month",
  "year",
]);

/**
 * Audit log of every payment we observe (success, fail, pending). Used for
 * receipts, support, and reconciliation against Flitt's reporting.
 */
export const payments = pgTable("payment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  flittOrderId: text("flitt_order_id").notNull().unique(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull(),
  /** 'month' | 'year' — persisted at checkout so the webhook doesn't have to
   *  guess from amount. Nullable for legacy rows that pre-date this column. */
  interval: billingIntervalEnum("interval"),
  status: text("status").notNull(), // 'approved' | 'declined' | 'pending' | …
  description: text("description"),
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Payment = typeof payments.$inferSelect;

export type NewPayment = typeof payments.$inferInsert;

export type BillingInterval = (typeof billingIntervalEnum.enumValues)[number];
