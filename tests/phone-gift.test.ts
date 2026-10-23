import { describe, expect, it } from "vitest";

import {
  CREDIT_REASON_LABEL_EN,
  CREDIT_REASON_LABEL_KA,
  PHONE_VERIFY_GIFT,
  SMS_CONSENT_GIFT,
} from "@/lib/credits-config";
import {
  phoneGiftCardEligible,
  phoneGiftPopupEligible,
  type PhoneGiftViewer,
} from "@/lib/phone-gift-pure";

const viewer: PhoneGiftViewer = {
  hasVerifiedPhone: false,
  isPremium: false,
  restricted: false,
  popupDismissed: false,
};

describe("phone-gift campaign amounts", () => {
  it("pays the verification 3 and the consent 3 more (6 combined)", () => {
    expect(PHONE_VERIFY_GIFT).toBe(3);
    expect(SMS_CONSENT_GIFT).toBe(3);
    expect(PHONE_VERIFY_GIFT + SMS_CONSENT_GIFT).toBe(6);
  });

  it("ships labels for both new ledger reasons in both locales", () => {
    for (const labels of [CREDIT_REASON_LABEL_KA, CREDIT_REASON_LABEL_EN]) {
      expect(labels.earn_phone_verify.length).toBeGreaterThan(0);
      expect(labels.earn_sms_consent.length).toBeGreaterThan(0);
    }
  });
});

describe("phoneGiftPopupEligible", () => {
  it("shows for a free account with no verified phone and no dismissal", () => {
    expect(phoneGiftPopupEligible(viewer)).toBe(true);
  });

  it("hides for PRO accounts, the credit gift is noise for them", () => {
    expect(phoneGiftPopupEligible({ ...viewer, isPremium: true })).toBe(false);
  });

  it("hides once a number is verified", () => {
    expect(phoneGiftPopupEligible({ ...viewer, hasVerifiedPhone: true })).toBe(
      false,
    );
  });

  it("hides for restricted accounts", () => {
    expect(phoneGiftPopupEligible({ ...viewer, restricted: true })).toBe(false);
  });

  it("stays hidden after dismissal, the popup is strictly one-time", () => {
    expect(phoneGiftPopupEligible({ ...viewer, popupDismissed: true })).toBe(
      false,
    );
  });
});

describe("phoneGiftCardEligible", () => {
  it("survives the popup dismissal, the offer stays on the credits page", () => {
    expect(
      phoneGiftCardEligible({
        hasVerifiedPhone: false,
        isPremium: false,
        restricted: false,
      }),
    ).toBe(true);
  });

  it("hides once a number is verified", () => {
    expect(
      phoneGiftCardEligible({
        hasVerifiedPhone: true,
        isPremium: false,
        restricted: false,
      }),
    ).toBe(false);
  });

  it("hides for PRO and restricted accounts, same as the popup", () => {
    expect(
      phoneGiftCardEligible({
        hasVerifiedPhone: false,
        isPremium: true,
        restricted: false,
      }),
    ).toBe(false);
    expect(
      phoneGiftCardEligible({
        hasVerifiedPhone: false,
        isPremium: false,
        restricted: true,
      }),
    ).toBe(false);
  });
});
