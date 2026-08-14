"use client";

import { Pause, Play, X } from "lucide-react";

import { useAudioPlayer } from "./audio-provider";
import { EqBars } from "./eq-bars";

function fmt(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/**
 * Global "now playing" bar — a floating pill fixed near the bottom that shows
 * whenever audio is active and persists across page navigation (it lives in
 * the layout-mounted AudioPlayerProvider subtree). Centered + max-width so it
 * leaves the bottom-right corner free for the chat button.
 */
export function NowPlayingBar() {
  const { track, playing, currentTime, duration, toggle, seekRatio, stop } =
    useAudioPlayer();
  const en =
    typeof document !== "undefined" && document.documentElement.lang === "en";

  if (!track) return null;
  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.75rem_+_env(safe-area-inset-bottom))] z-40 px-4 lg:bottom-4">
      <div className="mx-auto flex max-w-xl items-center gap-3 overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-card/85 p-2.5 shadow-2xl ring-1 ring-foreground/10 backdrop-blur-xl sm:gap-4 sm:p-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? (en ? "Pause" : "პაუზა") : en ? "Play" : "დაკვრა"}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] text-white shadow-lg shadow-[var(--vivida-violet)]/40 transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <Pause className="size-5" /> : <Play className="size-5 translate-x-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground/90">
              <EqBars playing={playing} />
              <span className="truncate">
                {track.title}
                {track.subtitle ? (
                  <span className="text-muted-foreground"> · {track.subtitle}</span>
                ) : null}
              </span>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>
          <div
            role="slider"
            aria-label={en ? "Playback position" : "დაკვრის პოზიცია"}
            aria-valuenow={Math.round(pct)}
            tabIndex={0}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seekRatio((e.clientX - rect.left) / rect.width);
            }}
            className="mt-2 h-1.5 w-full cursor-pointer rounded-full bg-foreground/15"
          >
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={stop}
          aria-label={en ? "Close" : "დახურვა"}
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card/80 hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
