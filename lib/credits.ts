import { and, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/db";
import { creditAccounts, creditTransactions, notifications } from "@/db/schema";
import { invalidateHeaderForUser } from "@/lib/header-cache";

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
  const [existing] = await db
    .select({ id: creditTransactions.id })
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.ref, sessionId),
        eq(creditTransactions.reason, "purchase")
      )
    )
    .limit(1);
  if (existing) return; // already credited this session
  await grantCredits(userId, amount, "purchase", sessionId);
}

/** Has the user already paid to unlock this specific thing (ledger ref match)? */
export async function isUnlocked(
  userId: string,
  ref: string,
  reason: CreditReason
): Promise<boolean> {
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
  if (await isUnlocked(userId, ref, reason)) return "already";
  const ok = await spendCredits(userId, cost, reason, ref);
  return ok ? "unlocked" : "insufficient";
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
