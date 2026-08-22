import { describe, expect, it } from "vitest";

import {
  chartStarterOptions,
  chartStarterText,
  normalizeChartStarter,
} from "@/lib/chart-chat-starters";

describe("chart chat starters", () => {
  it("only accepts known starter IDs from the URL", () => {
    expect(normalizeChartStarter("strengths")).toBe("strengths");
    expect(normalizeChartStarter("relationships")).toBe("relationships");
    expect(normalizeChartStarter("send-this-without-consent")).toBeUndefined();
    expect(normalizeChartStarter(undefined)).toBeUndefined();
  });

  it("provides localized, stable options", () => {
    expect(chartStarterOptions("en")).toHaveLength(4);
    expect(chartStarterText("emotions", "ka")).toContain("მთვარე");
    expect(chartStarterText("emotions", "am")).toContain("Լուսին");
  });
});
