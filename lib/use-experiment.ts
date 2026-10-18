"use client";

import { useState } from "react";

export function useExperiment(
  _experiment: string,
  _surface: string = "default",
): string | null {
  const [variant] = useState<string | null>("control");
  return variant;
}

export async function trackExperimentOutcome(
  _experiment: string,
  _eventName: string,
  _surface: string = "default",
  _eventKey?: string,
): Promise<void> {}
