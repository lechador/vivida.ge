import { describe, expect, it } from "vitest";
import * as ritual from "@/lib/daily-ritual";

const policy = (
  ritual as typeof ritual & {
    canPromptAfterDailyValue?: (
      pendingRitual: boolean,
      completedAction: boolean,
    ) => boolean;
  }
).canPromptAfterDailyValue;

describe("value prompts around the daily ritual", () => {
  it("does not cover a pending focus choice just because the summary was read", () => {
    expect(policy).toBeTypeOf("function");
    expect(policy?.(true, false)).toBe(false);
  });
  it("allows an install suggestion after confirmed daily completion", () => {
    expect(policy).toBeTypeOf("function");
    expect(policy?.(true, true)).toBe(true);
  });
  it("keeps value-triggered prompts unchanged on other surfaces", () => {
    expect(policy).toBeTypeOf("function");
    expect(policy?.(false, false)).toBe(true);
  });
  it("does not suppress a suggestion once today's ritual is already complete", () => {
    expect(policy).toBeTypeOf("function");
    expect(policy?.(false, true)).toBe(true);
  });
});
