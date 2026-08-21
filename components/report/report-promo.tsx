import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CREDIT_COST } from "@/lib/credits-config";
import { getRequestLocale } from "@/lib/i18n/request-locale";

/**
 * Marketing promo for the paid natal PDF report, for public/SEO pages.
 * Kept auth-independent so every SEO page using it remains static/ISR. Signup
 * already redirects an authenticated visitor to the supplied `next` path.
 */
export async function ReportPromo({ className }: { className?: string }) {
  const locale = await getRequestLocale();
  const en = locale === "en";
  const am = locale === "am";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[var(--vivida-gold)]/30 bg-gradient-to-br from-[var(--vivida-gold)]/10 via-card/65 to-[var(--vivida-violet)]/12 p-7 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-9 ${className ?? ""}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,var(--vivida-gold)/0.18,transparent_70%)]"
      />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-gold)]/30 bg-[var(--vivida-gold)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--vivida-gold)]">
            <Sparkles className="size-3" />
            {am
              ? "Ամբողջական զեկույց · PDF"
              : en
                ? "Complete report · PDF"
                : "სრული ანგარიში · PDF"}
          </div>
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            {am
              ? "Ձեր ծննդյան քարտեզի խորքային վերլուծությունը՝ ներբեռնվող PDF-ով"
              : en
                ? "An in-depth reading of your birth chart—a downloadable PDF"
                : "შენი ნატალური რუკის ღრმა ანალიზი — ჩამოსატვირთი PDF"}
          </h2>
          <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
            {am
              ? "Գեղեցիկ ձևավորված 10+ էջանոց անհատական զեկույց՝ ձեր քարտեզի առանցքային օրինաչափությունների, մոլորակների, տների, ասպեկտների, ուժեղ կողմերի և աճի ոլորտների մասին:"
              : en
                ? "A beautifully designed 10+ page personal report covering the standout patterns in your chart, planets, houses, aspects, strengths, and growth areas."
                : "10+ გვერდიანი პერსონალური ანგარიში: რა გამოირჩევა შენს რუკაში, პლანეტების, სახლებისა და ასპექტების დეტალური ახსნა, ძლიერი მხარეები და ზრდის ზონები — ლამაზად გაფორმებული."}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button asChild variant="mystic" size="lg" className="min-w-44">
            <Link href="/signup?next=%2Freport">
              <FileText className="size-4" />
              {am ? "Սկսել" : en ? "Get started" : "დაიწყე"}
            </Link>
          </Button>
          <span className="text-center text-xs text-muted-foreground sm:text-right">
            {CREDIT_COST.pdfReport}{" "}
            {am
              ? "կրեդիտ · առանց ամսական բաժանորդագրության"
              : en
                ? "credits · no subscription"
                : "კრედიტი · ყოველთვიური გამოწერის გარეშე"}
          </span>
        </div>
      </div>
    </div>
  );
}
