"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones, Loader2, Pause, Play, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HOROSCOPE_VOICES } from "@/lib/horoscope-voices";

function fmtTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

type Status = "idle" | "choosing" | "generating" | "ready" | "error";

const LS_KEY = "vivida_horoscope_voice";

const ERRORS: Record<string, string> = {
  no_horoscope: "დღევანდელი ჰოროსკოპი ჯერ მზადდება — სცადე ცოტა ხანში.",
  audio_unavailable: "აუდიო დროებით მიუწვდომელია.",
  rate_limited: "ბევრი მოთხოვნა — სცადე ცოტა ხანში.",
  generation_failed: "ხმის შექმნა ვერ მოხერხდა. სცადე ხელახლა.",
  no_profile: "პროფილი ვერ მოიძებნა.",
};

const GEN_MESSAGES = [
  "ვამზადებთ აუდიოს…",
  "ხმა იწერება…",
  "თითქმის მზადაა…",
];

/**
 * "Listen to today's horoscope" — generates ElevenLabs audio on demand (cached
 * in R2 server-side) with a smooth progress state, and lets the user pick a
 * voice on first play. The chosen voice is remembered (localStorage + server).
 */
export function HoroscopeAudioPlayer({
  savedVoice,
}: {
  savedVoice?: string | null;
}) {
  const [status, setStatus] = useState<Status>("idle");
  // Saved preference wins; otherwise the locally remembered choice (read once,
  // lazily — localStorage is client-only and `voice` never affects SSR output).
  const [voice, setVoice] = useState<string | null>(() => {
    if (savedVoice) return savedVoice;
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(LS_KEY);
    } catch {
      return null;
    }
  });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const voiceLabel =
    HOROSCOPE_VOICES.find((v) => v.slug === voice)?.labelKa ?? "ჰოროსკოპი";

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = Math.max(0, Math.min(1, ratio)) * duration;
  }

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

  // Try to autoplay once ready (browsers may block — controls are the fallback).
  useEffect(() => {
    if (status === "ready") audioRef.current?.play().catch(() => {});
  }, [status, audioUrl]);

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
      setProgress(100);
      setAudioUrl(data.url);
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

  function pickVoice(slug: string) {
    setVoice(slug);
    generate(slug);
  }

  // ── Render ──
  if (status === "choosing") {
    return (
      <div className="relative mt-5 rounded-xl border border-[var(--vivida-violet)]/30 bg-card/50 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Volume2 className="size-4 text-[var(--vivida-violet)]" />
          აირჩიე ხმა
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {HOROSCOPE_VOICES.map((v) => (
            <button
              key={v.slug}
              type="button"
              onClick={() => pickVoice(v.slug)}
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

  if (status === "generating") {
    return (
      <div className="relative mt-5 rounded-xl border border-[var(--vivida-violet)]/30 bg-card/50 p-4">
        <div className="flex items-center gap-2 text-sm text-foreground/85">
          <Loader2 className="size-4 animate-spin text-[var(--vivida-violet)]" />
          {GEN_MESSAGES[stage]}
          <span className="ml-auto text-xs text-muted-foreground">
            დაიწყება ~10 წამში
          </span>
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

  if (status === "ready" && audioUrl) {
    const pct = duration ? (currentTime / duration) * 100 : 0;
    return (
      <div className="relative mt-5 overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-4 ring-1 ring-foreground/5 backdrop-blur-xl">
        <div
          aria-hidden
          className="absolute -right-12 -top-12 size-32 rounded-full bg-[radial-gradient(circle,var(--vivida-violet)_0%,transparent_70%)] opacity-25 blur-2xl"
        />
        <audio
          ref={audioRef}
          src={audioUrl}
          autoPlay
          hidden
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
        <div className="relative flex items-center gap-4">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "პაუზა" : "დაკვრა"}
            className="grid size-14 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] text-white shadow-lg shadow-[var(--vivida-violet)]/40 transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? (
              <Pause className="size-6" />
            ) : (
              <Play className="size-6 translate-x-0.5" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground/90">
                <Bars playing={playing} />
                <span className="truncate">დღევანდელი ჰოროსკოპი · {voiceLabel}</span>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {fmtTime(currentTime)} / {fmtTime(duration)}
              </span>
            </div>
            <div
              onClick={seek}
              role="slider"
              aria-label="დაკვრის პოზიცია"
              aria-valuenow={Math.round(pct)}
              tabIndex={0}
              className="mt-2.5 h-2 w-full cursor-pointer rounded-full bg-foreground/15"
            >
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setStatus("choosing");
          }}
          className="relative mt-3 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ხმის შეცვლა
        </button>
      </div>
    );
  }

  return (
    <div className="relative mt-5">
      <div className="relative inline-flex w-full sm:w-auto">
        {/* Soft pulsing glow to draw the eye to the new feature. */}
        <span
          aria-hidden
          className="absolute -inset-1 animate-pulse rounded-2xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] opacity-50 blur-lg"
        />
        <Button
          type="button"
          variant="mystic"
          size="lg"
          onClick={onListen}
          className="relative w-full justify-center shadow-xl shadow-[var(--vivida-violet)]/40 sm:w-auto"
        >
          <Headphones className="size-5" />
          მოისმინე ჰოროსკოპი
          <span className="ml-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            ახალი
          </span>
        </Button>
      </div>
      {status === "error" && error && (
        <p className="mt-2 text-sm text-[var(--vivida-pink)]">{error}</p>
      )}
    </div>
  );
}

/** Small animated equalizer that "dances" while audio plays. */
function Bars({ playing }: { playing: boolean }) {
  const heights = [9, 14, 6, 12];
  return (
    <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[2px] rounded-full bg-[var(--vivida-cyan)]"
          style={{
            height: h,
            transformOrigin: "bottom",
            opacity: playing ? 1 : 0.5,
            animation: playing ? "vivida-eq 0.85s ease-in-out infinite" : "none",
            animationDelay: `${i * 110}ms`,
          }}
        />
      ))}
    </span>
  );
}
