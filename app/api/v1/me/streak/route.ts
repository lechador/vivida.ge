import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { getStreak } from "@/lib/activity";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/me/streak
 *
 * The viewer's completed daily-ritual streak. An unfinished today preserves
 * yesterday's active run so the UI can show that the streak is still saveable.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const streak = await getStreak(user.id);
    return ok(streak);
  });
}
