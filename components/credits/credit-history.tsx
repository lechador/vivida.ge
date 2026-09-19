import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  History,
  Minus,
} from "lucide-react";

import {
  CREDIT_REASON_LABEL_EN,
  CREDIT_REASON_LABEL_KA,
  type CreditReason,
} from "@/lib/credits-config";
import type { CreditHistoryFilter, CreditHistoryPage } from "@/lib/credits";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { cn } from "@/lib/utils";

type Props = {
  history: CreditHistoryPage;
  filter: CreditHistoryFilter;
  locale: UserLocale;
};

const DATE_LOCALE: Record<UserLocale, string> = {
  ka: "ka-GE",
  en: "en-GB",
};

function historyHref(filter: CreditHistoryFilter, page?: number) {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("history", filter);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return `${query ? `/credits?${query}` : "/credits"}#history`;
}

function reasonLabel(reason: string, locale: UserLocale) {
  const labels =
    locale === "en" ? CREDIT_REASON_LABEL_EN : CREDIT_REASON_LABEL_KA;
  return labels[reason as CreditReason] ?? reason.replaceAll("_", " ");
}

function formatDate(value: Date | string, locale: UserLocale) {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CreditHistory({ history, filter, locale }: Props) {
  const en = locale === "en";
  const tabs: Array<{ value: CreditHistoryFilter; label: string }> = [
    { value: "all", label: en ? "All" : "ყველა" },
    { value: "earned", label: en ? "Received" : "მიღებული" },
    { value: "spent", label: en ? "Spent" : "დახარჯული" },
  ];

  return (
    <section
      id="history"
      className="scroll-mt-20 rounded-3xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6"
    >
      <header className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 text-[var(--vivida-violet)]">
          <History className="size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {en ? "Credit history" : "კრედიტების ისტორია"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {en
              ? "Every credit you have received and spent."
              : "შენი ყველა მიღებული და დახარჯული კრედიტი."}
          </p>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 p-4">
          <div className="text-xs text-muted-foreground">
            {en ? "Total received" : "სულ მიღებული"}
          </div>
          <div className="mt-1 text-xl font-semibold tabular-nums text-[var(--vivida-cyan)]">
            +{history.summary.earned}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--vivida-pink)]/25 bg-[var(--vivida-pink)]/8 p-4">
          <div className="text-xs text-muted-foreground">
            {en ? "Total spent" : "სულ დახარჯული"}
          </div>
          <div className="mt-1 text-xl font-semibold tabular-nums text-[var(--vivida-pink)]">
            −{history.summary.spent}
          </div>
        </div>
      </div>

      <nav
        aria-label={en ? "History filter" : "ისტორიის ფილტრი"}
        className="mt-4 grid grid-cols-3 rounded-xl border border-border/70 bg-background/25 p-1"
      >
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={historyHref(tab.value)}
            aria-current={filter === tab.value ? "page" : undefined}
            className={cn(
              "rounded-lg px-2 py-2 text-center text-xs font-medium transition-colors sm:text-sm",
              filter === tab.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {history.items.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          {en
            ? "There are no transactions in this view yet."
            : "ამ განყოფილებაში ოპერაციები ჯერ არ არის."}
        </div>
      ) : (
        <ol className="mt-2 divide-y divide-border/60">
          {history.items.map((item) => {
            const earned = item.amount > 0;
            const free = item.amount === 0;
            const AmountIcon = free
              ? Minus
              : earned
                ? ArrowDownLeft
                : ArrowUpRight;

            return (
              <li key={item.id} className="flex items-center gap-3 py-4">
                <div
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full border",
                    free
                      ? "border-border bg-background/30 text-muted-foreground"
                      : earned
                        ? "border-[var(--vivida-cyan)]/35 bg-[var(--vivida-cyan)]/10 text-[var(--vivida-cyan)]"
                        : "border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/10 text-[var(--vivida-pink)]",
                  )}
                >
                  <AmountIcon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {reasonLabel(item.reason, locale)}
                  </div>
                  <time
                    className="mt-0.5 block text-xs text-muted-foreground"
                    dateTime={new Date(item.createdAt).toISOString()}
                  >
                    {formatDate(item.createdAt, locale)}
                  </time>
                </div>
                <div className="shrink-0 text-right">
                  <div
                    className={cn(
                      "font-semibold tabular-nums",
                      free
                        ? "text-muted-foreground"
                        : earned
                          ? "text-[var(--vivida-cyan)]"
                          : "text-[var(--vivida-pink)]",
                    )}
                  >
                    {earned ? "+" : item.amount < 0 ? "−" : ""}
                    {Math.abs(item.amount)}
                  </div>
                  <div className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                    {en ? "Balance" : "ბალანსი"}: {item.balanceAfter}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {history.totalPages > 1 && (
        <nav
          aria-label={en ? "History pages" : "ისტორიის გვერდები"}
          className="mt-3 flex items-center justify-between border-t border-border/60 pt-4"
        >
          {history.page > 1 ? (
            <Link
              href={historyHref(filter, history.page - 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-card"
            >
              <ArrowLeft className="size-3.5" />
              {en ? "Previous" : "წინა"}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-xs tabular-nums text-muted-foreground">
            {history.page} / {history.totalPages}
          </span>
          {history.page < history.totalPages ? (
            <Link
              href={historyHref(filter, history.page + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:bg-card"
            >
              {en ? "Next" : "შემდეგი"}
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </section>
  );
}
