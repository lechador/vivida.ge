"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { AttributionCapture } from "@/components/marketing/attribution-capture";
import { FbPixel } from "@/components/fb-pixel";
import { Button } from "@/components/ui/button";
import { VercelObservability } from "@/components/vercel-observability";
import {
  TRACKING_CONSENT_COOKIE,
  TRACKING_CONSENT_MAX_AGE_SECONDS,
  browserTrackingConsent,
  type TrackingConsent,
} from "@/lib/tracking-consent";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { isSensitiveTrackingLocation } from "@/lib/privacy/sensitive-routes";
import {
  gaTrackingAllowed,
  localAnalyticsDebugAllowed,
} from "@/lib/analytics-debug";

function clearMarketingCookies() {
  const names = document.cookie
    .split(";")
    .map((item) => item.trim().split("=", 1)[0])
    .filter(
      (name) =>
        name === "_fbp" ||
        name === "_fbc" ||
        name === "vivida_attribution" ||
        name === "_gid" ||
        name === "_gat" ||
        name.startsWith("_ga"),
    );
  const hostname = window.location.hostname;
  for (const name of names) {
    document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
    document.cookie = `${name}=; path=/; domain=${hostname}; max-age=0; samesite=lax`;
    if (hostname.split(".").length > 2) {
      const parent = `.${hostname.split(".").slice(-2).join(".")}`;
      document.cookie = `${name}=; path=/; domain=${parent}; max-age=0; samesite=lax`;
    }
  }
}

export function TrackingConsentManager({
  gaId,
  fbPixelId,
  trackingEnabled,
  debugModeRequested = false,
  locale = "ka",
}: {
  gaId?: string;
  fbPixelId?: string;
  trackingEnabled: boolean;
  /** Server-only opt-in; it still requires a loopback browser origin. */
  debugModeRequested?: boolean;
  locale?: UserLocale;
}) {
  const [consent, setConsent] = useState<TrackingConsent>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  // During a router transition the rendered pathname can move ahead of the
  // document URL. Keep trackers off until the full-document guard takes over.
  const sensitivePath = isSensitiveTrackingLocation(
    pathname ?? "",
    typeof window === "undefined" ? "" : window.location.pathname,
  );
  const localDebugMode = localAnalyticsDebugAllowed(
    debugModeRequested,
    typeof window === "undefined" ? "" : window.location.origin,
  );
  const productionTrackingAllowed =
    trackingEnabled && consent === "granted" && !sensitivePath;
  const gaTrackingIsAllowed = gaTrackingAllowed({
    trackingEnabled,
    debugRequested: debugModeRequested,
    origin: typeof window === "undefined" ? "" : window.location.origin,
    consentGranted: consent === "granted",
    sensitivePath,
  });
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setConsent(browserTrackingConsent());
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function choose(next: Exclude<TrackingConsent, null>) {
    const hadLoadedTrackers = gaTrackingIsAllowed;
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${TRACKING_CONSENT_COOKIE}=${next}; path=/; max-age=${TRACKING_CONSENT_MAX_AGE_SECONDS}; samesite=lax${secure}`;
    if (next === "denied") clearMarketingCookies();
    setConsent(next);
    setSettingsOpen(false);
    window.dispatchEvent(new CustomEvent(`vivida:tracking-${next}`));
    // Removing React components does not stop third-party scripts that are
    // already running in this document. Reload with the denied cookie in place.
    if (next === "denied" && hadLoadedTrackers) window.location.reload();
  }

  const en = locale === "en";
  const showPanel = ready && (consent === null || settingsOpen);
  // Reserve document space equal to the panel's height while it is open. The
  // panel is `fixed`, so without this it sits on top of whatever is at the
  // bottom of the page and that content can never be scrolled clear — on
  // /login that was the submit button and the sign-up link.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const apply = () => {
      document.body.style.paddingBottom = `${el.offsetHeight + 24}px`;
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.body.style.paddingBottom = "";
    };
  }, [showPanel]);

  return (
    <>
      {productionTrackingAllowed && (
        <>
          {fbPixelId ? <FbPixel pixelId={fbPixelId} /> : null}
          <VercelObservability />
          <Suspense fallback={null}>
            <AttributionCapture />
          </Suspense>
        </>
      )}
      {gaTrackingIsAllowed && gaId ? (
        <GoogleAnalytics gaId={gaId} debugMode={localDebugMode} />
      ) : null}

      {trackingEnabled && locale === "ka" && !sensitivePath && (
        <>
          <div id="top-ge-counter-container" data-site-id="118976" />
          <Script
            src="https://counter.top.ge/counter.js"
            strategy="afterInteractive"
          />
        </>
      )}

      {ready && consent !== null && !settingsOpen && (
        <button
          type="button"
          data-privacy-reopen
          aria-label={en ? "Privacy choices" : "კონფიდენციალურობა"}
          onClick={() => setSettingsOpen(true)}
          className="fixed bottom-3 left-3 z-[90] inline-flex size-8 items-center justify-center rounded-full border border-border/70 bg-background/85 text-muted-foreground shadow-lg backdrop-blur transition-colors hover:text-foreground lg:left-auto lg:right-3"
        >
          <ShieldCheck className="size-3.5 shrink-0" />
        </button>
      )}

      {/* The panel is deliberately compact on mobile: at 375px the roomier
          desktop treatment grew tall enough to cover the whole /login form —
          fields, submit and the sign-up link — so a first-time visitor could
          neither sign in nor register until they dismissed it. Georgian copy
          runs ~30% longer than English, which made it worse on the primary
          domain. Height is also hard-capped as a backstop. */}
      {showPanel && (
        <div
          ref={panelRef}
          className="fixed inset-x-3 bottom-3 z-[100] mx-auto flex max-h-[60svh] max-w-2xl flex-col overflow-y-auto rounded-2xl border border-border bg-background/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="hidden size-9 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)] sm:grid">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold sm:text-base">
                {en
                  ? "Your privacy choices"
                  : "შენი კონფიდენციალურობის არჩევანი"}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {en
                  ? "Top.ge counts visits on vivida.ge regardless of this choice. With your permission, Google Analytics and Meta cookies measure campaign visits and purchases."
                  : "Top.ge ვიზიტებს ითვლის vivida.ge-ზე ამ არჩევანის მიუხედავად. შენი თანხმობით, Google Analytics-ისა და Meta-ს cookie-ები კამპანიებისა და შესყიდვების გაზომვაში გვეხმარება."}
              </p>
            </div>
          </div>
          {/* Stacked on mobile: the Georgian labels do not fit two-across at
              375px and were overflowing the viewport. `sm` sizing keeps the
              stack short enough to leave the page's own controls reachable. */}
          <div className="mt-3 flex flex-col-reverse gap-2 sm:mt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => choose("denied")}
            >
              {en ? "Continue without consent" : "თანხმობის გარეშე გაგრძელება"}
            </Button>
            <Button
              type="button"
              variant="mystic"
              size="sm"
              onClick={() => choose("granted")}
            >
              {en ? "Allow analytics & Meta" : "ანალიტიკისა და Meta-ს დაშვება"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
