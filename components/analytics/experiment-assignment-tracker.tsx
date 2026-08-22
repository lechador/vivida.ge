"use client";

import { useEffect } from "react";

import { trackExperimentAssignment } from "@/lib/analytics";

export function ExperimentAssignmentTracker({
  experiment,
  variant,
  eligibility,
}: {
  experiment: string;
  variant: string;
  eligibility: string;
}) {
  useEffect(() => {
    const key = `vivida_analytics:experiment:${experiment}:${variant}`;
    try {
      if (window.localStorage.getItem(key)) return;
    } catch {
      // Analytics remains best-effort when storage is unavailable.
    }

    if (!trackExperimentAssignment(experiment, variant, { eligibility })) return;
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      // The assignment is durable in Postgres; this marker only deduplicates GA.
    }
  }, [eligibility, experiment, variant]);

  return null;
}
