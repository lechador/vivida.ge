import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  createCheckout: vi.fn(),
  isCryptoPayConfigured: vi.fn(),
  isStripeConfigured: vi.fn(),
  getBillingIdentity: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/credits", async () => {
  const config = await vi.importActual<typeof import("@/lib/billing-config")>(
    "@/lib/billing-config",
  );
  return { creditPackForCountry: config.creditPackForCountry };
});
vi.mock("@/lib/premium", () => ({
  getBillingIdentity: mocks.getBillingIdentity,
}));
vi.mock("@/lib/stripe", () => ({
  createCreditCheckoutSession: mocks.createCheckout,
  isStripeConfigured: mocks.isStripeConfigured,
}));
vi.mock("@/lib/crypto-pay", () => ({
  isCryptoPayConfigured: mocks.isCryptoPayConfigured,
}));

import { POST } from "@/app/api/credits/checkout/route";

function request(body: unknown) {
  return new Request("https://vivida.ge/api/credits/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/credits/checkout", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({
      user: { id: "user-1", email: "user@example.com" },
    });
    mocks.isStripeConfigured.mockReturnValue(true);
    mocks.isCryptoPayConfigured.mockReturnValue(true);
    mocks.getBillingIdentity.mockResolvedValue({ countryCode: "GE" });
    mocks.createCheckout.mockResolvedValue({
      id: "cs_test_1",
      url: "https://checkout.stripe.test/1",
    });
  });

  it("rejects anonymous checkout attempts", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await POST(request({ packId: "s" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });

  it("rejects unknown packs without trusting client prices", async () => {
    const response = await POST(
      request({ packId: "custom", credits: 999_999, tetri: 1 }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "bad_pack" });
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });

  it("uses the server-owned pack values for Stripe Checkout", async () => {
    const response = await POST(request({ packId: "s" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "https://checkout.stripe.test/1",
      eventId: "cs_test_1:initiate_checkout",
      value: 6.9,
      currency: "GEL",
      contentId: "credits_30",
    });
    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        email: "user@example.com",
        origin: "https://vivida.ge",
        credits: 30,
        amountMinor: 690,
        currency: "gel",
        locale: "ka",
        trackingMetadata: {
          tracking_consent: "denied",
          purchase_context: "credits_hub",
          selected_pack_id: "s",
        },
      }),
    );
  });

  it("keeps a safe product context through checkout", async () => {
    const response = await POST(
      request({ packId: "s", product: "tarot", returnTo: "/taro" }),
    );

    expect(response.status).toBe(200);
    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        returnTo: "/taro",
        trackingMetadata: expect.objectContaining({
          purchase_context: "tarot",
          selected_pack_id: "s",
        }),
      }),
    );
  });

  it("refuses Stripe checkout on the English domain (crypto rail only)", async () => {
    const response = await POST(
      new Request("https://vividaastro.com/api/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId: "m" }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: "crypto_only" });
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });

  it("keeps Stripe on the English domain until the crypto rail is configured", async () => {
    mocks.isCryptoPayConfigured.mockReturnValue(false);

    const response = await POST(
      new Request("https://vividaastro.com/api/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId: "s" }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.createCheckout).toHaveBeenCalled();
  });

  it("uses the UK credit catalogue for UK residents", async () => {
    mocks.getBillingIdentity.mockResolvedValue({ countryCode: "GB" });

    const response = await POST(request({ packId: "m" }));

    expect(response.status).toBe(200);
    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        credits: 75,
        amountMinor: 599,
        currency: "gbp",
      }),
    );
  });

  it("creates an Armenian AMD Checkout session for Armenian residents", async () => {
    mocks.getBillingIdentity.mockResolvedValue({
      countryCode: "AM",
      interfaceLanguage: "en",
    });

    const response = await POST(
      new Request("https://vivida.ge/api/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packId: "s" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "https://checkout.stripe.test/1",
      eventId: "cs_test_1:initiate_checkout",
      value: 990,
      currency: "AMD",
      contentId: "credits_30",
    });
    expect(mocks.createCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        credits: 30,
        amountMinor: 99_000,
        currency: "amd",
        locale: "ka",
      }),
    );
  });

  it("reports unavailable payments before creating a session", async () => {
    mocks.isStripeConfigured.mockReturnValue(false);

    const response = await POST(request({ packId: "s" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "unavailable" });
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });
});
