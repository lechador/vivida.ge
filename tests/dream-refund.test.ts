import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  spendCredits: vi.fn(),
  refundCredits: vi.fn(),
  generate: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/credits", () => ({
  CREDIT_COST: { dream: 3 },
  getBalance: async () => 7,
  spendCredits: mocks.spendCredits,
  refundCredits: mocks.refundCredits,
}));
vi.mock("@/lib/i18n/request-locale", () => ({
  getRequestLocale: async () => "en",
}));
vi.mock("@/lib/openrouter", () => ({
  isOpenRouterConfigured: () => true,
  generateDreamInterpretation: mocks.generate,
}));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: async () => {} }));

import { POST } from "@/app/api/dreams/interpret/route";

function request() {
  return new Request("https://vivida.ge/api/dreams/interpret", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dream: "I was flying over the sea", locale: "en" }),
  });
}

describe("POST /api/dreams/interpret refunds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.spendCredits.mockResolvedValue(true);
    mocks.refundCredits.mockResolvedValue(undefined);
  });

  it("refunds when the AI returns nothing (503)", async () => {
    mocks.generate.mockResolvedValue(null);
    const res = await POST(request());
    expect(res.status).toBe(503);
    expect(mocks.refundCredits).toHaveBeenCalledWith(
      "user-1",
      3,
      expect.stringMatching(/^dream:/),
    );
  });

  it("refunds when the AI throws (502)", async () => {
    mocks.generate.mockRejectedValue(new Error("boom"));
    const res = await POST(request());
    expect(res.status).toBe(502);
    expect(mocks.refundCredits).toHaveBeenCalledTimes(1);
  });

  it("keeps the charge on success", async () => {
    mocks.generate.mockResolvedValue({ summary: "ok" });
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(mocks.refundCredits).not.toHaveBeenCalled();
  });

  it("does not refund a request that was never charged (402)", async () => {
    mocks.spendCredits.mockResolvedValue(false);
    const res = await POST(request());
    expect(res.status).toBe(402);
    expect(mocks.refundCredits).not.toHaveBeenCalled();
  });
});
