import { and, eq, or } from "drizzle-orm";
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
import { sendFriendRequestEmail } from "@/lib/email";
import { isBlockedEitherWay } from "@/lib/block";
import { invalidateHeaderForUser } from "@/lib/header-cache";
import { awardReputation, RepSubject } from "@/lib/reputation";

/**
 * Framework-agnostic friendship write logic, shared by the website
 * (actions/friendship.ts) and the mobile API (app/api/v1/friends/*).
 * Callers resolve the actor and pass the id/name in; these functions never
 * touch sessions or revalidate Next's cache (that stays in the web wrappers).
 */

export type FriendshipActionResult =
  | { ok: true }
  | { ok: false; error: string };

export type FriendActor = { id: string; name: string | null };

/** Credit both halves of a freshly-accepted friendship with reputation. */
async function awardFriendshipBoth(a: string, b: string) {
  const subject = RepSubject.friendPair(a, b);
  await Promise.all([
    awardReputation({ userId: a, kind: "friend_added", subjectId: subject }),
    awardReputation({ userId: b, kind: "friend_added", subjectId: subject }),
  ]);
}

/** Insert a notification, capturing the actor's display info at emit time. */
async function emitNotification({
  toUserId,
  fromUserId,
  kind,
}: {
  toUserId: string;
  fromUserId: string;
  kind: NotificationKind;
}) {
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

  await db.insert(notifications).values({ userId: toUserId, kind, payload });
  invalidateHeaderForUser(toUserId);
}

/**
 * Send a friend request from `actor` to `targetUserId`. If the target has
 * already requested the actor, auto-accept (mutual interest).
 */
export async function sendFriendRequestCore(
  actor: FriendActor,
  targetUserId: string
): Promise<FriendshipActionResult> {
  if (actor.id === targetUserId) {
    return { ok: false, error: "ვერ გაუგზავნი მოთხოვნას საკუთარ თავს" };
  }

  // A block in either direction blocks new friend requests outright.
  if (await isBlockedEitherWay(actor.id, targetUserId)) {
    return { ok: false, error: "თხოვნის გაგზავნა შეუძლებელია" };
  }

  const [existing] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, actor.id),
          eq(friendships.recipientId, targetUserId)
        ),
        and(
          eq(friendships.requesterId, targetUserId),
          eq(friendships.recipientId, actor.id)
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
      if (existing.requesterId === targetUserId) {
        await db
          .update(friendships)
          .set({ status: "accepted", respondedAt: new Date() })
          .where(
            and(
              eq(friendships.requesterId, targetUserId),
              eq(friendships.recipientId, actor.id)
            )
          );
        await emitNotification({
          toUserId: targetUserId,
          fromUserId: actor.id,
          kind: "friend_accepted",
        });
        after(async () => {
          await awardFriendshipBoth(actor.id, targetUserId);
        });
        return { ok: true };
      }
      return { ok: false, error: "მოთხოვნა უკვე გაგზავნილია" };
    }
  }

  await db.insert(friendships).values({
    requesterId: actor.id,
    recipientId: targetUserId,
    status: "pending",
  });

  await emitNotification({
    toUserId: targetUserId,
    fromUserId: actor.id,
    kind: "friend_request",
  });

  after(async () => {
    try {
      const [requesterProfile] = await db
        .select({ username: profiles.username })
        .from(profiles)
        .where(eq(profiles.userId, actor.id))
        .limit(1);
      await sendFriendRequestEmail({
        recipientUserId: targetUserId,
        fromName: actor.name ?? "Vivida-ის წევრი",
        fromUsername: requesterProfile?.username ?? null,
      });
    } catch (err) {
      console.warn(
        "[friendship] friend-request email after-hook failed:",
        (err as Error).message
      );
    }
  });

  return { ok: true };
}

/** Accept a pending request that someone sent to me. */
export async function acceptFriendRequestCore(
  userId: string,
  requesterId: string
): Promise<FriendshipActionResult> {
  await db
    .update(friendships)
    .set({ status: "accepted", respondedAt: new Date() })
    .where(
      and(
        eq(friendships.requesterId, requesterId),
        eq(friendships.recipientId, userId),
        eq(friendships.status, "pending")
      )
    );
  await emitNotification({
    toUserId: requesterId,
    fromUserId: userId,
    kind: "friend_accepted",
  });
  after(async () => {
    await awardFriendshipBoth(userId, requesterId);
  });
  return { ok: true };
}

/** Decline / delete a pending request that someone sent to me. */
export async function declineFriendRequestCore(
  userId: string,
  requesterId: string
): Promise<FriendshipActionResult> {
  await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.requesterId, requesterId),
        eq(friendships.recipientId, userId),
        eq(friendships.status, "pending")
      )
    );
  return { ok: true };
}

/** Cancel a pending request *I* sent. */
export async function cancelFriendRequestCore(
  userId: string,
  targetUserId: string
): Promise<FriendshipActionResult> {
  await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.requesterId, userId),
        eq(friendships.recipientId, targetUserId),
        eq(friendships.status, "pending")
      )
    );
  return { ok: true };
}

/** Remove an existing friendship (either side can call). */
export async function removeFriendCore(
  userId: string,
  otherUserId: string
): Promise<FriendshipActionResult> {
  await db
    .delete(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          and(
            eq(friendships.requesterId, userId),
            eq(friendships.recipientId, otherUserId)
          ),
          and(
            eq(friendships.requesterId, otherUserId),
            eq(friendships.recipientId, userId)
          )
        )
      )
    );
  return { ok: true };
}
