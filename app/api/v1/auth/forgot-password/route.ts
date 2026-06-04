import { after } from "next/server";
import { z } from "zod";

import { preparePasswordReset } from "@/lib/auth-core";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { getClientIp, requireTurnstile } from "@/lib/api/security";
import { parseBody } from "@/lib/api/validate";
import { sendPasswordResetEmail } from "@/lib/email";
import { enforceAuthRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const HOUR = 60 * 60 * 1000;

const Body = z.object({
  email: z.string().email(),
  /** Cloudflare Turnstile token — required in production. */
  turnstileToken: z.string().nullish(),
});

/**
 * POST /api/v1/auth/forgot-password
 *
 * Sends a password-reset email. Always returns ok (privacy: no
 * account-existence oracle). Protected by per-IP/per-email rate limiting
 * plus a hard Turnstile gate, so it can't be used to bomb a victim's
 * inbox or burn our email quota.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const body = await parseBody(req, Body);
    const ip = getClientIp(req);

    await enforceAuthRateLimit({
      action: "forgot_password",
      ip,
      email: body.email,
      ipLimit: 5,
      emailLimit: 3,
      windowMs: HOUR,
    });
    await requireTurnstile(body.turnstileToken, ip);

    const dispatch = await preparePasswordReset(body.email);
    if (dispatch.send) {
      const { email: to, name, token } = dispatch;
      after(async () => {
        try {
          await sendPasswordResetEmail({ to, name, token });
        } catch (err) {
          console.warn(
            "[api/v1/forgot-password] send failed:",
            (err as Error).message
          );
        }
      });
    }

    return ok({ ok: true });
  });
}
