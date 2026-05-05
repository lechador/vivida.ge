"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Mobile Chrome (and most modern browsers) freezes background tabs into
 * the back-forward cache and restores the page snapshot when the user
 * returns. The page restores instantly — but server-rendered data is
 * frozen at the moment of suspension, so anything time-sensitive
 * (today's horoscope, trial countdown, fresh notifications, even the
 * auth session if it expired while suspended) ends up stale and the
 * user perceives the app as "broken — needs refresh."
 *
 * We keep bfcache enabled (page restore stays instant) and trigger a
 * background `router.refresh()` on bfcache restore. Server components
 * re-render with fresh data without unmounting client state, so the
 * page is correct within a frame or two of restore.
 *
 * Also handles the `visibilitychange` case: when a tab becomes visible
 * again after a long hidden period (e.g. > 5 minutes) we refresh too,
 * since some browsers don't bfcache aggressively but still leave the
 * tab idle for a long time.
 */
export function BfcacheRefresher() {
  const router = useRouter();

  useEffect(() => {
    let lastHiddenAt: number | null = null;
    const STALE_AFTER_MS = 5 * 60 * 1000; // 5 minutes

    const onPageShow = (event: PageTransitionEvent) => {
      // event.persisted = true → page restored from bfcache.
      if (event.persisted) {
        router.refresh();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastHiddenAt = Date.now();
        return;
      }
      // Visible again. If we were hidden long enough that data is likely
      // stale, refresh. Short tab switches don't trigger this.
      if (lastHiddenAt && Date.now() - lastHiddenAt > STALE_AFTER_MS) {
        router.refresh();
      }
      lastHiddenAt = null;
    };

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return null;
}
