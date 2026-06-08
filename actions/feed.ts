"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { db } from "@/db";
import {
  postComments,
  postReactions,
  posts,
  type PostReactionKind,
} from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { isAdminEmail } from "@/lib/admin-auth";
import {
  revokeReputationForSubjects,
  RepSubject,
} from "@/lib/reputation";
import { POST_BODY_MAX, POST_EDIT_WINDOW_MS } from "@/lib/feed-config";
import {
  listFeedPage,
  listRecentPostsByUserPage,
} from "@/lib/feed-core";
import {
  addCommentCore,
  createPostCore,
  listCommentsCore,
  reactToPostCore,
  type FeedActionResult,
} from "@/lib/feed-write-core";

// Feed read types/logic live in lib/feed-core and write logic in
// lib/feed-write-core so the mobile API (app/api/v1/*) shares them. Re-export
// the public types here so existing component imports from "@/actions/feed"
// keep working.
export type {
  FeedAuthor,
  FeedPost,
  FeedReactionCounts,
} from "@/lib/feed-core";
export type { FeedComment } from "@/lib/feed-write-core";

/**
 * Read the most recent posts plus the calling user's reactions in one
 * batched round-trip. Cursor is the createdAt of the last row from the
 * previous page.
 */
export async function listFeed(
  opts: {
    cursor?: string;
    limit?: number;
  } = {}
): Promise<import("@/lib/feed-core").FeedPost[]> {
  const user = await requireUser();
  return listFeedPage({ viewerId: user.id, ...opts });
}

/**
 * Total posts ever authored by a user. Used on the public profile stats row.
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
 * returns. Used by the "recent activity" section on the public profile.
 */
export async function listRecentPostsByUser(
  userId: string,
  limit = 5
): Promise<import("@/lib/feed-core").FeedPost[]> {
  const viewer = await requireUser();
  return listRecentPostsByUserPage({ viewerId: viewer.id, userId, limit });
}

/** Comments for one post, in tree-render order. */
export async function listComments(
  postId: string
): Promise<import("@/lib/feed-write-core").FeedComment[]> {
  await requireUser();
  return listCommentsCore(postId);
}

/** Create a post. Shared core does the cap/throttle/insert + deferred
 *  reputation & mention fan-out; the action adds auth + cache revalidation. */
export async function createPost(rawBody: string): Promise<FeedActionResult> {
  const user = await requireUser();
  const result = await createPostCore(user.id, rawBody);
  if (result.ok) revalidatePath("/feed");
  return result.ok ? { ok: true } : result;
}

/** Edit a post within the 5-minute grace window. Author only. */
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
    return { ok: false, error: "რედაქტირების დრო (5 წუთი) გავიდა" };
  }

  await db
    .update(posts)
    .set({ body, edited: true })
    .where(eq(posts.id, postId));
  revalidatePath("/feed");
  return { ok: true };
}

/** Delete a post. Author can delete their own; admins can delete any. */
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

  after(async () => {
    await revokeReputationForSubjects(subjectsToRevoke);
  });

  revalidatePath("/feed");
  revalidatePath("/admin/feed");
  return { ok: true };
}

/**
 * Add a comment (or reply) to a post. Shared core does the
 * validation/throttle/insert + notifications & reputation.
 */
export async function addComment(
  postId: string,
  rawBody: string,
  parentCommentId: string | null = null
): Promise<FeedActionResult<{ commentId: string }>> {
  const user = await requireUser();
  const result = await addCommentCore(user.id, postId, rawBody, parentCommentId);
  if (result.ok) revalidatePath("/feed");
  return result;
}

/** Delete a comment. Author OR admin OR post-author. */
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

/** Toggle a reaction on a post. */
export async function reactToPost(
  postId: string,
  kind: PostReactionKind
): Promise<FeedActionResult<{ active: PostReactionKind | null }>> {
  const user = await requireUser();
  const result = await reactToPostCore(user.id, postId, kind);
  if (result.ok) revalidatePath("/feed");
  return result;
}
