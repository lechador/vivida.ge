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
      className="grid gap-3 sm:grid-cols-2"
    >
      <TrackedPublicLink
        href={localizedHref("/taro", locale)}
        event="next"
        target="/taro"
        feature="popular_tools"
        surface={placement}
        locale={locale}
        className="group relative overflow-hidden rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/15 via-card/60 to-card/60 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[var(--vivida-violet)]/50 hover:shadow-[0_12px_40px_-16px_var(--vivida-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vivida-violet)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--vivida-violet),transparent)]"
        />
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] text-white shadow-md shadow-[var(--vivida-violet)]/30">
            <Wand2 aria-hidden="true" className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold tracking-tight">
              {en ? "Tarot reading" : "ტარო"}
            </span>
            <span className="block text-[13px] text-muted-foreground">
              {en
                ? "Ask a question, draw 3 cards"
                : "დასვი კითხვა, გააშლე 3 კარტი"}
            </span>
          </span>
          <ArrowRight
            aria-hidden="true"
            className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
          />
        </div>
      </TrackedPublicLink>
      <TrackedPublicLink
        href={localizedHref("/ask", locale)}
        event="next"
        target="/ask"
        feature="popular_tools"
        surface={placement}
        locale={locale}
        className="group relative overflow-hidden rounded-2xl border border-[var(--vivida-cyan)]/25 bg-gradient-to-br from-[var(--vivida-cyan)]/10 via-card/60 to-card/60 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[var(--vivida-cyan)]/45 hover:shadow-[0_12px_40px_-16px_var(--vivida-cyan)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vivida-cyan)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--vivida-cyan),transparent)]"
        />
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-cyan))] text-white shadow-md shadow-[var(--vivida-cyan)]/25">
            <Stars aria-hidden="true" className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold tracking-tight">
              {en ? "Ask your chart" : "ჰკითხე ვარსკვლავებს"}
            </span>
            <span className="block text-[13px] text-muted-foreground">
              {publicEntry
                ? en
                  ? "Personal AI astrologer · Account required"
                  : "პირადი AI ასტროლოგი · საჭიროა ანგარიში"
                : en
                  ? "Personal AI astrologer"
                  : "პირადი AI ასტროლოგი"}
            </span>
          </span>
          <ArrowRight
            aria-hidden="true"
            className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
          />
        </div>
      </TrackedPublicLink>
    </nav>
  );
}
