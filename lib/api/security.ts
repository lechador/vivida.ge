import { verifyTurnstile } from "@/lib/turnstile";

import { ApiError } from "./errors";

/**
 * Best-effort client IP for rate-limiting and Turnstile's remoteip check.
 *
 * On Vercel the real client IP is the left-most entry of x-forwarded-for
 * (Vercel appends its own proxy hops). Falls back to x-real-ip, then to a
 * constant so a missing header degrades to one coarse shared bucket rather
 * than disabling the limiter entirely.
 */
export function clientIpFromHeaders(headers: Pick<Headers, "get">): string {
  // Vercel overwrites forwarded IP headers at its edge. Prefer its dedicated
  // copy so any extra proxy in front of the app cannot replace the value.
  const fwd =
    (process.env.VERCEL ? headers.get("x-vercel-forwarded-for") : null) ??
    headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function getClientIp(req: Request): string {
  return clientIpFromHeaders(req.headers);
}

/**
 * Hard Turnstile gate for the mobile API. Throws 403 unless the token
 * verifies. Mirrors the website's bot protection: in production (secret
 * set) a request without a valid token is rejected; in local dev (no
 * secret) verifyTurnstile fails open so you can test with curl.
 */
export async function requireTurnstile(
  token: string | null | undefined,
  ip: string | null,
): Promise<void> {
  const human = await verifyTurnstile(token, ip);
  if (!human) {
    throw new ApiError(
      403,
      "turnstile_failed",
      "Bot verification failed. Please try again.",
    );
  }
}
