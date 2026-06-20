import { and, asc, desc, eq, inArray, lt, notInArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { getBlockedUserIds } from "@/lib/block";
import {
  postComments,
  postReactions,
  posts,
  profilePhotos,
  profiles,
  users,
  type PostReactionKind,
} from "@/db/schema";

/**
 * Framework-agnostic feed read logic, shared by the website (Server
 * Actions in actions/feed.ts) and the mobile API (app/api/v1/feed).
 * Callers do their own auth (requireUser / requireMobileUser) and pass
 * the resolved viewer id in — these functions never touch sessions.
 */

export type FeedAuthor = {
  id: string;
  name: string | null;
  image: string | null;
  username: string | null;
  displayName: string | null;
};

export type FeedReactionCounts = Record<PostReactionKind, number>;

export type FeedPost = {
  id: string;
  body: string;
  edited: boolean;
  createdAt: Date;
  author: FeedAuthor;
  /** Sun-sign index (0-11) of the author, or null when no birth date. */
  authorSunSign: number | null;
  authorReputation: number;
  reactions: FeedReactionCounts;
  myReaction: PostReactionKind | null;
  commentCount: number;
};

export const ZERO_COUNTS: FeedReactionCounts = {
  like: 0,
  dislike: 0,
  funny: 0,
  sad: 0,
};

/** Columns selected for a feed row — shared by every feed query. */
const POST_SELECT = {
  id: posts.id,
  body: posts.body,
  edited: posts.edited,
  createdAt: posts.createdAt,
  authorId: users.id,
  authorName: users.name,
  authorImage: users.image,
  authorUsername: profiles.username,
  authorDisplayName: profiles.displayName,
  authorDob: profiles.dateOfBirth,
};

type PostRow = {
  id: string;
  body: string;
  edited: boolean;
  createdAt: Date;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
  authorUsername: string | null;
  authorDisplayName: string | null;
  authorDob: string | null;
};

/**
 * Batched "main profile photo URL by user id" — the first ready
 * profile_photo row (lowest sortOrder) overrides the OAuth avatar.
 */
export async function loadProfilePhotos(
  userIds: string[]
): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const rows = await db
    .select({ userId: profilePhotos.userId, url: profilePhotos.url })
    .from(profilePhotos)
    .where(
      and(inArray(profilePhotos.userId, userIds), eq(profilePhotos.ready, true))
    )
    .orderBy(asc(profilePhotos.sortOrder));
  const map = new Map<string, string>();
  for (const r of rows) {
    if (!map.has(r.userId)) map.set(r.userId, r.url);
  }
  return map;
}

/**
 * Enrich raw post rows with reaction counts, the viewer's own reaction,
 * comment counts, author reputation, and chosen avatars — five batched
 * queries per page instead of N+1.
 */
async function enrichPostRows(
  viewerId: string,
  rows: PostRow[]
): Promise<FeedPost[]> {
  if (rows.length === 0) return [];

  const postIds = rows.map((r) => r.id);
  const authorIds = Array.from(new Set(rows.map((r) => r.authorId)));

  const { getReputationFor } = await import("@/lib/reputation");
  const [counts, mine, comments, reputations, photos] = await Promise.all([
    db
      .select({
        postId: postReactions.postId,
        kind: postReactions.kind,
        count: sql<number>`count(*)::int`,
      })
      .from(postReactions)
      .where(inArray(postReactions.postId, postIds))
      .groupBy(postReactions.postId, postReactions.kind),
    db
      .select({ postId: postReactions.postId, kind: postReactions.kind })
      .from(postReactions)
      .where(
        and(
          inArray(postReactions.postId, postIds),
          eq(postReactions.userId, viewerId)
        )
      ),
    db
      .select({
        postId: postComments.postId,
        count: sql<number>`count(*)::int`,
      })
      .from(postComments)
      .where(inArray(postComments.postId, postIds))
      .groupBy(postComments.postId),
    getReputationFor(authorIds),
    loadProfilePhotos(authorIds),
  ]);

  const countMap = new Map<string, FeedReactionCounts>();
  for (const id of postIds) countMap.set(id, { ...ZERO_COUNTS });
  for (const row of counts) {
    const bucket = countMap.get(row.postId);
    if (bucket) bucket[row.kind] = Number(row.count);
  }

  const mineMap = new Map<string, PostReactionKind>();
  for (const row of mine) mineMap.set(row.postId, row.kind);

  const commentMap = new Map<string, number>();
  for (const row of comments) commentMap.set(row.postId, Number(row.count));

  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    edited: r.edited,
    createdAt: r.createdAt,
    author: {
      id: r.authorId,
      // Prefer the user's chosen main photo; fall back to the OAuth avatar.
      name: r.authorName,
      image: photos.get(r.authorId) ?? r.authorImage,
      username: r.authorUsername,
      displayName: r.authorDisplayName,
    },
    authorSunSign: sunSignFromDob(r.authorDob),
    authorReputation: reputations.get(r.authorId) ?? 0,
    reactions: countMap.get(r.id) ?? { ...ZERO_COUNTS },
    myReaction: mineMap.get(r.id) ?? null,
    commentCount: commentMap.get(r.id) ?? 0,
  }));
}

