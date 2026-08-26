import { and, eq, isNull, or, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  blocks,
  friendships,
  matches,
  notifications,
  partners,
} from "@/db/schema";

/**
 * Block *write* logic, framework-agnostic (shared by web Server Actions and,
 * later, the mobile API). Callers resolve auth and pass ids in. Read helpers
 * live in lib/block.ts.
 */

export type BlockResult = { ok: true } | { ok: false; error: string };

/** Canonical (a < b) ordering used by the matches table PK. */
function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/**
 * `blockerId` blocks `blockedId`. Idempotent. For a clean break we also drop
 * any friendship and soft-unmatch any active match between them, so the block
 * can't be bypassed by a pre-existing accepted friendship/match. Message
 * history is preserved (we never delete messages). Enforcement also re-checks
 * the block at read time, so this cleanup is defence-in-depth, not the only
 * line of defence.
 */
export async function blockUserCore(
  blockerId: string,
  blockedId: string
): Promise<BlockResult> {
  if (blockerId === blockedId) {
    return { ok: false, error: "ვერ დაბლოკავ საკუთარ თავს" };
  }

  await db
    .insert(blocks)
    .values({ blockerId, blockedId })
    .onConflictDoNothing();

  await db
    .delete(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, blockerId),
          eq(friendships.recipientId, blockedId)
        ),
        and(
          eq(friendships.requesterId, blockedId),
          eq(friendships.recipientId, blockerId)
        )
      )
    );

  // Actor details are denormalized into notification JSON. Remove historical
  // rows in both directions so a block takes effect immediately in the bell,
  // even before its cached header data refreshes.
  await db
    .delete(notifications)
    .where(
      or(
        and(
          eq(notifications.userId, blockerId),
          sql`${notifications.payload}->>'fromUserId' = ${blockedId}`,
        ),
        and(
          eq(notifications.userId, blockedId),
          sql`${notifications.payload}->>'fromUserId' = ${blockerId}`,
        ),
      ),
    );

  const [a, b] = orderedPair(blockerId, blockedId);
  await db
    .update(matches)
    .set({ unmatchedAt: new Date(), unmatchedBy: blockerId })
    .where(
      and(
        eq(matches.userAId, a),
        eq(matches.userBId, b),
        isNull(matches.unmatchedAt)
      )
    );

  // A linked relationship invite is another mutual social connection. Sever
  // it in either ownership direction so shared prompts/updates cannot bypass
  // the block. The owner's saved partner chart remains their private data.
  await db
    .update(partners)
    .set({ linkedUserId: null, inviteAcceptedAt: null })
    .where(
      or(
        and(
          eq(partners.userId, blockerId),
          eq(partners.linkedUserId, blockedId),
        ),
        and(
          eq(partners.userId, blockedId),
          eq(partners.linkedUserId, blockerId),
        ),
      ),
    );

  return { ok: true };
}

/** Remove `blockerId`'s block on `blockedId`. Friendship is NOT restored. */
export async function unblockUserCore(
  blockerId: string,
  blockedId: string
): Promise<BlockResult> {
  await db
    .delete(blocks)
    .where(
      and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId))
    );
  return { ok: true };
}
