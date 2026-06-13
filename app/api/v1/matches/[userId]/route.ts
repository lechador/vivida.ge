import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { likeUserCore, unmatchCore, undoSwipeCore } from "@/lib/match-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  action: z.enum(["like", "pass", "unmatch", "undo"]),
});

/**
 * POST /api/v1/matches/<userId>  { action }
 *
 * One endpoint for every swipe decision against <userId>:
 *   - like    → record interest; if reciprocated, create the match + notify
 *               both. Returns { matched } so the client can fire the
 *               "It's a match!" celebration without a second round-trip.
 *   - pass    → silently exclude them from the deck.
 *   - unmatch → soft-delete an existing match (re-locks the chat).
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { userId } = await ctx.params;
    const { action } = await parseBody(req, Body);

    if (action === "unmatch") {
      const res = await unmatchCore(user.id, userId);
      if (!res.ok) return fail(422, "match_action_rejected", res.error);
      return ok({ matched: false });
    }

    if (action === "undo") {
      await undoSwipeCore(user.id, userId);
      return ok({ matched: false });
    }

    const actor = { id: user.id, name: user.name ?? null };
    const res = await likeUserCore(actor, userId, action);
    if (!res.ok) return fail(422, "match_action_rejected", res.error);
    return ok({ matched: res.matched });
  });
}
