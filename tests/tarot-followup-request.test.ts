import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  enforceRateLimit: vi.fn(),
  performFollowup: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
}));
vi.mock("@/lib/i18n/request-locale", () => ({
  getRequestLocale: vi.fn(async () => "ka"),
}));
vi.mock("@/lib/tarot/followup", () => ({
  performFollowup: mocks.performFollowup,
}));

import { POST } from "@/app/api/tarot/followup/route";

function request(body: unknown) {
  return new Request("https://vivida.ge/api/tarot/followup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/tarot/followup", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.enforceRateLimit.mockResolvedValue(undefined);
    mocks.performFollowup.mockResolvedValue({
      ok: true,
      followup: {
        question: "q",
        answer: "a",
        degraded: false,
        charged: 0,
        free: true,
        balance: 20,
        libraryId: "lib-1",
        followups: [],
      },
    });
  });

  it("requires authentication", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await POST(
      request({ libraryId: "lib-1", question: "Why?", locale: "ka" }),
    );

    expect(response.status).toBe(401);
    expect(mocks.performFollowup).not.toHaveBeenCalled();
  });

  it("rejects a short follow-up question before touching credits", async () => {
    const response = await POST(
      request({ libraryId: "lib-1", question: "x", locale: "ka" }),
    );

    expect(response.status).toBe(400);
    expect(mocks.performFollowup).not.toHaveBeenCalled();
  });

  it("reports a missing reading as 404", async () => {
    mocks.performFollowup.mockResolvedValue({
      ok: false,
      error: "not_found",
    });

    const response = await POST(
      request({ libraryId: "lib-1", question: "Why this card?", locale: "ka" }),
    );

    expect(response.status).toBe(404);
  });

  it("reports a short balance as 402 with cost", async () => {
    mocks.performFollowup.mockResolvedValue({
      ok: false,
      error: "insufficient",
      cost: 5,
      balance: 2,
    });

    const response = await POST(
      request({ libraryId: "lib-1", question: "Why this card?", locale: "ka" }),
    );

    expect(response.status).toBe(402);
    await expect(response.json()).resolves.toEqual({
      error: "needs_credits",
      cost: 5,
      balance: 2,
    });
  });

  it("forwards the reading id, question and locale", async () => {
    const response = await POST(
      request({ libraryId: "lib-1", question: "Why this card?", locale: "ka" }),
    );

    expect(response.status).toBe(200);
    expect(mocks.performFollowup).toHaveBeenCalledWith(
      "user-1",
      "lib-1",
      "Why this card?",
      "ka",
    );
  });
});
