"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";

export async function updateResidenceCity(city: string) {
  const user = await requireUser();
  const normalized = city.trim().replace(/\s+/g, " ");
  if (normalized.length > 100) {
    return { ok: false as const, error: "city_too_long" };
  }
  await db
    .update(users)
    .set({ residenceCity: normalized || null })
    .where(eq(users.id, user.id));
  revalidatePath("/account");
  return { ok: true as const };
}
