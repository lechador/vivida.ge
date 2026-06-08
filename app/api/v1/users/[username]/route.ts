import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { charts, profiles, users } from "@/db/schema";
import { requireMobileUser } from "@/lib/api/auth";
import { ApiError, handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { listRecentPostsByUserPage, loadProfilePhotos, sunSignFromDob } from "@/lib/feed-core";
import { countFriends, getFriendshipStatus } from "@/lib/friendship";
import { getReputation } from "@/lib/reputation";
import { computeSynastry, overallVerdict } from "@/lib/synastry";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/users/<username>
 *
 * A public profile bundle for the mobile profile screen: identity, sun sign,
 * reputation, friend count, the viewer's friendship status, and recent posts.
 * 404 when the username doesn't resolve to a claimed profile.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ username: string }> }
) {
  return handle(async () => {
    const viewer = await requireMobileUser(req);
    const { username } = await ctx.params;

    const [row] = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        username: profiles.username,
        displayName: profiles.displayName,
        bio: profiles.bio,
        dateOfBirth: profiles.dateOfBirth,
        cityName: profiles.cityName,
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.userId))
      .where(eq(profiles.username, username))
      .limit(1);

    if (!row) {
      throw new ApiError(404, "user_not_found", "Profile not found");
    }

    const isSelf = row.id === viewer.id;
    const [reputation, friendCount, friendship, photos, recentPosts, charted] =
      await Promise.all([
        getReputation(row.id),
        countFriends(row.id),
        isSelf
          ? Promise.resolve("none" as const)
          : getFriendshipStatus(viewer.id, row.id),
        loadProfilePhotos([row.id]),
        listRecentPostsByUserPage({ viewerId: viewer.id, userId: row.id, limit: 10 }),
        // Both charts (viewer + target) for the compatibility preview. Read
        // straight from the cache — no on-the-fly generation on a profile view.
        db
          .select({ userId: charts.userId, data: charts.data })
          .from(charts)
          .where(inArray(charts.userId, [viewer.id, row.id])),
      ]);

    // Weighted overall synastry between viewer and this user (0–100), plus a
    // Georgian verdict — same computeSynastry() the website + /synastry use.
    let compatibility: { overall: number; verdict: string } | null = null;
    if (!isSelf) {
      const viewerData = charted.find((c) => c.userId === viewer.id)?.data;
      const targetData = charted.find((c) => c.userId === row.id)?.data;
      if (viewerData && targetData) {
        try {
          const overall = computeSynastry(viewerData, targetData).overall;
          compatibility = { overall, verdict: overallVerdict(overall) };
        } catch {
          compatibility = null;
        }
      }
    }

    return ok({
      user: {
        id: row.id,
        name: row.name,
        image: photos.get(row.id) ?? row.image,
      },
      profile: {
        username: row.username,
        displayName: row.displayName,
        bio: row.bio,
        dateOfBirth: row.dateOfBirth,
        cityName: row.cityName,
      },
      sunSign: sunSignFromDob(row.dateOfBirth),
      compatibility,
      reputation,
      friendCount,
      friendship,
      isSelf,
      recentPosts,
    });
  });
}
