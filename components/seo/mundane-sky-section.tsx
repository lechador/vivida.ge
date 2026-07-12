import Link from "next/link";

import { locativeKa } from "@/lib/georgian";
import { computeMundaneSky } from "@/lib/mundane-sky";

/**
 * "Today's sky" strip for the horoscope SEO hubs — real ephemeris data
 * (planet-in-sign chips + the day's tightest aspects), Georgian-labelled.
 * Server component, pure math: refreshes with each ISR revalidation, giving
 * the hubs unique transit-based content that changes daily.
 */
export function MundaneSkySection({
  date,
  heading = "დღევანდელი ცა",
  sub = "პლანეტების რეალური მდებარეობა და დღის მთავარი ასპექტები — ეს ის ფონია, რომელზეც დღის ჰოროსკოპი დგება.",
}: {
  date: Date;
  heading?: string;
  sub?: string;
}) {
  const sky = computeMundaneSky(date);
  const FAMILY_TONE: Record<string, string> = {
    harmonic: "var(--vivida-cyan)",
    tense: "var(--vivida-pink)",
    neutral: "var(--vivida-violet)",
  };

  return (
    <section className="mt-12 rounded-2xl border border-border bg-card/50 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-7">
      <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
      <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{sub}</p>

      {/* Planet-in-sign chips */}
      <ul className="mt-5 flex flex-wrap gap-2">
        {sky.planets.map((p) => (
          <li
            key={p.key}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1.5 text-sm"
          >
            <span aria-hidden className="text-[var(--vivida-violet)]">
              {p.symbol}
            </span>
            <span className="text-foreground/90">{p.labelKa}</span>
            <span className="text-muted-foreground">
              {p.signSymbol} {locativeKa(p.signKa)}
            </span>
          </li>
        ))}
      </ul>

      {/* Day's tightest aspects */}
      {sky.aspects.length > 0 && (
        <div className="mt-5">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            მთავარი ასპექტები
          </h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {sky.aspects.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-sm"
              >
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: FAMILY_TONE[a.family] }}
                />
                <span className="text-foreground/90">
                  {a.aSymbol} {a.aKa} — {a.kindKa} — {a.bSymbol} {a.bKa}
                </span>
                <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
                  {a.orb.toFixed(1)}°
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        ცოცხალი ცის სრული სურათი წუთობრივი სიზუსტით —{" "}
        <Link href="/sky" className="text-[var(--vivida-cyan)] hover:underline">
          ცა ახლა →
        </Link>
      </p>
    </section>
  );
}
