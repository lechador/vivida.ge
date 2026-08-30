import { requireMobileUserId } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { fail, ok } from "@/lib/api/respond";
import { isMobileTestSlug, mobileTestQuestions } from "@/lib/tests-mobile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/tests/{slug} — the question bank the native runner walks.
 *
 * The IQ bank answers with only its FIRST adaptive item: the answer key never
 * leaves the server, so the app asks …/next for each subsequent item.
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  return handle(async () => {
    await requireMobileUserId(req);
    const { slug } = await ctx.params;
    if (!isMobileTestSlug(slug)) {
      return fail(404, "not_found", "Unknown test");
    }
    return ok(await mobileTestQuestions(slug));
  });
}
