import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  after: vi.fn(),
  constructWebhookEvent: vi.fn(),
  grantPurchaseCredits: vi.fn(),
}));

vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/lib/stripe", () => ({
  constructWebhookEvent: mocks.constructWebhookEvent,
}));
vi.mock("@/lib/reports/generate", () => ({ generateAndStoreReport: vi.fn() }));
vi.mock("@/lib/credits", () => ({
  grantPurchaseCredits: mocks.grantPurchaseCredits,
}));

import { POST } from "@/app/api/stripe/webhook/route";

function request(signature?: string) {
  return new Request("https://vivida.ge/api/stripe/webhook", {
    method: "POST",
    headers: signature ? { "stripe-signature": signature } : undefined,
    body: "raw-stripe-payload",
  });
}

function creditEvent(metadata: Record<string, string>, id = "cs_1") {
  return {
    type: "checkout.session.completed",
    data: { object: { id, metadata } },
  };
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    mocks.constructWebhookEvent.mockReturnValue(
      creditEvent({ kind: "credits", userId: "user-1", credits: "30" })
    );
    mocks.grantPurchaseCredits.mockResolvedValue(undefined);
  });

  it("rejects requests without a Stripe signature", async () => {
    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("missing signature");
    expect(mocks.constructWebhookEvent).not.toHaveBeenCalled();
  });

  it("rejects payloads that fail signature verification", async () => {
    mocks.constructWebhookEvent.mockImplementation(() => {
      throw new Error("invalid signature");
    });

    const response = await POST(request("sig_bad"));

    expect(response.status).toBe(400);
    expect(await response.text()).toContain("bad signature");
    expect(mocks.grantPurchaseCredits).not.toHaveBeenCalled();
  });

  it("grants purchased credits using the Stripe session as idempotency key", async () => {
    const response = await POST(request("sig_valid"));

    expect(response.status).toBe(200);
    expect(mocks.grantPurchaseCredits).toHaveBeenCalledWith(
      "user-1",
      30,
      "cs_1"
    );
  });

  it("ignores malformed credit metadata", async () => {
    mocks.constructWebhookEvent.mockReturnValue(
      creditEvent({ kind: "credits", userId: "user-1", credits: "invalid" })
    );

    const response = await POST(request("sig_valid"));

    expect(response.status).toBe(200);
    expect(mocks.grantPurchaseCredits).not.toHaveBeenCalled();
  });
});
