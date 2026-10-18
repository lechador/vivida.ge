import { describe, expect, it } from "vitest";

import {
  capsOk,
  nudgeCopy,
  nudgeDeliveryKey,
  nudgeDue,
} from "@/lib/ask-nudges-pure";

const DAY = 24 * 60 * 60 * 1000;

describe("nudge copy", () => {
  it("builds a personal template in both languages", () => {
    const ka = nudgeCopy("გასაუბრება ხუთშაბათს", "ka", "ნინო");
    expect(ka.title).toContain("ნინო");
    expect(ka.body).toContain("გასაუბრება ხუთშაბათს");
    const en = nudgeCopy("job interview", "en", null);
    expect(en.title).toContain("Remember");
    expect(en.body).toContain("job interview");
  });
});

describe("delivery key", () => {
  it("is stable, user-scoped, and case-insensitive", () => {
    const a = nudgeDeliveryKey("u1", "გასაუბრება");
    expect(nudgeDeliveryKey("u1", "გასაუბრება")).toBe(a);
    expect(nudgeDeliveryKey("u1", "  გასაუბრება  ")).toBe(a);
    expect(nudgeDeliveryKey("u2", "გასაუბრება")).not.toBe(a);
    expect(nudgeDeliveryKey("u1", "სხვა თემა")).not.toBe(a);
  });
});

describe("due predicate", () => {
  const now = new Date("2026-09-30T12:00:00Z");

  it("fires for a quiet 5-day-old memory", () => {
    expect(
      nudgeDue(
        new Date(now.getTime() - 5 * DAY),
        new Date(now.getTime() - 6 * DAY),
        now,
      ),
    ).toBe(true);
  });

  it("skips fresh memories", () => {
    expect(
      nudgeDue(
        new Date(now.getTime() - 1 * DAY),
        new Date(now.getTime() - 2 * DAY),
        now,
      ),
    ).toBe(false);
  });

  it("skips stale memories past the window", () => {
    expect(
      nudgeDue(
        new Date(now.getTime() - 15 * DAY),
        new Date(now.getTime() - 16 * DAY),
        now,
      ),
    ).toBe(false);
  });

  it("skips when the user chatted after the memory refresh", () => {
    expect(
      nudgeDue(
        new Date(now.getTime() - 5 * DAY),
        new Date(now.getTime() - 1 * DAY),
        now,
      ),
    ).toBe(false);
  });

  it("skips long-dormant users", () => {
    expect(
      nudgeDue(
        new Date(now.getTime() - 5 * DAY),
        new Date(now.getTime() - 30 * DAY),
        now,
      ),
    ).toBe(false);
  });
});

describe("frequency caps", () => {
  const now = new Date("2026-09-30T12:00:00Z");

  it("allows a first nudge", () => {
    expect(capsOk([], now)).toBe(true);
  });

  it("enforces the 72h gap", () => {
    expect(capsOk([new Date(now.getTime() - 1 * DAY)], now)).toBe(false);
    expect(capsOk([new Date(now.getTime() - 5 * DAY)], now)).toBe(true);
  });

  it("enforces the weekly cap", () => {
    expect(
      capsOk(
        [new Date(now.getTime() - 4 * DAY), new Date(now.getTime() - 6 * DAY)],
        now,
      ),
    ).toBe(false);
  });

  it("ignores sends older than a week", () => {
    expect(capsOk([new Date(now.getTime() - 8 * DAY)], now)).toBe(true);
  });
});
