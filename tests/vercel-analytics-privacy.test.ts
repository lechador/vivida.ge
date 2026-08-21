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
});
