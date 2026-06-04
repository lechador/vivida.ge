import { z } from "zod";

import { consumePasswordReset } from "@/lib/auth-core";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { getClientIp } from "@/lib/api/security";
import { parseBody } from "@/lib/api/validate";
import { enforceRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const HOUR = 60 * 60 * 1000;

const Body = z.object({
  token: z.string().min(1),
  password: z.string().min(1),
});

/**
 * POST /api/v1/auth/reset-password
 *
 * Completes a password reset using the token from the reset email. Lets
 * the Flutter app build its own reset screen instead of bouncing the user
 * to the website. On success the account is also marked email-verified.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const body = await parseBody(req, Body);

    // Cap token-guessing by IP. Tokens are 256-bit random so brute force is
    // infeasible anyway, but this bounds the attempt rate cheaply.
    await enforceRateLimit({
      bucket: "reset_password_ip",
      identifier: getClientIp(req),
      limit: 30,
      windowMs: HOUR,
    });

    const result = await consumePasswordReset(body);
    if (!result.ok) {
      const status = result.error === "weak_password" ? 422 : 400;
      const message =
        result.error === "weak_password"
          ? "Password is too short"
          : "Reset link is invalid or expired";
      return fail(status, result.error, message);
    }

    return ok({ ok: true });
  });
}
