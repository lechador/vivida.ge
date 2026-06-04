import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/me
 *
 * Returns the authenticated user plus their birth/public profile. This
 * is the reference protected endpoint — it proves the full bearer-token
 * chain (sign → send → verify → load user) end to end.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);

    const [profile] = await db
      .select({
        username: profiles.username,
        displayName: profiles.displayName,
        bio: profiles.bio,
        dateOfBirth: profiles.dateOfBirth,
        timeOfBirth: profiles.timeOfBirth,
        cityName: profiles.cityName,
        timezone: profiles.timezone,
        latitude: profiles.latitude,
        longitude: profiles.longitude,
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    return ok({ user, profile: profile ?? null });
  });
}
