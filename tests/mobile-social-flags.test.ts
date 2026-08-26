import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireMobileUser: vi.fn(),
  getDiscoveryFeed: vi.fn(),
  listPeople: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({ requireMobileUser: mocks.requireMobileUser }));
vi.mock("@/lib/discover", () => ({ getDiscoveryFeed: mocks.getDiscoveryFeed }));
vi.mock("@/lib/people", () => ({ listPeople: mocks.listPeople }));
vi.mock("@/lib/social-flags", () => ({
  SOCIAL_FEATURES: {
    swipeDeck: false,
    peopleDirectory: false,
    suggestedPeopleRail: false,
  },
}));

import { GET as getDiscover } from "@/app/api/v1/discover/route";
import { GET as getPeople } from "@/app/api/v1/people/route";

describe("mobile social feature flags", () => {
  beforeEach(() => {
    mocks.requireMobileUser.mockResolvedValue({ id: "viewer-1" });
  });

  it("keeps Discover unavailable when the website swipe deck is disabled", async () => {
    const response = await getDiscover(new Request("https://vivida.ge/api/v1/discover"));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: "feature_disabled", message: "Discover is not available" },
    });
    expect(mocks.getDiscoveryFeed).not.toHaveBeenCalled();
  });

  it("keeps People unavailable when the website directory is disabled", async () => {
    const response = await getPeople(new Request("https://vivida.ge/api/v1/people"));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: "feature_disabled", message: "People directory is not available" },
    });
    expect(mocks.listPeople).not.toHaveBeenCalled();
  });
});
