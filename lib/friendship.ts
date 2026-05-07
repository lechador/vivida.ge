import { and, count, desc, eq, or } from "drizzle-orm";

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
  isPublic: boolean;
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
      isPublic: r.profile?.isPublic ?? false,
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
    isPublic: r.profile?.isPublic ?? false,
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
    isPublic: r.profile?.isPublic ?? false,
    since: r.friendship.createdAt,
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
