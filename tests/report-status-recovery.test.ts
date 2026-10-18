import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  after: vi.fn(),
  auth: vi.fn(),
  generate: vi.fn(),
  report: {} as Record<string, unknown>,
  updateSet: vi.fn(),
}));

vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/reports/generate", () => ({ generateAndStoreReport: mocks.generate }));
vi.mock("@/lib/stripe", () => ({ isStripeConfigured: () => false, stripe: vi.fn() }));
vi.mock("@/db", () => ({
  db: {
    select: () => ({ from: () => ({ where: () => ({ limit: async () => [mocks.report] }) }) }),
    update: () => ({ set: (value: unknown) => { mocks.updateSet(value); return { where: async () => undefined }; } }),
  },
}));

import { GET } from "@/app/api/reports/[id]/route";

function request() {
  return GET(new Request("https://vivida.ge/api/reports/report-1"), { params: Promise.resolve({ id: "report-1" }) });
}

function report(status: "paid" | "generating" | "ready", paidAgoMs: number) {
  return {
    id: "report-1",
    userId: "user-1",
    type: "career",
    status,
    comped: false,
    error: null,
    stripeSessionId: null,
    paidAt: new Date(Date.now() - paidAgoMs),
    generationStartedAt: status === "generating" ? new Date(Date.now() - paidAgoMs) : null,
    createdAt: new Date(),
  };
}

describe("report generation recovery", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.after.mockReset();
    mocks.generate.mockReset();
    mocks.updateSet.mockReset();
  });

  it("requeues a paid credit report from status polling", async () => {
    mocks.report = report("paid", 2 * 60_000);
    const response = await request();
    const body = await response.json();
    expect(body).toMatchObject({ status: "paid", recovering: true, retryable: true });
    expect(mocks.after).toHaveBeenCalledOnce();
  });

  it("resets and requeues a generation stuck for more than five minutes", async () => {
    mocks.report = report("generating", 6 * 60_000);
    const response = await request();
    const body = await response.json();
    expect(mocks.updateSet).toHaveBeenCalledWith({ status: "paid", generationStartedAt: null, error: null });
    expect(body).toMatchObject({ status: "paid", recovering: true, retryable: true });
    expect(mocks.after).toHaveBeenCalledOnce();
  });

  it("does not interfere with an active generation", async () => {
    mocks.report = report("generating", 2 * 60_000);
    const response = await request();
    const body = await response.json();
    expect(body).toMatchObject({ status: "generating", recovering: false, retryable: false });
    expect(mocks.updateSet).not.toHaveBeenCalled();
    expect(mocks.after).not.toHaveBeenCalled();
  });
});
