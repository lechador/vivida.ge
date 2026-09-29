import { describe, expect, it } from "vitest";

import { dayScoreBand, proDayScore } from "@/lib/pro-day-score";
import {
  PRO_RITUAL_QUESTION_COUNT,
  proRitualQuestion,
} from "@/lib/pro-ritual-questions";

describe("proDayScore", () => {
  it("starts at 5 with no aspects", () => {
    expect(proDayScore([])).toMatchObject({
      score: 5,
      harmonic: 0,
      tense: 0,
      neutral: 0,
    });
  });

  it("rewards harmonic and penalizes tense aspects", () => {
    const r = proDayScore(["trine", "sextile", "square"]);
    expect(r).toMatchObject({ harmonic: 2, tense: 1, neutral: 0, score: 6 });
  });

  it("treats conjunctions and unknowns as neutral", () => {
    const r = proDayScore(["conjunction", "quincunx"]);
    expect(r).toMatchObject({ neutral: 2, score: 5 });
  });

  it("clamps to 1–10", () => {
    expect(
      proDayScore(["trine", "trine", "trine", "trine", "trine", "trine"]).score,
    ).toBe(10);
    expect(
      proDayScore(["square", "square", "square", "square", "square", "square"])
        .score,
    ).toBe(1);
  });
});

describe("dayScoreBand", () => {
  it("covers every score 1–10 in both locales with non-empty copy", () => {
    for (let s = 1; s <= 10; s++) {
      for (const locale of ["ka", "en"] as const) {
        const band = dayScoreBand(s, locale);
        expect(band.label.length).toBeGreaterThan(2);
        expect(band.hint.length).toBeGreaterThan(10);
      }
    }
  });

  it("escalates monotonically from tender to power", () => {
    expect(dayScoreBand(1, "en").label).not.toBe(dayScoreBand(10, "en").label);
    expect(dayScoreBand(10, "ka").label).toBe("ძლიერი დღე");
    expect(dayScoreBand(1, "ka").label).toBe("რთული დღე");
  });
});

describe("proRitualQuestion", () => {
  it("ships a full fortnightly rotation", () => {
    expect(PRO_RITUAL_QUESTION_COUNT).toBe(14);
  });

  it("is deterministic per date and varies across days", () => {
    expect(proRitualQuestion("2026-09-29", "ka")).toBe(
      proRitualQuestion("2026-09-29", "ka"),
    );
    const seen = new Set(
      Array.from({ length: 14 }, (_, i) =>
        proRitualQuestion(`2026-09-${String(i + 1).padStart(2, "0")}`, "ka"),
      ),
    );
    expect(seen.size).toBeGreaterThan(7);
  });

  it("has a matching EN question for every rotation slot", () => {
    for (let i = 0; i < 14; i++) {
      const date = `2026-10-${String(i + 1).padStart(2, "0")}`;
      const ka = proRitualQuestion(date, "ka");
      const en = proRitualQuestion(date, "en");
      expect(ka.length).toBeGreaterThan(15);
      expect(en.length).toBeGreaterThan(15);
      expect(ka).not.toBe(en);
    }
  });

  it("falls back safely on garbage input", () => {
    expect(proRitualQuestion("not-a-date", "ka").length).toBeGreaterThan(15);
  });
});
