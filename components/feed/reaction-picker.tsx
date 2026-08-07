"use client";

import { useEffect, useRef } from "react";

import type { PostReactionKind } from "@/db/schema";

import { ReactionIcon, REACTIONS } from "./reaction-icons";

/**
 * Floating reaction picker that hovers above the "ლაიქი" action
 * button. Matches the classic Facebook-style behaviour:
 *
 *  - Mouse: hover the trigger → picker fades in. Move into the
 *    picker to keep it open; leave both → fades out after a short
 *    grace period so a wobbly cursor path doesn't snap it shut.
 *  - Touch: long-press (≥350ms) the trigger to open. Tap outside or
 *    pick a reaction to close.
 *
 * Click handlers fire `onPick(kind)` which the parent forwards to
 * the server action. The component is presentation-only — it does
 * not own reaction state.
 */
export function ReactionPicker({
  open,
  onPick,
  onRequestClose,
}: {
  open: boolean;
  onPick: (kind: PostReactionKind) => void;
  onRequestClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Dismiss on outside-tap when open (covers the long-press flow on
  // touch where there's no mouseleave to lean on).
  useEffect(() => {
    if (!open) return;
    const onDocPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (root && !root.contains(e.target as Node)) {
        onRequestClose();
      }
    };
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [open, onRequestClose]);

  return (
    <div
      ref={rootRef}
      role="menu"
      aria-hidden={!open}
      data-open={open}
      className={`pointer-events-none absolute bottom-full left-0 z-30 mb-1.5 origin-bottom-left transition-all duration-150 data-[open=true]:pointer-events-auto data-[open=false]:scale-90 data-[open=true]:scale-100 data-[open=false]:opacity-0 data-[open=true]:opacity-100`}
    >
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/95 px-1.5 py-1 shadow-[0_18px_36px_-10px_oklch(0.20_0.10_300/0.55)] ring-1 ring-foreground/10 backdrop-blur-xl">
        {REACTIONS.map((r) => (
          <button
            key={r.kind}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPick(r.kind);
            }}
            aria-label={r.labelKa}
            className="group/btn relative grid size-9 place-items-center rounded-full transition-transform hover:scale-125"
            style={
              {
                ["--reaction-hue" as string]: r.hue,
              } as React.CSSProperties
            }
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity group-hover/btn:opacity-100"
              style={{
                background: `radial-gradient(circle, color-mix(in oklch, ${r.hue} 35%, transparent), transparent 70%)`,
              }}
            />
            <ReactionIcon kind={r.kind} active size={24} />
          </button>
        ))}
      </div>
    </div>
  );
}
