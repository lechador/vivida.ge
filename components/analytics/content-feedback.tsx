"use client";

import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { ANALYTICS_EVENT, productEventBase, trackEvent } from "@/lib/analytics";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { browserTrackingAllowed } from "@/lib/tracking-consent";

function subscribeConsent(callback: () => void) {
  window.addEventListener("vivida:tracking-granted", callback);
  window.addEventListener("vivida:tracking-denied", callback);
  return () => {
    window.removeEventListener("vivida:tracking-granted", callback);
    window.removeEventListener("vivida:tracking-denied", callback);
  };
}

const noServerConsent = () => false;

/** Optional aggregate feedback, shown only when analytics is permitted. */
export function ContentFeedback({
  surface,
  locale = "ka",
}: {
  surface: "dream_result" | "natal_report";
  locale?: UserLocale;
}) {
  const consent = useSyncExternalStore(
    subscribeConsent,
    browserTrackingAllowed,
    noServerConsent,
  );
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [sendFailed, setSendFailed] = useState(false);
  const en = locale !== "ka";

  if (!consent) return null;

  function respond(value: "yes" | "no") {
    if (answer !== null) return;
    const accepted = trackEvent(ANALYTICS_EVENT.contentFeedback, {
      ...productEventBase(
        surface === "dream_result" ? "dreams" : "natal_chart",
        surface,
        locale,
      ),
      answer: value,
    });
    setSendFailed(!accepted);
    if (accepted) setAnswer(value);
  }

  return (
    <aside
      aria-label={en ? "Optional feedback" : "არასავალდებულო უკუკავშირი"}
      className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-4 sm:p-5"
    >
      {answer === null ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-foreground/85">
            {en
              ? "Did you find the answer you needed?"
              : "მიიღე საჭირო პასუხი?"}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => respond("yes")}
            >
              {en ? "Yes" : "კი"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => respond("no")}
            >
              {en ? "No" : "არა"}
            </Button>
          </div>
        </div>
      ) : (
        <p role="status" className="text-sm text-muted-foreground">
          {en ? "Thank you for your feedback." : "მადლობა გამოხმაურებისთვის."}
        </p>
      )}
      {sendFailed && (
        <p role="status" className="mt-2 text-xs text-muted-foreground">
          {en
            ? "Your answer could not be sent. Please try again."
            : "პასუხის გაგზავნა ვერ მოხერხდა. სცადე ხელახლა."}
        </p>
      )}
    </aside>
  );
}
