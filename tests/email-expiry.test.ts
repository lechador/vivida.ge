import { describe, expect, it } from "vitest";

import {
  DAILY_ROW_GRACE_HOURS,
  EXPIRY_BATCH_SIZE,
  expiryCutoffs,
  isRetirable,
} from "@/lib/email-expiry";

/**
 * The daily-horoscope backlog reached 28,449 orphaned `pending` rows by
 * 2026-10-16 (back to 2026-08-09), because the drain only ever reads the current
 * `sendDate`. `expireStaleDailyRows` retires them.
 *
 * Two things must hold, and both are easy to get wrong:
 *   1. today's rows are NEVER retired — the retry tick can still deliver them;
 *   2. the sweep is bounded, so the deploy-day ~28k-row backlog cannot run as one
 *      unbounded UPDATE inside a cron that also has to send the day's email.
 */

const NOW = new Date("2026-10-16T05:00:00.000Z");

describe("expiryCutoffs", () => {
  it("derives the today key from the clock in UTC", () => {
    expect(expiryCutoffs(NOW).today).toBe("2026-10-16");
  });

  it("puts the cutoff exactly the grace period in the past", () => {
    const { cutoff } = expiryCutoffs(NOW);
    const hours = (NOW.getTime() - cutoff.getTime()) / (60 * 60 * 1000);
    expect(hours).toBe(DAILY_ROW_GRACE_HOURS);
  });

  it("defaults the cap to the batch size", () => {
    expect(expiryCutoffs(NOW).limit).toBe(EXPIRY_BATCH_SIZE);
  });

  it("never returns a non-positive cap", () => {
    expect(expiryCutoffs(NOW, 0).limit).toBe(1);
    expect(expiryCutoffs(NOW, -10).limit).toBe(1);
  });
});

describe("isRetirable", () => {
  const cutoffs = expiryCutoffs(NOW);

  const row = (
    overrides: Partial<{
      status: string;
      sendDate: string;
      createdAt: Date;
    }> = {},
  ) => ({
    status: "pending",
    sendDate: "2026-10-10",
    createdAt: new Date("2026-10-10T05:00:00.000Z"),
    ...overrides,
  });

  it("retires an old, undelivered row", () => {
    expect(isRetirable(row(), cutoffs)).toBe(true);
  });

  it("never retires today's rows, so the retry tick can still deliver them", () => {
    // This is the load-bearing case: production held 915 still-drainable rows
    // for today when the sweep was written.
    expect(isRetirable(row({ sendDate: cutoffs.today }), cutoffs)).toBe(false);
    expect(
      isRetirable(
        row({
          sendDate: "2026-10-16",
          createdAt: new Date("2026-10-16T05:00:00Z"),
        }),
        cutoffs,
      ),
    ).toBe(false);
  });

  it("leaves a recent row alone even if its sendDate is in the past", () => {
    // Enqueued minutes ago for a prior sendDate should still be drainable.
    const fresh = new Date(NOW.getTime() - 60 * 1000);
    expect(
      isRetirable(row({ sendDate: "2026-10-15", createdAt: fresh }), cutoffs),
    ).toBe(false);
  });

  it("retires failed rows too, not just pending", () => {
    expect(isRetirable(row({ status: "failed" }), cutoffs)).toBe(true);
  });

  it("leaves terminal statuses alone", () => {
    for (const status of ["sent", "skipped", "expired"]) {
      expect(isRetirable(row({ status }), cutoffs)).toBe(false);
    }
  });

  it("does not retire a future-dated row", () => {
    expect(isRetirable(row({ sendDate: "2026-12-01" }), cutoffs)).toBe(false);
  });

  it("treats the grace boundary as exclusive", () => {
    const exactlyAtCutoff = new Date(cutoffs.cutoff.getTime());
    const justInside = new Date(cutoffs.cutoff.getTime() - 1);
    expect(isRetirable(row({ createdAt: exactlyAtCutoff }), cutoffs)).toBe(
      false,
    );
    expect(isRetirable(row({ createdAt: justInside }), cutoffs)).toBe(true);
  });
});

describe("sweep bounding", () => {
  it("clears the observed 28k backlog in a small number of ticks", () => {
    const backlog = 28_449;
    const ticks = Math.ceil(backlog / EXPIRY_BATCH_SIZE);
    // Small enough to drain in a day's worth of cron ticks, not one giant
    // statement.
    expect(ticks).toBeLessThanOrEqual(10);
  });
});
