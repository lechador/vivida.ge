import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { getLeaderboard, getUserReputationTotal } from "@/lib/leaderboard-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Query = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/**
 * GET /api/v1/leaderboard?limit=<n>
 *
 * Top users by reputation plus the viewer's own total and rank. Shares
 * getLeaderboard() with the website's /leaderboard page (avatars resolved to
 * the chosen main photo). `myRank` is 1-based within the returned page, or
 * null when the viewer isn't in it.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);

    const { searchParams } = new URL(req.url);
    const { limit } = Query.parse({ limit: searchParams.get("limit") ?? undefined });

    const [top, myTotal] = await Promise.all([
      getLeaderboard(limit ?? 50),
      getUserReputationTotal(user.id),
    ]);

    const myRankIndex = top.findIndex((row) => row.userId === user.id);
    const myRank = myRankIndex === -1 ? null : myRankIndex + 1;

    return ok({ top, myTotal, myRank });
  });
}
