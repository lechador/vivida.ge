import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { getStreak } from "@/lib/activity";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/me/streak
 *
 * The viewer's daily-visit streak (current + longest), for the Today screen's
 * streak chip. `requireMobileUser` records today's visit in an after-hook, and
 * `getStreak` counts today as active regardless, so a first visit reads as a
 * 1-day streak immediately.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const streak = await getStreak(user.id);
    return ok(streak);
  });
}
