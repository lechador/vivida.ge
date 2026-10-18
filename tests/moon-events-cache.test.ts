import { describe, expect, it, vi } from "vitest";

const { phaseCalls } = vi.hoisted(() => ({
  phaseCalls: vi.fn((date: Date) => ({
    illumination: date.getUTCDate() % 4 === 0 ? 0 : 1,
    signSymbol: "☾",
    signEn: "Test",
    signKa: "ტესტი",
  })),
}));

vi.mock("@/lib/moon-phase", () => ({
  computeMoonPhase: phaseCalls,
  utcDateString: (date: Date) => date.toISOString().slice(0, 10),
}));

import { moonEvents } from "@/lib/seo/moon-events";

describe("moon event daily transit reuse", () => {
  it("computes each UTC day once across hourly refinement and both event kinds", () => {
    const asOf = new Date("2041-01-10T12:00:00Z");
    moonEvents("new", 12, asOf);
    moonEvents("full", 12, asOf);

    const sampledDays = phaseCalls.mock.calls.map(([date]) =>
      date.toISOString().slice(0, 10),
    );
    expect(sampledDays.length).toBeGreaterThan(12);
    expect(sampledDays.length).toBe(new Set(sampledDays).size);
    expect(sampledDays).toContain("2041-01-09");
    expect(sampledDays).toContain("2041-01-22");
  });
});
