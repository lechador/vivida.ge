import { cookies, headers } from "next/headers";

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
 * On the Georgian domain we retain the user's explicit preference (or the
 * locale cookie) so the existing account language control keeps working.
 */
export function localeForHost(
  host: string | null | undefined,
  preferred?: string | null,
): UserLocale {
  if (isEnglishHost(host)) return "en";
  return normalizeUserLocale(preferred);
}

/** Request-aware locale for Server Components and Server Actions. */
export async function getRequestLocale(
  preferred?: string | null,
): Promise<UserLocale> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (isEnglishHost(host)) return "en";
  if (preferred != null) return normalizeUserLocale(preferred);

  const cookieStore = await cookies();
  return localeForHost(host, cookieStore.get("vivida-locale")?.value);
}

export async function requestIsEnglish(
  preferred?: string | null,
): Promise<boolean> {
  return (await getRequestLocale(preferred)) === "en";
}
