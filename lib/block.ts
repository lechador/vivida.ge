import { and, eq, or } from "drizzle-orm";

import { db } from "@/db";
import { blocks } from "@/db/schema";

/**
 * Block *read* helpers. Blocks are directional rows but almost every gate
 * cares about "is there a block in either direction", so these collapse both
 * sides. Write logic lives in lib/block-core.ts.
 */

/** All user ids in a block relationship with `userId` (either direction). */
export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ blockerId: blocks.blockerId, blockedId: blocks.blockedId })
    .from(blocks)
    .where(or(eq(blocks.blockerId, userId), eq(blocks.blockedId, userId)));
  const ids = new Set<string>();
  for (const r of rows) {
    ids.add(r.blockerId === userId ? r.blockedId : r.blockerId);
  }
  return [...ids];
}

/** True if either user has blocked the other. */
export async function isBlockedEitherWay(
  a: string,
  b: string
): Promise<boolean> {
  const [row] = await db
    .select({ blockerId: blocks.blockerId })
    .from(blocks)
    .where(
      or(
        and(eq(blocks.blockerId, a), eq(blocks.blockedId, b)),
        and(eq(blocks.blockerId, b), eq(blocks.blockedId, a))
      )
    )
    .limit(1);
  return !!row;
}

/** True if `blockerId` currently blocks `blockedId` (one direction only). */
export async function hasBlocked(
  blockerId: string,
  blockedId: string
): Promise<boolean> {
  const [row] = await db
    .select({ blockerId: blocks.blockerId })
    .from(blocks)
    .where(
      and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId))
    )
    .limit(1);
  return !!row;
}
