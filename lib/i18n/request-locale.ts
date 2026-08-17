import { cookies, headers } from "next/headers";

import { isEnglishHost } from "@/lib/seo/locales";

import { LOCALE_CHOICE_COOKIE, LOCALE_HEADER } from "./armenian-routes";
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
  // Same narrow rule as getRequestLocale: on the international host a stored
  // preference may select Armenian (which owns no domain of its own) but never
  // Georgian (which does, and is the default value for every user).
  if (isEnglishHost(host)) {
    return normalizeUserLocale(preferred) === "am" ? "am" : "en";
  }
  return normalizeUserLocale(preferred);
}

/**
 * Request-aware locale for Server Components and Server Actions.
 */
export async function getRequestLocale(
  preferred?: string | null,
): Promise<UserLocale> {
  const requestHeaders = await headers();

  // Set by proxy.ts from the `/am` path prefix. It outranks the host because
  // Armenian shares the international domain with English — the URL is the
  // only thing that separates them.
  if (requestHeaders.get(LOCALE_HEADER) === "am") return "am";

  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (isEnglishHost(host)) {
    // Armenian is the only locale with no domain of its own: Georgian owns
    // vivida.ge, English owns vividaastro.com, and Armenian is a path prefix
    // on the latter. Authenticated surfaces carry no `/am` prefix, so without
    // this a user who explicitly picked Հայերեն in account settings could
    // never be served it once signed in — the setting was unreachable here.
    //
    // Deliberately narrow: a stored preference may select Armenian, never
    // Georgian. `users.interfaceLanguage` defaults to "ka" for everyone, so
    // honouring a Georgian preference here would hand Georgian to every user
    // still sitting on that default. Georgian has its own domain to be
    // reached on; Armenian does not.
    return normalizeUserLocale(preferred) === "am" ? "am" : "en";
  }
  return normalizeUserLocale(preferred);
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
  const requestHeaders = await headers();
  if (requestHeaders.get(LOCALE_HEADER) === "am") return "am";

  const cookieStore = await cookies();
  if (cookieStore.get(LOCALE_CHOICE_COOKIE)?.value === "am") return "am";

  return getRequestLocale();
}

/** Is this request being served from the Armenian `/am` URL space? */
export async function requestIsArmenianPath(): Promise<boolean> {
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
  const requestHeaders = await headers();
  return isEnglishHost(
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"),
  );
}
