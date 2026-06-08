import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { listConversations } from "@/lib/messages";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/messages
 *
 * The conversation list — one row per friend, most-recent activity first,
 * with the last message and unread count. Shares listConversations() with
 * the website's chat panel.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const conversations = await listConversations(user.id);
    return ok({ conversations });
  });
}
