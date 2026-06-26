"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Headphones, Loader2, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HOROSCOPE_VOICES } from "@/lib/horoscope-voices";

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
  const audioRef = useRef<HTMLAudioElement>(null);

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
    return (
      <div className="relative mt-5 rounded-xl border border-[var(--vivida-violet)]/30 bg-card/50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--vivida-cyan)]">
          <Check className="size-4" />
          მზადაა
        </div>
        <audio ref={audioRef} src={audioUrl} controls autoPlay className="w-full" />
        <button
          type="button"
          onClick={() => setStatus("choosing")}
          className="mt-2 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ხმის შეცვლა
        </button>
      </div>
    );
  }

  return (
    <div className="relative mt-5">
      <Button type="button" variant="outline" size="lg" onClick={onListen}>
        <Headphones className="size-4" />
        მოისმინე ჰოროსკოპი
      </Button>
      {status === "error" && error && (
        <p className="mt-2 text-sm text-[var(--vivida-pink)]">{error}</p>
      )}
    </div>
  );
}
