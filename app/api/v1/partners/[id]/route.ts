import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import {
  CREDIT_COST,
  FREE_ALLOWANCE,
  countUnlocks,
  isUnlocked,
  spendOnce,
} from "@/lib/credits";
import {
  ensureSynastryInterpretation,
  getPartnerForViewer,
  softDeletePartnerCore,
} from "@/lib/partners-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/partners/<id>
 *
 * One partner with its synastry interpretation. The AI narrative is
 * generated + cached lazily here (same ensureSynastryInterpretation() the
 * website uses) so adding many partners doesn't fire many AI calls upfront.
 * Credit-gated exactly like app/synastry/[id]/page.tsx; until the partner is
 * unlocked the reading is withheld and `{ locked: true }` comes back instead.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { id } = await ctx.params;

    const partner = await getPartnerForViewer(id, user.id);
    if (!partner) {
      return fail(404, "partner_not_found", "Partner not found");
    }

    // Credit gate, same rule as the website: the first partner's synastry is
    // free (recorded as a zero-cost unlock so the allowance can't be
    // re-farmed), every later one costs credits and stays unlocked once paid.
    let unlocked = await isUnlocked(user.id, partner.id, "spend_synastry");
    if (!unlocked) {
      const used = await countUnlocks(user.id, "spend_synastry");
      if (used < FREE_ALLOWANCE.synastry) {
        await spendOnce(user.id, 0, "spend_synastry", partner.id);
        unlocked = true;
      }
    }
    if (!unlocked) {
      return ok({
        partner: { ...partner, aiInterpretation: null, deepReport: null },
        locked: true,
        cost: CREDIT_COST.synastry,
      });
    }

    const enriched = await ensureSynastryInterpretation(partner);
    return ok({ partner: enriched });
  });
}

/**
 * DELETE /api/v1/partners/<id>
 *
 * Soft-delete a partner (owner-only, idempotent). Shares
 * softDeletePartnerCore() with the website.
 */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { id } = await ctx.params;

    await softDeletePartnerCore(user.id, id);
    return ok({ ok: true });
  });
}
