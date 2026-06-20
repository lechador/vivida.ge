import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { dismissNotificationCore } from "@/lib/notifications";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * DELETE /api/v1/notifications/<id>
 *
 * Dismiss (delete) a single notification, scoped to the owner. Shares
 * dismissNotificationCore() with the website.
 */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { id } = await ctx.params;

    await dismissNotificationCore(user.id, id);
    return ok({ ok: true });
  });
}
