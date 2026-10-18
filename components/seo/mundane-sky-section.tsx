import Link from "next/link";

import { locativeKa } from "@/lib/georgian";
import { computeMundaneSky } from "@/lib/mundane-sky";

/**
 * "Today's sky" strip for the horoscope SEO hubs — calibrated astronomical
 * telemetry table (planet-in-sign positions + the day's tightest aspects),
 * Georgian-labelled.
 */
export function MundaneSkySection({
  date,
  heading = "დღევანდელი ცა · ეფემერიდა",
  sub = "პლანეტების რეალური მდებარეობა და დღის მთავარი ასპექტები — ეს ის ასტრონომიული ფონია, რომელზეც დღის ჰოროსკოპი დგება.",
}: {
  date: Date;
  heading?: string;
  sub?: string;
}) {
  const sky = computeMundaneSky(date);
  const FAMILY_TONE: Record<string, string> = {
    harmonic: "var(--vivida-cyan)",
    tense: "var(--vivida-pink)",
    neutral: "var(--primary)",
  };

  return (
    <section className="mt-12 rounded-md border border-border bg-card">
      <div className="flex flex-col justify-between gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-end sm:px-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            EPHEMERIS TELEMETRY
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {sub}
          </p>
        </div>
        <Link
          href="/sky"
          className="shrink-0 font-mono text-xs text-primary transition-colors hover:underline"
        >
          ცა ახლა →
        </Link>
      </div>

      {/* Calibrated Planet-in-Sign Telemetry Grid */}
      <ul className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-5">
        {sky.planets.map((p) => (
          <li
            key={p.key}
            className="flex flex-col justify-between bg-card px-4 py-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-foreground">
                {p.labelKa}
              </span>
              <span
                aria-hidden
                className="font-mono text-sm text-primary"
              >
                {p.symbol}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span aria-hidden className="text-foreground/80">
                {p.signSymbol}
              </span>
              <span className="truncate">{locativeKa(p.signKa)}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Day's tightest aspects */}
      {sky.aspects.length > 0 && (
        <div className="border-t border-border px-5 py-4 sm:px-6">
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            დღის მთავარი ასპექტები
          </h3>
          <ul className="mt-3 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2">
            {sky.aspects.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-2.5 bg-background/60 px-3.5 py-2.5 text-xs sm:text-sm"
              >
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-none"
                  style={{ background: FAMILY_TONE[a.family] }}
                />
                <span className="min-w-0 truncate text-foreground/90">
                  {a.aSymbol} {a.aKa} ·{" "}
                  <span className="text-muted-foreground">{a.kindKa}</span> ·{" "}
                  {a.bSymbol} {a.bKa}
                </span>
                <span className="ml-auto shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {a.orb.toFixed(1)}°
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
