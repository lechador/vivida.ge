import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  isCryptoPayConfigured: vi.fn(),
  createPendingCryptoPurchase: vi.fn(),
  getPremiumSubscription: vi.fn(),
  enforceRateLimit: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/crypto-pay", () => ({
  isCryptoPayConfigured: mocks.isCryptoPayConfigured,
  createPendingCryptoPurchase: mocks.createPendingCryptoPurchase,
}));
vi.mock("@/lib/premium", () => ({
  getPremiumSubscription: mocks.getPremiumSubscription,
  statusHasPremiumAccess: (status: string) =>
    status === "active" || status === "trialing",
}));
vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
}));

import { POST } from "@/app/api/crypto/checkout/route";

const PURCHASE = {
  id: "cp-1",
  kind: "credits",
  credits: 30,
  days: null,
  amountUsdcCents: 299,
  recipientWallet: "11111111111111111111111111111111",
  reference: "z".repeat(43),
  expiresAt: new Date("2026-10-11T20:00:00Z"),
};

function request(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/crypto/checkout", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.isCryptoPayConfigured.mockReturnValue(true);
    mocks.enforceRateLimit.mockResolvedValue(undefined);
    mocks.getPremiumSubscription.mockResolvedValue(null);
    mocks.createPendingCryptoPurchase.mockResolvedValue(PURCHASE);
  });

  it("rejects anonymous purchases", async () => {
    mocks.auth.mockResolvedValue(null);
    const response = await POST(
      request("https://vividaastro.com/api/crypto/checkout", { packId: "s" }),
    );
    expect(response.status).toBe(401);
    expect(mocks.createPendingCryptoPurchase).not.toHaveBeenCalled();
  });

  it("reports unavailable while the rail is unconfigured", async () => {
    mocks.isCryptoPayConfigured.mockReturnValue(false);
    const response = await POST(
      request("https://vividaastro.com/api/crypto/checkout", { packId: "s" }),
    );
    expect(response.status).toBe(503);
    expect(mocks.createPendingCryptoPurchase).not.toHaveBeenCalled();
  });

  it("refuses the Georgian host (Stripe lives there)", async () => {
    const response = await POST(
      request("https://vivida.ge/api/crypto/checkout", { packId: "s" }),
    );
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "english_host_only",
    });
    expect(mocks.createPendingCryptoPurchase).not.toHaveBeenCalled();
  });

  it("rejects unknown packs without trusting client prices", async () => {
    mocks.createPendingCryptoPurchase.mockRejectedValueOnce(
      new Error("bad_pack"),
    );
    const response = await POST(
      request("https://vividaastro.com/api/crypto/checkout", {
        packId: "custom",
        amountUsdcCents: 1,
      }),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "bad_pack" });
  });

  it("creates a pending USDC purchase on the English host", async () => {
    const response = await POST(
      request("https://vividaastro.com/api/crypto/checkout", {
        packId: "s",
        product: "tarot",
        returnTo: "/taro",
      }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as {
      id: string;
      kind: string;
      credits: number;
      amountUsdcCents: number;
      currency: string;
      recipient: string;
      reference: string;
      solanaPayUrl: string;
      value: number;
      contentId: string;
    };
    expect(data).toMatchObject({
      id: "cp-1",
      kind: "credits",
      credits: 30,
      amountUsdcCents: 299,
      currency: "USDC",
      recipient: PURCHASE.recipientWallet,
      reference: PURCHASE.reference,
      value: 2.99,
      contentId: "credits_30",
    });
    // The Solana Pay URL carries the reference for auto-detection.
    expect(data.solanaPayUrl).toContain(`reference=${PURCHASE.reference}`);
    expect(
      data.solanaPayUrl.startsWith(`solana:${PURCHASE.recipientWallet}`),
    ).toBe(true);
    expect(mocks.createPendingCryptoPurchase).toHaveBeenCalledWith({
      userId: "user-1",
      kind: "credits",
      packId: "s",
      product: "tarot",
      returnTo: "/taro",
    });
  });

  it("refuses a PRO pass while a processor subscription is entitled", async () => {
    mocks.getPremiumSubscription.mockResolvedValue({ status: "active" });
    const response = await POST(
      request("https://vividaastro.com/api/crypto/checkout", {
        kind: "premium_pass",
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ alreadyPremium: true });
    expect(mocks.createPendingCryptoPurchase).not.toHaveBeenCalled();
  });
});
