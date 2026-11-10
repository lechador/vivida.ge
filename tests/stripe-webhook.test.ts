import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  activatePremium: vi.fn(),
  after: vi.fn(),
  constructWebhookEvent: vi.fn(),
  grantPurchaseCredits: vi.fn(),
  recordOutcomes: vi.fn(),
  retrieveSubscription: vi.fn(),
  syncPremium: vi.fn(),
  sendPaymentFailed: vi.fn(),
  trackInvoicePaid: vi.fn(),
}));

vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("@/db", () => ({ db: {} }));
vi.mock("@/lib/stripe", () => ({
  constructWebhookEvent: mocks.constructWebhookEvent,
  stripe: () => ({
    subscriptions: { retrieve: mocks.retrieveSubscription },
  }),
}));
vi.mock("@/lib/reports/generate", () => ({ generateAndStoreReport: vi.fn() }));
vi.mock("@/lib/credits", () => ({
  grantPurchaseCredits: mocks.grantPurchaseCredits,
}));
vi.mock("@/lib/payment-failed-notice", () => ({
  sendPaymentFailedNotice: mocks.sendPaymentFailed,
}));
vi.mock("@/lib/checkout-tracking", () => ({
  trackCheckoutCompleted: vi.fn(),
  trackInvoicePaid: mocks.trackInvoicePaid,
}));
vi.mock("@/lib/premium", () => ({
  findUserIdForStripeSubscription: vi.fn().mockResolvedValue(null),
  activatePremiumFromCheckout: mocks.activatePremium,
  getBillingIdentity: vi.fn().mockResolvedValue(null),
  syncPremiumSubscription: mocks.syncPremium,
}));
vi.mock("@/lib/experiment-outcomes", () => ({
  recordExperimentOutcomesBestEffort: mocks.recordOutcomes,
}));

import { POST } from "@/app/api/stripe/webhook/route";

function request(signature?: string) {
  return new Request("https://vivida.ge/api/stripe/webhook", {
    method: "POST",
    headers: signature ? { "stripe-signature": signature } : undefined,
    body: "raw-stripe-payload",
  });
}

