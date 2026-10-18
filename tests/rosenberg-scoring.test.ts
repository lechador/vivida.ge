import { describe, expect, it } from "vitest";

import { ROSENBERG_QUESTIONS } from "@/lib/rosenberg/questions";
import {
  calculateRosenberg,
  rosenbergBand,
  scoreRosenbergItem,
} from "@/lib/rosenberg/scoring";

describe("Rosenberg scoring", () => {
  it("scores positive and negative items in opposite directions", () => {
    expect(scoreRosenbergItem({ reverse: false }, 4)).toBe(3);
    expect(scoreRosenbergItem({ reverse: false }, 1)).toBe(0);
    expect(scoreRosenbergItem({ reverse: true }, 4)).toBe(0);
    expect(scoreRosenbergItem({ reverse: true }, 1)).toBe(3);
  });

  it("produces 30 for the highest self-esteem response pattern", () => {
    const answers = Object.fromEntries(
      ROSENBERG_QUESTIONS.map((question) => [
        question.id,
        question.reverse ? 1 : 4,
      ]),
    );
    const result = calculateRosenberg(answers);
    expect(result.score).toBe(30);
    expect(result.band).toBe("higher");
    expect(result.percentage).toBe(100);
  });

  it("produces 0 for the lowest self-esteem response pattern", () => {
    const answers = Object.fromEntries(
      ROSENBERG_QUESTIONS.map((question) => [
        question.id,
        question.reverse ? 4 : 1,
      ]),
    );
    const result = calculateRosenberg(answers);
    expect(result.score).toBe(0);
    expect(result.band).toBe("lower");
    expect(result.percentage).toBe(0);
  });

  it("uses Vivida's non-clinical orientation bands", () => {
    expect(rosenbergBand(14)).toBe("lower");
    expect(rosenbergBand(15)).toBe("middle");
    expect(rosenbergBand(25)).toBe("middle");
    expect(rosenbergBand(26)).toBe("higher");
  });

  it("rejects missing and invalid answers", () => {
    expect(() => calculateRosenberg({})).toThrow(/Missing Rosenberg answer/);
    expect(() => scoreRosenbergItem({ reverse: false }, 0)).toThrow(RangeError);
    expect(() => scoreRosenbergItem({ reverse: true }, 5)).toThrow(RangeError);
  });
});
