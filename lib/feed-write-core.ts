import { and, count, eq, sql } from "drizzle-orm";
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
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { resolveMentions } from "@/lib/mentions";
import {
  awardReputation,
  revokeReputationForSubjects,
  RepSubject,
} from "@/lib/reputation";
import { COMMENT_BODY_MAX, POST_BODY_MAX } from "@/lib/feed-config";
import { loadProfilePhotos, type FeedAuthor } from "@/lib/feed-core";

/**
 * Framework-agnostic feed *write* logic — the create/comment/react paths
 * shared by the website (Server Actions in actions/feed.ts) and the mobile
 * API (app/api/v1/posts/*). Callers do their own auth and pass the resolved
 * actor id in; these functions never touch sessions or revalidate Next's
 * cache (that stays in the web action wrappers).
 *
 * Errors come back as `{ ok: false, error }` with the same Georgian strings
 * the website already shows, so web and mobile surface identical copy.
 */

/** Minimum gap between a user's posts / comments — anti-spam throttles. */
const POST_THROTTLE_MS = 20_000;
const COMMENT_THROTTLE_MS = 5_000;

export type FeedComment = {
  id: string;
  postId: string;
  /** Parent comment id when this row is a reply, null for top-level. */
  parentId: string | null;
  body: string;
  createdAt: Date;
  author: FeedAuthor;
};

export type FeedActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/**
 * Fan out `mention` notifications for a post or comment. Best-effort:
 * called inside `after()`, errors are caught and logged so a flaky write
 * can't break the write that already succeeded.
 */
async function notifyMentions(opts: {
  body: string;
  actorId: string;
  postId: string;
  context: "post" | "comment";
  excludeUserIds: string[];
}): Promise<void> {
  try {
    const targets = await resolveMentions(opts.body, {
      excludeUserIds: [opts.actorId, ...opts.excludeUserIds],
    });
    if (targets.length === 0) return;

    const [actor] = await db
      .select({
        name: users.name,
        image: users.image,
        displayName: profiles.displayName,
        username: profiles.username,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(users.id, opts.actorId))
      .limit(1);

    const preview = opts.body.slice(0, 120);
    const rows = targets.map((t) => ({
      userId: t.userId,
      kind: "mention" as const,
      payload: {
        fromUserId: opts.actorId,
        fromUsername: actor?.username ?? null,
        fromName: actor?.displayName ?? actor?.name ?? null,
        fromImage: actor?.image ?? null,
        postId: opts.postId,
        preview,
        mentionContext: opts.context,
      } satisfies NotificationPayload,
    }));
    await db.insert(notifications).values(rows);
    for (const t of targets) invalidateHeaderForUser(t.userId);
  } catch (err) {
    console.warn("[feed.notifyMentions] failed:", (err as Error).message);
  }
}

/** Create a post. Caps at POST_BODY_MAX and throttles per user. */
export async function createPostCore(
  userId: string,
  rawBody: string
): Promise<FeedActionResult<{ postId: string }>> {
  const body = rawBody.trim();
  if (!body) return { ok: false, error: "ცარიელ პოსტს ვერ გავგზავნით" };
  if (body.length > POST_BODY_MAX) {
    return {
      ok: false,
      error: `მაქსიმუმ ${POST_BODY_MAX} სიმბოლო — შენ შეიყვანე ${body.length}.`,
    };
  }

  const cutoff = new Date(Date.now() - POST_THROTTLE_MS);
  const [recent] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.userId, userId), sql`${posts.createdAt} > ${cutoff}`))
    .limit(1);
  if (recent) {
    return { ok: false, error: "ცოტა დაიცადე — წინა პოსტი ახლახან გააგზავნე." };
  }

  const [inserted] = await db
    .insert(posts)
    .values({ userId, body })
    .returning({ id: posts.id });

  if (inserted) {
    const postId = inserted.id;
    after(async () => {
      await awardReputation({
        userId,
        kind: "post_created",
        subjectId: RepSubject.post(postId),
      });
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
      await notifyMentions({
        body,
        actorId: userId,
        postId,
        context: "post",
        excludeUserIds: [],
      });
    });
  }

  return {
    ok: true,
    data: inserted ? { postId: inserted.id } : undefined,
  };
}

/**
 * Add a comment (or reply) to a post. One-level nesting only — a reply to
 * a reply is rejected.
 */
