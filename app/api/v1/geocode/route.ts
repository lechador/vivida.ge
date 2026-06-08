import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { searchPlaces } from "@/lib/geocoding";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Query = z.object({
  q: z.string().optional(),
});

/**
 * GET /api/v1/geocode?q=<city>
 *
 * City search for the onboarding / partner birth-place picker. Wraps the
 * same searchPlaces() the website uses (Open-Meteo, Georgian-script aware),
 * returning lat/long + timezone for accurate chart computation. Auth-gated
 * to keep the upstream geocoder behind logged-in users.
 */
export async function GET(req: Request) {
  return handle(async () => {
    await requireMobileUser(req);

    const { searchParams } = new URL(req.url);
    const { q } = Query.parse({ q: searchParams.get("q") ?? undefined });

    const results = q ? await searchPlaces(q) : [];
    return ok({ results });
  });
}
