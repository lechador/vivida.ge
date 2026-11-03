import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  createCheckout: vi.fn(),
  getBillingIdentity: vi.fn(),
  getLowCreditOffer: vi.fn(),
  hasPremiumSubscriptionHistory: vi.fn(),
  isCryptoPayConfigured: vi.fn(),
  isPremiumUser: vi.fn(),
  isStripeConfigured: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/premium", () => ({
  getBillingIdentity: mocks.getBillingIdentity,
  hasPremiumSubscriptionHistory: mocks.hasPremiumSubscriptionHistory,
  isPremiumUser: mocks.isPremiumUser,
}));
vi.mock("@/lib/promo-offer", () => ({
  getLowCreditOffer: mocks.getLowCreditOffer,
}));
vi.mock("@/lib/stripe", () => ({
  createPremiumCheckoutSession: mocks.createCheckout,
  isStripeConfigured: mocks.isStripeConfigured,
}));
vi.mock("@/lib/crypto-pay", () => ({
  isCryptoPayConfigured: mocks.isCryptoPayConfigured,
}));

import { POST } from "@/app/api/subscription/checkout/route";

describe("POST /api/subscription/checkout", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({
      user: { id: "user-am", email: "armenian@example.com" },
    });
    mocks.createCheckout.mockResolvedValue({
      id: "cs_test_am",
      url: "https://checkout.stripe.test/am",
    });
    mocks.getBillingIdentity.mockResolvedValue({
      countryCode: "AM",
      email: "armenian@example.com",
      stripeCustomerId: null,
    });
    mocks.getLowCreditOffer.mockResolvedValue(null);
    mocks.hasPremiumSubscriptionHistory.mockResolvedValue(false);
    mocks.isPremiumUser.mockResolvedValue(false);
    mocks.isStripeConfigured.mockReturnValue(true);
    mocks.isCryptoPayConfigured.mockReturnValue(true);
  });

  function checkoutRequest(body: unknown) {
    return new Request("https://vivida.ge/api/subscription/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function georgianUser() {
    mocks.auth.mockResolvedValue({
      user: { id: "user-ge", email: "georgian@example.com" },
    });
    mocks.getBillingIdentity.mockResolvedValue({
      countryCode: "GE",
      email: "georgian@example.com",
      stripeCustomerId: null,
    });
  }

  it("prices an Armenian resident from the Georgian fallback, not a dropped AMD market", async () => {
    // The AMD market was removed on 2026-10-17, so AM is now an unlisted country
    // and inherits the documented Georgian catalogue fallback.
    const response = await POST(
      new Request("https://vivida.ge/api/subscription/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: expect.objectContaining({
          key: "premium_ge_monthly",
          currency: "gel",
          amountMinor: 1990,
        }),
      }),
    );
  });

  it("rejects a plan that is not available in the user's market", async () => {
    // GB has no quarterly plan, so the Georgian promo key must be refused there.
    mocks.getBillingIdentity.mockResolvedValue({
      countryCode: "GB",
      email: "buyer@example.com",
      stripeCustomerId: null,
    });
    const response = await POST(
      new Request("https://vivida.ge/api/subscription/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planKey: "promo_ge_quarterly" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_plan" });
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });

  it("serves Stripe checkout on the English domain too (Stripe is primary, crypto is the alternative)", async () => {
    const response = await POST(
      new Request("https://vividaastro.com/api/subscription/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.createCheckout).toHaveBeenCalled();
  });

  it("starts a 7-day trial on the monthly plan a Georgian buyer chose for the first charge", async () => {
    georgianUser();

    const response = await POST(
      checkoutRequest({ planKey: "premium_ge_monthly", trial: true }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "https://checkout.stripe.test/am",
      eventId: "cs_test_am:initiate_checkout",
      value: 0,
      currency: "GEL",
      contentId: "premium_ge_monthly",
      trial: true,
    });
    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        trialDays: 7,
        plan: expect.objectContaining({
          key: "premium_ge_monthly",
          amountMinor: 1990,
          currency: "gel",
        }),
      }),
    );
  });

  it("starts a 7-day trial on the quarterly plan a Georgian buyer chose", async () => {
    georgianUser();

    const response = await POST(
      checkoutRequest({ planKey: "promo_ge_quarterly", trial: true }),
    );

    expect(response.status).toBe(200);
    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        trialDays: 7,
        plan: expect.objectContaining({ key: "promo_ge_quarterly" }),
      }),
    );
  });

  it("refuses a second trial to an account with subscription history", async () => {
    georgianUser();
    mocks.hasPremiumSubscriptionHistory.mockResolvedValue(true);

    const response = await POST(
      checkoutRequest({ planKey: "promo_ge_quarterly", trial: true }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "trial_unavailable",
    });
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });

  it("still refuses the retired Georgian monthly plan without a trial", async () => {
    georgianUser();

    const response = await POST(
      checkoutRequest({ planKey: "premium_ge_monthly" }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_plan" });
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });

  it("keeps Stripe on the English domain until the crypto rail is configured", async () => {
    mocks.isCryptoPayConfigured.mockReturnValue(false);

    const response = await POST(
      new Request("https://vividaastro.com/api/subscription/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.createCheckout).toHaveBeenCalled();
  });
});
