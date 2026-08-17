import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { bigFiveResults, eqResults, iqResults, mbtiTestResults, profiles } from "@/db/schema";
import { ensureUsername } from "@/lib/username";

/**
 * Shared helpers for "my results" (tests hub, public profile) and the
 * "show on public profile" opt-in. Visibility is a per-user, per-test-kind
 * preference stored on the profile, so it survives retakes and always reflects
 * the taker's *latest* result.
 */

export type TestKind = "mbti" | "iq" | "eq" | "big-five";

export async function getLatestMbtiResult(userId: string) {
  const [row] = await db
    .select()
    .from(mbtiTestResults)
    .where(eq(mbtiTestResults.userId, userId))
    .orderBy(desc(mbtiTestResults.createdAt))
    .limit(1);
  return row ?? null;
}

export async function getLatestIqResult(userId: string) {
  const [row] = await db
    .select()
    .from(iqResults)
    .where(eq(iqResults.userId, userId))
    .orderBy(desc(iqResults.createdAt))
    .limit(1);
  return row ?? null;
}

export async function getLatestEqResult(userId: string) {
  const [row] = await db
    .select()
    .from(eqResults)
    .where(eq(eqResults.userId, userId))
    .orderBy(desc(eqResults.createdAt))
    .limit(1);
  return row ?? null;
}

export async function getLatestBigFiveResult(userId: string) {
  const [row] = await db
    .select()
    .from(bigFiveResults)
    .where(eq(bigFiveResults.userId, userId))
    .orderBy(desc(bigFiveResults.createdAt))
    .limit(1);
  return row ?? null;
}

export type TestVisibility = { mbti: boolean; iq: boolean; eq: boolean; "big-five": boolean };

export async function getTestVisibility(userId: string): Promise<TestVisibility> {
  const [p] = await db
    .select({
      mbti: profiles.showMbtiResult,
      iq: profiles.showIqResult,
      eq: profiles.showEqResult,
      "big-five": profiles.showBigFiveResult,
    })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return { mbti: !!p?.mbti, iq: !!p?.iq, eq: !!p?.eq, "big-five": !!p?.["big-five"] };
}

/**
 * Set one test's profile visibility. Upserts the profile row (a user who
 * registered without birth details may not have one yet) keyed on its
 * user_id primary key.
 */
export async function setTestVisibility(
  userId: string,
  kind: TestKind,
  visible: boolean
): Promise<void> {
  const set =
    kind === "mbti"
      ? { showMbtiResult: visible }
      : kind === "iq"
        ? { showIqResult: visible }
        : kind === "eq"
          ? { showEqResult: visible }
          : { showBigFiveResult: visible };
  await db
    .insert(profiles)
    .values({ userId, ...set })
    .onConflictDoUpdate({ target: profiles.userId, set });
  // Keep "every profile row has a username" true no matter which path created
  // the row — this one can mint a bare row for a legacy user who predates
  // usernames being assigned at signup. Best-effort; never fail the toggle.
  try {
    await ensureUsername(userId);
  } catch {
    /* the visibility toggle is what the user asked for */
  }
}
