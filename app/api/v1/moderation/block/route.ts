import { z } from "zod";

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
    return ok({ ok: true });
  });
}
