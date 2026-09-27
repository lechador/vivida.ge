import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";

import { findOrCreateOAuthUser } from "@/lib/auth-core";
import { handle } from "@/lib/api/errors";
import { ACCESS_TTL_SECONDS, signAccessToken } from "@/lib/api/jwt";
import { issueRefreshToken } from "@/lib/api/refresh";
import { ok, fail } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { countryCodeFromHeaders } from "@/lib/residence";
import { getClientIp } from "@/lib/api/security";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

// Google's public signing keys (cached across requests by jose).
const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

const Body = z.object({
  idToken: z.string().min(1),
});

/**
 * Accepted token audiences. The mobile app should request the ID token with
 * `serverClientId = GOOGLE_CLIENT_ID` (the website's existing Web OAuth
 * client), so the token's `aud` matches it. Extra native client IDs can be
 * added via GOOGLE_MOBILE_CLIENT_IDS (comma-separated) if needed.
 */
function acceptedAudiences(): string[] {
  return [
    process.env.GOOGLE_CLIENT_ID,
    ...(process.env.GOOGLE_MOBILE_CLIENT_IDS?.split(",") ?? []),
  ]
    .map((s) => s?.trim())
    .filter((s): s is string => !!s);
}

/**
 * POST /api/v1/auth/google
 *
 * Native Google sign-in: the app authenticates with Google's SDK and sends
 * the resulting ID token here. We verify it against Google's keys, then
 * find-or-create the user and return our own access + refresh tokens — same
 * token shape as /auth/login.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const { idToken } = await parseBody(req, Body);

    const audiences = acceptedAudiences();
    if (audiences.length === 0) {
      return fail(
        503,
        "google_not_configured",
        "Google sign-in is not configured",
      );
    }

    let payload;
    try {
      const result = await jwtVerify(idToken, GOOGLE_JWKS, {
        issuer: GOOGLE_ISSUERS,
        audience: audiences,
      });
      payload = result.payload;
    } catch {
      return fail(
        401,
        "invalid_google_token",
        "Invalid or expired Google token",
      );
    }

    const email = typeof payload.email === "string" ? payload.email : null;
    const emailVerified =
      payload.email_verified === true || payload.email_verified === "true";
    if (!email || !emailVerified) {
      return fail(
        401,
        "google_email_unverified",
        "Google account email not verified",
      );
    }

    const user = await findOrCreateOAuthUser({
      email,
      name: typeof payload.name === "string" ? payload.name : null,
      image: typeof payload.picture === "string" ? payload.picture : null,
      residenceCountryCode: countryCodeFromHeaders(req.headers),
      ip: getClientIp(req),
    });

    const accessToken = await signAccessToken(user.userId);
    const refreshToken = await issueRefreshToken(
      user.userId,
      req.headers.get("user-agent"),
    );

    return ok({
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: ACCESS_TTL_SECONDS,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  });
}
