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
  // preference so shared routes and proxy forwarding agree. Switching to
  // Georgian must clear a stale `pl` cookie: otherwise proxy forwarding
  // (x-vivida-locale) keeps rendering shared routes in Polish despite the
  // stored `ka` preference preferring English on this host.
  // Public indexable SEO routes ignore this cookie (getRequestLocale never
  // reads cookies()).
  if (await requestIsEnglishHost()) {
    try {
      const cookieStore = await cookies();
      if (locale === "en" || locale === "pl") {
        cookieStore.set("vivida_lang", locale, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          sameSite: "lax",
        });
      } else {
        cookieStore.delete("vivida_lang");
      }
    } catch {
      // Ignore in test environments where cookies() may be mocked.
    }
  }

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { ok: true };
}
