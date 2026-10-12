"use client"; // Error boundaries must be Client Components

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { isEnglishHost } from "@/lib/seo/locales";

/** The host never changes for the lifetime of the document. */
const subscribeNever = () => () => {};

/**
 * App-wide error boundary, the last line of defense. It catches errors that
 * escape every route (including ones thrown by the root layout itself), so a
 * single unhandled throw never leaves the user on a blank/broken page.
 *
 * global-error REPLACES the root layout when active, so it must render its own
 * <html>/<body> and can't rely on the app's Tailwind being loaded, everything
 * here is inline-styled to match the dark theme unconditionally.
 *
 * Behaviour mirrors app/report/error.tsx: one automatic retry (transient blips
 * self-heal), guarded by a one-shot sessionStorage flag so a genuinely broken
 * state can't reload-loop, then a manual "try again" + a link home.
 *
 * Replacing the root layout also discards its host-aware `lang` and the
 * .locale-*-only CSS, so the locale is re-derived here from the browser host.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const [retrying, setRetrying] = useState(false);
  // The host can only be sniffed in the browser, and this page also renders on
  // the server, so the two snapshots are declared separately instead of
  // reconciled in an effect. Georgian stays the server-side fallback.
  const en = useSyncExternalStore(
    subscribeNever,
    () => isEnglishHost(window.location.hostname),
    () => false,
  );

  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag("error_boundary", "global");
      Sentry.captureException(error);
    });
    console.error("[global-error]", error);
    let alreadyRetried = false;
    try {
      alreadyRetried = sessionStorage.getItem("vivida_global_retried") === "1";
    } catch {
      /* private mode, skip auto-retry */
    }
    if (alreadyRetried) return;
    try {
      sessionStorage.setItem("vivida_global_retried", "1");
    } catch {
      /* ignore */
    }
    const stateTimer = setTimeout(() => setRetrying(true), 0);
    const retryTimer = setTimeout(() => {
      // If retry() is ever missing or throws, fall back to the manual UI rather
      // than stranding the user on a spinner that never resolves.
      try {
        retry();
      } catch {
        setRetrying(false);
      }
    }, 1000);
    return () => {
      clearTimeout(stateTimer);
      clearTimeout(retryTimer);
    };
  }, [error, retry]);

  function manualRetry() {
    try {
      sessionStorage.removeItem("vivida_global_retried");
    } catch {
      /* ignore */
    }
    setRetrying(true);
    try {
      retry();
    } catch {
      setRetrying(false);
    }
  }

  return (
    <html lang={en ? "en" : "ka"}>
      <title>
        {en ? "Something went wrong · Vivida" : "რაღაც ვერ მოხერხდა · Vivida"}
      </title>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 24,
          textAlign: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background:
            "#0b0814 radial-gradient(60% 45% at 50% -5%, rgba(120,60,180,0.35), transparent 70%)",
          color: "#f1eef8",
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: "-0.5px",
            color: "#b884f2",
          }}
        >
          vivida
        </div>

        {retrying ? (
          <>
            <div style={spinnerStyle} aria-hidden />
            <p style={{ color: "#c2bcdd", fontSize: 14, margin: 0 }}>
              {en ? "Trying again…" : "ვცდილობთ ხელახლა…"}
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: "6px 0 0" }}>
              {en ? "Something went wrong" : "რაღაც ვერ მოხერხდა"}
            </h1>
            <p
              style={{
                color: "#c2bcdd",
                fontSize: 14,
                lineHeight: 1.6,
                margin: 0,
                maxWidth: 360,
              }}
            >
              {en
                ? "This was a temporary glitch. Try again, this usually resolves immediately."
                : "დროებითი შეფერხება იყო. სცადე ხელახლა, ჩვეულებრივ მაშინვე ეშველება."}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button type="button" onClick={manualRetry} style={primaryBtn}>
                {en ? "Try again" : "ხელახლა ცდა"}
              </button>
              <Link href="/" style={secondaryBtn}>
                {en ? "Go home" : "მთავარზე"}
              </Link>
            </div>
          </>
        )}

        <style>{`@keyframes vivida-spin { to { transform: rotate(360deg); } }`}</style>
      </body>
    </html>
  );
}

const spinnerStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "3px solid rgba(184,132,242,0.25)",
  borderTopColor: "#a78bfa",
  animation: "vivida-spin 0.8s linear infinite",
};

const primaryBtn: React.CSSProperties = {
  appearance: "none",
  border: "none",
  cursor: "pointer",
  borderRadius: 12,
  padding: "11px 22px",
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
  background: "linear-gradient(135deg, #a78bfa, #f472b6)",
};

const secondaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 12,
  padding: "11px 22px",
  fontSize: 14,
  fontWeight: 600,
  color: "#c2bcdd",
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,0.15)",
};
