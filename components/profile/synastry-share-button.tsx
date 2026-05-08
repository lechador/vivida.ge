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
        const res = await fetch(shareUrl);
        if (!res.ok) throw new Error(`status ${res.status}`);
        const fetchedBlob = await res.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(fetchedBlob);
        setBlob(fetchedBlob);
        setPreviewUrl(url);
        setLoadState("ready");
      } catch (err) {
        if (cancelled) return;
        console.warn("[share preview]", (err as Error).message);
        setErrorMessage("ვერ ჩაიტვირთა. სცადე ცოტა ხანში.");
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

  const tryNativeShare = async (): Promise<"shared" | "fallback"> => {
    if (!blob) return "fallback";
    const file = new File([blob], fileName, { type: "image/png" });
    const shareData: ShareData = {
      title: "Vivida — ჩვენი თავსებადობა",
      text: `${partnerName}-სთან ჩემი თავსებადობა — ${overall}% ✦ vivida.ge`,
      files: [file],
    };

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare(shareData) &&
      typeof navigator.share === "function"
    ) {
      await navigator.share(shareData);
      return "shared";
    }
    return "fallback";
  };

  const downloadBlob = () => {
    if (!blob) return;
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  };

  const onShare = async () => {
    if (actionState === "working" || !blob) return;
    setActionState("working");
    setErrorMessage(null);
    try {
      const result = await tryNativeShare();
      if (result === "fallback") downloadBlob();
      setActionState("done");
      setTimeout(() => {
        setActionState("idle");
        setOpen(false);
      }, 1200);
    } catch (err) {
      // AbortError fires when the user dismisses the share sheet — just
      // reset, not an error from our side.
      if ((err as DOMException)?.name === "AbortError") {
        setActionState("idle");
        return;
      }
      console.warn("[share]", (err as Error).message);
      setErrorMessage("ვერ მოხერხდა. სცადე თავიდან.");
      setActionState("idle");
    }
  };

  const onDownload = () => {
    if (!blob) return;
    downloadBlob();
    setActionState("done");
    setTimeout(() => {
      setActionState("idle");
      setOpen(false);
    }, 1200);
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
