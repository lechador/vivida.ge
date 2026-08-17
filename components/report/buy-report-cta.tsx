"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Loader2, Sparkles, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";

const ERRORS: Record<string, string> = {
  no_chart: "ჯერ შენი რუკა უნდა შეიქმნას. დაასრულე ონბორდინგი.",
  unauthorized: "გთხოვ, შეხვიდე სისტემაში.",
};

/**
 * Generate the full PDF report, paid with credits. Spends CREDIT_COST.pdfReport
 * once via /api/reports/checkout, then routes to the in-app status page. On a
 * short balance (402) it flips to an invite-or-top-up prompt.
 */
export function BuyReportCta({
  cost,
  balance,
  locale = "ka",
}: {
  cost: number;
  balance: number;
  locale?: UserLocale;
}) {
  const en = locale !== "ka";
  const am = locale === "am";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [short, setShort] = useState(balance < cost);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "natal" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 402) {
        setShort(true);
        setLoading(false);
        return;
      }
      if (!res.ok || !data.url) {
        setError(
          en
            ? data.error === "no_chart"
              ? "Create your natal chart first."
              : data.error === "unauthorized"
                ? "Please sign in first."
                : "Something went wrong. Please try again."
            : ERRORS[data.error] ?? "რაღაც ვერ მოხერხდა. სცადე ხელახლა.",
        );
        setLoading(false);
        return;
      }
      router.push(data.url);
    } catch {
      setError(am ? "Ցանցի սխալ։ Խնդրում ենք նորից փորձել։" : en ? "Network error. Please try again." : "ქსელის შეცდომა. სცადე ხელახლა.");
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/30 bg-card/65 p-6 ring-1 ring-foreground/5 backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,var(--vivida-violet)/0.25,transparent_70%)]"
      />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--vivida-gold)]/30 bg-[var(--vivida-gold)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--vivida-gold)]">
            <Sparkles className="size-3" />
            {am ? "Ամբողջական զեկույց" : en ? "Complete report" : "სრული ანგარიში"}
          </div>
          <h3 className="text-xl font-semibold tracking-tight">
            {am ? "Ձեր նատալ քարտեզի խորը վերլուծություն—PDF" : en ? "A deep reading of your natal chart—PDF" : "შენი ნატალური რუკის ღრმა ანალიზი — PDF"}
          </h3>
          <p className="mt-1.5 text-sm text-foreground/75">
            {en
              ? "A beautifully formatted, downloadable report covering your chart's defining patterns, planets, houses, aspects, strengths and growth areas."
              : "10+ გვერდიანი პერსონალური ანგარიში: რა გამოირჩევა შენს რუკაში, პლანეტების, სახლებისა და ასპექტების დეტალური ახსნა, ძლიერი მხარეები და ზრდის ზონები — ლამაზად გაფორმებული, ჩამოსატვირთად."}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1 text-sm">
            <Sparkles className="size-4 text-[var(--vivida-cyan)]" />
            <span className="font-semibold">{cost} {am ? "կրեդիտներ" : am ? "կրեդիտներ" : en ? "credits" : "კრედიტი"}</span>
            <span className="text-muted-foreground">· {am ? "մնացորդ" : en ? "balance" : "ბალანსი"} {balance}</span>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          {!short ? (
            <>
              <Button
                variant="mystic"
                size="lg"
                onClick={start}
                disabled={loading}
                className="min-w-44"
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                {am ? "Ստեղծել" : en ? "Create" : "შექმნა"} — {cost} {en ? "credits" : "კრედიტი"}
              </Button>
              <span className="text-center text-xs text-muted-foreground sm:text-right">
                {am ? "Միանվագ վճարում · մշտական մուտք" : en ? "One-time payment · permanent access" : "ერთჯერადი გადახდა · სამუდამო წვდომა"}
              </span>
            </>
          ) : (
            <div className="space-y-2 text-center sm:text-right">
              <p className="text-sm text-[var(--vivida-pink)]">
                {am ? "Ձեր հաշվեկշիռը շատ ցածր է։" : en ? "Your balance is too low." : "ბალანსი არ არის საკმარისი."}
              </p>
              <Button asChild variant="mystic" size="lg">
                <Link href="/credits">
                  <Users className="size-4" />
                  {am ? "Հրավիրել / լիցքավորել" : en ? "Invite / top up" : "მოიწვიე / შეავსე"}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-[var(--vivida-pink)]">{error}</p>}
    </div>
  );
}
