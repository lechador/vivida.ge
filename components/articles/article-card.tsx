import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";

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
  return (
    <article
      className={`group overflow-hidden rounded-3xl border border-border/70 bg-card/55 ring-1 ring-foreground/5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[var(--vivida-violet)]/45 hover:bg-card/80 hover:shadow-[0_24px_70px_-35px_oklch(0.65_0.24_305/0.7)] ${
        featured ? "sm:grid sm:grid-cols-[1.22fr_1fr]" : "flex h-full flex-col"
      }`}
    >
      <Link
        href={articlePath(locale, article.slug)}
        className={`relative block overflow-hidden bg-muted ${
          featured ? "min-h-64 sm:min-h-full" : "aspect-[16/10]"
        }`}
        aria-label={article.title}
      >
        <Image
          src={article.imageUrl}
          alt={article.imageAlt}
          fill
          sizes={
            featured
              ? "(max-width: 640px) 100vw, 55vw"
              : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
          priority={featured}
          quality={75}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-80"
        />
      </Link>

      <div
        className={`flex flex-1 flex-col ${featured ? "p-6 sm:p-8 lg:p-10" : "p-5 sm:p-6"}`}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <span className="rounded-full border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 px-2.5 py-1 font-medium text-[var(--vivida-violet)]">
            {
              ARTICLE_CATEGORY_LABELS[locale][
                article.category as keyof (typeof ARTICLE_CATEGORY_LABELS)[typeof locale]
              ]
            }
          </span>
          <span>{formatArticleDate(article.publishedAt, locale)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" aria-hidden />
            {readingMinutes(article.content)} {READ[locale]}
          </span>
        </div>

        <h3
          className={`${featured ? "mt-5 text-2xl sm:text-3xl" : "mt-4 text-xl"} text-balance font-semibold leading-tight tracking-tight`}
        >
          <Link href={articlePath(locale, article.slug)}>{article.title}</Link>
        </h3>
        <p
          className={`${featured ? "mt-4 text-base" : "mt-3 text-sm"} line-clamp-3 text-pretty leading-relaxed text-foreground/72`}
        >
          {article.excerpt}
        </p>

        <Link
          href={articlePath(locale, article.slug)}
          className="mt-6 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-[var(--vivida-cyan)]"
        >
          {locale === "ka" ? "წაიკითხე" : "Read article"}
          <ArrowUpRight
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </article>
  );
}
