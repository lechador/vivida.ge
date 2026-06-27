import { auth } from "@/auth";
import { getCurrentPlan } from "@/lib/plan";
import {
  ensureSynastryDeepReport,
  getPartnerForViewer,
} from "@/lib/partners-core";
import { isOpenRouterConfigured } from "@/lib/openrouter";
import { enforceRateLimit } from "@/lib/rate-limit";
import { canUseFeature } from "@/lib/features";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Params = { params: Promise<{ id: string }> };

/** Generate (or return cached) the deep AI synastry report for a partner. */
export async function POST(_req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  if (!isOpenRouterConfigured()) {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  const plan = await getCurrentPlan(userId);
  if (!canUseFeature("deepSynastry", plan)) {
    return Response.json({ error: "pro_required" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const partner = await getPartnerForViewer(id, userId);
  if (!partner) return Response.json({ error: "not_found" }, { status: 404 });

  try {
    await enforceRateLimit({
      bucket: "synastry_deep_user_day",
      identifier: userId,
      limit: 20,
      windowMs: 24 * 60 * 60 * 1000,
    });
  } catch {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const updated = await ensureSynastryDeepReport(partner, plan);
  if (!updated.deepReport) {
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
  return Response.json({ report: updated.deepReport });
}
