import { describe, expect, it } from "vitest";

import type { NatalChartJson } from "@/db/schema";
import { computeChartSalience } from "@/lib/report-salience";
import { buildChartChatSystem } from "@/lib/chart-chat";
import {
  ASK_DEPTH_TOKENS,
  buildFollowUpQuestion,
  buildTopicStarter,
  depthInstruction,
  detectDistress,
  distressInstruction,
  normalizeAskDepth,
  sanitizeMergedMemory,
} from "@/lib/ask-memory-pure";

const chart: NatalChartJson = {
  ascendant: { longitude: 200, signIndex: 7, signDegree: 20 },
  midheaven: { longitude: 110, signIndex: 3, signDegree: 20 },
  bodies: {
    sun: { longitude: 130, signIndex: 4, signDegree: 10, house: 10 },
    moon: { longitude: 250, signIndex: 8, signDegree: 5, house: 4 },
    mercury: { longitude: 140, signIndex: 4, signDegree: 20, house: 10 },
    venus: { longitude: 120, signIndex: 4, signDegree: 1, house: 9 },
    mars: { longitude: 300, signIndex: 10, signDegree: 12, house: 6 },
    jupiter: { longitude: 60, signIndex: 2, signDegree: 3, house: 8 },
    saturn: {
      longitude: 320,
      signIndex: 10,
      signDegree: 1,
      house: 6,
      retrograde: true,
    },
    uranus: { longitude: 30, signIndex: 1, signDegree: 2, house: 7 },
    neptune: { longitude: 330, signIndex: 11, signDegree: 4, house: 7 },
    pluto: { longitude: 240, signIndex: 8, signDegree: 8, house: 4 },
  },
  houses: Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    cuspLongitude: i * 30,
    signIndex: (i + 7) % 12,
  })),
};

describe("answer depth", () => {
  it("normalizes unknown values to auto", () => {
    expect(normalizeAskDepth("short")).toBe("short");
    expect(normalizeAskDepth("detailed")).toBe("detailed");
    expect(normalizeAskDepth("verbose")).toBe("auto");
    expect(normalizeAskDepth(undefined)).toBe("auto");
    expect(normalizeAskDepth(null)).toBe("auto");
  });

  it("budgets fewer tokens for short, more for detailed", () => {
    expect(ASK_DEPTH_TOKENS.short).toBeLessThan(ASK_DEPTH_TOKENS.auto);
    expect(ASK_DEPTH_TOKENS.detailed).toBeGreaterThan(ASK_DEPTH_TOKENS.auto);
  });

  it("instructs only for non-auto depths", () => {
    expect(depthInstruction("auto", "ka")).toBe("");
    expect(depthInstruction("short", "ka")).toContain("1-2");
    expect(depthInstruction("detailed", "en")).toContain("full 4 paragraphs");
  });
});

describe("distress detection", () => {
  it("detects support-level signals in both languages", () => {
    expect(detectDistress("დღეს ძალიან ცუდად ვარ, ვერ ვიძინებ")).toBe(
      "support",
    );
    expect(detectDistress("I feel so anxious lately and can't sleep")).toBe(
      "support",
    );
    expect(detectDistress("გადაღლილი ვარ, ძალა აღარ მაქვს")).toBe("support");
  });

  it("detects crisis signals in both languages", () => {
    expect(detectDistress("ცხოვრება აღარ მინდა")).toBe("crisis");
    expect(detectDistress("I want to kill myself")).toBe("crisis");
  });

  it("prefers crisis over support", () => {
    expect(detectDistress("ცუდად ვარ და სუიციდზე ვფიქრობ")).toBe("crisis");
  });

  it("leaves ordinary questions alone", () => {
    expect(detectDistress("როგორ ხარ?")).toBe("none");
    expect(detectDistress("What does my Moon say about emotions?")).toBe(
      "none",
    );
    expect(detectDistress("კარგად ვარ, მადლობა")).toBe("none");
  });

  it("instructs only for real signals", () => {
    expect(distressInstruction("none", "ka")).toBe("");
    expect(distressInstruction("support", "ka")).toContain("დამადასტურებელი");
    expect(distressInstruction("crisis", "en")).toContain(
      "mental-health professional",
    );
  });
});

describe("follow-ups and topic starters", () => {
  it("builds a sendable follow-up question from an open loop", () => {
    expect(buildFollowUpQuestion("გასაუბრება ხუთშაბათს", "ka")).toContain(
      "გასაუბრება ხუთშაბათს",
    );
    expect(buildFollowUpQuestion("job interview", "en")).toContain(
      "job interview",
    );
  });

  it("builds a topic chip from a remembered interest", () => {
    expect(buildTopicStarter("კარიერა", "ka")).toEqual({
      label: "კარიერა",
      prompt: "რას ამბობს ჩემი რუკა „კარიერა“-ზე?",
    });
    expect(buildTopicStarter("career", "en").prompt).toContain("career");
  });

  it("sanitizes open loops from the merge output", () => {
    const ok = sanitizeMergedMemory({
      summary: "s",
      traits: {
        openLoops: ["გასაუბრება", 42, "   ", "x".repeat(100), "a", "b", "c"],
      },
    });
    expect(ok?.traits.openLoops).toHaveLength(3);
    expect(ok?.traits.openLoops?.[2].length).toBeLessThanOrEqual(60);
    expect(
      sanitizeMergedMemory({ summary: "s", traits: {} })?.traits.openLoops,
    ).toBeUndefined();
  });
});

describe("prompt opts wiring", () => {
  const salience = computeChartSalience(chart);

  it("adds depth + distress instructions only when set", () => {
    const base = buildChartChatSystem("ნინო", chart, salience, "ka");
    expect(base).not.toContain("მოკლე პასუხი მთხოვა");
    const tuned = buildChartChatSystem("ნინო", chart, salience, "ka", "", {
      depth: "short",
      distress: "support",
    });
    expect(tuned).toContain("1-2 მოკლე აბზაცით");
    expect(tuned).toContain("დამადასტურებელი");
  });

  it("renders open loops into the memory block", () => {
    const tuned = buildChartChatSystem(
      "Nino",
      chart,
      salience,
      "en",
      "open threads: job interview",
      {
        distress: "crisis",
      },
    );
    expect(tuned).toContain("job interview");
    expect(tuned).toContain("mental-health professional");
  });
});
