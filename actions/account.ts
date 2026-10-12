"use server";

import { signOut } from "@/auth";
import { requireUser } from "@/lib/auth-helpers";
import { deleteAccountCore } from "@/lib/account-core";

export type DeleteAccountInput = {
  /** Must equal `DELETE_ACCOUNT_CONFIRM_PHRASE` from lib/account-constants to proceed. */
  confirmation: string;
};

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Permanently delete the current user. Shared core does the R2 cleanup +
 * cascading DB delete; the web action layers signOut() on top (which throws
 * an internal redirect to "/", so the ok:true case never actually returns
 * here, the type is kept for the validation/not-authed failure path).
 */
export async function deleteAccount(
  input: DeleteAccountInput
): Promise<DeleteAccountResult> {
  const user = await requireUser();

  const result = await deleteAccountCore(user.id, input.confirmation);
  if (!result.ok) return result;

  // Clear the session and redirect away from the (now nonexistent) authed
  // area. signOut() throws an internal redirect.
  await signOut({ redirectTo: "/" });

  // Unreachable, signOut redirects. Return is here for type completeness.
  return { ok: true };
}
