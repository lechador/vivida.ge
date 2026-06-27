"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type AudioTrack = {
  /** playable URL (e.g. a signed R2 URL) */
  url: string;
  title: string;
  subtitle?: string;
};

type AudioApi = {
  track: AudioTrack | null;
  playing: boolean;
  currentTime: number;
  duration: number;
  /** Whether `url` is the currently-loaded track. */
  isCurrent: (url: string) => boolean;
  play: (t: AudioTrack) => void;
  toggle: () => void;
  seekRatio: (ratio: number) => void;
  stop: () => void;
};

const Ctx = createContext<AudioApi | null>(null);

export function useAudioPlayer(): AudioApi {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return c;
}

/**
 * App-wide audio player. The single <audio> element lives here (mounted in the
 * root layout), so playback continues uninterrupted across client-side page
 * navigations — only the page content unmounts, never this provider.
 */
export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const play = useCallback((t: AudioTrack) => {
    setTrack(t);
    setCurrentTime(0);
  }, []);

  // Load + play whenever a (new) track is set.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !track) return;
    if (el.src !== track.url) {
      el.src = track.url;
      el.load();
    }
    el.play().catch(() => {});
  }, [track]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }, []);

  const seekRatio = useCallback((ratio: number) => {
    const el = audioRef.current;
    if (!el || !el.duration) return;
    el.currentTime = Math.max(0, Math.min(1, ratio)) * el.duration;
  }, []);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setTrack(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const isCurrent = useCallback(
    (url: string) => track?.url === url,
    [track]
  );

  return (
    <Ctx.Provider
      value={{
        track,
        playing,
        currentTime,
        duration,
        isCurrent,
        play,
        toggle,
        seekRatio,
        stop,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        hidden
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </Ctx.Provider>
  );
}
