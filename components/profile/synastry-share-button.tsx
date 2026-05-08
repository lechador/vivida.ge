"use client";

import { useEffect, useState } from "react";
import { Check, Download, Loader2, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Shareable compatibility-card button. Opens a preview dialog showing
 * the actual rendered PNG (so the user sees what they're posting before
 * they commit), then offers two actions:
 *
 * - Share via the Web Share API on devices that can share files
 *   (mobile — user picks Instagram/Facebook/WhatsApp from the native sheet)
 * - Download the PNG as a manual fallback for desktop or browsers
 *   without file-share support.
 *
 * The image is fetched once on dialog open and the blob is cached for
 * reuse on share/download. Auth is enforced server-side; a 401 here
 * means the user's session expired.
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
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">(
    "idle"
  );
  const [actionState, setActionState] = useState<"idle" | "working" | "done">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch the preview image when the dialog opens.
  useEffect(() => {
    if (!open) return;
    if (loadState === "ready" || loadState === "loading") return;

    let cancelled = false;
    setLoadState("loading");
    setErrorMessage(null);

    (async () => {
      try {
        // Hard cap at 25s — Vercel functions max out at 30s on Pro and
        // 10s on Hobby. If we hit this, something on the server is
        // stuck (font fetch, avatar CDN, etc.) and the user deserves
        // a real error rather than an infinite spinner.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);
        const res = await fetch(shareUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new Error(
            `status ${res.status}${detail ? ` — ${detail.slice(0, 80)}` : ""}`
          );
        }
        const fetchedBlob = await res.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(fetchedBlob);
        setBlob(fetchedBlob);
        setPreviewUrl(url);
        setLoadState("ready");
      } catch (err) {
        if (cancelled) return;
        const isAbort = (err as DOMException)?.name === "AbortError";
        const detail = isAbort
          ? "ძალიან დიდი დრო დასჭირდა"
          : (err as Error).message ?? "";
        console.warn("[share preview]", detail);
        setErrorMessage(`ვერ ჩაიტვირთა (${detail || "უცნობი შეცდომა"})`);
        setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, shareUrl, loadState]);

  // Free the object URL when we replace it or unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fileName = `vivida-${overall}.png`;

  /**
   * Attempt the native share. Returns:
   *   "shared"     — user accepted the share sheet
   *   "cancelled"  — user dismissed (don't treat as failure)
   *   "unsupported"— Web Share API or file-share isn't available
   *   "failed"     — share threw for some other reason; caller should
   *                  fall back to download
   */
  const tryNativeShare = async (): Promise<
    "shared" | "cancelled" | "unsupported" | "failed"
  > => {
    if (!blob) return "unsupported";
    const file = new File([blob], fileName, { type: "image/png" });
    const shareData: ShareData = {
      title: "Vivida — ჩვენი თავსებადობა",
      text: `${partnerName}-სთან ჩემი თავსებადობა — ${overall}% ✦ vivida.ge`,
      files: [file],
    };

    const canTry =
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      typeof navigator.share === "function" &&
      navigator.canShare(shareData);
    if (!canTry) return "unsupported";

    try {
      await navigator.share(shareData);
      return "shared";
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === "AbortError") return "cancelled";
      // Browsers throw various NotAllowedError / DataError flavours when
      // a share is interrupted or partially supported — log and fall
      // back so the user still gets the file.
      console.warn("[share native fallback]", name, (err as Error).message);
      return "failed";
    }
  };

  const downloadBlob = (): boolean => {
    if (!blob) return false;
    try {
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      return true;
    } catch (err) {
      console.warn("[share download failed]", (err as Error).message);
      return false;
    }
  };

  const finishOk = () => {
    setActionState("done");
    setTimeout(() => {
      setActionState("idle");
      setOpen(false);
    }, 1200);
  };

  const onShare = async () => {
    if (actionState === "working" || !blob) return;
    setActionState("working");
    setErrorMessage(null);

    const result = await tryNativeShare();
    if (result === "shared") {
      finishOk();
      return;
    }
    if (result === "cancelled") {
      setActionState("idle");
      return;
    }
    // Unsupported or failed → fall back to a direct download so the
    // user still ends up with the image.
    if (downloadBlob()) {
      finishOk();
      return;
    }
    setErrorMessage("ვერ მოხერხდა. სცადე თავიდან.");
    setActionState("idle");
  };

  const onDownload = () => {
    if (!blob) return;
    if (downloadBlob()) {
      finishOk();
    } else {
      setErrorMessage("ვერ მოხერხდა. სცადე თავიდან.");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="mystic"
        size="lg"
        onClick={() => setOpen(true)}
      >
        <Share2 className="size-4" />
        გააზიარე ბარათი
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            // Reset action state on close so re-open shows the same
            // preview (we keep the blob cached).
            setActionState("idle");
            setErrorMessage(null);
          }
        }}
      >
        <DialogContent className="max-w-sm gap-4 p-5 sm:p-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg">თავსებადობის ბარათი</DialogTitle>
            <DialogDescription>
              ასე გამოჩნდება შენი ბარათი Instagram-სა და Facebook-ზე.
            </DialogDescription>
          </DialogHeader>

          {/* Preview */}
          <div
            className={cn(
              "relative mx-auto w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-card/40",
              "aspect-[9/16]"
            )}
          >
            {loadState === "loading" && (
              <div className="absolute inset-0 grid place-items-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {loadState === "error" && (
              <div className="absolute inset-0 grid place-items-center px-3 text-center text-xs text-muted-foreground">
                {errorMessage ?? "ვერ ჩაიტვირთა"}
              </div>
            )}
            {previewUrl && loadState === "ready" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="ჩვენი თავსებადობის ბარათი"
                className="absolute inset-0 size-full object-cover"
              />
            )}
          </div>

          {errorMessage && loadState === "ready" && (
            <p className="text-center text-xs text-destructive">
              {errorMessage}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="mystic"
              size="lg"
              onClick={onShare}
              disabled={loadState !== "ready" || actionState === "working"}
            >
              {actionState === "working" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : actionState === "done" ? (
                <Check className="size-4" />
              ) : (
                <Share2 className="size-4" />
              )}
              {actionState === "done" ? "მზადაა ✓" : "გააზიარე"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onDownload}
              disabled={loadState !== "ready"}
            >
              <Download className="size-4" />
              ჩამოტვირთვა
            </Button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            მობილურზე ღილაკი „გააზიარე“ პირდაპირ აჩვენებს Instagram/Facebook
            არჩევანს. დესკტოპზე — ჩამოტვირთავს PNG-ს.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
