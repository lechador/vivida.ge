"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";

export type EmailPreferencesInput = {
  daily: boolean;
  marketing: boolean;
  nudges: boolean;
};

export type EmailPreferencesResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateEmailPreferences(
  input: EmailPreferencesInput
): Promise<EmailPreferencesResult> {
  const user = await requireUser();
  await db
    .update(users)
    .set({
      emailDailyHoroscope: input.daily,
      emailMarketing: input.marketing,
      emailNudges: input.nudges,
    })
    .where(eq(users.id, user.id));
  return { ok: true };
}
