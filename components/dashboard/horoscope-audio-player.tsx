"use client";

import { useEffect, useState } from "react";
import { Headphones, Loader2, Pause, Play, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreditHint } from "@/components/credits/credit-hint";
import { CREDIT_COST } from "@/lib/credits-config";
import { HOROSCOPE_VOICES } from "@/lib/horoscope-voices";
import { useAudioPlayer } from "@/components/audio/audio-provider";
import { EqBars } from "@/components/audio/eq-bars";

type Status = "idle" | "choosing" | "generating" | "ready" | "error";

const LS_KEY = "vivida_horoscope_voice";
const TITLE = "დღევანდელი ჰოროსკოპი";

const ERRORS: Record<string, string> = {
  no_horoscope: "დღევანდელი ჰოროსკოპი ჯერ მზადდება — სცადე ცოტა ხანში.",
  audio_unavailable: "აუდიო დროებით მიუწვდომელია.",
  rate_limited: "ბევრი მოთხოვნა — სცადე ცოტა ხანში.",
  generation_failed: "ხმის შექმნა ვერ მოხერხდა. სცადე ხელახლა.",
  no_profile: "პროფილი ვერ მოიძებნა.",
};

const GEN_MESSAGES = ["ვამზადებთ აუდიოს…", "ხმა იწერება…", "თითქმის მზადაა…"];

/**
 * "Listen to today's horoscope" trigger. Generates ElevenLabs audio on demand
 * (cached in R2 server-side) with a smooth progress state + voice choice, then
 * hands playback to the global audio player so it keeps playing across page
 * navigation and shows in the persistent bottom bar.
 */
export function HoroscopeAudioPlayer({
  savedVoice,
}: {
  savedVoice?: string | null;
}) {
  const audio = useAudioPlayer();
  const [status, setStatus] = useState<Status>("idle");
  const [voice, setVoice] = useState<string | null>(() => {
    if (savedVoice) return savedVoice;
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(LS_KEY);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [myUrl, setMyUrl] = useState<string | null>(null);

  const voiceLabel =
    HOROSCOPE_VOICES.find((v) => v.slug === voice)?.labelKa ?? "";

  // Eased progress crawl + rotating message while generating.
  useEffect(() => {
    if (status !== "generating") return;
    const bar = setInterval(() => {
      setProgress((p) => (p >= 92 ? 92 : p + (92 - p) * 0.06));
    }, 300);
    const msg = setInterval(() => setStage((s) => (s + 1) % GEN_MESSAGES.length), 3000);
    return () => {
      clearInterval(bar);
      clearInterval(msg);
    };
  }, [status]);

  async function generate(v: string | null) {
    setError(null);
    setProgress(8);
    setStatus("generating");
    try {
      const res = await fetch("/api/horoscope/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v ? { voice: v } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(ERRORS[data.error] ?? "რაღაც ვერ მოხერხდა. სცადე ხელახლა.");
        setStatus("error");
        return;
      }
      setVoice(data.voice);
      try {
        localStorage.setItem(LS_KEY, data.voice);
      } catch {
        /* private mode — ignore */
      }
      setMyUrl(data.url);
      const label =
        HOROSCOPE_VOICES.find((x) => x.slug === data.voice)?.labelKa ?? "";
      audio.play({ url: data.url, title: TITLE, subtitle: label });
      setStatus("ready");
    } catch {
      setError("ქსელის შეცდომა. სცადე ხელახლა.");
      setStatus("error");
    }
  }

  function onListen() {
    if (voice) generate(voice);
    else setStatus("choosing");
  }

  // ── Voice picker ──
  if (status === "choosing") {
    return (
      <div className="relative mt-5 rounded-xl border border-[var(--vivida-violet)]/30 bg-card/50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Volume2 className="size-4 text-[var(--vivida-violet)]" />
          აირჩიე ხმა
        </div>
        <div className="mb-2">
          <CreditHint>ერთი მოსმენა · −2 კრედიტი</CreditHint>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {HOROSCOPE_VOICES.map((v) => (
            <button
              key={v.slug}
              type="button"
              onClick={() => {
                setVoice(v.slug);
                generate(v.slug);
              }}
              className="rounded-lg border border-border bg-card/60 p-3 text-left transition-colors hover:border-[var(--vivida-violet)]/50 hover:bg-card/90"
            >
              <div className="text-sm font-semibold">{v.labelKa}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{v.descKa}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Generating ──
  if (status === "generating") {
    return (
      <div className="relative mt-5 rounded-xl border border-[var(--vivida-violet)]/30 bg-card/50 p-4">
        <div className="flex items-center gap-2 text-sm text-foreground/85">
          <Loader2 className="size-4 animate-spin text-[var(--vivida-violet)]" />
          {GEN_MESSAGES[stage]}
          <span className="ml-auto text-xs text-muted-foreground">დაიწყება ~10 წამში</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  // ── Ready: compact handoff control (full transport lives in the bottom bar) ──
  if (status === "ready") {
    const mine = myUrl ? audio.isCurrent(myUrl) : false;
    const isPlaying = mine && audio.playing;
    return (
      <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/12 to-[var(--vivida-cyan)]/8 p-3 ring-1 ring-foreground/5 backdrop-blur-xl">
        <button
          type="button"
          aria-label={isPlaying ? "პაუზა" : "დაკვრა"}
          onClick={() => {
            if (mine) audio.toggle();
            else if (myUrl)
              audio.play({ url: myUrl, title: TITLE, subtitle: voiceLabel });
          }}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] text-white shadow-lg shadow-[var(--vivida-violet)]/40 transition-transform hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm font-medium text-foreground/90">
          <EqBars playing={isPlaying} />
          <span className="truncate">
            {TITLE}
            {voiceLabel ? <span className="text-muted-foreground"> · {voiceLabel}</span> : null}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setStatus("choosing")}
          className="shrink-0 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ხმის შეცვლა
        </button>
      </div>
    );
  }

  // ── Idle / error ──
  return (
    <div className="relative mt-5">
      <div className="relative flex w-full">
        <span
          aria-hidden
          className="absolute -inset-1 animate-pulse rounded-2xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] opacity-50 blur-lg"
        />
        <Button
          type="button"
          variant="mystic"
          size="lg"
          onClick={onListen}
          className="relative h-auto min-h-12 w-full flex-wrap justify-center gap-x-1.5 gap-y-1.5 whitespace-normal px-4 py-2.5 shadow-xl shadow-[var(--vivida-violet)]/40"
        >
          <Headphones className="size-5 shrink-0" />
          <span className="whitespace-nowrap">მოისმინე ჰოროსკოპი</span>
          <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold tabular-nums">
            −{CREDIT_COST.audioHoroscope} კრედიტი
          </span>
        </Button>
      </div>
      {status === "error" && error && (
        <p className="mt-2 text-sm text-[var(--vivida-pink)]">{error}</p>
      )}
    </div>
  );
}
