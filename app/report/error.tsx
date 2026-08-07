"use client"; // Error boundaries must be Client Components

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";

/**
 * Error boundary for /report. The chart can still be generating right after
 * onboarding (the background pre-gen from saveProfile races the page's own
 * ensureChartFor), so a first-render error is almost always transient. We
 * auto-retry ONCE after a short delay — by then the static chart is persisted
 * — and only show a manual "try again" button if that retry also fails. The
 * one-shot guard (sessionStorage) prevents an infinite reload loop when the
 * error is real.
 */
export default function ReportError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag("error_boundary", "report");
      Sentry.captureException(error);
    });
    console.error("[/report] render error:", error);
    let alreadyRetried = false;
    try {
      alreadyRetried = sessionStorage.getItem("vivida_report_retried") === "1";
    } catch {
      /* private mode — skip auto-retry */
    }
    if (alreadyRetried) return;
    try {
      sessionStorage.setItem("vivida_report_retried", "1");
    } catch {
      /* ignore */
    }
    const stateTimer = setTimeout(() => setRetrying(true), 0);
    const retryTimer = setTimeout(() => unstable_retry(), 1200);
    return () => {
      clearTimeout(stateTimer);
      clearTimeout(retryTimer);
    };
  }, [error, unstable_retry]);

  function manualRetry() {
    try {
      sessionStorage.removeItem("vivida_report_retried");
    } catch {
      /* ignore */
    }
    setRetrying(true);
    unstable_retry();
  }

  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.5),transparent_70%)]"
      />
      {retrying ? (
        <>
          <Loader2 className="size-8 animate-spin text-[var(--vivida-violet)]" />
          <p className="mt-4 text-sm text-muted-foreground">
            შენი რუკა მზადდება — ერთი წამი…
          </p>
        </>
      ) : (
        <>
          <div className="grid size-14 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
            <RotateCcw className="size-7 text-[var(--vivida-violet)]" />
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight">
            რუკა ვერ ჩაიტვირთა
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            შესაძლოა ჯერ მზადდება. სცადე ხელახლა — ჩვეულებრივ მაშინვე ეშველება.
          </p>
          <button
            type="button"
            onClick={manualRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
          >
            <RotateCcw className="size-4" />
            ხელახლა ცდა
          </button>
        </>
      )}
    </main>
  );
}
