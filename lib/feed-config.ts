/**
 * Feed constants shared between the server actions and the client UI.
 *
 * Lives outside actions/feed.ts because that file is "use server" — and
 * Next.js 16 only allows async function exports from `"use server"`
 * modules. Re-exporting a `const` from there silently strips every
 * export in the file at bundle time (the build error reads "module has
 * no exports at all"). Same pattern as `lib/partners-config.ts`.
 */

/** Hard cap on post length. Enforced on both server and client. */
export const POST_BODY_MAX = 500;

/** Hard cap on comment length. */
export const COMMENT_BODY_MAX = 280;

/** How long after a post is created the author may still edit it.
 *  The server enforces this; the client uses it to hide the edit
 *  menu item past the window. Keep these in sync. */
export const POST_EDIT_WINDOW_MS = 5 * 60_000;
