import { completeDailyRitualFor } from "@/lib/daily-ritual-core";
import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/** POST /api/v1/me/ritual — idempotently complete today's value ritual. */
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    return ok(await completeDailyRitualFor(user.id));
  });
}
