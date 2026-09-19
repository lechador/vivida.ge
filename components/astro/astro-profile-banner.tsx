import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * Slim prompt nudging an account without birth data to create its astro
 * profile. Non-blocking — shown atop the feed (and other open pages) so astrology
 * is opt-in rather than forced at signup. Onboarding lands on /report (the
 * natal chart) by default, so no `next` is threaded here.
 */
export function AstroProfileBanner({ locale = "ka" }: { locale?: UserLocale }) {
  const en = locale !== "ka";
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--vivida-violet)]/40 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-[var(--vivida-cyan)]/10 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)]/15 ring-1 ring-[var(--vivida-violet)]/40">
          <Sparkles className="size-4 text-[var(--vivida-violet)]" />
        </span>
        <div>
          <p className="text-sm font-semibold">
            {en ? "Create your astrology profile" : "შექმენი ასტრო პროფილი"}
          </p>
          <p className="text-xs text-muted-foreground">
            {en
              ? "Add your birth details to unlock your chart, horoscope and compatibility."
              : "შეავსე დაბადების მონაცემები და გახსენი რუკა, ჰოროსკოპი და თავსებადობა."}
          </p>
        </div>
      </div>
      <Button asChild variant="mystic" size="sm" className="shrink-0">
        <Link href="/onboarding">
          <Sparkles className="size-4" />
          {en ? "Add details" : "შევსება"}
        </Link>
      </Button>
    </div>
  );
}
