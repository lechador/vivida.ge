import { describe, expect, it } from "vitest";

import {
  initialSignupCredits,
  qualifiesForStagedReturn,
  signupCreditVariantFor,
} from "@/lib/signup-credit-experiment-config";

describe("signup credit experiment", () => {
  it("assigns the same user to the same variant", () => {
    expect(signupCreditVariantFor("user-123")).toBe(
      signupCreditVariantFor("user-123"),
    );
  });

  it("keeps allocation roughly balanced across a large cohort", () => {
    const variants = Array.from({ length: 1_000 }, (_, i) =>
      signupCreditVariantFor(`user-${i}`),
    );
    const control = variants.filter(
      (variant) => variant === "control_20",
    ).length;
    expect(control).toBeGreaterThan(450);
    expect(control).toBeLessThan(550);
  });

  it("gives both variants the 3-credit welcome bonus", () => {
    expect(initialSignupCredits("control_20")).toBe(3);
    expect(initialSignupCredits("staged_10_plus_5")).toBe(3);
  });

  it("does not qualify the return bonus until 24 hours have elapsed", () => {
    const assignedAt = new Date("2026-08-22T10:00:00.000Z");
    expect(
      qualifiesForStagedReturn(
        assignedAt,
        new Date("2026-08-23T09:59:59.999Z"),
      ),
    ).toBe(false);
    expect(
      qualifiesForStagedReturn(
        assignedAt,
        new Date("2026-08-23T10:00:00.000Z"),
      ),
    ).toBe(true);
  });
});
