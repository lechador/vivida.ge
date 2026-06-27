"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Share2 } from "lucide-react";

import { reactToPost, type FeedReactionCounts } from "@/actions/feed";
import type { PostReactionKind } from "@/db/schema";
import { cn } from "@/lib/utils";

import { ReactionIcon, REACTION_BY_KIND } from "./reaction-icons";
import { ReactionPicker } from "./reaction-picker";
import { ReactionSummary } from "./reaction-summary";

/** Length of grace period between trigger-leave and picker close so a
 *  cursor that wobbles between the two elements doesn't snap shut. */
const PICKER_CLOSE_DELAY_MS = 220;
/** Long-press duration that opens the picker on touch devices. */
const LONG_PRESS_MS = 350;

/**
 * Facebook-style action footer for a post:
 *
 *   [reaction summary]                    [N კომენტარი]
 *   ───────────────────────────────────────────────────
 *   [   ლაიქი   ] │ [   კომენტარი   ] │ [   გაზიარება   ]
 *
 * Hovering "ლაიქი" opens a floating picker with the four custom
 * reaction icons. Single-tap toggles `like`; long-press on touch
 * opens the picker. The active reaction (if any) colours the
 * button label and swaps in the matching icon.
 */
export function PostActions({
  postId,
  initialCounts,
  initialMine,
  commentCount,
  onToggleComments,
}: {
  postId: string;
  initialCounts: FeedReactionCounts;
  initialMine: PostReactionKind | null;
  commentCount: number;
  onToggleComments: () => void;
}) {
  const [counts, setCounts] = useState<FeedReactionCounts>(initialCounts);
  const [mine, setMine] = useState<PostReactionKind | null>(initialMine);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareLabel, setShareLabel] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  // Cancel any pending picker-close timers when the component unmounts.
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  function applyReaction(kind: PostReactionKind) {
    // Optimistic update. The reactToPost server action is idempotent
    // on the (post, user) pair — same kind clicked twice = toggle off,
    // different kind = switch.
    const prevCounts = counts;
    const prevMine = mine;
    const nextCounts: FeedReactionCounts = { ...counts };
    let nextMine: PostReactionKind | null;
    if (mine === kind) {
      nextCounts[kind] = Math.max(0, nextCounts[kind] - 1);
      nextMine = null;
    } else {
      if (mine) nextCounts[mine] = Math.max(0, nextCounts[mine] - 1);
      nextCounts[kind] = nextCounts[kind] + 1;
      nextMine = kind;
    }
    setCounts(nextCounts);
    setMine(nextMine);
    setPickerOpen(false);

    startTransition(async () => {
      const res = await reactToPost(postId, kind);
      if (!res.ok) {
        setCounts(prevCounts);
        setMine(prevMine);
      }
    });
  }

  // ── Picker open/close gestures ─────────────────────────────────────
  function openPickerSoon() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setPickerOpen(true);
  }
  function closePickerSoon() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setPickerOpen(false);
    }, PICKER_CLOSE_DELAY_MS);
  }
  function onLikePointerDown() {
    longPressFired.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      setPickerOpen(true);
    }, LONG_PRESS_MS);
  }
  function onLikePointerCancel() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }
  function onLikeClick() {
    // Long-press already handled the open — swallow the trailing click.
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    applyReaction("like");
  }

  // ── Share ──────────────────────────────────────────────────────────
  async function onShareClick() {
    const url = `${window.location.origin}/feed/${postId}`;
    try {
      if (navigator.share) {
        await navigator.share({ url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareLabel("ბმული დაკოპირდა");
      setTimeout(() => setShareLabel(null), 1800);
    } catch {
      // User cancelled the share sheet, or clipboard write blocked.
      // Don't surface as an error — share is a non-essential nicety.
    }
  }

  const activeMeta = mine ? REACTION_BY_KIND[mine] : null;
  const likeLabel = activeMeta?.labelKa ?? "ლაიქი";
  const likeColor = activeMeta?.hue;

  return (
    <>
      {/* Summary line — reactions on the left, comment count on the
          right. Hidden when there's nothing to show on either side. */}
      {(counts.like + counts.dislike + counts.funny + counts.sad > 0 ||
        commentCount > 0) && (
        <div className="mt-3 flex items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
          <ReactionSummary counts={counts} />
          {commentCount > 0 && (
            <button
              type="button"
              onClick={onToggleComments}
              className="tabular-nums transition-colors hover:text-foreground"
            >
              {commentCount} კომენტარი
            </button>
          )}
        </div>
      )}

      {/* Divider — sits above the action triplet, matches FB. */}
      <div className="mt-2 grid grid-cols-3 border-t border-border/50 pt-1">
        {/* Like */}
        <div
          className="relative"
          onMouseEnter={openPickerSoon}
          onMouseLeave={closePickerSoon}
        >
          <ReactionPicker
            open={pickerOpen}
            onPick={applyReaction}
            onRequestClose={() => setPickerOpen(false)}
          />
          <button
            type="button"
            onClick={onLikeClick}
            onPointerDown={onLikePointerDown}
            onPointerUp={onLikePointerCancel}
            onPointerLeave={onLikePointerCancel}
            onPointerCancel={onLikePointerCancel}
            aria-haspopup="menu"
            aria-expanded={pickerOpen}
            aria-pressed={!!mine}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-card/70",
              mine
                ? "text-[var(--reaction-color)]"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={
              {
                ["--reaction-color" as string]: likeColor,
              } as React.CSSProperties
            }
          >
            {mine ? (
              <ReactionIcon kind={mine} active size={18} />
            ) : (
              <ReactionIcon kind="like" size={18} />
            )}
            {likeLabel}
          </button>
        </div>

        {/* Comment */}
        <button
          type="button"
          onClick={onToggleComments}
          className="flex w-full items-center justify-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground"
        >
          <CommentGlyph />
          კომენტარი
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={onShareClick}
          className="flex w-full items-center justify-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card/70 hover:text-foreground"
        >
          <Share2 className="size-[18px]" />
          {shareLabel ?? "გაზიარება"}
        </button>
      </div>
    </>
  );
}

/** Minimal speech-bubble glyph — Lucide's MessageCircle is fine but
 *  visually heavier than the sleek thin-line look we want next to
 *  the bespoke reaction icons. */
function CommentGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.5-5.6A8.5 8.5 0 1 1 21 12z" />
    </svg>
  );
}
