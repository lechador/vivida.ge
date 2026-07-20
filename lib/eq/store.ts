import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { eqResults, type EqDomainScoresJson } from "@/db/schema";
import { EQ_QUESTIONS } from "@/lib/eq/questions";
import { calculateEq, type EqResult } from "@/lib/eq/scoring";

/**
 * Persist a completed EQ attempt. Scores server-side (authoritative, same
 * function the client uses) and upserts by `attemptId` so a refreshed result
 * page doesn't create duplicate rows. Anonymous attempts are kept too
 * (`userId` null) — the raw material for self-norming the score distribution.
 */
export async function saveEqResult(input: {
  attemptId: string;
  answers: Record<number, number>;
  userId?: string | null;
}): Promise<{ result: EqResult; id: string | null }> {
  const r = calculateEq(input.answers);
  const domainScores = Object.fromEntries(
    r.domains.map((d) => [d.key, d.score])
  ) as EqDomainScoresJson;

  await db
    .insert(eqResults)
    .values({
      userId: input.userId ?? null,
      attemptId: input.attemptId,
      overall: r.overall,
      band: r.band,
      domainScores,
      answers: input.answers,
    })
    .onConflictDoNothing({ target: eqResults.attemptId });

  const [row] = await db
    .select({ id: eqResults.id })
    .from(eqResults)
    .where(eq(eqResults.attemptId, input.attemptId))
    .limit(1);

  return { result: r, id: row?.id ?? null };
}

/** Keep only answers for real question ids, integer choices 1..5. */
export function sanitizeEqAnswers(raw: unknown): Record<number, number> {
  const out: Record<number, number> = {};
  if (!raw || typeof raw !== "object") return out;
  const ids = new Set(EQ_QUESTIONS.map((q) => q.id));
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const id = Number(k);
    if (ids.has(id) && typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5) {
      out[id] = v;
    }
  }
  return out;
}

/** A user's past EQ attempts, newest first. */
export async function getEqResultsForUser(userId: string, limit = 20) {
  return db
    .select()
    .from(eqResults)
    .where(eq(eqResults.userId, userId))
    .orderBy(desc(eqResults.createdAt))
    .limit(limit);
}
