import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => ({
  purchaseRecorded: false,
  executeCalls: 0,
  notificationWrites: 0,
  invalidateHeader: vi.fn(),
}));

vi.mock("@/lib/header-cache", () => ({
  invalidateHeaderForUser: fake.invalidateHeader,
}));

vi.mock("@/db", () => ({
  db: {
    execute: vi.fn(async () => {
      fake.executeCalls += 1;
      if (fake.purchaseRecorded) {
        return { rows: [{ was_granted: false, resulting_balance: 30 }] };
      }
      fake.purchaseRecorded = true;
      return { rows: [{ was_granted: true, resulting_balance: 30 }] };
    }),
    insert: vi.fn(() => ({
      values: vi.fn(() => {
        fake.notificationWrites += 1;
        return Promise.resolve();
      }),
    })),
  },
}));

import { grantPurchaseCredits } from "@/lib/credits";

describe("grantPurchaseCredits", () => {
  beforeEach(() => {
    fake.purchaseRecorded = false;
    fake.executeCalls = 0;
    fake.notificationWrites = 0;
  });

  it("does not credit the same Stripe Checkout session twice", async () => {
    await grantPurchaseCredits("user-1", 30, "cs_duplicate");
    await grantPurchaseCredits("user-1", 30, "cs_duplicate");

    expect(fake.executeCalls).toBe(2);
    expect(fake.notificationWrites).toBe(1);
  });
});
