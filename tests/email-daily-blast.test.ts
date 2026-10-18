import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Regression tests for the daily-horoscope blast.
 *
 * Context: the blast used to send one Resend request per recipient through a
 * serialized throttle, capping it at ~540 emails/day. The audience outgrew that
 * in August 2026, delivery fell to 41%, and — because the lifecycle jobs ran
 * after the blast in the same cron invocation — winback, verify_reminder,
 * birthday and profile_incomplete all stopped sending for nine weeks.
 *
 * These tests pin the two properties that keep that from recurring:
 *   1. the drain uses the batched transport (few requests, not one per user);
 *   2. undelivered rows are retired rather than left pending forever.
 */

const mocks = vi.hoisted(() => {
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.RESEND_FROM = "Vivida <hello@vivida.ge>";
  return {
    batchSend: vi.fn(),
    singleSend: vi.fn(),
    ensureDailyFor: vi.fn(),
    unsubscribeToken: vi.fn(),
    /** Rows passed to db.update(...).set(...), newest last. */
    updates: [] as Record<string, unknown>[],
    /** Mutable fixtures the table-aware db double reads. */
    audience: [] as Record<string, unknown>[],
    outstanding: [] as Record<string, unknown>[],
    enqueued: [] as { userId: string }[],
  };
});

vi.mock("@/db", async () => {
  const { getTableName } = await import("drizzle-orm");

  const rowsFor = (table: unknown) => {
    const name = getTableName(table as never);
    if (name === "user") return mocks.audience;
    if (name === "daily_email_log") return mocks.outstanding;
    if (name === "profile") return [{ timezone: "Asia/Tbilisi" }];
    return [];
  };

  return {
    db: {
      select: () => ({
        from: (table: unknown) => {
          const rows = rowsFor(table);
          const settled = () =>
            Object.assign(Promise.resolve(rows), {
              limit: (n: number) => Promise.resolve(rows.slice(0, n)),
            });
          const builder = {
            where: settled,
            // resolveAudience joins users -> profiles before filtering.
            innerJoin: () => builder,
            leftJoin: () => builder,
          };
          return Object.assign(settled(), builder);
        },
      }),
      insert: () => ({
        values: (values: { userId: string }[]) => ({
          onConflictDoNothing: () => ({
            returning: () => Promise.resolve(values),
          }),
        }),
      }),
      update: () => ({
        set: (values: Record<string, unknown>) => ({
          where: () => {
            // A plain thenable, so both `.returning()` and a bare await reach
            // the recorder. (A native Promise cannot have its `then` shadowed.)
            const record = () => {
              mocks.updates.push(values);
            };
            return {
              returning: () => {
                record();
                return Promise.resolve([{ userId: "u1" }]);
              },
              then: (
                resolve: (v: unknown) => unknown,
                reject?: (e: unknown) => unknown,
              ) => {
                record();
                return Promise.resolve([] as unknown[]).then(resolve, reject);
              },
            };
          },
        }),
      }),
    },
  };
});

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.singleSend };
    batch = { send: mocks.batchSend };
  },
}));

vi.mock("@/actions/daily", () => ({ ensureDailyFor: mocks.ensureDailyFor }));
vi.mock("@/lib/unsubscribe", () => ({
  getOrCreateUnsubscribeToken: mocks.unsubscribeToken,
}));
vi.mock("@/lib/resend-throttle", () => ({ acquireResendSlot: async () => {} }));
vi.mock("@/lib/email-templates/daily-horoscope", () => ({
  DailyHoroscopeEmail: () => null,
}));
vi.mock("@/lib/email-templates/profile-incomplete", () => ({
  ProfileIncompleteEmail: () => null,
}));
vi.mock("@/lib/email-templates/marketing", () => ({
  MarketingEmail: () => null,
}));
vi.mock("@/lib/email-templates/low-credit-offer", () => ({
  LowCreditOfferEmail: () => null,
}));
vi.mock("@/lib/email-templates", () => ({}));

import { sendDailyHoroscopeBlast } from "@/lib/email-marketing";

function audienceOf(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    userId: `u${i}`,
    email: `u${i}@example.com`,
    name: `User ${i}`,
    locale: "ka",
  }));
}

function outstandingOf(n: number) {
  return Array.from({ length: n }, (_, i) => ({ userId: `u${i}` }));
}

beforeEach(() => {
  mocks.updates.length = 0;
  mocks.audience = [];
  mocks.outstanding = [];
  mocks.unsubscribeToken.mockResolvedValue("tok");
  mocks.ensureDailyFor.mockResolvedValue({
    date: "2026-10-16",
    headline: "Headline",
    summary: "Summary",
    transits: { headlineAspect: null, topAspects: [], moonHouse: 7 },
  });
  mocks.batchSend.mockResolvedValue({ data: [{ id: "e1" }] });
  mocks.singleSend.mockResolvedValue({ data: { id: "e1" } });
});

