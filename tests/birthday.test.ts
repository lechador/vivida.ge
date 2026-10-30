import { render } from "@react-email/render";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  selectLimit: vi.fn(),
  insertReturning: vi.fn(),
  updateWhere: vi.fn(),
  grantCredits: vi.fn(),
  isPremiumUser: vi.fn(),
  sendEmail: vi.fn(),
  acquireResendSlot: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    execute: mocks.execute,
    select: () => ({
      from: () => ({
        where: () => ({
          limit: mocks.selectLimit,
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: mocks.insertReturning,
      }),
    }),
    update: () => ({
      set: () => ({
        where: mocks.updateWhere,
      }),
    }),
  },
}));

vi.mock("@/lib/credits", () => ({
  grantCredits: mocks.grantCredits,
}));

vi.mock("@/lib/premium", () => ({
  isPremiumUser: mocks.isPremiumUser,
}));

vi.mock("@/lib/resend-throttle", () => ({
  acquireResendSlot: mocks.acquireResendSlot,
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: mocks.sendEmail,
    };
  },
}));

import {
  BIRTHDAY_CREDITS,
  FALLBACK_PARAGRAPHS,
  FALLBACK_PARAGRAPHS_PRO,
  sendBirthdayGifts,
} from "@/lib/birthday";
import { BirthdayEmail } from "@/lib/email-templates/birthday";

describe("birthday email & gift credits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "re_test_123";
    delete process.env.OPENROUTER_API_KEY;
    mocks.selectLimit.mockResolvedValue([]);
    mocks.insertReturning.mockResolvedValue([{ id: "log_1" }]);
    mocks.updateWhere.mockResolvedValue(undefined);
    mocks.grantCredits.mockResolvedValue(undefined);
    mocks.isPremiumUser.mockResolvedValue(false);
    mocks.acquireResendSlot.mockResolvedValue(undefined);
    mocks.sendEmail.mockResolvedValue({ data: { id: "email_1" }, error: null });
  });

  it("gifts credits and renders the gift P.S. for free users", async () => {
    mocks.execute.mockResolvedValue({
      rows: [
        {
          user_id: "user_free",
          email: "free@example.com",
          name: "ნინო",
          sun_idx: 7,
          is_premium: false,
        },
      ],
    });

    const res = await sendBirthdayGifts();

    expect(res).toEqual({
      birthdays: 1,
      gifted: 1,
      emailed: 1,
      failed: 0,
    });
    expect(mocks.grantCredits).toHaveBeenCalledTimes(1);
    expect(mocks.grantCredits).toHaveBeenCalledWith(
      "user_free",
      BIRTHDAY_CREDITS,
      "birthday_gift",
    );

    const sentPayload = mocks.sendEmail.mock.calls[0]?.[0];
    const html = await render(sentPayload.react);
    expect(html).toContain("10 კრედიტი");
  });

  it("does NOT gift credits or mention the credit gift for PRO users", async () => {
    mocks.execute.mockResolvedValue({
      rows: [
        {
          user_id: "user_pro",
          email: "pro@example.com",
          name: "გიორგი",
          sun_idx: 7,
          is_premium: true,
        },
      ],
    });
    mocks.isPremiumUser.mockResolvedValue(true);

    const res = await sendBirthdayGifts();

    expect(res).toEqual({
      birthdays: 1,
      gifted: 0,
      emailed: 1,
      failed: 0,
    });
    expect(mocks.grantCredits).not.toHaveBeenCalled();

    const sentPayload = mocks.sendEmail.mock.calls[0]?.[0];
    const html = await render(sentPayload.react);
    expect(html).not.toContain("10 კრედიტი");
    expect(html).not.toContain("პატარა საჩუქარი");
    expect(FALLBACK_PARAGRAPHS_PRO.join(" ")).not.toContain("საჩუქარი");
  });

  it("also blocks gifting if isPremiumUser resolves true even when row flag was false", async () => {
    mocks.execute.mockResolvedValue({
      rows: [
        {
          user_id: "user_just_upgraded",
          email: "up@example.com",
          name: "ანა",
          sun_idx: 0,
          is_premium: false,
        },
      ],
    });
    mocks.isPremiumUser.mockResolvedValue(true);

    const res = await sendBirthdayGifts();

    expect(res.gifted).toBe(0);
    expect(res.emailed).toBe(1);
    expect(mocks.grantCredits).not.toHaveBeenCalled();

    const sentPayload = mocks.sendEmail.mock.calls[0]?.[0];
    const html = await render(sentPayload.react);
    expect(html).not.toContain("10 კრედიტი");
  });

  it("renders BirthdayEmail with and without showGift", async () => {
    const withGift = await render(
      BirthdayEmail({
        name: "ნინო",
        paragraphs: FALLBACK_PARAGRAPHS,
        dashboardUrl: "https://www.vivida.ge/dashboard",
        showGift: true,
      }),
    );
    expect(withGift).toContain("10 კრედიტი");

    const withoutGift = await render(
      BirthdayEmail({
        name: "გიორგი",
        paragraphs: FALLBACK_PARAGRAPHS_PRO,
        dashboardUrl: "https://www.vivida.ge/dashboard",
        showGift: false,
      }),
    );
    expect(withoutGift).not.toContain("10 კრედიტი");
  });
});
