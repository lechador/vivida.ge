import { describe, expect, it } from "vitest";

import {
  sanitizeSentryEvent,
  sanitizeSentrySpan,
} from "../lib/privacy/sentry-privacy";

describe("Sentry token URL boundary", () => {
  it("drops events while on token pages or for token requests", () => {
    const event = { message: "ordinary error" };
    expect(
      sanitizeSentryEvent(
        event,
        "https://vivida.ge/reset-password?token=synthetic-token",
      ),
    ).toBeNull();
    expect(
      sanitizeSentryEvent({
        request: { url: "/unsubscribe?token=synthetic-token" },
      }),
    ).toBeNull();
    expect(
      sanitizeSentryEvent({
        transaction: "/api/auth/verify-email?token=synthetic-token",
      }),
    ).toBeNull();
  });

  it("scrubs prior token URLs retained in an ordinary-page event", () => {
    const event = {
      request: {
        url: "https://vivida.ge/report?next=ordinary",
        headers: {
          Referer:
            "https://vivida.ge/unsubscribe?token=synthetic-token&type=lead",
        },
      },
      breadcrumbs: [
        {
          message: "GET /reset-password?token=synthetic-token",
          data: {
            href: "https://vivida.ge/reset-password?token=synthetic-token",
          },
        },
      ],
      spans: [
        {
          data: {
            "http.url": "https://vivida.ge/unsubscribe?token=synthetic-token",
          },
        },
        { data: { href: "/reset-password#synthetic-token" } },
      ],
      exception: {
        values: [
          {
            stacktrace: {
              frames: [
                {
                  filename:
                    "https://vivida.ge/reset-password?token=synthetic-token",
                },
              ],
            },
          },
        ],
      },
      extra: { token: "synthetic-token" },
    };

    const sanitized = sanitizeSentryEvent(event, "https://vivida.ge/report");
    expect(sanitized).not.toBeNull();
    expect(JSON.stringify(sanitized)).not.toContain("synthetic-token");
    expect(sanitized?.request.headers.Referer).toBe(
      "https://vivida.ge/unsubscribe",
    );
    expect(sanitized?.breadcrumbs[0].message).toBe("GET /reset-password");
    expect(event.request.headers.Referer).toContain("synthetic-token");
  });

  it("scrubs child spans sent separately from transaction events", () => {
    const span = {
      description: "GET /reset-password?token=synthetic-token",
      data: {
        "http.url": "https://vivida.ge/unsubscribe?token=synthetic-token",
      },
    };
    const sanitized = sanitizeSentrySpan(span);
    expect(JSON.stringify(sanitized)).not.toContain("synthetic-token");
    expect(sanitized.description).toBe("GET /reset-password");
  });
});
