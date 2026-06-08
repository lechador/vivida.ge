import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { finalizePhoto } from "@/lib/photos-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * POST /api/v1/me/photos/<id>/finalize
 *
 * Confirm a successful upload — flips `ready` to true so the photo renders
 * publicly. Shares finalizePhoto() with the website.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { id } = await ctx.params;

    const result = await finalizePhoto(user.id, id);
    if (!result.ok) {
      return fail(404, "photo_not_found", "Photo not found");
    }
    return ok({ ok: true, photo: result.photo });
  });
}
