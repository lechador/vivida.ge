import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { listOwnPhotos } from "@/lib/photos-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

/**
 * GET /api/v1/me/photos
 *
 * The authenticated user's own profile photos in display order, including
 * not-yet-ready uploads (so the client can show in-flight slots). Shares
 * listOwnPhotos() with the photo core.
 */
export async function GET(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const photos = await listOwnPhotos(user.id);
    return ok({ photos });
  });
}
