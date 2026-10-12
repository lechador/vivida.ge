"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";

export async function updateInterfaceLanguage(value: UserLocale): Promise<{ ok: true }> {
  const user = await requireUser();
  const locale = normalizeUserLocale(value);

  await db
    .update(users)
    .set({ interfaceLanguage: locale })
    .where(eq(users.id, user.id));

  // No locale cookie is written any more. It existed so public pages could
  // honour this preference without a DB read, but that made indexable Georgian
  // URLs render English, and emit English canonicals, for cookie holders.
  // The signed-in surfaces that legitimately switch language read
  // `users.interfaceLanguage` directly instead.
  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { ok: true };
}
