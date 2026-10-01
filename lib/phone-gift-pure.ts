/**
 * Pure eligibility policy for the phone-gift campaign (verify a number → 10
 * credits, +10 more with promotional-SMS consent). Kept free of `@/db` so
 * unit tests can pin the rules without a database — the DB-side grants live
 * in lib/phone-gift.ts.
 */

export type PhoneGiftViewer = {
  hasVerifiedPhone: boolean;
  isPremium: boolean;
  restricted: boolean;
  popupDismissed: boolean;
};

/**
 * One-time dashboard popup: free users without a verified number, until they
 * dismiss it. PRO is excluded (they bypass every credit gate, so a credit
 * gift is noise) and restricted accounts never get campaign prompts.
 */
export function phoneGiftPopupEligible(viewer: PhoneGiftViewer): boolean {
  return (
    !viewer.hasVerifiedPhone &&
    !viewer.isPremium &&
    !viewer.restricted &&
    !viewer.popupDismissed
  );
}

/**
 * Credits-page card: the same audience, but it stays claimable after the
 * popup was dismissed — the dismissal only silences the popup.
 */
export function phoneGiftCardEligible(
  viewer: Omit<PhoneGiftViewer, "popupDismissed">,
): boolean {
  return !viewer.hasVerifiedPhone && !viewer.isPremium && !viewer.restricted;
}
