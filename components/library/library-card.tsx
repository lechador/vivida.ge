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
  am: "hy-AM",
};

const KIND: Record<
  LibraryEntryKind,
  { Icon: LucideIcon; ka: string; en: string; am: string; color: string }
> = {
  daily: {
    Icon: Sparkles,
    ka: "დღიური ჰოროსკოპი",
    en: "Daily horoscope",
    am: "Օրական հորոսկոպ",
    color: "var(--vivida-cyan)",
  },
  weekly: {
    Icon: CalendarDays,
    ka: "7-დღიანი პროგნოზი",
    en: "7-day forecast",
    am: "7-օրյա կանխատեսում",
    color: "var(--vivida-gold)",
  },
  tarot: {
    Icon: Wand2,
    ka: "ტარო კითხვა",
    en: "Tarot reading",
    am: "Տարոյի ընթերցում",
    color: "var(--vivida-violet)",
  },
  ai: {
    Icon: Bot,
    ka: "AI რჩევა",
    en: "AI insight",
    am: "AI հուշում",
    color: "var(--vivida-pink)",
  },
  report: {
    Icon: FileText,
    ka: "PDF რეპორტი",
    en: "PDF report",
    am: "PDF զեկույց",
    color: "var(--vivida-cyan)",
  },
};

export function libraryKindLabel(kind: LibraryEntryKind, locale: UserLocale) {
  const meta = KIND[kind];
  return locale === "am" ? meta.am : locale === "en" ? meta.en : meta.ka;
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
            style={{ color: meta.color, borderColor: `color-mix(in oklch, ${meta.color} 35%, transparent)` }}
          >
            <meta.Icon className="size-4" />
          </span>
          <span className="truncate">{libraryKindLabel(entry.kind, locale)}</span>
        </div>
        <LibraryFavoriteButton
          entryId={entry.id}
          initialFavorite={entry.favorite}
          locale={locale}
        />
      </div>

      <Link href={`/library/${entry.id}`} className="mt-4 flex flex-1 flex-col focus:outline-none">
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
              {locale === "am" ? "Նշում" : locale === "en" ? "Note" : "ჩანაწერი"}
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