function creditEvent(
  metadata: Record<string, string>,
  id = "cs_1",
  paymentStatus = "paid",
  type = "checkout.session.completed",
) {
  return {
    type,
    data: { object: { id, metadata, payment_status: paymentStatus } },
  };
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mocks.constructWebhookEvent.mockReturnValue(
      creditEvent({ kind: "credits", userId: "user-1", credits: "30" }),
    );
    mocks.grantPurchaseCredits.mockResolvedValue(undefined);
  });

  it("rejects requests without a Stripe signature", async () => {
    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(await response.text()).toBe("missing signature");
    expect(mocks.constructWebhookEvent).not.toHaveBeenCalled();
  });

  it("rejects payloads that fail signature verification", async () => {
    mocks.constructWebhookEvent.mockImplementation(() => {
      throw new Error("invalid signature");
    });

    const response = await POST(request("sig_bad"));

    expect(response.status).toBe(400);
    expect(await response.text()).toContain("bad signature");
    expect(mocks.grantPurchaseCredits).not.toHaveBeenCalled();
  });

  it("grants purchased credits using the Stripe session as idempotency key", async () => {
    const response = await POST(request("sig_valid"));

    expect(response.status).toBe(200);
    expect(mocks.grantPurchaseCredits).toHaveBeenCalledWith(
      "user-1",
      30,
      "cs_1",
    );
  });

  it("ignores malformed credit metadata", async () => {
    mocks.constructWebhookEvent.mockReturnValue(
      creditEvent({ kind: "credits", userId: "user-1", credits: "invalid" }),
    );

    const response = await POST(request("sig_valid"));

    expect(response.status).toBe(200);
    expect(mocks.grantPurchaseCredits).not.toHaveBeenCalled();
  });

  it("does not book a free-trial checkout as a purchase", async () => {
    mocks.constructWebhookEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_trial",
          payment_status: "no_payment_required",
          metadata: { kind: "premium", userId: "user-1", trialDays: "7" },
        },
      },
    });

    const response = await POST(request("sig_valid"));

    expect(response.status).toBe(200);
    expect(mocks.activatePremium).toHaveBeenCalled();
    expect(mocks.recordOutcomes).not.toHaveBeenCalled();
  });

  it("books a paid premium checkout as a purchase", async () => {
    mocks.constructWebhookEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_paid",
          payment_status: "paid",
          metadata: { kind: "premium", userId: "user-1" },
        },
      },
    });

    const response = await POST(request("sig_valid"));

    expect(response.status).toBe(200);
    expect(mocks.recordOutcomes).toHaveBeenCalledWith(
      "user-1",
      expect.any(Array),
      "purchase_completed",
      "stripe_webhook:premium",
      "cs_paid",
    );
  });

  it("books the first paid invoice of a trial as the purchase", async () => {
    mocks.retrieveSubscription.mockResolvedValue({
      id: "sub_1",
      metadata: { userId: "user-1", kind: "premium", trialDays: "7" },
    });
    mocks.constructWebhookEvent.mockReturnValue({
      type: "invoice.paid",
      data: {
        object: {
          id: "in_1",
          parent: {
            type: "subscription_details",
            subscription_details: { subscription: "sub_1", metadata: {} },
          },
        },
      },
    });

    const response = await POST(request("sig_valid"));

    expect(response.status).toBe(200);
    expect(mocks.retrieveSubscription).toHaveBeenCalledWith("sub_1");
    expect(mocks.syncPremium).toHaveBeenCalled();
    expect(mocks.recordOutcomes).toHaveBeenCalledWith(
      "user-1",
      expect.any(Array),
      "purchase_completed",
      "stripe_webhook:invoice_paid",
      "in_1",
    );
  });

  it("does not grant credits while payment is still pending", async () => {
    mocks.constructWebhookEvent.mockReturnValue(
      creditEvent(
        { kind: "credits", userId: "user-1", credits: "30" },
        "cs_pending",
        "unpaid",
      ),
    );

    const response = await POST(request("sig_valid"));

    expect(response.status).toBe(200);
    expect(mocks.grantPurchaseCredits).not.toHaveBeenCalled();
  });

  it("grants once, under the session key, when the async payment succeeds", async () => {
    mocks.constructWebhookEvent.mockReturnValue(
      creditEvent(
        { kind: "credits", userId: "user-1", credits: "30" },
        "cs_async",
        "paid",
        "checkout.session.async_payment_succeeded",
      ),
    );

    const response = await POST(request("sig_valid"));

    expect(response.status).toBe(200);
    expect(mocks.grantPurchaseCredits).toHaveBeenCalledTimes(1);
    expect(mocks.grantPurchaseCredits).toHaveBeenCalledWith(
      "user-1",
      30,
      "cs_async",
    );
  });

  it("re-fetches the subscription instead of trusting the event payload", async () => {
    mocks.retrieveSubscription.mockResolvedValue({
      id: "sub_live",
      status: "active",
    });
    mocks.constructWebhookEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_live", status: "canceled" } },
    });

    await POST(request("sig_valid"));

    expect(mocks.retrieveSubscription).toHaveBeenCalledWith("sub_live");
    expect(mocks.syncPremium).toHaveBeenCalledWith({
      id: "sub_live",
      status: "active",
    });
  });

  it("sends the dunning notice on invoice.payment_failed", async () => {
    mocks.retrieveSubscription.mockResolvedValue({
      id: "sub_1",
      metadata: { userId: "user-1", kind: "premium" },
    });
    mocks.sendPaymentFailed.mockResolvedValue("sent");
    const invoice = {
      id: "in_fail",
      parent: { subscription_details: { subscription: "sub_1" } },
    };
    mocks.constructWebhookEvent.mockReturnValue({
      type: "invoice.payment_failed",
      data: { object: invoice },
    });

    const response = await POST(request("sig_valid"));

    expect(response.status).toBe(200);
    expect(mocks.sendPaymentFailed).toHaveBeenCalledWith({
      invoice,
      userId: "user-1",
    });
  });

  it("acknowledges refunds and disputes without touching credits", async () => {
    mocks.constructWebhookEvent.mockReturnValue({
      id: "evt_1",
      type: "charge.dispute.created",
      data: {
        object: {
          id: "dp_1",
          amount: 500,
          currency: "gbp",
          reason: "fraudulent",
        },
      },
    });

    const response = await POST(request("sig_valid"));

    expect(response.status).toBe(200);
    expect(mocks.grantPurchaseCredits).not.toHaveBeenCalled();
  });
});
