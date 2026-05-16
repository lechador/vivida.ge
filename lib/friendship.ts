import { and, count, desc, eq, inArray, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { friendships, profiles, users } from "@/db/schema";
import { firstReadyPhotoByUser, resolveAvatar } from "./avatars";

export type FriendshipStatus =
  | "none"
  | "pending_outgoing"
  | "pending_incoming"
  | "friends"
  | "blocked";

/**
 * Symmetric lookup — returns the relationship as seen from `viewerId`'s
 * perspective. "pending_outgoing" means viewer sent the request; "pending_
 * incoming" means viewer received it.
 */
export async function getFriendshipStatus(
  viewerId: string,
  otherId: string
): Promise<FriendshipStatus> {
  if (viewerId === otherId) return "none";
  const [row] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, viewerId),
          eq(friendships.recipientId, otherId)
        ),
        and(
          eq(friendships.requesterId, otherId),
          eq(friendships.recipientId, viewerId)
        )
      )
    )
    .limit(1);

  if (!row) return "none";
  if (row.status === "accepted") return "friends";
  if (row.status === "blocked") return "blocked";
  return row.requesterId === viewerId ? "pending_outgoing" : "pending_incoming";
}

export type FriendshipUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  /** Date of the friendship event (createdAt for pending, respondedAt for friends). */
  since: Date;
};

/**
 * List the user's accepted friends. We need to look at both sides of the
 * directed friendship row — when this user is the requester, the friend is
 * recipient, and vice versa. We run two queries and merge.
 */
export async function listFriends(userId: string): Promise<FriendshipUser[]> {
  const asRequester = await db
    .select({
      friendship: friendships,
      user: users,
      profile: profiles,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.recipientId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(friendships.requesterId, userId),
        eq(friendships.status, "accepted")
      )
    );

  const asRecipient = await db
    .select({
      friendship: friendships,
      user: users,
      profile: profiles,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.requesterId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(friendships.recipientId, userId),
        eq(friendships.status, "accepted")
      )
    );

  const merged = [...asRequester, ...asRecipient];
  const photos = await firstReadyPhotoByUser(merged.map((r) => r.user.id));
  return merged
    .map((r) => ({
      id: r.user.id,
      name: r.user.name,
      email: r.user.email,
      image: resolveAvatar(r.user.id, r.user.image, photos),
      username: r.profile?.username ?? null,
      displayName: r.profile?.displayName ?? null,
      bio: r.profile?.bio ?? null,
      since: r.friendship.respondedAt ?? r.friendship.createdAt,
    }))
    .sort((a, b) => b.since.getTime() - a.since.getTime());
}

/** Pending requests sent TO me. */
export async function listIncomingRequests(
  userId: string
): Promise<FriendshipUser[]> {
  const rows = await db
    .select({
      friendship: friendships,
      user: users,
      profile: profiles,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.requesterId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(friendships.recipientId, userId),
        eq(friendships.status, "pending")
      )
    )
    .orderBy(desc(friendships.createdAt));

  const photos = await firstReadyPhotoByUser(rows.map((r) => r.user.id));
  return rows.map((r) => ({
    id: r.user.id,
    name: r.user.name,
    email: r.user.email,
    image: resolveAvatar(r.user.id, r.user.image, photos),
    username: r.profile?.username ?? null,
    displayName: r.profile?.displayName ?? null,
    bio: r.profile?.bio ?? null,
    since: r.friendship.createdAt,
  }));
}

/** Pending requests *I* sent. */
export async function listOutgoingRequests(
  userId: string
): Promise<FriendshipUser[]> {
  const rows = await db
    .select({
      friendship: friendships,
      user: users,
      profile: profiles,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.recipientId))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(friendships.requesterId, userId),
        eq(friendships.status, "pending")
      )
    )
    .orderBy(desc(friendships.createdAt));

  const photos = await firstReadyPhotoByUser(rows.map((r) => r.user.id));
  return rows.map((r) => ({
    id: r.user.id,
    name: r.user.name,
    email: r.user.email,
    image: resolveAvatar(r.user.id, r.user.image, photos),
    username: r.profile?.username ?? null,
    displayName: r.profile?.displayName ?? null,
    bio: r.profile?.bio ?? null,
    since: r.friendship.createdAt,
  }));
}

/**
 * Count of accepted friends for one user. Both directions of the
 * `friendships` row (requester / recipient) count, so a single COUNT
 * over the OR query gives the answer.
 */
export async function countFriends(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          eq(friendships.requesterId, userId),
          eq(friendships.recipientId, userId)
        )
      )
    );
  return Number(row?.value ?? 0);
}

