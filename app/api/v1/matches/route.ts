import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { listMatches } from "@/lib/match";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/matches
 *
 * The viewer's active matches (mutual likes), newest first, each with the
 * other person's card. Tapping one opens the now-unlocked chat. Swiping
 * (like/pass/unmatch) goes through POST /api/v1/matches/<userId>; the deck
 * of candidates is GET /api/v1/matches/deck.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const matches = await listMatches(user.id);
    return ok({ matches });
  });
}
