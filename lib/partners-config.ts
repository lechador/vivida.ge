/**
 * Monthly cap on partner creations. Counted across both active
 * and soft-deleted rows in the current calendar month so users can't
 * dodge the cap by deleting and re-creating.
 *
 * Lives outside actions/partners.ts because that file is "use server" —
 * which restricts exports to async functions only.
 *
 * Credits gate each compatibility unlock separately; this generous cap only
 * limits partner-row creation and protects the service from abuse.
 */
export const PARTNER_CAP_PER_MONTH = 50;
