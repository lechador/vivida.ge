import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getCryptoPurchase: vi.fn(),
  confirmCryptoPurchase: vi.fn(),
  confirmFiatCryptoPurchase: vi.fn(),
  enforceRateLimit: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/crypto-pay", () => ({
  getCryptoPurchase: mocks.getCryptoPurchase,
  confirmCryptoPurchase: mocks.confirmCryptoPurchase,
  confirmFiatCryptoPurchase: mocks.confirmFiatCryptoPurchase,
}));
vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
}));
vi.mock("@/db", () => {
  const where = vi.fn().mockResolvedValue([]);
  const set = vi.fn().mockReturnValue({ where });
  return { db: { update: vi.fn().mockReturnValue({ set }) } };
});

process.env.DATABASE_URL ||= "postgres://vitest:***@localhost:5432/vitest";

import { db } from "@/db";
import { POST as fiatPOST } from "@/app/api/crypto/checkout/[id]/fiat/route";
import { GET as pollGET } from "@/app/api/crypto/checkout/[id]/route";

const FIAT_ROW = {
  id: "cp-fiat",
  userId: "user-1",
  kind: "credits",
  method: "fiat",
  status: "pending",
  fiatConfirmedAt: null,
  credits: 30,
  days: null,
  amountUsdcCents: 299,
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
};

function postFiat(body: unknown) {
  return new Request(
    "https://vividaastro.com/api/crypto/checkout/cp-fiat/fiat",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

const params = { params: Promise.resolve({ id: "cp-fiat" }) };

describe("POST /api/crypto/checkout/[id]/fiat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.getCryptoPurchase.mockResolvedValue({ ...FIAT_ROW });
    mocks.enforceRateLimit.mockResolvedValue(undefined);
  });

  it("rejects anonymous notify calls", async () => {
    mocks.auth.mockResolvedValue(null);
    const response = await fiatPOST(
      postFiat({ depositStatus: "confirmed" }),
      params,
    );
    expect(response.status).toBe(401);
  });

  it("404s on someone else's purchase", async () => {
    mocks.getCryptoPurchase.mockResolvedValue(null);
    const response = await fiatPOST(
      postFiat({ depositStatus: "confirmed" }),
      params,
    );
    expect(response.status).toBe(404);
  });

  it("refuses wallet-method purchases", async () => {
    mocks.getCryptoPurchase.mockResolvedValue({
      ...FIAT_ROW,
      method: "wallet",
    });
    const response = await fiatPOST(
      postFiat({ depositStatus: "confirmed" }),
      params,
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "wrong_method" });
  });

  it("refuses non-pending purchases", async () => {
    mocks.getCryptoPurchase.mockResolvedValue({
      ...FIAT_ROW,
      status: "confirmed",
    });
    const response = await fiatPOST(
      postFiat({ depositStatus: "confirmed" }),
      params,
    );
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "not_pending" });
  });

  it("rejects unknown deposit statuses", async () => {
    const response = await fiatPOST(
      postFiat({ depositStatus: "cancelled" }),
      params,
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "bad_status" });
  });

  it("stamps fiatConfirmedAt and answers watching (idempotent)", async () => {
    for (const status of ["submitted", "confirmed"]) {
      const response = await fiatPOST(
        postFiat({ depositStatus: status }),
        params,
      );
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ status: "watching" });
    }
    expect(db.update).toHaveBeenCalled();
  });
});

describe("GET /api/crypto/checkout/[id] method routing", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.enforceRateLimit.mockResolvedValue(undefined);
  });

  it("routes fiat purchases to the window-scan confirm", async () => {
    mocks.getCryptoPurchase.mockResolvedValue({ ...FIAT_ROW });
    mocks.confirmFiatCryptoPurchase.mockResolvedValue({ status: "pending" });

    const response = await pollGET(
      new Request("https://vividaastro.com/api/crypto/checkout/cp-fiat"),
      params,
    );

    expect(mocks.confirmFiatCryptoPurchase).toHaveBeenCalledWith({
      purchase: expect.objectContaining({ id: "cp-fiat" }),
    });
    expect(mocks.confirmCryptoPurchase).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "pending" });
  });

  it("keeps wallet purchases on the reference-scan confirm", async () => {
    mocks.getCryptoPurchase.mockResolvedValue({
      ...FIAT_ROW,
      method: "wallet",
    });
    mocks.confirmCryptoPurchase.mockResolvedValue({ status: "pending" });

    const response = await pollGET(
      new Request("https://vividaastro.com/api/crypto/checkout/cp-fiat"),
      params,
    );

    expect(mocks.confirmCryptoPurchase).toHaveBeenCalledWith({
      purchase: expect.objectContaining({ id: "cp-fiat" }),
    });
    expect(mocks.confirmFiatCryptoPurchase).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "pending" });
  });
});
