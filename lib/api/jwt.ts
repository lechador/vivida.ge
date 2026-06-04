import { SignJWT, jwtVerify } from "jose";

/**
 * Access-token signing/verification for the mobile API.
 *
 * Short-lived (15 min) HS256 JWTs. The client sends them as
 * `Authorization: Bearer <token>`; when one expires it calls
 * /api/v1/auth/refresh to mint a new pair. Signed with MOBILE_JWT_SECRET
 * (falls back to AUTH_SECRET, which is already set in every environment).
 */
const ACCESS_TTL = "15m";
const ISSUER = "vivida";
const AUDIENCE = "vivida-mobile";

function secret(): Uint8Array {
  const s = process.env.MOBILE_JWT_SECRET || process.env.AUTH_SECRET;
  if (!s) {
    throw new Error("MOBILE_JWT_SECRET or AUTH_SECRET must be set");
  }
  return new TextEncoder().encode(s);
}

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(ACCESS_TTL)
    .sign(secret());
}

/** Returns the userId (`sub`) or throws if the token is invalid/expired. */
export async function verifyAccessToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, secret(), {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  if (!payload.sub) {
    throw new Error("token missing sub");
  }
  return payload.sub;
}

/** Seconds until an access token expires — sent to the client as `expiresIn`. */
export const ACCESS_TTL_SECONDS = 15 * 60;
