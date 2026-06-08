import { eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { charts, profiles, users, type NatalChartJson } from "@/db/schema";
import { requireMobileUser } from "@/lib/api/auth";
import { ApiError, handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { computeChart } from "@/lib/astrology";
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
    const [
      reputation,
      friendCount,
      friendship,
      photos,
      recentPosts,
      cachedCharts,
      birthRows,
    ] = await Promise.all([
      getReputation(row.id),
      countFriends(row.id),
      isSelf
        ? Promise.resolve("none" as const)
        : getFriendshipStatus(viewer.id, row.id),
      loadProfilePhotos([row.id]),
      listRecentPostsByUserPage({ viewerId: viewer.id, userId: row.id, limit: 10 }),
      // Cached charts for both parties (fast path for the compatibility preview).
      db
        .select({ userId: charts.userId, data: charts.data })
        .from(charts)
        .where(inArray(charts.userId, [viewer.id, row.id])),
      // Birth inputs for both, so we can compute a chart on the fly when one
      // isn't cached yet (e.g. the profile owner never opened their own chart).
      db
        .select({
          userId: profiles.userId,
          dateOfBirth: profiles.dateOfBirth,
          timeOfBirth: profiles.timeOfBirth,
          latitude: profiles.latitude,
          longitude: profiles.longitude,
          timezone: profiles.timezone,
        })
        .from(profiles)
        .where(inArray(profiles.userId, [viewer.id, row.id])),
    ]);

    // Chart data for a user: cached if available, otherwise computed locally
    // (Swiss ephemeris only — no AI, no DB write). null when birth data is
    // incomplete. Mirrors the website's synastry preview, which generates both
    // charts on view.
    const chartDataFor = async (
      id: string
    ): Promise<NatalChartJson | null> => {
      const cached = cachedCharts.find((c) => c.userId === id)?.data;
      if (cached) return cached;
      const p = birthRows.find((b) => b.userId === id);
      if (
        !p?.dateOfBirth ||
        p.latitude === null ||
        p.longitude === null ||
        !p.timezone
      ) {
        return null;
      }
      try {
        const computed = await computeChart({
          date: p.dateOfBirth,
          time: p.timeOfBirth ? p.timeOfBirth.slice(0, 5) : null,
          latitude: p.latitude,
          longitude: p.longitude,
          timezone: p.timezone,
        });
        return computed.data;
      } catch {
        return null;
      }
    };

    // Weighted overall synastry between viewer and this user (0–100), the
    // Georgian verdict, and the per-category breakdown (love, chemistry, …) —
    // same computeSynastry() the website + /synastry use.
    let compatibility:
      | { overall: number; verdict: string; scores: Record<string, number> }
      | null = null;
    if (!isSelf) {
      const [viewerData, targetData] = await Promise.all([
        chartDataFor(viewer.id),
        chartDataFor(row.id),
      ]);
      if (viewerData && targetData) {
        try {
          const result = computeSynastry(viewerData, targetData);
          const scores = Object.fromEntries(
            Object.entries(result.scores).map(([k, v]) => [k, Math.round(v)])
          );
          compatibility = {
            overall: result.overall,
            verdict: overallVerdict(result.overall),
            scores,
          };
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
