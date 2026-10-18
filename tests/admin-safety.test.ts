import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  selectResults: [] as Array<Array<Record<string, unknown>>>,
  isAdminEmail: vi.fn((email: string | null | undefined) => email === "admin@vivida.ge"),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/admin-auth", () => ({ isAdminEmail: mocks.isAdminEmail }));
vi.mock("@/db", () => {
  const chain = {
    from: vi.fn(),
    innerJoin: vi.fn(),
    where: vi.fn(),
    limit: vi.fn(),
  };
  chain.from.mockReturnValue(chain);
  chain.innerJoin.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  chain.limit.mockImplementation(async () => mocks.selectResults.shift() ?? []);
  return {
    db: {
      select: vi.fn(() => chain),
      execute: mocks.execute,
    },
  };
});

import { moderateSafetyReportCore } from "@/lib/admin-safety";

describe("admin safety moderation", () => {
  beforeEach(() => {
    mocks.execute.mockReset();
    mocks.execute.mockResolvedValue(undefined);
    mocks.selectResults = [];
    mocks.isAdminEmail.mockClear();
  });

  it("rejects malformed report ids before touching the database", async () => {
    const result = await moderateSafetyReportCore("owner@vivida.ge", {
      reportId: "short",
      action: "review",
    });

    expect(result).toEqual({ ok: false, error: "არასწორი მოქმედება." });
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("marks an existing report reviewed with one atomic write", async () => {
    mocks.selectResults = [[{
      id: "report-123",
      targetType: "post",
      targetId: "post-12345",
    }]];

    const result = await moderateSafetyReportCore("owner@vivida.ge", {
      reportId: "report-123",
      action: "review",
      note: "Checked the context",
    });

    expect(result).toEqual({ ok: true, message: "საჩივარი მონიშნულია განხილულად." });
    expect(mocks.execute).toHaveBeenCalledOnce();
  });

  it("resolves the author of reported content before restricting", async () => {
    mocks.selectResults = [
      [{ id: "report-123", targetType: "post", targetId: "post-12345" }],
      [{ id: "user-12345", email: "member@example.com" }],
    ];

    const result = await moderateSafetyReportCore("owner@vivida.ge", {
      reportId: "report-123",
      action: "restrict",
      note: "Repeated harassment",
    });

    expect(result).toEqual({
      ok: true,
      message: "მომხმარებელი შეიზღუდა და საჩივარი დაიხურა.",
    });
    expect(mocks.execute).toHaveBeenCalledOnce();
  });

  it("does not accept a client-supplied fallback when the target was deleted", async () => {
    mocks.selectResults = [
      [{ id: "report-123", targetType: "comment", targetId: "comment-123" }],
      [],
    ];

    const result = await moderateSafetyReportCore("owner@vivida.ge", {
      reportId: "report-123",
      action: "restrict",
    });

    expect(result.ok).toBe(false);
    expect(mocks.execute).not.toHaveBeenCalled();
  });

  it("protects configured administrator accounts from restriction", async () => {
    mocks.selectResults = [
      [{ id: "report-123", targetType: "user", targetId: "admin-user" }],
      [{ id: "admin-user", email: "admin@vivida.ge" }],
    ];

    const result = await moderateSafetyReportCore("owner@vivida.ge", {
      reportId: "report-123",
      action: "restrict",
    });

    expect(result).toEqual({
      ok: false,
      error: "ადმინისტრატორის ანგარიშის შეზღუდვა ამ პანელიდან აკრძალულია.",
    });
    expect(mocks.execute).not.toHaveBeenCalled();
  });
});
