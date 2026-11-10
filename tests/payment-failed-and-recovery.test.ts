import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  existingClaims: [] as unknown[],
  inserted: [] as Array<Record<string, unknown>>,
  updated: [] as Array<Record<string, unknown>>,
  send: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/db", () => {
  // Minimal chainable drizzle fake. select() resolves to the user row first
  // and the existing-claims list second (the order the notice queries them).
  let selects = 0;
  const db = {
    select: () => {
      const call = selects++;
      const rows =
        call % 2 === 0
          ? [{ email: "a@b.c", name: "Nino K", locale: "en" }]
          : state.existingClaims;
      const chain: Record<string, unknown> = {
        from: () => chain,
        where: () => chain,
        limit: () => Promise.resolve(rows),
      };
      return chain;
    },
    insert: () => ({
      values: (v: Record<string, unknown>) => {
        state.inserted.push(v);
        return { returning: () => Promise.resolve([{ id: 7 }]) };
      },
    }),
    update: () => ({
      set: (v: Record<string, unknown>) => {
        state.updated.push(v);
        return { where: () => Promise.resolve() };
      },
    }),
  };
  return { db };
});
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: state.send };
  },
}));
vi.mock("@/lib/resend-throttle", () => ({ acquireResendSlot: vi.fn() }));
vi.mock("@/lib/unsubscribe", () => ({
  getOrCreateUnsubscribeToken: vi.fn().mockResolvedValue("tok"),
}));
vi.mock("@/lib/push", () => ({
  isPushConfigured: () => true,
  sendPushToUser: state.push,
}));

import { sendPaymentFailedNotice } from "@/lib/payment-failed-notice";
import {
  abandonedStartsFromSessions,
  type RecoverySessionLike,
} from "@/lib/checkout-recovery-rules";
import { shouldIgnoreStaleSubscriptionEvent } from "@/lib/premium";

vi.mock("@/lib/stripe", () => ({ stripe: {} }));
vi.mock("@/lib/header-cache", () => ({ invalidateHeaderForUser: vi.fn() }));

const invoice = {
  id: "in_1",
  amount_due: 499,
  currency: "gbp",
  billing_reason: "subscription_cycle",
  parent: { subscription_details: { subscription: "sub_1" } },
} as never;

describe("sendPaymentFailedNotice", () => {
  beforeEach(() => {
    state.existingClaims = [];
    state.inserted = [];
    state.updated = [];
    state.send.mockReset().mockResolvedValue({ error: null });
    state.push.mockReset().mockResolvedValue(1);
    process.env.RESEND_API_KEY = "re_test";
  });

  it("emails once, claims per invoice and pushes", async () => {
    const result = await sendPaymentFailedNotice({ invoice, userId: "u1" });

    expect(result).toBe("sent");
    expect(state.send).toHaveBeenCalledTimes(1);
    expect(state.send.mock.calls[0][1]).toEqual({
      idempotencyKey: "payment_failed:in_1",
    });
    expect(state.inserted[0]).toMatchObject({
      kind: "payment_failed:in_1",
      status: "pending",
    });
    expect(state.updated.at(-1)).toMatchObject({ status: "sent" });
    expect(state.push).toHaveBeenCalledTimes(1);
  });

  it("does not resend for an invoice that already has a claim", async () => {
    state.existingClaims = [{ id: 1 }];

    const result = await sendPaymentFailedNotice({ invoice, userId: "u1" });

    expect(result).toBe("duplicate");
    expect(state.send).not.toHaveBeenCalled();
    expect(state.inserted).toHaveLength(0);
  });

  it("skips the failed first invoice inside Checkout", async () => {
    const first = {
      ...(invoice as object),
      billing_reason: "subscription_create",
    } as never;
    expect(
      await sendPaymentFailedNotice({ invoice: first, userId: "u1" }),
    ).toBe("skipped");
    expect(state.send).not.toHaveBeenCalled();
  });
});

describe("shouldIgnoreStaleSubscriptionEvent", () => {
  const future = new Date(Date.now() + 86_400_000);
  const past = new Date(Date.now() - 86_400_000);

  it("ignores a deleted old subscription while the stored one is entitled", () => {
    expect(
      shouldIgnoreStaleSubscriptionEvent(
        {
          stripeSubscriptionId: "sub_new",
          status: "active",
          currentPeriodEnd: future,
        },
        { id: "sub_old", status: "canceled" },
      ),
    ).toBe(true);
  });

  it("applies the event when it is for the stored subscription", () => {
    expect(
      shouldIgnoreStaleSubscriptionEvent(
        {
          stripeSubscriptionId: "sub_new",
          status: "active",
          currentPeriodEnd: future,
        },
        { id: "sub_new", status: "canceled" },
      ),
    ).toBe(false);
  });

  it("applies the event when the stored subscription has lapsed", () => {
    expect(
      shouldIgnoreStaleSubscriptionEvent(
        {
          stripeSubscriptionId: "sub_new",
          status: "active",
          currentPeriodEnd: past,
        },
        { id: "sub_old", status: "canceled" },
      ),
    ).toBe(false);
  });

  it("lets an entitled newer subscription take the row over", () => {
    expect(
      shouldIgnoreStaleSubscriptionEvent(
        {
          stripeSubscriptionId: "sub_old",
          status: "active",
          currentPeriodEnd: future,
        },
        { id: "sub_new", status: "active" },
      ),
    ).toBe(false);
  });
});

describe("abandonedStartsFromSessions", () => {
  const now = new Date("2026-11-10T12:00:00Z");
  const ago = (h: number) => Math.floor((now.getTime() - h * 3_600_000) / 1000);
  const s = (over: Partial<RecoverySessionLike>): RecoverySessionLike => ({
    created: ago(5),
    status: "expired",
    metadata: { kind: "premium", userId: "u1" },
    ...over,
  });

  it("picks up a checkout that has no experiment assignment", () => {
    const out = abandonedStartsFromSessions([s({})], now);
    expect(out.get("u1")?.getTime()).toBe(ago(5) * 1000);
  });

  it("ignores too-fresh, too-old, foreign and completed-after sessions", () => {
    const out = abandonedStartsFromSessions(
      [
        s({
          created: ago(0.2),
          metadata: { kind: "credits", userId: "fresh" },
        }),
        s({ created: ago(60), metadata: { kind: "credits", userId: "old" } }),
        s({ metadata: { kind: "report", userId: "rep" } }),
        s({ metadata: { kind: "credits", userId: "bought" } }),
        s({
          created: ago(2),
          status: "complete",
          metadata: { kind: "credits", userId: "bought" },
        }),
      ],
      now,
    );
    expect([...out.keys()]).toEqual([]);
  });
});
