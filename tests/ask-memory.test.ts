import { describe, expect, it } from "vitest";

import type { NatalChartJson } from "@/db/schema";
import { computeChartSalience } from "@/lib/report-salience";
import { buildChartChatSystem } from "@/lib/chart-chat";
import {
  buildMemoryBlock,
  inferVerbosity,
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

describe("ask memory", () => {
  it("infers verbosity from user message length", () => {
    expect(inferVerbosity(["გამარჯობა", "კარგი"])).toBe("short");
    expect(inferVerbosity([])).toBe("medium");
    expect(inferVerbosity(["x".repeat(500), "y".repeat(500)])).toBe("detailed");
  });

  it("returns an empty block when there is no memory", () => {
    expect(buildMemoryBlock(null, "ka")).toBe("");
  });

  it("renders summary and traits into the block", () => {
    const block = buildMemoryBlock(
      {
        userId: "u1",
        summary: "სიყვარულის თემები აინტერესებს",
        traits: {
          verbosity: "short",
          tone: "მხიარული",
          topics: ["ურთიერთობა"],
          notes: "ახალი სამსახური",
        },
        turnsSeen: 10,
        updatedAt: new Date(),
      },
      "ka",
    );
    expect(block).toContain("სიყვარულის თემები");
    expect(block).toContain("მოკლე");
    expect(block).toContain("ურთიერთობა");
  });

  it("sanitizes the LLM merge output", () => {
    expect(sanitizeMergedMemory(null)).toBeNull();
    expect(sanitizeMergedMemory({ summary: "  " })).toBeNull();
    const ok = sanitizeMergedMemory({
      summary: "ადამიანი კარიერით ინტერესდება",
      traits: {
        verbosity: "detailed",
        tone: "სერიოზული",
        topics: ["კარიერა", 42],
        notes: "x".repeat(500),
      },
    });
    expect(ok?.summary).toContain("კარიერით");
    expect(ok?.traits.verbosity).toBe("detailed");
    expect(ok?.traits.topics).toEqual(["კარიერა"]);
    expect(ok?.traits.notes?.length).toBeLessThanOrEqual(300);
    // Unknown verbosity is dropped, not persisted as junk.
    expect(
      sanitizeMergedMemory({ summary: "s", traits: { verbosity: "verbose" } })
        ?.traits.verbosity,
    ).toBeUndefined();
  });
});

describe("chart chat system prompt", () => {
  const salience = computeChartSalience(chart);

  it("keeps answers simple: explains terms, gives examples (ka)", () => {
    const prompt = buildChartChatSystem("ნინო", chart, salience, "ka");
    expect(prompt).toContain("მარტივი ყოველდღიური ენა");
    expect(prompt).toContain("კვადრატი (დაძაბული კუთხე");
    expect(prompt).toContain("ცხოვრებისეული მაგალითი");
    expect(prompt).toContain("მოერგე ადამიანს");
  });

  it("keeps answers simple (en)", () => {
    const prompt = buildChartChatSystem("Nino", chart, salience, "en");
    expect(prompt).toContain("plain everyday language");
    expect(prompt).toContain("square (a tense angle");
    expect(prompt).toContain("everyday example");
  });

  it("injects the memory block when provided, omits it when empty", () => {
    const withMem = buildChartChatSystem(
      "ნინო",
      chart,
      salience,
      "ka",
      "ადამიანს უყვარს მოგზაურობა",
    );
    expect(withMem).toContain("ადამიანს უყვარს მოგზაურობა");
    const withoutMem = buildChartChatSystem(
      "ნინო",
      chart,
      salience,
      "ka",
      "   ",
    );
    expect(withoutMem).not.toContain("გახსოვს ამ ადამიანზე");
  });
});
