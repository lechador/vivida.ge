import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { fail, ok } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { isMobileTestSlug, submitMobileTest } from "@/lib/tests-mobile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The Astro-MBTI submission runs an AI synthesis before it can answer.
export const maxDuration = 60;
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  /** Client-generated, idempotent: a retried submit updates nothing twice. */
  attemptId: z.string().trim().min(8).max(64),
  answers: z.record(z.string(), z.union([z.number(), z.string()])),
  timeUsedSec: z.number().int().min(0).max(24 * 60 * 60).nullish(),
});

/**
 * POST /api/v1/tests/{slug}/submit — score one native attempt.
 *
 * Scoring is redone here from the raw answers (never trusted from the client)
 * using the very functions the website uses, and the response is an
 * already-rendered result view, so the app never re-implements band copy.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { slug } = await ctx.params;
    if (!isMobileTestSlug(slug)) {
      return fail(404, "not_found", "Unknown test");
    }
    const body = await parseBody(req, Body);
    return ok(
      await submitMobileTest({
        slug,
        userId: user.id,
        attemptId: body.attemptId,
        answers: body.answers,
        timeUsedSec: body.timeUsedSec ?? null,
      })
    );
  });
}
