"use server";

import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { posts, type PostReactionKind } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import {
  listFeedPage,
  listRecentPostsByUserPage,
} from "@/lib/feed-core";
import {
  addCommentCore,
  createPostCore,
  deleteCommentCore,
  deletePostCore,
  editPostCore,
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
  const result = await editPostCore(user.id, postId, rawBody);
  if (result.ok) revalidatePath("/feed");
  return result;
}

/** Delete a post. Author can delete their own; admins can delete any. */
export async function deletePost(postId: string): Promise<FeedActionResult> {
  const user = await requireUser();
  const result = await deletePostCore(
    { id: user.id, email: user.email },
    postId
  );
  if (result.ok) {
    revalidatePath("/feed");
    revalidatePath("/admin/feed");
  }
  return result;
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
  const result = await deleteCommentCore(
    { id: user.id, email: user.email },
    commentId
  );
  if (result.ok) {
    revalidatePath("/feed");
    revalidatePath("/admin/feed");
  }
  return result;
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
