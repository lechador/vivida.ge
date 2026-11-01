import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { answerFeedback, chartChatMessages } from "@/db/schema";
import {
  normalizeAnswerFeedback,
  parseTarotFollowupTarget,
  type NormalizedAnswerFeedback,
} from "@/lib/answer-feedback-pure";
import { getLibraryEntry } from "@/lib/library";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Per-answer feedback (👍/👎 + short reason) on AI answers. The target is
 * verified against the caller's own rows before anything is stored, so a
 * client can only rate answers it actually received. One row per
 * (user, surface, target); re-voting updates it in place.
 */
export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    await enforceRateLimit({
      bucket: "answer_feedback_user_day",
      identifier: userId,
      limit: 300,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const vote = normalizeAnswerFeedback(body);
  if (!vote) return Response.json({ error: "bad_request" }, { status: 400 });

  const owned = await targetBelongsToUser(userId, vote);
  if (!owned) return Response.json({ error: "not_found" }, { status: 404 });

  await db
    .insert(answerFeedback)
    .values({
      userId,
      surface: vote.surface,
      targetKey: vote.targetKey,
      rating: vote.rating,
      reason: vote.reason,
    })
    .onConflictDoUpdate({
      target: [
        answerFeedback.userId,
        answerFeedback.surface,
        answerFeedback.targetKey,
      ],
      set: { rating: vote.rating, reason: vote.reason, updatedAt: new Date() },
    });

  return Response.json({ ok: true });
}

async function targetBelongsToUser(
  userId: string,
  vote: NormalizedAnswerFeedback,
): Promise<boolean> {
  if (vote.surface === "ask") {
    const [row] = await db
      .select({ id: chartChatMessages.id })
      .from(chartChatMessages)
      .where(
        and(
          eq(chartChatMessages.id, vote.targetKey),
          eq(chartChatMessages.userId, userId),
          eq(chartChatMessages.role, "assistant"),
        ),
      )
      .limit(1);
    return Boolean(row);
  }

  if (vote.surface === "tarot") {
    const entry = await getLibraryEntry(userId, vote.targetKey);
    return Boolean(entry && entry.kind === "tarot");
  }

  // tarot_followup: `${libraryEntryId}:${index}` on the caller's own reading.
  const parsed = parseTarotFollowupTarget(vote.targetKey);
  if (!parsed) return false;
  const entry = await getLibraryEntry(userId, parsed.libraryId);
  if (!entry || entry.kind !== "tarot" || entry.content.type !== "tarot") {
    return false;
  }
  return Boolean(entry.content.followups?.[parsed.index]);
}
