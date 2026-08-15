"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import { fbTrack } from "@/lib/fb-pixel";

export function CheckoutSuccessTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("status") !== "success") return;
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;
    const key = `vivida_checkout_tracked:${sessionId}`;
    if (sessionStorage.getItem(key)) return;
    void fetch(`/api/billing/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data) return;
        const params = { value: data.value, currency: data.currency, content_ids: [data.contentId], content_type: "product" };
        fbTrack("Purchase", params, data.purchaseEventId);
        trackEvent(ANALYTICS_EVENT.purchaseCompleted, { product: data.contentId, value: data.value, currency: data.currency });
        if (data.kind === "premium") {
          fbTrack("Subscribe", params, data.subscribeEventId);
          trackEvent(ANALYTICS_EVENT.subscriptionStarted, { product: data.contentId, value: data.value, currency: data.currency });
        }
        sessionStorage.setItem(key, "1");
      })
      .catch(() => undefined);
  }, [searchParams]);

  return null;
}
