import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  countRecentLifecycleSends,
  isLifecycleCapReached,
  LIFECYCLE_EMAIL_CAP,
  LIFECYCLE_KINDS,
} from "@/lib/email-frequency-cap";
import {
  dayDifference,
  selectWinbackStep,
  WINBACK_MIN_STEP_GAP_DAYS,
  WINBACK_STEPS,
} from "@/lib/winback-sequence";

/**
 * Dormant win-back sequence v1.
 *
 * Thresholds are anchored on the last visit: step 1 at >= 8 days, step 2 at
 * >= 11, step 3 at >= 14. The cohort is enrolled at 7–10 days, so a user who is
 * already 11+ days dormant without step 1 is left alone rather than mailed
 * day-8 copy late.
 */
describe("win-back enrollment window", () => {
  it("does not enroll before the 8-day threshold", () => {
    expect(
      selectWinbackStep({ daysSinceLastVisit: 7, sentSteps: [] }),
    ).toBeNull();
  });

  it("enrolls steps 1 between 8 and 10 days of dormancy", () => {
    for (const days of [8, 9, 10]) {
      expect(
        selectWinbackStep({ daysSinceLastVisit: days, sentSteps: [] })?.step,
      ).toBe(1);
    }
  });

  it("does not mail late day-8 copy to a user already 11+ days dormant", () => {
    for (const days of [11, 14, 21]) {
      expect(
        selectWinbackStep({ daysSinceLastVisit: days, sentSteps: [] }),
      ).toBeNull();
    }
  });

  it("stops after the sequence window", () => {
    expect(
      selectWinbackStep({ daysSinceLastVisit: 22, sentSteps: [1, 2] }),
    ).toBeNull();
  });
});

describe("step thresholds", () => {
  it("sends step 2 at >= 11 days only after step 1", () => {
    expect(
      selectWinbackStep({
        daysSinceLastVisit: 10,
        sentSteps: [1],
        daysSinceLastStep: 2,
      }),
    ).toBeNull();

    expect(
      selectWinbackStep({
        daysSinceLastVisit: 11,
        sentSteps: [1],
        daysSinceLastStep: 3,
      })?.step,
    ).toBe(2);
  });

  it("sends step 3 at >= 14 days only after steps 1 and 2", () => {
    expect(
      selectWinbackStep({
        daysSinceLastVisit: 13,
        sentSteps: [1, 2],
        daysSinceLastStep: 2,
      }),
    ).toBeNull();

    expect(
      selectWinbackStep({
        daysSinceLastVisit: 14,
        sentSteps: [1, 2],
        daysSinceLastStep: 3,
      })?.step,
    ).toBe(3);
  });

  it("never skips ahead when an earlier step is missing", () => {
    // Step 3 is due by day 20, but step 1 was never sent.
    expect(
      selectWinbackStep({ daysSinceLastVisit: 20, sentSteps: [2, 3] }),
    ).toBeNull();
    expect(
      selectWinbackStep({
        daysSinceLastVisit: 20,
        sentSteps: [1],
        daysSinceLastStep: 9,
      })?.step,
    ).toBe(2);
  });
});

describe("once per step and spacing", () => {
  it("never sends the same step twice in one spell", () => {
    expect(
      selectWinbackStep({
        daysSinceLastVisit: 9,
        sentSteps: [1],
        daysSinceLastStep: 1,
      }),
    ).toBeNull();

    expect(
      selectWinbackStep({
        daysSinceLastVisit: 20,
        sentSteps: [1, 2, 3],
        daysSinceLastStep: 6,
      }),
    ).toBeNull();
  });

  it("keeps a minimum gap between two steps", () => {
    for (let gap = 0; gap < WINBACK_MIN_STEP_GAP_DAYS; gap++) {
      expect(
        selectWinbackStep({
          daysSinceLastVisit: 12,
          sentSteps: [1],
          daysSinceLastStep: gap,
        }),
      ).toBeNull();
    }
    expect(
      selectWinbackStep({
        daysSinceLastVisit: 12,
        sentSteps: [1],
        daysSinceLastStep: WINBACK_MIN_STEP_GAP_DAYS,
      })?.step,
    ).toBe(2);
  });

  it("sends exactly one step per selected run", () => {
    const selection = selectWinbackStep({
      daysSinceLastVisit: 14,
      sentSteps: [1, 2],
      daysSinceLastStep: 3,
    });
    expect(selection).not.toBeNull();
    expect(WINBACK_STEPS.filter((s) => s === selection)).toHaveLength(1);
  });
});

describe("spell exits", () => {
  it("exits on return (last visit is recent)", () => {
    expect(
      selectWinbackStep({ daysSinceLastVisit: 3, sentSteps: [1] }),
    ).toBeNull();
  });

  it("exits on a nudges unsubscribe", () => {
    expect(
      selectWinbackStep({
        daysSinceLastVisit: 9,
        sentSteps: [],
        nudgesOptedOut: true,
      }),
    ).toBeNull();
  });

  it("exits on return or purchase recorded after the anchor", () => {
    expect(
      selectWinbackStep({
        daysSinceLastVisit: 12,
        sentSteps: [1],
        daysSinceLastStep: 3,
        convertedAt: new Date(),
      }),
    ).toBeNull();
    expect(
      selectWinbackStep({
        daysSinceLastVisit: 12,
        sentSteps: [1],
        daysSinceLastStep: 3,
        purchasedAt: new Date(),
      }),
    ).toBeNull();
  });
});

