import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { createReportCore } from "@/lib/report-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  targetType: z.enum(["user", "post", "comment", "message_thread"]),
  targetId: z.string().min(1),
  reason: z.string().max(1000).nullable().optional(),
});

/**
 * POST /api/v1/moderation/report  { targetType, targetId, reason? }
 *
 * File a trust & safety report against a user / post / comment / message
 * thread. One open report per (reporter, target) — repeat taps dedupe. Shares
 * createReportCore with the website's reportContent Server Action. Required by
 * App Store / Play review for user-generated-content apps.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const input = await parseBody(req, Body);
    const res = await createReportCore(user.id, input);
    if (!res.ok) return fail(422, "report_rejected", res.error);
    return ok({ ok: true });
  });
}
