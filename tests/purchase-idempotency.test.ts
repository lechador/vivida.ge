import { beforeEach, describe, expect, it, vi } from "vitest";

const fake = vi.hoisted(() => ({
  purchaseRecorded: false,
  accountWrites: 0,
  ledgerWrites: [] as Array<Record<string, unknown>>,
  notificationWrites: 0,
  invalidateHeader: vi.fn(),
}));

vi.mock("@/lib/header-cache", () => ({
  invalidateHeaderForUser: fake.invalidateHeader,
}));

vi.mock("@/db", async () => {
  const schema = await vi.importActual<typeof import("@/db/schema")>("@/db/schema");
  return {
    db: {
      select: vi.fn(() => ({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn(async () =>
              fake.purchaseRecorded ? [{ id: "tx-existing" }] : []
            ),
          })),
        })),
      })),
      insert: vi.fn((table: unknown) => ({
        values: vi.fn((values: Record<string, unknown>) => {
          if (table === schema.creditAccounts) {
            fake.accountWrites += 1;
            return {
              onConflictDoUpdate: vi.fn(() => ({
                returning: vi.fn(async () => [{ balance: 30 }]),
              })),
            };
          }
          if (table === schema.creditTransactions) {
            fake.ledgerWrites.push(values);
            fake.purchaseRecorded = true;
            return Promise.resolve();
          }
          fake.notificationWrites += 1;
          return Promise.resolve();
        }),
      })),
    },
  };
});

import { grantPurchaseCredits } from "@/lib/credits";

describe("grantPurchaseCredits", () => {
  beforeEach(() => {
    fake.purchaseRecorded = false;
    fake.accountWrites = 0;
    fake.ledgerWrites.length = 0;
    fake.notificationWrites = 0;
  });

  it("does not credit the same Stripe Checkout session twice", async () => {
    await grantPurchaseCredits("user-1", 30, "cs_duplicate");
    await grantPurchaseCredits("user-1", 30, "cs_duplicate");

    expect(fake.accountWrites).toBe(1);
    expect(fake.ledgerWrites).toEqual([
      {
        userId: "user-1",
        amount: 30,
        reason: "purchase",
        ref: "cs_duplicate",
      },
    ]);
    expect(fake.notificationWrites).toBe(1);
  });
});
