import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  pollInboundMessages: vi.fn(),
  pollTypingIndicators: vi.fn(),
  pollReadReceipts: vi.fn(),
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/messages", () => ({
  pollInboundMessages: mocks.pollInboundMessages,
  pollTypingIndicators: mocks.pollTypingIndicators,
  pollReadReceipts: mocks.pollReadReceipts,
}));

import { GET as poll } from "@/app/api/messages/poll/route";
import { GET as retiredStream } from "@/app/api/messages/stream/route";

function request(query = "") {
  return new Request(`https://www.vivida.ge/api/messages/poll${query}`);
}

describe("GET /api/messages/poll", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ user: { id: "viewer-1" } });
    mocks.pollInboundMessages.mockResolvedValue([]);
    mocks.pollTypingIndicators.mockResolvedValue([]);
    mocks.pollReadReceipts.mockResolvedValue([]);
  });

  it("rejects anonymous requests before touching message storage", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await poll(request("?since=2026-08-21T10:00:00.000Z"));

    expect(response.status).toBe(401);
    expect(mocks.pollInboundMessages).not.toHaveBeenCalled();
  });

  it("uses one inbound query on the conversation list", async () => {
    const response = await poll(
      request("?since=2026-08-21T10:00:00.000Z"),
    );

    expect(response.status).toBe(200);
    expect(mocks.pollInboundMessages).toHaveBeenCalledWith(
      "viewer-1",
      new Date("2026-08-21T10:00:00.000Z"),
    );
    expect(mocks.pollTypingIndicators).not.toHaveBeenCalled();
    expect(mocks.pollReadReceipts).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      messages: [],
      typing: [],
      receipts: [],
    });
  });

  it("scopes active-chat details to the selected partner", async () => {
    mocks.pollInboundMessages.mockResolvedValue([
      {
        id: "message-1",
        senderId: "partner-1",
        recipientId: "viewer-1",
        body: "hello",
        createdAt: new Date("2026-08-21T10:00:05.000Z"),
        readAt: null,
        senderName: "Nino",
        senderImage: null,
        senderUsername: "nino",
        senderDisplayName: "Nino B.",
      },
    ]);
    mocks.pollTypingIndicators.mockResolvedValue([
      {
        senderId: "partner-1",
        expiresAt: new Date("2026-08-21T10:00:20.000Z"),
      },
    ]);
    mocks.pollReadReceipts.mockResolvedValue([]);

    const response = await poll(
      request("?since=2026-08-21T10:00:00.000Z&with=partner-1"),
    );

    const since = new Date("2026-08-21T10:00:00.000Z");
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
    await expect(response.json()).resolves.toMatchObject({
      messages: [
        {
          id: "message-1",
          createdAt: "2026-08-21T10:00:05.000Z",
          sender: { username: "nino", displayName: "Nino B." },
        },
      ],
      typing: [{ senderId: "partner-1" }],
    });
  });

  it("rejects an invalid cursor without querying", async () => {
    const response = await poll(request("?since=not-a-date"));

    expect(response.status).toBe(400);
    expect(mocks.pollInboundMessages).not.toHaveBeenCalled();
  });
});

describe("retired chat SSE", () => {
  it("returns 204 so stale EventSource clients stop reconnecting", async () => {
    const response = await retiredStream();
    expect(response.status).toBe(204);
  });
});
