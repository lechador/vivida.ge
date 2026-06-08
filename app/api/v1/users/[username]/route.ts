import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles, users } from "@/db/schema";
import { requireMobileUser } from "@/lib/api/auth";
import { ApiError, handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { listRecentPostsByUserPage, loadProfilePhotos, sunSignFromDob } from "@/lib/feed-core";
import { countFriends, getFriendshipStatus } from "@/lib/friendship";
import { getReputation } from "@/lib/reputation";

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
    const [reputation, friendCount, friendship, photos, recentPosts] =
      await Promise.all([
        getReputation(row.id),
        countFriends(row.id),
        isSelf
          ? Promise.resolve("none" as const)
          : getFriendshipStatus(viewer.id, row.id),
        loadProfilePhotos([row.id]),
        listRecentPostsByUserPage({ viewerId: viewer.id, userId: row.id, limit: 10 }),
      ]);

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
      reputation,
      friendCount,
      friendship,
      isSelf,
      recentPosts,
    });
  });
}
