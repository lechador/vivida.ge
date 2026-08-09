import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ANALYTICS_EVENT, trackEvent } from "../lib/analytics";

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
    trackEvent(ANALYTICS_EVENT.testCompleted, { test: "iq", items: 20 });
    expect(hits).toEqual([
      { name: "test_completed", params: { test: "iq", items: 20 } },
      {
        name: "value_action",
        params: { action: "test_completed", test: "iq", items: 20 },
      },
    ]);
  });

  it("does not mirror non-value funnel events as value actions", () => {
    const hits = installGtag();
    trackEvent(ANALYTICS_EVENT.signUpSubmitted, { method: "email" });
    expect(hits).toEqual([
      { name: "sign_up_submitted", params: { method: "email" } },
    ]);
  });

  it("counts a completed daily ritual as a value action", () => {
    const hits = installGtag();
    trackEvent(ANALYTICS_EVENT.dailyRitualCompleted, {
      date: "2026-08-09",
      total_steps: 3,
    });
    expect(hits).toEqual([
      {
        name: "daily_ritual_completed",
        params: { date: "2026-08-09", total_steps: 3 },
      },
      {
        name: "value_action",
        params: {
          action: "daily_ritual_completed",
          date: "2026-08-09",
          total_steps: 3,
        },
      },
    ]);
  });

  it("drops GA4 reserved campaign params that would rewrite session attribution", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const hits = installGtag();
    // The exact shape that put ~150 sessions/2wk into "Unassigned" as
    // `natal_calculator / (not set)`.
    trackEvent(ANALYTICS_EVENT.natalChartComputed, {
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
      {
        name: "value_action",
        params: {
          action: "natal_chart_computed",
          widget: "natal_calculator",
        },
      },
    ]);
  });

  it("is a no-op when gtag is not loaded", () => {
    expect(() =>
      trackEvent(ANALYTICS_EVENT.registerClick, { widget: "x" })
    ).not.toThrow();
  });
});
