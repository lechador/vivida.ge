import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

function priceLabel(): string {
  const cents = Number(process.env.REPORT_PRICE_CENTS) || 1990;
  const cur = (process.env.REPORT_CURRENCY ?? "gel").toLowerCase();
  const amount = (cents / 100).toFixed(2);
  return cur === "gel" ? `₾${amount}` : `${amount} ${cur.toUpperCase()}`;
}

/**
 * Marketing promo for the paid natal PDF report, for public/SEO pages.
 * Server component + auth-aware: signed-in visitors go straight to /report
 * (where the real buy flow lives); logged-out visitors go to /signup so they
 * can create their chart first. Premium gold accent distinguishes it from the
 * violet "start free" CTAs on the same pages.
 */
export async function ReportPromo({ className }: { className?: string }) {
  const session = await auth();
  const authed = Boolean(session?.user?.id);

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
            სრული ანგარიში · PDF
          </div>
          <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
            შენი ნატალური რუკის ღრმა ანალიზი — ჩამოსატვირთი PDF
          </h2>
          <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
            10+ გვერდიანი პერსონალური ანგარიში: რა გამოირჩევა შენს რუკაში,
            პლანეტების, სახლებისა და ასპექტების დეტალური ახსნა, ძლიერი მხარეები და
            ზრდის ზონები — ლამაზად გაფორმებული.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Button asChild variant="mystic" size="lg" className="min-w-44">
            <Link href={authed ? "/report" : "/signup"}>
              <FileText className="size-4" />
              {authed ? "მიიღე ანგარიში" : "დაიწყე"}
            </Link>
          </Button>
          <span className="text-center text-xs text-muted-foreground sm:text-right">
            {priceLabel()}-დან · Pro-სთვის უფასო
          </span>
        </div>
      </div>
    </div>
  );
}
