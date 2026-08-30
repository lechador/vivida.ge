import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireMobileUser: vi.fn(),
  ensureMoonPhase: vi.fn(),
  getDashboardSuggestions: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({ requireMobileUser: mocks.requireMobileUser }));
vi.mock("@/actions/moon-phase", () => ({ ensureMoonPhase: mocks.ensureMoonPhase }));
vi.mock("@/lib/suggestions", () => ({
  getDashboardSuggestions: mocks.getDashboardSuggestions,
}));
vi.mock("@/lib/social-flags", () => ({
  SOCIAL_FEATURES: { suggestedPeopleRail: true },
}));

import { GET as getMoonPhase } from "@/app/api/v1/moon-phase/route";
import { GET as getSuggestions } from "@/app/api/v1/suggestions/route";

describe("mobile Today extras", () => {
  beforeEach(() => {
    mocks.requireMobileUser.mockResolvedValue({ id: "viewer-1" });
    mocks.ensureMoonPhase.mockReset();
    mocks.getDashboardSuggestions.mockReset();
  });

  it("returns the website moon reading in a mobile-safe shape", async () => {
    mocks.ensureMoonPhase.mockResolvedValue({
      date: "2026-08-30",
      phaseKey: "waning_gibbous",
      phaseLabelKa: "კლებადი გიბუსი",
      signEn: "Aries",
      signKa: "ვერძი",
      signIndex: 0,
      phaseAngle: 220,
      illumination: 0.94,
      ageDays: 17.1,
      headline: "გაუშვი, მაგრამ ცეცხლით",
      summary: "დღის მოკლე შეჯამება",
      body: "სრული ტექსტი",
      themes: ["აქტიური გაშვება"],
      snapshot: { signSymbol: "♈" },
    });

    const response = await getMoonPhase(
      new Request("https://vivida.ge/api/v1/moon-phase"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      phaseKey: "waning_gibbous",
      signSymbol: "♈",
      headline: "გაუშვი, მაგრამ ცეცხლით",
      illumination: 0.94,
    });
  });

  it("returns the same compatible suggestions as the dashboard", async () => {
    mocks.getDashboardSuggestions.mockResolvedValue([
      { userId: "person-1", username: "nukri", compatibility: 77 },
    ]);

    const response = await getSuggestions(
      new Request("https://vivida.ge/api/v1/suggestions"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      suggestions: [
        { userId: "person-1", username: "nukri", compatibility: 77 },
      ],
    });
    expect(mocks.getDashboardSuggestions).toHaveBeenCalledWith("viewer-1", 12);
  });
});
