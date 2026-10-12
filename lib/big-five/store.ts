import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { bigFiveResults, type BigFiveTraitScoresJson } from "@/db/schema";
import { BIG5_QUESTIONS } from "@/lib/big-five/questions";
import { calculateBigFive, type BigFiveResult } from "@/lib/big-five/scoring";

/**
 * Persist a completed Big Five attempt. Scores server-side (authoritative, same
 * function the client uses) and upserts by `attemptId` so a refreshed result
 * page doesn't create duplicate rows. Anonymous attempts are kept too
 * (`userId` null), raw material for self-norming the score distribution.
 */
export async function saveBigFiveResult(input: {
  attemptId: string;
  answers: Record<number, number>;
  userId?: string | null;
}): Promise<{ result: BigFiveResult; id: string | null }> {
  const r = calculateBigFive(input.answers);
  const traitScores = Object.fromEntries(
    r.traits.map((t) => [t.key, t.score])
  ) as BigFiveTraitScoresJson;

  await db
    .insert(bigFiveResults)
    .values({
      userId: input.userId ?? null,
      attemptId: input.attemptId,
      traitScores,
      answers: input.answers,
    })
    .onConflictDoNothing({ target: bigFiveResults.attemptId });

  const [row] = await db
    .select({ id: bigFiveResults.id })
    .from(bigFiveResults)
    .where(eq(bigFiveResults.attemptId, input.attemptId))
    .limit(1);

  return { result: r, id: row?.id ?? null };
}

/** Keep only answers for real question ids, integer choices 1..5. */
export function sanitizeBigFiveAnswers(raw: unknown): Record<number, number> {
  const out: Record<number, number> = {};
  if (!raw || typeof raw !== "object") return out;
  const ids = new Set(BIG5_QUESTIONS.map((q) => q.id));
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = Number(k);
    if (ids.has(id) && typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5) {
      out[id] = v;
    }
  }
  return out;
}

/** A user's past Big Five attempts, newest first. */
export async function getBigFiveResultsForUser(userId: string, limit = 20) {
  return db
    .select()
    .from(bigFiveResults)
    .where(eq(bigFiveResults.userId, userId))
    .orderBy(desc(bigFiveResults.createdAt))
    .limit(limit);
}
