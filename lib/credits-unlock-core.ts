import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  bigFiveResults,
  eqResults,
  iqResults,
  mbtiTestResults,
  partners,
} from "@/db/schema";
import {
  CREDIT_COST,
  spendOnce,
  type CreditReason,
  type UnlockResult,
} from "@/lib/credits";

/**
 * Paying credits to unlock a deep result for the website's
 * `POST /api/credits/unlock`. Enforces the price and ownership check.
 */

export const UNLOCK_KINDS = [
  "iq",
  "eq",
  "big-five",
  "mbti",
  "synastry",
  "weekly",
] as const;

export type UnlockKind = (typeof UNLOCK_KINDS)[number];

export function isUnlockKind(value: unknown): value is UnlockKind {
  return UNLOCK_KINDS.includes(value as UnlockKind);
}

const REASON: Record<UnlockKind, CreditReason> = {
  iq: "spend_iq",
  eq: "spend_eq",
  "big-five": "spend_bigfive",
  mbti: "spend_mbti",
  synastry: "spend_synastry",
  weekly: "spend_weekly",
};

export const UNLOCK_COST: Record<UnlockKind, number> = {
  iq: CREDIT_COST.iqTest,
  eq: CREDIT_COST.eqTest,
  "big-five": CREDIT_COST.bigFiveTest,
  mbti: CREDIT_COST.mbtiTest,
  synastry: CREDIT_COST.synastry,
  weekly: CREDIT_COST.weeklyForecast,
};

export type UnlockOutcome =
  | { ok: true; status: UnlockResult }
  | { ok: false; error: "bad_request" | "not_found" | "insufficient" };

/** Does `resultId` belong to `userId`? Never let someone unlock, or probe, another's row. */
async function ownsResult(
  userId: string,
  kind: Exclude<UnlockKind, "weekly">,
  resultId: string,
): Promise<boolean> {
  const table = {
    iq: iqResults,
    eq: eqResults,
    "big-five": bigFiveResults,
    mbti: mbtiTestResults,
    synastry: partners,
  }[kind];

  const [row] = await db
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.id, resultId), eq(table.userId, userId)))
    .limit(1);
  return !!row;
}

/**
 * Spend credits to unlock one result. Idempotent, re-unlocking an item the
 * user already paid for costs nothing and returns "already".
 *
 * "weekly" is a per-user lifetime unlock (the 7-day forecast) keyed by a fixed
 * ref, so it takes no `resultId` and has no row to own. Every other kind needs
 * a `resultId` that belongs to the caller.
 */
export async function unlockForUser(
  userId: string,
  kind: UnlockKind,
  resultId?: string | null,
): Promise<UnlockOutcome> {
  let ref: string;
  if (kind === "weekly") {
    ref = "weekly";
  } else {
    if (!resultId) return { ok: false, error: "bad_request" };
    if (!(await ownsResult(userId, kind, resultId))) {
      return { ok: false, error: "not_found" };
    }
    ref = resultId;
  }

  const status = await spendOnce(userId, UNLOCK_COST[kind], REASON[kind], ref);
  if (status === "insufficient") return { ok: false, error: "insufficient" };
  return { ok: true, status };
}
