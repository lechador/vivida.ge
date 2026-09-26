import type { BeforeSendEvent } from "@vercel/analytics/next";
import { isSensitiveTokenPath } from "@/lib/privacy/sensitive-routes";

const PRIVATE_DYNAMIC_PATHS: Array<[RegExp, string]> = [
  [/^\/r\/[^/]+(?:\/opengraph-image)?$/, "/r/[id]"],
  [/^\/reports\/[^/]+(?:\/download)?$/, "/reports/[id]"],
  [/^\/test-results\/[^/]+$/, "/test-results/[id]"],
  [/^\/big-five\/shedegi\/[^/]+$/, "/big-five/shedegi/[id]"],
  [/^\/eq-testi\/shedegi\/[^/]+$/, "/eq-testi/shedegi/[id]"],
  [/^\/iq-testi\/shedegi\/[^/]+$/, "/iq-testi/shedegi/[id]"],
  [/^\/synastry\/(?!new$)[^/]+$/, "/synastry/[id]"],
  [/^\/u\/[^/]+$/, "/u/[username]"],
  [/^\/feed\/[^/]+$/, "/feed/[postId]"],
];

/**
 * Vercel Analytics privacy boundary. Dynamic user-owned identifiers are
 * reduced to route templates and all query/hash values are removed before an
 * event leaves the browser. GA4 remains the attribution source of record.
 */
export function redactVercelAnalyticsEvent(
  event: BeforeSendEvent,
): BeforeSendEvent | null {
  try {
    const url = new URL(event.url);
    if (isSensitiveTokenPath(url.pathname)) return null;
    const matched = PRIVATE_DYNAMIC_PATHS.find(([pattern]) =>
      pattern.test(url.pathname),
    );
    if (matched) url.pathname = matched[1];
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
  } catch {
    return null;
  }
}
