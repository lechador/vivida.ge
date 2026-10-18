export class Stripe {
  checkout = {
    sessions: {
      create: async (_params?: unknown) => ({
        id: "cs_mock",
        url: "/",
        payment_status: "unpaid",
        metadata: {},
      }),
      retrieve: async (_id: string, _opts?: unknown) => ({
        id: "cs_mock",
        status: "open",
        payment_status: "unpaid",
        metadata: {},
        customer: null,
        subscription: null,
      }),
    },
  };
  billingPortal = {
    sessions: {
      create: async (_params?: unknown) => ({ url: "/account" }),
    },
  };
  subscriptions = {
    retrieve: async (_id: string) => ({
      id: "sub_mock",
      status: "active",
      cancel_at_period_end: false,
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
      items: { data: [] },
    }),
    update: async (_id: string, _params?: unknown) => ({
      id: "sub_mock",
      status: "active",
      cancel_at_period_end: true,
      current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
    }),
  };
  webhooks = {
    constructEvent: (_body: string | Buffer, _sig: string, _secret: string) => ({
      id: "evt_mock",
      type: "ping",
      data: { object: {} },
    }),
  };
  constructor(_key?: string, _config?: unknown) {}
}

export default Stripe;
