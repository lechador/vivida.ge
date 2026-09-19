import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ArticleCard } from "@/components/articles/article-card";
import { articlePath, listPublishedArticles } from "@/lib/articles";
import type { UserLocale } from "@/lib/i18n/locale";

const COPY = {
  ka: {
    eyebrow: "Vivida-ს საკითხავი",
    title: "აზრები, რომლებიც შენთან რჩება",
    text: "ფსიქოლოგია, ფილოსოფია და თვითგანვითარება — მშვიდი, პრაქტიკული და დაფიქრებული პერსპექტივით.",
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

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[var(--vivida-cyan)]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            {copy.title}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-foreground/72 sm:text-lg">
            {copy.text}
          </p>
        </div>
        <Link
          href={articlePath(locale)}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-border bg-card/55 px-4 py-2 text-sm font-semibold transition-colors hover:border-[var(--vivida-violet)]/45 hover:bg-card"
        >
          {copy.all} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} locale={locale} />
        ))}
      </div>
    </section>
  );
}
