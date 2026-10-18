import Link from "next/link";
import { Check } from "lucide-react";

import { SignInButton } from "./sign-in-button";
import { CornerCrosshair } from "@/components/brand/celestial-icons";

const FREE_ITEMS_KA = [
  "სრული ნატალური რუკა (მზე, მთვარე, ასცენდენტი, პლანეტები, 12 სახლი)",
  "ყოველდღიური პერსონალური ჰოროსკოპი შენი რუკის ტრანზიტებით",
  "პირველი სინასტრია (პარტნიორთან თავსებადობა) უფასოდ",
  "საწყისი კრედიტების ბონუსი ტაროსა და ასტროლოგთან კითხვისთვის",
];

const PRO_ITEMS_KA = [
  "ულიმიტო კითხვები პირად ასტროლოგთან და ტაროს გაშლები",
  "ყოველკვირეული პროგნოზი და კრიტიკული დღეების კალენდარი",
  "ღრმა სინასტრიის ანგარიში და ურთიერთობის დინამიკა",
  "სრული PDF ნატალური წიგნაკი ჩამოსატვირთად",
];

export function PricingAnchor() {
  return (
    <section
      aria-labelledby="pricing-anchor-heading"
      className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.145_0.036_280)] shadow-md">
        <CornerCrosshair position="tl" />
        <CornerCrosshair position="tr" />
        <CornerCrosshair position="bl" />
        <CornerCrosshair position="br" />

        <div className="border-b border-border bg-background/70 px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--vivida-gold)]">
                <span className="inline-block h-px w-5 bg-[var(--vivida-gold)]/70" />
                პირობები · გამჭვირვალე მოდელი
              </div>
              <h2
                id="pricing-anchor-heading"
                className="mt-2.5 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-4xl"
              >
                დაიწყე უფასოდ, გადაიხადე მხოლოდ სიღრმისეულ ანალიზში
              </h2>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              ACCESS TIERS · 02 EDITIONS
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            ძირითადი ნატალური რუკა და ყოველდღიური პროგნოზი ყველასთვის ღიაა.
            დამატებითი ინსტრუმენტები ხელმისაწვდომია კრედიტებით ან PRO გამოწერით.
          </p>
        </div>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-2">
          {/* Free tier */}
          <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div>
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--vivida-cyan)]">
                    TIER 01 · საბაზისო წვდომა
                  </div>
                  <h3 className="mt-1 text-xl font-semibold text-foreground">
                    პირადი რუკა და დღის რიტმი
                  </h3>
                </div>
                <div className="text-right font-mono">
                  <span className="text-2xl font-semibold tabular-nums text-foreground">
                    0 ₾
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    სამუდამოდ
                  </span>
                </div>
              </div>

              <ul className="mt-5 space-y-3 text-sm text-foreground/85">
                {FREE_ITEMS_KA.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 border-t border-border pt-5">
              <SignInButton
                size="default"
                label="შექმენი უფასო რუკა"
                source="landing_pricing_free"
              />
            </div>
          </div>

          {/* Pro / Credits tier */}
          <div className="flex flex-col justify-between rounded-xl border border-primary/50 bg-gradient-to-br from-primary/15 via-card to-[var(--vivida-cyan)]/10 p-6 shadow-md sm:p-8">
            <div>
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
                <div>
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--vivida-gold)]">
                    TIER 02 · VIVIDA PRO და კრედიტები
                  </div>
                  <h3 className="mt-1 text-xl font-semibold text-foreground">
                    სრული ასტროლოგიური ლაბორატორია
                  </h3>
                </div>
                <div className="text-right font-mono">
                  <span className="text-2xl font-semibold tabular-nums text-[var(--vivida-gold)]">
                    9 ₾-დან
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    ერთჯერადი ან თვიური
                  </span>
                </div>
              </div>

              <ul className="mt-5 space-y-3 text-sm text-foreground/90">
                {PRO_ITEMS_KA.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--vivida-gold)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-5">
              <SignInButton
                size="default"
                label="დაიწყე უფასოდ"
                source="landing_pricing_pro"
              />
              <Link
                href="/nataluri-ruka"
                className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
              >
                ნახე რუკის ნიმუში →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
