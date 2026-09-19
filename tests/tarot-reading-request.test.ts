import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  enforceRateLimit: vi.fn(),
  performReading: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
}));
vi.mock("@/lib/i18n/request-locale", () => ({
  getRequestLocale: vi.fn(async () => "ka"),
}));
vi.mock("@/lib/tarot/reading", () => ({
  performReading: mocks.performReading,
}));

import { POST } from "@/app/api/tarot/reading/route";

function request(body: unknown) {
  return new Request("https://vivida.ge/api/tarot/reading", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/tarot/reading request identity", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ user: { id: "user-tarot" } });
    mocks.enforceRateLimit.mockResolvedValue(undefined);
    mocks.performReading.mockResolvedValue({
      ok: true,
      reading: {
        headline: "test",
        cards: [],
        reading: "test",
        advice: "test",
        charged: 0,
        free: true,
        balance: 0,
      },
    });
  });

  it("rejects a malformed request id before drawing or charging", async () => {
    const response = await POST(
      request({
        question: "რა უნდა დავინახო ამ ურთიერთობაში?",
        locale: "ka",
        requestId: "not a valid id!!",
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.performReading).not.toHaveBeenCalled();
  });
});
