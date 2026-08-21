import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The store-purchase path. Two properties matter more than the rest and are
 * asserted from several angles below:
 *
 *  1. A credit pack is granted exactly once, however many times RevenueCat
 *     redelivers the event. Getting this wrong mints currency.
 *  2. Neither processor can cancel the other's subscription. Stripe bills the
 *     website, RevenueCat bills the app, and a user may hold either.
 */

type Row = Record<string, unknown>;

const state = vi.hoisted(() => ({
  selects: [] as Row[][],
  inserts: [] as { values: Row }[],
  updates: [] as { values: Row }[],
}));

const mocks = vi.hoisted(() => ({
  grantCreditsOnce: vi.fn(),
  invalidateHeaderForUser: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(state.selects.shift() ?? []),
        }),
      }),
    }),
    insert: () => ({
      values: (values: Row) => ({
        onConflictDoUpdate: () => {
          state.inserts.push({ values });
          return Promise.resolve();
        },
      }),
    }),
    update: () => ({
      set: (values: Row) => ({
        where: () => {
          state.updates.push({ values });
          return Promise.resolve();
        },
      }),
    }),
  },
}));

vi.mock("@/lib/credits", () => ({
  grantCreditsOnce: mocks.grantCreditsOnce,
}));
vi.mock("@/lib/header-cache", () => ({
  invalidateHeaderForUser: mocks.invalidateHeaderForUser,
}));
vi.mock("@/lib/premium", () => ({
  statusHasPremiumAccess: (s: string) => s === "active" || s === "trialing",
}));

import { handleRevenueCatEvent } from "@/lib/revenuecat-core";
import { POST } from "@/app/api/revenuecat/webhook/route";

const USER = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

/** Queue the user lookup (and optionally the existing PRO row) the core reads. */
function givenUser(premiumRow?: Row) {
  state.selects.push([{ id: USER, countryCode: "GE" }]);
  if (premiumRow !== undefined) state.selects.push([premiumRow]);
  else state.selects.push([]);
}

function stripeRow(overrides: Row = {}): Row {
  return {
    userId: USER,
    source: "stripe",
    status: "active",
    stripeSubscriptionId: "sub_live",
    currency: "gel",
    currentPeriodEnd: new Date(Date.now() + 20 * 864e5),
    ...overrides,
  };
}

beforeEach(() => {
  state.selects.length = 0;
  state.inserts.length = 0;
  state.updates.length = 0;
  mocks.grantCreditsOnce.mockReset().mockResolvedValue(true);
  mocks.invalidateHeaderForUser.mockReset();
});

describe("credit packs (consumables)", () => {
  it("grants the pack's credits keyed on the store transaction", async () => {
    givenUser();

    const outcome = await handleRevenueCatEvent({
      type: "NON_RENEWING_PURCHASE",
      app_user_id: USER,
      product_id: "ge.vivida.credits.m",
      transaction_id: "txn_777",
    });

    expect(outcome).toBe("credits_granted");
    expect(mocks.grantCreditsOnce).toHaveBeenCalledWith(
      USER,
      75,
      "purchase",
      "rc:txn_777"
    );
  });

  it("reports a redelivered purchase as a duplicate rather than granting twice", async () => {
    // grantCreditsOnce is idempotent server-side and returns false when the
    // ledger already holds this ref — the second delivery must be a no-op.
    givenUser();
    mocks.grantCreditsOnce.mockResolvedValue(false);

    const outcome = await handleRevenueCatEvent({
      type: "NON_RENEWING_PURCHASE",
      app_user_id: USER,
      product_id: "ge.vivida.credits.m",
      transaction_id: "txn_777",
    });

    expect(outcome).toBe("credits_duplicate");
  });

  it("refuses to grant when the event carries no transaction id", async () => {
    // No transaction id means no idempotency key, and an unkeyed grant on a
    // redeliverable webhook mints credits. Throwing makes the route 500 so
    // RevenueCat retries with a complete payload.
    givenUser();

    await expect(
      handleRevenueCatEvent({
        type: "NON_RENEWING_PURCHASE",
        app_user_id: USER,
        product_id: "ge.vivida.credits.l",
      })
    ).rejects.toThrow(/transaction_id/);
    expect(mocks.grantCreditsOnce).not.toHaveBeenCalled();
  });

  it("does not claw back a refunded pack", async () => {
    givenUser();

    const outcome = await handleRevenueCatEvent({
      type: "REFUND",
      app_user_id: USER,
      product_id: "ge.vivida.credits.s",
      transaction_id: "txn_888",
    });

    expect(outcome).toBe("ignored");
    expect(mocks.grantCreditsOnce).not.toHaveBeenCalled();
  });
});

