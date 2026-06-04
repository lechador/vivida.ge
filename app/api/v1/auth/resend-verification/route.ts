import { after } from "next/server";
import { z } from "zod";

import { prepareVerificationResend } from "@/lib/auth-core";
import { handle } from "@/lib/api/errors";
import { ok } from "@/lib/api/respond";
import { getClientIp } from "@/lib/api/security";
import { parseBody } from "@/lib/api/validate";
import { sendVerificationEmail } from "@/lib/email";
import { enforceAuthRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const HOUR = 60 * 60 * 1000;

const Body = z.object({
  email: z.string().email(),
});

/**
 * POST /api/v1/auth/resend-verification
 *
 * Re-sends the verification email for an unverified account. Always
 * returns ok — we only actually send when the email maps to an
 * unverified password user, so the endpoint can't be used to probe which
 * emails exist.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const { email } = await parseBody(req, Body);

    await enforceAuthRateLimit({
      action: "resend_verification",
      ip: getClientIp(req),
      email,
      ipLimit: 5,
      emailLimit: 3,
      windowMs: HOUR,
    });

    const dispatch = await prepareVerificationResend(email);
    if (dispatch.send) {
      const { email: to, name, token } = dispatch;
      after(async () => {
        try {
          await sendVerificationEmail({ to, name, token });
        } catch (err) {
          console.warn(
            "[api/v1/resend-verification] send failed:",
            (err as Error).message
          );
        }
      });
    }

    return ok({ ok: true });
  });
}
