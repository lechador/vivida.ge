"use client";

/**
 * Thin, safe wrapper over the GA4 `gtag` that @next/third-parties installs in
 * production (see app/layout.tsx — GA is gated to NODE_ENV=production). When
 * gtag isn't loaded (dev / preview) this is a no-op, so call sites never have
 * to guard. Use for conversion events on the public acquisition funnel
 * (chart computed → email subscribed → register clicked), which — unlike raw
 * bounce rate — actually tell you whether the free tools convert.
 */
type GtagParams = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(name: string, params?: GtagParams): void {
  if (typeof window === "undefined") return;
  const gtag = (
    window as unknown as {
      gtag?: (command: string, eventName: string, params?: GtagParams) => void;
    }
  ).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", name, params);
  } catch {
    /* analytics must never break the app */
  }
}
