import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  ARTICLE_CATEGORY_LABELS,
  articlePath,
  type ArticleCategory,
  type ArticlePreview,
} from "@/lib/articles";
import type { UserLocale } from "@/lib/i18n/locale";

const COPY = {
  ka: { title: "საკითხავი შენთვის", all: "ყველა სტატია" },
  en: { title: "Recommended reading", all: "All articles" },
} as const;

export function DashboardArticleRecommendations({
  articles,
  locale,
}: {
  articles: ArticlePreview[];
  locale: UserLocale;
}) {
  if (!articles.length) return null;

  const copy = COPY[locale];

  return (
    <section className="mt-8" aria-labelledby="dashboard-articles-title">
      <header className="mb-3 flex items-center justify-between gap-4">
        <h2
          id="dashboard-articles-title"
          className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          {copy.title}
        </h2>
        <Link
          href={articlePath(locale)}
          className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copy.all}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={articlePath(locale, article.slug)}
            className="group flex min-h-24 overflow-hidden rounded-2xl border border-border/70 bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[var(--vivida-violet)]/45 hover:bg-card/75"
            aria-label={article.title}
          >
            <span className="relative w-24 shrink-0 overflow-hidden bg-muted">
              <Image
                src={article.imageUrl}
                alt={article.imageAlt}
                fill
                sizes="96px"
                quality={60}
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-transparent to-background/15"
              />
            </span>

            <span className="flex min-w-0 flex-1 flex-col justify-center p-3">
              <span className="mb-1 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--vivida-cyan)]">
                {
                  ARTICLE_CATEGORY_LABELS[locale][
                    article.category as ArticleCategory
                  ]
                }
              </span>
              <span className="line-clamp-3 text-sm font-semibold leading-snug tracking-tight text-foreground/90 transition-colors group-hover:text-foreground">
                {article.title}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
