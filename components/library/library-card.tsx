import Link from "next/link";
import {
  Bot,
  CalendarDays,
  FileText,
  NotebookPen,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";

import type { LibraryEntry, LibraryEntryKind } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { LibraryFavoriteButton } from "./favorite-button";

const DATE_LOCALE: Record<UserLocale, string> = {
  ka: "ka-GE",
  en: "en-GB",
};

export function dailyLibraryDate(entry: LibraryEntry, locale: UserLocale) {
  const sourceDate = /^\d{4}-\d{2}-\d{2}$/.test(entry.sourceId)
    ? new Date(`${entry.sourceId}T12:00:00Z`)
    : entry.occurredAt;
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(sourceDate);
}

const KIND: Record<
  LibraryEntryKind,
  { Icon: LucideIcon; ka: string; en: string; badgeClass: string }
> = {
  daily: {
    Icon: Sparkles,
    ka: "დღიური ჰოროსკოპი",
    en: "Daily horoscope",
    badgeClass:
      "border-[var(--vivida-gold)]/40 bg-[var(--vivida-gold)]/15 text-[var(--vivida-gold)]",
  },
  weekly: {
    Icon: CalendarDays,
    ka: "7-დღიანი პროგნოზი",
    en: "7-day forecast",
    badgeClass:
      "border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/15 text-[var(--vivida-cyan)]",
  },
  tarot: {
    Icon: Wand2,
    ka: "ტარო კითხვა",
    en: "Tarot reading",
    badgeClass: "border-primary/40 bg-primary/15 text-primary",
  },
  ai: {
    Icon: Bot,
    ka: "კონსულტაცია",
    en: "Chart insight",
    badgeClass:
      "border-[var(--vivida-cyan)]/40 bg-[var(--vivida-cyan)]/15 text-[var(--vivida-cyan)]",
  },
  report: {
    Icon: FileText,
    ka: "PDF რეპორტი",
    en: "PDF report",
    badgeClass:
      "border-[var(--vivida-pink)]/40 bg-[var(--vivida-pink)]/15 text-[var(--vivida-pink)]",
  },
};

export function libraryKindLabel(kind: LibraryEntryKind, locale: UserLocale) {
  const meta = KIND[kind];
  return locale === "en" ? meta.en : meta.ka;
}

export function LibraryCard({
  entry,
  locale,
}: {
  entry: LibraryEntry;
  locale: UserLocale;
}) {
  const meta = KIND[entry.kind];
  const date = new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(entry.occurredAt);

  return (
    <article className="group relative flex min-h-60 flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:bg-secondary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-lg border ${meta.badgeClass}`}
          >
            <meta.Icon className="size-4" />
          </span>
          <span className="truncate">
            {libraryKindLabel(entry.kind, locale)}
          </span>
        </div>
        <LibraryFavoriteButton
          entryId={entry.id}
          initialFavorite={entry.favorite}
          locale={locale}
        />
      </div>

      <Link
        href={`/library/${entry.id}`}
        className="mt-4 flex flex-1 flex-col focus:outline-none"
      >
        <h2 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-foreground group-hover:text-primary">
          {entry.title}
        </h2>
        {entry.summary && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/80">
            {entry.summary}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4 mt-4 font-mono text-xs tabular-nums text-muted-foreground">
          <time dateTime={entry.occurredAt.toISOString()}>{date}</time>
          {entry.note && (
            <span className="inline-flex items-center gap-1 text-primary">
              <NotebookPen className="size-3.5" />
              {locale === "en" ? "Note" : "ჩანაწერი"}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}

export function DailyLibraryCard({
  entry,
  locale,
}: {
  entry: LibraryEntry;
  locale: UserLocale;
}) {
  const date = dailyLibraryDate(entry, locale);

  return (
    <article className="group flex min-h-28 items-center gap-3.5 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-[var(--vivida-gold)]/50 hover:bg-secondary/40">
      <Link
        href={`/library/${entry.id}`}
        className="flex min-w-0 flex-1 items-center gap-3.5 focus:outline-none"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--vivida-gold)]/40 bg-[var(--vivida-gold)]/15 text-[var(--vivida-gold)]">
          <Sparkles className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--vivida-gold)]">
            {libraryKindLabel("daily", locale)}
          </span>
          <span className="mt-1 block truncate text-sm font-semibold capitalize tracking-tight text-foreground group-hover:text-primary sm:text-base">
            {date}
          </span>
          {entry.summary && (
            <span className="mt-1 block truncate text-xs text-muted-foreground">
              {entry.summary}
            </span>
          )}
          {entry.note && (
            <span className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-primary">
              <NotebookPen className="size-3" />
              {locale === "en" ? "Note" : "ჩანაწერი"}
            </span>
          )}
        </span>
      </Link>
      <LibraryFavoriteButton
        entryId={entry.id}
        initialFavorite={entry.favorite}
        locale={locale}
      />
    </article>
  );
}