/**
 * One page of the global feed, newest first. Cursor is the createdAt of
 * the last row from the previous page.
 */
export async function listFeedPage(opts: {
  viewerId: string;
  cursor?: string;
  limit?: number;
}): Promise<FeedPost[]> {
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);
  const cursorDate = opts.cursor ? new Date(opts.cursor) : null;

  // Hide posts authored by anyone in a block relationship with the viewer
  // (either direction). Cheap at our scale; revisit with a join if blocks
  // ever number in the thousands per user.
  const blockedIds = await getBlockedUserIds(opts.viewerId);
  const conditions = [
    cursorDate ? lt(posts.createdAt, cursorDate) : undefined,
    blockedIds.length ? notInArray(posts.userId, blockedIds) : undefined,
  ].filter(Boolean);
  const where = conditions.length ? and(...conditions) : undefined;

  const rows = await db
    .select(POST_SELECT)
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .leftJoin(profiles, eq(profiles.userId, posts.userId))
    .where(where)
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  return enrichPostRows(opts.viewerId, rows);
}

/** A single post in the same enriched shape as the feed, or null if gone. */
export async function getPostForViewer(
  viewerId: string,
  postId: string
): Promise<FeedPost | null> {
  const rows = await db
    .select(POST_SELECT)
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .leftJoin(profiles, eq(profiles.userId, posts.userId))
    .where(eq(posts.id, postId))
    .limit(1);

  const [post] = await enrichPostRows(viewerId, rows);
  return post ?? null;
}

/** The most recent N posts by a single user, in the same shape as the feed. */
export async function listRecentPostsByUserPage(opts: {
  viewerId: string;
  userId: string;
  limit?: number;
}): Promise<FeedPost[]> {
  const limit = Math.min(Math.max(opts.limit ?? 5, 1), 20);

  const rows = await db
    .select(POST_SELECT)
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .leftJoin(profiles, eq(profiles.userId, posts.userId))
    .where(eq(posts.userId, opts.userId))
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  return enrichPostRows(opts.viewerId, rows);
}

/**
 * Sun-sign index (0-11) from a YYYY-MM-DD birth date. Tropical zodiac with
 * standard month-day cutoffs. Null when the input is empty/unparseable.
 */
export function sunSignFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const month = Number(m[2]);
  const day = Number(m[3]);
  const CUTOFFS: Array<[number, number, number]> = [
    [3, 21, 0], // Aries
    [4, 20, 1], // Taurus
    [5, 21, 2], // Gemini
    [6, 22, 3], // Cancer
    [7, 23, 4], // Leo
    [8, 23, 5], // Virgo
    [9, 23, 6], // Libra
    [10, 23, 7], // Scorpio
    [11, 22, 8], // Sagittarius
    [12, 22, 9], // Capricorn
    [1, 20, 10], // Aquarius
    [2, 19, 11], // Pisces
  ];
  for (const [cm, cd, idx] of CUTOFFS) {
    if (month === cm && day >= cd) return idx;
    if (month === cm + 1 && day < (CUTOFFS[(idx + 1) % 12]?.[1] ?? 31))
      return idx;
  }
  return (month + 9) % 12;
}
