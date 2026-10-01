import { eq } from "drizzle-orm";

import { db } from "@/db";
import { profilePhotos, users } from "@/db/schema";
import {
  DELETE_ACCOUNT_CONFIRM_PHRASE,
  DELETE_ACCOUNT_CONFIRM_PHRASE_EN,
} from "@/lib/account-constants";
import { deleteObject } from "@/lib/r2";

/**
 * Account-management logic used by website Server Actions in actions/*.
 * Callers resolve authentication and pass the user id in; the account action
 * calls signOut() after deleteAccountCore.
 */

export type EmailPreferences = {
  daily: boolean;
  marketing: boolean;
  nudges: boolean;
};

/** Read the user's current email preferences. */
export async function getEmailPreferences(
  userId: string,
): Promise<EmailPreferences> {
  const [row] = await db
    .select({
      daily: users.emailDailyHoroscope,
      marketing: users.emailMarketing,
      nudges: users.emailNudges,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return {
    daily: row?.daily ?? true,
    marketing: row?.marketing ?? true,
    nudges: row?.nudges ?? true,
  };
}

/** Persist the user's email preferences. */
export async function updateEmailPreferencesCore(
  userId: string,
  input: EmailPreferences,
): Promise<{ ok: true }> {
  await db
    .update(users)
    .set({
      emailDailyHoroscope: input.daily,
      emailMarketing: input.marketing,
      emailNudges: input.nudges,
    })
    .where(eq(users.id, userId));
  return { ok: true };
}

export type DeleteAccountResult = { ok: true } | { ok: false; error: string };

/**
 * Permanently delete the user and everything that references them. Best-
 * effort R2 photo cleanup, then a single DELETE FROM "user" — every related
 * table has ON DELETE CASCADE on the user FK (profile, credit account,
 * friendships, notifications, messages, charts, sessions, OAuth accounts,
 * photos, refresh tokens, typing indicators all go in one shot). The caller
 * is responsible for clearing the client's own session/tokens afterward.
 */
export async function deleteAccountCore(
  userId: string,
  confirmation: string,
): Promise<DeleteAccountResult> {
  if (
    confirmation !== DELETE_ACCOUNT_CONFIRM_PHRASE &&
    confirmation !== DELETE_ACCOUNT_CONFIRM_PHRASE_EN
  ) {
    return {
      ok: false,
      error: `დასადასტურებლად შეიყვანე "${DELETE_ACCOUNT_CONFIRM_PHRASE}".`,
    };
  }

  // 1) R2 photo cleanup — best-effort. Read keys, fire deletes in parallel.
  try {
    const photos = await db
      .select({ key: profilePhotos.key })
      .from(profilePhotos)
      .where(eq(profilePhotos.userId, userId));
    if (photos.length > 0) {
      await Promise.allSettled(photos.map((p) => deleteObject(p.key)));
    }
  } catch (err) {
    console.warn(
      "[deleteAccount] R2 photo cleanup failed (continuing):",
      (err as Error).message,
    );
  }

  // 2) DB delete — CASCADE handles every related row.
  await db.delete(users).where(eq(users.id, userId));

  return { ok: true };
}
