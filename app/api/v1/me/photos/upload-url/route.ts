import { z } from "zod";

import { requireMobileUser } from "@/lib/api/auth";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { createPhotoUpload } from "@/lib/photos-core";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  contentType: z.string(),
  contentLength: z.number(),
});

const CODE_STATUS: Record<string, number> = {
  storage_not_configured: 503,
  bad_request: 400,
  invalid_type: 400,
  too_large: 400,
  empty: 400,
  limit_reached: 400,
};

/**
 * POST /api/v1/me/photos/upload-url  { contentType, contentLength }
 *
 * Reserve a photo slot and return a presigned R2 upload URL. The client PUTs
 * the image bytes to `uploadUrl`, then calls .../finalize. Shares
 * createPhotoUpload() with the website's photo flow — same type/size limits
 * and per-user cap.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const user = await requireMobileUser(req);
    const input = await parseBody(req, Body);

    const result = await createPhotoUpload(user.id, input);
    if (!result.ok) {
      return fail(CODE_STATUS[result.code] ?? 400, result.code, result.code);
    }
    return ok(
      {
        photoId: result.photoId,
        uploadUrl: result.uploadUrl,
        publicUrl: result.publicUrl,
      },
      201
    );
  });
}
