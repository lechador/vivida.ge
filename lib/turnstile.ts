/**
 * Cloudflare Turnstile server-side verification.
 *
 * Every server action that accepts a Turnstile token (signup, login,
 * forgot-password) calls `verifyTurnstile()` before doing real work. We
 * fail-closed: missing/expired/replayed tokens always fall through.
 *
 * In dev, if `TURNSTILE_SECRET_KEY` is unset we log and let the request
 * pass — that way you can develop forms without a Cloudflare account.
 * Production deploys MUST have the secret set; the absent-key path is
 * intentionally noisy in console output so it's hard to ship by accident.
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileConfigured(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn(
      "[turnstile] TURNSTILE_SECRET_KEY missing — accepting request without verification (dev-only path)"
    );
    return true;
  }
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!res.ok) {
      console.warn("[turnstile] siteverify HTTP error:", res.status);
      return false;
    }
    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (!data.success) {
      console.warn(
        "[turnstile] verification failed:",
        data["error-codes"] ?? "unknown"
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn(
      "[turnstile] siteverify network error:",
      (err as Error).message
    );
    return false;
  }
}

/** Generic Georgian-language error returned to clients on Turnstile failures. */
export const TURNSTILE_ERROR_KA =
  "ბოტი ხარ? გთხოვ, ცადო ხელახლა.";
