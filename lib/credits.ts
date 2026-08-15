import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { creditAccounts, creditTransactions, notifications } from "@/db/schema";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { isPremiumUser } from "@/lib/premium";

/**
 * Credit wallet — the currency that replaced the subscription model. Users earn
 * credits (signup bonus, qualified referrals, Stripe top-ups) and spend them on
 * gated actions beyond each feature's free allowance.
 *
 * The economy CONSTANTS live in lib/credits-config.ts (client-safe, no DB
 * imports) and are re-exported below so server code has one import site.
 * Spending is a single conditional UPDATE (`balance >= cost`), so concurrent
 * requests can never drive the balance negative.
 */

export * from "@/lib/credits-config";
import type { CreditReason } from "@/lib/credits-config";

// ── Notifications ────────────────────────────────────────────────────────────

/**
 * Drop a "credit" notification into the bell so the user sees every balance
 * move (earned or spent) with its reason. Best-effort — a notification failure
 * must never break the underlying credit operation. `amount` is signed.
 */
async function notifyCredit(
  userId: string,
  amount: number,
  reason: CreditReason,
  balance: number | null
): Promise<void> {
  try {
    await db.insert(notifications).values({
      userId,
      kind: "credit",
      payload: {
        creditAmount: amount,
        creditReason: reason,
        ...(balance != null ? { creditBalance: balance } : {}),
      },
    });
    invalidateHeaderForUser(userId);
  } catch (err) {
    console.warn(
      "[credits] notification failed:",
      err instanceof Error ? err.message : String(err)
    );
  }
}

// ── Account ──────────────────────────────────────────────────────────────────

export async function ensureCreditAccount(userId: string): Promise<void> {
  await db
    .insert(creditAccounts)
    .values({ userId, balance: 0 })
    .onConflictDoNothing({ target: creditAccounts.userId });
}

export async function getBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ balance: creditAccounts.balance })
    .from(creditAccounts)
    .where(eq(creditAccounts.userId, userId))
    .limit(1);
  return row?.balance ?? 0;
}

/**
 * Add credits (idempotency is the caller's job via a unique `ref` when needed —
 * e.g. one referral row, one stripe session). Upserts the account and appends a
 * ledger row.
 */
export async function grantCredits(
  userId: string,
  amount: number,
  reason: CreditReason,
  ref?: string,
  opts?: { notify?: boolean }
): Promise<void> {
  if (amount <= 0) return;
  const [acct] = await db
    .insert(creditAccounts)
    .values({ userId, balance: amount })
    .onConflictDoUpdate({
      target: creditAccounts.userId,
      set: {
        balance: sql`${creditAccounts.balance} + ${amount}`,
        updatedAt: new Date(),
      },
    })
    .returning({ balance: creditAccounts.balance });
  await db
    .insert(creditTransactions)
    .values({ userId, amount, reason, ref: ref ?? null });
  if (opts?.notify !== false) {
    await notifyCredit(userId, amount, reason, acct?.balance ?? null);
  }
}

/**
 * Atomically grant a ref-keyed reward once. The database advisory lock keeps
 * the account increment and ledger insert together under concurrent retries.
 */
export async function grantCreditsOnce(
  userId: string,
  amount: number,
  reason: CreditReason,
  ref: string,
  opts?: { notify?: boolean }
): Promise<boolean> {
  if (amount <= 0 || !ref) return false;
  const result = await db.execute<{
    was_granted: boolean;
    resulting_balance: number;
  }>(sql`
    SELECT * FROM vivida_grant_credits_once(
      ${userId},
      ${amount},
      ${reason},
      ${ref},
      ${crypto.randomUUID()}
    )
  `);
  const row = result.rows[0];
  if (row?.was_granted && opts?.notify !== false) {
    await notifyCredit(userId, amount, reason, row.resulting_balance);
  }
  return row?.was_granted ?? false;
}

/**
 * Try to spend `amount`. Atomic: the conditional UPDATE only succeeds if the
 * balance is sufficient, so it can never go negative under concurrency. Returns
 * true if charged (ledger appended), false if the balance was too low.
 */
export async function spendCredits(
  userId: string,
  amount: number,
  reason: CreditReason,
  ref?: string,
  opts?: { notify?: boolean }
): Promise<boolean> {
  if (amount <= 0) return true;
  if (await isPremiumUser(userId)) return true;
  const updated = await db
    .update(creditAccounts)
    .set({
      balance: sql`${creditAccounts.balance} - ${amount}`,
      updatedAt: new Date(),
    })
    .where(
      and(eq(creditAccounts.userId, userId), gte(creditAccounts.balance, amount))
    )
    .returning({ balance: creditAccounts.balance });
  if (updated.length === 0) return false;
  await db
    .insert(creditTransactions)
    .values({ userId, amount: -amount, reason, ref: ref ?? null });
  if (opts?.notify !== false) {
    await notifyCredit(userId, -amount, reason, updated[0]?.balance ?? null);
  }
  return true;
}

