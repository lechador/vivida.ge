"use server";

import { and, count, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { db } from "@/db";
import {
  notifications,
  postComments,
  postReactions,
  posts,
  profiles,
  users,
  type NotificationPayload,
  type PostReactionKind,
} from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { isAdminEmail } from "@/lib/admin-auth";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { awardReputation, RepSubject } from "@/lib/reputation";
import {
  COMMENT_BODY_MAX,
  POST_BODY_MAX,
  POST_EDIT_WINDOW_MS,
} from "@/lib/feed-config";

/** Minimum gap between a user's posts. Prevents accidental double-submits
 *  and casual spam without blocking honest power-users. */
const POST_THROTTLE_MS = 20_000;
const COMMENT_THROTTLE_MS = 5_000;

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
  /** Sun-sign index (0-11) of the author, derived from profile.dateOfBirth.
   *  Null when the author hasn't set a birth date. Used by the
   *  "ჩემი ნიშნით" filter on /feed without an extra query. */
  authorSunSign: number | null;
  /** Author's running reputation total. Drives the inline tier chip. */
  authorReputation: number;
  reactions: FeedReactionCounts;
  myReaction: PostReactionKind | null;
  commentCount: number;
};

export type FeedComment = {
  id: string;
  postId: string;
  body: string;
  createdAt: Date;
  author: FeedAuthor;
};

const ZERO_COUNTS: FeedReactionCounts = {
  like: 0,
  dislike: 0,
  funny: 0,
  sad: 0,
};

type FeedActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/**
 * Read the most recent posts plus the calling user's reactions in one
 * batched round-trip. Cursor is the createdAt of the last row from the
 * previous page — same shape `/api/feed?cursor=…` would use.
 */
