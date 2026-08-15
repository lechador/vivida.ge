export const TRACKING_CONSENT_COOKIE = "vivida_tracking_consent";
export const TRACKING_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

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
  return trackingConsentFromCookieString(document.cookie);
}

export function browserTrackingAllowed(): boolean {
  return browserTrackingConsent() === "granted";
}
