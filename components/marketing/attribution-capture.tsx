"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE_SECONDS,
  attributionTouchFromSearchParams,
  parseAttribution,
  serializeAttribution,
} from "@/lib/marketing-attribution";

function cookieValue(name: string): string | null {
  const prefix = `${name}=`;
  const part = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));
  return part?.slice(prefix.length) ?? null;
}

export function AttributionCapture() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    const touch = attributionTouchFromSearchParams(
      new URLSearchParams(searchParams.toString()),
      pathname,
    );
    if (!touch) return;

    const existing = parseAttribution(cookieValue(ATTRIBUTION_COOKIE));
    const payload = {
      first: existing?.first ?? touch,
      last: touch,
    };
    document.cookie = `${ATTRIBUTION_COOKIE}=${serializeAttribution(payload)}; path=/; max-age=${ATTRIBUTION_MAX_AGE_SECONDS}; samesite=lax${secure}`;

    if (touch.fbclid && !cookieValue("_fbc")) {
      const fbc = `fb.1.${Date.now()}.${touch.fbclid}`;
      document.cookie = `_fbc=${encodeURIComponent(fbc)}; path=/; max-age=${ATTRIBUTION_MAX_AGE_SECONDS}; samesite=lax${secure}`;
    }
  }, [pathname, searchParams]);

  return null;
}
