/**
 * Thin wrapper around the Meta Pixel client SDK. The pixel itself is loaded
 * once in `components/fb-pixel.tsx` (mounted at the root layout) — this
 * module just gives the rest of the app a typed, no-op-when-missing way to
 * fire conversion events.
 */

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: unknown;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
    };
    _fbq?: Window["fbq"];
  }
}

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? "";

export const FB_PIXEL_ENABLED = !!FB_PIXEL_ID;

type StandardEvent =
  | "PageView"
  | "Lead"
  | "CompleteRegistration"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Subscribe"
  | "Purchase"
  | "ViewContent";

export function fbTrack(event: StandardEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;
  if (params) window.fbq("track", event, params);
  else window.fbq("track", event);
}

/** Track a custom (non-standard) event. Useful for funnel-specific signals. */
export function fbTrackCustom(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!window.fbq) return;
  if (params) window.fbq("trackCustom", name, params);
  else window.fbq("trackCustom", name);
}
