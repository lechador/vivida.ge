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
        <div className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
          <span aria-hidden className="inline-block h-px w-6 bg-primary/70" />
          <h2 id="dashboard-articles-title">{copy.title}</h2>
        </div>
        <Link
          href={articlePath(locale)}
          className="inline-flex shrink-0 items-center gap-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copy.all}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </header>

      <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={articlePath(locale, article.slug)}
            className="group flex min-h-24 overflow-hidden bg-card transition-colors hover:bg-secondary/60"
            aria-label={article.title}
          >
            <span className="relative w-24 shrink-0 overflow-hidden border-r border-border/70 bg-muted">
              <Image
                src={article.imageUrl}
                alt={article.imageAlt}
                fill
                referrerPolicy="no-referrer"
                sizes="96px"
                quality={60}
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </span>

            <span className="flex min-w-0 flex-1 flex-col justify-center p-3.5">
              <span className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
                {
                  ARTICLE_CATEGORY_LABELS[locale][
                    article.category as ArticleCategory
                  ]
                }
              </span>
              <span className="line-clamp-3 text-sm font-semibold leading-snug tracking-tight text-foreground">
                {article.title}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
