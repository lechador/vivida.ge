import { and, eq, or } from "drizzle-orm";

import { db } from "@/db";
import {
  friendships,
  likes,
  matches,
  notifications,
  profiles,
  users,
  type LikeKind,
  type NotificationPayload,
} from "@/db/schema";
import { invalidateHeaderForUser } from "@/lib/header-cache";

/**
 * Framework-agnostic match-deck write logic, shared by the mobile API
 * (app/api/v1/matches/*) and — when the website grows a swipe deck — its
 * Server Actions. Callers resolve the actor and pass the id/name in; these
 * functions never touch sessions or revalidate Next's cache.
 *
 * Romantic intent is modelled separately from friendships: a `like` is
 * silent and one-directional until reciprocated, at which point a `match`
 * row is created and BOTH users get a `new_match` notification. Read logic
 * (the deck, the matches list) lives in lib/match.ts.
 */

export type LikeActor = { id: string; name: string | null };

export type LikeResult =
  | { ok: true; matched: boolean }
  | { ok: false; error: string };

/** Sorted pair so a match is unique regardless of who liked first. */
function sortedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** Are these two users blocked (either direction)? Blocks veto matching. */
async function isBlocked(a: string, b: string): Promise<boolean> {
  const [row] = await db
    .select({ status: friendships.status })
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, a), eq(friendships.recipientId, b)),
        and(eq(friendships.requesterId, b), eq(friendships.recipientId, a))
      )
    )
    .limit(1);
  return row?.status === "blocked";
}

/**
 * Emit a `new_match` notification to `toUserId`, captioned with
 * `aboutUserId`'s display info (so each side sees the *other* person).
 */
async function emitMatchNotification(toUserId: string, aboutUserId: string) {
  const [actor] = await db
    .select({
      name: users.name,
      image: users.image,
      displayName: profiles.displayName,
      username: profiles.username,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, aboutUserId))
    .limit(1);

  const payload: NotificationPayload = {
    fromUserId: aboutUserId,
    fromUsername: actor?.username ?? null,
    fromName: actor?.displayName ?? actor?.name ?? null,
    fromImage: actor?.image ?? null,
  };

  await db
    .insert(notifications)
    .values({ userId: toUserId, kind: "new_match", payload });
  invalidateHeaderForUser(toUserId);
}

/**
 * Record `actor`'s swipe on `targetId`. A `pass` is silent and only excludes
 * the target from the deck. A `like` checks for a reciprocal like and, if
 * found, creates the match + notifies both users. Upserts so a pass can flip
 * to a like later (the deck never re-surfaces a decided card otherwise).
 */
export async function likeUserCore(
  actor: LikeActor,
  targetId: string,
  kind: LikeKind
): Promise<LikeResult> {
  if (actor.id === targetId) {
    return { ok: false, error: "ვერ მოიწონებ საკუთარ თავს" };
  }

  // Target must be a real, public profile (the deck only serves these, but
  // the endpoint is hit directly so we validate defensively).
  const [target] = await db
    .select({ username: profiles.username })
    .from(profiles)
    .where(eq(profiles.userId, targetId))
    .limit(1);
  if (!target?.username) {
    return { ok: false, error: "მომხმარებელი ვერ მოიძებნა" };
  }

  if (await isBlocked(actor.id, targetId)) {
    return { ok: false, error: "მოქმედება შეუძლებელია" };
  }

  await db
    .insert(likes)
    .values({ likerId: actor.id, targetId, kind })
    .onConflictDoUpdate({
      target: [likes.likerId, likes.targetId],
      set: { kind },
    });

  if (kind === "pass") return { ok: true, matched: false };

  // Did the target already like the actor? If so, it's a match.
  const [reciprocal] = await db
    .select({ likerId: likes.likerId })
    .from(likes)
    .where(
      and(
        eq(likes.likerId, targetId),
        eq(likes.targetId, actor.id),
        eq(likes.kind, "like")
      )
    )
    .limit(1);

  if (!reciprocal) return { ok: true, matched: false };

  const [a, b] = sortedPair(actor.id, targetId);
  await db
    .insert(matches)
    .values({ userAId: a, userBId: b })
    .onConflictDoUpdate({
      target: [matches.userAId, matches.userBId],
      // Re-matching after a prior unmatch clears the soft-delete.
      set: { unmatchedAt: null, unmatchedBy: null },
    });

  await Promise.all([
    emitMatchNotification(actor.id, targetId),
    emitMatchNotification(targetId, actor.id),
  ]);

  return { ok: true, matched: true };
}

/**
 * Undo the viewer's most recent swipe on `targetId`: remove their like/pass so
 * the candidate can re-surface in the deck. If that swipe had just created a
 * match, the match row is removed too (a hard delete — it never really
 * existed from the user's perspective). The *other* user's like is untouched.
 */
export async function undoSwipeCore(
  userId: string,
  targetId: string
): Promise<{ ok: true }> {
  const [a, b] = sortedPair(userId, targetId);
  await Promise.all([
    db
      .delete(likes)
      .where(and(eq(likes.likerId, userId), eq(likes.targetId, targetId))),
    db.delete(matches).where(and(eq(matches.userAId, a), eq(matches.userBId, b))),
  ]);
  return { ok: true };
}

/**
 * Unmatch `otherId`. Soft-deletes the match (so it leaves both decks and the
 * matches list and chat re-locks) while keeping the row for analytics. The
 * like rows are left intact, so neither user re-appears in the other's deck.
 */
export async function unmatchCore(
  userId: string,
  otherId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const [a, b] = sortedPair(userId, otherId);
  await db
    .update(matches)
    .set({ unmatchedAt: new Date(), unmatchedBy: userId })
    .where(and(eq(matches.userAId, a), eq(matches.userBId, b)));
  return { ok: true };
}
