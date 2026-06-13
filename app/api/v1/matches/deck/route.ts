import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { getMatchDeck } from "@/lib/match";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/matches/deck
 *
 * The swipe deck — public-profile users the viewer hasn't decided on yet,
 * sorted by astrological compatibility. Each card carries its photo carousel,
 * sun sign, age, bio, and compatibility score. The client records decisions
 * via POST /api/v1/matches/<userId>.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const deck = await getMatchDeck(user.id);
    return ok({ deck });
  });
}
