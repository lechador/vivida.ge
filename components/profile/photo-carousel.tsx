"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserLocale } from "@/lib/i18n/user-locale";

type Photo = { id: string; url: string };

/**
 * Tinder-style photo carousel:
 *  - Tap left third → previous photo
 *  - Tap right two-thirds → next photo
 *  - Indicator stripes at the top (Instagram-stories style)
 *  - Keyboard arrows when focused
 *  - Swipe left/right on touch
 */
export function PhotoCarousel({
  photos,
  locale = "ka",
}: {
  photos: Photo[];
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const [index, setIndex] = useState(0);
  const total = photos.length;

  if (total === 0) return null;
  // If `photos` shrank below `index` (e.g., a photo was deleted), clamp
  // during render rather than via an effect, both the visible photo and
  // the indicator dots use this safe value.
  const safeIndex = Math.min(index, total - 1);

  const go = (delta: number) => {
    setIndex((i) => {
      const next = i + delta;
      if (next < 0) return 0;
      if (next >= total) return total - 1;
      return next;
    });
  };

  const current = photos[safeIndex];

  return (
    <div
      className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-card/40 ring-1 ring-foreground/5"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        }
      }}
    >
      {/* Photo with crossfade */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={current.url}
            alt=""
            fill
            sizes="(min-width: 768px) 480px, 100vw"
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle gradient at the top so the indicator stripes are always readable */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent"
      />

      {/* Indicator stripes */}
      {total > 1 && (
        <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex gap-1.5">
          {photos.map((p, i) => (
            <span
              key={p.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i === safeIndex ? "bg-white" : "bg-white/35",
              )}
            />
          ))}
        </div>
      )}

      {/* Tap zones */}
      <SwipeZones
        onLeft={() => go(-1)}
        onRight={() => go(1)}
        index={safeIndex}
        total={total}
        locale={locale}
      />

      {/* Visible chevrons on hover (desktop) */}
      {total > 1 && (
        <>
          {safeIndex > 0 && (
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={en ? "Back" : "უკან"}
              className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 grid size-9 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/75 sm:grid group-hover:opacity-100"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
          {safeIndex < total - 1 && (
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={en ? "Forward" : "წინ"}
              className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 grid size-9 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition-opacity hover:bg-black/75 sm:grid group-hover:opacity-100"
            >
              <ChevronRight className="size-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}

/** Two invisible tap regions on top of the photo + horizontal-swipe support. */
function SwipeZones({
  onLeft,
  onRight,
  index,
  total,
  locale,
}: {
  onLeft: () => void;
  onRight: () => void;
  index: number;
  total: number;
  locale: UserLocale;
}) {
  const en = locale !== "ka";
  // Touch swipe state
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  return (
    <div
      className="absolute inset-0 z-10 flex select-none"
      onTouchStart={(e) => setTouchStartX(e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchStartX === null) return;
        const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
        setTouchStartX(null);
        if (Math.abs(dx) < 40) return;
        if (dx > 0) onLeft();
        else onRight();
      }}
    >
      <button
        type="button"
        aria-label={en ? "Previous photo" : "წინა ფოტო"}
        onClick={onLeft}
        className="h-full w-1/3 cursor-pointer focus:outline-none"
        disabled={index === 0}
      />
      <button
        type="button"
        aria-label={en ? "Next photo" : "შემდეგი ფოტო"}
        onClick={onRight}
        className="h-full flex-1 cursor-pointer focus:outline-none"
        disabled={index === total - 1}
      />
    </div>
  );
}
