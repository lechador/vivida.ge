import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Vivida Insight Bazaar — English-only marketplace for one-off astrology
 * readings (tarot, birth-chart interpretations, compatibility sessions).
 *
 * Money flow (MVP, no escrow): the buyer pays USDC on Solana mainnet
 * DIRECTLY to the provider's wallet from their own wallet app. The app never
 * sends transactions and never sees private keys — it only verifies the
 * submitted transaction signature against a public RPC. Birth details and
 * delivered readings live only in these tables (off-chain), never on-chain.
 */

export const bazaarProviders = pgTable(
  "bazaar_provider",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /** Owner account. One provider profile per user. */
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    headline: text("headline").notNull(),
    bio: text("bio").notNull(),
    /** e.g. ["tarot", "natal", "compatibility"]. Free-form, validated in code. */
    specialties: text("specialties").notNull().default(""),
    /** Solana mainnet address receiving the buyer's USDC. */
    solanaWallet: text("solana_wallet").notNull(),
    /** pending → admin review; approved → publicly listed; suspended → hidden. */
    status: text("status").notNull().default("pending"),
    /** Denormalized from bazaar_review for fast listing (average × 100). */
    avgRating100: integer("avg_rating_100"),
    reviewCount: integer("review_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("bazaar_provider_status_idx").on(t.status)],
);

export type BazaarProvider = typeof bazaarProviders.$inferSelect;

export const bazaarServices = pgTable(
  "bazaar_service",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    providerId: text("provider_id")
      .notNull()
      .references(() => bazaarProviders.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    /** tarot | natal | compatibility | other */
    category: text("category").notNull().default("other"),
    /** Integer USDC cents (999 = $9.99). USDC has 6 decimals; MVP caps at 2. */
    priceUsdcCents: integer("price_usdc_cents").notNull(),
    /** Human promise, e.g. "Delivered within 24 hours". */
    deliveryPromise: text("delivery_promise").notNull().default(""),
    /** active → bookable; paused → hidden from listings, keeps history. */
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("bazaar_service_provider_idx").on(t.providerId),
    index("bazaar_service_status_idx").on(t.status),
  ],
);

export type BazaarService = typeof bazaarServices.$inferSelect;

export const bazaarBookings = pgTable(
  "bazaar_booking",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    serviceId: text("service_id")
      .notNull()
      .references(() => bazaarServices.id, { onDelete: "restrict" }),
    providerId: text("provider_id")
      .notNull()
      .references(() => bazaarProviders.id, { onDelete: "restrict" }),
    buyerUserId: text("buyer_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /**
     * pending_payment → paid → delivered (+ cancelled from either side
     * before delivery). Escrow arrives later; until then "paid" means the
     * provider already holds the USDC.
     */
    status: text("status").notNull().default("pending_payment"),
    /** Price snapshot (cents) — service price edits never rewrite history. */
    priceUsdcCents: integer("price_usdc_cents").notNull(),
    /** Provider wallet snapshot — wallet edits never rewrite history. */
    providerWallet: text("provider_wallet").notNull(),
    /**
     * Buyer's question + birth details. PRIVATE: rendered only to the buyer
     * and the provider, never on-chain, never in any public response.
     */
    buyerNote: text("buyer_note").notNull().default(""),
    /** Provider's delivered reading. PRIVATE: buyer + provider only. */
    deliveryText: text("delivery_text"),
    /** Buyer's Solana address (optional, echoed back for their records). */
    payerWallet: text("payer_wallet"),
    /** Verified mainnet signature. Unique = each payment funds one booking. */
    txSignature: text("tx_signature").unique(),
    txVerifiedAt: timestamp("tx_verified_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("bazaar_booking_buyer_idx").on(t.buyerUserId),
    index("bazaar_booking_provider_idx").on(t.providerId),
    index("bazaar_booking_service_idx").on(t.serviceId),
  ],
);

export type BazaarBooking = typeof bazaarBookings.$inferSelect;

export const bazaarReviews = pgTable(
  "bazaar_review",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /** One review per delivered booking. */
    bookingId: text("booking_id")
      .notNull()
      .unique()
      .references(() => bazaarBookings.id, { onDelete: "cascade" }),
    serviceId: text("service_id")
      .notNull()
      .references(() => bazaarServices.id, { onDelete: "cascade" }),
    providerId: text("provider_id")
      .notNull()
      .references(() => bazaarProviders.id, { onDelete: "cascade" }),
    buyerUserId: text("buyer_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("bazaar_review_provider_idx").on(t.providerId),
    index("bazaar_review_service_idx").on(t.serviceId),
    uniqueIndex("bazaar_review_booking_unique").on(t.bookingId),
  ],
);

export type BazaarReview = typeof bazaarReviews.$inferSelect;

/**
 * Panel-owned payment verification log. One row per verify attempt
 * (success or failure) so stuck buyers and RPC outages are visible in the
 * admin Bazaar → Payments tab instead of silent. No PII beyond the booking
 * link and an 8-char signature prefix.
 */
export const bazaarPaymentAttempts = pgTable(
  "bazaar_payment_attempt",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bazaarBookings.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    sigPrefix: text("sig_prefix"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("bazaar_payment_attempt_booking_idx").on(t.bookingId)],
);

export type BazaarPaymentAttempt = typeof bazaarPaymentAttempts.$inferSelect;
