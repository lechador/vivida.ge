import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { listOwnPhotos } from "@/lib/photos-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/me/photos
 *
 * The authenticated user's completed profile photos in display order.
 * Pending rows are upload reservations and may not exist in R2 yet; the
 * native gallery has its own local upload progress and must never try to
 * render those public URLs.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const photos = (await listOwnPhotos(user.id)).filter((photo) => photo.ready);
    return ok({ photos });
  });
}
