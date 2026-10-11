import { describe, expect, it } from "vitest";

import {
  ENGLISH_CSP_REPORT_ONLY,
  X_FRAME_OPTIONS,
  englishCspHeaderName,
  englishCspPolicy,
  englishSecurityHeaders,
} from "@/lib/security-headers";

describe("englishSecurityHeaders", () => {
  it("denies inbound framing outright", () => {
    expect(X_FRAME_OPTIONS).toBe("DENY");
    const headers = Object.fromEntries(
      englishSecurityHeaders().map((h) => [h.key, h.value]),
    );
    expect(headers["X-Frame-Options"]).toBe("DENY");
  });

  it("ships the CSP report-only until validated", () => {
    expect(ENGLISH_CSP_REPORT_ONLY).toBe(true);
    expect(englishCspHeaderName()).toBe("Content-Security-Policy-Report-Only");
  });

  it("allows the Privy embedded-wallet iframe and API", () => {
    const policy = englishCspPolicy();
    expect(policy).toContain("frame-src https://auth.privy.io");
    expect(policy).toContain("child-src https://auth.privy.io");
    expect(policy).toContain("connect-src 'self' https://auth.privy.io");
    expect(policy).toContain("https://*.rpc.privy.systems");
  });

  it("covers the app's own payment-flow sources", () => {
    const policy = englishCspPolicy();
    // Solana cluster reads from the payment dialog.
    expect(policy).toContain("https://api.mainnet-beta.solana.com");
    // Turnstile widget on auth surfaces.
    expect(policy).toContain("https://challenges.cloudflare.com");
    // Consent-gated analytics.
    expect(policy).toContain("https://www.googletagmanager.com");
    expect(policy).toContain("https://connect.facebook.net");
  });

  it("keeps script-src strict (no unsafe-inline)", () => {
    const scriptSrc = englishCspPolicy()
      .split("; ")
      .find((directive) => directive.startsWith("script-src "));
    expect(scriptSrc).toBeDefined();
    expect(scriptSrc).not.toContain("unsafe-inline");
  });

  it("emits a single-line header value", () => {
    const policy = englishCspPolicy();
    expect(policy).not.toContain("\n");
    expect(policy.length).toBeGreaterThan(200);
  });
});
