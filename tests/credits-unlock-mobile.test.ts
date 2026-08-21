import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireMobileUser: vi.fn(),
  spendOnce: vi.fn(),
  getBalance: vi.fn(),
}));

vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/lib/api/auth", () => ({
  requireMobileUser: mocks.requireMobileUser,
}));
vi.mock("@/lib/credits", async () => {
  const config = await vi.importActual<typeof import("@/lib/credits-config")>(
    "@/lib/credits-config"
  );
  return {
    CREDIT_COST: config.CREDIT_COST,
    spendOnce: mocks.spendOnce,
    getBalance: mocks.getBalance,
  };
});

import { POST } from "@/app/api/v1/credits/unlock/route";

function request(body: unknown) {
  return new Request("https://www.vivida.ge/api/v1/credits/unlock", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * The mobile twin of tests/credits-unlock.test.ts. Both routes share
 * unlockForUser(), and these assert that the app is charged the same price for
 * the same thing as the website — the app had no unlock path at all before, so
 * every gated reading past the free allowance was a dead end in the UI.
 */
describe("POST /api/v1/credits/unlock", () => {
  beforeEach(() => {
    mocks.requireMobileUser.mockResolvedValue({ id: "user-1" });
    mocks.spendOnce.mockResolvedValue("unlocked");
    mocks.getBalance.mockResolvedValue(7);
  });

  it("charges the same weekly cost as the website, with the same ref", async () => {
    const response = await POST(request({ kind: "weekly" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "unlocked",
      balance: 7,
    });
    expect(mocks.spendOnce).toHaveBeenCalledWith(
      "user-1",
      10,
      "spend_weekly",
      "weekly"
    );
  });

  it("rejects an unknown unlock kind before spending anything", async () => {
    const response = await POST(request({ kind: "anything" }));

    expect(response.status).toBe(422);
    expect(mocks.spendOnce).not.toHaveBeenCalled();
  });

  it("requires a resultId for kinds that identify a row", async () => {
    const response = await POST(request({ kind: "synastry" }));

    expect(response.status).toBe(400);
    expect(mocks.spendOnce).not.toHaveBeenCalled();
  });

  it("reports a short balance as 402 insufficient_credits", async () => {
    mocks.spendOnce.mockResolvedValue("insufficient");

    const response = await POST(request({ kind: "weekly" }));

    expect(response.status).toBe(402);
    await expect(response.json()).resolves.toEqual({
      error: { code: "insufficient_credits", message: "Not enough credits" },
    });
  });

  it("is idempotent — re-unlocking reports 'already'", async () => {
    mocks.spendOnce.mockResolvedValue("already");

    const response = await POST(request({ kind: "weekly" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: "already" });
  });
});
