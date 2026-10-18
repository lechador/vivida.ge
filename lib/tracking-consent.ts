export type TrackingConsent = "granted" | "denied" | "unset";

export const TRACKING_CONSENT_COOKIE = "vivida_tracking_consent";
export const TRACKING_CONSENT_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

export function trackingConsentFromCookieString(
  cookieHeader: string | null | undefined,
): TrackingConsent {
  if (!cookieHeader) return "unset";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${TRACKING_CONSENT_COOKIE}=([^;]+)`),
  );
  const val = match?.[1]?.trim();
  if (val === "granted" || val === "denied") return val;
  return "unset";
}

export function browserTrackingConsent(): TrackingConsent {
  if (typeof document === "undefined") return "unset";
  return trackingConsentFromCookieString(document.cookie);
}

export function browserTrackingAllowed(): boolean {
  return browserTrackingConsent() !== "denied";
}
