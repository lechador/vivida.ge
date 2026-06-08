import { ensureChartFor } from "@/actions/chart";
import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/me/chart
 *
 * The authenticated user's natal chart — computed/cached via the same
 * ensureChartFor() the website uses (Swiss Ephemeris locally, AI narrative
 * when configured). Returns `{ chart: null }` when the user hasn't entered
 * complete birth data yet, so the client can prompt onboarding instead of
 * erroring.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);

    const chart = await ensureChartFor(user.id);
    if (!chart) {
      return ok({ chart: null });
    }

    return ok({
      chart: {
        data: chart.data,
        interpretation: chart.interpretation ?? null,
        generatedAt: chart.generatedAt,
      },
    });
  });
}
