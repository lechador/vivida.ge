import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  spendOnce: vi.fn(),
  isPaidPremiumUser: vi.fn(),
  selectQueue: [] as unknown[][],
}));

function chain(result: () => unknown) {
  const c: Record<string, unknown> = {};
  for (const m of ["from", "where", "limit", "values", "onConflictDoNothing"])
    c[m] = () => c;
  c.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => void) =>
    Promise.resolve(result()).then(resolve, reject);
  return c;
}

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/db", () => ({
  db: {
    select: () => chain(() => mocks.selectQueue.shift() ?? []),
    insert: () => chain(() => undefined),
  },
}));
vi.mock("next/server", () => ({ after: () => undefined }));
vi.mock("@/lib/credits", () => ({
  CREDIT_COST: { pdfReport: 50 },
  spendOnce: mocks.spendOnce,
}));
vi.mock("@/lib/premium", () => ({
  isPaidPremiumUser: mocks.isPaidPremiumUser,
}));
vi.mock("@/lib/reports/generate", () => ({
  generateAndStoreReport: vi.fn(),
}));
vi.mock("@/lib/stripe", () => ({ reportCurrency: () => "gel" }));
vi.mock("@/lib/i18n/user-locale", () => ({
  getUserLocale: async () => "en",
  normalizeUserLocale: (v: string) => v,
}));
vi.mock("@/lib/library", () => ({ archiveLibraryEntry: vi.fn() }));
vi.mock("@/lib/relationship-core", () => ({
  getRelationshipPartnerForViewer: vi.fn(),
}));
vi.mock("@/lib/report-store-availability", () => ({
  canStartReportCheckout: () => true,
}));

import { POST } from "@/app/api/reports/checkout/route";

const chartRow = { inputHash: "hash-1" };
const reportRow = {
  id: "r1",
  userId: "user-1",
  type: "natal",
  language: "en",
  status: "paid",
  createdAt: new Date(),
  editionKey: "evergreen",
  subjectKey: "",
};

function request() {
  return new Request("https://vivida.ge/api/reports/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "natal" }),
  });
}

describe("POST /api/reports/checkout premium handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    // chart lookup, existing reports, then the post-insert re-read
    mocks.selectQueue = [[chartRow], [], [reportRow]];
  });

  it("charges a trialing user normally (premium bypass disabled)", async () => {
    mocks.isPaidPremiumUser.mockResolvedValue(false);
    mocks.spendOnce.mockResolvedValue("unlocked");
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(mocks.spendOnce).toHaveBeenCalledWith(
      "user-1",
      50,
      "spend_report",
      expect.stringContaining("report-store:natal"),
      { ignorePremium: true },
    );
  });

  it("returns the paywall when a trialing user lacks credits", async () => {
    mocks.isPaidPremiumUser.mockResolvedValue(false);
    mocks.spendOnce.mockResolvedValue("insufficient");
    const res = await POST(request());
    expect(res.status).toBe(402);
    expect(await res.json()).toMatchObject({ error: "insufficient_credits" });
  });

  it("keeps reports included for paid PRO (no bypass override)", async () => {
    mocks.isPaidPremiumUser.mockResolvedValue(true);
    mocks.spendOnce.mockResolvedValue("already");
    const res = await POST(request());
    expect(res.status).toBe(200);
    expect(mocks.spendOnce.mock.calls[0][4]).toBeUndefined();
  });

  it("charges a free user as before", async () => {
    mocks.isPaidPremiumUser.mockResolvedValue(false);
    mocks.spendOnce.mockResolvedValue("unlocked");
    await POST(request());
    expect(mocks.spendOnce.mock.calls[0][1]).toBe(50);
  });
});
