import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { grantCreditsOnce } from "@/lib/credits";
import { PHONE_VERIFY_GIFT, SMS_CONSENT_GIFT } from "@/lib/credits-config";
import { isPremiumUser } from "@/lib/premium";
import { isAccountRestricted } from "@/lib/restriction";

/**
 * Phone-gift campaign core: the credits the number-verification campaign pays
 * out. Both grants are exactly-once per user (advisory-locked ledger refs, so
 * concurrent retries can't double-pay) and never fire for PRO, the campaign
 * targets free users, and PRO bypasses every credit gate anyway. Amounts live
 * in lib/credits-config.ts.
 */

const verifyGiftRef = (userId: string) => `phone-verify-gift:${userId}`;
const consentGiftRef = (userId: string) => `sms-consent-gift:${userId}`;

/** +10 once, the first time a user's number becomes SMS-verified. */
export async function grantPhoneVerifyGift(userId: string): Promise<boolean> {
  try {
    if (await isPremiumUser(userId)) return false;
    return await grantCreditsOnce(
      userId,
      PHONE_VERIFY_GIFT,
      "earn_phone_verify",
      verifyGiftRef(userId),
    );
  } catch (err) {
    // A grant failure must never fail the verification itself, by the time
    // this runs the SMS code is already consumed, so a retry cannot reach it.
    console.warn(
      "[phone-gift] verify grant failed:",
      err instanceof Error ? err.message : String(err),
    );
    return false;
  }
}

/** +10 once, when promotional-SMS consent first turns on for a verified number. */
export async function grantSmsConsentGift(userId: string): Promise<boolean> {
  try {
    if (await isPremiumUser(userId)) return false;
    return await grantCreditsOnce(
      userId,
      SMS_CONSENT_GIFT,
      "earn_sms_consent",
      consentGiftRef(userId),
    );
  } catch (err) {
    console.warn(
      "[phone-gift] consent grant failed:",
      err instanceof Error ? err.message : String(err),
    );
    return false;
  }
}

export type PhoneGiftState = {
  hasVerifiedPhone: boolean;
  isPremium: boolean;
  restricted: boolean;
  popupDismissed: boolean;
};

/** Everything the campaign surfaces need to decide what to render. */
export async function getPhoneGiftState(
  userId: string,
): Promise<PhoneGiftState> {
  const [[row], isPremium, restricted] = await Promise.all([
    db
      .select({
        phoneVerifiedAt: users.phoneVerifiedAt,
        popupDismissedAt: users.phoneGiftPopupDismissedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
    isPremiumUser(userId),
    isAccountRestricted(userId),
  ]);
  return {
    hasVerifiedPhone: Boolean(row?.phoneVerifiedAt),
    isPremium,
    restricted,
    popupDismissed: Boolean(row?.popupDismissedAt),
  };
}
