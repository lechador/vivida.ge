import { describe, expect, it } from "vitest";

import { parseSentrySampleRate } from "../lib/sentry-config";

describe("parseSentrySampleRate", () => {
  it("accepts the inclusive Sentry sampling range", () => {
    expect(parseSentrySampleRate("0")).toBe(0);
    expect(parseSentrySampleRate("0.25")).toBe(0.25);
    expect(parseSentrySampleRate("1")).toBe(1);
  });

  it("falls back for missing or invalid deployment values", () => {
    expect(parseSentrySampleRate(undefined)).toBe(0.1);
    expect(parseSentrySampleRate(" ")).toBe(0.1);
    expect(parseSentrySampleRate("not-a-number")).toBe(0.1);
    expect(parseSentrySampleRate("-0.1")).toBe(0.1);
    expect(parseSentrySampleRate("1.1")).toBe(0.1);
  });
});
