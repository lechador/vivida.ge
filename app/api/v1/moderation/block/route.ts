import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { blocks, profiles, users } from "@/db/schema";
import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { blockUserCore, unblockUserCore } from "@/lib/block-core";
import { invalidateHeaderForUser } from "@/lib/header-cache";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({ targetUserId: z.string().min(1) });

/**
 * GET /api/v1/moderation/block → the users *you* have blocked
 *
 * Backs the app's "blocked users" settings list, which is where the block
 * confirmation tells people they can undo it. Only outgoing blocks are
 * listed — who blocked *you* stays private.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);

    const rows = await db
      .select({
        userId: blocks.blockedId,
        createdAt: blocks.createdAt,
        name: users.name,
        image: users.image,
        username: profiles.username,
        displayName: profiles.displayName,
      })
      .from(blocks)
      .innerJoin(users, eq(users.id, blocks.blockedId))
      .leftJoin(profiles, eq(profiles.userId, blocks.blockedId))
      .where(eq(blocks.blockerId, user.id))
      .orderBy(desc(blocks.createdAt));

    return ok({ blocked: rows });
  });
}

/**
 * POST   /api/v1/moderation/block   { targetUserId }  → block a user
 * DELETE /api/v1/moderation/block   { targetUserId }  → remove the block
 *
 * Trust & safety. Blocking drops any friendship/match and hides the user from
 * feed/search both ways (enforced again at read time). Shares blockUserCore /
 * unblockUserCore with the website's moderation Server Actions.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { targetUserId } = await parseBody(req, Body);
    const res = await blockUserCore(user.id, targetUserId);
    if (!res.ok) return fail(422, "block_rejected", res.error);
    invalidateHeaderForUser(user.id);
    invalidateHeaderForUser(targetUserId);
    return ok({ ok: true });
  });
}

export async function DELETE(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { targetUserId } = await parseBody(req, Body);
    const res = await unblockUserCore(user.id, targetUserId);
    if (!res.ok) return fail(422, "unblock_rejected", res.error);
    invalidateHeaderForUser(user.id);
    invalidateHeaderForUser(targetUserId);
    return ok({ ok: true });
  });
}
