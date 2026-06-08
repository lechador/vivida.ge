import { z } from "zod";

import { ensureSignHoroscope } from "@/actions/sign-horoscope";
import { requireMobileUser } from "@/lib/api/auth";
import { ApiError, handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { ALL_SLUGS, type ZodiacSlug } from "@/lib/seo/zodiac-dates";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Query = z.object({
  period: z.enum(["day", "week", "month"]).optional(),
});

/**
 * GET /api/v1/horoscope/<sign>?period=day|week|month
 *
 * The universal (no natal chart) horoscope for a sun sign, reusing the
 * website's ensureSignHoroscope() — reads the cached row for the current
 * period, generating it on first request after a period rollover. The
 * mobile "Today" tab calls this with the viewer's sun sign.
 *
 * `sign` is the English slug (aries…pisces). Auth-gated to keep generation
 * behind a logged-in user, same as the rest of the v1 surface.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ sign: string }> }
) {
  return handle(async () => {
    await requireMobileUser(req);

    const { sign } = await ctx.params;
    if (!(ALL_SLUGS as string[]).includes(sign)) {
      throw new ApiError(404, "unknown_sign", "Unknown zodiac sign");
    }

    const { searchParams } = new URL(req.url);
    const { period } = Query.parse({
      period: searchParams.get("period") ?? undefined,
    });

    const horoscope = await ensureSignHoroscope(
      sign as ZodiacSlug,
      period ?? "day"
    );
    if (!horoscope) {
      throw new ApiError(
        503,
        "horoscope_unavailable",
        "Horoscope is not available right now"
      );
    }

    return ok({
      sign,
      period: horoscope.period,
      periodKey: horoscope.periodKey,
      headline: horoscope.headline,
      summary: horoscope.summary,
      body: horoscope.body,
      themes: horoscope.themes,
    });
  });
}
