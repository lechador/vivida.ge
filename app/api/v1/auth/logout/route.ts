import { z } from "zod";

import { handle } from "@/lib/api/errors";
import { revokeRefreshToken } from "@/lib/api/refresh";
import { ok } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const Body = z.object({
  refreshToken: z.string().min(1),
});

/**
 * POST /api/v1/auth/logout
 *
 * Revokes the given refresh token so it can't be rotated again. The
 * access token is short-lived and left to expire on its own. Always
 * returns ok — logging out an already-invalid token is not an error.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const { refreshToken } = await parseBody(req, Body);
    await revokeRefreshToken(refreshToken);
    return ok({ ok: true });
  });
}
