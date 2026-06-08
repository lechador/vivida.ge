import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { markConversationReadCore } from "@/lib/messages-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * POST /api/v1/messages/<userId>/read
 *
 * Mark every message from this partner as read — call it when the user opens
 * the conversation. Shares markConversationReadCore() with the website.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { userId } = await ctx.params;

    await markConversationReadCore(user.id, userId);
    return ok({ ok: true });
  });
}
