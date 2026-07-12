"use client";

import { useEffect } from "react";

/**
 * Captures a `?ref=CODE` from any landing URL into a 30-day cookie, so the
 * referral is attributed whenever the visitor eventually signs up (the server
 * reads this cookie in lib/referral.onUserSignedUp). Mounted once in the root
 * layout; renders nothing.
 */
export function RefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && /^[a-z0-9]{3,16}$/i.test(ref)) {
        document.cookie = `vivida_ref=${encodeURIComponent(ref)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
      }
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
