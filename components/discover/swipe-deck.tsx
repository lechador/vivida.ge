"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, RotateCcw } from "lucide-react";
import { useMotionValue, animate } from "framer-motion";

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
export function SwipeDeck({ cards }: { cards: DiscoverCard[] }) {
  const router = useRouter();
  const [deck, setDeck] = useState(cards);
  const [exhausted, setExhausted] = useState(false);
  const x = useMotionValue(0);

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
      animate(x, 480, {
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => {
          advance();
          router.push(`/u/${card.username}`);
        },
      });
    },
    [advance, router, x]
  );

  if (exhausted || deck.length === 0) {
    return <DeckExhausted onReshuffle={() => router.refresh()} />;
  }

  // Render the top card + the next two as a stack. Trim the visible
  // window aggressively so we don't ship 60 hidden cards in the DOM.
  const visible = deck.slice(0, 3);

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div
        className="relative aspect-[3/4] w-full"
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
          // Render bottom-up so the top card stacks last and naturally
          // sits on top of the others in the DOM.
          .reverse()}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        გადაიტანე მარჯვნივ პროფილზე გადასასვლელად, მარცხნივ — გასატოვებლად.
      </p>
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
