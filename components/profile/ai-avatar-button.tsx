"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ERRORS: Record<string, string> = {
  no_chart: "ჯერ შენი ნატალური რუკა უნდა შეიქმნას.",
  rate_limited: "ლიმიტი ამოიწურა (3/დღე, 10/თვე). სცადე მოგვიანებით.",
  unavailable: "სერვისი დროებით მიუწვდომელია.",
  generation_failed: "ვერ მოხერხდა გენერაცია. სცადე ხელახლა.",
};

/**
 * Slim "generate AI avatar" button for the owner's profile header. Hits the
 * same endpoint as the account-page generator (which sets the new image as
 * the main avatar) and refreshes so the carousel/header update in place.
 */
export function AiAvatarButton({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale !== "ka";
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/avatar/generate", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(
          en
            ? "Avatar generation failed. Please try again."
            : (ERRORS[data.error ?? ""] ?? "რაღაც ვერ მოხერხდა."),
        );
        return;
      }
      router.refresh();
    } catch {
      setError(
        en
          ? "Network error. Please try again."
          : "ქსელის შეცდომა. სცადე ხელახლა.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <Button
        type="button"
        variant="mystic"
        size="sm"
        className="w-full"
        onClick={generate}
        disabled={busy}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {busy
          ? en
            ? "Creating…"
            : "იქმნება…"
          : en
            ? "AI avatar"
            : "AI ავატარი"}
      </Button>
      {error && (
        <p className="mt-2 text-center text-xs text-[var(--vivida-pink)]">
          {error}
        </p>
      )}
    </div>
  );
}
