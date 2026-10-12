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
      className="relative isolate min-h-screen overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_38%_at_50%_-5%,oklch(0.32_0.17_305/0.5),transparent_72%),radial-gradient(38%_30%_at_88%_45%,oklch(0.28_0.14_220/0.35),transparent_72%)]"
      />
      <Starfield count={120} shooting={2} />
      <AppHeader authed active="library" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10 lg:pb-16">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--vivida-cyan)]">
              <BookOpen className="size-4" />
              {en ? "Personal archive" : "პირადი არქივი"}
            </div>
            <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
              {en ? "My library" : "ჩემი ბიბლიოთეკა"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/70 sm:text-base">
              {en
                ? "Your horoscopes, forecasts, tarot readings, AI insights and reports, kept together in one private place."
                : "შენი ჰოროსკოპები, პროგნოზები, ტაროს კითხვები, AI რჩევები და რეპორტები, ერთ პირად სივრცეში."}
            </p>
          </div>
          <Link
            href={hrefFor({ filter, favorites: !favorites, query: search })}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
              favorites
                ? "border-[var(--vivida-gold)]/45 bg-[var(--vivida-gold)]/12 text-[var(--vivida-gold)]"
                : "border-border bg-card/50 text-muted-foreground hover:text-foreground",
            )}
          >
            <Star className={cn("size-4", favorites && "fill-current")} />
            {en ? "Favorites" : "რჩეულები"}
            <span className="tabular-nums">{library.counts.favorites}</span>
          </Link>
        </header>

        <div className="mt-7 rounded-3xl border border-border bg-card/45 p-3 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-4">
          <form method="get" action="/library" className="flex gap-2">
            {filter !== "all" && (
              <input type="hidden" name="type" value={filter} />
            )}
            {favorites && <input type="hidden" name="favorites" value="1" />}
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-border bg-background/30 px-4 focus-within:border-[var(--vivida-violet)]/55">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <span className="sr-only">
                {en ? "Search library" : "ბიბლიოთეკაში ძიება"}
              </span>
              <input
                name="q"
                defaultValue={search}
                maxLength={100}
                placeholder={
                  en ? "Search your library…" : "მოძებნე ბიბლიოთეკაში…"
                }
                className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <button
              type="submit"
              className="rounded-2xl bg-[var(--vivida-violet)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {en ? "Search" : "ძიება"}
            </button>
          </form>

          <nav
            aria-label={en ? "Library types" : "ბიბლიოთეკის ტიპები"}
            className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                    "shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                    active
                      ? "border-[var(--vivida-violet)]/45 bg-[var(--vivida-violet)]/15 text-foreground"
                      : "border-border bg-background/20 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label} · {library.counts[item]}
                </Link>
              );
            })}
          </nav>
        </div>

        {library.items.length > 0 ? (
          <div className="mt-6 space-y-6">
            {dailyItems.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
          <div className="mt-6 rounded-3xl border border-dashed border-border bg-card/35 px-6 py-16 text-center">
            <BookOpen className="mx-auto size-9 text-[var(--vivida-violet)]" />
            <h2 className="mt-4 text-xl font-semibold">
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
              <Link
                href="/taro"
                className="mt-5 inline-flex rounded-full bg-[var(--vivida-violet)] px-5 py-2.5 text-sm font-medium text-white"
              >
                {en ? "Ask your first question" : "დასვი პირველი კითხვა"}
              </Link>
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
                className="grid size-10 place-items-center rounded-full border border-border bg-card/50 hover:bg-card"
                aria-label={en ? "Previous page" : "წინა გვერდი"}
              >
                <ChevronLeft className="size-4" />
              </Link>
            ) : (
              <span className="size-10" />
            )}
            <span className="text-sm tabular-nums text-muted-foreground">
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
                className="grid size-10 place-items-center rounded-full border border-border bg-card/50 hover:bg-card"
                aria-label={en ? "Next page" : "შემდეგი გვერდი"}
              >
                <ChevronRight className="size-4" />
              </Link>
            ) : (
              <span className="size-10" />
            )}
          </nav>
        )}
      </section>
    </main>
  );
}
