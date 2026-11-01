import { auth } from "@/auth";
import { startAskTopic } from "@/lib/ask-memory";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start a new topic in "chat with your chart". The rolling portrait (what the
 * astrologer remembers about the person) is untouched; only the conversation
 * cut-off moves, so earlier turns stop being shown and stop being sent to the
 * model until the user brings that subject up again themselves.
 */
export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    await enforceRateLimit({
      bucket: "ask_new_topic_user_day",
      identifier: userId,
      limit: 60,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const topicStartedAt = await startAskTopic(userId);
  return Response.json({
    ok: true,
    topicStartedAt: topicStartedAt.toISOString(),
  });
}
