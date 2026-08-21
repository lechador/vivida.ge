"use client";

import { Analytics } from "@vercel/analytics/next";
import { redactVercelAnalyticsEvent } from "@/lib/analytics/vercel-privacy";

export function VercelObservability() {
  return (
    <Analytics beforeSend={redactVercelAnalyticsEvent} />
  );
}
