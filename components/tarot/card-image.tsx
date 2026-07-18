"use client";

import { useState } from "react";

/**
 * A single tarot illustration with a styled fallback. The 22 artworks live at
 * /tarot/<slug>.webp; until they're added (or if one fails to load) we show a
 * card-back with the glyph + Georgian name so the page never renders a broken
 * image. Client component only because it needs the <img> onError hook.
 */
export function CardImage({
  slug,
  nameKa,
  glyph,
  className,
  priority,
}: {
  slug: string;
  nameKa: string;
  glyph: string;
  className?: string;
  priority?: boolean;
}) {
  const [ok, setOk] = useState(true);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/40 bg-[oklch(0.18_0.05_285)] ring-1 ring-foreground/10 ${
        className ?? ""
      }`}
    >
      <div className="aspect-[2/3]">
        {ok ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/tarot/${slug}.webp`}
            alt={`ტაროს კარტი — ${nameKa}`}
            loading={priority ? "eager" : "lazy"}
            onError={() => setOk(false)}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-3 bg-[radial-gradient(70%_60%_at_50%_30%,oklch(0.32_0.14_300/0.6),transparent_70%)] p-4 text-center">
            <span className="text-6xl">{glyph}</span>
            <span className="text-sm font-medium text-foreground/85">
              {nameKa}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
