import { headers } from "next/headers";

import { isEnglishHost } from "@/lib/seo/locales";

import { LOCALE_HEADER } from "./armenian-routes";
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

  if (isEnglishHost(host)) return "en";
  return normalizeUserLocale(preferred);
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
