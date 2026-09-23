"use client";

import { useEffect } from "react";

/** Register the same worker used by push so installability and offline fallback
 * are available before a visitor opts in to notifications. */
export function PwaServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      // A failed registration must never block the website.
    });
  }, []);
  return null;
}
