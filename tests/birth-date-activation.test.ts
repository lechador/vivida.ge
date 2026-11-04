import { describe, expect, it } from "vitest";

import {
  EXPERIMENT_CATALOG,
  EXPERIMENTS,
  isExperimentOutcome,
} from "@/lib/experiment-catalog";
import { stableExperimentVariant } from "@/lib/experiment-assignment";
import {
  birthDateActivationEligible,
  isBirthDateActivationVariant,
  showInlineBirthPreview,
} from "@/lib/birth-date-activation-config";

describe("birth date activation experiment", () => {
  it("is registered with two variants and the saved outcome", () => {
    const config = EXPERIMENT_CATALOG[EXPERIMENTS.birthDateActivation];
    expect(config.eligibility).toBe("authenticated_no_birth_date_dashboard");
    expect(config.variants).toEqual(["banner_link", "inline_preview"]);
    expect(
      isExperimentOutcome(EXPERIMENTS.birthDateActivation, "birth_date_saved"),
    ).toBe(true);
    expect(
      isExperimentOutcome(
        EXPERIMENTS.birthDateActivation,
        "purchase_completed",
      ),
    ).toBe(false);
  });

  it("enrolls only signed-in users with no birth date on file", () => {
    expect(
      birthDateActivationEligible({ authenticated: true, hasBirthDate: false }),
    ).toBe(true);
    expect(
      birthDateActivationEligible({ authenticated: true, hasBirthDate: true }),
    ).toBe(false);
    expect(
      birthDateActivationEligible({
        authenticated: false,
        hasBirthDate: false,
      }),
    ).toBe(false);
  });

  it("renders the inline preview only for the treatment arm", () => {
    expect(showInlineBirthPreview("inline_preview")).toBe(true);
    expect(showInlineBirthPreview("banner_link")).toBe(false);
    expect(showInlineBirthPreview(null)).toBe(false);
    expect(showInlineBirthPreview(undefined)).toBe(false);
    expect(showInlineBirthPreview("bogus")).toBe(false);
  });

  it("assigns deterministically and roughly evenly", () => {
    const experiment = EXPERIMENTS.birthDateActivation;
    expect(stableExperimentVariant("user-123", experiment)).toBe(
      stableExperimentVariant("user-123", experiment),
    );
    const variants = Array.from({ length: 1_000 }, (_, i) =>
      stableExperimentVariant(`user-${i}`, experiment),
    );
    expect(variants.every(isBirthDateActivationVariant)).toBe(true);
    const treatment = variants.filter((v) => v === "inline_preview").length;
    expect(treatment).toBeGreaterThan(400);
    expect(treatment).toBeLessThan(600);
  });
});
