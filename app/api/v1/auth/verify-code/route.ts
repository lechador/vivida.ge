import { z } from "zod";

import { consumeEmailVerifyCode } from "@/lib/auth-core";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { getClientIp } from "@/lib/api/security";
import { parseBody } from "@/lib/api/validate";
import { enforceAuthRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const TEN_MIN = 10 * 60 * 1000;

const Body = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

/**
 * POST /api/v1/auth/verify-code  { email, code }
 *
 * Verify an account with the 6-digit code from the email — the OTP path
 * that mirrors the website's verifyEmailWithCode. Rate-limited hard by IP +
 * email since a 6-digit code is small. On success the account is verified
 * and the client can proceed to login.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const { email, code } = await parseBody(req, Body);

    await enforceAuthRateLimit({
      action: "verify_code",
      ip: getClientIp(req),
      email,
      ipLimit: 30,
      emailLimit: 8,
      windowMs: TEN_MIN,
    });

    const result = await consumeEmailVerifyCode({ email, code });
    if (!result.ok) {
      return fail(
        422,
        result.error === "expired" ? "code_expired" : "code_invalid",
        result.error === "expired"
          ? "The code has expired. Request a new one."
          : "The code is invalid."
      );
    }

    return ok({ ok: true });
  });
}
