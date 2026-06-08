import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { getCurrentPlan } from "@/lib/plan";
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

    const plan = await getCurrentPlan(user.id);
    const enriched = await ensureSynastryInterpretation(partner, plan);
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
