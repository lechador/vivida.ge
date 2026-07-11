import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { iqResults, type IqDomainScoresJson } from "@/db/schema";
import { IQ_ITEMS } from "@/lib/iq/items";
import { scoreIq, type IqResult } from "@/lib/iq/scoring";

/**
 * Persist a completed IQ attempt. Scores server-side (authoritative, same
 * function the client uses) and upserts by `attemptId` so a refreshed result
 * page doesn't create duplicate rows. Anonymous attempts are kept too
 * (`userId` null) — they're the raw material for self-norming.
 */
export async function saveIqResult(input: {
  attemptId: string;
  answers: Record<string, number>;
  timeUsedSec?: number | null;
  userId?: string | null;
}): Promise<IqResult> {
  const r = scoreIq(input.answers);
  const domainScores: IqDomainScoresJson = {
    numeric: 0,
    logic: 0,
    spatial: 0,
    pattern: 0,
  };
  for (const d of r.domains) domainScores[d.domain] = d.pct;

  // Per-item correctness for self-norming (the answer key stays server-side).
  const answerKey = new Map(IQ_ITEMS.map((i) => [i.id, i.answer]));
  const itemCorrect: Record<string, boolean> = {};
  for (const [id, chosen] of Object.entries(input.answers)) {
    if (answerKey.has(id)) itemCorrect[id] = chosen === answerKey.get(id);
  }

  await db
    .insert(iqResults)
    .values({
      userId: input.userId ?? null,
      attemptId: input.attemptId,
      iq: r.iq,
      theta: r.theta,
      percentile: r.percentile,
      correct: r.correct,
      total: r.total,
      domainScores,
      answers: input.answers,
      itemCorrect,
      timeUsedSec: input.timeUsedSec ?? null,
    })
    .onConflictDoNothing({ target: iqResults.attemptId });

  return r;
}

/** Only keep answers for items still in the bank, and only integer choices. */
export function sanitizeAnswers(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== "object") return out;
  const ids = new Set(IQ_ITEMS.map((i) => i.id));
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (ids.has(k) && typeof v === "number" && Number.isInteger(v)) out[k] = v;
  }
  return out;
}

/** A user's past IQ attempts, newest first (for a profile/history view). */
export async function getIqResultsForUser(userId: string, limit = 20) {
  return db
    .select()
    .from(iqResults)
    .where(eq(iqResults.userId, userId))
    .orderBy(desc(iqResults.createdAt))
    .limit(limit);
}
