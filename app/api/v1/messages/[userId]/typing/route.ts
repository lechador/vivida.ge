import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { pingTypingCore } from "@/lib/messages-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * POST /api/v1/messages/<userId>/typing
 *
 * Ping that the viewer is typing to this partner. Friendship-checked,
 * idempotent (refreshes a 5s TTL). The partner picks it up via the poll
 * endpoint. Shares pingTypingCore() with the website.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { userId } = await ctx.params;

    const result = await pingTypingCore(user.id, userId);
    if (!result.ok) {
      return fail(422, "typing_rejected", result.error);
    }
    return ok({ ok: true });
  });
}
