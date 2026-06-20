import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import {
  acceptFriendRequestCore,
  cancelFriendRequestCore,
  declineFriendRequestCore,
  removeFriendCore,
  sendFriendRequestCore,
} from "@/lib/friendship-core";
import { getFriendshipStatus } from "@/lib/friendship";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  action: z.enum(["request", "accept", "decline", "cancel", "remove"]),
});

/**
 * POST /api/v1/friends/<userId>  { action }
 *
 * One endpoint for every friendship transition, dispatching to the shared
 * friendship-core (same notifications + reputation as the website). Returns
 * the resulting friendship status so the client can update its button
 * authoritatively without a second round-trip.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ userId: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { userId } = await ctx.params;
    const { action } = await parseBody(req, Body);

    const actor = { id: user.id, name: user.name ?? null };
    const result = await (() => {
      switch (action) {
        case "request":
          return sendFriendRequestCore(actor, userId);
        case "accept":
          return acceptFriendRequestCore(user.id, userId);
        case "decline":
          return declineFriendRequestCore(user.id, userId);
        case "cancel":
          return cancelFriendRequestCore(user.id, userId);
        case "remove":
          return removeFriendCore(user.id, userId);
      }
    })();

    if (!result.ok) {
      return fail(422, "friend_action_rejected", result.error);
    }

    const friendship = await getFriendshipStatus(user.id, userId);
    return ok({ friendship });
  });
}
