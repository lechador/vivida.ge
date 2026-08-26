import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import type { LibraryEntryContent } from "@/db/schema";
import { requireUser } from "@/lib/auth-helpers";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { getLibraryEntry } from "@/lib/library";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import { LibraryFavoriteButton } from "@/components/library/favorite-button";
import { LibraryNoteEditor } from "@/components/library/note-editor";
import {
  dailyLibraryDate,
  libraryKindLabel,
} from "@/components/library/library-card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: (await getRequestLocale()) === "ka" ? "ჩემი ბიბლიოთეკა" : "My library",
    robots: { index: false },
  };
}

const DATE_LOCALE: Record<UserLocale, string> = {
  ka: "ka-GE",
  en: "en-GB",
  am: "hy-AM",
};

export default async function LibraryEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("/library");
  const { id } = await params;
  const [entry, locale] = await Promise.all([
    getLibraryEntry(user.id, id),
    getUserLocale(user.id),
  ]);
  if (!entry) notFound();
  const en = locale === "en";
  const am = locale === "am";
  const date = new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(entry.occurredAt);
  const displayTitle =
    entry.kind === "daily" ? dailyLibraryDate(entry, locale) : entry.title;

  return (
    <main lang={locale} className="relative isolate min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_38%_at_50%_-5%,oklch(0.32_0.17_305/0.5),transparent_72%),radial-gradient(38%_30%_at_88%_45%,oklch(0.28_0.14_220/0.35),transparent_72%)]"
      />
      <Starfield count={110} shooting={2} />
      <AppHeader authed active="library" />

      <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10 lg:pb-16">
        <Link href="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" />
          {am ? "Վերադառնալ գրադարան" : en ? "Back to library" : "ბიბლიოთეკაში დაბრუნება"}
        </Link>

        <header className="mt-6 rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--vivida-cyan)]">
                {libraryKindLabel(entry.kind, locale)}
              </div>
              <h1 className="mt-2 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {displayTitle}
              </h1>
              {entry.kind === "daily" ? (
                <p className="mt-3 text-sm text-foreground/65">{entry.title}</p>
              ) : (
                <time className="mt-3 block text-sm text-muted-foreground" dateTime={entry.occurredAt.toISOString()}>
                  {date}
                </time>
              )}
            </div>
            <LibraryFavoriteButton entryId={entry.id} initialFavorite={entry.favorite} locale={locale} />
          </div>
        </header>

        <div className="mt-4">
          <LibraryContent content={entry.content} locale={locale} />
        </div>

        {entry.href && (
          <div className="mt-4 flex justify-end">
            <Button asChild variant="outline">
              <Link href={entry.href}>
                {am ? "Բացել սկզբնական բաժինը" : en ? "Open original" : "საწყისი გვერდის გახსნა"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}

        <div className="mt-4">
          <LibraryNoteEditor entryId={entry.id} initialNote={entry.note} locale={locale} />
        </div>
      </article>
    </main>
  );
}

function LibraryContent({ content, locale }: { content: LibraryEntryContent; locale: UserLocale }) {
  const en = locale === "en";
  const am = locale === "am";

  switch (content.type) {
    case "daily":
      return (
        <section className="space-y-4 rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <p className="text-lg leading-relaxed text-foreground/90">{content.summary}</p>
          <div className="whitespace-pre-line text-[15px] leading-8 text-foreground/80">{content.body}</div>
          {content.themes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {content.themes.map((theme) => (
                <span key={theme} className="rounded-full border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 px-3 py-1.5 text-xs">
                  {theme}
                </span>
              ))}
            </div>
          )}
        </section>
      );
    case "weekly":
      return (
        <section className="space-y-3">
          {content.days.map((day) => (
            <div key={day.dateIso} className="rounded-3xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-2 text-xs text-[var(--vivida-gold)]">
                <CalendarDays className="size-4" />
                {new Intl.DateTimeFormat(DATE_LOCALE[locale], { weekday: "long", day: "numeric", month: "short" }).format(new Date(`${day.dateIso}T12:00:00Z`))}
              </div>
              <h2 className="mt-2 text-lg font-semibold">{day.headline}</h2>
              {day.harmonicReason && <p className="mt-3 text-sm leading-7 text-foreground/80">{day.harmonicReason}</p>}
              {day.challengingReason && <p className="mt-2 text-sm leading-7 text-foreground/70">{day.challengingReason}</p>}
              {day.advice && (
                <p className="mt-3 flex gap-2 rounded-2xl bg-[var(--vivida-cyan)]/8 p-3 text-sm text-foreground/85">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
                  {day.advice}
                </p>
              )}
            </div>
          ))}
        </section>
      );
    case "tarot":
      return (
        <section className="space-y-4 rounded-3xl border border-[var(--vivida-violet)]/30 bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div className="rounded-2xl bg-background/30 p-4">
            <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{am ? "Հարց" : en ? "Question" : "კითხვა"}</div>
            <p className="mt-2 text-foreground/90">{content.question}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {content.cards.map((card, index) => (
              <div key={`${card.slug}-${index}`} className="rounded-2xl border border-border bg-background/25 p-4">
                <div className="text-2xl">{card.glyph}</div>
                <div className="mt-2 text-xs text-[var(--vivida-violet)]">{card.position}</div>
                <h3 className="mt-1 font-semibold">{card.name}{card.reversed ? (am ? " · շրջված" : en ? " · reversed" : " · შებრუნებული") : ""}</h3>
                <p className="mt-2 text-xs leading-6 text-foreground/70">{card.interpretation}</p>
              </div>
            ))}
          </div>
          <p className="text-[15px] leading-8 text-foreground/85">{content.reading}</p>
          {content.advice && (
            <p className="flex gap-2 rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 p-4 text-sm text-foreground/85">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-[var(--vivida-cyan)]" />
              {content.advice}
            </p>
          )}
        </section>
      );
    case "ai":
      return (
        <section className="space-y-4 rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-8">
          <div className="ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-4 py-3 text-sm text-white">
            {content.question}
          </div>
          <div className="max-w-[95%] whitespace-pre-wrap rounded-2xl rounded-tl-md border border-border bg-background/30 px-5 py-4 text-sm leading-7 text-foreground/85">
            {content.answer}
          </div>
        </section>
      );
    case "report":
      return (
        <section className="rounded-3xl border border-[var(--vivida-cyan)]/30 bg-card/55 p-8 text-center ring-1 ring-foreground/5 backdrop-blur-xl">
          <Sparkles className="mx-auto size-8 text-[var(--vivida-cyan)]" />
          <h2 className="mt-4 text-xl font-semibold">{am ? "Ձեր PDF զեկույցը" : en ? "Your PDF report" : "შენი PDF რეპორტი"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {am ? "Բացեք սկզբնական բաժինը՝ կարգավիճակը տեսնելու կամ PDF-ը ներբեռնելու համար։" : en ? "Open the original report to check its status or download the PDF." : "გახსენი საწყისი რეპორტი სტატუსის სანახავად ან PDF-ის ჩამოსატვირთად."}
          </p>
        </section>
      );
  }
}
