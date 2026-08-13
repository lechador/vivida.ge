import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  normalizeUserLocale,
  type UserLocale,
} from "./locale";
import { getRequestLocale } from "./request-locale";

export {
  isEnglish,
  normalizeUserLocale,
  USER_LOCALES,
  type UserLocale,
} from "./locale";

export async function getUserLocale(userId: string): Promise<UserLocale> {
  const [row] = await db
    .select({ locale: users.interfaceLanguage })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return getRequestLocale(normalizeUserLocale(row?.locale));
}
