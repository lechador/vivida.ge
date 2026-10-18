import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  sendReportPdfEmail: vi.fn(),
  enforceRateLimit: vi.fn(),
  /** Rows the mocked `db.select()` chain hands back, in call order. */
  rows: [] as unknown[][],
}));

vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => mocks.rows.shift() ?? [],
        }),
      }),
    }),
  },
}));
vi.mock("@/lib/email", () => ({ sendReportPdfEmail: mocks.sendReportPdfEmail }));
vi.mock("@/lib/rate-limit", () => ({ enforceRateLimit: mocks.enforceRateLimit }));

import { POST } from "@/app/api/reports/[id]/email/route";
import { ApiError } from "@/lib/api/errors";

const READY_REPORT = {
  id: "report-1",
  userId: "user-1",
  status: "ready",
  pdfKey: "reports/user-1/report-1.pdf",
  language: "ka",
};

const OWNER = {
  email: "owner@example.com",
  name: "Nino Beridze",
  locale: "ka",
};

function call(id = "report-1") {
  return POST(
    new Request(`https://vivida.ge/api/reports/${id}/email`, { method: "POST" }),
    { params: Promise.resolve({ id }) },
  );
}

describe("POST /api/reports/[id]/email", () => {
  beforeEach(() => {
    mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
    mocks.sendReportPdfEmail.mockResolvedValue({ ok: true });
    mocks.enforceRateLimit.mockResolvedValue(undefined);
    mocks.rows = [[READY_REPORT], [OWNER]];
  });

  it("mails the finished PDF to the owner's account address", async () => {
    const response = await call();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      to: "owner@example.com",
    });
    expect(mocks.sendReportPdfEmail).toHaveBeenCalledWith({
      userId: "user-1",
      to: "owner@example.com",
      name: "Nino Beridze",
      reportId: "report-1",
      pdfKey: "reports/user-1/report-1.pdf",
      locale: "ka",
    });
  });

  it("writes the covering email in the language the PDF was generated in", async () => {
    // A user who has since switched the interface to Georgian still has an
    // English PDF on file; the email must match the file, not the setting.
    mocks.rows = [
      [{ ...READY_REPORT, language: "en" }],
      [{ ...OWNER, locale: "ka" }],
    ];

    await call();

    expect(mocks.sendReportPdfEmail).toHaveBeenCalledWith(
      expect.objectContaining({ locale: "en" }),
    );
  });

  it("rejects anonymous requests", async () => {
    mocks.auth.mockResolvedValue(null);

    const response = await call();

    expect(response.status).toBe(401);
    expect(mocks.sendReportPdfEmail).not.toHaveBeenCalled();
  });

  it("will not mail someone else's report", async () => {
    mocks.rows = [[{ ...READY_REPORT, userId: "user-2" }], [OWNER]];

    const response = await call();

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "not_found" });
    expect(mocks.sendReportPdfEmail).not.toHaveBeenCalled();
  });

  it("refuses a report that has not finished generating", async () => {
    mocks.rows = [[{ ...READY_REPORT, status: "generating", pdfKey: null }], [OWNER]];

    const response = await call();

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "not_ready" });
    expect(mocks.sendReportPdfEmail).not.toHaveBeenCalled();
  });

  it("passes the limiter's Retry-After through on a 429", async () => {
    mocks.enforceRateLimit.mockRejectedValue(
      new ApiError(429, "rate_limited", "Too many requests", {
        "Retry-After": "1800",
      }),
    );

    const response = await call();

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("1800");
    await expect(response.json()).resolves.toEqual({ error: "rate_limited" });
    expect(mocks.sendReportPdfEmail).not.toHaveBeenCalled();
  });

  it("reports a failed send instead of claiming success", async () => {
    mocks.sendReportPdfEmail.mockResolvedValue({
      ok: false,
      error: "send_failed",
    });

    const response = await call();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ error: "send_failed" });
  });

  it("says so when the account has no email address on file", async () => {
    mocks.rows = [[READY_REPORT], [{ ...OWNER, email: null }]];

    const response = await call();

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "no_email" });
    expect(mocks.sendReportPdfEmail).not.toHaveBeenCalled();
  });
});
