import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { listIncomingLikes } from "@/lib/match";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/matches/likes
 *
 * The "who liked you" surface. Returns the count and pending liker identities.
 * To act on a like, the client POSTs `like` to /api/v1/matches/<likerId>, which
 * matches instantly because the liker already liked them.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const result = await listIncomingLikes(user.id);
    return ok(result);
  });
}
