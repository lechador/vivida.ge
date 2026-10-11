import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Platform crypto purchases (English site): credit packs and PRO passes paid
 * in USDC on Solana.
 *
 * Two payment methods share this table:
 * - `wallet`: the buyer pays from their own wallet (Privy embedded wallet or
 *   any external wallet) DIRECTLY to the platform wallet snapshotted on the
 *   row. The server finds the transfer by this row's `reference` account.
 * - `fiat`: the buyer pays by card/Apple Pay/Google Pay in Privy's fund
 *   modal, with `destination.wallet` set to the platform wallet — USDC lands
 *   in OUR wallet and the buyer never touches crypto. The fund modal returns
 *   no transaction proof, so the server matches the transfer by time window
 *   (blockTime at/after purchase creation) plus a tolerance-floored amount,
 *   first-unmatched-wins.
 *
 * The app never sends transactions and never sees private keys. Grants are
 * idempotent (unique tx signature) so redelivered polls can never
 * double-credit.
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
    /** 'wallet' | 'fiat' — wallet pays from the buyer's wallet (reference-matched); fiat pays by card straight to our wallet (window-matched). */
    method: text("method").notNull().default("wallet"),
    /**
     * Set when the buyer's fiat fund flow reaches submitted/confirmed — the
     * moment the server starts window-scanning for the incoming transfer.
     * Null on wallet-method purchases (their reference scan runs from creation).
     */
    fiatConfirmedAt: timestamp("fiat_confirmed_at", { withTimezone: true }),
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
