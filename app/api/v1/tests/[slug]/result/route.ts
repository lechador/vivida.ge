import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { fail, ok } from "@/lib/api/respond";
import { isMobileTestSlug, mobileSavedResult } from "@/lib/tests-mobile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/tests/{slug}/result — re-open the taker's latest saved attempt.
 * 404 for tests that deliberately persist nothing (the quizzes and Rosenberg),
 * and for a user who has not taken this one yet.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { slug } = await ctx.params;
    if (!isMobileTestSlug(slug)) {
      return fail(404, "not_found", "Unknown test");
    }
    const view = await mobileSavedResult(slug, user.id);
    if (!view) return fail(404, "not_found", "No saved result");
    return ok(view);
  });
}
