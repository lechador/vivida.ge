import { browserTrackingAllowed } from "@/lib/tracking-consent";

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
    __vividaFbQueue?: Array<{
      event: StandardEvent;
      params?: Record<string, unknown>;
      eventId?: string;
    }>;
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

function dispatch(
  event: StandardEvent,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (!window.fbq) return false;
  const options = eventId ? { eventID: eventId } : undefined;
  if (params) window.fbq("track", event, params, options);
  else window.fbq("track", event, {}, options);
  return true;
}

export function fbTrack(
  event: StandardEvent,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (typeof window === "undefined") return;
  if (!browserTrackingAllowed()) return;
  if (dispatch(event, params, eventId)) return;
  window.__vividaFbQueue ??= [];
  window.__vividaFbQueue.push({ event, params, eventId });
}

/** Track a custom (non-standard) event. Useful for funnel-specific signals. */
export function fbTrackCustom(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!browserTrackingAllowed()) return;
  if (!window.fbq) return;
  if (params) window.fbq("trackCustom", name, params);
  else window.fbq("trackCustom", name);
}

export function flushFbQueue() {
  if (typeof window === "undefined" || !window.fbq) return;
  const queue = window.__vividaFbQueue ?? [];
  window.__vividaFbQueue = [];
  for (const item of queue) {
    dispatch(item.event, item.params, item.eventId);
  }
}
