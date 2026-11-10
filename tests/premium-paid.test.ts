import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ queue: [] as unknown[][] }));

vi.mock("@/db", () => {
  const chain = () => {
    const c: Record<string, unknown> = {};
    for (const m of ["from", "where", "limit"]) c[m] = () => c;
    c.then = (r: (v: unknown) => unknown) =>
      Promise.resolve(mocks.queue.shift() ?? []).then(r);
    return c;
  };
  return { db: { select: chain } };
});
vi.mock("@/lib/header-cache", () => ({ invalidateHeaderForUser: vi.fn() }));
vi.mock("@/lib/stripe", () => ({ stripe: {} }));

import { isPaidPremiumUser } from "@/lib/premium";

const future = new Date(Date.now() + 86_400_000);

describe("isPaidPremiumUser", () => {
  beforeEach(() => {
    mocks.queue = [];
  });
  it("false for a free user", async () => {
    mocks.queue = [[{ isPremium: false, premiumUntil: null }]];
    expect(await isPaidPremiumUser("u")).toBe(false);
  });
  it("false for a trialing user", async () => {
    mocks.queue = [
      [{ isPremium: true, premiumUntil: future }],
      [{ status: "trialing" }],
    ];
    expect(await isPaidPremiumUser("u")).toBe(false);
  });
  it("true for active PRO (incl. crypto passes)", async () => {
    mocks.queue = [
      [{ isPremium: true, premiumUntil: future }],
      [{ status: "active" }],
    ];
    expect(await isPaidPremiumUser("u")).toBe(true);
  });
  it("true for a manual grant with no subscription row", async () => {
    mocks.queue = [[{ isPremium: true, premiumUntil: future }], []];
    expect(await isPaidPremiumUser("u")).toBe(true);
  });
});
