import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  update: vi.fn(),
  account: null as null | {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    emailVerified: Date | null;
    passwordHash: string | null;
    phoneVerifiedAt: Date | null;
  },
}));

vi.mock("@/db", () => ({
  db: { select: mocks.select, update: mocks.update },
}));

import { completePhoneLogin } from "@/lib/phone-auth";

const phone = "+995555123456";
const code = "123456";

describe("phone login for an email signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.account = null;
    mocks.select.mockImplementation((fields?: Record<string, unknown>) => ({
      from: () => ({
        where: () =>
          fields
            ? { limit: async () => (mocks.account ? [mocks.account] : []) }
            : {
                orderBy: () => ({
                  limit: async () => [
                    {
                      id: "challenge",
                      claimToken: "claim",
                      codeHash: createHash("sha256")
                        .update(`${phone}:${code}`)
                        .digest("hex"),
                      attempts: 0,
                      expiresAt: new Date(Date.now() + 60_000),
                      userId: null,
                    },
                  ],
                }),
              },
      }),
    }));
    mocks.update.mockReturnValue({ set: () => ({ where: async () => {} }) });
  });

  it("rejects a password account whose signup email is still unverified", async () => {
    mocks.account = {
      id: "new-user",
      name: "Nino",
      email: "nino@example.com",
      image: null,
      emailVerified: null,
      passwordHash: "hashed-password",
      phoneVerifiedAt: new Date(),
    };

    await expect(completePhoneLogin({ phone, code })).resolves.toEqual({
      ok: false,
      error: "email_unverified",
    });
    // The correct SMS code is consumed even though login is denied.
    expect(mocks.update).toHaveBeenCalledTimes(2);
  });

  it("lets the same account in after email verification", async () => {
    mocks.account = {
      id: "verified-user",
      name: "Nino",
      email: "nino@example.com",
      image: null,
      emailVerified: new Date(),
      passwordHash: "hashed-password",
      phoneVerifiedAt: new Date(),
    };

    await expect(completePhoneLogin({ phone, code })).resolves.toEqual({
      ok: true,
      user: {
        id: "verified-user",
        name: "Nino",
        email: "nino@example.com",
        image: null,
      },
    });
  });

  it("requires re-verification for a legacy phone bound before email proof", async () => {
    const verifiedAt = new Date();
    mocks.account = {
      id: "legacy-user",
      name: "Nino",
      email: "nino@example.com",
      image: null,
      emailVerified: verifiedAt,
      passwordHash: "hashed-password",
      phoneVerifiedAt: new Date(verifiedAt.getTime() - 1_000),
    };

    await expect(completePhoneLogin({ phone, code })).resolves.toEqual({
      ok: false,
      error: "phone_reverification_required",
    });
  });
});
