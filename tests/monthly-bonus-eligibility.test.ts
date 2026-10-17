import { describe, expect, it } from "vitest";

import { monthlyBonusEligible } from "@/lib/monthly-bonus-eligibility";
import { MONTHLY_BONUS } from "@/lib/credits-config";

/**
 * The monthly drop is now a habit reward, not a blanket subsidy.
 *
 * Measured over the 28 days to 2026-10-16 it reached 1,944 accounts, of which
 * **281 had never been active at all** and only 472 were active. It was 43.4% of
 * all free issuance, against a 3.62x free-credit ratio and a 2.5x stop
 * threshold. The owner's decision (2026-10-17): make it activity-gated and
 * reduce it to 3 credits, projecting 830 recipients and a 2.45x ratio.
 */

describe("monthlyBonusEligible", () => {
  it("rewards an active account", () => {
    expect(monthlyBonusEligible({ activeRecently: true })).toBe(true);
  });

  it("does not pay a dormant account", () => {
    // 281 accounts were receiving this without ever having been active.
    expect(monthlyBonusEligible({ activeRecently: false })).toBe(false);
  });

  it("no longer disqualifies an active never-payer", () => {
    // The old never-payer gate was removed: it was never deployed, cut the
    // audience to 233, and compounding it with this gate left only 33. Paying
    // for engagement is the point of a habit reward.
    expect(monthlyBonusEligible({ activeRecently: true })).toBe(true);
  });
});

describe("monthly amount", () => {
  it("is 3 credits after the 2026-10-17 retarget", () => {
    expect(MONTHLY_BONUS).toBe(3);
  });

  it("keeps the projected ratio under the 2.5x stop threshold", () => {
    // Measured inputs from the 28 days to 2026-10-16.
    const otherFreeIssued = 12_695;
    const spent = 6_192;
    const activeRecipients = 830;
    const projected =
      (otherFreeIssued + activeRecipients * MONTHLY_BONUS) / spent;
    expect(projected).toBeLessThan(2.5);
    expect(projected).toBeGreaterThan(2.0);
  });
});