/**
 * Grant purchased credits, idempotent on the Stripe session id — Stripe can
 * deliver the same `checkout.session.completed` more than once, and we must
 * never double-credit money.
 */
export async function grantPurchaseCredits(
  userId: string,
  amount: number,
  sessionId: string
): Promise<void> {
  if (amount <= 0) return;
  const result = await db.execute<{
    was_granted: boolean;
    resulting_balance: number;
  }>(sql`
    SELECT * FROM vivida_grant_purchase_credits(
      ${userId},
      ${amount},
      ${sessionId},
      ${crypto.randomUUID()}
    )
  `);
  const row = result.rows[0];
  if (row?.was_granted) {
    await notifyCredit(userId, amount, "purchase", row.resulting_balance);
  }
}

/** Has the user already paid to unlock this specific thing (ledger ref match)? */
export async function isUnlocked(
  userId: string,
  ref: string,
  reason: CreditReason
): Promise<boolean> {
  if (reason.startsWith("spend_") && (await isPremiumUser(userId))) {
    return true;
  }
  const [row] = await db
    .select({ id: creditTransactions.id })
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.ref, ref),
        eq(creditTransactions.reason, reason)
      )
    )
    .limit(1);
  return !!row;
}

export type UnlockResult = "already" | "unlocked" | "insufficient";

/**
 * Pay once to unlock `ref` (a test result, etc.). Idempotent: re-opening an
 * already-unlocked item is free. Returns 'already' if previously unlocked,
 * 'unlocked' on a fresh successful charge, 'insufficient' if the balance is
 * too low.
 */
export async function spendOnce(
  userId: string,
  cost: number,
  reason: CreditReason,
  ref: string
): Promise<UnlockResult> {
  if (await isPremiumUser(userId)) return "already";
  const result = await db.execute<{
    result_status: UnlockResult;
    resulting_balance: number;
  }>(sql`
    SELECT * FROM vivida_spend_credits_once(
      ${userId},
      ${cost},
      ${reason},
      ${ref},
      ${crypto.randomUUID()}
    )
  `);
  const row = result.rows[0];
  if (!row) throw new Error("credit unlock returned no result");
  if (row.result_status === "unlocked" && cost > 0) {
    await notifyCredit(userId, -cost, reason, row.resulting_balance);
  }
  return row.result_status;
}

/**
 * Grant an activity reward, capped to `cap` per calendar day (feed posts).
 * Returns true if credited, false if the daily cap was already reached.
 */
export async function earnDailyCapped(
  userId: string,
  amount: number,
  reason: CreditReason,
  cap: number
): Promise<boolean> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.reason, reason),
        sql`${creditTransactions.createdAt} >= date_trunc('day', now())`
      )
    );
  if ((row?.n ?? 0) >= cap) return false;
  await grantCredits(userId, amount, reason);
  return true;
}

/** Grant a one-time reward (profile photo). No-op if already granted. */
export async function earnOnce(
  userId: string,
  amount: number,
  reason: CreditReason
): Promise<boolean> {
  const [row] = await db
    .select({ id: creditTransactions.id })
    .from(creditTransactions)
    .where(and(eq(creditTransactions.userId, userId), eq(creditTransactions.reason, reason)))
    .limit(1);
  if (row) return false;
  await grantCredits(userId, amount, reason);
  return true;
}

/**
 * Record a zero-cost use of a metered feature. grantCredits/spendCredits both
 * short-circuit on amount<=0 (no ledger row), so a free use has to be logged
 * explicitly for countUnlocks() to see it — that's how "first one free, then
 * charge" allowances get consumed. No balance change, no notification.
 */
export async function recordFreeUse(
  userId: string,
  reason: CreditReason,
  ref?: string
): Promise<void> {
  await db
    .insert(creditTransactions)
    .values({ userId, amount: 0, reason, ref: ref ?? null });
}

/**
 * How many distinct items the user has unlocked under `reason` (free + paid).
 * Used to apply a lifetime free allowance before charging — e.g. the first
 * synastry is free, then each subsequent one costs credits.
 */
export async function countUnlocks(
  userId: string,
  reason: CreditReason
): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.userId, userId),
        eq(creditTransactions.reason, reason)
      )
    );
  return row?.n ?? 0;
}

/** Recent ledger rows for the account/history UI. */
export async function getCreditHistory(userId: string, limit = 30) {
  return db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit);
}
