import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { deleteAccountCore } from "@/lib/account-core";
import { revokeAllForUser } from "@/lib/api/refresh";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const DeleteBody = z.object({
  confirmation: z.string(),
});

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

    const [[profile], [account]] = await Promise.all([
      db
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
        // Account/privacy settings the app's settings screen renders and
        // writes back via PATCH /api/v1/me/settings.
        discoverable: profiles.discoverable,
        gender: profiles.gender,
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1),
      db
        .select({
          residenceCountryCode: users.residenceCountryCode,
          residenceCity: users.residenceCity,
          verified: users.isPremium,
          premiumUntil: users.premiumUntil,
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1),
    ]);

    const verified = Boolean(
      account?.verified &&
        account.premiumUntil &&
        account.premiumUntil.getTime() > Date.now(),
    );

    return ok({
      user: {
        ...user,
        residenceCountryCode: account?.residenceCountryCode ?? null,
        residenceCity: account?.residenceCity ?? null,
        verified,
      },
      profile: profile ?? null,
    });
  });
}

/**
 * DELETE /api/v1/me  { confirmation }
 *
 * Permanently delete the account. Shares deleteAccountCore() with the
 * website (R2 cleanup + cascading DB delete), which also validates the
 * confirmation phrase — so we only revoke the refresh tokens once the delete
 * has succeeded (a rejected phrase must not log the user out everywhere).
 * The current access token simply expires (≤15 min); the client should
 * discard its stored tokens on success.
 */
export async function DELETE(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { confirmation } = await parseBody(req, DeleteBody);

    const result = await deleteAccountCore(user.id, confirmation);
    if (!result.ok) {
      return fail(422, "delete_rejected", result.error);
    }
    await revokeAllForUser(user.id);
    return ok({ ok: true });
  });
}
