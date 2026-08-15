"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { isCountryCode } from "@/lib/countries";
import { invalidateHeaderForUser } from "@/lib/header-cache";

export async function updateResidence(countryCode: string, city: string) {
  const user = await requireUser();
  const country = countryCode.trim().toUpperCase();
  const normalized = city.trim().replace(/\s+/g, " ");
  if (!isCountryCode(country)) {
    return { ok: false as const, error: "invalid_country" as const };
  }
  if (normalized.length > 100) {
    return { ok: false as const, error: "city_too_long" as const };
  }
  await db
    .update(users)
    .set({
      residenceCountryCode: country,
      residenceCity: normalized || null,
    })
    .where(eq(users.id, user.id));
  invalidateHeaderForUser(user.id);
  revalidatePath("/account");
  revalidatePath("/credits");
  revalidatePath("/subscription");
  return { ok: true as const };
}
