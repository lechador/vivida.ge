"use client";

import { useEffect, useState } from "react";

import type { ExperimentName } from "@/lib/experiment-catalog";

export function useExperiment(experiment: ExperimentName, surface: string): string | null {
  const [variant, setVariant] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/experiments/${experiment}?surface=${encodeURIComponent(surface)}`, {
      credentials: "same-origin",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) return;
      const body = await response.json() as { variant?: unknown };
      if (typeof body.variant === "string") setVariant(body.variant);
    }).catch(() => undefined);
    return () => controller.abort();
  }, [experiment, surface]);
  return variant;
}

export function trackExperimentOutcome(
  experiment: ExperimentName,
  surface: string,
  eventName: string,
  eventKey = crypto.randomUUID(),
): void {
  void fetch(`/api/experiments/${experiment}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ eventName, surface, eventKey }),
    keepalive: true,
  }).catch(() => undefined);
}
