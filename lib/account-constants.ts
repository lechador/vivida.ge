/**
 * Constants shared between the account-deletion server action and its
 * client UI. We can't export plain values from a "use server" file
 * (Next.js requires those files to export only async functions), so
 * shared constants live here.
 */

/** Phrase the user must type verbatim to confirm account deletion. */
export const DELETE_ACCOUNT_CONFIRM_PHRASE = "ვშლი";
