import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { deletePhoto } from "@/lib/photos-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * DELETE /api/v1/me/photos/<id>
 *
 * Delete one of the user's own photos (R2 object + DB row). Shares
 * deletePhoto() with the website.
 */
export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const { id } = await ctx.params;

    const result = await deletePhoto(user.id, id);
    if (!result.ok) {
      return fail(404, "photo_not_found", "Photo not found");
    }
    return ok({ ok: true });
  });
}
