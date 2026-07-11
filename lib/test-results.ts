import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { iqResults, mbtiTestResults, profiles } from "@/db/schema";

/**
 * Shared helpers for "my results" (tests hub, public profile) and the
 * "show on public profile" opt-in. Visibility is a per-user, per-test-kind
 * preference stored on the profile, so it survives retakes and always reflects
 * the taker's *latest* result.
 */

export type TestKind = "mbti" | "iq";

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

export type TestVisibility = { mbti: boolean; iq: boolean };

export async function getTestVisibility(userId: string): Promise<TestVisibility> {
  const [p] = await db
    .select({ mbti: profiles.showMbtiResult, iq: profiles.showIqResult })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return { mbti: !!p?.mbti, iq: !!p?.iq };
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
    kind === "mbti" ? { showMbtiResult: visible } : { showIqResult: visible };
  await db
    .insert(profiles)
    .values({ userId, ...set })
    .onConflictDoUpdate({ target: profiles.userId, set });
}
