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
    params?: Record<string, unknown>,
  ) => {
    hits.push({ name, params });
  };
  return hits;
}

describe("trackEvent", () => {
  beforeEach(() => {
    (globalThis as { window?: unknown }).window = globalThis;
    (globalThis as { dispatchEvent?: unknown }).dispatchEvent = () => true;
    (globalThis as { document?: unknown }).document = {
      cookie: "vivida_tracking_consent=granted",
    };
    (globalThis as { location?: unknown }).location = { pathname: "/report" };
  });

  afterEach(() => {
    delete (globalThis as { gtag?: unknown }).gtag;
    delete (globalThis as { localStorage?: unknown }).localStorage;
    delete (globalThis as { window?: unknown }).window;
    delete (globalThis as { document?: unknown }).document;
    delete (globalThis as { location?: unknown }).location;
    delete (globalThis as { dispatchEvent?: unknown }).dispatchEvent;
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
      false,
    );
  });

  it("stops events immediately after consent is revoked", () => {
    const hits = installGtag();
    expect(trackEvent(ANALYTICS_EVENT.signUpSubmitted)).toBe(true);
    (globalThis as { document: { cookie: string } }).document.cookie =
      "vivida_tracking_consent=denied";
    expect(trackEvent(ANALYTICS_EVENT.signUpSubmitted)).toBe(false);
    expect(hits).toHaveLength(1);
  });

  it("keeps the first-party PWA value signal when consent is denied", () => {
    const signals: string[] = [];
    (globalThis as { dispatchEvent: (event: Event) => boolean }).dispatchEvent =
      (event) => {
        signals.push(event.type);
        return true;
      };
    const hits = installGtag();
    (globalThis as { document: { cookie: string } }).document.cookie =
      "vivida_tracking_consent=denied";
    expect(trackEvent(ANALYTICS_EVENT.testCompleted)).toBe(false);
    expect(signals).toEqual(["vivida:pwa-value-action"]);
    expect(hits).toEqual([]);
  });

  it("identifies only the completed action in the local PWA signal even without analytics consent", () => {
    const dispatch = vi.fn((event: Event) => Boolean(event));
    (globalThis as { dispatchEvent: (event: Event) => boolean }).dispatchEvent =
      dispatch;
    (globalThis as { document: { cookie: string } }).document.cookie =
      "vivida_tracking_consent=denied";
    trackEvent(ANALYTICS_EVENT.dailyHoroscopeRead, { date: "2026-10-04" });
    const event = dispatch.mock.calls[0]?.[0] as unknown as CustomEvent;
    expect(event.type).toBe("vivida:pwa-value-action");
    expect(event.detail).toEqual({ action: "daily_horoscope_read" });
  });

  it("never sends GA4 events from a token route despite existing consent and gtag", () => {
    const hits = installGtag();
    (globalThis as { location: { pathname: string } }).location.pathname =
      "/reset-password";
    expect(trackEvent(ANALYTICS_EVENT.signUpSubmitted)).toBe(false);
    expect(hits).toEqual([]);
  });

  it("tracks experiment assignments with stable experiment and variant fields", () => {
    const hits = installGtag();
    expect(
      trackExperimentAssignment("signup_credits_v1", "staged", {
        eligibility: "new_user",
      }),
    ).toBe(true);
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
