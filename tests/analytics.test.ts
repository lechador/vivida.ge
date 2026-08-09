import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trackEvent } from "../lib/analytics";

type Hit = { name: string; params?: Record<string, unknown> };

function installGtag(): Hit[] {
  const hits: Hit[] = [];
  (globalThis as { gtag?: unknown }).gtag = (
    _cmd: string,
    name: string,
    params?: Record<string, unknown>
  ) => {
    hits.push({ name, params });
  };
  return hits;
}

describe("trackEvent", () => {
  beforeEach(() => {
    (globalThis as { window?: unknown }).window = globalThis;
  });

  afterEach(() => {
    delete (globalThis as { gtag?: unknown }).gtag;
    delete (globalThis as { window?: unknown }).window;
  });

  it("passes ordinary params through untouched", () => {
    const hits = installGtag();
    trackEvent("test_completed", { test: "iq", items: 20 });
    expect(hits).toEqual([
      { name: "test_completed", params: { test: "iq", items: 20 } },
    ]);
  });

  it("drops GA4 reserved campaign params that would rewrite session attribution", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const hits = installGtag();
    // The exact shape that put ~150 sessions/2wk into "Unassigned" as
    // `natal_calculator / (not set)`.
    trackEvent("natal_chart_computed", {
      source: "natal_calculator",
      medium: "widget",
      campaign: "launch",
      campaign_id: "1",
      term: "t",
      content: "c",
      source_platform: "sp",
      creative_format: "cf",
      marketing_tactic: "mt",
      widget: "natal_calculator",
    });
    expect(hits).toEqual([
      { name: "natal_chart_computed", params: { widget: "natal_calculator" } },
    ]);
  });

  it("is a no-op when gtag is not loaded", () => {
    expect(() => trackEvent("register_click", { widget: "x" })).not.toThrow();
  });
});
