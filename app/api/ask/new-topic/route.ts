import { auth } from "@/auth";
import { createAskConversation } from "@/lib/ask-conversations";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Back-compat shim for tabs still running the "new topic" button from before
 * conversations shipped. Creates a topic and returns it; the newer client uses
 * POST /api/ask/conversations and navigates to `?c=<id>` instead.
 */
export async function POST() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  try {
    await enforceRateLimit({
      bucket: "ask_new_conversation_user_day",
      identifier: userId,
      limit: 60,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const conversation = await createAskConversation(userId);
  return Response.json({
    conversation: {
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updatedAt.toISOString(),
    },
  });
}
