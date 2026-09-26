/**
 * GA4 DebugView is enabled only for an explicit local developer session.
 * Browser-side origin validation prevents a flag set on a deployed host from
 * turning ordinary production traffic into debug traffic.
 */
export function isLoopbackOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname;
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]"
    );
  } catch {
    return false;
  }
}

export function localAnalyticsDebugAllowed(
  debugRequested: boolean,
  origin: string,
): boolean {
  return debugRequested && isLoopbackOrigin(origin);
}

/** The server must reject all Vercel deployments before the client can opt in. */
export function localAnalyticsDebugRequested(
  vercel: string | undefined,
  debugMode: string | undefined,
): boolean {
  return vercel !== "1" && debugMode === "1";
}

export function gaTrackingAllowed({
  trackingEnabled,
  debugRequested,
  origin,
  consentGranted,
  sensitivePath,
}: {
  trackingEnabled: boolean;
  debugRequested: boolean;
  origin: string;
  consentGranted: boolean;
  sensitivePath: boolean;
}): boolean {
  return (
    consentGranted &&
    !sensitivePath &&
    (trackingEnabled || localAnalyticsDebugAllowed(debugRequested, origin))
  );
}
