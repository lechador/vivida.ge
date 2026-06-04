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
export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Hard Turnstile gate for the mobile API. Throws 403 unless the token
 * verifies. Mirrors the website's bot protection: in production (secret
 * set) a request without a valid token is rejected; in local dev (no
 * secret) verifyTurnstile fails open so you can test with curl.
 */
export async function requireTurnstile(
  token: string | null | undefined,
  ip: string | null
): Promise<void> {
  const human = await verifyTurnstile(token, ip);
  if (!human) {
    throw new ApiError(
      403,
      "turnstile_failed",
      "Bot verification failed. Please try again."
    );
  }
}
