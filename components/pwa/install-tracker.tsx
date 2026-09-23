"use client";

import { useEffect } from "react";

import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/locale";
import { browserTrackingConsent } from "@/lib/tracking-consent";

const FIRST_OPEN_KEY = "vivida_pwa_first_open_reported";
const INSTALL_ID_KEY = "vivida_pwa_install_id";

export function PwaInstallTracker({ locale }: { locale: UserLocale }) {
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const params = productEventBase("pwa_install", "standalone", locale);

    const onInstalled = () => {
      trackEvent(ANALYTICS_EVENT.pwaAppInstalled, {
        ...params,
        surface: "browser_prompt",
      });
    };
    window.addEventListener("appinstalled", onInstalled);

    if (standalone) {
      let opened = false;
      let serverReported = false;
      let serverSending = false;
      const reportServer = async () => {
        if (
          serverReported ||
          serverSending ||
          browserTrackingConsent() !== "granted"
        )
          return;
        let id: string;
        try {
          id = localStorage.getItem(INSTALL_ID_KEY) || crypto.randomUUID();
          localStorage.setItem(INSTALL_ID_KEY, id);
        } catch {
          return;
        }
        const ua = navigator.userAgent;
        const platform = /iPad|iPhone|iPod/.test(ua)
          ? "ios"
          : /Android/.test(ua)
            ? "android"
            : "desktop";
        serverSending = true;
        try {
          const response = await fetch("/api/pwa/open", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id, platform }),
          });
          serverReported = response.ok;
        } catch {
          // Offline opens are retried when the page is opened online again.
        } finally {
          serverSending = false;
        }
      };
      const report = () => {
        void reportServer();
        if (!opened) {
          opened = trackEvent(ANALYTICS_EVENT.pwaStandaloneOpened, params);
        }
        try {
          if (!localStorage.getItem(FIRST_OPEN_KEY)) {
            if (trackEvent(ANALYTICS_EVENT.pwaStandaloneFirstOpen, params)) {
              localStorage.setItem(FIRST_OPEN_KEY, "1");
            }
          }
        } catch {
          // Private browsing can deny localStorage. Usage still works.
        }
      };
      report();
      window.addEventListener("vivida:tracking-granted", report);
      const retry = window.setInterval(report, 2000);
      const stop = window.setTimeout(() => window.clearInterval(retry), 10000);
      return () => {
        window.removeEventListener("appinstalled", onInstalled);
        window.removeEventListener("vivida:tracking-granted", report);
        window.clearInterval(retry);
        window.clearTimeout(stop);
      };
    }

    return () => window.removeEventListener("appinstalled", onInstalled);
  }, [locale]);

  return null;
}
