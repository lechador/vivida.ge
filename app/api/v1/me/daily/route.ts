import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { ensureDailyFor } from "@/actions/daily";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/me/daily
 *
 * Today's personalized horoscope, generated + cached on first request of the
 * day via the same ensureDailyFor() the website's dashboard uses (transit-
 * informed, AI narrative). Returns `{ daily: null }` when the user's birth
 * data doesn't support it yet, so the client can prompt accordingly.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const daily = await ensureDailyFor(user.id);
    return ok({ daily: daily ?? null });
  });
}
