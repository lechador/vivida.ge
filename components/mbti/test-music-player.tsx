"use client";

import { useEffect, useRef, useState } from "react";
import { Music4, Pause } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

const PREF_KEY = "vivida_test_music";
const SRC = "/audio/test-ambient.mp3";
const VOLUME = 0.32;

/**
 * Ambient background-music toggle for the personality test — a calm, mystic
 * track (ElevenLabs) that loops while the user answers. Off by default (browser
 * autoplay policies block sound before a gesture); tapping it starts/stops and
 * the choice is remembered. If the visitor already opted in earlier we try to
 * resume (works when arriving via an in-app navigation, which counts as a
 * gesture).
 */
export function TestMusicPlayer({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale === "en";
  const am = locale === "am";
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [hinted, setHinted] = useState(false); // pulse to invite, once
  const [available, setAvailable] = useState(false); // audio file present?

  async function start() {
    const a = audioRef.current;
    if (!a) return;
    a.volume = VOLUME;
    try {
      await a.play();
      setPlaying(true);
      try {
        localStorage.setItem(PREF_KEY, "on");
      } catch {
        /* ignore */
      }
    } catch {
      /* autoplay blocked — user can tap again */
    }
  }

  function stop() {
    audioRef.current?.pause();
    setPlaying(false);
    try {
      localStorage.setItem(PREF_KEY, "off");
    } catch {
      /* ignore */
    }
  }

  // Only surface the control once the track is actually served (a HEAD probe
  // avoids a broken button if the asset hasn't been generated/deployed yet).
  useEffect(() => {
    let alive = true;
    fetch(SRC, { method: "HEAD" })
      .then((r) => {
         
        if (alive && r.ok) setAvailable(true);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Once available (audio element is mounted), resume prior choice or invite.
  useEffect(() => {
    if (!available) return;
    let on = false;
    try {
      on = localStorage.getItem(PREF_KEY) === "on";
    } catch {
      /* ignore */
    }
    /* eslint-disable react-hooks/set-state-in-effect */
    if (on) void start();
    else setHinted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
     
  }, [available]);

  if (!available) return null;

  return (
    <>
      <audio ref={audioRef} src={SRC} loop preload="none" />
      <button
        type="button"
        onClick={playing ? stop : start}
        aria-label={playing ? (am ? "Անջատել երաժշտությունը" : en ? "Turn music off" : "მუსიკის გამორთვა") : (am ? "Միացնել մեղմ երաժշտությունը" : en ? "Turn ambient music on" : "მისტიკური მუსიკის ჩართვა")}
        title={playing ? (am ? "Անջատել երաժշտությունը" : en ? "Turn music off" : "მუსიკის გამორთვა") : (am ? "Մեղմ երաժշտություն" : en ? "Ambient music" : "მისტიკური მუსიკა")}
        className={cn(
          "fixed right-4 bottom-24 z-40 grid size-12 place-items-center rounded-full sm:right-6 sm:bottom-6",
          "border border-[var(--vivida-violet)]/50 bg-[oklch(0.16_0.06_300/0.8)] text-[var(--vivida-cyan)] backdrop-blur-xl",
          "shadow-[0_0_24px_-6px_oklch(0.65_0.24_305/0.7)] transition-transform hover:scale-105",
          hinted && !playing && "vivida-music-pulse"
        )}
      >
        {playing ? (
          <span className="group flex items-end gap-[3px]" aria-hidden>
            {/* equalizer bars while playing; a pause icon shows on hover */}
            <span className="vivida-eq-bar h-3 w-[3px] rounded-full bg-current [animation-delay:-0.4s] group-hover:hidden" />
            <span className="vivida-eq-bar h-4 w-[3px] rounded-full bg-current [animation-delay:-0.2s] group-hover:hidden" />
            <span className="vivida-eq-bar h-2.5 w-[3px] rounded-full bg-current group-hover:hidden" />
            <Pause className="hidden size-5 group-hover:block" />
          </span>
        ) : (
          <Music4 className="size-5" />
        )}
      </button>
    </>
  );
}
