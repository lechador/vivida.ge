"use client";

import { Suspense, useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
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
}: {
  gaId?: string;
  fbPixelId?: string;
  trackingEnabled: boolean;
}) {
  const [consent, setConsent] = useState<TrackingConsent>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setConsent(browserTrackingConsent());
      setReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function choose(next: Exclude<TrackingConsent, null>) {
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${TRACKING_CONSENT_COOKIE}=${next}; path=/; max-age=${TRACKING_CONSENT_MAX_AGE_SECONDS}; samesite=lax${secure}`;
    if (next === "denied") clearMarketingCookies();
    setConsent(next);
    setSettingsOpen(false);
    window.dispatchEvent(new CustomEvent(`vivida:tracking-${next}`));
  }

  const en = typeof document !== "undefined" && document.documentElement.lang === "en";
  const showPanel = ready && (consent === null || settingsOpen);
  const trackingAllowed = trackingEnabled && consent === "granted";

  return (
    <>
      {trackingAllowed && (
        <>
          {fbPixelId ? <FbPixel pixelId={fbPixelId} /> : null}
          {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
          <VercelObservability />
          <Suspense fallback={null}>
            <AttributionCapture />
          </Suspense>
        </>
      )}

      {ready && consent !== null && !settingsOpen && (
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="fixed bottom-3 left-3 z-[90] inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/85 px-3 py-1.5 text-[11px] text-muted-foreground shadow-lg backdrop-blur transition-colors hover:text-foreground"
        >
          <ShieldCheck className="size-3.5" />
          {en ? "Privacy choices" : "კონფიდენციალურობა"}
        </button>
      )}

      {showPanel && (
        <div className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-2xl rounded-2xl border border-border bg-background/95 p-5 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)]">
              <ShieldCheck className="size-4.5" />
            </div>
            <div>
              <h2 className="font-semibold">
                {en ? "Your privacy choices" : "შენი კონფიდენციალურობის არჩევანი"}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {en
                  ? "Essential cookies keep Vivida working. With your permission, analytics and Meta cookies help us measure which campaigns lead to useful visits and purchases."
                  : "აუცილებელი cookie-ები Vivida-ს მუშაობას უზრუნველყოფს. შენი თანხმობით, ანალიტიკა და Meta cookie-ები გვეხმარება გავიგოთ რომელი კამპანია იწვევს სასარგებლო ვიზიტებსა და ყიდვებს."}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => choose("denied")}>
              {en ? "Essential only" : "მხოლოდ აუცილებელი"}
            </Button>
            <Button type="button" variant="mystic" onClick={() => choose("granted")}>
              {en ? "Allow analytics & Meta" : "ანალიტიკისა და Meta-ს დაშვება"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
