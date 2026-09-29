import { describe, expect, it } from "vitest";

import { PRO_ANCHOR_MIN_SPEND, proAnchorFor } from "@/lib/pro-anchor";

describe("proAnchorFor", () => {
  it("returns null below the minimum spend", () => {
    expect(proAnchorFor(0, "GE")).toBeNull();
    expect(proAnchorFor(PRO_ANCHOR_MIN_SPEND - 1, "GE")).toBeNull();
    expect(proAnchorFor(Number.NaN, "GE")).toBeNull();
  });

  it("values GE spend at the best pack rate (L: 2990/180)", () => {
    const anchor = proAnchorFor(60, "GE");
    expect(anchor).not.toBeNull();
    // 60 * (2990/180) = 996.67 → 997 minor.
    expect(anchor?.spendCashMinor).toBe(997);
    expect(anchor?.currency).toBe("gel");
  });

  it("anchors GE against the quarterly monthly equivalent (2900/3)", () => {
    const anchor = proAnchorFor(60, "GE");
    expect(anchor?.proMonthlyMinor).toBe(967);
  });

  it("reports saves above breakeven with the exact savings", () => {
    // 997 value vs 967 PRO → saves 30.
    const anchor = proAnchorFor(60, "GE");
    expect(anchor?.kind).toBe("saves");
    expect(anchor?.saveMinor).toBe(30);
  });

  it("reports pace below breakeven with zero savings", () => {
    // 34 credits → 565 value vs 967 PRO.
    const anchor = proAnchorFor(34, "GE");
    expect(anchor?.kind).toBe("pace");
    expect(anchor?.saveMinor).toBe(0);
    expect(anchor?.spendCashMinor).toBe(565);
  });

  it("handles GB and AM catalogues with their currencies", () => {
    const gb = proAnchorFor(200, "GB");
    expect(gb?.currency).toBe("gbp");
    // 200 * (1199/180) = 1332.2 → 1332 vs 999 PRO → saves 333.
    expect(gb?.kind).toBe("saves");
    expect(gb?.saveMinor).toBe(333);

    const am = proAnchorFor(200, "AM");
    expect(am?.currency).toBe("amd");
    // 200 * (429000/180) = 476666.7 → 476667 vs 299000 PRO → saves.
    expect(am?.kind).toBe("saves");
    expect(am?.saveMinor).toBe(177667);
  });

  it("falls back to the GE catalogue for unknown countries", () => {
    const anchor = proAnchorFor(60, "XX");
    expect(anchor?.currency).toBe("gel");
    expect(anchor?.kind).toBe("saves");
  });
});
