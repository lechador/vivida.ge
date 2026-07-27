import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

export const USER_LOCALES = ["ka", "en"] as const;
export type UserLocale = (typeof USER_LOCALES)[number];

export function normalizeUserLocale(value: string | null | undefined): UserLocale {
  return value === "en" ? "en" : "ka";
}

export function isEnglish(locale: UserLocale): boolean {
  return locale === "en";
}

export async function getUserLocale(userId: string): Promise<UserLocale> {
  const [row] = await db
    .select({ locale: users.interfaceLanguage })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return normalizeUserLocale(row?.locale);
}
