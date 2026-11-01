import { auth } from "@/auth";
import {
  createAskConversation,
  listAskConversations,
} from "@/lib/ask-conversations";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The caller's ask conversations, newest activity first. */
export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  const conversations = await listAskConversations(userId);
  return Response.json({
    conversations: conversations.map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt.toISOString(),
    })),
  });
}

/**
 * Start a new topic. The memory portrait is untouched; the new conversation is
 * simply another thread the user can switch back and forth between.
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
