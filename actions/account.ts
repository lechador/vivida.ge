"use server";

import { eq } from "drizzle-orm";

import { signOut } from "@/auth";
import { db } from "@/db";
import { profilePhotos, users } from "@/db/schema";
import { DELETE_ACCOUNT_CONFIRM_PHRASE } from "@/lib/account-constants";
import { requireUser } from "@/lib/auth-helpers";
import { deleteObject } from "@/lib/r2";

export type DeleteAccountInput = {
  /** Must equal `DELETE_ACCOUNT_CONFIRM_PHRASE` from lib/account-constants to proceed. */
  confirmation: string;
};

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Permanently delete the current user and every record that references
 * them. Operations:
 *  1. Best-effort R2 cleanup for profile photos (don't block on failures —
 *     stale objects are vastly less bad than a half-deleted account).
 *  2. DELETE FROM "user" — every related table has ON DELETE CASCADE on
 *     the user FK, so this single statement removes profile, subscription,
 *     friendships, notifications, messages, charts, sessions, OAuth
 *     accounts, photos, typing indicators in one shot.
 *  3. signOut redirects to "/".
 *
 * Note: signOut throws a redirect, so this function never returns the
 * `ok: true` case in practice — but we keep the type for the failure path
 * (validation, not-authed) so the client can surface errors inline.
 */
export async function deleteAccount(
  input: DeleteAccountInput
): Promise<DeleteAccountResult> {
  const user = await requireUser();

  if (input.confirmation !== DELETE_ACCOUNT_CONFIRM_PHRASE) {
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
      .where(eq(profilePhotos.userId, user.id));
    if (photos.length > 0) {
      await Promise.allSettled(photos.map((p) => deleteObject(p.key)));
    }
  } catch (err) {
    console.warn(
      "[deleteAccount] R2 photo cleanup failed (continuing):",
      (err as Error).message
    );
  }

  // 2) DB delete — CASCADE handles every related row.
  await db.delete(users).where(eq(users.id, user.id));

  // 3) Clear the session and redirect away from the (now nonexistent)
  //    authed area. signOut() throws an internal redirect.
  await signOut({ redirectTo: "/" });

  // Unreachable — signOut redirects. Return is here for type completeness.
  return { ok: true };
}
