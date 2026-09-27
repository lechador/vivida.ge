import { createRemoteJWKSet, jwtVerify } from "jose";
import { z } from "zod";

import { findOrCreateOAuthUser } from "@/lib/auth-core";
import { handle } from "@/lib/api/errors";
import { ACCESS_TTL_SECONDS, signAccessToken } from "@/lib/api/jwt";
import { issueRefreshToken } from "@/lib/api/refresh";
import { fail, ok } from "@/lib/api/respond";
import { parseBody } from "@/lib/api/validate";
import { countryCodeFromHeaders } from "@/lib/residence";
import { getClientIp } from "@/lib/api/security";

export const runtime = "nodejs";
export { OPTIONS } from "@/lib/api/cors";

const APPLE_ISSUER = "https://appleid.apple.com";
const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys"),
);
const DEFAULT_IOS_BUNDLE_ID = "ge.vivida.vividaApp";

const Body = z.object({
  idToken: z.string().min(1),
  // Apple supplies the name only during the first authorization.
  name: z.string().trim().min(1).max(200).nullish(),
});

function acceptedAudiences(): string[] {
  const configured = process.env.APPLE_MOBILE_CLIENT_IDS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return configured?.length ? configured : [DEFAULT_IOS_BUNDLE_ID];
}

/**
 * POST /api/v1/auth/apple
 *
 * Verifies the native AuthenticationServices identity token against Apple's
 * public keys, issuer and Vivida's iOS bundle ID. Apple includes the verified
 * email in the identity-token claims, including when Hide My Email is used.
 */
export async function POST(req: Request) {
  return handle(async () => {
    const { idToken, name } = await parseBody(req, Body);

    let payload;
    try {
      const result = await jwtVerify(idToken, APPLE_JWKS, {
        issuer: APPLE_ISSUER,
        audience: acceptedAudiences(),
      });
      payload = result.payload;
    } catch {
      return fail(401, "invalid_apple_token", "Invalid or expired Apple token");
    }

    const email = typeof payload.email === "string" ? payload.email : null;
    const emailVerified =
      payload.email_verified === true || payload.email_verified === "true";
    if (!email || !emailVerified || typeof payload.sub !== "string") {
      return fail(
        401,
        "apple_email_unverified",
        "Apple account email not verified",
      );
    }

    const user = await findOrCreateOAuthUser({
      email,
      name: name ?? null,
      image: null,
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
