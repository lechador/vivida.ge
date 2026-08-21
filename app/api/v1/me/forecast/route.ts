import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { ensureWeeklyForecast } from "@/actions/weekly-forecast";
import { CREDIT_COST, isUnlocked } from "@/lib/credits";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/me/forecast
 *
 * The user's 7-day forecast (harmony/challenge scores + daily guidance),
 * regenerated + cached when the local week-start rolls forward. Shares
 * ensureWeeklyForecast() with the website. The forecast is a one-time credit
 * unlock; returns `{ forecast: null, locked: true, cost }` until it's
 * unlocked (or `{ forecast: null }` when birth data doesn't support it).
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const unlocked = await isUnlocked(user.id, "weekly", "spend_weekly");
    if (!unlocked) {
      return ok({
        forecast: null,
        locked: true,
        cost: CREDIT_COST.weeklyForecast,
      });
    }
    const forecast = await ensureWeeklyForecast(user.id);
    return ok({ forecast: forecast ?? null });
  });
}
