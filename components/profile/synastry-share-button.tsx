"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import {
  CompatibilityCard,
  type CompatibilityCardProps,
} from "./compatibility-card";

/**
 * Renders a 1080×1920 compatibility card off-screen via a portal,
 * screenshots it client-side using html-to-image, and offers either
 * the OS share sheet (mobile) or a PNG download (desktop).
 *
 * We chose client-side rendering after multiple Vercel-side issues
 * with next/og — bundling, font URLs, and satori hangs — none of
 * which can affect the user's own browser.
 */
export function SynastryShareButton({
  cardProps,
}: {
  cardProps: CompatibilityCardProps;
}) {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loadState, setLoadState] = useState<
    "idle" | "rendering" | "ready" | "error"
  >("idle");
  const [actionState, setActionState] = useState<
    "idle" | "working" | "done"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  // Track latest loadState across renders so the open-effect can read it
  // without depending on it (and triggering its own cleanup mid-async).
  const loadStateRef = useRef(loadState);
  useEffect(() => {
    loadStateRef.current = loadState;
  }, [loadState]);

  // Defer portal access to client mount.
  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  // Render the off-screen card to a PNG when the dialog opens. We hold
  // on to the blob so subsequent share/download is instant.
  //
  // IMPORTANT: deps are `[open]` only. If we add `loadState`, calling
  // setLoadState inside the effect re-runs the cleanup, which flips
  // cancelled=true on the running closure and silently bails after
  // toBlob — even though the work succeeded.
  useEffect(() => {
    if (!open) return;
    // Cached from a previous open — keep the existing preview.
    if (loadStateRef.current === "ready") return;

    let cancelled = false;
    setLoadState("rendering");
    setErrorMessage(null);

    console.log("[share] effect fired, open=", open);

    (async () => {
      try {
        // Wait two animation frames so React has time to commit the
        // off-screen card into the DOM. Without this, html-to-image
        // sometimes captures a half-rendered tree.
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        await new Promise((r) => requestAnimationFrame(() => r(null)));

        console.log(
          "[share] after rAF, cardRef.current is:",
          cardRef.current
        );

        if (!cardRef.current) {
          throw new Error("card not mounted");
        }

        console.log("[share] importing html-to-image…");
        const mod = await import("html-to-image");
        console.log("[share] html-to-image loaded:", Object.keys(mod));

        console.log(
          "[share] capturing node, dimensions:",
          cardRef.current.offsetWidth,
          "x",
          cardRef.current.offsetHeight
        );

        // Bisect via toCanvas → manual canvas.toBlob, with a hard 15s
        // timeout, so if html-to-image hangs we get a real error
        // instead of waiting forever.
        const captureWithTimeout = (timeoutMs: number) =>
          Promise.race<HTMLCanvasElement>([
            mod.toCanvas(cardRef.current!, {
              pixelRatio: 1,
              cacheBust: false,
              backgroundColor: "#0b0814",
              skipFonts: true,
            }),
            new Promise<never>((_, rej) =>
              setTimeout(
                () => rej(new Error(`toCanvas timed out after ${timeoutMs}ms`)),
                timeoutMs
              )
            ),
          ]);

        const canvas = await captureWithTimeout(15000);
        console.log(
          "[share] toCanvas returned, dimensions:",
          canvas.width,
          "x",
          canvas.height
        );

        const fresh = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/png")
        );
        console.log("[share] canvas.toBlob returned:", fresh);

        if (cancelled) return;
        console.log("[share] toBlob returned:", fresh);
        if (!fresh) throw new Error("toBlob returned null");

        console.log("[share] blob size:", fresh.size, "type:", fresh.type);

        setBlob(fresh);
        setPreviewUrl(URL.createObjectURL(fresh));
        setLoadState("ready");
        console.log("[share] preview ready");
      } catch (err) {
        if (cancelled) return;
        const detail = (err as Error).message ?? "";
        console.error("[share render] failed:", err);
        setErrorMessage(`ვერ მოხერხდა (${detail || "უცნობი შეცდომა"})`);
        setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Free the object URL on unmount or when replaced.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fileName = `vivida-${Math.round(cardProps.result.overall)}.png`;

  const tryNativeShare = async (): Promise<
    "shared" | "cancelled" | "unsupported" | "failed"
  > => {
    if (!blob) return "unsupported";
    const file = new File([blob], fileName, { type: "image/png" });
    const shareData: ShareData = {
      title: "Vivida — ჩვენი თავსებადობა",
      text: `${cardProps.partnerName}-სთან ჩემი თავსებადობა — ${Math.round(
        cardProps.result.overall
      )}% ✦ vivida.ge`,
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
        onClick={() => {
          console.log("[share] button clicked, opening dialog");
          setOpen(true);
        }}
      >
        <Share2 className="size-4" />
        გააზიარე ბარათი
      </Button>

      {/* Off-screen card mounted only while the dialog is open. The
          fixed-positioned wrapper lives at top:-99999px so it doesn't
          affect page layout but is still rendered at full size for
          html-to-image to capture. */}
      {open && portalRoot
        ? createPortal(
            <div
              aria-hidden
              style={{
                position: "fixed",
                top: -99999,
                left: -99999,
                pointerEvents: "none",
                zIndex: -1,
              }}
            >
              <div ref={cardRef}>
                <CompatibilityCard {...cardProps} />
              </div>
            </div>,
            portalRoot
          )
        : null}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
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
              "relative mx-auto w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-[#0b0814]",
              "aspect-[9/16]"
            )}
          >
            {(loadState === "rendering" || loadState === "idle") && (
              <div className="absolute inset-0 grid place-items-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {loadState === "error" && (
              <div className="absolute inset-0 grid place-items-center px-3 text-center text-xs text-muted-foreground">
                {errorMessage ?? "ვერ მოხერხდა"}
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
            მობილურზე ღილაკი „გააზიარე" პირდაპირ აჩვენებს Instagram/Facebook
            არჩევანს. დესკტოპზე — ჩამოტვირთავს PNG-ს.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
