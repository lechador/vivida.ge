import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { profiles, userReputation, users } from "@/db/schema";
import { loadProfilePhotos } from "@/lib/feed-core";

/**
 * Framework-agnostic leaderboard data, shared by the website's
 * /leaderboard page and the mobile API (app/api/v1/leaderboard). The
 * `image` field is already resolved to the user's chosen main profile photo
 * (falling back to their OAuth avatar), matching what they see elsewhere.
 */

export type LeaderboardRow = {
  userId: string;
  total: number;
  name: string | null;
  image: string | null;
  username: string | null;
  displayName: string | null;
};

/** Top users by reputation, highest first. Single join + one photo query. */
export async function getLeaderboard(limit = 50): Promise<LeaderboardRow[]> {
  const top = await db
    .select({
      userId: userReputation.userId,
      total: userReputation.total,
      name: users.name,
      image: users.image,
      username: profiles.username,
      displayName: profiles.displayName,
    })
    .from(userReputation)
    .innerJoin(users, eq(users.id, userReputation.userId))
    .leftJoin(profiles, eq(profiles.userId, userReputation.userId))
    .orderBy(desc(userReputation.total))
    .limit(limit);

  const photos = await loadProfilePhotos(top.map((t) => t.userId));
  return top.map((t) => ({
    ...t,
    image: photos.get(t.userId) ?? t.image,
  }));
}

/** A single user's reputation total (0 when they have no row yet). */
export async function getUserReputationTotal(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: userReputation.total })
    .from(userReputation)
    .where(eq(userReputation.userId, userId))
    .limit(1);
  return row?.total ?? 0;
}
