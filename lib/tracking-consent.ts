import { isSensitiveTokenPath } from "@/lib/privacy/sensitive-routes";

export const TRACKING_CONSENT_COOKIE = "vivida_tracking_consent";
export const TRACKING_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
/** localStorage mirror of the cookie choice, so a pruned cookie can't re-ask. */
export const TRACKING_CONSENT_STORAGE_KEY = "vivida_tracking_consent_v1";

export type TrackingConsent = "granted" | "denied" | null;

export function trackingConsentFromCookieString(
  cookieString: string,
): TrackingConsent {
  const entry = cookieString
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${TRACKING_CONSENT_COOKIE}=`));
  const value = entry?.slice(TRACKING_CONSENT_COOKIE.length + 1);
  return value === "granted" || value === "denied" ? value : null;
}

export function browserTrackingConsent(): TrackingConsent {
  if (typeof document === "undefined") return null;
  const fromCookie = trackingConsentFromCookieString(document.cookie);
  if (fromCookie) return fromCookie;
  // Fallback for browsers that block or prune the cookie: remember the choice
  // locally too, so the panel does not reappear on every visit.
  try {
    const stored = window.localStorage.getItem(TRACKING_CONSENT_STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    return null;
  }
}

/** Mirror a choice into localStorage (cookie is still the primary record). */
export function rememberTrackingConsent(value: "granted" | "denied"): void {
  try {
    window.localStorage.setItem(TRACKING_CONSENT_STORAGE_KEY, value);
  } catch {
    /* private mode, the cookie remains the record */
  }
}

export function browserTrackingAllowed(): boolean {
  if (typeof window === "undefined") return false;
  // Consent never authorizes third-party calls from bearer-token pages.
  if (isSensitiveTokenPath(window.location.pathname)) return false;
  return browserTrackingConsent() === "granted";
}
