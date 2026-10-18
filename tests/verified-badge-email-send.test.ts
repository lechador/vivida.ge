import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  process.env.RESEND_API_KEY = "re_test_key";
  process.env.RESEND_FROM = "Vivida <hello@vivida.ge>";
  return {
    send: vi.fn(),
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

import { sendVerifiedBadgeGiftEmail } from "@/lib/email";

describe("sendVerifiedBadgeGiftEmail", () => {
  beforeEach(() => {
    mocks.logged = [];
    mocks.send.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  it("sends the localized gift email once with the grant idempotency key", async () => {
    const result = await sendVerifiedBadgeGiftEmail({
      userId: "user-1",
      to: "nino@example.com",
      name: "Nino Beridze",
      username: "nino",
      locale: "ka",
      idempotencyKey: "verified-badge-gift:user-1:grant-1",
    });

    expect(result).toEqual({ ok: true });
    expect(mocks.send).toHaveBeenCalledOnce();
    const [payload, options] = mocks.send.mock.calls[0];
    expect(payload.subject).toBe("Verified Badge საჩუქრად მიიღე · Vivida");
    expect(options).toEqual({
      idempotencyKey: "verified-badge-gift:user-1:grant-1",
    });
    const html = await render(payload.react as ReactElement);
    expect(html).toContain("გამარჯობა, Nino!");
    expect(html).not.toContain("Beridze");
    expect(html).toContain("https://www.vivida.ge/u/nino");
    expect(mocks.logged).toEqual([
      expect.objectContaining({
        userId: "user-1",
        kind: "verified_badge_gift",
        status: "sent",
      }),
    ]);
  });

  it("reports and records a provider failure", async () => {
    mocks.send.mockResolvedValue({
      data: null,
      error: { message: "recipient rejected", name: "validation_error" },
    });

    const result = await sendVerifiedBadgeGiftEmail({
      userId: "user-1",
      to: "nino@example.com",
      name: null,
      username: null,
      locale: "en",
      idempotencyKey: "verified-badge-gift:user-1:grant-1",
    });

    expect(result).toEqual({ ok: false, error: "send_failed" });
    expect(mocks.logged).toEqual([
      expect.objectContaining({
        kind: "verified_badge_gift",
        status: "failed",
        error: "recipient rejected",
      }),
    ]);
  });
});
