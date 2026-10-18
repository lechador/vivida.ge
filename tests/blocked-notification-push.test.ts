import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pending: Promise.resolve() as Promise<unknown>,
  isBlockedEitherWay: vi.fn(),
  sendPushToUser: vi.fn(),
  select: vi.fn(),
}));

vi.mock("next/server", () => ({
  after: (task: () => Promise<unknown>) => {
    mocks.pending = task();
  },
}));
vi.mock("@/lib/block", () => ({ isBlockedEitherWay: mocks.isBlockedEitherWay }));
vi.mock("@/lib/push", () => ({
  isPushConfigured: () => true,
  sendPushToUser: mocks.sendPushToUser,
}));
vi.mock("@/db", () => ({ db: { select: mocks.select } }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: vi.fn() }));

import { queueNotificationPush } from "@/lib/notification-push";

describe("blocked actor notification push", () => {
  beforeEach(() => {
    mocks.isBlockedEitherWay.mockResolvedValue(true);
  });

  it("does not send a push when either side has blocked the other", async () => {
    queueNotificationPush("recipient-1", "post_comment", {
      fromUserId: "actor-1",
      postId: "post-1",
      preview: "hello",
    });
    await mocks.pending;

    expect(mocks.isBlockedEitherWay).toHaveBeenCalledWith("recipient-1", "actor-1");
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.sendPushToUser).not.toHaveBeenCalled();
  });
});
