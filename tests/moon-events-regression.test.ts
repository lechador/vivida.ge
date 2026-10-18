import { describe, expect, it } from "vitest";

import { moonEvents } from "@/lib/seo/moon-events";

describe("moon event noon-UTC results", () => {
  it("keeps the existing dates and phase samples for a fixed horizon", () => {
    const asOf = new Date("2026-09-26T12:00:00Z");
    const newEvents = moonEvents("new", 210, asOf);
    const fullEvents = moonEvents("full", 210, asOf);

    expect(
      newEvents.slice(0, 3).map((event) => event.date.toISOString()),
    ).toEqual([
      "2026-10-10T00:00:00.000Z",
      "2026-11-09T00:00:00.000Z",
      "2026-12-09T00:00:00.000Z",
    ]);
    expect(
      fullEvents.slice(0, 3).map((event) => event.date.toISOString()),
    ).toEqual([
      "2026-09-26T00:00:00.000Z",
      "2026-10-26T00:00:00.000Z",
      "2026-11-24T00:00:00.000Z",
    ]);
    expect(newEvents[0].snapshot.phaseAngle).toBeCloseTo(358.0661, 4);
    expect(fullEvents[0].snapshot.phaseAngle).toBeCloseTo(177.4735, 4);
  });
});