describe("anchor day maths", () => {
  it("counts calendar days between YYYY-MM-DD keys", () => {
    expect(dayDifference("2026-10-01", "2026-10-09")).toBe(8);
    expect(dayDifference("2026-10-01", "2026-10-01")).toBe(0);
    expect(dayDifference("bad", "2026-10-01")).toBeNaN();
  });
});

describe("3 per 14 days cross-campaign cap", () => {
  it("counts every lifecycle kind, not just win-back", () => {
    const rows = [
      { kind: "winback_v1_s1", status: "sent" },
      { kind: "profile_incomplete", status: "sent" },
      { kind: "verify_reminder", status: "sent" },
    ];
    expect(countRecentLifecycleSends(rows)).toBe(LIFECYCLE_EMAIL_CAP);
    expect(isLifecycleCapReached(rows)).toBe(true);
  });

  it("treats pending claims as occupied slots", () => {
    const rows = [
      { kind: "winback_v1_s1", status: "sent" },
      { kind: "winback_v1_s2", status: "pending" },
      { kind: "winback_v1_s3", status: "sent" },
    ];
    expect(isLifecycleCapReached(rows)).toBe(true);
  });

  it("does not count failed, skipped, or non-lifecycle mail", () => {
    const rows = [
      { kind: "winback_v1_s1", status: "failed" },
      { kind: "winback_v1_s2", status: "skipped" },
      { kind: "welcome", status: "sent" },
      { kind: "marketing", status: "sent" },
      { kind: "verification", status: "sent" },
      { kind: "winback_v1_s3", status: "sent" },
    ];
    expect(countRecentLifecycleSends(rows)).toBe(1);
    expect(isLifecycleCapReached(rows)).toBe(false);
  });

  it("treats a null status as delivered (historical rows)", () => {
    expect(countRecentLifecycleSends([{ kind: "winback", status: null }])).toBe(
      1,
    );
  });

  it("lists all three win-back steps as lifecycle kinds", () => {
    expect(LIFECYCLE_KINDS).toEqual(
      expect.arrayContaining([
        "winback_v1_s1",
        "winback_v1_s2",
        "winback_v1_s3",
      ]),
    );
  });
});

describe("approved Georgian copy", () => {
  it("keeps subject lines within 55 characters", () => {
    for (const step of WINBACK_STEPS) {
      expect(step.subjectKa.length).toBeLessThanOrEqual(55);
      expect(step.subjectEn.length).toBeLessThanOrEqual(55);
    }
  });

  it("keeps Georgian bodies between 60 and 110 words", () => {
    for (const step of WINBACK_STEPS) {
      const words = step.bodyKa.join(" ").split(/\s+/).filter(Boolean).length;
      expect(words).toBeGreaterThanOrEqual(60);
      expect(words).toBeLessThanOrEqual(110);
    }
  });

  it("never mentions price, credits, PRO, or a discount", () => {
    const forbidden = [
      "ფასი",
      "ფასდაკლებ",
      "კრედიტ",
      "PRO",
      "შეთავაზებ",
      "ბოლო შანსი",
    ];
    for (const step of WINBACK_STEPS) {
      const copy = [step.subjectKa, step.preheaderKa, ...step.bodyKa].join(" ");
      for (const word of forbidden) {
        expect(copy.toLowerCase()).not.toContain(word.toLowerCase());
      }
    }
  });

  it("has one CTA per step with a stable campaign slug", () => {
    for (const step of WINBACK_STEPS) {
      expect(step.ctaKa.length).toBeGreaterThan(0);
      expect(step.path.startsWith("/")).toBe(true);
      expect(step.slug).toBe(`winback_dormant_v1_s${step.step}`);
    }
  });
});

describe("campaign and safety wiring", () => {
  const source = readFileSync(
    join(__dirname, "..", "lib", "winback.ts"),
    "utf8",
  );

  it("pins reward_credits to 0 on every campaign write", () => {
    expect(source).toContain("rewardCredits: 0");
  });

  it("runs the shared lifecycle cap before sending", () => {
    expect(source).toContain("isLifecycleFrequencyCapped");
    expect(source).toContain("lifecycleCapSkipReason");
    expect(source).toContain('status: "skipped"');
  });

  it("sends one-click unsubscribe headers like the previous win-back", () => {
    expect(source).toContain("List-Unsubscribe");
    expect(source).toContain("List-Unsubscribe-Post");
    expect(source).toContain("type=nudges");
  });

  it("uses a per-user/step/spell Resend idempotency key", () => {
    expect(source).toContain("idempotencyKey");
    expect(source).toMatch(
      /idempotencyKey: `\$\{step\.kind\}:\$\{candidate\.userId\}/,
    );
  });
});
