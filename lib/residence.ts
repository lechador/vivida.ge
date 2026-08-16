import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { normalizeCountryCode } from "@/lib/billing-config";

/** Vercel's trusted geo header; no third-party IP geolocation call is needed. */
export function countryCodeFromHeaders(headers: Headers): string | null {
  return normalizeCountryCode(
    headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry"),
  );
}

/** Set once from registration/request IP; never overwrite an existing country. */
export async function setResidenceCountryIfMissing(
  userId: string,
  countryCode: string | null | undefined,
): Promise<void> {
  const code = normalizeCountryCode(countryCode);
  if (!code) return;
  await db
    .update(users)
    .set({ residenceCountryCode: code })
    .where(andUserCountryMissing(userId));
}

function andUserCountryMissing(userId: string) {
  return and(eq(users.id, userId), isNull(users.residenceCountryCode));
}

export function countryDisplayName(
  countryCode: string | null | undefined,
  locale: "ka" | "en",
): string {
  const code = normalizeCountryCode(countryCode);
  if (!code) return locale === "en" ? "Not determined" : "ვერ განისაზღვრა";
  try {
    return new Intl.DisplayNames([locale === "en" ? "en" : "ka"], {
      type: "region",
    }).of(code) ?? code;
  } catch {
    return code;
  }
}

/** The viewer's own residence country, for country-aware ranking. */
export async function getResidenceCountryCode(
  userId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ code: users.residenceCountryCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return normalizeCountryCode(row?.code);
}

/**
 * Ordering expression that floats users sharing the viewer's residence
 * country to the front. Use as `orderBy(desc(sameCountryFirst(code)), …)`.
 *
 * Prioritise, never filter. Georgia holds effectively the whole user base and
 * a newly opened market (UK, and whatever follows) starts at single digits —
 * filtering to the viewer's country would hand every early user in a new
 * market an empty product, which is the opposite of what country targeting is
 * for. Same country first, then everyone else in the caller's own order.
 *
 * A NULL residence — accounts created before the column existed, or a request
 * with no geo header — sorts with "everyone else". A viewer who has no country
 * themselves gets a constant, i.e. exactly the pre-existing ordering.
 */
export function sameCountryFirst(countryCode: string | null | undefined) {
  const code = normalizeCountryCode(countryCode);
  if (!code) return sql<boolean>`false`;
  return sql<boolean>`(${users.residenceCountryCode} = ${code})`;
}
