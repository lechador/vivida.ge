"use server";

import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { db } from "@/db";
import {
  friendships,
  notifications,
  profiles,
  users,
  type NotificationKind,
  type NotificationPayload,
} from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { sendFriendRequestEmail } from "@/lib/email";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { awardReputation, RepSubject } from "@/lib/reputation";

/** Credit both halves of a freshly-accepted friendship with reputation. */
async function awardFriendshipBoth(a: string, b: string) {
  const subject = RepSubject.friendPair(a, b);
  await Promise.all([
    awardReputation({ userId: a, kind: "friend_added", subjectId: subject }),
    awardReputation({ userId: b, kind: "friend_added", subjectId: subject }),
  ]);
}

/** Insert a notification for a recipient. Kind-specific payload is captured
 *  at emit time so the dropdown can render without joins later. */
async function emitNotification({
  toUserId,
  fromUserId,
  kind,
}: {
  toUserId: string;
  fromUserId: string;
  kind: NotificationKind;
}) {
  // Pull the actor's display info once so the notification stands alone.
  const [actor] = await db
    .select({
      name: users.name,
      image: users.image,
      displayName: profiles.displayName,
      username: profiles.username,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, fromUserId))
    .limit(1);

  const payload: NotificationPayload = {
    fromUserId,
    fromUsername: actor?.username ?? null,
    fromName: actor?.displayName ?? actor?.name ?? null,
    fromImage: actor?.image ?? null,
  };

  await db.insert(notifications).values({
    userId: toUserId,
    kind,
    payload,
  });
  invalidateHeaderForUser(toUserId);
}

export type FriendshipActionResult = { ok: true } | { ok: false; error: string };

/**
 * Send a friend request from the current user to `targetUserId`.
 * If the target has already requested *us*, auto-accept (mutual interest).
 */
export async function sendFriendRequest(
  targetUserId: string,
  /** Optional username for path revalidation so the profile re-renders. */
  targetUsername?: string | null
): Promise<FriendshipActionResult> {
  const user = await requireUser();
  if (user.id === targetUserId) {
    return { ok: false, error: "ვერ გაუგზავნი მოთხოვნას საკუთარ თავს" };
  }

  const [existing] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, user.id),
          eq(friendships.recipientId, targetUserId)
        ),
        and(
          eq(friendships.requesterId, targetUserId),
          eq(friendships.recipientId, user.id)
        )
      )
    )
    .limit(1);

  if (existing) {
    if (existing.status === "blocked") {
      return { ok: false, error: "თხოვნის გაგზავნა შეუძლებელია" };
    }
    if (existing.status === "accepted") {
      return { ok: false, error: "უკვე მეგობრები ხართ" };
    }
    if (existing.status === "pending") {
      // They requested us first — accept.
      if (existing.requesterId === targetUserId) {
        await db
          .update(friendships)
          .set({ status: "accepted", respondedAt: new Date() })
          .where(
            and(
              eq(friendships.requesterId, targetUserId),
              eq(friendships.recipientId, user.id)
            )
          );
        // Notify the original requester that we accepted
        await emitNotification({
          toUserId: targetUserId,
          fromUserId: user.id,
          kind: "friend_accepted",
        });
        // Reputation — both sides earn for a mutual friendship.
        after(async () => {
          await awardFriendshipBoth(user.id, targetUserId);
        });
        revalidatePath("/friends");
        if (targetUsername) revalidatePath(`/u/${targetUsername}`);
        return { ok: true };
      }
      return { ok: false, error: "მოთხოვნა უკვე გაგზავნილია" };
    }
  }

  await db.insert(friendships).values({
    requesterId: user.id,
    recipientId: targetUserId,
    status: "pending",
  });

  // Notify the recipient
  await emitNotification({
    toUserId: targetUserId,
    fromUserId: user.id,
    kind: "friend_request",
  });

  // Fire-and-forget email if the recipient has been absent ≥1h. The
  // helper itself does the absence + throttle + opt-out checks; we just
  // hand it the requester's display name and username.
  after(async () => {
    try {
      const [requesterProfile] = await db
        .select({ username: profiles.username })
        .from(profiles)
        .where(eq(profiles.userId, user.id))
        .limit(1);
      await sendFriendRequestEmail({
        recipientUserId: targetUserId,
        fromName: user.name ?? "Vivida-ის წევრი",
        fromUsername: requesterProfile?.username ?? null,
      });
    } catch (err) {
      console.warn(
        "[friendship] friend-request email after-hook failed:",
        (err as Error).message
      );
    }
  });

  revalidatePath("/friends");
  if (targetUsername) revalidatePath(`/u/${targetUsername}`);
  return { ok: true };
}

/** Accept a pending request that someone sent to me. */
export async function acceptFriendRequest(
  requesterId: string,
  requesterUsername?: string | null
): Promise<FriendshipActionResult> {
  const user = await requireUser();
  await db
    .update(friendships)
    .set({ status: "accepted", respondedAt: new Date() })
    .where(
      and(
        eq(friendships.requesterId, requesterId),
        eq(friendships.recipientId, user.id),
        eq(friendships.status, "pending")
      )
    );
  // Notify the original requester
  await emitNotification({
    toUserId: requesterId,
    fromUserId: user.id,
    kind: "friend_accepted",
  });
  // Reputation for both sides on acceptance.
  after(async () => {
    await awardFriendshipBoth(user.id, requesterId);
  });
  revalidatePath("/friends");
  if (requesterUsername) revalidatePath(`/u/${requesterUsername}`);
  return { ok: true };
}

/** Decline / delete a pending request that someone sent to me. */
export async function declineFriendRequest(
  requesterId: string,
  requesterUsername?: string | null
): Promise<FriendshipActionResult> {
  const user = await requireUser();
  await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.requesterId, requesterId),
        eq(friendships.recipientId, user.id),
        eq(friendships.status, "pending")
      )
    );
  revalidatePath("/friends");
  if (requesterUsername) revalidatePath(`/u/${requesterUsername}`);
  return { ok: true };
}

/** Cancel a pending request *I* sent. */
export async function cancelFriendRequest(
  targetUserId: string,
  targetUsername?: string | null
): Promise<FriendshipActionResult> {
  const user = await requireUser();
  await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.requesterId, user.id),
        eq(friendships.recipientId, targetUserId),
        eq(friendships.status, "pending")
      )
    );
  revalidatePath("/friends");
  if (targetUsername) revalidatePath(`/u/${targetUsername}`);
  return { ok: true };
}

/** Remove an existing friendship (either side can call). */
export async function removeFriend(
  otherUserId: string,
  otherUsername?: string | null
): Promise<FriendshipActionResult> {
  const user = await requireUser();
  await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          and(
            eq(friendships.requesterId, user.id),
            eq(friendships.recipientId, otherUserId)
          ),
          and(
            eq(friendships.requesterId, otherUserId),
            eq(friendships.recipientId, user.id)
          )
        )
      )
    );
  revalidatePath("/friends");
  if (otherUsername) revalidatePath(`/u/${otherUsername}`);
  return { ok: true };
}
