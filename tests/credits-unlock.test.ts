import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  spendOnce: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/lib/credits", async () => {
  const config = await vi.importActual<typeof import("@/lib/credits-config")>(
    "@/lib/credits-config"
  );
  return { CREDIT_COST: config.CREDIT_COST, spendOnce: mocks.spendOnce };
});

import { POST } from "@/app/api/credits/unlock/route";

function request(body: unknown) {
  return new Request("https://vivida.ge/api/credits/unlock", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/credits/unlock", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.spendOnce.mockResolvedValue("unlocked");
  });

  it("rejects anonymous unlock attempts", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await POST(request({ kind: "weekly" }));

    expect(response.status).toBe(401);
    expect(mocks.spendOnce).not.toHaveBeenCalled();
  });

  it("rejects unknown unlock kinds", async () => {
    const response = await POST(request({ kind: "anything" }));

    expect(response.status).toBe(400);
    expect(mocks.spendOnce).not.toHaveBeenCalled();
  });

  it("charges the configured weekly cost with a stable idempotency ref", async () => {
    const response = await POST(request({ kind: "weekly" }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "unlocked" });
    expect(mocks.spendOnce).toHaveBeenCalledWith(
      "user-1",
      10,
      "spend_weekly",
      "weekly"
    );
  });

  it("returns the required cost when the balance is insufficient", async () => {
    mocks.spendOnce.mockResolvedValue("insufficient");

    const response = await POST(request({ kind: "weekly" }));

    expect(response.status).toBe(402);
    await expect(response.json()).resolves.toEqual({
      status: "insufficient",
      cost: 10,
    });
  });
});
