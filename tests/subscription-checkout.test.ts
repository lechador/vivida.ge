import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  createCheckout: vi.fn(),
  getBillingIdentity: vi.fn(),
  getLowCreditOffer: vi.fn(),
  isPremiumUser: vi.fn(),
  isStripeConfigured: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/premium", () => ({
  getBillingIdentity: mocks.getBillingIdentity,
  isPremiumUser: mocks.isPremiumUser,
}));
vi.mock("@/lib/promo-offer", () => ({
  getLowCreditOffer: mocks.getLowCreditOffer,
}));
vi.mock("@/lib/stripe", () => ({
  createPremiumCheckoutSession: mocks.createCheckout,
  isStripeConfigured: mocks.isStripeConfigured,
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
    mocks.isPremiumUser.mockResolvedValue(false);
    mocks.isStripeConfigured.mockReturnValue(true);
  });

  it("uses the live Armenian catalogue values rather than the Georgian fallback", async () => {
    const response = await POST(
      new Request("https://vividaastro.com/api/subscription/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "https://checkout.stripe.test/am",
      eventId: "cs_test_am:initiate_checkout",
      value: 2990,
      currency: "AMD",
      contentId: "premium_am_monthly",
    });
    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-am",
        plan: {
          key: "premium_am_monthly",
          countryCode: "AM",
          amountMinor: 299_000,
          currency: "amd",
          interval: "month",
          stripeLookupKey: "vivida_premium_am_monthly_299000_v1",
        },
      }),
    );
  });

  it("accepts the public Georgian quarterly plan from the server catalogue", async () => {
    mocks.getBillingIdentity.mockResolvedValue({
      countryCode: "GE",
      email: "georgian@example.com",
      stripeCustomerId: null,
    });

    const response = await POST(
      new Request("https://vivida.ge/api/subscription/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planKey: "promo_ge_quarterly" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: expect.objectContaining({
          key: "promo_ge_quarterly",
          amountMinor: 2900,
          currency: "gel",
          intervalCount: 3,
        }),
      }),
    );
  });

  it("rejects a plan that is not available in the user's market", async () => {
    const response = await POST(
      new Request("https://vividaastro.com/api/subscription/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planKey: "promo_ge_quarterly" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_plan" });
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });
});
