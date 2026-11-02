"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { requestIsEnglishHost } from "@/lib/i18n/request-locale";
import { normalizeUserLocale, type UserLocale } from "@/lib/i18n/user-locale";

export async function updateInterfaceLanguage(
  value: UserLocale,
): Promise<{ ok: true }> {
  const user = await requireUser();
  const locale = normalizeUserLocale(value);

  await db
    .update(users)
    .set({ interfaceLanguage: locale })
    .where(eq(users.id, user.id));

  // On vividaastro.com, keep the `vivida_lang` cookie in sync with the stored
  // preference ("en" | "pl") so shared routes and proxy forwarding agree.
  // Public indexable SEO routes ignore this cookie (getRequestLocale never
  // reads cookies()).
  if ((locale === "en" || locale === "pl") && (await requestIsEnglishHost())) {
    try {
      const cookieStore = await cookies();
      cookieStore.set("vivida_lang", locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    } catch {
      // Ignore in test environments where cookies() may be mocked.
    }
  }

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { ok: true };
}
