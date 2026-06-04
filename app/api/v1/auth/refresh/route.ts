import { z } from "zod";

import { handle } from "@/lib/api/errors";
import { ACCESS_TTL_SECONDS, signAccessToken } from "@/lib/api/jwt";
import { rotateRefreshToken } from "@/lib/api/refresh";
import { ok, fail } from "@/lib/api/respond";
import { getClientIp } from "@/lib/api/security";
import { parseBody } from "@/lib/api/validate";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const FIFTEEN_MIN = 15 * 60 * 1000;

const Body = z.object({
  refreshToken: z.string().min(1),
});

/**
 * POST /api/v1/auth/refresh
 *
 * Exchanges a valid refresh token for a fresh access + refresh pair
 * (rotation — the old refresh token is revoked). The client calls this
 * when its access token is near/after expiry, then retries the original
 * request.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const { refreshToken } = await parseBody(req, Body);

    await enforceRateLimit({
      bucket: "refresh_ip",
      identifier: getClientIp(req),
      limit: 60,
      windowMs: FIFTEEN_MIN,
    });

    const rotated = await rotateRefreshToken(
      refreshToken,
      req.headers.get("user-agent")
    );
    if (!rotated) {
      return fail(401, "invalid_refresh", "Refresh token invalid or expired");
    }

    const accessToken = await signAccessToken(rotated.userId);
    return ok({
      accessToken,
      refreshToken: rotated.refreshToken,
      tokenType: "Bearer",
      expiresIn: ACCESS_TTL_SECONDS,
    });
  });
}
