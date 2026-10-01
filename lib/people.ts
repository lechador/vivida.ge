import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  ne,
  notInArray,
  or,
  sql,
} from "drizzle-orm";

import { db } from "@/db";
import { friendships, profiles, users } from "@/db/schema";
import { firstReadyPhotoByUser, resolveAvatar } from "./avatars";
import { getBlockedUserIds } from "./block";
import { getResidenceCountryCode, sameCountryFirst } from "./residence";
import type { FriendshipStatus } from "./friendship";
import { hasVerifiedBadge } from "./verified-badge";

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
 * `"<1|0>:<ISO>"` — the country bucket plus the createdAt keyset.
 *
 * A bare ISO string (a cursor issued by the previous version and still held by
 * a client mid-scroll) is read as the same-country bucket, which at
 * worst repeats a few rows once rather than erroring.
 */
function parseCursor(
  raw: string | undefined,
): { sameCountry: boolean; createdAt: Date } | null {
  if (!raw) return null;
  const [head, ...rest] = raw.split(":");
  const isTagged = rest.length > 0 && (head === "0" || head === "1");
  const iso = isTagged ? rest.join(":") : raw;
  const createdAt = new Date(iso);
  if (Number.isNaN(createdAt.getTime())) return null;
  return { sameCountry: isTagged ? head === "1" : true, createdAt };
}

function encodeCursor(row: {
  sameCountry: boolean | null;
  createdAt: Date;
}): string {
  return `${row.sameCountry ? "1" : "0"}:${row.createdAt.toISOString()}`;
}

/**
 * Page of public-profile users for the /people directory.
 *
 * Sorted by the viewer's own residence country first, then `createdAt desc`
 * within each bucket. Prioritise, never filter — see `sameCountryFirst`.
 *
 * Because the country bucket is the PRIMARY sort key it has to be part of the
 * keyset cursor too; paginating on `createdAt` alone would restart at the top
 * of the other bucket and repeat rows.
 *
 * `q` does an ILIKE match against username, display name, and the
 * raw user.name. Min 2 chars; shorter falls through to the unfiltered
 * list so the empty search box renders the directory.
 */
export async function listPeople(
  viewerId: string,
  opts: { cursor?: string; limit?: number; q?: string } = {},
): Promise<{ rows: PersonRow[]; nextCursor: string | null }> {
  const limit = Math.min(Math.max(opts.limit ?? 30, 1), 60);
  const cursor = parseCursor(opts.cursor);
  const trimmed = (opts.q ?? "").trim();
  const viewerCountry = await getResidenceCountryCode(viewerId);
  const sameCountry = sameCountryFirst(viewerCountry);

  // Only surface users who've claimed a public profile (username set) AND
  // haven't opted out of discovery. Skip the viewer themselves so they
  // don't see their own row in the directory.
  //
  // Birth data is the real "has a profile worth browsing" signal: every user
  // gets a username at signup now (lib/username.ts), so username alone no
  // longer distinguishes an onboarded user from someone who registered and
  // stopped. Without this the directory fills with chart-less rows.
  const conditions = [
    ne(users.id, viewerId),
    isNotNull(profiles.username),
    isNotNull(profiles.dateOfBirth),
    eq(profiles.discoverable, true),
  ];
  // A block in EITHER direction removes the row entirely — the profile page
  // already 404s for blocked pairs, so the directory must not keep showing
  // the person's avatar/bio to someone they blocked (or vice versa). Blocks
  // live in `blocks`; blocking deletes the friendship row, so this can't be
  // derived from the friendship statuses fetched below.
  const blockedIds = await getBlockedUserIds(viewerId);
  if (blockedIds.length > 0) conditions.push(notInArray(users.id, blockedIds));
  // Keyset over the composite (country bucket, createdAt) order.
  if (cursor) {
    conditions.push(
      sql`(${sameCountry} < ${cursor.sameCountry} OR (${sameCountry} = ${cursor.sameCountry} AND ${users.createdAt} < ${cursor.createdAt}))`,
    );
  }
  if (trimmed.length >= 2) {
    const pattern = `%${trimmed.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    const search = or(
      ilike(profiles.username, pattern),
      ilike(profiles.displayName, pattern),
      ilike(users.name, pattern),
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
      verifiedBadgeGrantedAt: users.verifiedBadgeGrantedAt,
      sameCountry,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(and(...conditions))
    .orderBy(desc(sameCountry), desc(users.createdAt))
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
          eq(friendships.recipientId, viewerId),
        ),
        or(
          inArray(friendships.requesterId, userIds),
          inArray(friendships.recipientId, userIds),
        ),
      ),
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
    rows: page.map((r) => ({
      id: r.id,
      username: r.username ?? "",
      displayName: r.displayName ?? r.name?.split(" ")[0] ?? null,
      bio: r.bio,
      image: resolveAvatar(r.id, r.image, photos),
      createdAt: r.createdAt,
      verified: hasVerifiedBadge(r),
      friendship: statusByPartner.get(r.id) ?? "none",
    })),
    nextCursor: hasMore ? encodeCursor(page[page.length - 1]) : null,
  };
}
