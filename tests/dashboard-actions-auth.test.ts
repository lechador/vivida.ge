import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  core: vi.fn(),
  extras: vi.fn(),
}));

vi.mock("@/lib/auth-helpers", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/dashboard-load", () => ({
  loadDashboardCoreFor: mocks.core,
  loadDashboardExtrasFor: mocks.extras,
}));

import { loadDashboardCore, loadDashboardExtras } from "@/actions/dashboard";

describe("dashboard server actions (IDOR guard)", () => {
  beforeEach(() => {
    mocks.requireUser.mockResolvedValue({ id: "session-user" });
    mocks.core.mockResolvedValue({ kind: "no-chart" });
    mocks.extras.mockResolvedValue({});
  });

  it("loadDashboardCore uses the session user and accepts no id", async () => {
    expect(loadDashboardCore.length).toBe(0);
    // A hostile caller smuggling an id as an argument is ignored.
    await (loadDashboardCore as (...a: unknown[]) => Promise<unknown>)(
      "victim-user",
    );
    expect(mocks.core).toHaveBeenCalledWith("session-user");
  });

  it("loadDashboardExtras uses the session user; first arg is only a locale", async () => {
    await loadDashboardExtras("en");
    expect(mocks.extras).toHaveBeenCalledWith("session-user", "en");
    await loadDashboardExtras();
    expect(mocks.extras).toHaveBeenLastCalledWith("session-user", "ka");
  });

  it("does not touch any data when unauthenticated", async () => {
    mocks.requireUser.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(loadDashboardCore()).rejects.toThrow();
    await expect(loadDashboardExtras("ka")).rejects.toThrow();
    expect(mocks.core).not.toHaveBeenCalled();
    expect(mocks.extras).not.toHaveBeenCalled();
  });
});
