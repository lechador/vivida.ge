"use client";

/**
 * Thin, safe wrapper over the GA4 `gtag` that @next/third-parties installs in
 * production (see app/layout.tsx — GA is gated to NODE_ENV=production). When
 * gtag isn't loaded (dev / preview) this is a no-op, so call sites never have
 * to guard. Use for conversion events on the public acquisition funnel
 * (chart computed → email subscribed → register clicked), which — unlike raw
 * bounce rate — actually tell you whether the free tools convert.
 */
export type GtagParams = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * Canonical product-event names. Keep these stable: GA4 explorations,
 * audiences, and retention cohorts depend on the exact strings.
 *
 * Event payloads must stay aggregate and non-identifying. Never send email,
 * names, user IDs, birth dates/times, city names, free-text questions, or
 * profile content through this client analytics layer.
 */
export const ANALYTICS_EVENT = {
  homePrimaryCtaClick: "home_primary_cta_click",
  compatibilityCheckCompleted: "compatibility_check_completed",
  compatibilityShare: "compatibility_share",
  natalChartComputed: "natal_chart_computed",
  natalChartShared: "natal_chart_shared",
  horoscopeEmailSubscribed: "horoscope_email_subscribed",
  registerClick: "register_click",
  signUpGoogleClick: "sign_up_google_click",
  signUpSubmitted: "sign_up_submitted",
  signUpVerified: "sign_up_verified",
  onboardingStarted: "onboarding_started",
  onboardingStepViewed: "onboarding_step_viewed",
  onboardingStepCompleted: "onboarding_step_completed",
  onboardingPrefilled: "onboarding_prefilled",
  onboardingSubmitted: "onboarding_submitted",
  publicHoroscopeRead: "public_horoscope_read",
  dailyHoroscopeViewed: "daily_horoscope_viewed",
  dailyHoroscopeRead: "daily_horoscope_read",
  dailyFocusSelected: "daily_focus_selected",
  dailyRitualCompleted: "daily_ritual_completed",
  pushPromptViewed: "push_prompt_viewed",
  pushEnabled: "push_enabled",
  pushDismissed: "push_dismissed",
  pushPermissionDenied: "push_permission_denied",
  tarotLoginRequired: "tarot_login_required",
  tarotCreditsShort: "tarot_credits_short",
  tarotReadingCompleted: "tarot_reading_completed",
  testCompleted: "test_completed",
  firstResultViewed: "first_result_viewed",
  recommendationClicked: "recommendation_clicked",
  paywallViewed: "paywall_viewed",
  productSelected: "product_selected",
  insufficientCredits: "insufficient_credits",
  creditUnlock: "credit_unlock",
  proExposure: "pro_exposure",
  experimentAssigned: "experiment_assigned",
  checkoutStarted: "checkout_started",
  checkoutSuccess: "checkout_success",
  purchaseCompleted: "purchase_completed",
  subscriptionStarted: "subscription_started",
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENT)[keyof typeof ANALYTICS_EVENT];

/**
 * Events that prove a user received or created product value. `trackEvent`
 * mirrors these as one normalized `value_action` event, making the north-star
 * "valuable sessions" metric easy to build without a brittle GA4 OR-list.
 */
const VALUE_ACTION_EVENTS = new Set<AnalyticsEventName>([
  ANALYTICS_EVENT.compatibilityCheckCompleted,
  ANALYTICS_EVENT.natalChartComputed,
  ANALYTICS_EVENT.publicHoroscopeRead,
  ANALYTICS_EVENT.dailyHoroscopeRead,
  ANALYTICS_EVENT.tarotReadingCompleted,
  ANALYTICS_EVENT.testCompleted,
]);

/**
 * GA4 reserves these event-parameter names for campaign attribution. Sending
 * one on an ordinary event silently rewrites the session's source/medium — a
 * `{ source: "natal_calculator" }` param is what put ~150 sessions/2wk into the
 * "Unassigned" channel as `natal_calculator / (not set)`. Describe where an
 * event came from with a neutral key (`widget`, `test`, `method`) instead.
 */
const RESERVED_CAMPAIGN_PARAMS = new Set([
  "source",
  "medium",
  "campaign",
  "campaign_id",
  "term",
  "content",
  "source_platform",
  "creative_format",
  "marketing_tactic",
]);

function stripCampaignParams(params: GtagParams): GtagParams {
  const safe: GtagParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (RESERVED_CAMPAIGN_PARAMS.has(key)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[analytics] dropped reserved GA4 campaign param "${key}" — it would overwrite session attribution. Rename it (e.g. "widget").`
        );
      }
      continue;
    }
    safe[key] = value;
  }
  return safe;
}

export function trackEvent(
  name: AnalyticsEventName,
  params?: GtagParams
): boolean {
  if (typeof window === "undefined") return false;
  const gtag = (
    window as unknown as {
      gtag?: (command: string, eventName: string, params?: GtagParams) => void;
    }
  ).gtag;
  if (typeof gtag !== "function") return false;
  try {
    const safeParams = params && stripCampaignParams(params);
    gtag("event", name, safeParams);
    if (VALUE_ACTION_EVENTS.has(name)) {
      gtag("event", "value_action", {
        ...safeParams,
        action: name,
      });
    }
    return true;
  } catch {
    /* analytics must never break the app */
    return false;
  }
}

const FIRST_RESULT_STORAGE_KEY = "vivida_analytics:first_result_viewed:v1";

/**
 * Records the first completed result seen in this browser. The marker is only
 * written after GA4 accepted the event, so users who grant analytics consent
 * later are not silently excluded. Storage failures fall back to once per page
 * load without ever blocking the product experience.
 */
let firstResultTrackedInMemory = false;
export function trackFirstResultViewed(params: GtagParams): void {
  if (typeof window === "undefined" || firstResultTrackedInMemory) return;
  try {
    if (window.localStorage.getItem(FIRST_RESULT_STORAGE_KEY)) {
      firstResultTrackedInMemory = true;
      return;
    }
  } catch {
    /* private browsing / disabled storage — use the in-memory guard */
  }

  if (!trackEvent(ANALYTICS_EVENT.firstResultViewed, params)) return;
  firstResultTrackedInMemory = true;
  try {
    window.localStorage.setItem(FIRST_RESULT_STORAGE_KEY, "1");
  } catch {
    /* the event was delivered; persistence is best-effort */
  }
}

/** Stable, low-cardinality wallet segments for paywall analysis. */
export function creditBalanceBucket(balance: number): string {
  if (balance <= 0) return "zero";
  if (balance <= 5) return "1_5";
  if (balance <= 20) return "6_20";
  return "21_plus";
}

/**
 * Experiment owners call this exactly when a visitor is assigned. Assignment
 * and exposure are deliberately separate: a variant can be assigned before
 * its UI is actually rendered.
 */
export function trackExperimentAssignment(
  experiment: string,
  variant: string,
  params?: GtagParams
): boolean {
  return trackEvent(ANALYTICS_EVENT.experimentAssigned, {
    ...params,
    experiment,
    variant,
  });
}
