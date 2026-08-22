import { describe, expect, it } from "vitest";

import { APP_HOME, signedInLandingTarget } from "@/lib/landing-redirect";

const SESSION_COOKIE = "__Secure-authjs.session-token";

function target(
  overrides: Partial<Parameters<typeof signedInLandingTarget>[0]> = {},
) {
  return signedInLandingTarget({
    method: "GET",
    pathname: "/",
    searchParams: new URLSearchParams(),
    cookieNames: [SESSION_COOKIE],
    englishHost: false,
    ...overrides,
  });
}

describe("signedInLandingTarget", () => {
  it("sends a signed-in visitor from the bare domain into the app", () => {
    expect(target()).toBe(APP_HOME);
  });

  it("leaves the landing page alone for signed-out visitors", () => {
    expect(target({ cookieNames: [] })).toBeNull();
    expect(target({ cookieNames: ["vivida_lang", "_ga"] })).toBeNull();
  });

  it("recognizes the unprefixed and chunked session cookies", () => {
    expect(target({ cookieNames: ["authjs.session-token"] })).toBe(APP_HOME);
    expect(
      target({ cookieNames: [`${SESSION_COOKIE}.0`, `${SESSION_COOKIE}.1`] }),
    ).toBe(APP_HOME);
    // A callback/CSRF cookie exists for signed-out visitors mid-login too.
    expect(target({ cookieNames: ["authjs.callback-url"] })).toBeNull();
  });

  it("redirects the English landing on the international host", () => {
    expect(target({ englishHost: true })).toBe(APP_HOME);
  });

  it("redirects the Armenian landing only on the international host", () => {
    expect(target({ pathname: "/am", englishHost: true })).toBe(APP_HOME);
    expect(target({ pathname: "/am/", englishHost: true })).toBe(APP_HOME);
    // On vivida.ge /am is 308'd to the international domain first, so that the
    // reader keeps a non-Georgian interface.
    expect(target({ pathname: "/am", englishHost: false })).toBeNull();
  });

  it("never touches anything but the landing pages", () => {
    for (const pathname of [
      "/horoskopi",
      "/am/tarot",
      "/en",
      "/login",
      "/dashboard",
      "/ampersand",
    ]) {
      expect(target({ pathname, englishHost: true })).toBeNull();
    }
  });

  it("stands down on the bounce-back from a protected route", () => {
    // authConfig.authorized sends an unauthenticated visitor to `/?from=…`.
    // A cookie that no longer decodes would otherwise ping-pong forever.
    expect(
      target({ searchParams: new URLSearchParams("from=%2Fdashboard") }),
    ).toBeNull();
  });

  it("ignores non-GET requests", () => {
    expect(target({ method: "POST" })).toBeNull();
  });
});
