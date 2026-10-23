"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Compact one-line banner prompting users without a birth date to add it,
 * so tarot spreads and the astrologer can factor in their zodiac sign.
 */
export function InlineBirthDatePrompt({ locale }: { locale: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const en = locale !== "ka";

  async function handleSave() {
    if (!value || saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/birth-date", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dateOfBirth: value }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        setError(
          data?.error ??
            (en ? "Could not save, try again" : "ვერ შეინახა, ცადე თავიდან"),
        );
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/[0.06] px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 text-sm leading-snug text-foreground">
          {saved
            ? en
              ? "Saved ✓"
              : "შენახულია ✓"
            : en
              ? "Add your birth date so the cards and astrologer can factor in your zodiac sign"
              : "მიუთითე შენი დაბადების თარიღი, რომ კარტებმა და ასტროლოგმა შენი ზოდიაქოც გაითვალისწინოს"}
        </p>
        {!saved && (
          <div className="flex shrink-0 items-center gap-2">
            <input
              type="date"
              value={value}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setValue(e.target.value)}
              aria-label={en ? "Birth date" : "დაბადების თარიღი"}
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm text-foreground"
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={!value || saving}
              className="h-9 shrink-0 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
            >
              {saving ? "…" : en ? "Save" : "შენახვა"}
            </button>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