describe("sendDailyHoroscopeBlast transport", () => {
  it("sends through the batch API instead of one request per recipient", async () => {
    mocks.audience = audienceOf(3);
    mocks.outstanding = outstandingOf(3);

    const result = await sendDailyHoroscopeBlast({ sendDate: "2026-10-16" });

    expect(mocks.batchSend).toHaveBeenCalledTimes(1);
    expect(mocks.batchSend.mock.calls[0][0]).toHaveLength(3);
    // The whole point of the change: no per-recipient requests.
    expect(mocks.singleSend).not.toHaveBeenCalled();
    expect(result.sent).toBe(3);
    expect(result.failed).toBe(0);
  });

  it("chunks a large audience into requests of at most 100", async () => {
    mocks.audience = audienceOf(250);
    mocks.outstanding = outstandingOf(250);

    const result = await sendDailyHoroscopeBlast({ sendDate: "2026-10-16" });

    const sizes = mocks.batchSend.mock.calls.map(
      (c) => (c[0] as unknown[]).length,
    );
    expect(sizes).toEqual([100, 100, 50]);
    expect(Math.max(...sizes)).toBeLessThanOrEqual(100);
    expect(result.sent).toBe(250);
  });

  it("records sent rows so the drain is not repeated", async () => {
    mocks.audience = audienceOf(2);
    mocks.outstanding = outstandingOf(2);

    await sendDailyHoroscopeBlast({ sendDate: "2026-10-16" });

    expect(mocks.updates).toContainEqual(
      expect.objectContaining({ status: "sent" }),
    );
  });

  it("falls back to individual sends when a whole batch is rejected", async () => {
    mocks.audience = audienceOf(3);
    mocks.outstanding = outstandingOf(3);
    // A chunk-level rejection (e.g. payload validation) must not lose the batch.
    mocks.batchSend.mockResolvedValue({
      error: { message: "invalid payload" },
    });

    const result = await sendDailyHoroscopeBlast({ sendDate: "2026-10-16" });

    expect(mocks.singleSend).toHaveBeenCalledTimes(3);
    expect(result.sent).toBe(3);
  });

  it("marks recipients with no chart as skipped, not failed", async () => {
    mocks.audience = audienceOf(2);
    mocks.outstanding = outstandingOf(2);
    mocks.ensureDailyFor.mockResolvedValue(null);

    const result = await sendDailyHoroscopeBlast({ sendDate: "2026-10-16" });

    expect(result.skipped).toBe(2);
    expect(result.failed).toBe(0);
    expect(mocks.batchSend).not.toHaveBeenCalled();
    expect(mocks.updates).toContainEqual(
      expect.objectContaining({ status: "skipped" }),
    );
  });

  it("bounds individual fallback retries so a poisoned chunk cannot spin", async () => {
    // 200 recipients => two chunks of 100. Both are rejected at chunk level.
    mocks.audience = audienceOf(200);
    mocks.outstanding = outstandingOf(200);
    mocks.batchSend.mockResolvedValue({
      error: { message: "invalid payload" },
    });
    mocks.singleSend.mockResolvedValue({ data: { id: "e1" } });

    const result = await sendDailyHoroscopeBlast({ sendDate: "2026-10-16" });

    // At most 25 individual retries per rejected chunk, not 100: each retry costs
    // 1.1s through the serial throttle, and an unbounded fallback could consume
    // the whole 300s invocation.
    expect(mocks.singleSend.mock.calls.length).toBeLessThanOrEqual(50);
    expect(mocks.singleSend.mock.calls.length).toBeGreaterThan(0);
    // The deferred remainder is recorded as failed so the next tick retries it as
    // a batch rather than losing it.
    expect(result.failed).toBeGreaterThan(0);
    expect(mocks.updates).toContainEqual(
      expect.objectContaining({ status: "failed" }),
    );
  });

  it("reports a failed batch as failed so the retry tick can pick it up", async () => {
    mocks.audience = audienceOf(2);
    mocks.outstanding = outstandingOf(2);
    mocks.batchSend.mockRejectedValue(new Error("network down"));
    mocks.singleSend.mockRejectedValue(new Error("network down"));

    const result = await sendDailyHoroscopeBlast({ sendDate: "2026-10-16" });

    expect(result.failed).toBe(2);
    expect(result.sent).toBe(0);
    expect(mocks.updates).toContainEqual(
      expect.objectContaining({ status: "failed" }),
    );
  });
});

describe("expireStaleDailyRows", () => {
  it("retires undelivered rows to a terminal status", async () => {
    const { expireStaleDailyRows } = await import("@/lib/email-marketing");

    const expired = await expireStaleDailyRows({ today: "2026-10-16" });

    expect(expired).toBe(1);
    expect(mocks.updates).toContainEqual(
      expect.objectContaining({ status: "expired" }),
    );
  });

  it("records why the row was retired, for later forensics", async () => {
    const { expireStaleDailyRows } = await import("@/lib/email-marketing");

    await expireStaleDailyRows({ today: "2026-10-16" });

    const expiry = mocks.updates.find((u) => u.status === "expired");
    expect(String(expiry?.lastError)).toContain("expired");
    expect(expiry?.lastAttemptAt).toBeInstanceOf(Date);
  });
});