export async function listFeed(opts: {
  cursor?: string;
  limit?: number;
} = {}): Promise<FeedPost[]> {
  const user = await requireUser();
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);

  const cursorDate = opts.cursor ? new Date(opts.cursor) : null;
  const where = cursorDate ? lt(posts.createdAt, cursorDate) : undefined;

  // 1. Fetch the posts + author byline in one join. Postgres handles the
  //    sort via the post_created_at_idx.
  const rows = await db
    .select({
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
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .leftJoin(profiles, eq(profiles.userId, posts.userId))
    .where(where)
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  if (rows.length === 0) return [];

  const postIds = rows.map((r) => r.id);
  const authorIds = Array.from(new Set(rows.map((r) => r.authorId)));

  // 2. Aggregate reaction counts and the viewer's own reaction. Two
  //    queries instead of N+1 — once per page.
  const { getReputationFor } = await import("@/lib/reputation");
  const [counts, mine, comments, reputations] = await Promise.all([
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
      .select({
        postId: postReactions.postId,
        kind: postReactions.kind,
      })
      .from(postReactions)
      .where(
        and(
          inArray(postReactions.postId, postIds),
          eq(postReactions.userId, user.id)
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
      name: r.authorName,
      image: r.authorImage,
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

/** Sun-sign index (0-11) from a YYYY-MM-DD birth date. Tropical zodiac
 *  with the standard month-day cutoffs. Null when the input is empty or
 *  unparseable. Defined inline rather than imported from lib/astrology
 *  to keep this file self-contained for the feed query path. */
function sunSignFromDob(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
  if (!m) return null;
  const month = Number(m[2]);
  const day = Number(m[3]);
  // (month, day after this start) → sign index
  const CUTOFFS: Array<[number, number, number]> = [
    [3, 21, 0],   // Aries
    [4, 20, 1],   // Taurus
    [5, 21, 2],   // Gemini
    [6, 22, 3],   // Cancer
    [7, 23, 4],   // Leo
    [8, 23, 5],   // Virgo
    [9, 23, 6],   // Libra
    [10, 23, 7],  // Scorpio
    [11, 22, 8],  // Sagittarius
    [12, 22, 9],  // Capricorn
    [1, 20, 10],  // Aquarius
    [2, 19, 11],  // Pisces
  ];
  // Pisces wraps: anything before Mar 21 is Pisces (11) unless it's after Jan 20.
  for (const [cm, cd, idx] of CUTOFFS) {
    if (month === cm && day >= cd) return idx;
    if (month === cm + 1 && day < (CUTOFFS[(idx + 1) % 12]?.[1] ?? 31))
      return idx;
  }
  // Fallback: rough month → sign mapping using start-of-month cutoffs.
  // Should never hit thanks to the loop above, but defends against bad input.
  return ((month + 9) % 12);
}

/** Comments for one post, oldest first. Always returned in full — we
 *  don't paginate comments in v1 since the cap stays small per post. */
export async function listComments(postId: string): Promise<FeedComment[]> {
  await requireUser();
  const rows = await db
    .select({
      id: postComments.id,
      postId: postComments.postId,
      body: postComments.body,
      createdAt: postComments.createdAt,
      authorId: users.id,
      authorName: users.name,
      authorImage: users.image,
      authorUsername: profiles.username,
      authorDisplayName: profiles.displayName,
    })
    .from(postComments)
    .innerJoin(users, eq(users.id, postComments.userId))
    .leftJoin(profiles, eq(profiles.userId, postComments.userId))
    .where(eq(postComments.postId, postId))
    .orderBy(postComments.createdAt);

  return rows.map((r) => ({
    id: r.id,
    postId: r.postId,
    body: r.body,
    createdAt: r.createdAt,
    author: {
      id: r.authorId,
      name: r.authorName,
      image: r.authorImage,
      username: r.authorUsername,
      displayName: r.authorDisplayName,
    },
  }));
}

/** Create a post. Caps at POST_BODY_MAX characters and throttles per
 *  user so a stuck submit button can't flood the feed. */
export async function createPost(rawBody: string): Promise<FeedActionResult> {
  const user = await requireUser();
  const body = rawBody.trim();
  if (!body) return { ok: false, error: "ცარიელ პოსტს ვერ გავგზავნით" };
  if (body.length > POST_BODY_MAX) {
    return {
      ok: false,
      error: `მაქსიმუმ ${POST_BODY_MAX} სიმბოლო — შენ შეიყვანე ${body.length}.`,
    };
  }

  // Throttle: same user can't post twice within POST_THROTTLE_MS.
  const cutoff = new Date(Date.now() - POST_THROTTLE_MS);
  const [recent] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.userId, user.id), sql`${posts.createdAt} > ${cutoff}`))
    .limit(1);
  if (recent) {
    return {
      ok: false,
      error: "ცოტა დაიცადე — წინა პოსტი ახლახან გააგზავნე.",
    };
  }

  const [inserted] = await db
    .insert(posts)
    .values({ userId: user.id, body })
    .returning({ id: posts.id });

  // Reputation — happens after the response returns so the create call
  // stays snappy. First-post is a one-shot, post_created is daily-capped.
  if (inserted) {
    const postId = inserted.id;
    const userId = user.id;
    after(async () => {
      await awardReputation({
        userId,
        kind: "post_created",
        subjectId: RepSubject.post(postId),
      });
      // Detect "first post ever" by counting posts. Cheap because of the
      // user_id index on `post`.
      const [{ value: postCount } = { value: 0 }] = await db
        .select({ value: count() })
        .from(posts)
        .where(eq(posts.userId, userId));
      if (Number(postCount) === 1) {
        await awardReputation({
          userId,
          kind: "first_post",
          subjectId: RepSubject.oneShot(userId),
        });
      }
    });
  }
  revalidatePath("/feed");
  return { ok: true };
}

/** Edit a post within the 5-minute grace window. Author only. Sets the
 *  `edited` flag so the UI can show "(რედაქტირებული)" without storing
 *  a separate edit timestamp. The window itself lives in
 *  `lib/feed-config.ts` so the client can hide the edit menu after it
 *  closes without round-tripping. */
export async function editPost(
  postId: string,
  rawBody: string
): Promise<FeedActionResult> {
  const user = await requireUser();
  const body = rawBody.trim();
  if (!body) return { ok: false, error: "ცარიელ პოსტს ვერ შევინახავთ" };
  if (body.length > POST_BODY_MAX) {
    return {
      ok: false,
      error: `მაქსიმუმ ${POST_BODY_MAX} სიმბოლო — შენ შეიყვანე ${body.length}.`,
    };
  }

  const [post] = await db
    .select({ userId: posts.userId, createdAt: posts.createdAt })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  if (!post) return { ok: false, error: "პოსტი ვერ მოიძებნა" };
  if (post.userId !== user.id) {
    return { ok: false, error: "მხოლოდ ავტორი ცვლის თავის პოსტს" };
  }
  if (Date.now() - post.createdAt.getTime() > POST_EDIT_WINDOW_MS) {
    return {
      ok: false,
      error: "რედაქტირების დრო (5 წუთი) გავიდა",
    };
  }

  await db
    .update(posts)
    .set({ body, edited: true })
    .where(eq(posts.id, postId));
  revalidatePath("/feed");
  return { ok: true };
}

/** Delete a post. Author can delete their own; anyone in the admin
 *  email allow-list can delete any. Comments/reactions cascade via FK. */
export async function deletePost(postId: string): Promise<FeedActionResult> {
  const user = await requireUser();

  const [post] = await db
    .select({ userId: posts.userId })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  if (!post) return { ok: false, error: "პოსტი ვერ მოიძებნა" };

  const isOwner = post.userId === user.id;
  const isAdmin = isAdminEmail(user.email);
  if (!isOwner && !isAdmin) {
    return { ok: false, error: "წაშლის უფლება არ გაქვს" };
  }

  await db.delete(posts).where(eq(posts.id, postId));
  revalidatePath("/feed");
  revalidatePath("/admin/feed");
  return { ok: true };
}

/** Add a comment to a post. Notifies the post author (skipped when
 *  commenting on your own post) via the in-app notification stream. */
export async function addComment(
  postId: string,
  rawBody: string
): Promise<FeedActionResult<{ commentId: string }>> {
  const user = await requireUser();
  const body = rawBody.trim();
  if (!body) return { ok: false, error: "ცარიელ კომენტარს ვერ გავგზავნით" };
  if (body.length > COMMENT_BODY_MAX) {
    return {
      ok: false,
      error: `მაქსიმუმ ${COMMENT_BODY_MAX} სიმბოლო — შენ შეიყვანე ${body.length}.`,
    };
  }

  const [post] = await db
    .select({ id: posts.id, userId: posts.userId })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  if (!post) return { ok: false, error: "პოსტი ვერ მოიძებნა" };

  const cutoff = new Date(Date.now() - COMMENT_THROTTLE_MS);
  const [recent] = await db
    .select({ id: postComments.id })
    .from(postComments)
    .where(
      and(
        eq(postComments.userId, user.id),
        sql`${postComments.createdAt} > ${cutoff}`
      )
    )
    .limit(1);
  if (recent) {
    return { ok: false, error: "ცოტა დაიცადე — ახლახან დაწერე." };
  }

  const [inserted] = await db
    .insert(postComments)
    .values({ postId, userId: user.id, body })
    .returning({ id: postComments.id });

  // Notify the post author. Skip self-comments — getting a notification
  // every time you reply on your own post is noise.
  if (post.userId !== user.id) {
    const [actor] = await db
      .select({
        name: users.name,
        image: users.image,
        displayName: profiles.displayName,
        username: profiles.username,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(users.id, user.id))
      .limit(1);
    const payload: NotificationPayload = {
      fromUserId: user.id,
      fromUsername: actor?.username ?? null,
      fromName: actor?.displayName ?? actor?.name ?? null,
      fromImage: actor?.image ?? null,
      postId,
      preview: body.slice(0, 120),
    };
    await db.insert(notifications).values({
      userId: post.userId,
      kind: "post_comment",
      payload,
    });
    invalidateHeaderForUser(post.userId);
  }

  // Reputation — commenter for the act, post author for receiving a
  // comment (skip when commenting on your own post).
  if (inserted) {
    const commentId = inserted.id;
    const commenterId = user.id;
    const postAuthorId = post.userId;
    after(async () => {
      await awardReputation({
        userId: commenterId,
        kind: "comment_created",
        subjectId: RepSubject.comment(commentId),
      });
      if (postAuthorId !== commenterId) {
        await awardReputation({
          userId: postAuthorId,
          kind: "comment_received",
          subjectId: RepSubject.commentReceived(commentId),
        });
      }
    });
  }

  revalidatePath("/feed");
  return { ok: true, data: inserted ? { commentId: inserted.id } : undefined };
}

/** Delete a comment. Author OR admin OR post-author (so a poster can
 *  clean up under their own thread). */
export async function deleteComment(
  commentId: string
): Promise<FeedActionResult> {
  const user = await requireUser();
  const [row] = await db
    .select({
      commentUserId: postComments.userId,
      postUserId: posts.userId,
    })
    .from(postComments)
    .innerJoin(posts, eq(posts.id, postComments.postId))
    .where(eq(postComments.id, commentId))
    .limit(1);
  if (!row) return { ok: false, error: "კომენტარი ვერ მოიძებნა" };

  const isOwner = row.commentUserId === user.id;
  const isPostAuthor = row.postUserId === user.id;
  const isAdmin = isAdminEmail(user.email);
  if (!isOwner && !isPostAuthor && !isAdmin) {
    return { ok: false, error: "წაშლის უფლება არ გაქვს" };
  }

  await db.delete(postComments).where(eq(postComments.id, commentId));
  revalidatePath("/feed");
  revalidatePath("/admin/feed");
  return { ok: true };
}

/**
 * Toggle a reaction on a post. Behaviour:
 *  - No existing reaction → insert
 *  - Same kind exists → remove (toggle off)
 *  - Different kind exists → switch in place
 *
 * Composite PK on (postId, userId) makes the switch a single upsert.
 */
export async function reactToPost(
  postId: string,
  kind: PostReactionKind
): Promise<FeedActionResult<{ active: PostReactionKind | null }>> {
  const user = await requireUser();

  const [existing] = await db
    .select({ kind: postReactions.kind })
    .from(postReactions)
    .where(
      and(
        eq(postReactions.postId, postId),
        eq(postReactions.userId, user.id)
      )
    )
    .limit(1);

  if (existing?.kind === kind) {
    await db
      .delete(postReactions)
      .where(
        and(
          eq(postReactions.postId, postId),
          eq(postReactions.userId, user.id)
        )
      );
    revalidatePath("/feed");
    return { ok: true, data: { active: null } };
  }

  await db
    .insert(postReactions)
    .values({ postId, userId: user.id, kind })
    .onConflictDoUpdate({
      target: [postReactions.postId, postReactions.userId],
      set: { kind, createdAt: new Date() },
    });

  // Notify + award reputation when this is a fresh reaction (no prior
  // record). Switching kind from like → sad doesn't re-fire either, so
  // a back-and-forth tap can't spam notifications. The reputation
  // dedupe also makes switching kinds award only once per reactor-post
  // pair (subject = `${postId}:${reactorId}`).
  if (!existing) {
    const [post] = await db
      .select({ userId: posts.userId })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (post && post.userId !== user.id) {
      const [actor] = await db
        .select({
          name: users.name,
          image: users.image,
          displayName: profiles.displayName,
          username: profiles.username,
        })
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(eq(users.id, user.id))
        .limit(1);
      const payload: NotificationPayload = {
        fromUserId: user.id,
        fromUsername: actor?.username ?? null,
        fromName: actor?.displayName ?? actor?.name ?? null,
        fromImage: actor?.image ?? null,
        postId,
        reaction: kind,
      };
      await db.insert(notifications).values({
        userId: post.userId,
        kind: "post_reaction",
        payload,
      });
      invalidateHeaderForUser(post.userId);

      const postAuthorId = post.userId;
      const reactorId = user.id;
      after(async () => {
        await awardReputation({
          userId: postAuthorId,
          kind: "reaction_received",
          subjectId: RepSubject.reactionReceived(postId, reactorId),
        });
      });
    }
  }

  revalidatePath("/feed");
  return { ok: true, data: { active: kind } };
}