export async function addCommentCore(
  userId: string,
  postId: string,
  rawBody: string,
  parentCommentId: string | null = null
): Promise<FeedActionResult<{ commentId: string }>> {
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

  let parent: { id: string; userId: string; parentId: string | null } | null =
    null;
  if (parentCommentId) {
    const [row] = await db
      .select({
        id: postComments.id,
        userId: postComments.userId,
        parentId: postComments.parentId,
        postId: postComments.postId,
      })
      .from(postComments)
      .where(eq(postComments.id, parentCommentId))
      .limit(1);
    if (!row || row.postId !== postId) {
      return { ok: false, error: "კომენტარი ვერ მოიძებნა" };
    }
    if (row.parentId) {
      return {
        ok: false,
        error: "პასუხების პასუხი ჯერ არ შეიძლება — უპასუხე ძირითად კომენტარს.",
      };
    }
    parent = { id: row.id, userId: row.userId, parentId: row.parentId };
  }

  const cutoff = new Date(Date.now() - COMMENT_THROTTLE_MS);
  const [recent] = await db
    .select({ id: postComments.id })
    .from(postComments)
    .where(
      and(
        eq(postComments.userId, userId),
        sql`${postComments.createdAt} > ${cutoff}`
      )
    )
    .limit(1);
  if (recent) return { ok: false, error: "ცოტა დაიცადე — ახლახან დაწერე." };

  const [inserted] = await db
    .insert(postComments)
    .values({ postId, userId, body, parentId: parent?.id ?? null })
    .returning({ id: postComments.id });

  const recipientId = parent ? parent.userId : post.userId;
  if (recipientId !== userId) {
    const [actor] = await db
      .select({
        name: users.name,
        image: users.image,
        displayName: profiles.displayName,
        username: profiles.username,
      })
      .from(users)
      .leftJoin(profiles, eq(profiles.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);
    const payload: NotificationPayload = {
      fromUserId: userId,
      fromUsername: actor?.username ?? null,
      fromName: actor?.displayName ?? actor?.name ?? null,
      fromImage: actor?.image ?? null,
      postId,
      preview: body.slice(0, 120),
    };
    await db.insert(notifications).values({
      userId: recipientId,
      kind: "post_comment",
      payload,
    });
    invalidateHeaderForUser(recipientId);
  }

  if (inserted) {
    const commentId = inserted.id;
    const repRecipientId = recipientId;
    after(async () => {
      await awardReputation({
        userId,
        kind: "comment_created",
        subjectId: RepSubject.comment(commentId),
      });
      if (repRecipientId !== userId) {
        await awardReputation({
          userId: repRecipientId,
          kind: "comment_received",
          subjectId: RepSubject.commentReceived(commentId),
        });
      }
      await notifyMentions({
        body,
        actorId: userId,
        postId,
        context: "comment",
        excludeUserIds: repRecipientId !== userId ? [repRecipientId] : [],
      });
    });
  }

  return {
    ok: true,
    data: inserted ? { commentId: inserted.id } : undefined,
  };
}

/**
 * Toggle a reaction on a post:
 *  - none → insert; same kind → remove; different kind → switch in place.
 */
export async function reactToPostCore(
  userId: string,
  postId: string,
  kind: PostReactionKind
): Promise<FeedActionResult<{ active: PostReactionKind | null }>> {
  const [existing] = await db
    .select({ kind: postReactions.kind })
    .from(postReactions)
    .where(
      and(eq(postReactions.postId, postId), eq(postReactions.userId, userId))
    )
    .limit(1);

  if (existing?.kind === kind) {
    await db
      .delete(postReactions)
      .where(
        and(eq(postReactions.postId, postId), eq(postReactions.userId, userId))
      );
    return { ok: true, data: { active: null } };
  }

  await db
    .insert(postReactions)
    .values({ postId, userId, kind })
    .onConflictDoUpdate({
      target: [postReactions.postId, postReactions.userId],
      set: { kind, createdAt: new Date() },
    });

  if (!existing) {
    const [post] = await db
      .select({ userId: posts.userId })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (post && post.userId !== userId) {
      const [actor] = await db
        .select({
          name: users.name,
          image: users.image,
          displayName: profiles.displayName,
          username: profiles.username,
        })
        .from(users)
        .leftJoin(profiles, eq(profiles.userId, users.id))
        .where(eq(users.id, userId))
        .limit(1);
      const payload: NotificationPayload = {
        fromUserId: userId,
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
      after(async () => {
        await awardReputation({
          userId: postAuthorId,
          kind: "reaction_received",
          subjectId: RepSubject.reactionReceived(postId, userId),
        });
      });
    }
  }

  return { ok: true, data: { active: kind } };
}

/**
 * Comments for one post in tree-render order (top-level oldest-first, each
 * followed by its replies). One-level nesting, so no recursive CTE needed.
 */
export async function listCommentsCore(postId: string): Promise<FeedComment[]> {
  const rows = await db
    .select({
      id: postComments.id,
      postId: postComments.postId,
      parentId: postComments.parentId,
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

  const authorIds = Array.from(new Set(rows.map((r) => r.authorId)));
  const photos = await loadProfilePhotos(authorIds);

  const toView = (r: (typeof rows)[number]): FeedComment => ({
    id: r.id,
    postId: r.postId,
    parentId: r.parentId,
    body: r.body,
    createdAt: r.createdAt,
    author: {
      id: r.authorId,
      name: r.authorName,
      image: photos.get(r.authorId) ?? r.authorImage,
      username: r.authorUsername,
      displayName: r.authorDisplayName,
    },
  });

  const childrenByParent = new Map<string, FeedComment[]>();
  const topLevel: FeedComment[] = [];
  for (const r of rows) {
    const view = toView(r);
    if (view.parentId) {
      const list = childrenByParent.get(view.parentId) ?? [];
      list.push(view);
      childrenByParent.set(view.parentId, list);
    } else {
      topLevel.push(view);
    }
  }

  const ordered: FeedComment[] = [];
  for (const parent of topLevel) {
    ordered.push(parent);
    const children = childrenByParent.get(parent.id);
    if (children) ordered.push(...children);
  }
  for (const [parentId, children] of childrenByParent) {
    if (!topLevel.some((t) => t.id === parentId)) {
      ordered.push(...children);
    }
  }
  return ordered;
}

export { revokeReputationForSubjects, RepSubject };
