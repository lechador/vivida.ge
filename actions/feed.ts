"use server";

import { and, count, eq, sql } from "drizzle-orm";
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
import { resolveMentions } from "@/lib/mentions";
import {
  awardReputation,
  revokeReputationForSubjects,
  RepSubject,
} from "@/lib/reputation";
import {
  COMMENT_BODY_MAX,
  POST_BODY_MAX,
  POST_EDIT_WINDOW_MS,
} from "@/lib/feed-config";
import {
  listFeedPage,
  listRecentPostsByUserPage,
  loadProfilePhotos,
  type FeedAuthor,
  type FeedPost,
} from "@/lib/feed-core";

// Feed read types/logic live in lib/feed-core so the mobile API
// (app/api/v1/feed) shares them. Re-export the public types here so
// existing component imports from "@/actions/feed" keep working.
export type {
  FeedAuthor,
  FeedPost,
  FeedReactionCounts,
} from "@/lib/feed-core";

/** Minimum gap between a user's posts. Prevents accidental double-submits
 *  and casual spam without blocking honest power-users. */
const POST_THROTTLE_MS = 20_000;
const COMMENT_THROTTLE_MS = 5_000;

/**
 * Fan out `mention` notifications for a post or comment. Resolves the
 * @handles in `body` against real profiles, skips anyone in
 * `excludeUserIds` (always includes the actor + any user already
 * getting a `post_comment` / `post_reaction` notification from the
 * same write — so a comment that pings the post author doesn't
 * double-notify).
 *
 * Best-effort: caller fires-and-forgets inside `after()`. Errors are
 * caught and logged so a flaky DB write can't break the write that
 * already succeeded.
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
    console.warn(
      "[feed.notifyMentions] failed:",
      (err as Error).message
    );
  }
}

export type FeedComment = {
  id: string;
  postId: string;
  /** Parent comment id when this row is a reply, null for top-level. */
  parentId: string | null;
  body: string;
  createdAt: Date;
  author: FeedAuthor;
};

type FeedActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/**
 * Read the most recent posts plus the calling user's reactions in one
 * batched round-trip. Cursor is the createdAt of the last row from the
 * previous page — same shape `/api/feed?cursor=…` would use.
 */
export async function listFeed(
  opts: {
    cursor?: string;
    limit?: number;
  } = {}
): Promise<FeedPost[]> {
  const user = await requireUser();
  return listFeedPage({ viewerId: user.id, ...opts });
}

/**
 * Total posts ever authored by a user. Used on the public profile
 * stats row. Indexed by `post_user_idx`, so this is a cheap lookup
 * even on large feeds.
 */
export async function countPostsByUser(userId: string): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.userId, userId));
  return Number(row?.value ?? 0);
}

/**
 * The most recent N posts by a single user, in the same shape `listFeed`
 * returns so the existing PostCard / FeedList can render them as-is.
 * Used by the "recent activity" section on the public profile.
 */
export async function listRecentPostsByUser(
  userId: string,
  limit = 5
): Promise<FeedPost[]> {
  const viewer = await requireUser();
  return listRecentPostsByUserPage({ viewerId: viewer.id, userId, limit });
}

/**
 * Comments for one post, returned in tree-render order:
 *   top-level (oldest first)
 *     → its replies (oldest first)
 *   next top-level
 *     → its replies
 *
 * The client can render the list as-is using the `parentId` flag for
 * indent. No tree state needed on the server side beyond the ordering
 * — much simpler than nesting in JSON.
 */
