import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  findDuplicateAccountSignal: vi.fn(),
  ensureUsername: vi.fn(),
  qualifyReferral: vi.fn(),
  completeEligibleEmailCampaigns: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: { select: mocks.select, insert: mocks.insert },
}));
vi.mock("@/lib/duplicate-account", () => ({
  findDuplicateAccountSignal: mocks.findDuplicateAccountSignal,
}));
vi.mock("@/lib/username", () => ({ ensureUsername: mocks.ensureUsername }));
vi.mock("@/lib/referral", () => ({ qualifyReferral: mocks.qualifyReferral }));
vi.mock("@/lib/email-campaigns", () => ({
  completeEligibleEmailCampaigns: mocks.completeEligibleEmailCampaigns,
}));

import { saveBirthDataCore } from "@/lib/profile-core";

const input = {
  dateOfBirth: "1994-05-17",
  timeOfBirth: "08:42",
  cityName: "Tbilisi",
  latitude: 41.7151,
  longitude: 44.8271,
  timezone: "Asia/Tbilisi",
};

function storedBirthDate(dateOfBirth: string | null) {
  mocks.select.mockReturnValue({
    from: () => ({
      where: () => ({
        limit: async () => [{ dateOfBirth }],
      }),
    }),
  });
}

describe("profile duplicate guard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    storedBirthDate(null);
    mocks.insert.mockReturnValue({
      values: () => ({
        onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mocks.ensureUsername.mockResolvedValue(undefined);
    mocks.qualifyReferral.mockResolvedValue(undefined);
    mocks.completeEligibleEmailCampaigns.mockResolvedValue(undefined);
  });

  it("refuses a confirmed duplicate even when the caller confirms the warning", async () => {
    mocks.findDuplicateAccountSignal.mockResolvedValue("confirmed_duplicate");

    const result = await saveBirthDataCore("user-2", {
      ...input,
      confirmPossibleDuplicate: true,
    });

    expect(result).toMatchObject({ ok: false, code: "duplicate_account" });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("keeps a weaker duplicate signal dismissible", async () => {
    mocks.findDuplicateAccountSignal.mockResolvedValue("possible_duplicate");

    await expect(saveBirthDataCore("user-2", input)).resolves.toMatchObject({
      ok: false,
      code: "possible_duplicate",
    });
    await expect(
      saveBirthDataCore("user-2", {
        ...input,
        confirmPossibleDuplicate: true,
      }),
    ).resolves.toEqual({ ok: true });
    expect(mocks.insert).toHaveBeenCalledTimes(1);
  });

  it("checks confirmed duplicates again when the birth time or place is edited", async () => {
    storedBirthDate(input.dateOfBirth);
    mocks.findDuplicateAccountSignal.mockResolvedValue("confirmed_duplicate");

    const result = await saveBirthDataCore("user-2", {
      ...input,
      confirmPossibleDuplicate: true,
    });

    expect(result).toMatchObject({ ok: false, code: "duplicate_account" });
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
