import { after } from "next/server";
import { z } from "zod";

import { registerUser, type RegisterError } from "@/lib/auth-core";
import { handle } from "@/lib/api/errors";
import { ok, fail } from "@/lib/api/respond";
import { getClientIp, requireTurnstile } from "@/lib/api/security";
import { parseBody } from "@/lib/api/validate";
import { sendVerificationEmail } from "@/lib/email";
import { enforceAuthRateLimit } from "@/lib/rate-limit";
import { countryCodeFromHeaders } from "@/lib/residence";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const HOUR = 60 * 60 * 1000;

const Body = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  /** Cloudflare Turnstile token — required in production (see security note). */
  turnstileToken: z.string().nullish(),
});

// English fallback copy; the client switches on the stable `code`.
const MESSAGES: Record<RegisterError, string> = {
  invalid_name: "Name is required",
  invalid_email: "Invalid email address",
  weak_password: "Password is too short",
  email_taken: "This email is already registered",
  oauth_only: "This email is already registered with Google",
  duplicate_registration:
    "This registration needs review. Please sign in to your existing account or contact support.",
  signup_rate_limited:
    "Too many new accounts from this connection. Please try again later.",
  failed: "Could not create the account",
};

/**
 * POST /api/v1/auth/register
 *
 * Creates an email/password account (unverified) and sends a verification
 * email. Returns no tokens — login is gated on email verification, same as
 * the website.
 *
 * Abuse protection (defense in depth):
 *  1. Rate limit by IP + email (caps volume before any expensive work).
 *  2. Turnstile — hard-required in production; a script can't get a token,
 *     so it can't make us send verification emails.
 *  3. Shared new-account gate checks recent same-connection identities and
 *     caps new accounts across email and OAuth registration routes.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const body = await parseBody(req, Body);
    const ip = getClientIp(req);

    await enforceAuthRateLimit({
      action: "register",
      ip,
      email: body.email,
      ipLimit: 5,
      emailLimit: 3,
      windowMs: HOUR,
    });
    await requireTurnstile(body.turnstileToken, ip);

    const result = await registerUser({
      name: body.name,
      email: body.email,
      password: body.password,
      residenceCountryCode: countryCodeFromHeaders(req.headers),
      ip,
    });
    if (!result.ok) {
      const status =
        result.error === "signup_rate_limited"
          ? 429
          : result.error === "email_taken" ||
              result.error === "duplicate_registration"
            ? 409
            : 422;
      return fail(status, result.error, MESSAGES[result.error]);
    }

    const { email, name, verifyToken, verifyCode } = result;
    after(async () => {
      try {
        await sendVerificationEmail({
          to: email,
          name,
          token: verifyToken,
          code: verifyCode,
        });
      } catch (err) {
        console.warn(
          "[api/v1/register] verification email failed:",
          (err as Error).message,
        );
      }
    });

    return ok({ ok: true, requiresVerification: true, email }, 201);
  });
}
