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
  const en = locale === "en";

  return (
    <nav
      aria-label={en ? "Most used" : "ყველაზე გამოყენებადი"}
      className="grid gap-px border border-border bg-border sm:grid-cols-2"
    >
      <TrackedPublicLink
        href={localizedHref("/taro", locale)}
        event="next"
        target="/taro"
        feature="popular_tools"
        surface={placement}
        locale={locale}
        className="group flex items-center gap-4 bg-card p-5 transition-colors hover:bg-secondary/60"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-secondary/50 text-primary">
          <Wand2 aria-hidden="true" className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold tracking-tight text-foreground">
            {en ? "Tarot reading" : "ტაროს გაშლა"}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {en
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
        className="group flex items-center gap-4 bg-card p-5 transition-colors hover:bg-secondary/60"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-sm border border-border bg-secondary/50 text-primary">
          <Stars aria-hidden="true" className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold tracking-tight text-foreground">
            {en ? "Ask your chart" : "ჰკითხე ასტროლოგს"}
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {publicEntry
              ? en
                ? "Personal astrologer · Account required"
                : "პირადი ასტროლოგი · საჭიროა ანგარიში"
              : en
                ? "Personal astrologer"
                : "პირადი ასტროლოგი"}
          </span>
        </span>
        <ArrowRight
          aria-hidden="true"
          className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </TrackedPublicLink>
    </nav>
  );
}
