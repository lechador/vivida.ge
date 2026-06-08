import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { createPartnerCore, listPartners } from "@/lib/partners-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  name: z.string(),
  dateOfBirth: z.string(),
  timeOfBirth: z.string().nullable(),
  cityName: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string(),
});

/**
 * GET /api/v1/partners
 *
 * The user's saved synastry partners, newest first. Shares listPartners()
 * with the website's /synastry list.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const partners = await listPartners(user.id);
    return ok({ partners });
  });
}

/**
 * POST /api/v1/partners  { name, dateOfBirth, timeOfBirth, cityName,
 *                          latitude, longitude, timezone }
 *
 * Add a synastry partner. Shares createPartnerCore() with the website — same
 * validation, monthly-cap enforcement, and chart computation. AI synastry is
 * generated lazily on first GET /api/v1/partners/<id>.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const input = await parseBody(req, Body);

    const result = await createPartnerCore(user.id, input);
    if (!result.ok) {
      return fail(422, "partner_rejected", result.error);
    }
    return ok({ id: result.id }, 201);
  });
}
