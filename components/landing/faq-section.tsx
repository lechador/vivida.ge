import { HOME_CONTENT } from "@/lib/seo/home-content";
import { Reveal } from "@/components/landing/reveal";

export function FaqSection() {
  const faq = HOME_CONTENT.faq;

  return (
    <section className="relative z-10 mx-auto hidden w-full max-w-3xl px-4 py-20 sm:block sm:px-6 sm:py-24">
      <Reveal
        as="h2"
        y={16}
        durationMs={600}
        className="mb-8 text-center text-3xl font-semibold tracking-tight sm:mb-10 sm:text-4xl"
      >
        ხშირად დასმული კითხვები
      </Reveal>

      <div className="space-y-3">
        {faq.map((item, i) => (
          <Reveal
            as="details"
            key={i}
            y={12}
            durationMs={450}
            delayMs={i * 60}
            className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors open:bg-card/80 sm:p-5"
          >
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-foreground">
              <span>{item.q}</span>
              <span
                aria-hidden
                className="mt-1 shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-45"
              >
                ✦
              </span>
            </summary>
            <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">
              {item.a}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
