import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ArticleCard } from "@/components/articles/article-card";
import { Kicker } from "@/components/en/editorial";
import { articlePath, listPublishedArticles } from "@/lib/articles";
import type { UserLocale } from "@/lib/i18n/locale";

const COPY = {
  ka: {
    eyebrow: "Vivida-ს ჟურნალი",
    title: "აზრები, რომლებიც შენთან რჩება",
    text: "ფსიქოლოგია, ფილოსოფია და თვითგანვითარება, მშვიდი, პრაქტიკული და დაფიქრებული პერსპექტივით.",
    all: "ყველა სტატია",
  },
  en: {
    eyebrow: "Read on Vivida",
    title: "Ideas worth staying with",
    text: "Psychology, philosophy and self-development through a thoughtful, practical lens.",
    all: "All articles",
  },
} as const;

export async function LatestArticlesSection({
  locale,
}: {
  locale: UserLocale;
}) {
  const articles = await listPublishedArticles(locale, { limit: 3 });
  if (!articles.length) return null;
  const copy = COPY[locale];
  const en = locale === "en";

  return (
    <section className="relative z-10 mx-auto w-full max-w-7xl border-b border-border/70 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {en ? (
            <Kicker>{copy.eyebrow}</Kicker>
          ) : (
            <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-primary">
              <span aria-hidden className="inline-block h-px w-8 bg-primary/70" />
              <span>{copy.eyebrow}</span>
            </div>
          )}
          <h2
            className={
              en
                ? "font-display mt-3 text-balance text-3xl font-medium tracking-[-0.01em] sm:text-5xl"
                : "mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            }
          >
            {copy.title}
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {copy.text}
          </p>
        </div>
        <Link
          href={articlePath(locale)}
          className="inline-flex h-9 shrink-0 items-center gap-2 self-start rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-secondary"
        >
          {copy.all} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-px border border-border bg-border md:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </div>
    </section>
  );
}
