import { ChevronDown } from "lucide-react";

import { HOME_CONTENT } from "@/lib/seo/home-content";
import { CornerCrosshair } from "@/components/brand/celestial-icons";

export function FaqSection() {
  const faqItems = HOME_CONTENT.faq;

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.145_0.036_280)] shadow-md">
        <CornerCrosshair position="tl" />
        <CornerCrosshair position="tr" />
        <CornerCrosshair position="bl" />
        <CornerCrosshair position="br" />

        <div className="border-b border-border bg-background/70 px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--vivida-cyan)]">
                <span className="inline-block h-px w-5 bg-[var(--vivida-cyan)]/70" />
                ცნობარი · ხშირად დასმული კითხვები
              </div>
              <h2
                id="faq-heading"
                className="mt-2.5 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                პასუხები მთავარ კითხვებზე
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              OBSERVATORY FAQ · 0{faqItems.length} ENTRIES
            </span>
          </div>
        </div>

        <div className="space-y-3 p-4 sm:p-6">
          {faqItems.map((item, idx) => (
            <details
              key={item.q}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-2xs transition-colors open:border-primary/45"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium text-foreground transition-colors hover:bg-secondary/40 sm:px-6 sm:py-4.5 [&::-webkit-details-marker]:hidden">
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-xs font-semibold tabular-nums text-[var(--vivida-gold)]">
                    0{idx + 1}
                  </span>
                  <span>{item.q}</span>
                </span>
                <ChevronDown
                  aria-hidden
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 group-open:text-primary"
                />
              </summary>
              <div className="border-t border-border/70 bg-background/55 px-5 py-4 text-sm leading-relaxed text-foreground/85 sm:px-6 sm:py-4.5">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
