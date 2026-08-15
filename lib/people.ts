import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  lt,
  ne,
  or,
} from "drizzle-orm";

import { db } from "@/db";
import { friendships, profiles, users } from "@/db/schema";
import { firstReadyPhotoByUser, resolveAvatar } from "./avatars";
import type { FriendshipStatus } from "./friendship";

/**
 * One row in the /people directory list. Shape kept lean — avatar,
 * handle, display name, optional bio, and the viewer's friendship
 * state with this user. Sun sign / reputation are intentionally not
 * here; this is a thin Facebook-style row, not a card.
 */
export type PersonRow = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  image: string | null;
  createdAt: Date;
  verified: boolean;
  friendship: FriendshipStatus;
};

/**
 * Page of public-profile users for the /people directory. Sorted by
 * `lastLoginAt desc` (active users first), with `createdAt desc` as
 * the secondary sort — that's the cursor we paginate on.
 *
 * `q` does an ILIKE match against username, display name, and the
 * raw user.name. Min 2 chars; shorter falls through to the unfiltered
 * list so the empty search box renders the directory.
 */
export async function listPeople(
  viewerId: string,
  opts: { cursor?: string; limit?: number; q?: string } = {}
): Promise<{ rows: PersonRow[]; nextCursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 30, 1), 60);
  const cursor = opts.cursor ? new Date(opts.cursor) : null;
  const trimmed = (opts.q ?? "").trim();

  // Only surface users who've claimed a public profile (username set) AND
  // haven't opted out of discovery. Skip the viewer themselves so they
  // don't see their own row in the directory.
  const conditions = [
    ne(users.id, viewerId),
    isNotNull(profiles.username),
    eq(profiles.discoverable, true),
  ];
  if (cursor) conditions.push(lt(users.createdAt, cursor));
  if (trimmed.length >= 2) {
    const pattern = `%${trimmed.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    const search = or(
      ilike(profiles.username, pattern),
      ilike(profiles.displayName, pattern),
      ilike(users.name, pattern)
    );
    if (search) conditions.push(search);
  }

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      createdAt: users.createdAt,
      username: profiles.username,
      displayName: profiles.displayName,
      bio: profiles.bio,
      isPremium: users.isPremium,
      premiumUntil: users.premiumUntil,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(and(...conditions))
    .orderBy(desc(users.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  if (page.length === 0) return { rows: [], nextCursor: null };

  const userIds = page.map((r) => r.id);

  // Batched friendship lookup: every accepted-or-pending row involving
  // viewer + any of these ids.
  const friendshipRows = await db
    .select({
      requesterId: friendships.requesterId,
      recipientId: friendships.recipientId,
      status: friendships.status,
    })
    .from(friendships)
    .where(
      and(
        or(
          eq(friendships.requesterId, viewerId),
          eq(friendships.recipientId, viewerId)
        ),
        or(
          inArray(friendships.requesterId, userIds),
          inArray(friendships.recipientId, userIds)
        )
      )
    );

  const statusByPartner = new Map<string, FriendshipStatus>();
  for (const r of friendshipRows) {
    const partnerId =
      r.requesterId === viewerId ? r.recipientId : r.requesterId;
    let status: FriendshipStatus;
    if (r.status === "accepted") status = "friends";
    else if (r.status === "blocked") status = "blocked";
    else
      status =
        r.requesterId === viewerId ? "pending_outgoing" : "pending_incoming";
    statusByPartner.set(partnerId, status);
  }

  const photos = await firstReadyPhotoByUser(userIds);

  return {
    rows: page
      // A block in EITHER direction removes the row entirely — the profile
      // page already 404s for blocked pairs, so the directory must not keep
      // showing the person's avatar/bio to someone they blocked (or vice
      // versa). The cursor still advances past hidden rows, so pagination
      // is unaffected.
      .filter((r) => statusByPartner.get(r.id) !== "blocked")
      .map((r) => ({
        id: r.id,
        username: r.username ?? "",
        displayName: r.displayName ?? r.name?.split(" ")[0] ?? null,
        bio: r.bio,
        image: resolveAvatar(r.id, r.image, photos),
        createdAt: r.createdAt,
        verified: Boolean(
          r.isPremium && r.premiumUntil && r.premiumUntil.getTime() > Date.now(),
        ),
        friendship: statusByPartner.get(r.id) ?? "none",
      })),
    nextCursor: hasMore ? page[page.length - 1].createdAt.toISOString() : null,
  };
}
