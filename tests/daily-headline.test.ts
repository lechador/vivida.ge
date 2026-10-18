import { describe, expect, it } from "vitest";

import {
  dailyEmailSubject,
  dailyHeadlineKa,
  type DailyHeadlineFacts,
} from "@/lib/daily-headline";
import type { AspectKind } from "@/lib/aspects";

function facts(
  natal: string,
  kind: AspectKind,
  house = 9,
): DailyHeadlineFacts {
  return {
    moon: {
      sign: "sagittarius",
      house,
      aspects: [{ transit: "moon", natal, kind }],
    },
  };
}

describe("dailyHeadlineKa", () => {
  it("replaces the repeated library title with concrete rotating hooks", () => {
    const generated = new Set(
      Array.from({ length: 31 }, (_, index) =>
        dailyHeadlineKa(
          facts("jupiter", "sextile"),
          `2026-08-${String(index + 1).padStart(2, "0")}`,
          "გულუხვი დღის კეთილი იმედები",
        ),
      ),
    );

    expect(generated.size).toBeGreaterThan(1);
    expect(generated).not.toContain("გულუხვი დღის კეთილი იმედები");
    for (const headline of generated) {
      expect(headline).not.toMatch(/სულ|გულუხვ|შინაგან|ჰარმონი/);
    }
  });

  it("keeps the headline tied to the natal topic and aspect tone", () => {
    const square = dailyHeadlineKa(
      facts("mercury", "square"),
      "2026-08-25",
      "fallback",
    );
    const trine = dailyHeadlineKa(
      facts("venus", "trine"),
      "2026-08-25",
      "fallback",
    );

    expect(square).toMatch(/საუბარ|სიფრთხილ|ნუ იჩქარებ/);
    expect(trine).toMatch(/ურთიერთობ|შენს მხარეს|მეტი სივრცე/);
  });

  it("uses reviewed house and sign hooks on quiet Moon days", () => {
    const houseHeadline = dailyHeadlineKa(
      { moon: { sign: "gemini", house: 3, aspects: [] } },
      "2026-08-25",
      "fallback",
    );
    const signHeadline = dailyHeadlineKa(
      { moon: { sign: "gemini", house: null, aspects: [] } },
      "2026-08-25",
      "fallback",
    );

    expect(houseHeadline).not.toBe("fallback");
    expect(signHeadline).not.toBe("fallback");
    expect(`${houseHeadline} ${signHeadline}`).toMatch(/საუბარ|სიტყვ/);
  });
});

describe("dailyEmailSubject", () => {
  it("creates a channel-specific subject instead of copying the dashboard H1", () => {
    const headline = "დიდი გეგმა უფრო მარტივად ლაგდება";
    const subject = dailyEmailSubject({
      firstName: "ანა",
      headline,
      dateKey: "2026-08-25",
      locale: "ka",
      topAspects: [{ transit: "moon", natal: "jupiter", kind: "sextile" }],
      moonHouse: 9,
    });

    expect(subject).toMatch(/^ანა, /);
    expect(subject).not.toContain(headline);
    expect(subject.length).toBeLessThan(90);
  });

  it("keeps a safe localized fallback for non-Georgian mail", () => {
    expect(
      dailyEmailSubject({
        firstName: null,
        headline: "A conversation clears the air",
        dateKey: "2026-08-25",
        locale: "en",
      }),
    ).toBe("Today for you: A conversation clears the air");
  });
});
