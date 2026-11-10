/**
 * The ONE place that decides which market a request is priced in.
 *
 * Checkout routes, /credits, /subscription and every paywall label go through
 * this, so the price shown is the price charged. The residence a user can edit
 * in /account is deliberately not the primary signal: it exists for people
 * ranking, and letting it set the price let a US buyer pick Georgia and pay
 * lari prices. The request's IP country wins; stored residence is only a
 * fallback for requests without a geo header (local dev, some proxies).
 */
import { normalizeCountryCode } from "@/lib/billing-config";
import { isEnglishHost } from "@/lib/seo/locales";

type HeaderReader = { get(name: string): string | null };

export function ipCountryFromHeaders(headers: HeaderReader): string | null {
  return normalizeCountryCode(
    headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry"),
  );
}

export function pricingCountryForRequest(
  headers: HeaderReader,
  user?: {
    countryCode?: string | null;
    interfaceLanguage?: string | null;
  } | null,
): string {
  const ip = ipCountryFromHeaders(headers);
  if (ip) return ip;
  const stored = normalizeCountryCode(user?.countryCode);
  if (stored) return stored;
  // No country signal at all: price for the host's own market.
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  if (!isEnglishHost(host)) return "GE";
  const polish =
    headers.get("x-vivida-locale") === "pl" || user?.interfaceLanguage === "pl";
  return polish ? "PL" : "US";
}
