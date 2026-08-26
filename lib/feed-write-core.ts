import { and, count, eq, sql } from "drizzle-orm";
import { after } from "next/server";

import { db } from "@/db";
import { isAccountRestricted, RESTRICTED_MESSAGE } from "@/lib/restriction";
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
import { isAdminEmail } from "@/lib/admin-auth";
import { sendFeedActivityEmail } from "@/lib/email";
import { queueNotificationPush } from "@/lib/notification-push";
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
import { loadProfilePhotos, type FeedAuthor } from "@/lib/feed-core";
import { hasVerifiedBadge } from "@/lib/verified-badge";

/** Identity an edit/delete acts on — id for ownership, email for admin. */
export type FeedActor = { id: string; email: string | null | undefined };

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
    for (const r of rows) queueNotificationPush(r.userId, r.kind, r.payload);
  } catch (err) {
    console.warn("[feed.notifyMentions] failed:", (err as Error).message);
  }
}

/**
 * In-app bell + web-push + (if the recipient has been away ≥1h) email for a
 * feed comment or reaction. Dedupes recipients and never notifies the actor.
 */
async function notifyFeedActivity(opts: {
  recipientIds: string[];
  actorId: string;
  kind: "post_comment" | "post_reaction";
  postId: string;
  preview?: string;
  reaction?: PostReactionKind;
}): Promise<void> {
  const recipients = [...new Set(opts.recipientIds)].filter(
    (id) => id !== opts.actorId
  );
  if (recipients.length === 0) return;

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

  const fromName = actor?.displayName ?? actor?.name ?? "Vivida-ის წევრი";
  const payload: NotificationPayload = {
    fromUserId: opts.actorId,
    fromUsername: actor?.username ?? null,
    fromName: actor?.displayName ?? actor?.name ?? null,
    fromImage: actor?.image ?? null,
    postId: opts.postId,
    preview: opts.preview,
    reaction: opts.reaction,
  };

  await db.insert(notifications).values(
    recipients.map((userId) => ({
      userId,
      kind: opts.kind,
      payload,
    }))
  );
  for (const id of recipients) {
    invalidateHeaderForUser(id);
    queueNotificationPush(id, opts.kind, payload);
  }

  after(async () => {
    for (const id of recipients) {
      try {
        await sendFeedActivityEmail({
          recipientUserId: id,
          kind: opts.kind,
          fromName,
          fromUsername: actor?.username ?? null,
          postId: opts.postId,
          preview: opts.preview,
          reaction: opts.reaction,
        });
      } catch (err) {
        console.warn(
          "[feed.notifyFeedActivity] email failed:",
          (err as Error).message
        );
      }
    }
  });
}

/** Create a post. Caps at POST_BODY_MAX and throttles per user. */
export async function createPostCore(
  userId: string,
  rawBody: string
): Promise<FeedActionResult<{ postId: string }>> {
  if (await isAccountRestricted(userId)) {
    return { ok: false, error: RESTRICTED_MESSAGE };
  }
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
  if (await isAccountRestricted(userId)) {
    return { ok: false, error: RESTRICTED_MESSAGE };
  }
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

  const recipientIds = [post.userId];
  if (parent) recipientIds.push(parent.userId);
  await notifyFeedActivity({
    recipientIds,
    actorId: userId,
    kind: "post_comment",
    postId,
    preview: body.slice(0, 120),
  });

  if (inserted) {
    const commentId = inserted.id;
    const repRecipientId = parent ? parent.userId : post.userId;
    const mentionExclude = [...new Set(recipientIds)].filter(
      (id) => id !== userId
    );
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
        excludeUserIds: mentionExclude,
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
      await notifyFeedActivity({
        recipientIds: [post.userId],
        actorId: userId,
        kind: "post_reaction",
        postId,
        reaction: kind,
      });

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
      authorIsPremium: users.isPremium,
      authorPremiumUntil: users.premiumUntil,
      authorVerifiedBadgeGrantedAt: users.verifiedBadgeGrantedAt,
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
      verified: hasVerifiedBadge({
        isPremium: r.authorIsPremium,
        premiumUntil: r.authorPremiumUntil,
        verifiedBadgeGrantedAt: r.authorVerifiedBadgeGrantedAt,
      }),
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

/** Edit a post within the grace window. Author only. */
export async function editPostCore(
  userId: string,
  postId: string,
  rawBody: string
): Promise<FeedActionResult> {
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
  if (post.userId !== userId) {
    return { ok: false, error: "მხოლოდ ავტორი ცვლის თავის პოსტს" };
  }
  if (Date.now() - post.createdAt.getTime() > POST_EDIT_WINDOW_MS) {
    return { ok: false, error: "რედაქტირების დრო (5 წუთი) გავიდა" };
  }

  await db.update(posts).set({ body, edited: true }).where(eq(posts.id, postId));
  return { ok: true };
}

/** Delete a post. Author can delete their own; admins can delete any. */
export async function deletePostCore(
  actor: FeedActor,
  postId: string
): Promise<FeedActionResult> {
  const [post] = await db
    .select({ userId: posts.userId })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  if (!post) return { ok: false, error: "პოსტი ვერ მოიძებნა" };

  const isOwner = post.userId === actor.id;
  const isAdmin = isAdminEmail(actor.email);
  if (!isOwner && !isAdmin) {
    return { ok: false, error: "წაშლის უფლება არ გაქვს" };
  }

  // Gather every reputation subject that depends on this post BEFORE the
  // cascade nukes the source rows.
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
      { kind: "comment_created" as const, subjectId: RepSubject.comment(c.id) },
      {
        kind: "comment_received" as const,
        subjectId: RepSubject.commentReceived(c.id),
      },
    ]),
  ];

  await db.delete(posts).where(eq(posts.id, postId));

  after(async () => {
    await revokeReputationForSubjects(subjectsToRevoke);
  });

  return { ok: true };
}

/** Delete a comment. Author OR admin OR post-author. */
export async function deleteCommentCore(
  actor: FeedActor,
  commentId: string
): Promise<FeedActionResult> {
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

  const isOwner = row.commentUserId === actor.id;
  const isPostAuthor = row.postUserId === actor.id;
  const isAdmin = isAdminEmail(actor.email);
  if (!isOwner && !isPostAuthor && !isAdmin) {
    return { ok: false, error: "წაშლის უფლება არ გაქვს" };
  }

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

  return { ok: true };
}

export { revokeReputationForSubjects, RepSubject };
