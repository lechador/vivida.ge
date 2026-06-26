"use client";

import { useState, useTransition } from "react";
import { Check, Headphones } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setHoroscopeVoice } from "@/actions/horoscope-voice";
import { HOROSCOPE_VOICES, DEFAULT_VOICE_SLUG } from "@/lib/horoscope-voices";
import { cn } from "@/lib/utils";

const LS_KEY = "vivida_horoscope_voice";

export function HoroscopeVoiceCard({ initial }: { initial: string | null }) {
  const start = initial ?? DEFAULT_VOICE_SLUG;
  const [voice, setVoice] = useState(start);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const dirty = voice !== start;

  const onSave = () => {
    startTransition(async () => {
      const res = await setHoroscopeVoice(voice);
      if (res.ok) {
        try {
          localStorage.setItem(LS_KEY, voice);
        } catch {
          /* ignore */
        }
        setSavedAt(Date.now());
      }
    });
  };

  return (
    <div className="rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <header className="mb-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Headphones className="size-5 text-[var(--vivida-violet)]" />
          ჰოროსკოპის ხმა
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          რომელი ხმით მოგისმინო დღევანდელი ჰოროსკოპი.
        </p>
      </header>

      <div className="space-y-3">
        {HOROSCOPE_VOICES.map((v) => {
          const on = voice === v.slug;
          return (
            <button
              key={v.slug}
              type="button"
              onClick={() => setVoice(v.slug)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all",
                on
                  ? "border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/10 to-[var(--vivida-cyan)]/10"
                  : "border-border bg-card/40 hover:bg-card/60"
              )}
            >
              <div className="min-w-0">
                <div className="text-sm font-medium">{v.labelKa}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{v.descKa}</div>
              </div>
              {on && <Check className="size-5 shrink-0 text-[var(--vivida-cyan)]" />}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {savedAt && !isPending && !dirty && "შენახულია ✓"}
        </div>
        <Button type="button" onClick={onSave} disabled={isPending || !dirty} size="sm">
          {isPending ? "ინახება…" : "შენახვა"}
        </Button>
      </div>
    </div>
  );
}
