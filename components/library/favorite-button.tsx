"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";

import { setLibraryFavorite } from "@/actions/library";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { cn } from "@/lib/utils";

export function LibraryFavoriteButton({
  entryId,
  initialFavorite,
  locale,
}: {
  entryId: string;
  initialFavorite: boolean;
  locale: UserLocale;
}) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();
  const en = locale === "en";
  const label = favorite
    ? en
      ? "Remove from favorites"
      : "რჩეულებიდან ამოშლა"
    : en
      ? "Add to favorites"
      : "რჩეულებში დამატება";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={pending}
      onClick={() => {
        const next = !favorite;
        setFavorite(next);
        startTransition(async () => {
          try {
            await setLibraryFavorite(entryId, next);
          } catch {
            setFavorite(!next);
          }
        });
      }}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full border transition-all disabled:opacity-60",
        favorite
          ? "border-[var(--vivida-gold)]/45 bg-[var(--vivida-gold)]/12 text-[var(--vivida-gold)]"
          : "border-border bg-card/60 text-muted-foreground hover:border-[var(--vivida-gold)]/35 hover:text-[var(--vivida-gold)]",
      )}
    >
      <Star className={cn("size-4", favorite && "fill-current")} />
    </button>
  );
}
