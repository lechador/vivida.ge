"use server";

import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isValidVoiceSlug } from "@/lib/horoscope-voices";

/** Save the user's preferred audio-horoscope voice. */
export async function setHoroscopeVoice(
  slug: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "unauthorized" };
  if (!isValidVoiceSlug(slug)) return { ok: false, error: "invalid_voice" };

  await db
    .update(users)
    .set({ horoscopeVoice: slug })
    .where(eq(users.id, userId));
  return { ok: true };
}
