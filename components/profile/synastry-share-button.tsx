"use client";

import { useState } from "react";
import { Check, Loader2, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Shareable compatibility-card button. Fetches the auth-protected PNG
 * from /api/share/synastry and either:
 *
 * - Calls the Web Share API on devices that can share files (mobile —
 *   user picks Instagram/Facebook/WhatsApp from the native sheet), or
 * - Downloads the PNG so the user can post it manually on desktop.
 *
 * After a successful share/download we briefly swap the icon to a check
 * so the user has a clear "done" cue.
 */
export function SynastryShareButton({
  shareUrl,
  partnerName,
  overall,
}: {
  /** Auth-protected image endpoint (e.g. /api/share/synastry?with=ana_2003). */
  shareUrl: string;
  /** Used in the share-sheet caption. */
  partnerName: string;
  /** Used in the share-sheet caption. */
  overall: number;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onShare = async () => {
    if (state === "loading") return;
    setState("loading");
    setErrorMessage(null);
    try {
      const res = await fetch(shareUrl);
      if (!res.ok) {
        throw new Error(`status ${res.status}`);
      }
      const blob = await res.blob();
      const fileName = `vivida-${overall}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const shareData: ShareData = {
        title: "Vivida — ჩვენი თავსებადობა",
        text: `${partnerName}-სთან ჩემი თავსებადობა — ${overall}% ✦ vivida.ge`,
        files: [file],
      };

      // Web Share API with files — mobile Safari/Chrome surface IG/FB
      // directly in the OS share sheet.
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare(shareData) &&
        typeof navigator.share === "function"
      ) {
        try {
          await navigator.share(shareData);
          setState("done");
        } catch (err) {
          // AbortError fires when the user dismisses the share sheet —
          // not an error from our side.
          if ((err as DOMException)?.name === "AbortError") {
            setState("idle");
            return;
          }
          throw err;
        }
      } else {
        // Desktop fallback — download the PNG.
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);
        setState("done");
      }

      // Reset to idle after a moment so the button is reusable.
      setTimeout(() => setState("idle"), 2400);
    } catch (err) {
      console.warn("[share]", (err as Error).message);
      setErrorMessage("ვერ მოხერხდა. სცადე თავიდან.");
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const Icon =
    state === "loading"
      ? Loader2
      : state === "done"
      ? Check
      : Share2;

  return (
    <div className="flex flex-col items-center gap-1.5 sm:items-start">
      <Button
        type="button"
        variant="mystic"
        size="lg"
        onClick={onShare}
        disabled={state === "loading"}
        aria-label="გააზიარე ეს კარტა"
      >
        <Icon
          className={cn(
            "size-4",
            state === "loading" && "animate-spin"
          )}
        />
        {state === "done"
          ? "მზადაა ✓"
          : state === "loading"
          ? "მზადდება…"
          : "გააზიარე ბარათი"}
      </Button>
      {errorMessage && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}
    </div>
  );
}
