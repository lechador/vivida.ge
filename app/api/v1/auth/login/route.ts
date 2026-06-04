import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { handle } from "@/lib/api/errors";
import { ACCESS_TTL_SECONDS, signAccessToken } from "@/lib/api/jwt";
import { issueRefreshToken } from "@/lib/api/refresh";
import { ok, fail } from "@/lib/api/respond";
import { getClientIp } from "@/lib/api/security";
import { toPublicUser } from "@/lib/api/serialize";
import { parseBody } from "@/lib/api/validate";
import { enforceAuthRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const FIFTEEN_MIN = 15 * 60 * 1000;

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * POST /api/v1/auth/login
 *
 * Email/password login for the mobile app. Mirrors the website's
 * Credentials provider (auth.ts): same bcrypt check, same
 * email-verification gate — but returns a JWT access token + refresh
 * token instead of setting a session cookie.
 *
 * Protection is rate-limit-only (no Turnstile) — chosen for a smoother
 * login UX. The per-IP + per-email caps below bound brute-force and
 * credential-stuffing without a bot challenge.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const { email, password } = await parseBody(req, Body);
    const ip = getClientIp(req);

    // Cap brute-force / credential-stuffing before we burn bcrypt CPU.
    await enforceAuthRateLimit({
      action: "login",
      ip,
      email,
      ipLimit: 20,
      emailLimit: 10,
      windowMs: FIFTEEN_MIN,
    });

    const normalized = email.trim().toLowerCase();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalized))
      .limit(1);

    // Uniform error — never leak whether it was the email or the password.
    if (!user || !user.passwordHash) {
      return fail(401, "invalid_credentials", "Incorrect email or password");
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return fail(401, "invalid_credentials", "Incorrect email or password");
    }
    if (!user.emailVerified) {
      return fail(403, "email_not_verified", "Email address not verified");
    }

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await issueRefreshToken(
      user.id,
      req.headers.get("user-agent")
    );

    return ok({
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: ACCESS_TTL_SECONDS,
      user: toPublicUser(user),
    });
  });
}
