"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";
import { fbTrack } from "@/lib/fb-pixel";
import { normalizeReturnPath } from "@/lib/safe-return-path";

export function CheckoutSuccessTracker({
  locale = "unknown",
}: {
  locale?: string;
} = {}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // W04: Stripe cancel_url returns here with ?status=canceled, the visible
    // failure counterpart to checkout_failed (user gave up at Stripe, nothing
    // was charged, safe to retry).
    if (searchParams.get("status") === "canceled") {
      trackEvent(ANALYTICS_EVENT.checkoutCancelReturn, {
        ...productEventBase(
          "billing",
          pathname.includes("subscription")
            ? "subscription_page"
            : "credits_page",
          locale,
        ),
        outcome: "canceled_at_stripe",
      });
      return;
    }
    if (searchParams.get("status") !== "success") return;
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;
    const rawNext = searchParams.get("next");
    const returnTo = rawNext ? normalizeReturnPath(rawNext) : null;
    const key = `vivida_checkout_tracked:${sessionId}`;
    if (sessionStorage.getItem(key)) {
      if (returnTo) router.replace(returnTo);
      return;
    }
    void fetch(
      `/api/billing/session?session_id=${encodeURIComponent(sessionId)}`,
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;
        // The server may have granted credits only in this reconciliation
        // request, after the page rendered its balance. Refresh before any
        // analytics/storage code can fail and leave that balance stale.
        router.refresh();
        const params = {
          value: data.value,
          currency: data.currency,
          content_ids: [data.contentId],
          content_type: "product",
        };
        fbTrack("Purchase", params, data.purchaseEventId);
        trackEvent(ANALYTICS_EVENT.checkoutSuccess, {
          product: data.contentId,
          purchase_context: data.purchaseContext,
          kind: data.kind,
          value: data.value,
          currency: data.currency,
        });
        trackEvent(ANALYTICS_EVENT.purchaseCompleted, {
          product: data.contentId,
          purchase_context: data.purchaseContext,
          value: data.value,
          currency: data.currency,
        });
        // W04: fires only after /api/billing/session confirms the server
        // granted the entitlement, this is the canonical "paid delivery
        // succeeded" signal, not the Stripe redirect alone.
        trackEvent(ANALYTICS_EVENT.entitlementActivated, {
          product: data.contentId,
          purchase_context: data.purchaseContext,
          kind: data.kind,
          value: data.value,
          currency: data.currency,
        });
        if (data.kind === "premium") {
          fbTrack("Subscribe", params, data.subscribeEventId);
          trackEvent(ANALYTICS_EVENT.subscriptionStarted, {
            product: data.contentId,
            value: data.value,
            currency: data.currency,
          });
        }
        sessionStorage.setItem(key, "1");
        if (returnTo) router.replace(returnTo);
      })
      .catch(() => undefined);
  }, [locale, pathname, router, searchParams]);

  return null;
}