describe("PRO subscription", () => {
  it("activates the entitlement and records RevenueCat as its owner", async () => {
    const until = Date.now() + 30 * 864e5;
    givenUser();

    const outcome = await handleRevenueCatEvent({
      type: "INITIAL_PURCHASE",
      app_user_id: USER,
      product_id: "ge.vivida.pro.monthly",
      transaction_id: "txn_1",
      original_transaction_id: "otxn_1",
      purchased_at_ms: Date.now(),
      expiration_at_ms: until,
      store: "APP_STORE",
      currency: "GEL",
      price_in_purchased_currency: 19.9,
      country_code: "GE",
    });

    expect(outcome).toBe("premium_activated");
    expect(state.inserts[0].values).toMatchObject({
      source: "revenuecat",
      rcOriginalTransactionId: "otxn_1",
      rcStore: "APP_STORE",
      status: "active",
      currency: "gel",
      amountMinor: 1990,
      // A store subscription has no Stripe identity — leaving a stale id here
      // would let the website's cancel button call Stripe for a dead sub.
      stripeSubscriptionId: null,
      stripePriceId: null,
    });
    expect(state.updates[0].values).toMatchObject({ isPremium: true });
  });

  it("marks a free trial as trialing", async () => {
    givenUser();

    await handleRevenueCatEvent({
      type: "INITIAL_PURCHASE",
      app_user_id: USER,
      product_id: "ge.vivida.pro.monthly",
      transaction_id: "txn_2",
      expiration_at_ms: Date.now() + 7 * 864e5,
      period_type: "TRIAL",
    });

    expect(state.inserts[0].values).toMatchObject({ status: "trialing" });
  });

  it("tolerates Play's base-plan suffix on the product id", async () => {
    givenUser();

    const outcome = await handleRevenueCatEvent({
      type: "RENEWAL",
      app_user_id: USER,
      product_id: "ge.vivida.pro.monthly:monthly-base",
      transaction_id: "txn_3",
      expiration_at_ms: Date.now() + 30 * 864e5,
    });

    expect(outcome).toBe("premium_activated");
  });

  it("revokes on expiry when RevenueCat owns the subscription", async () => {
    givenUser({ userId: USER, source: "revenuecat", status: "active" });

    const outcome = await handleRevenueCatEvent({
      type: "EXPIRATION",
      app_user_id: USER,
      product_id: "ge.vivida.pro.monthly",
    });

    expect(outcome).toBe("premium_deactivated");
    expect(state.updates.at(-1)?.values).toMatchObject({ isPremium: false });
  });

  it("leaves the entitlement alone on CANCELLATION", async () => {
    // Cancelling means "do not renew", not "cut off now" — the user has paid
    // through the end of the period. This is the classic way to cut off a
    // paying customer early, so it is asserted explicitly.
    givenUser({ userId: USER, source: "revenuecat", status: "active" });

    const outcome = await handleRevenueCatEvent({
      type: "CANCELLATION",
      app_user_id: USER,
      product_id: "ge.vivida.pro.monthly",
    });

    expect(outcome).toBe("ignored");
    expect(state.updates).toHaveLength(0);
  });

  it("leaves the entitlement alone on BILLING_ISSUE", async () => {
    givenUser({ userId: USER, source: "revenuecat", status: "active" });

    const outcome = await handleRevenueCatEvent({
      type: "BILLING_ISSUE",
      app_user_id: USER,
      product_id: "ge.vivida.pro.monthly",
    });

    expect(outcome).toBe("ignored");
    expect(state.updates).toHaveLength(0);
  });
});

