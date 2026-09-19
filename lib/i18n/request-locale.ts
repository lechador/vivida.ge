import { cookies, headers } from "next/headers";

import { isEnglishHost } from "@/lib/seo/locales";

import type { UserLocale } from "./locale";

/** Surviving language-choice cookie: only ever promotes English now. */
const LOCALE_CHOICE_COOKIE = "vivida_lang";

const DEPLOYMENT_LOCALE =
  process.env.VIVIDA_DEPLOYMENT_LOCALE === "ka" ||
  process.env.VIVIDA_DEPLOYMENT_LOCALE === "en"
    ? process.env.VIVIDA_DEPLOYMENT_LOCALE
    : null;

/**
 * Resolve the interface language without querying the database.
 *
 * The domain decides, and nothing overrides it. vivida.ge is the Georgian
 * site: every request it serves renders Georgian, signed in or out, whatever
 * `users.interfaceLanguage` happens to say. vividaastro.com is the
 * international site and renders English.
 */
export function localeForHost(
  host: string | null | undefined,
  _preferred?: string | null,
): UserLocale {
  void _preferred; // The domain decides; kept for call-site compatibility.
  if (!isEnglishHost(host)) return "ka";
  return "en";
}

/**
 * Request-aware locale for Server Components and Server Actions.
 */
export async function getRequestLocale(
  _preferred?: string | null,
): Promise<UserLocale> {
  void _preferred; // The domain decides; kept for call-site compatibility.
  // Cost-optimized split deployments set a build-time locale, making public
  // pages truly static/ISR because no request-time API is touched.
  if (DEPLOYMENT_LOCALE) {
    return DEPLOYMENT_LOCALE;
  }

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  // vivida.ge is Georgian, full stop; anything else is English.
  if (!isEnglishHost(host)) return "ka";
  return "en";
}

/**
 * The locale to persist on a newly created account.
 *
 * Distinct from `getRequestLocale()` because sign-up happens on shared,
 * unprefixed routes. A stored `en` preference on the English host is the
 * only non-default outcome; legacy `am` values normalize to English.
 *
 * Only consulted at account creation. Deliberately NOT part of the general
 * locale resolution, where a cookie deciding language would make the same URL
 * render differently for different visitors.
 */
export async function getSignupLocale(): Promise<UserLocale> {
  const locale = await getRequestLocale();
  if (locale !== "en") return locale;

  const cookieStore = await cookies();
  if (cookieStore.get(LOCALE_CHOICE_COOKIE)?.value === "en") return "en";

  return locale;
}

export async function requestIsEnglish(
  preferred?: string | null,
): Promise<boolean> {
  return (await getRequestLocale(preferred)) === "en";
}

/**
 * Is this request being served from the English domain?
 *
 * Distinct from `requestIsEnglish()`: that asks which language to render,
 * this asks which site the URL belongs to — which is what decides whether an
 * internal link resolves.
 */
export async function requestIsEnglishHost(): Promise<boolean> {
  if (DEPLOYMENT_LOCALE) return DEPLOYMENT_LOCALE !== "ka";
  const requestHeaders = await headers();
  return isEnglishHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
  );
}

// Re-exported so existing imports keep working; Armenian no longer exists,
// so every stored value resolves to a supported locale.
export { normalizeUserLocale } from "./locale";
