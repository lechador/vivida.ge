import { and, eq, isNull } from "drizzle-orm";

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
