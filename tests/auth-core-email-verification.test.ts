import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  hash: vi.fn(),
  selectedRows: [] as Record<string, unknown>[][],
  updateValues: null as null | Record<string, unknown>,
}));

vi.mock("@/db", () => ({
  db: { select: mocks.select, update: mocks.update, delete: mocks.delete },
}));
vi.mock("bcryptjs", () => ({ default: { hash: mocks.hash } }));
vi.mock("@/lib/referral", () => ({
  onUserSignedUp: vi.fn(),
  qualifyReferral: vi.fn(),
}));

import {
  consumeEmailVerifyCode,
  consumeEmailVerifyToken,
} from "@/lib/auth-core";

describe("email verification owns the final password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.selectedRows = [];
    mocks.updateValues = null;
    mocks.select.mockReturnValue({
      from: () => ({
        where: () => ({ limit: async () => mocks.selectedRows.shift() ?? [] }),
      }),
    });
    mocks.update.mockReturnValue({
      set: (values: Record<string, unknown>) => {
        mocks.updateValues = values;
        return { where: async () => {} };
      },
    });
    mocks.delete.mockReturnValue({ where: async () => {} });
    mocks.hash.mockResolvedValue("hash-of-owner-password");
  });

  it("replaces preregistration credentials when the inbox link is used", async () => {
    mocks.selectedRows = [
      [
        {
          token: "link-token",
          userId: "user",
          expiresAt: new Date(Date.now() + 60_000),
        },
      ],
    ];

    await expect(
      consumeEmailVerifyToken({
        token: "link-token",
        password: "owner-password",
      }),
    ).resolves.toEqual({ ok: true, userId: "user" });
    expect(mocks.hash).toHaveBeenCalledWith("owner-password", 10);
    expect(mocks.updateValues).toMatchObject({
      passwordHash: "hash-of-owner-password",
      phone: null,
      phoneVerifiedAt: null,
      smsMarketing: false,
      smsMarketingConsentedAt: null,
    });
    expect(mocks.updateValues?.emailVerified).toBeInstanceOf(Date);
  });

  it("replaces preregistration credentials when the email code is used", async () => {
    mocks.selectedRows = [
      [{ id: "user" }],
      [
        {
          token: "link-token",
          userId: "user",
          code: "123456",
          expiresAt: new Date(Date.now() + 60_000),
        },
      ],
    ];

    await expect(
      consumeEmailVerifyCode({
        email: "owner@example.com",
        code: "123456",
        password: "owner-password",
      }),
    ).resolves.toEqual({ ok: true, userId: "user" });
    expect(mocks.hash).toHaveBeenCalledWith("owner-password", 10);
    expect(mocks.updateValues).toMatchObject({
      passwordHash: "hash-of-owner-password",
      phone: null,
      phoneVerifiedAt: null,
      smsMarketing: false,
      smsMarketingConsentedAt: null,
    });
  });

  it("does not activate an account without an acceptable password", async () => {
    await expect(
      consumeEmailVerifyToken({ token: "link-token", password: "short" }),
    ).resolves.toEqual({ ok: false, error: "weak_password" });
    expect(mocks.select).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
