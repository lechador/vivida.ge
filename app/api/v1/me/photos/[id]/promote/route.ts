import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { promotePhoto } from "@/lib/photos-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * POST /api/v1/me/photos/<id>/promote
 *
 * Make this photo the user's main picture (moves it to the front of the
 * gallery). Shares promotePhoto() with the website.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { id } = await ctx.params;

    const result = await promotePhoto(user.id, id);
    if (!result.ok) {
      return fail(404, "photo_not_found", "Photo not found");
    }
    return ok({ ok: true });
  });
}
