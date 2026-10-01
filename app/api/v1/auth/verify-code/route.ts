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
  password: z.string().min(1),
});

/**
 * POST /api/v1/auth/verify-code  { email, code, password }
 *
 * Verify an account with the 6-digit code from the email — the OTP path
 * that mirrors the website's verifyEmailWithCode. Rate-limited hard by IP +
 * email since a 6-digit code is small. On success the account is verified
 * and the client can proceed to login. The inbox owner chooses the final
 * password here, so a preregistration by someone else cannot leave behind
 * a usable attacker-chosen password.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const { email, code, password } = await parseBody(req, Body);

    await enforceAuthRateLimit({
      action: "verify_code",
      ip: getClientIp(req),
      email,
      ipLimit: 30,
      emailLimit: 8,
      windowMs: TEN_MIN,
    });

    const result = await consumeEmailVerifyCode({ email, code, password });
    if (!result.ok) {
      return fail(
        result.error === "weak_password" ? 422 : 400,
        result.error === "weak_password"
          ? "weak_password"
          : result.error === "expired"
            ? "code_expired"
            : "code_invalid",
        result.error === "weak_password"
          ? "Password must be at least 8 characters."
          : result.error === "expired"
            ? "The code has expired. Request a new one."
            : "The code is invalid.",
      );
    }

    return ok({ ok: true });
  });
}
