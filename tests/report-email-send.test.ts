import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

const mocks = vi.hoisted(() => {
  // Read at call time by lib/email.ts's lazy Resend client.
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.RESEND_FROM = "Vivida <hello@vivida.ge>";
  return {
    send: vi.fn(),
    getObjectBytes: vi.fn(),
    logged: [] as Record<string, unknown>[],
  };
});

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
  },
}));
vi.mock("@/db", () => ({
  db: {
    insert: () => ({
      values: async (row: Record<string, unknown>) => {
        mocks.logged.push(row);
      },
    }),
  },
}));
vi.mock("@/lib/r2", () => ({ getObjectBytes: mocks.getObjectBytes }));

import { sendReportPdfEmail } from "@/lib/email";

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]); // "%PDF-1.7"

function args(overrides: Record<string, unknown> = {}) {
  return {
    userId: "user-1",
    to: "owner@example.com",
    name: "Nino Beridze",
    reportId: "report-1",
    pdfKey: "reports/user-1/report-1.pdf",
    ...overrides,
  };
}

/** HTML of the email body handed to Resend on the last send. */
async function sentHtml(): Promise<string> {
  const payload = mocks.send.mock.calls.at(-1)?.[0];
  return render(payload.react as ReactElement);
}

describe("sendReportPdfEmail", () => {
  beforeEach(() => {
    mocks.logged = [];
    mocks.send.mockResolvedValue({ data: { id: "email-1" }, error: null });
    mocks.getObjectBytes.mockResolvedValue(PDF);
  });

  it("attaches the stored PDF and logs the send", async () => {
    const result = await sendReportPdfEmail(args());

    expect(result).toEqual({ ok: true });
    expect(mocks.getObjectBytes).toHaveBeenCalledWith(
      "reports/user-1/report-1.pdf",
    );

    const payload = mocks.send.mock.calls[0][0];
    expect(payload.to).toBe("owner@example.com");
    expect(payload.from).toBe("Vivida <hello@vivida.ge>");
    expect(payload.subject).toBe("შენი ნატალური ანგარიში · Vivida");
    expect(payload.attachments).toHaveLength(1);
    expect(payload.attachments[0].filename).toBe("vivida-natal-report.pdf");
    expect(payload.attachments[0].contentType).toBe("application/pdf");
    expect(Buffer.from(payload.attachments[0].content).toString()).toBe(
      "%PDF-1.7",
    );

    expect(mocks.logged).toEqual([
      expect.objectContaining({
        userId: "user-1",
        kind: "report_pdf",
        email: "owner@example.com",
        status: "sent",
      }),
    ]);
  });

  it("is not deduped by an idempotency key, the button must be re-pressable", async () => {
    await sendReportPdfEmail(args());
    await sendReportPdfEmail(args());

    expect(mocks.send).toHaveBeenCalledTimes(2);
    for (const call of mocks.send.mock.calls) {
      expect(call[1]?.idempotencyKey).toBeUndefined();
    }
  });

  it("renders the body in the report's language with a link back to it", async () => {
    await sendReportPdfEmail(args({ locale: "en" }));

    const payload = mocks.send.mock.calls[0][0];
    expect(payload.subject).toBe("Your natal report · Vivida");

    const html = await sentHtml();
    expect(html).toContain("attached to this email");
    expect(html).toContain("Nino"); // first name only, not the full name
    expect(html).not.toContain("Beridze");
    expect(html).toContain("https://www.vividaastro.com/reports/report-1");
  });

  it("still sends a link-only email when the PDF bytes are unreachable", async () => {
    mocks.getObjectBytes.mockRejectedValue(new Error("R2 down"));

    const result = await sendReportPdfEmail(args({ locale: "en" }));

    expect(result).toEqual({ ok: true });
    const payload = mocks.send.mock.calls[0][0];
    expect(payload.attachments).toBeUndefined();

    // The copy has to stop promising an attachment that isn't there.
    const html = await sentHtml();
    expect(html).not.toContain("attached to this email");
    expect(html).toContain("Download it from the link below");
  });

  it("skips an attachment that exceeds the size ceiling", async () => {
    mocks.getObjectBytes.mockResolvedValue(new Uint8Array(21 * 1024 * 1024));

    const result = await sendReportPdfEmail(args());

    expect(result).toEqual({ ok: true });
    expect(mocks.send.mock.calls[0][0].attachments).toBeUndefined();
  });

  it("reports a Resend failure and logs it as failed", async () => {
    mocks.send.mockResolvedValue({
      data: null,
      error: { message: "invalid recipient", name: "validation_error" },
    });

    const result = await sendReportPdfEmail(args());

    expect(result).toEqual({ ok: false, error: "send_failed" });
    expect(mocks.logged).toEqual([
      expect.objectContaining({
        kind: "report_pdf",
        status: "failed",
        error: "invalid recipient",
      }),
    ]);
  });
});
