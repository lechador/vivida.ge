import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  createCheckout: vi.fn(),
  isStripeConfigured: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/credits", async () => {
  const config = await vi.importActual<typeof import("@/lib/credits-config")>(
    "@/lib/credits-config"
  );
  return { CREDIT_PACKS: config.CREDIT_PACKS };
});
vi.mock("@/lib/stripe", () => ({
  createCreditCheckoutSession: mocks.createCheckout,
  isStripeConfigured: mocks.isStripeConfigured,
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
    mocks.createCheckout.mockResolvedValue({ url: "https://checkout.stripe.test/1" });
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
      request({ packId: "custom", credits: 999_999, tetri: 1 })
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
    });
    expect(mocks.createCheckout).toHaveBeenCalledWith({
      userId: "user-1",
      email: "user@example.com",
      origin: "https://vivida.ge",
      credits: 30,
      tetri: 1000,
      gel: 10,
    });
  });

  it("reports unavailable payments before creating a session", async () => {
    mocks.isStripeConfigured.mockReturnValue(false);

    const response = await POST(request({ packId: "s" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ error: "unavailable" });
    expect(mocks.createCheckout).not.toHaveBeenCalled();
  });
});