export async function listComments(postId: string): Promise<FeedComment[]> {
  await requireUser();
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

  // Batched photo lookup — same "chosen main photo wins over OAuth
  // avatar" rule as the post bylines.
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

  // Two-pass tree ordering: build a parent→children map, then walk
  // top-level rows in order and inline their children. Avoids needing
  // a recursive CTE for the simple one-level nesting we allow.
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
  // Edge case: a parent comment was deleted but a stale reply slipped
  // through (shouldn't happen thanks to ON DELETE CASCADE, but be
  // defensive). Append orphaned replies at the end so they don't
  // disappear silently.
  for (const [parentId, children] of childrenByParent) {
    if (!topLevel.some((t) => t.id === parentId)) {
      ordered.push(...children);
    }
  }
  return ordered;
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

  // Reputation + mention notifications — happen after the response
  // returns so the create call stays snappy. First-post is a one-shot,
  // post_created is daily-capped. Mention fan-out is best-effort.
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
      await notifyMentions({
        body,
        actorId: userId,
        postId,
        context: "post",
        excludeUserIds: [],
      });
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
 *  email allow-list can delete any. Comments/reactions cascade via FK.
 *
 *  Reputation: every event tied to this post and its descendants is
 *  reversed — post_created, reaction_received for every reactor, and
 *  for each cascaded comment its comment_created + comment_received.
 *  Subjects are collected before the DELETE because the cascade
 *  removes the source rows. `first_post` is intentionally not
 *  reversed: it's a one-shot milestone for "you've posted at least
 *  once," and stripping it on delete would let users farm and then
 *  re-farm the bonus by yo-yoing posts. */
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

  // Gather every reputation subject that depends on this post BEFORE
  // the cascade nukes the source rows.
  const [reactors, descendantComments] = await Promise.all([
    db
      .select({ userId: postReactions.userId })
      .from(postReactions)
      .where(eq(postReactions.postId, postId)),
    db
      .select({ id: postComments.id })
      .from(postComments)
      .where(eq(postComments.postId, postId)),
  ]);
  const subjectsToRevoke: Array<{
    kind:
      | "post_created"
      | "reaction_received"
      | "comment_created"
      | "comment_received";
    subjectId: string;
  }> = [
    { kind: "post_created", subjectId: RepSubject.post(postId) },
    ...reactors.map((r) => ({
      kind: "reaction_received" as const,
      subjectId: RepSubject.reactionReceived(postId, r.userId),
    })),
    ...descendantComments.flatMap((c) => [
      {
        kind: "comment_created" as const,
        subjectId: RepSubject.comment(c.id),
      },
      {
        kind: "comment_received" as const,
        subjectId: RepSubject.commentReceived(c.id),
      },
    ]),
  ];

  await db.delete(posts).where(eq(posts.id, postId));

  // Run the revocation off the response path. Even if it fails (DB
  // hiccup, etc.), the delete itself has already succeeded.
  after(async () => {
    await revokeReputationForSubjects(subjectsToRevoke);
  });

  revalidatePath("/feed");
  revalidatePath("/admin/feed");
  return { ok: true };
}

/**
 * Add a comment (or reply) to a post.
 *
 * When `parentCommentId` is provided the row is a reply to that
 * comment, and the notification + reputation credit go to that
 * comment's author instead of the post author. Replies-to-replies are
 * rejected (one-level nesting cap) so threads never devolve into
 * unreadable deep chains.
 */
export async function addComment(
  postId: string,
  rawBody: string,
  parentCommentId: string | null = null
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

  // Validate parent if this is a reply. Must belong to the same post,
  // must itself be top-level (no replies-to-replies).
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
    .values({
      postId,
      userId: user.id,
      body,
      parentId: parent?.id ?? null,
    })
    .returning({ id: postComments.id });

  // Pick the notification recipient: reply → parent comment author;
  // top-level comment → post author. Same self-skip rule for both so
  // commenting on your own post / replying to your own comment stays
  // silent.
  const recipientId = parent ? parent.userId : post.userId;
  if (recipientId !== user.id) {
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
      userId: recipientId,
      kind: "post_comment",
      payload,
    });
    invalidateHeaderForUser(recipientId);
  }

  // Reputation — commenter always earns; the comment "received" credit
  // goes to whoever the reply is aimed at (parent author for replies,
  // post author for top-level comments). Subject = commentId so the
  // dedupe index makes each event fire at most once.
  if (inserted) {
    const commentId = inserted.id;
    const commenterId = user.id;
    const repRecipientId = recipientId;
    after(async () => {
      await awardReputation({
        userId: commenterId,
        kind: "comment_created",
        subjectId: RepSubject.comment(commentId),
      });
      if (repRecipientId !== commenterId) {
        await awardReputation({
          userId: repRecipientId,
          kind: "comment_received",
          subjectId: RepSubject.commentReceived(commentId),
        });
      }
      // Mention notifications. Skip the recipient who already gets a
      // `post_comment` notification from this same write — they don't
      // need a second ping for being mentioned in the comment.
      await notifyMentions({
        body,
        actorId: commenterId,
        postId,
        context: "comment",
        excludeUserIds: repRecipientId !== commenterId ? [repRecipientId] : [],
      });
    });
  }

  revalidatePath("/feed");
  return { ok: true, data: inserted ? { commentId: inserted.id } : undefined };
}

/** Delete a comment. Author OR admin OR post-author (so a poster can
 *  clean up under their own thread).
 *
 *  Reputation: the commenter's comment_created and the recipient's
 *  comment_received are both reversed. If the comment had replies
 *  (top-level → cascade nukes them), each reply's event pair is
 *  reversed too — same scoring rule that applied when they were
 *  awarded. */
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

  // Gather reply ids before the cascade so their reputation events
  // can be reversed too. Top-level comments always have parent_id=null
  // so this query returns the children — for a reply being deleted,
  // there will be none.
  const replyIds = await db
    .select({ id: postComments.id })
    .from(postComments)
    .where(eq(postComments.parentId, commentId));

  const allIds = [commentId, ...replyIds.map((r) => r.id)];
  const subjectsToRevoke = allIds.flatMap((id) => [
    { kind: "comment_created" as const, subjectId: RepSubject.comment(id) },
    {
      kind: "comment_received" as const,
      subjectId: RepSubject.commentReceived(id),
    },
  ]);

  await db.delete(postComments).where(eq(postComments.id, commentId));

  after(async () => {
    await revokeReputationForSubjects(subjectsToRevoke);
  });

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
