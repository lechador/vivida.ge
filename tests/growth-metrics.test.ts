import { describe, expect, it } from "vitest";

import {
  classifyCreditMovement,
  creditGuardrail,
  freeCreditRatio,
} from "@/lib/credit-economy-metrics";
import { stableExperimentVariant } from "@/lib/experiment-assignment";
import { EXPERIMENTS } from "@/lib/experiment-catalog";
import { DEFAULT_REMINDER_PREFERENCES } from "@/lib/reminder-config";
import { reminderPreferenceChanges } from "@/lib/reminder-funnel";

describe("growth experiment assignment", () => {
  it("keeps a user in the same variant", () => {
    const first = stableExperimentVariant("user-123", EXPERIMENTS.pricingPresentation);
    expect(stableExperimentVariant("user-123", EXPERIMENTS.pricingPresentation)).toBe(first);
    expect(["credits_first", "pro_first"]).toContain(first);
  });

  it("uses the experiment name as part of allocation", () => {
    const pricing = stableExperimentVariant("user-123", EXPERIMENTS.pricingPresentation);
    const paywall = stableExperimentVariant("user-123", EXPERIMENTS.contextualPaywall);
    expect(["credits_first", "pro_first"]).toContain(pricing);
    expect(["deficit_message", "value_message"]).toContain(paywall);
  });
});

describe("reminder funnel consent events", () => {
  it("records only changed opt-ins and opt-outs", () => {
    const before = { ...DEFAULT_REMINDER_PREFERENCES };
    const after = { ...before, transitEmail: true, relationshipPush: false };
    expect(reminderPreferenceChanges(before, after)).toEqual([
      { topic: "transit", channel: "email", eventType: "opt_in" },
      { topic: "relationship", channel: "push", eventType: "opt_out" },
    ]);
  });
});

describe("four-week credit guardrail", () => {
  it("separates purchased credits from free issuance and spend", () => {
    expect(classifyCreditMovement(20, "signup_bonus")).toBe("free_issued");
    expect(classifyCreditMovement(50, "purchase")).toBe("purchased");
    expect(classifyCreditMovement(-5, "spend_report")).toBe("spent");
    expect(classifyCreditMovement(0, "spend_synastry")).toBe("ignored");
  });

  it("enforces the 2.0× target and 2.5× stop threshold", () => {
    expect(freeCreditRatio(20, 10)).toBe(2);
    expect(creditGuardrail(2)).toBe("healthy");
    expect(creditGuardrail(2.2)).toBe("watch");
    expect(creditGuardrail(2.51)).toBe("stop");
    expect(creditGuardrail(null)).toBe("stop");
  });
});
