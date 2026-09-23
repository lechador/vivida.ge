"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";

import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/locale";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __vividaInstallPrompt?: InstallPrompt;
  }
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function InstallAppButton({
  locale = "ka",
  surface,
  className = "",
}: {
  locale?: UserLocale;
  surface: string;
  className?: string;
}) {
  const [installed, setInstalled] = useState(false);
  const [ready, setReady] = useState(false);
  const [instructions, setInstructions] = useState(false);
  const [canPrompt, setCanPrompt] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef(false);
  const en = locale !== "ka";
  const params = productEventBase("pwa_install", surface, locale);

  useEffect(() => {
    const update = () => {
      setInstalled(isStandalone());
      setCanPrompt(Boolean(window.__vividaInstallPrompt));
      setReady(true);
    };
    const onInstalled = () => setInstalled(true);
    update();
    window.addEventListener("vivida:pwa-prompt-ready", update);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("vivida:pwa-prompt-ready", update);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!ready || installed) return;
    const element = containerRef.current;
    if (!element) return;
    const report = () => {
      if (viewedRef.current) return;
      const bounds = element.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      viewedRef.current = trackEvent(
        ANALYTICS_EVENT.pwaInstallCtaViewed,
        productEventBase("pwa_install", surface, locale),
      );
    };
    const observer = new IntersectionObserver(report);
    observer.observe(element);
    window.addEventListener("vivida:tracking-granted", report);
    return () => {
      observer.disconnect();
      window.removeEventListener("vivida:tracking-granted", report);
    };
  }, [ready, installed, surface, locale]);

  if (installed) return null;

  async function install() {
    trackEvent(ANALYTICS_EVENT.pwaInstallCtaClicked, params);
    const prompt = window.__vividaInstallPrompt;
    if (!prompt) {
      setInstructions((open) => !open);
      return;
    }
    window.__vividaInstallPrompt = undefined;
    setCanPrompt(false);
    window.dispatchEvent(new Event("vivida:pwa-prompt-ready"));
    try {
      await prompt.prompt();
      trackEvent(ANALYTICS_EVENT.pwaInstallPromptShown, params);
      const { outcome } = await prompt.userChoice;
      trackEvent(
        outcome === "accepted"
          ? ANALYTICS_EVENT.pwaInstallPromptAccepted
          : ANALYTICS_EVENT.pwaInstallPromptDismissed,
        params,
      );
      if (outcome === "accepted") {
        setInstalled(true);
        window.dispatchEvent(new Event("vivida:pwa-install-accepted"));
      } else {
        window.dispatchEvent(new Event("vivida:pwa-install-dismissed"));
      }
    } catch {
      setInstructions(true);
    }
  }

  const isAppleMobile = /iPad|iPhone|iPod/.test(
    typeof navigator === "undefined" ? "" : navigator.userAgent,
  );

  return (
    <div ref={containerRef}>
      <button
        type="button"
        onClick={install}
        aria-expanded={instructions}
        className={
          className ||
          "inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-[var(--vivida-violet)]"
        }
      >
        <Download aria-hidden className="size-4" />
        {en ? "Install web app" : "დაამატე მთავარ ეკრანზე"}
      </button>
      {instructions && !canPrompt && (
        <p
          role="status"
          className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground"
        >
          {isAppleMobile
            ? en
              ? "Open Vivida in Safari, tap Share, then Add to Home Screen."
              : "გახსენი Vivida Safari-ში, დააჭირე გაზიარებას და აირჩიე „Add to Home Screen“."
            : en
              ? "Open your browser menu and choose Install app or Add to Home Screen."
              : "ბრაუზერის მენიუში აირჩიე „Install app“ ან „Add to Home Screen“."}
        </p>
      )}
    </div>
  );
}
