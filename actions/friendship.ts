"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-helpers";
import {
  acceptFriendRequestCore,
  cancelFriendRequestCore,
  declineFriendRequestCore,
  removeFriendCore,
  sendFriendRequestCore,
  type FriendshipActionResult,
} from "@/lib/friendship-core";

// Friendship write logic lives in lib/friendship-core so the mobile API
// (app/api/v1/friends) shares it. These wrappers add auth + path revalidation.
export type { FriendshipActionResult } from "@/lib/friendship-core";

/**
 * Send a friend request to `targetUserId`. If the target has already
 * requested *us*, the core auto-accepts (mutual interest).
 */
export async function sendFriendRequest(
  targetUserId: string,
  targetUsername?: string | null
): Promise<FriendshipActionResult> {
  const user = await requireUser();
  const result = await sendFriendRequestCore(
    { id: user.id, name: user.name ?? null },
    targetUserId
  );
  if (result.ok) {
    revalidatePath("/friends");
    if (targetUsername) revalidatePath(`/u/${targetUsername}`);
  }
  return result;
}

/** Accept a pending request that someone sent to me. */
export async function acceptFriendRequest(
  requesterId: string,
  requesterUsername?: string | null
): Promise<FriendshipActionResult> {
  const user = await requireUser();
  const result = await acceptFriendRequestCore(user.id, requesterId);
  if (result.ok) {
    revalidatePath("/friends");
    if (requesterUsername) revalidatePath(`/u/${requesterUsername}`);
  }
  return result;
}

/** Decline / delete a pending request that someone sent to me. */
export async function declineFriendRequest(
  requesterId: string,
  requesterUsername?: string | null
): Promise<FriendshipActionResult> {
  const user = await requireUser();
  const result = await declineFriendRequestCore(user.id, requesterId);
  if (result.ok) {
    revalidatePath("/friends");
    if (requesterUsername) revalidatePath(`/u/${requesterUsername}`);
  }
  return result;
}

/** Cancel a pending request *I* sent. */
export async function cancelFriendRequest(
  targetUserId: string,
  targetUsername?: string | null
): Promise<FriendshipActionResult> {
  const user = await requireUser();
  const result = await cancelFriendRequestCore(user.id, targetUserId);
  if (result.ok) {
    revalidatePath("/friends");
    if (targetUsername) revalidatePath(`/u/${targetUsername}`);
  }
  return result;
}

/** Remove an existing friendship (either side can call). */
export async function removeFriend(
  otherUserId: string,
  otherUsername?: string | null
): Promise<FriendshipActionResult> {
  const user = await requireUser();
  const result = await removeFriendCore(user.id, otherUserId);
  if (result.ok) {
    revalidatePath("/friends");
    if (otherUsername) revalidatePath(`/u/${otherUsername}`);
  }
  return result;
}
