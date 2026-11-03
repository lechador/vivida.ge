/**
 * Pure credit-gift identifiers. Kept separate from `lib/credit-gift.ts`
 * because that module opens the database (and Resend) at import time, while
 * these builders are safe to unit test with no env at all.
 */

export const CREDIT_GIFT_CAMPAIGN_SLUG = "credit-gift-10-2026-11";
export const CREDIT_GIFT_AMOUNT = 10;
/** Balance at or below which a spender counts as "out of credits". */
export const CREDIT_GIFT_BALANCE_THRESHOLD = 3;
/** email_send_log kind for real campaign sends. */
export const CREDIT_GIFT_SEND_LOG_KIND = "credit_gift";

/**
 * Grant ref for one user. Test sends use a `:test` suffix so the preview
 * grant never consumes the cohort member's one-time real gift
 * (grantCreditsOnce dedupes by ref).
 */
export function creditGiftGrantRef(userId: string, isTest: boolean): string {
  return `${CREDIT_GIFT_CAMPAIGN_SLUG}:${userId}${isTest ? ":test" : ""}`;
}

/**
 * email_send_log kind for one send. Test sends log under `credit_gift_test`
 * so alreadySent() (kind `credit_gift`, status `sent`) never mistakes a
 * preview for the real run and skips the user.
 */
export function creditGiftLogKind(isTest: boolean): string {
  return isTest
    ? `${CREDIT_GIFT_SEND_LOG_KIND}_test`
    : CREDIT_GIFT_SEND_LOG_KIND;
}

/** Resend idempotency key, namespaced separately for test sends. */
export function creditGiftIdempotencyKey(
  userId: string,
  isTest: boolean,
): string {
  return `${CREDIT_GIFT_SEND_LOG_KIND}:${userId}${isTest ? ":test" : ""}`;
}
