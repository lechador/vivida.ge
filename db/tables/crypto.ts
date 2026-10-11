import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Platform crypto purchases (English site): credit packs and PRO passes paid
 * in USDC on Solana.
 *
 * The buyer pays from their own wallet (Privy embedded wallet or any
 * external wallet) DIRECTLY to the platform wallet snapshotted on the row —
 * the app never sends transactions and never sees private keys. The server
 * verifies the submitted transaction signature against a public RPC: a
 * finalized USDC credit to `recipientWallet` for at least `amountUsdcCents`
 * carrying this row's `reference` account. One payment funds one purchase
 * (unique `txSignature`), and grants are idempotent so redelivered polls can
 * never double-credit.
 */
export const cryptoPurchases = pgTable(
  "crypto_purchase",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** 'credits' | 'premium_pass' */
    kind: text("kind").notNull(),
    /** Credit pack id ('s' | 'm' | 'l'); null on passes. */
    packId: text("pack_id"),
    /** Credits granted (credits kind); null on passes. */
    credits: integer("credits"),
    /** PRO days granted (premium_pass kind); null on credits. */
    days: integer("days"),
    /** Price snapshot in USDC cents — catalogue edits never rewrite history. */
    amountUsdcCents: integer("amount_usdc_cents").notNull(),
    /** Receiving wallet snapshot (env SOLANA_WALLET) — env edits never rewrite history. */
    recipientWallet: text("recipient_wallet").notNull(),
    /**
     * Per-purchase reference key: carried in the Solana Pay URL and the
     * transaction, so the server can auto-detect the payment via
     * getSignaturesForAddress without the buyer pasting anything.
     */
    reference: text("reference").notNull().unique(),
    /** pending → confirmed (or expired). */
    status: text("status").notNull().default("pending"),
    /** Verified mainnet signature. Unique = each payment funds one purchase. */
    txSignature: text("tx_signature").unique(),
    /** First signer of the verified transaction (their wallet). */
    payerWallet: text("payer_wallet"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    /**
     * When the grant (credits / pass) was applied. The conditional
     * NULL → now() update elects a single grant runner; a confirmed row
     * with grantedAt still NULL is re-granted by the next status poll.
     */
    grantedAt: timestamp("granted_at", { withTimezone: true }),
    /** Checkout stops offering payment after this; verification still accepts. */
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    /** Analytics context ('credits_hub', 'header_menu', …). */
    product: text("product"),
    /** Validated in-app path to return to after a confirmed purchase. */
    returnTo: text("return_to"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("crypto_purchase_user_idx").on(t.userId),
    index("crypto_purchase_status_idx").on(t.status),
  ],
);

export type CryptoPurchase = typeof cryptoPurchases.$inferSelect;
