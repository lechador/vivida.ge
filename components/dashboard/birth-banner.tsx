import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Slim birth-data CTA for the dashboard when no natal profile exists yet.
 * The rest of the page is filled with chart-free content, so this nudges
 * instead of walling the user off.
 */
export function BirthDataBanner({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale !== "ka";
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
          <Sparkles className="size-4 text-[var(--vivida-violet)]" />
        </span>
        <div>
          <p className="text-sm font-semibold">
            {en ? "Unlock your personal chart" : "გახსენი შენი პირადი რუკა"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {en
              ? "Add your birth details once — daily horoscope, live sky and compatibility open up."
              : "შეავსე დაბადების მონაცემები ერთხელ — გაიხსნება დღიური ჰოროსკოპი, ცოცხალი ცა და თავსებადობა."}
          </p>
        </div>
      </div>
      <Button asChild variant="mystic" className="shrink-0">
        <Link href="/onboarding?next=%2Fdashboard">
          <Sparkles className="size-4" />
          {en ? "Add birth details" : "მონაცემების დამატება"}
        </Link>
      </Button>
    </div>
  );
}
