import { headers } from "next/headers";

import { isEnglishHost } from "@/lib/seo/locales";

import {
  normalizeUserLocale,
  type UserLocale,
} from "./locale";

/**
 * Resolve the interface language without querying the database.
 *
 * The international domain is authoritative: every request served from
 * vividaastro.com is English, including signed-out and newly-created users.
 * The Georgian domain is equally authoritative in the other direction for
 * anything a crawler can reach — see getRequestLocale.
 */
export function localeForHost(
  host: string | null | undefined,
  preferred?: string | null,
): UserLocale {
  if (isEnglishHost(host)) return "en";
  return normalizeUserLocale(preferred);
}

/**
 * Request-aware locale for Server Components and Server Actions.
 *
 * The host decides, and a `preferred` value (the signed-in user's
 * `interfaceLanguage`) is honoured only on the Georgian host. There is
 * deliberately NO cookie fallback: public pages call this with no argument, so
 * dropping it makes every indexable URL render exactly one language.
 *
 * The cookie used to be consulted here, which meant the SAME Georgian URL
 * rendered English for some visitors — and, worse, emitted their metadata to
 * match: www.vivida.ge/horoskopi advertised `canonical:
 * https://www.vividaastro.com/horoskopi`, pointing a Georgian money page at the
 * other domain. Canonical, hreflang and <html lang> must be a function of the
 * URL alone. Signed-in surfaces (/dashboard, /account, /report) still pass
 * `preferred` and still switch language; they are robots-disallowed, so no
 * indexable page varies by user.
 */
export async function getRequestLocale(
  preferred?: string | null,
): Promise<UserLocale> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (isEnglishHost(host)) return "en";
  return normalizeUserLocale(preferred);
}

export async function requestIsEnglish(
  preferred?: string | null,
): Promise<boolean> {
  return (await getRequestLocale(preferred)) === "en";
}

/**
 * Is this request being served from the English domain?
 *
 * Distinct from `requestIsEnglish()`: that asks which language to render (a
 * signed-in user can read English on the Georgian host), this asks which site
 * the URL belongs to — which is what decides whether an internal link resolves.
 */
export async function requestIsEnglishHost(): Promise<boolean> {
  const requestHeaders = await headers();
  return isEnglishHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
  );
}
