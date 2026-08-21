import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireMobileUserId: vi.fn(),
  pollInboundMessages: vi.fn(),
  pollTypingIndicators: vi.fn(),
  pollReadReceipts: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({
  requireMobileUserId: mocks.requireMobileUserId,
}));
vi.mock("@/lib/messages", () => ({
  pollInboundMessages: mocks.pollInboundMessages,
  pollTypingIndicators: mocks.pollTypingIndicators,
  pollReadReceipts: mocks.pollReadReceipts,
}));

import { GET } from "@/app/api/v1/messages/poll/route";

function request(query: string) {
  return new Request(`https://www.vivida.ge/api/v1/messages/poll${query}`, {
    headers: { authorization: "Bearer token" },
  });
}

describe("GET /api/v1/messages/poll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireMobileUserId.mockResolvedValue("viewer-1");
    mocks.pollInboundMessages.mockResolvedValue([]);
    mocks.pollTypingIndicators.mockResolvedValue([]);
    mocks.pollReadReceipts.mockResolvedValue([]);
  });

  it("scopes every high-frequency query to the open conversation", async () => {
    const response = await GET(
      request("?with=partner-1&since=2026-08-21T10:00:00.000Z"),
    );

    const since = new Date("2026-08-21T10:00:00.000Z");
    expect(response.status).toBe(200);
    expect(mocks.pollInboundMessages).toHaveBeenCalledWith(
      "viewer-1",
      since,
      "partner-1",
    );
    expect(mocks.pollTypingIndicators).toHaveBeenCalledWith(
      "viewer-1",
      "partner-1",
    );
    expect(mocks.pollReadReceipts).toHaveBeenCalledWith(
      "viewer-1",
      since,
      "partner-1",
    );
  });

  it("rejects missing or invalid query values before querying storage", async () => {
    const missingPartner = await GET(
      request("?since=2026-08-21T10:00:00.000Z"),
    );
    const invalidCursor = await GET(
      request("?with=partner-1&since=not-a-date"),
    );

    expect(missingPartner.status).toBe(422);
    expect(invalidCursor.status).toBe(422);
    expect(mocks.pollInboundMessages).not.toHaveBeenCalled();
  });
});
