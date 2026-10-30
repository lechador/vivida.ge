import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { iqResults, type IqDomainScoresJson } from "@/db/schema";
import { IQ_ITEMS } from "@/lib/iq/items";
import { isScorableIqAttempt, scoreIq, type IqResult } from "@/lib/iq/scoring";

/**
 * Persist a completed IQ attempt. Scores server-side (authoritative, same
 * function the client uses) and upserts by `attemptId` so a refreshed result
 * page doesn't create duplicate rows. Anonymous attempts are kept too
 * (`userId` null), they're the raw material for self-norming.
 */
export async function saveIqResult(input: {
  attemptId: string;
  answers: Record<string, number>;
  timeUsedSec?: number | null;
  userId?: string | null;
}): Promise<{ result: IqResult; id: string | null }> {
  const r = scoreIq(input.answers);

  // Validity gate: too few administered items (timed-out partial run) or an
  // implausibly fast completion is not a measurement. Score it for the
  // caller's response, but never persist it, partial rows with a handful
  // of items previously stored IQ values up to 145 and would poison any
  // future re-norming.
  if (!isScorableIqAttempt(r.total, input.timeUsedSec)) {
    return { result: r, id: null };
  }
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

  // The row id (just-inserted or the pre-existing one for this attempt) so the
  // caller can route the taker to the gated saved view.
  const [row] = await db
    .select({ id: iqResults.id })
    .from(iqResults)
    .where(eq(iqResults.attemptId, input.attemptId))
    .limit(1);

  return { result: r, id: row?.id ?? null };
}

/** Only keep answers for items still in the bank, and only choices that
 *  could actually have been picked (-1 = skipped, or a real option index).
 *  An out-of-range integer previously survived sanitising untouched. */
export function sanitizeAnswers(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== "object") return out;
  const byId = new Map(IQ_ITEMS.map((i) => [i.id, i]));
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const item = byId.get(k);
    if (!item || typeof v !== "number" || !Number.isInteger(v)) continue;
    if (v === -1 || (v >= 0 && v < item.options.length)) out[k] = v;
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
