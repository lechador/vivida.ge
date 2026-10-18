import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  ARTICLE_CATEGORY_LABELS,
  articlePath,
  formatArticleDate,
  readingMinutes,
  type PublishedArticle,
} from "@/lib/articles";
import type { UserLocale } from "@/lib/i18n/locale";

const READ = {
  ka: "წთ საკითხავი",
  en: "min read",
} as const;

export function ArticleCard({
  article,
  locale,
  featured = false,
}: {
  article: PublishedArticle;
  locale: UserLocale;
  featured?: boolean;
}) {
  const categoryLabel =
    ARTICLE_CATEGORY_LABELS[locale][
      article.category as keyof (typeof ARTICLE_CATEGORY_LABELS)[typeof locale]
    ];

  return (
    <article
      className={`group overflow-hidden bg-card transition-colors duration-150 hover:bg-secondary/40 ${
        featured
          ? "border border-border sm:grid sm:grid-cols-[1.2fr_1fr]"
          : "flex h-full flex-col"
      }`}
    >
      <Link
        href={articlePath(locale, article.slug)}
        className={`relative block overflow-hidden bg-muted ${
          featured ? "min-h-64 sm:min-h-full" : "aspect-[16/10] border-b border-border/70"
        }`}
        aria-label={article.title}
      >
        <Image
          src={article.imageUrl}
          alt={article.imageAlt}
          fill
          referrerPolicy="no-referrer"
          sizes={
            featured
              ? "(max-width: 640px) 100vw, 55vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          priority={featured}
          quality={75}
        />
      </Link>

      <div
        className={`flex flex-1 flex-col justify-between ${
          featured ? "p-6 sm:p-8 lg:p-10" : "p-5 sm:p-6"
        }`}
      >
        <div>
          {/* Unboxed inline metadata separated by middle dots (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium uppercase tracking-wider text-primary">
              {categoryLabel}
            </span>
            <span aria-hidden>·</span>
            <span>{formatArticleDate(article.publishedAt, locale)}</span>
            <span aria-hidden>·</span>
            <span className="font-mono tabular-nums">
              {readingMinutes(article.content)} {READ[locale]}
            </span>
          </div>

          <h3
            className={`${
              featured ? "mt-4 text-2xl sm:text-3xl" : "mt-3 text-lg sm:text-xl"
            } text-balance font-semibold leading-snug tracking-tight text-foreground`}
          >
            <Link href={articlePath(locale, article.slug)}>
              {article.title}
            </Link>
          </h3>
          <p
            className={`${
              featured ? "mt-3 text-base" : "mt-2.5 text-sm"
            } line-clamp-3 text-pretty leading-relaxed text-muted-foreground`}
          >
            {article.excerpt}
          </p>
        </div>

        <Link
          href={articlePath(locale, article.slug)}
          className="mt-6 inline-flex items-center gap-1.5 self-start text-xs font-medium uppercase tracking-wider text-primary transition-colors group-hover:text-foreground"
        >
          {locale === "ka" ? "წაიკითხე სტატია" : "Read article"}
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </article>
  );
}
