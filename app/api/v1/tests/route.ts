import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { mobileTestCatalog } from "@/lib/tests-mobile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/tests — the native tests hub: the same catalog the website
 * renders at /tests, annotated with what this user has already completed.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    return ok({ tests: await mobileTestCatalog(user.id) });
  });
}
