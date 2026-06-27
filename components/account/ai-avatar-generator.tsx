"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

const ERRORS: Record<string, string> = {
  pro_required: "ეს ფუნქცია Vivida Pro-ს ნაწილია.",
  no_chart: "ჯერ შენი ნატალური რუკა უნდა შეიქმნას.",
  rate_limited: "დღევანდელი ლიმიტი ამოიწურა. სცადე ხვალ.",
  unavailable: "სერვისი დროებით მიუწვდომელია.",
  generation_failed: "ვერ მოხერხდა გენერაცია. სცადე ხელახლა.",
};

/**
 * AI zodiac avatar generator. One click generates a brand-styled cosmic
 * emblem for the user's sun sign and sets it as their main profile photo;
 * "regenerate" tries another. The new avatar propagates everywhere via
 * router.refresh() (the route also busts the header cache).
 */
export function AiAvatarGenerator({
  initialAvatar,
}: {
  initialAvatar: string | null;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shown = preview ?? initialAvatar;
  const hasGenerated = preview !== null;

  async function generate() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/avatar/generate", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(ERRORS[data.error ?? ""] ?? "რაღაც ვერ მოხერხდა. სცადე ხელახლა.");
        return;
      }
      setPreview(data.url);
      // Refresh so the navbar + account avatar pick up the new main photo.
      router.refresh();
    } catch {
      setError("ქსელის შეცდომა. სცადე ხელახლა.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/10 via-card/60 to-[var(--vivida-cyan)]/8 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-4 sm:items-center">
        {/* Avatar preview */}
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-[var(--vivida-violet)]/40 bg-card/60 sm:size-24">
          {shown ? (
            <Image
              src={shown}
              alt="ავატარი"
              width={96}
              height={96}
              className="size-full object-cover"
              unoptimized
            />
          ) : (
            <div className="grid size-full place-items-center text-[var(--vivida-violet)]">
              <Sparkles className="size-7" />
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-black/55 backdrop-blur-sm">
              <Loader2 className="size-6 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-1.5 text-lg font-semibold tracking-tight">
            <Sparkles className="size-4 text-[var(--vivida-violet)]" />
            AI ავატარი
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {busy
              ? "ვქმნით შენს კოსმიურ ავატარს… (~10 წამი)"
              : hasGenerated
                ? "მზადაა — დაყენდა შენს პროფილზე. მოგწონს თუ არა?"
                : "შექმენი შენი ზოდიაქოს ნიშნის პერსონალური ავატარი Vivida-ს სტილში."}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="mystic"
          onClick={generate}
          disabled={busy}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : hasGenerated ? (
            <RefreshCw className="size-4" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {busy
            ? "იქმნება…"
            : hasGenerated
              ? "თავიდან შექმნა"
              : "ავატარის გენერაცია"}
        </Button>
        <span className="text-xs text-muted-foreground">
          ეფუძნება შენი მზის ნიშანს
        </span>
      </div>

      {error && (
        <p className="mt-3 text-sm text-[var(--vivida-pink)]">{error}</p>
      )}
    </div>
  );
}
