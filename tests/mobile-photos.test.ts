import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireMobileUser: vi.fn(),
  listOwnPhotos: vi.fn(),
}));

vi.mock("@/lib/api/auth", () => ({ requireMobileUser: mocks.requireMobileUser }));
vi.mock("@/lib/photos-core", () => ({ listOwnPhotos: mocks.listOwnPhotos }));

import { GET } from "@/app/api/v1/me/photos/route";

describe("mobile profile photos", () => {
  beforeEach(() => {
    mocks.requireMobileUser.mockResolvedValue({ id: "viewer-1" });
    mocks.listOwnPhotos.mockResolvedValue([
      { id: "ready", url: "https://cdn.example/ready.jpg", ready: true },
      { id: "pending", url: "https://cdn.example/missing.jpg", ready: false },
    ]);
  });

  it("does not expose pending upload URLs to the native image loader", async () => {
    const response = await GET(
      new Request("https://vivida.ge/api/v1/me/photos"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      photos: [
        { id: "ready", url: "https://cdn.example/ready.jpg", ready: true },
      ],
    });
  });
});
