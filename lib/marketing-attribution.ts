export const ATTRIBUTION_COOKIE = "vivida_attribution";
export const ATTRIBUTION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90;

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "campaign_id",
  "adset_id",
  "ad_id",
  "fbclid",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];
export type AttributionTouch = Partial<Record<AttributionKey, string>> & {
  landing_path?: string;
  captured_at?: string;
};

export type MarketingAttribution = {
  first: AttributionTouch;
  last: AttributionTouch;
};

function cleanValue(value: string | null | undefined): string | undefined {
  const clean = value?.trim();
  return clean ? clean.slice(0, 300) : undefined;
}

export function attributionTouchFromSearchParams(
  searchParams: URLSearchParams,
  pathname: string,
): AttributionTouch | null {
  const touch: AttributionTouch = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = cleanValue(searchParams.get(key));
    if (value) touch[key] = value;
  }
  if (!Object.keys(touch).length) return null;
  touch.landing_path = pathname.slice(0, 500);
  touch.captured_at = new Date().toISOString();
  return touch;
}

export function serializeAttribution(value: MarketingAttribution): string {
  return encodeURIComponent(JSON.stringify(value));
}

export function parseAttribution(
  raw: string | null | undefined,
): MarketingAttribution | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const value = parsed as { first?: unknown; last?: unknown };
    if (!value.first || typeof value.first !== "object") return null;
    if (!value.last || typeof value.last !== "object") return null;
    return value as MarketingAttribution;
  } catch {
    return null;
  }
}
