import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { getCurrentPlan } from "@/lib/plan";
import { listIncomingLikes } from "@/lib/match";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/matches/likes
 *
 * The "who liked you" surface. Always returns a `count`; liker identities are
 * only included for Pro users (`locked: false`). Free users get the count with
 * an empty `likers` list — the identities never leave the server — so the
 * client can show a blurred teaser + upsell. To act on a like, the client
 * POSTs `like` to /api/v1/matches/<likerId>, which matches instantly because
 * the liker already liked them.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const plan = await getCurrentPlan(user.id);
    const result = await listIncomingLikes(user.id, { reveal: plan === "pro" });
    return ok(result);
  });
}
