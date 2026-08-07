"use client"; // Error boundaries must be Client Components

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * App-wide error boundary — the last line of defense. It catches errors that
 * escape every route (including ones thrown by the root layout itself), so a
 * single unhandled throw never leaves the user on a blank/broken page.
 *
 * global-error REPLACES the root layout when active, so it must render its own
 * <html>/<body> and can't rely on the app's Tailwind being loaded — everything
 * here is inline-styled to match the dark theme unconditionally.
 *
 * Behaviour mirrors app/report/error.tsx: one automatic retry (transient blips
 * self-heal), guarded by a one-shot sessionStorage flag so a genuinely broken
 * state can't reload-loop, then a manual "try again" + a link home.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    console.error("[global-error]", error);
    let alreadyRetried = false;
    try {
      alreadyRetried = sessionStorage.getItem("vivida_global_retried") === "1";
    } catch {
      /* private mode — skip auto-retry */
    }
    if (alreadyRetried) return;
    try {
      sessionStorage.setItem("vivida_global_retried", "1");
    } catch {
      /* ignore */
    }
    const stateTimer = setTimeout(() => setRetrying(true), 0);
    const retryTimer = setTimeout(() => unstable_retry(), 1000);
    return () => {
      clearTimeout(stateTimer);
      clearTimeout(retryTimer);
    };
  }, [error, unstable_retry]);

  function manualRetry() {
    try {
      sessionStorage.removeItem("vivida_global_retried");
    } catch {
      /* ignore */
    }
    setRetrying(true);
    unstable_retry();
  }

  return (
    <html lang="ka">
      <title>რაღაც ვერ მოხერხდა · Vivida</title>
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
              ვცდილობთ ხელახლა…
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: "6px 0 0" }}>
              რაღაც ვერ მოხერხდა
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
              დროებითი შეფერხება იყო. სცადე ხელახლა — ჩვეულებრივ მაშინვე
              ეშველება.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button type="button" onClick={manualRetry} style={primaryBtn}>
                ხელახლა ცდა
              </button>
              <Link href="/" style={secondaryBtn}>
                მთავარზე
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
