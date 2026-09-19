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
  { Icon: LucideIcon; ka: string; en: string; color: string }
> = {
  daily: {
    Icon: Sparkles,
    ka: "დღიური ჰოროსკოპი",
    en: "Daily horoscope",
    color: "var(--vivida-cyan)",
  },
  weekly: {
    Icon: CalendarDays,
    ka: "7-დღიანი პროგნოზი",
    en: "7-day forecast",
    color: "var(--vivida-gold)",
  },
  tarot: {
    Icon: Wand2,
    ka: "ტარო კითხვა",
    en: "Tarot reading",
    color: "var(--vivida-violet)",
  },
  ai: {
    Icon: Bot,
    ka: "AI რჩევა",
    en: "AI insight",
    color: "var(--vivida-pink)",
  },
  report: {
    Icon: FileText,
    ka: "PDF რეპორტი",
    en: "PDF report",
    color: "var(--vivida-cyan)",
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
    <article className="group relative flex min-h-64 flex-col rounded-3xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-card/70">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg border bg-background/25"
            style={{
              color: meta.color,
              borderColor: `color-mix(in oklch, ${meta.color} 35%, transparent)`,
            }}
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
        <h2 className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight group-hover:text-foreground">
          {entry.title}
        </h2>
        {entry.summary && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/70">
            {entry.summary}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-muted-foreground">
          <time dateTime={entry.occurredAt.toISOString()}>{date}</time>
          {entry.note && (
            <span className="inline-flex items-center gap-1 text-[var(--vivida-cyan)]">
              <NotebookPen className="size-3.5" />
              {locale === "en" ? "Note" : "ჩანაწერი"}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}

/** Compact landscape treatment for the high-volume daily archive. */
export function DailyLibraryCard({
  entry,
  locale,
}: {
  entry: LibraryEntry;
  locale: UserLocale;
}) {
  const date = dailyLibraryDate(entry, locale);

  return (
    <article className="group flex min-h-28 items-center gap-3 rounded-2xl border border-border bg-card/55 p-3.5 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[var(--vivida-cyan)]/30 hover:bg-card/70 sm:p-4">
      <Link
        href={`/library/${entry.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 focus:outline-none"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/8 text-[var(--vivida-cyan)]">
          <Sparkles className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {libraryKindLabel("daily", locale)}
          </span>
          <span className="mt-1 block truncate text-sm font-semibold capitalize tracking-tight sm:text-base">
            {date}
          </span>
          {entry.summary && (
            <span className="mt-1 block truncate text-xs text-foreground/60">
              {entry.summary}
            </span>
          )}
          {entry.note && (
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[var(--vivida-cyan)]">
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
