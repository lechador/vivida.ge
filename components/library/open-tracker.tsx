"use client";

import { useEffect, useRef } from "react";

import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";
import type { LibraryEntryKind } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * W04: fires library_item_opened once per mount — the "result actually
 * viewed" signal (a server render or list impression is not a read).
 * Only the entry kind travels, never its content.
 */
export function LibraryOpenTracker({
  kind,
  locale,
}: {
  kind: LibraryEntryKind;
  locale: UserLocale;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(ANALYTICS_EVENT.libraryItemOpened, {
      ...productEventBase("library", "library_detail", locale),
      entry_kind: kind,
      outcome: "viewed",
    });
  }, [kind, locale]);
  return null;
}
