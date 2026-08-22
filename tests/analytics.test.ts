import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ANALYTICS_EVENT,
  creditBalanceBucket,
  trackEvent,
  trackExperimentAssignment,
  trackFirstResultViewed,
} from "../lib/analytics";

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
    delete (globalThis as { localStorage?: unknown }).localStorage;
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
    expect(trackEvent(ANALYTICS_EVENT.registerClick, { widget: "x" })).toBe(
      false
    );
  });

  it("tracks experiment assignments with stable experiment and variant fields", () => {
    const hits = installGtag();
    expect(trackExperimentAssignment("signup_credits_v1", "staged", {
      eligibility: "new_user",
    })).toBe(true);
    expect(hits).toEqual([
      {
        name: "experiment_assigned",
        params: {
          experiment: "signup_credits_v1",
          variant: "staged",
          eligibility: "new_user",
        },
      },
    ]);
  });

  it("uses low-cardinality credit balance buckets", () => {
    expect([-1, 0, 1, 5, 6, 20, 21, 200].map(creditBalanceBucket)).toEqual([
      "zero",
      "zero",
      "1_5",
      "1_5",
      "6_20",
      "6_20",
      "21_plus",
      "21_plus",
    ]);
  });

  it("records the first result once and persists the browser marker", () => {
    const hits = installGtag();
    const values = new Map<string, string>();
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    trackFirstResultViewed({ product: "natal_chart", surface: "calculator" });
    trackFirstResultViewed({ product: "tarot", surface: "tarot_reader" });

    expect(hits).toEqual([
      {
        name: "first_result_viewed",
        params: { product: "natal_chart", surface: "calculator" },
      },
    ]);
    expect([...values.values()]).toEqual(["1"]);
  });
});
