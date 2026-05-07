"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, animate } from "framer-motion";

import { sendFriendRequest } from "@/actions/friendship";
import { Button } from "@/components/ui/button";
import type { DiscoverCard } from "@/lib/discover";
import { SwipeCard } from "./swipe-card";

/**
 * Tinder-style stack of compatible profiles. Three cards are kept
 * mounted at any moment (top + 2 visible behind). Swiping the top
 * card right opens the partner's profile; left dismisses it. When
 * the deck empties we show a re-shuffle CTA so the user can keep
 * exploring.
 */
type Toast = {
  kind: "ok" | "err" | "info";
  text: string;
};

export function SwipeDeck({ cards }: { cards: DiscoverCard[] }) {
  const router = useRouter();
  const [deck, setDeck] = useState(cards);
  const [exhausted, setExhausted] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const x = useMotionValue(0);

  // Auto-dismiss toast.
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const advance = useCallback(() => {
    setDeck((prev) => {
      const [, ...rest] = prev;
      if (rest.length === 0) setExhausted(true);
      return rest;
    });
    x.set(0);
  }, [x]);

  const handlePass = useCallback(() => {
    animate(x, -480, {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
      onComplete: advance,
    });
  }, [advance, x]);

  const handleLike = useCallback(
    (card: DiscoverCard) => {
      // Fire the friend request optimistically — animation runs in parallel
      // with the network call so the deck never feels laggy.
      sendFriendRequest(card.userId, card.username)
        .then((res) => {
          if (res.ok) {
            setToast({
              kind: "ok",
              text: `${card.displayName}-ს მეგობრობა გაიგზავნა`,
            });
          } else {
            setToast({ kind: "err", text: res.error });
          }
        })
        .catch(() => {
          setToast({ kind: "err", text: "ვერ გაიგზავნა — სცადე თავიდან" });
        });

      animate(x, 480, {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
        onComplete: advance,
      });
    },
    [advance, x]
  );

  if (exhausted || deck.length === 0) {
    return <DeckExhausted onReshuffle={() => router.refresh()} />;
  }

  const visible = deck.slice(0, 3);

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col lg:max-h-[760px]">
      <div
        className="relative w-full flex-1 min-h-0"
        style={{ perspective: "1500px" }}
      >
        {visible
          .map((card, i) => (
            <SwipeCard
              key={card.userId}
              card={card}
              isTop={i === 0}
              index={i}
              x={x}
              onPass={handlePass}
              onLike={() => handleLike(card)}
            />
          ))
          .reverse()}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        მარჯვნივ — მეგობრობის თხოვნა · მარცხნივ — სხვა
      </p>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.text}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={
              "fixed inset-x-4 z-50 mx-auto max-w-sm rounded-full border px-4 py-2.5 text-center text-sm font-medium shadow-[0_18px_50px_-12px_oklch(0.13_0.03_280/0.7)] backdrop-blur-xl bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-6 " +
              (toast.kind === "ok"
                ? "border-[var(--vivida-pink)]/55 bg-[oklch(0.22_0.08_350/0.92)] text-foreground"
                : toast.kind === "err"
                  ? "border-[var(--destructive)]/55 bg-[oklch(0.22_0.06_25/0.92)] text-foreground"
                  : "border-border bg-card/85 text-foreground")
            }
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DeckExhausted({ onReshuffle }: { onReshuffle: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center">
      <Compass className="mx-auto mb-3 size-8 text-muted-foreground" />
      <h2 className="text-lg font-semibold">დღეს ეს იყო</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        ცა მომდევნო ხალხს გელის — ცოტა მოგვიანებით ახალი პროფილები გამოჩნდება.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onReshuffle} variant="outline" size="sm">
          <RotateCcw className="size-4" />
          ხელახლა
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/friends">ჩემი მეგობრები →</Link>
        </Button>
      </div>
    </div>
  );
}
