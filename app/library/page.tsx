import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
} from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { listLibraryEntries, type LibraryFilter } from "@/lib/library";
import type { LibraryEntryKind } from "@/db/schema";
import { AppHeader } from "@/components/nav/app-header";
import { Starfield } from "@/components/landing/starfield";
import {
  DailyLibraryCard,
  LibraryCard,
  libraryKindLabel,
} from "@/components/library/library-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return {
    title: locale === "en" ? "My library" : "ჩემი ბიბლიოთეკა",
    robots: { index: false },
  };
}

const FILTERS: LibraryFilter[] = [
  "all",
  "daily",
  "weekly",
  "tarot",
  "ai",
  "report",
];

function hrefFor(options: {
  filter: LibraryFilter;
  favorites: boolean;
  query: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (options.filter !== "all") params.set("type", options.filter);
  if (options.favorites) params.set("favorites", "1");
  if (options.query) params.set("q", options.query);
  if (options.page && options.page > 1)
    params.set("page", String(options.page));
  const query = params.toString();
  return query ? `/library?${query}` : "/library";
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string | string[];
    favorites?: string | string[];
    q?: string | string[];
    page?: string | string[];
  }>;
}) {
  const user = await requireUser("/library");
  const [locale, query] = await Promise.all([
    getUserLocale(user.id),
    searchParams,
  ]);
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const typeParam = first(query.type);
  const filter: LibraryFilter = FILTERS.includes(typeParam as LibraryFilter)
    ? (typeParam as LibraryFilter)
    : "all";
  const favorites = first(query.favorites) === "1";
  const search = first(query.q)?.trim().slice(0, 100) ?? "";
  const parsedPage = Number.parseInt(first(query.page) ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const library = await listLibraryEntries(user.id, {
    filter,
    favoritesOnly: favorites,
    query: search,
    page,
  });
  const en = locale === "en";
  const dailyItems = library.items.filter((entry) => entry.kind === "daily");
  const otherItems = library.items.filter((entry) => entry.kind !== "daily");

  return (
    <main
      lang={locale}
      className="relative isolate min-h-screen overflow-x-clip bg-background"
    >
      <Starfield count={48} />
      <AppHeader authed active="library" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:px-6 sm:pt-10 lg:pb-16">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
              <BookOpen className="size-3.5" />
              {en ? "PERSONAL ARCHIVE" : "პირადი არქივი"}
            </div>
            <h1
              className={
                en
                  ? "mt-2 text-balance font-display text-3xl font-medium tracking-tight text-foreground sm:text-5xl"
                  : "mt-2 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-5xl"
              }
            >
              {en ? "My library" : "ჩემი ბიბლიოთეკა"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {en
                ? "Your horoscopes, forecasts, tarot readings, consultations and reports, preserved in one private archive."
                : "შენი ჰოროსკოპები, პროგნოზები, ტაროს კითხვები, კონსულტაციები და რეპორტები, ერთ პირად არქივში."}
            </p>
          </div>
          <Link
            href={hrefFor({ filter, favorites: !favorites, query: search })}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium shadow-2xs transition-colors",
              favorites
                ? "border-[var(--vivida-gold)]/50 bg-[var(--vivida-gold)]/15 text-[var(--vivida-gold)]"
                : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            <Star className={cn("size-3.5", favorites && "fill-current")} />
            {en ? "Favorites" : "რჩეულები"}
            <span className="font-mono tabular-nums">
              {library.counts.favorites}
            </span>
          </Link>
        </header>

        <div className="mt-6 rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4">
          <form method="get" action="/library" className="flex gap-2">
            {filter !== "all" && (
              <input type="hidden" name="type" value={filter} />
            )}
            {favorites && <input type="hidden" name="favorites" value="1" />}
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3.5 focus-within:border-primary/60">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <span className="sr-only">
                {en ? "Search library" : "ბიბლიოთეკაში ძიება"}
              </span>
              <input
                name="q"
                defaultValue={search}
                maxLength={100}
                placeholder={
                  en ? "Search your archive…" : "მოძებნე ბიბლიოთეკაში…"
                }
                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <Button type="submit" size="default">
              {en ? "Search" : "ძიება"}
            </Button>
          </form>

          <nav
            aria-label={en ? "Library types" : "ბიბლიოთეკის ტიპები"}
            className="mt-3 flex gap-1.5 overflow-x-auto border-t border-border pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {FILTERS.map((item) => {
              const active = filter === item;
              const label =
                item === "all"
                  ? en
                    ? "All"
                    : "ყველა"
                  : libraryKindLabel(item as LibraryEntryKind, locale);
              return (
                <Link
                  key={item}
                  href={hrefFor({ filter: item, favorites, query: search })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  {label}{" "}
                  <span className="font-mono tabular-nums opacity-75">
                    · {library.counts[item]}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {library.items.length > 0 ? (
          <div className="mt-6 space-y-6">
            {dailyItems.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {dailyItems.map((entry) => (
                  <DailyLibraryCard
                    key={entry.id}
                    entry={entry}
                    locale={locale}
                  />
                ))}
              </div>
            )}
            {otherItems.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {otherItems.map((entry) => (
                  <LibraryCard key={entry.id} entry={entry} locale={locale} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-border bg-card px-6 py-16 text-center shadow-sm">
            <div className="mx-auto grid size-11 place-items-center rounded-sm border border-border bg-secondary/50 text-primary">
              <BookOpen className="size-5" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-foreground">
              {en ? "Nothing here yet" : "აქ ჯერ არაფერია"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {search || favorites || filter !== "all"
                ? en
                  ? "Try a different filter or search term."
                  : "შეცვალე ფილტრი ან საძიებო სიტყვა."
                : en
                  ? "Your next personal reading will be saved here automatically."
                  : "შემდეგი პერსონალური კითხვა აქ ავტომატურად შეინახება."}
            </p>
            {!search && !favorites && filter === "all" && (
              <Button asChild className="mt-5">
                <Link href="/taro">
                  {en ? "Ask your first question" : "დასვი პირველი კითხვა"}
                </Link>
              </Button>
            )}
          </div>
        )}

        {library.totalPages > 1 && (
          <nav
            className="mt-8 flex items-center justify-center gap-4"
            aria-label={en ? "Library pages" : "ბიბლიოთეკის გვერდები"}
          >
            {library.page > 1 ? (
              <Link
                href={hrefFor({
                  filter,
                  favorites,
                  query: search,
                  page: library.page - 1,
                })}
                className="grid size-9 place-items-center rounded-sm border border-border bg-card hover:bg-secondary"
                aria-label={en ? "Previous page" : "წინა გვერდი"}
              >
                <ChevronLeft className="size-4" />
              </Link>
            ) : (
              <span className="size-9" />
            )}
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {library.page} / {library.totalPages}
            </span>
            {library.page < library.totalPages ? (
              <Link
                href={hrefFor({
                  filter,
                  favorites,
                  query: search,
                  page: library.page + 1,
                })}
                className="grid size-9 place-items-center rounded-sm border border-border bg-card hover:bg-secondary"
                aria-label={en ? "Next page" : "შემდეგი გვერდი"}
              >
                <ChevronRight className="size-4" />
              </Link>
            ) : (
              <span className="size-9" />
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
