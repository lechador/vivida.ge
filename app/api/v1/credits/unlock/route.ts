import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { getBalance } from "@/lib/credits";
import { UNLOCK_KINDS, unlockForUser } from "@/lib/credits-unlock-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  kind: z.enum(UNLOCK_KINDS),
  /** Required for every kind except "weekly", which is a per-user unlock. */
  resultId: z.string().optional(),
});

/**
 * POST /api/v1/credits/unlock { kind, resultId? }
 *
 * Spend credits the user already holds to unlock a gated reading — the mobile
 * twin of the website's POST /api/credits/unlock, sharing unlockForUser() so
 * both charge the same price and run the same ownership check. Idempotent:
 * re-unlocking something already paid for is free and returns "already".
 *
 * This spends an existing balance. It is not a purchase, and the app offers no
 * way to buy credits — they are earned in-app (a feed post, a profile photo)
 * or bought on the website. A short balance comes back as 402
 * "insufficient_credits"; the client already knows the price from
 * GET /api/v1/credits.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { kind, resultId } = await parseBody(req, Body);

    const result = await unlockForUser(user.id, kind, resultId ?? null);

    if (!result.ok) {
      if (result.error === "insufficient") {
        return fail(402, "insufficient_credits", "Not enough credits");
      }
      if (result.error === "not_found") {
        return fail(404, "not_found", "Result not found");
      }
      return fail(400, "bad_request", "resultId is required for this kind");
    }

    return ok({ status: result.status, balance: await getBalance(user.id) });
  });
}
