"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, UserPlus, X } from "lucide-react";
import { motion, type MotionValue, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import type { DiscoverCard as Card } from "@/lib/discover";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { VerifiedBadge } from "@/components/profile/verified-badge";

const ELEMENT_EN: Record<string, string> = {
  ცეცხლი: "Fire",
  მიწა: "Earth",
  ჰაერი: "Air",
  წყალი: "Water",
};

/**
 * Tinder-style swipe card. Drag the front card horizontally to dismiss
 * (left = pass, right = visit profile). Tap the photo's left/right
 * thirds to flip through additional photos. Pass/like buttons mirror
 * the swipe gestures for users who'd rather not drag.
 */
export function SwipeCard({
  card,
  isTop,
  index,
  x,
  onPass,
  onLike,
  locale = "ka",
}: {
  card: Card;
  isTop: boolean;
  /** Stack offset, 0 is top, 1 sits behind, 2 sits even further back. */
  index: number;
  /** Drag X motion value of the top card; lets the back cards subtly
   *  follow. Only respected when index > 0. */
  x: MotionValue<number>;
  onPass: () => void;
  onLike: () => void;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos =
    card.photos.length > 0 ? card.photos : card.photoUrl ? [card.photoUrl] : [];
  const heroSrc = photos[photoIdx] ?? card.image ?? null;

  // Stack effect: each card behind sits a touch lower and smaller. While
  // the top card drags, the next-up scales up gently to fake "rising up".
  const baseScale = 1 - index * 0.04;
  const baseY = index * 10;
  const followScale = useTransform(
    x,
    [-200, 0, 200],
    [Math.min(1, baseScale + 0.04), baseScale, Math.min(1, baseScale + 0.04)],
  );
  const followY = useTransform(
    x,
    [-200, 0, 200],
    [baseY - 6, baseY, baseY - 6],
  );

  // Top-card overlays follow the drag, pink ❤ on right, red ✕ on left.
  const likeOpacity = useTransform(x, [40, 140], [0, 1]);
  const passOpacity = useTransform(x, [-140, -40], [1, 0]);
  const cardRotate = useTransform(x, [-220, 0, 220], [-12, 0, 12]);

  function nextPhoto() {
    if (photos.length <= 1) return;
    setPhotoIdx((i) => (i + 1) % photos.length);
  }
  function prevPhoto() {
    if (photos.length <= 1) return;
    setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
  }

  const compatibility = card.compatibility;
  const ageLabel = card.age != null ? `, ${card.age}` : "";

  return (
    <motion.article
      style={
        isTop ? { x, rotate: cardRotate } : { scale: followScale, y: followY }
      }
      drag={isTop ? "x" : false}
      dragElastic={0.7}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 110) onLike();
        else if (info.offset.x < -110) onPass();
      }}
      className={cn(
        "absolute inset-0 select-none overflow-hidden rounded-3xl border-2 border-[var(--vivida-violet)]/45 bg-[oklch(0.16_0.05_290/0.95)] shadow-[0_25px_60px_-12px_oklch(0.13_0.03_280/0.7)]",
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none",
        !isTop && "shadow-none",
      )}
      aria-hidden={!isTop}
    >
      {/* Photo / fallback */}
      <div className="relative size-full">
        <Image
          key={`${card.userId}-${photoIdx}`}
          src={heroSrc || DEFAULT_AVATAR}
          alt=""
          fill
          sizes="(min-width: 640px) 420px, 100vw"
          className="object-cover"
          priority={isTop}
        />

        {/* Photo carousel tap zones */}
        {photos.length > 1 && isTop && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              aria-label={en ? "Previous photo" : "წინა ფოტო"}
              className="absolute inset-y-0 left-0 z-10 w-1/3"
            />
            <button
              type="button"
              onClick={nextPhoto}
              aria-label={en ? "Next photo" : "შემდეგი ფოტო"}
              className="absolute inset-y-0 right-0 z-10 w-1/3"
            />
            {/* Photo dots */}
            <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center gap-1 px-3">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 max-w-12 rounded-full transition-colors",
                    i === photoIdx ? "bg-white/95" : "bg-white/25",
                  )}
                />
              ))}
            </div>
          </>
        )}

        {/* Compatibility chip, top-right */}
        {compatibility !== null && (
          <div className="pointer-events-none absolute right-3 top-3 z-20">
            <CompatChip percent={compatibility} />
          </div>
        )}

        {/* Drag overlays */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="pointer-events-none absolute left-6 top-8 z-30 rotate-[-12deg] rounded-xl border-4 border-[var(--vivida-pink)] px-3 py-1 text-2xl font-black uppercase tracking-widest text-[var(--vivida-pink)]"
            >
              {en ? "CONNECT" : "მეგობრობა"}
            </motion.div>
            <motion.div
              style={{ opacity: passOpacity }}
              className="pointer-events-none absolute right-6 top-8 z-30 rotate-[12deg] rounded-xl border-4 border-[var(--destructive)] px-3 py-1 text-2xl font-black uppercase tracking-widest text-[var(--destructive)]"
            >
              {en ? "PASS" : "გავტოვო"}
            </motion.div>
          </>
        )}

        {/* Bottom info gradient + text */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[oklch(0.10_0.05_290/0.95)] via-[oklch(0.14_0.05_290/0.7)] to-transparent p-5 pt-16">
          <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
            <h3 className="text-pretty text-2xl font-semibold tracking-tight text-foreground">
              {card.displayName}
              {card.verified && (
                <VerifiedBadge className="ml-1.5 inline-flex align-middle" />
              )}
              <span className="text-foreground/85">{ageLabel}</span>
            </h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-xs text-foreground/95 backdrop-blur">
              <span aria-hidden>{card.sunSign.symbol}</span>
              {en ? card.sunSign.labelEn : card.sunSign.labelKa}
            </span>
            <span className="text-xs text-foreground/65">
              {en
                ? (ELEMENT_EN[card.sunElement] ?? card.sunElement)
                : card.sunElement}
            </span>
          </div>
          {card.bio && (
            <p className="mt-2 line-clamp-2 text-sm leading-snug text-foreground/85">
              {card.bio}
            </p>
          )}
          {isTop && (
            <div className="pointer-events-auto mt-3 flex items-center gap-2.5">
              <button
                type="button"
                onClick={onPass}
                aria-label={en ? "Pass" : "გავტოვო"}
                className="grid size-11 place-items-center rounded-full border border-[var(--destructive)]/55 bg-background/60 text-[var(--destructive)] backdrop-blur transition-all hover:scale-105 hover:bg-[var(--destructive)]/15 active:scale-95"
              >
                <X className="size-5" />
              </button>
              <Link
                href={`/u/${card.username}`}
                aria-label={en ? "Profile" : "პროფილი"}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-foreground/95 backdrop-blur transition-all hover:bg-white/15"
              >
                <Sparkles className="size-3.5" />
                {en ? "Profile" : "პროფილი"}
              </Link>
              <button
                type="button"
                onClick={onLike}
                aria-label={en ? "Send friend request" : "მეგობრობის თხოვნა"}
                className="grid size-12 place-items-center rounded-full border-2 border-[var(--vivida-pink)] bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] text-white shadow-[0_10px_28px_-8px_oklch(0.72_0.22_350/0.7)] transition-all hover:scale-105 active:scale-95"
              >
                <UserPlus className="size-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function CompatChip({ percent }: { percent: number }) {
  const tier =
    percent >= 80
      ? "high"
      : percent >= 65
        ? "good"
        : percent >= 50
          ? "mid"
          : "low";
  const styles = {
    high: "bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] text-white shadow-[0_8px_24px_-6px_oklch(0.72_0.22_350/0.7)]",
    good: "bg-[var(--vivida-cyan)] text-background",
    mid: "bg-foreground/15 text-foreground/95 backdrop-blur",
    low: "bg-foreground/10 text-foreground/80 backdrop-blur",
  }[tier];
  return (
    <span
      className={cn(
        "rounded-full border border-white/20 px-2.5 py-1 text-sm font-bold tabular-nums backdrop-blur-md",
        styles,
      )}
    >
      {percent}
      <span className="ml-0.5 text-[10px] opacity-80">%</span>
    </span>
  );
}
