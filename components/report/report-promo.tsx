import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { CreditsVsPro } from "@/components/billing/credits-vs-pro";
import { auth } from "@/auth";
import { getBalance } from "@/lib/credits";
import { isPremiumUser } from "@/lib/premium";
import { shouldShowPurchasePromotion } from "@/lib/billing-config";

/**
 * Marketing promo for the paid natal PDF report, for public/SEO pages.
 * The report itself remains visible to everyone. Its acquisition-price
 * comparison is personalized so established credit holders and subscribers
 * are not repeatedly marketed to while reading public content.
 */
export async function ReportPromo({ className }: { className?: string }) {
  const [locale, session] = await Promise.all([getRequestLocale(), auth()]);
  const userId = session?.user?.id;
  const [balance, premium] = userId
    ? await Promise.all([getBalance(userId), isPremiumUser(userId)])
    : [undefined, false];
  const showPricingComparison =
    balance == null
      ? !premium
      : shouldShowPurchasePromotion({ isPremium: premium, balance });
  const en = locale === "en";
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
            {en ? "Complete report · PDF" : "სრული ანგარიში · PDF"}
          </div>
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            {en
              ? "An in-depth reading of your birth chart—a downloadable PDF"
              : "შენი ნატალური რუკის ღრმა ანალიზი — ჩამოსატვირთი PDF"}
          </h2>
          <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
            {en
              ? "A beautifully designed 10+ page personal report covering the standout patterns in your chart, planets, houses, aspects, strengths, and growth areas."
              : "10+ გვერდიანი პერსონალური ანგარიში: რა გამოირჩევა შენს რუკაში, პლანეტების, სახლებისა და ასპექტების დეტალური ახსნა, ძლიერი მხარეები და ზრდის ზონები — ლამაზად გაფორმებული."}
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button asChild variant="mystic" size="lg" className="min-w-44">
            <Link href="/signup?next=%2Freport">
              <FileText className="size-4" />
              {en ? "Create my free chart" : "შექმენი უფასო რუკა"}
            </Link>
          </Button>
          <span className="text-center text-xs text-muted-foreground sm:text-right">
            {en
              ? "Free chart before any paid report"
              : "უფასო რუკა ფასიან ანგარიშამდე"}
          </span>
        </div>
      </div>
      {showPricingComparison && (
        <div className="relative mt-6">
          <CreditsVsPro
            locale={locale}
            countryCode={locale === "en" ? "GB" : "GE"}
            placement="public_natal_report_comparison"
            creditHref="/signup?next=%2Fcredits"
            proHref="/signup?next=%2Fsubscription"
            context="natal_report"
            compact
            balance={balance}
            isPremium={premium}
          />
        </div>
      )}
    </div>
  );
}
