import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  subsByUser: new Map<
    string,
    { id: string; endpoint: string; p256dh: string; auth: string }[]
  >(),
  rateLimitCounts: new Map<string, number>(),
  sendNotification: vi.fn(),
}));

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: state.sendNotification,
  },
}));

vi.mock("@/db", () => {
  return {
    db: {
      select: (fields: Record<string, unknown>) => ({
        from: () => {
          // rateLimitHits query in sendDailyPushBlast
          if ("identifier" in fields && !("endpoint" in fields)) {
            return {
              where: async () => {
                const rows: { identifier: string }[] = [];
                for (const [key, count] of state.rateLimitCounts.entries()) {
                  if (count >= 1) {
                    const [, identifier] = key.split("|");
                    rows.push({ identifier });
                  }
                }
                return rows;
              },
            };
          }
          // pushSubscriptions query in sendDailyPushBlast (innerJoin + leftJoin)
          return {
            where: async () => {
              // sendPushToUser query: returns subs for the active userId
              return state.subsByUser.get("__current__") ?? [];
            },
            innerJoin: () => ({
              leftJoin: async () => {
                const rows: {
                  userId: string;
                  locale: string;
                  id: string;
                  endpoint: string;
                  p256dh: string;
                  auth: string;
                  headline: string | null;
                  language: string | null;
                }[] = [];
                for (const [userId, subs] of state.subsByUser.entries()) {
                  if (userId === "__current__") continue;
                  for (const s of subs) {
                    rows.push({
                      userId,
                      locale: "ka",
                      id: s.id,
                      endpoint: s.endpoint,
                      p256dh: s.p256dh,
                      auth: s.auth,
                      headline: "დღის ჰოროსკოპი",
                      language: "ka",
                    });
                  }
                }
                return rows;
              },
            }),
          };
        },
      }),
      insert: () => ({
        values: (val: {
          bucket: string;
          identifier: string;
          windowStart: Date;
        }) => ({
          onConflictDoUpdate: () => ({
            returning: async () => {
              const key = `${val.bucket}|${val.identifier}|${val.windowStart.toISOString()}`;
              const next = (state.rateLimitCounts.get(key) ?? 0) + 1;
              state.rateLimitCounts.set(key, next);
              return [{ count: next }];
            },
          }),
        }),
      }),
      delete: () => ({
        where: async () => {
          state.rateLimitCounts.clear();
        },
      }),
    },
  };
});

import {
  sendDailyPushBlast,
  sendPushToUser,
  utcDayWindowStartFromDateKey,
} from "@/lib/push";

describe("daily push cap (max 1 push per user per day)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key";
    process.env.VAPID_PRIVATE_KEY = "test-private-key";
    state.subsByUser.clear();
    state.rateLimitCounts.clear();
    state.sendNotification.mockReset();
    state.sendNotification.mockResolvedValue({});
  });

  it("sends at most one push per user on the same UTC day via sendPushToUser", async () => {
    state.subsByUser.set("__current__", [
      {
        id: "sub-1",
        endpoint: "https://push.example/1",
        p256dh: "k",
        auth: "a",
      },
    ]);
    const now = new Date("2026-10-30T08:00:00.000Z");

    const first = await sendPushToUser(
      "user-1",
      { title: "First", body: "One" },
      { now },
    );
    const second = await sendPushToUser(
      "user-1",
      { title: "Second", body: "Two" },
      { now: new Date("2026-10-30T14:00:00.000Z") },
    );
    const nextDay = await sendPushToUser(
      "user-1",
      { title: "Next day", body: "Three" },
      { now: new Date("2026-10-31T08:00:00.000Z") },
    );

    expect(first).toBe(1);
    expect(second).toBe(0);
    expect(nextDay).toBe(1);
    expect(state.sendNotification).toHaveBeenCalledTimes(2);
  });

  it("allows explicit test push via bypassDailyCap even after the daily push was sent", async () => {
    state.subsByUser.set("__current__", [
      {
        id: "sub-1",
        endpoint: "https://push.example/1",
        p256dh: "k",
        auth: "a",
      },
    ]);
    const now = new Date("2026-10-30T08:00:00.000Z");

    expect(
      await sendPushToUser("user-1", { title: "Daily", body: "1" }, { now }),
    ).toBe(1);
    expect(
      await sendPushToUser("user-1", { title: "Blocked", body: "2" }, { now }),
    ).toBe(0);
    expect(
      await sendPushToUser(
        "user-1",
        { title: "Test", body: "3" },
        { now, bypassDailyCap: true },
      ),
    ).toBe(1);
  });

  it("does not re-send sendDailyPushBlast across repeated lifecycle cron ticks on the same day", async () => {
    state.subsByUser.set("user-a", [
      {
        id: "sub-a",
        endpoint: "https://push.example/a",
        p256dh: "k",
        auth: "a",
      },
    ]);
    state.subsByUser.set("user-b", [
      {
        id: "sub-b",
        endpoint: "https://push.example/b",
        p256dh: "k",
        auth: "b",
      },
    ]);

    const firstTick = await sendDailyPushBlast({ sendDate: "2026-10-30" });
    const secondTick = await sendDailyPushBlast({ sendDate: "2026-10-30" });
    const thirdTick = await sendDailyPushBlast({ sendDate: "2026-10-30" });

    expect(firstTick).toEqual({ recipients: 2, sent: 2 });
    expect(secondTick).toEqual({ recipients: 0, sent: 0 });
    expect(thirdTick).toEqual({ recipients: 0, sent: 0 });
    expect(state.sendNotification).toHaveBeenCalledTimes(2);
  });

  it("blocks sendPushToUser later on the same day after sendDailyPushBlast already delivered", async () => {
    state.subsByUser.set("user-a", [
      {
        id: "sub-a",
        endpoint: "https://push.example/a",
        p256dh: "k",
        auth: "a",
      },
    ]);
    state.subsByUser.set("__current__", [
      {
        id: "sub-a",
        endpoint: "https://push.example/a",
        p256dh: "k",
        auth: "a",
      },
    ]);

    const blast = await sendDailyPushBlast({ sendDate: "2026-10-30" });
    const followup = await sendPushToUser(
      "user-a",
      { title: "Nudge", body: "Extra" },
      { now: utcDayWindowStartFromDateKey("2026-10-30") },
    );

    expect(blast).toEqual({ recipients: 1, sent: 1 });
    expect(followup).toBe(0);
    expect(state.sendNotification).toHaveBeenCalledTimes(1);
  });
});
