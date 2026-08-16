import { auth } from "@/auth";
import {
  ensureSynastryDeepReport,
  getPartnerForViewer,
} from "@/lib/partners-core";
import { isOpenRouterConfigured } from "@/lib/openrouter";
import { CREDIT_COST, isUnlocked } from "@/lib/credits";
import { enforceRateLimit } from "@/lib/rate-limit";
import { localeForHost } from "@/lib/i18n/request-locale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Params = { params: Promise<{ id: string }> };

/** Generate (or return cached) the deep AI synastry report for a partner. */
export async function POST(req: Request, ctx: Params) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return Response.json({ error: "unauthorized" }, { status: 401 });

  if (!isOpenRouterConfigured()) {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  const { id } = await ctx.params;
  const partner = await getPartnerForViewer(id, userId);
  if (!partner) return Response.json({ error: "not_found" }, { status: 404 });

  // Same credit gate as app/synastry/[id]/page.tsx — the deep report is only
  // reachable there once the partner is unlocked, so we check (never grant)
  // the unlock here and refuse before paying for the AI call.
  if (!(await isUnlocked(userId, partner.id, "spend_synastry"))) {
    return Response.json(
      { error: "locked", cost: CREDIT_COST.synastry },
      { status: 402 },
    );
  }

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

  const locale = localeForHost(
    req.headers.get("x-forwarded-host") ?? new URL(req.url).host,
  );
  const updated = await ensureSynastryDeepReport(partner, locale);
  if (!updated.deepReport) {
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
  return Response.json({ report: updated.deepReport });
}