describe("the two processors cannot cancel each other", () => {
  it("ignores a store expiry when PRO is billed by Stripe", async () => {
    givenUser(stripeRow());

    const outcome = await handleRevenueCatEvent({
      type: "EXPIRATION",
      app_user_id: USER,
      product_id: "ge.vivida.pro.monthly",
    });

    expect(outcome).toBe("ignored");
    expect(state.updates).toHaveLength(0);
  });

  it("refuses to overwrite a live Stripe subscription with a store purchase", async () => {
    givenUser(stripeRow());

    const outcome = await handleRevenueCatEvent({
      type: "INITIAL_PURCHASE",
      app_user_id: USER,
      product_id: "ge.vivida.pro.monthly",
      transaction_id: "txn_dup",
      expiration_at_ms: Date.now() + 30 * 864e5,
    });

    // The Stripe row owns the cancellation path; clobbering it would strand a
    // subscription nobody can cancel. Support refunds the duplicate instead.
    expect(outcome).toBe("source_conflict");
    expect(state.inserts).toHaveLength(0);
    expect(state.updates).toHaveLength(0);
  });

  it("takes over once the Stripe subscription has lapsed", async () => {
    givenUser(
      stripeRow({
        status: "canceled",
        currentPeriodEnd: new Date(Date.now() - 864e5),
      })
    );

    const outcome = await handleRevenueCatEvent({
      type: "INITIAL_PURCHASE",
      app_user_id: USER,
      product_id: "ge.vivida.pro.monthly",
      transaction_id: "txn_new",
      expiration_at_ms: Date.now() + 30 * 864e5,
    });

    expect(outcome).toBe("premium_activated");
    expect(state.inserts[0].values).toMatchObject({ source: "revenuecat" });
  });
});

describe("events we cannot attribute", () => {
  it("ignores a purchase made before sign-in (anonymous RevenueCat id)", async () => {
    const outcome = await handleRevenueCatEvent({
      type: "NON_RENEWING_PURCHASE",
      app_user_id: "$RCAnonymousID:8f3ab2",
      product_id: "ge.vivida.credits.s",
      transaction_id: "txn_anon",
    });

    expect(outcome).toBe("ignored");
    expect(mocks.grantCreditsOnce).not.toHaveBeenCalled();
  });

  it("ignores an event for a user who no longer exists", async () => {
    state.selects.push([]);

    const outcome = await handleRevenueCatEvent({
      type: "NON_RENEWING_PURCHASE",
      app_user_id: USER,
      product_id: "ge.vivida.credits.s",
      transaction_id: "txn_gone",
    });

    expect(outcome).toBe("ignored");
  });

  it("ignores a product that is not in the catalogue", async () => {
    givenUser();

    const outcome = await handleRevenueCatEvent({
      type: "NON_RENEWING_PURCHASE",
      app_user_id: USER,
      product_id: "ge.vivida.something.else",
      transaction_id: "txn_x",
    });

    expect(outcome).toBe("ignored");
    expect(mocks.grantCreditsOnce).not.toHaveBeenCalled();
  });
});

describe("POST /api/revenuecat/webhook", () => {
  const SECRET = "shared-secret";

  function request(body: unknown, auth?: string) {
    return new Request("https://www.vivida.ge/api/revenuecat/webhook", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(auth ? { authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });
  }

  afterEach(() => {
    delete process.env.REVENUECAT_WEBHOOK_AUTH;
  });

  it("refuses every request when the shared secret is unset", async () => {
    // An unset secret must never degrade into an open endpoint that writes
    // entitlements and mints credits.
    const res = await POST(request({ event: { type: "TEST" } }, SECRET));
    expect(res.status).toBe(503);
  });

  it("rejects a wrong secret", async () => {
    process.env.REVENUECAT_WEBHOOK_AUTH = SECRET;
    const res = await POST(request({ event: { type: "TEST" } }, "nope"));
    expect(res.status).toBe(403);
  });

  it("unwraps RevenueCat's { event } envelope", async () => {
    process.env.REVENUECAT_WEBHOOK_AUTH = SECRET;
    givenUser();

    const res = await POST(
      request(
        {
          api_version: "1.0",
          event: {
            type: "NON_RENEWING_PURCHASE",
            app_user_id: USER,
            product_id: "ge.vivida.credits.s",
            transaction_id: "txn_env",
          },
        },
        SECRET
      )
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      outcome: "credits_granted",
    });
    expect(mocks.grantCreditsOnce).toHaveBeenCalledWith(
      USER,
      30,
      "purchase",
      "rc:txn_env"
    );
  });

  it("answers 500 so RevenueCat redelivers when a grant fails", async () => {
    process.env.REVENUECAT_WEBHOOK_AUTH = SECRET;
    givenUser();
    mocks.grantCreditsOnce.mockRejectedValue(new Error("db down"));

    const res = await POST(
      request(
        {
          event: {
            type: "NON_RENEWING_PURCHASE",
            app_user_id: USER,
            product_id: "ge.vivida.credits.s",
            transaction_id: "txn_fail",
          },
        },
        SECRET
      )
    );

    expect(res.status).toBe(500);
  });
});
