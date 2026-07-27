"use server";

import { cookies } from "next/headers";
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

  const cookieStore = await cookies();
  cookieStore.set("vivida-locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { ok: true };
}
