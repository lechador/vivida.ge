import { ArrowRight, Stars, Wand2 } from "lucide-react";

import { TrackedPublicLink } from "@/components/seo/tracked-public-link";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { localizedHref } from "@/lib/seo/public-paths";

export function PopularTools({
  locale = "ka",
  placement,
  publicEntry = false,
}: {
  locale?: UserLocale;
  placement: string;
  publicEntry?: boolean;
}) {
  const pl = locale === "pl";
  const en = locale === "en";

  return (
    <nav
      aria-label={
        pl ? "Najczęściej używane" : en ? "Most used" : "ყველაზე გამოყენებადი"
      }
      className="grid gap-4 sm:grid-cols-2"
    >
      <TrackedPublicLink
        href={localizedHref("/taro", locale)}
        event="next"
        target="/taro"
        feature="popular_tools"
        surface={placement}
        locale={locale}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/60 hover:bg-secondary/60"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/15 text-primary">
          <Wand2 aria-hidden="true" className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold tracking-tight text-foreground">
            {pl ? "Rozkład Tarota" : en ? "Tarot reading" : "ტაროს გაშლა"}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {pl
              ? "Zadaj pytanie, wylosuj 3 karty"
              : en
                ? "Ask a question, draw 3 cards"
                : "დასვი კითხვა, გააშლე 3 კარტი"}
          </span>
        </span>
        <ArrowRight
          aria-hidden="true"
          className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </TrackedPublicLink>

      <TrackedPublicLink
        href={localizedHref("/ask", locale)}
        event="next"
        target="/ask"
        feature="popular_tools"
        surface={placement}
        locale={locale}
        className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-[var(--vivida-cyan)]/60 hover:bg-secondary/60"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/15 text-[var(--vivida-cyan)]">
          <Stars aria-hidden="true" className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold tracking-tight text-foreground">
            {pl
              ? "Zapytaj swój kosmogram"
              : en
                ? "Ask your chart"
                : "ჰკითხე ვარსკვლავებს"}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {publicEntry
              ? pl
                ? "Osobisty astrolog · Wymagane konto"
                : en
                  ? "Personal astrologer · Account required"
                  : "პირადი ასტროლოგი · საჭიროა ანგარიში"
              : pl
                ? "Osobisty astrolog"
                : en
                  ? "Personal astrologer"
                  : "პირადი ასტროლოგი"}
          </span>
        </span>
        <ArrowRight
          aria-hidden="true"
          className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--vivida-cyan)]"
        />
      </TrackedPublicLink>
    </nav>
  );
}
