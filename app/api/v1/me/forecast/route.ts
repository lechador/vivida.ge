import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { ensureWeeklyForecast } from "@/actions/weekly-forecast";
import { getCurrentPlan } from "@/lib/plan";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/me/forecast
 *
 * The user's 7-day forecast (harmony/challenge scores + daily guidance),
 * regenerated + cached when the local week-start rolls forward. Shares
 * ensureWeeklyForecast() with the website. Returns `{ forecast: null }` when
 * the plan or birth data doesn't support it (e.g. free tier).
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const plan = await getCurrentPlan(user.id);
    const forecast = await ensureWeeklyForecast(user.id, plan);
    return ok({ forecast: forecast ?? null });
  });
}
