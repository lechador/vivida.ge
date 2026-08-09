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

/**
 * GA4 reserves these event-parameter names for campaign attribution. Sending
 * one on an ordinary event silently rewrites the session's source/medium — a
 * `{ source: "natal_calculator" }` param is what put ~150 sessions/2wk into the
 * "Unassigned" channel as `natal_calculator / (not set)`. Describe where an
 * event came from with a neutral key (`widget`, `test`, `method`) instead.
 */
const RESERVED_CAMPAIGN_PARAMS = new Set([
  "source",
  "medium",
  "campaign",
  "campaign_id",
  "term",
  "content",
  "source_platform",
  "creative_format",
  "marketing_tactic",
]);

function stripCampaignParams(params: GtagParams): GtagParams {
  const safe: GtagParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (RESERVED_CAMPAIGN_PARAMS.has(key)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[analytics] dropped reserved GA4 campaign param "${key}" — it would overwrite session attribution. Rename it (e.g. "widget").`
        );
      }
      continue;
    }
    safe[key] = value;
  }
  return safe;
}

export function trackEvent(name: string, params?: GtagParams): void {
  if (typeof window === "undefined") return;
  const gtag = (
    window as unknown as {
      gtag?: (command: string, eventName: string, params?: GtagParams) => void;
    }
  ).gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", name, params && stripCampaignParams(params));
  } catch {
    /* analytics must never break the app */
  }
}
