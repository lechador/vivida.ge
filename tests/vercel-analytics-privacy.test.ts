import { describe, expect, it } from "vitest";

import { redactVercelAnalyticsEvent } from "../lib/analytics/vercel-privacy";

describe("Vercel Analytics privacy", () => {
  it("removes query data and templates user-owned analytics paths", () => {
    expect(
      redactVercelAnalyticsEvent({
        type: "pageview",
        url: "https://www.vivida.ge/reports/private-id?token=secret#section",
      }),
    ).toEqual({
      type: "pageview",
      url: "https://www.vivida.ge/reports/[id]",
    });
  });

  it("drops all page views on token-bearing routes", () => {
    for (const path of [
      "/reset-password",
      "/unsubscribe",
      "/api/auth/verify-email",
    ]) {
      expect(
        redactVercelAnalyticsEvent({
          type: "pageview",
          url: `https://www.vivida.ge${path}?token=synthetic`,
        }),
      ).toBeNull();
    }
  });
});
