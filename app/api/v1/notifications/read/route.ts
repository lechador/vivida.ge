import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { markAllNotificationsReadCore } from "@/lib/notifications";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * POST /api/v1/notifications/read
 *
 * Mark all of the user's unread notifications as read (clears the bell
 * badge). Shares markAllNotificationsReadCore() with the website.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    await markAllNotificationsReadCore(user.id);
    return ok({ ok: true });
  });
}
