import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";

import {
  isSensitiveTokenUrl,
  isSensitiveTrackingLocation,
} from "../lib/privacy/sensitive-routes";
import { SENSITIVE_NAVIGATION_GUARD_SCRIPT } from "../lib/privacy/sensitive-navigation-script";

describe("token route boundary", () => {
  it("recognizes only first-party token action paths", () => {
    expect(
      isSensitiveTokenUrl(
        "/reset-password?token=synthetic",
        "https://vivida.ge",
      ),
    ).toBe(true);
    expect(
      isSensitiveTokenUrl("/unsubscribe?token=synthetic", "https://vivida.ge"),
    ).toBe(true);
    expect(
      isSensitiveTokenUrl(
        "/api/auth/verify-email?token=synthetic",
        "https://vivida.ge",
      ),
    ).toBe(true);
    expect(
      isSensitiveTokenUrl("/unsubscribe/?token=synthetic", "https://vivida.ge"),
    ).toBe(true);
    expect(
      isSensitiveTokenUrl("/report?token=synthetic", "https://vivida.ge"),
    ).toBe(false);
  });

  it("keeps trackers off while rendered and document paths disagree across a boundary", () => {
    expect(isSensitiveTrackingLocation("/login", "/reset-password")).toBe(true);
    expect(isSensitiveTrackingLocation("/unsubscribe", "/report")).toBe(true);
    expect(isSensitiveTrackingLocation("/login", "/report")).toBe(false);
  });

  it("forces a new document before Next can update history into a token page", () => {
    const navigations: string[] = [];
    const historyCalls: string[] = [];
    const context = {
      URL,
      document: { addEventListener: () => undefined },
      window: {
        location: {
          href: "https://vivida.ge/report",
          assign: (url: string) => navigations.push(url),
          replace: (url: string) => navigations.push(url),
        },
      },
      history: {
        pushState: (...args: unknown[]) => {
          void args;
          historyCalls.push("push");
        },
        replaceState: (...args: unknown[]) => {
          void args;
          historyCalls.push("replace");
        },
      },
    };
    runInNewContext(SENSITIVE_NAVIGATION_GUARD_SCRIPT, context);
    context.history.pushState({}, "", "/reset-password?token=synthetic");
    context.history.replaceState({}, "", "/unsubscribe?token=synthetic");
    context.history.pushState({}, "", "/report");
    expect(navigations).toEqual([
      "https://vivida.ge/reset-password?token=synthetic",
      "https://vivida.ge/unsubscribe?token=synthetic",
    ]);
    expect(historyCalls).toEqual(["push"]);
  });

  it("intercepts a Next Link click in capture phase", () => {
    let listener: ((event: Record<string, unknown>) => void) | undefined;
    let capture = false;
    const navigations: string[] = [];
    runInNewContext(SENSITIVE_NAVIGATION_GUARD_SCRIPT, {
      URL,
      document: {
        addEventListener: (
          _name: string,
          callback: typeof listener,
          useCapture: boolean,
        ) => {
          listener = callback;
          capture = useCapture;
        },
      },
      window: {
        location: {
          href: "https://vivida.ge/report",
          assign: (url: string) => navigations.push(url),
        },
      },
      history: { pushState: () => undefined, replaceState: () => undefined },
    });
    const actions: string[] = [];
    listener?.({
      button: 0,
      target: {
        closest: () => ({
          href: "https://vivida.ge/unsubscribe?token=synthetic",
          target: "",
          hasAttribute: () => false,
        }),
      },
      preventDefault: () => actions.push("prevent"),
      stopImmediatePropagation: () => actions.push("stop"),
    });
    expect(capture).toBe(true);
    expect(actions).toEqual(["prevent", "stop"]);
    expect(navigations).toEqual([
      "https://vivida.ge/unsubscribe?token=synthetic",
    ]);
  });

  it("uses a new document when leaving a token page, so Back returns to its clean document", () => {
    const navigations: string[] = [];
    const historyCalls: string[] = [];
    let clickListener: ((event: Record<string, unknown>) => void) | undefined;
    const context = {
      URL,
      document: {
        addEventListener: (_name: string, callback: typeof clickListener) => {
          clickListener = callback;
        },
      },
      window: {
        location: {
          href: "https://vivida.ge/reset-password?token=synthetic",
          assign: (url: string) => navigations.push(url),
          replace: (url: string) => navigations.push(url),
        },
      },
      history: {
        pushState: (...args: unknown[]) => {
          void args;
          historyCalls.push("push");
        },
        replaceState: (...args: unknown[]) => {
          void args;
          historyCalls.push("replace");
        },
      },
    };
    runInNewContext(SENSITIVE_NAVIGATION_GUARD_SCRIPT, context);
    context.history.pushState({}, "", "/report");
    context.history.replaceState({}, "", "/login");
    const clickActions: string[] = [];
    clickListener?.({
      button: 0,
      target: {
        closest: () => ({
          href: "https://vivida.ge/account",
          target: "",
          hasAttribute: () => false,
        }),
      },
      preventDefault: () => clickActions.push("prevent"),
      stopImmediatePropagation: () => clickActions.push("stop"),
    });
    expect(navigations).toEqual([
      "https://vivida.ge/report",
      "https://vivida.ge/login",
      "https://vivida.ge/account",
    ]);
    expect(historyCalls).toEqual([]);
    expect(clickActions).toEqual(["prevent", "stop"]);
  });
});
