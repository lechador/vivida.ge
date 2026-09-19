"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * W04 report funnel (contract v1). Open = the ready state actually rendered;
 * a server-side "ready" row the user never sees is not a read. Download =
 * explicit click on the PDF link. Only the fact travels, never content.
 */
export function ReportOpenTracker({ locale }: { locale: UserLocale }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(ANALYTICS_EVENT.reportOpened, {
      ...productEventBase("report", "report_page", locale),
      report_type: "natal",
      outcome: "viewed",
    });
  }, [locale]);
  return null;
}

export function ReportDownloadButton({
  reportId,
  locale,
  children,
  className,
}: {
  reportId: string;
  locale: UserLocale;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={`/api/reports/${reportId}/download`}
      className={className}
      onClick={() =>
        trackEvent(ANALYTICS_EVENT.reportDownloaded, {
          ...productEventBase("report", "report_page", locale),
          report_type: "natal",
          outcome: "downloaded",
        })
      }
    >
      {children}
    </a>
  );
}
