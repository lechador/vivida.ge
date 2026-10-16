"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, BellOff, Check, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { ANALYTICS_EVENT, trackEvent } from "@/lib/analytics";
import {
  clearPushPromptDismissal,
  PUSH_VALUE_MOMENT_EVENT,
  PWA_INSTALL_ACCEPTED_EVENT,
  PWA_VALUE_ACTION_EVENT,
  readPushPromptState,
  recordPushPromptDismissal,
} from "@/lib/push-prompt";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/** VAPID public key (base64url) → Uint8Array for pushManager.subscribe. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type State =
  | "loading"
  | "unsupported"
  | "unconfigured"
  | "denied"
  | "off"
  | "on"
  | "working";

const isIOS =
  typeof navigator !== "undefined" &&
  /iphone|ipad|ipod/i.test(navigator.userAgent);

/**
 * Web-push opt-in.
 *
 * `card`   — settings block on the Account page.
 * `banner` — compact dismissible prompt, event-driven. It appears when it is
 *            the natural moment to ask: after the user receives value, or right
 *            after they install the app.
 *
 * Dismissal is an escalating, expiring quiet period (see lib/push-prompt.ts),
 * never permanent.
 */
export function PushOptIn({
  variant = "card",
  locale = "ka",
}: {
  variant?: "card" | "banner";
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const [state, setState] = useState<State>("loading");
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const promptTracked = useRef(false);
  /** Mirrors `state` so event listeners can read the live value. */
  const stateRef = useRef<State>("loading");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof window !== "undefined") {
          // Expiring, escalating dismissal rather than a permanent flag.
          setDismissed(!readPushPromptState().canPrompt);
        }
      } catch {
        /* ignore */
      }
      const browserOk =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;
      if (!browserOk) {
        if (!cancelled) setState("unsupported");
        return;
      }
      // Browser can do push, but our public key isn't in the bundle (env not
      // set at build time), a config/deploy issue, not the user's browser.
      if (!VAPID) {
        if (!cancelled) setState("unconfigured");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setState("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        if (!cancelled) setState(sub ? "on" : "off");
      } catch {
        if (!cancelled) setState("off");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Show the banner, respecting the current quiet period. */
  const reveal = useCallback((reason: "install" | "value" | "surface") => {
    if (stateRef.current !== "off") return;
    if (reason === "install") clearPushPromptDismissal();
    else if (!readPushPromptState().canPrompt) return;

    setRevealed(true);
    setDismissed(false);
  }, []);

  /**
   * Show the prompt in response to a real value moment, or right after install.
   *
   * Push grows 13 subscriptions against 728 signups mostly because it is only
   * ever asked as a static banner, never at a moment when the user has just
   * received something. Installing the app is the strongest such moment, so a
   * previous dismissal is cleared there: the reason to want notifications is
   * concrete and new.
   *
   * Listeners read live state through `stateRef` and keep side effects out of
   * state updaters, so React's double-invocation cannot double-count a view.
   */
  useEffect(() => {
    if (variant !== "banner") return;
    const onEvent = (event: Event) => {
      const isInstall =
        event.type === "appinstalled" ||
        event.type === PWA_INSTALL_ACCEPTED_EVENT;
      reveal(isInstall ? "install" : "value");
    };

    window.addEventListener(PUSH_VALUE_MOMENT_EVENT, onEvent);
    window.addEventListener(PWA_VALUE_ACTION_EVENT, onEvent);
    window.addEventListener(PWA_INSTALL_ACCEPTED_EVENT, onEvent);
    window.addEventListener("appinstalled", onEvent);
    return () => {
      window.removeEventListener(PUSH_VALUE_MOMENT_EVENT, onEvent);
      window.removeEventListener(PWA_VALUE_ACTION_EVENT, onEvent);
      window.removeEventListener(PWA_INSTALL_ACCEPTED_EVENT, onEvent);
      window.removeEventListener("appinstalled", onEvent);
    };
  }, [variant, reveal]);

  /**
   * Report the view once the prompt is actually on screen.
   *
   * Derived rather than set from an effect, so React's double-invocation
   * cannot double-count an impression.
   */
  useEffect(() => {
    if (variant !== "banner") return;
    if (!revealed || dismissed || state !== "off" || promptTracked.current)
      return;
    promptTracked.current = true;
    trackEvent(ANALYTICS_EVENT.pushPromptViewed, {
      surface: variant,
      trigger: "event",
    });
  }, [variant, revealed, dismissed, state]);

  async function enable() {
    setError(null);
    setState("working");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        if (perm === "denied") {
          trackEvent(ANALYTICS_EVENT.pushPermissionDenied, {
            surface: variant,
          });
        }
        setState(perm === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          VAPID as string,
        ) as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) throw new Error("save failed");
      trackEvent(ANALYTICS_EVENT.pushEnabled, { surface: variant });
      setState("on");
    } catch {
      setError(
        en
          ? "Could not enable notifications. Please try again."
          : "ვერ ჩაირთო. სცადე ხელახლა.",
      );
      setState("off");
    }
  }

  async function disable() {
    setState("working");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } catch {
      setState("on");
    }
  }

  function dismiss() {
    // Escalating quiet period, so a "no" is respected but never permanent.
    recordPushPromptDismissal();
    trackEvent(ANALYTICS_EVENT.pushDismissed, { surface: variant });
    setDismissed(true);
  }

  // ── Banner ── only when it is the right moment, actionable, and not snoozed.
  if (variant === "banner") {
    if (!revealed || dismissed || state !== "off") return null;
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 to-[var(--vivida-cyan)]/8 p-4 ring-1 ring-foreground/5 backdrop-blur-xl">
        <Bell className="size-5 shrink-0 text-[var(--vivida-violet)]" />
        <p className="min-w-0 flex-1 text-sm text-foreground/90">
          {en
            ? "Enable notifications to receive your daily horoscope each morning."
            : "ჩართე შეტყობინებები, ყოველ დილით მიიღებ დღევანდელ ჰოროსკოპს."}
        </p>
        <Button type="button" variant="mystic" size="sm" onClick={enable}>
          {en ? "Enable" : "ჩართვა"}
        </Button>
        <button
          type="button"
          aria-label={en ? "Close" : "დახურვა"}
          onClick={dismiss}
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card/60 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  // ── Card (Account) ──
  return (
    <div className="rounded-2xl border border-border bg-card/65 p-5 ring-1 ring-foreground/5 backdrop-blur-xl">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)]">
          {state === "on" ? (
            <Bell className="size-5" />
          ) : (
            <BellOff className="size-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight">
            {en ? "Notifications" : "შეტყობინებები"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {state === "on"
              ? en
                ? "Enabled, your daily horoscope arrives each morning."
                : "ჩართულია, ყოველ დილით მიიღებ დღევანდელ ჰოროსკოპს."
              : en
                ? "Enable notifications to receive your daily horoscope on your phone each morning."
                : "ჩართე და ყოველ დილით მიიღებ დღევანდელ ჰოროსკოპს პირდაპირ ტელეფონზე."}
          </p>

          {state === "unsupported" && (
            <p className="mt-3 text-sm text-muted-foreground">
              {isIOS
                ? en
                  ? "On iPhone, add Vivida to your Home Screen first, open it there, then enable notifications."
                  : "iPhone-ზე ჯერ დაამატე Vivida მთავარ ეკრანზე (Share → „Add to Home Screen“), გახსენი იქიდან და შემდეგ ჩართე შეტყობინებები."
                : en
                  ? "Notifications are unavailable in this browser. Try Chrome."
                  : "ამ ბრაუზერში შეტყობინებები არ არის ხელმისაწვდომი. სცადე Chrome-ით."}
            </p>
          )}
          {state === "unconfigured" && (
            <p className="mt-3 text-sm text-muted-foreground">
              {en
                ? "Notifications are temporarily unavailable. Try again later."
                : "შეტყობინებები დროებით მიუწვდომელია. სცადე მოგვიანებით."}
            </p>
          )}
          {state === "denied" && (
            <p className="mt-3 text-sm text-[var(--vivida-pink)]">
              {en
                ? "Notifications are blocked in your browser. Enable them in browser settings."
                : "შეტყობინებები დაბლოკილია ბრაუზერში, ჩართე ბრაუზერის პარამეტრებიდან."}
            </p>
          )}

          {(state === "off" || state === "on" || state === "working") && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {state === "on" ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--vivida-violet)]/15 px-3 py-1.5 text-sm font-medium text-[var(--vivida-violet)]">
                    <Check className="size-4" /> {en ? "Enabled" : "ჩართულია"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={disable}
                  >
                    {en ? "Disable" : "გამორთვა"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => fetch("/api/push/test", { method: "POST" })}
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {en ? "Send test notification" : "სატესტო შეტყობინება"}
                  </button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="mystic"
                  onClick={enable}
                  disabled={state === "working"}
                >
                  {state === "working" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Bell className="size-4" />
                  )}
                  {en ? "Enable notifications" : "ჩართე შეტყობინებები"}
                </Button>
              )}
            </div>
          )}

          {error && (
            <p className="mt-2 text-sm text-[var(--vivida-pink)]">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
