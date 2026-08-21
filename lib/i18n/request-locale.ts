import { cookies, headers } from "next/headers";

import { isEnglishHost } from "@/lib/seo/locales";

import { LOCALE_CHOICE_COOKIE, LOCALE_HEADER } from "./armenian-routes";
import {
  normalizeUserLocale,
  type UserLocale,
} from "./locale";

const DEPLOYMENT_LOCALE =
  process.env.VIVIDA_DEPLOYMENT_LOCALE === "ka" ||
  process.env.VIVIDA_DEPLOYMENT_LOCALE === "en" ||
  process.env.VIVIDA_DEPLOYMENT_LOCALE === "am"
    ? process.env.VIVIDA_DEPLOYMENT_LOCALE
    : null;

/**
 * Resolve the interface language without querying the database.
 *
 * The domain decides, and nothing overrides it. vivida.ge is the Georgian
 * site: every request it serves renders Georgian, signed in or out, whatever
 * `users.interfaceLanguage` happens to say. vividaastro.com is the
 * international site, where English is the default and Armenian is the one
 * language a stored preference may still select — see getRequestLocale.
 */
export function localeForHost(
  host: string | null | undefined,
  preferred?: string | null,
): UserLocale {
  if (!isEnglishHost(host)) return "ka";
  return normalizeUserLocale(preferred) === "am" ? "am" : "en";
}

/**
 * Request-aware locale for Server Components and Server Actions.
 */
export async function getRequestLocale(
  preferred?: string | null,
): Promise<UserLocale> {
  // Cost-optimized split deployments set a build-time locale, making public
  // pages truly static/ISR because no request-time API is touched. On the
  // English app an authenticated user's explicit Armenian preference remains
  // valid; Georgian deployments stay Georgian unconditionally.
  if (DEPLOYMENT_LOCALE) {
    if (
      DEPLOYMENT_LOCALE === "en" &&
      normalizeUserLocale(preferred) === "am"
    ) {
      return "am";
    }
    return DEPLOYMENT_LOCALE;
  }

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  // vivida.ge is Georgian, full stop.
  //
  // It used to honour `users.interfaceLanguage` here, on the reasoning that
  // the authed surfaces are robots-disallowed so no indexable URL could vary.
  // What that missed is that only *some* surfaces pass the preference through:
  // the layout, the nav and every public page call this with no argument, so a
  // single account sitting on "am" or "en" saw one page in three languages at
  // once. A domain that is the Georgian site cannot render a language its
  // reader did not ask this domain for. Anyone who wants English or Armenian
  // has vividaastro.com to read it on.
  if (!isEnglishHost(host)) return "ka";

  // Set by proxy.ts from the `/am` path prefix. It outranks the preference
  // because Armenian shares the international domain with English — the URL is
  // the only thing that separates them.
  if (requestHeaders.get(LOCALE_HEADER) === "am") return "am";

  // Armenian is the only locale with no domain of its own: Georgian owns
  // vivida.ge, English owns vividaastro.com, and Armenian is a path prefix on
  // the latter. Authenticated surfaces carry no `/am` prefix, so without this
  // a user who explicitly picked Հայերեն in account settings could never be
  // served it once signed in — the setting was unreachable here.
  //
  // Deliberately narrow: a stored preference may select Armenian, never
  // Georgian. `users.interfaceLanguage` defaults to "ka" for everyone, so
  // honouring a Georgian preference here would hand Georgian to every visitor
  // still sitting on that default.
  return normalizeUserLocale(preferred) === "am" ? "am" : "en";
}

/**
 * The locale to persist on a newly created account.
 *
 * Distinct from `getRequestLocale()` because sign-up happens *outside* the
 * Armenian URL space: `/login` and `/signup` are shared, unprefixed routes, so
 * by the time the form posts there is no `/am` left to read and the host says
 * "English". Every Armenian sign-up was therefore stamped `en` (or `ka` via
 * Google), which no later request could undo — the account was simply wrong
 * from birth.
 *
 * The `vivida_lang` cookie is the surviving evidence: proxy.ts sets it both
 * when the geo redirect fires and whenever an Armenian page is served, so
 * anyone who reached sign-up *through* the Armenian site carries it.
 *
 * Only consulted at account creation. Deliberately NOT part of the general
 * locale resolution, where a cookie deciding language would make the same URL
 * render differently for different visitors — which is exactly the trap the
 * earlier locale cookie was removed to escape.
 */
export async function getSignupLocale(): Promise<UserLocale> {
  // Resolve the host first: the cookie below may only ever promote English to
  // Armenian, never reach across to the Georgian domain. `vivida_lang` is
  // scoped to vividaastro.com so it cannot be sent to vivida.ge anyway, but a
  // sign-up that stamps the wrong language is invisible until the user's whole
  // account is in it — worth being explicit rather than merely lucky.
  const locale = await getRequestLocale();
  if (locale !== "en") return locale;

  const cookieStore = await cookies();
  if (cookieStore.get(LOCALE_CHOICE_COOKIE)?.value === "am") return "am";

  return locale;
}

/** Is this request being served from the Armenian `/am` URL space? */
export async function requestIsArmenianPath(): Promise<boolean> {
  if (DEPLOYMENT_LOCALE) return DEPLOYMENT_LOCALE === "am";
  const requestHeaders = await headers();
  return requestHeaders.get(LOCALE_HEADER) === "am";
}

export async function requestIsEnglish(
  preferred?: string | null,
): Promise<boolean> {
  return (await getRequestLocale(preferred)) === "en";
}

export async function requestIsArmenian(
  preferred?: string | null,
): Promise<boolean> {
  return (await getRequestLocale(preferred)) === "am";
}


/**
 * Is this request being served from the English domain?
 *
 * Distinct from `requestIsEnglish()`: that asks which language to render (a
 * signed-in user can read English on the Georgian host), this asks which site
 * the URL belongs to — which is what decides whether an internal link resolves.
 */
export async function requestIsEnglishHost(): Promise<boolean> {
  if (DEPLOYMENT_LOCALE) return DEPLOYMENT_LOCALE !== "ka";
  const requestHeaders = await headers();
  return isEnglishHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
  );
}
