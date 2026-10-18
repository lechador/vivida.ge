const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

/**
 * Sentry expects a finite value between 0 and 1. Falling back here keeps a
 * mistyped deployment variable from disabling the whole monitoring SDK.
 */
export function parseSentrySampleRate(value: string | undefined): number {
  if (value === undefined || value.trim() === "") {
    return DEFAULT_TRACES_SAMPLE_RATE;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
    ? parsed
    : DEFAULT_TRACES_SAMPLE_RATE;
}
