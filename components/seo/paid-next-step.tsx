import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * The single paid continuation on a high-traffic public answer page.
 *
 * Search visitors land on /piradi-ruka, /sizmris-akhsna, and
 * /mtvaris-kalendari for one free answer and historically got a spray of
 * equal-weight links afterwards. Each page now ends its free answer with
 * exactly one paid next step naming the outcome and its credit/price terms,
 * so the path from free value to first purchase is unambiguous. Copy and
 * prices are passed in by the page from the billing catalogue, never
 * hard-coded here.
 */
export function PaidNextStep({
  title,
  body,
  ctaHref,
  ctaLabel,
  priceNote,
}: {
  title: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
  /** e.g. "5 კრედიტი · კრედიტები ₾6.90-დან, ერთჯერადად" */
  priceNote: string;
}) {
  return (
    <section className="mt-10 rounded-3xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/10 to-[var(--vivida-cyan)]/8 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
      <div className="inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-gold)]/30 bg-[var(--vivida-gold)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--vivida-gold)]">
        <Sparkles className="size-3" />
        შემდეგი ნაბიჯი
      </div>
      <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base">
        {body}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button asChild variant="mystic" size="lg">
          <Link href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">{priceNote}</span>
      </div>
    </section>
  );
}
