"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Sparkles, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { sendFriendRequest } from "@/actions/friendship";
import type { DiscoverCard } from "@/lib/discover";

export function SuggestedPersonCard({ person }: { person: DiscoverCard }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (sent) return;
    setError(null);
    startTransition(async () => {
      const result = await sendFriendRequest(person.userId, person.username);
      if (result.ok) setSent(true);
      else setError(result.error);
    });
  };

  const avatarSrc = person.photoUrl ?? person.image;

  return (
    <article className="group relative flex w-44 shrink-0 flex-col items-center overflow-hidden rounded-2xl border border-border bg-card/65 p-3 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:bg-card/80 hover:ring-foreground/15 sm:w-48">
      <Link
        href={`/u/${person.username}`}
        className="flex w-full flex-col items-center"
        aria-label={`${person.displayName}-ის პროფილი`}
      >
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-1 rounded-full bg-[conic-gradient(from_0deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan),var(--vivida-violet))] opacity-50 blur-md transition-opacity group-hover:opacity-80"
          />
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt=""
              width={64}
              height={64}
              className="relative size-14 rounded-full border-2 border-background object-cover"
            />
          ) : (
            <div className="relative grid size-14 place-items-center rounded-full border-2 border-background bg-card text-base text-muted-foreground">
              {person.displayName[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <h3 className="mt-2 w-full truncate text-center text-sm font-medium text-foreground">
          {person.displayName}
        </h3>
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          <span className="mr-1">{person.sunSign.symbol}</span>
          {person.sunSign.labelKa}
        </div>
      </Link>

      {person.compatibility != null && (
        <div className="mt-2 flex items-center gap-1.5 rounded-full border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 px-2 py-0.5 text-[11px]">
          <Sparkles className="size-3 text-[var(--vivida-violet)]" />
          <span className="font-semibold tabular-nums text-foreground">
            {person.compatibility}%
          </span>
          <span className="text-muted-foreground">თავსებადი</span>
        </div>
      )}

      <Button
        variant={sent ? "outline" : "mystic"}
        size="sm"
        className="mt-3 h-8 w-full rounded-lg px-2 text-xs"
        disabled={isPending || sent}
        onClick={handleAdd}
      >
        {sent ? (
          <>
            <Check className="size-3.5" />
            გაგზავნილი
          </>
        ) : (
          <>
            <UserPlus className="size-3.5" />
            {isPending ? "იგზავნება…" : "დამატება"}
          </>
        )}
      </Button>

      {error && (
        <p className="mt-1 line-clamp-2 text-center text-[10px] text-destructive">
          {error}
        </p>
      )}
    </article>
  );
}
