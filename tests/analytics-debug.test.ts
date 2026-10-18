import { describe, expect, it } from "vitest";

import {
  gaTrackingAllowed,
  isLoopbackOrigin,
  localAnalyticsDebugAllowed,
  localAnalyticsDebugRequested,
} from "../lib/analytics-debug";

describe("local analytics debug guard", () => {
  it("allows an explicit debug request only from a loopback origin", () => {
    expect(localAnalyticsDebugAllowed(true, "http://localhost:3000")).toBe(
      true,
    );
    expect(localAnalyticsDebugAllowed(true, "http://127.0.0.1:3000")).toBe(
      true,
    );
    expect(localAnalyticsDebugAllowed(true, "http://[::1]:3000")).toBe(true);
  });

  it("rejects deployed origins, missing opt-in, and malformed origins", () => {
    expect(localAnalyticsDebugAllowed(true, "https://www.vivida.ge")).toBe(
      false,
    );
    expect(localAnalyticsDebugAllowed(false, "http://localhost:3000")).toBe(
      false,
    );
    expect(isLoopbackOrigin("not an origin")).toBe(false);
  });

  it("rejects every Vercel deployment before browser-origin validation", () => {
    expect(localAnalyticsDebugRequested("1", "1")).toBe(false);
    expect(localAnalyticsDebugRequested(undefined, "1")).toBe(true);
    expect(localAnalyticsDebugRequested(undefined, undefined)).toBe(false);
  });

  it("keeps GA off without consent or on sensitive routes", () => {
    const localDebug = {
      trackingEnabled: false,
      debugRequested: true,
      origin: "http://localhost:3000",
    };
    expect(
      gaTrackingAllowed({
        ...localDebug,
        consentGranted: false,
        sensitivePath: false,
      }),
    ).toBe(false);
    expect(
      gaTrackingAllowed({
        ...localDebug,
        consentGranted: true,
        sensitivePath: true,
      }),
    ).toBe(false);
    expect(
      gaTrackingAllowed({
        ...localDebug,
        consentGranted: true,
        sensitivePath: false,
      }),
    ).toBe(true);
  });
});
