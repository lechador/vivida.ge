/**
 * Best-effort client IP for rate limiting and Turnstile's remoteip check.
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