/**
 * Batched version of `countFriends` for many users at once — used by
 * the suggested-people rail so we don't fire one COUNT per card.
 * Returns a map keyed by userId; missing users have an implicit 0.
 *
 * Implementation: two GROUP BY queries (one per side of the friendship
 * row) summed in JS. Both queries are index-bound — friendship's PK is
 * (requester_id, recipient_id), so each side hits a covering index.
 */
export async function countFriendsBatch(
  userIds: string[]
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (userIds.length === 0) return out;
  const [asReq, asRec] = await Promise.all([
    db
      .select({
        userId: friendships.requesterId,
        cnt: sql<number>`count(*)::int`,
      })
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "accepted"),
          inArray(friendships.requesterId, userIds)
        )
      )
      .groupBy(friendships.requesterId),
    db
      .select({
        userId: friendships.recipientId,
        cnt: sql<number>`count(*)::int`,
      })
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "accepted"),
          inArray(friendships.recipientId, userIds)
        )
      )
      .groupBy(friendships.recipientId),
  ]);
  for (const r of asReq) out.set(r.userId, Number(r.cnt));
  for (const r of asRec) {
    out.set(r.userId, (out.get(r.userId) ?? 0) + Number(r.cnt));
  }
  return out;
}

/**
 * Number of people who are friends with BOTH `viewerId` and `otherId`.
 * Implementation: intersect each side's friend-id set in SQL with a CTE
 * — one round trip, no per-card N+1.
 *
 * Returns 0 when viewer and other are the same user (so the UI can hide
 * the indicator without a separate self-check).
 */
export async function countMutualFriends(
  viewerId: string,
  otherId: string
): Promise<number> {
  if (viewerId === otherId) return 0;
  const rows = await db.execute<{ cnt: number }>(sql`
    WITH viewer_friends AS (
      SELECT CASE WHEN requester_id = ${viewerId} THEN recipient_id ELSE requester_id END AS friend_id
      FROM friendship
      WHERE status = 'accepted'
        AND (requester_id = ${viewerId} OR recipient_id = ${viewerId})
    ),
    other_friends AS (
      SELECT CASE WHEN requester_id = ${otherId} THEN recipient_id ELSE requester_id END AS friend_id
      FROM friendship
      WHERE status = 'accepted'
        AND (requester_id = ${otherId} OR recipient_id = ${otherId})
    )
    SELECT COUNT(*)::int AS cnt
    FROM viewer_friends v
    JOIN other_friends o ON o.friend_id = v.friend_id
  `);
  const first = (rows.rows as Array<{ cnt: number }>)[0];
  return Number(first?.cnt ?? 0);
}

/**
 * Up to `limit` mutual-friend previews (id + display name + avatar) for
 * a profile-page hover/tooltip. Empty when there are none.
 */
export async function listMutualFriendsPreview(
  viewerId: string,
  otherId: string,
  limit = 4
): Promise<Array<{ id: string; name: string | null; image: string | null; username: string | null }>> {
  if (viewerId === otherId) return [];
  const rows = await db.execute<{
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  }>(sql`
    WITH viewer_friends AS (
      SELECT CASE WHEN requester_id = ${viewerId} THEN recipient_id ELSE requester_id END AS friend_id
      FROM friendship
      WHERE status = 'accepted'
        AND (requester_id = ${viewerId} OR recipient_id = ${viewerId})
    ),
    other_friends AS (
      SELECT CASE WHEN requester_id = ${otherId} THEN recipient_id ELSE requester_id END AS friend_id
      FROM friendship
      WHERE status = 'accepted'
        AND (requester_id = ${otherId} OR recipient_id = ${otherId})
    )
    SELECT u.id, u.name, u.image, p.username
    FROM viewer_friends v
    JOIN other_friends o ON o.friend_id = v.friend_id
    JOIN "user" u ON u.id = v.friend_id
    LEFT JOIN profile p ON p.user_id = u.id
    LIMIT ${limit}
  `);
  const list = (rows.rows ?? []) as Array<{
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
  }>;
  if (list.length === 0) return [];
  const photos = await firstReadyPhotoByUser(list.map((r) => r.id));
  return list.map((r) => ({
    id: r.id,
    name: r.name,
    image: resolveAvatar(r.id, r.image, photos),
    username: r.username,
  }));
}

/** Just the count — used for the AppHeader notification dot. */
export async function countPendingRequests(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(friendships)
    .where(
      and(
        eq(friendships.recipientId, userId),
        eq(friendships.status, "pending")
      )
    );
  return Number(row?.value ?? 0);
}
