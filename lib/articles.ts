import { cache } from "react";
import { and, desc, eq, lte, ne } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import { articles, type ArticleRow } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/locale";
import { ENGLISH_SITE_URL, GEORGIAN_SITE_URL } from "@/lib/seo/locales";

export const ARTICLE_CATEGORIES = [
  "psychology",
  "philosophy",
  "self-development",
  "relationships",
  "wellbeing",
  "astrology",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];
export type PublishedArticle = ArticleRow;
export type ArticlePreview = Pick<
  ArticleRow,
  "id" | "language" | "slug" | "title" | "category" | "imageUrl" | "imageAlt"
>;

export const ARTICLE_CATEGORY_LABELS: Record<
  UserLocale,
  Record<ArticleCategory, string>
> = {
  ka: {
    psychology: "ფსიქოლოგია",
    philosophy: "ფილოსოფია",
    "self-development": "თვითგანვითარება",
    relationships: "ურთიერთობები",
    wellbeing: "კეთილდღეობა",
    astrology: "ასტროლოგია",
  },
  en: {
    psychology: "Psychology",
    philosophy: "Philosophy",
    "self-development": "Self-development",
    relationships: "Relationships",
    wellbeing: "Wellbeing",
    astrology: "Astrology",
  },
};

export function isArticleCategory(
  value: string | undefined,
): value is ArticleCategory {
  return ARTICLE_CATEGORIES.includes(value as ArticleCategory);
}

/** Keep public reads alive during rolling deploys where code lands before DB migration. */
async function safely<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Article query unavailable; returning an empty result.",
        error,
      );
    }
    return fallback;
  }
}

const ARTICLE_REVALIDATE_SECONDS = 300;

function restoreDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function restoreArticleDates(article: PublishedArticle): PublishedArticle {
  return {
    ...article,
    publishedAt: article.publishedAt ? restoreDate(article.publishedAt) : null,
    createdAt: restoreDate(article.createdAt),
    updatedAt: restoreDate(article.updatedAt),
  };
}

const listPublishedArticlesAcrossRequests = unstable_cache(
  async (
    locale: UserLocale,
    limit: number,
    category: ArticleCategory | null,
  ): Promise<PublishedArticle[]> => {
    const conditions = [
      eq(articles.language, locale),
      eq(articles.status, "published"),
      lte(articles.publishedAt, new Date()),
      category ? eq(articles.category, category) : undefined,
    ].filter((value): value is NonNullable<typeof value> => Boolean(value));

    return safely(
      () =>
        db
          .select()
          .from(articles)
          .where(and(...conditions))
          .orderBy(desc(articles.featured), desc(articles.publishedAt))
          .limit(limit),
      [],
    );
  },
  ["published-articles"],
  { revalidate: ARTICLE_REVALIDATE_SECONDS, tags: ["articles"] },
);

export const listPublishedArticles = cache(
  async (
    locale: UserLocale,
    options: { limit?: number; category?: ArticleCategory } = {},
  ): Promise<PublishedArticle[]> => {
    const limit = Math.min(Math.max(options.limit ?? 60, 1), 60);
    const items = await listPublishedArticlesAcrossRequests(
      locale,
      limit,
      options.category ?? null,
    );
    return items.map(restoreArticleDates);
  },
);

/** Minimal article payload for compact recommendation surfaces. */
const listPublishedArticlePreviewsAcrossRequests = unstable_cache(
  async (locale: UserLocale, limit: number): Promise<ArticlePreview[]> => {
    return safely(
      () =>
        db
          .select({
            id: articles.id,
            language: articles.language,
            slug: articles.slug,
            title: articles.title,
            category: articles.category,
            imageUrl: articles.imageUrl,
            imageAlt: articles.imageAlt,
          })
          .from(articles)
          .where(
            and(
              eq(articles.language, locale),
              eq(articles.status, "published"),
              lte(articles.publishedAt, new Date()),
            ),
          )
          .orderBy(desc(articles.publishedAt))
          .limit(limit),
      [],
    );
  },
  ["published-article-previews"],
  { revalidate: ARTICLE_REVALIDATE_SECONDS, tags: ["articles"] },
);

export const listPublishedArticlePreviews = cache(
  async (
    locale: UserLocale,
    requestedLimit = 60,
  ): Promise<ArticlePreview[]> => {
    const limit = Math.min(Math.max(requestedLimit, 1), 60);
    return listPublishedArticlePreviewsAcrossRequests(locale, limit);
  },
);

const getPublishedArticleAcrossRequests = unstable_cache(
  async (
    locale: UserLocale,
    slug: string,
  ): Promise<PublishedArticle | null> => {
    const rows = await safely(
      () =>
        db
          .select()
          .from(articles)
          .where(
            and(
              eq(articles.language, locale),
              eq(articles.slug, slug),
              eq(articles.status, "published"),
              lte(articles.publishedAt, new Date()),
            ),
          )
          .limit(1),
      [],
    );
    return rows[0] ?? null;
  },
  ["published-article"],
  { revalidate: ARTICLE_REVALIDATE_SECONDS, tags: ["articles"] },
);

export const getPublishedArticle = cache(
  async (
    locale: UserLocale,
    slug: string,
  ): Promise<PublishedArticle | null> => {
    const article = await getPublishedArticleAcrossRequests(locale, slug);
    return article ? restoreArticleDates(article) : null;
  },
);

const getPublishedArticleTranslationsAcrossRequests = unstable_cache(
  async (translationKey: string): Promise<PublishedArticle[]> =>
    safely(
      () =>
        db
          .select()
          .from(articles)
          .where(
            and(
              eq(articles.translationKey, translationKey),
              eq(articles.status, "published"),
              lte(articles.publishedAt, new Date()),
            ),
          ),
      [],
    ),
  ["published-article-translations"],
  { revalidate: ARTICLE_REVALIDATE_SECONDS, tags: ["articles"] },
);

export const getPublishedArticleTranslations = cache(
  async (translationKey: string): Promise<PublishedArticle[]> => {
    const items =
      await getPublishedArticleTranslationsAcrossRequests(translationKey);
    return items.map(restoreArticleDates);
  },
);

const listSameCategoryArticlesAcrossRequests = unstable_cache(
  async (
    language: UserLocale,
    category: string,
    articleId: string,
    limit: number,
  ): Promise<PublishedArticle[]> =>
    safely(
      () =>
        db
          .select()
          .from(articles)
          .where(
            and(
              eq(articles.language, language),
              eq(articles.status, "published"),
              eq(articles.category, category),
              ne(articles.id, articleId),
              lte(articles.publishedAt, new Date()),
            ),
          )
          .orderBy(desc(articles.publishedAt))
          .limit(limit),
      [],
    ),
  ["related-published-articles"],
  { revalidate: ARTICLE_REVALIDATE_SECONDS, tags: ["articles"] },
);

export const listRelatedArticles = cache(
  async (article: PublishedArticle, limit = 3): Promise<PublishedArticle[]> => {
    const safeLimit = Math.min(Math.max(limit, 1), 12);
    const cachedSameCategory = await listSameCategoryArticlesAcrossRequests(
      article.language as UserLocale,
      article.category,
      article.id,
      safeLimit,
    );
    const sameCategory = cachedSameCategory.map(restoreArticleDates);
    if (sameCategory.length >= safeLimit) return sameCategory;

    const excludedIds = new Set([
      article.id,
      ...sameCategory.map((item) => item.id),
    ]);
    const recent = await listPublishedArticles(article.language as UserLocale, {
      limit: safeLimit + excludedIds.size,
    });
    return [
      ...sameCategory,
      ...recent.filter((item) => !excludedIds.has(item.id)),
    ].slice(0, safeLimit);
  },
);

const listPublishedArticleSitemapItemsAcrossRequests = unstable_cache(
  async () =>
    safely(
      () =>
        db
          .select({
            language: articles.language,
            slug: articles.slug,
            translationKey: articles.translationKey,
            updatedAt: articles.updatedAt,
          })
          .from(articles)
          .where(
            and(
              eq(articles.status, "published"),
              lte(articles.publishedAt, new Date()),
            ),
          )
          .orderBy(desc(articles.publishedAt)),
      [],
    ),
  ["published-article-sitemap-items"],
  { revalidate: ARTICLE_REVALIDATE_SECONDS, tags: ["articles"] },
);

export const listPublishedArticleSitemapItems = cache(async () => {
  const items = await listPublishedArticleSitemapItemsAcrossRequests();
  return items.map((item) => ({
    ...item,
    updatedAt: restoreDate(item.updatedAt),
  }));
});

export function articlePath(locale: UserLocale, slug?: string): string {
  const path = `/articles${slug ? `/${slug}` : ""}`;
  return path;
}

export function articleUrl(locale: UserLocale, slug?: string): string {
  const path = `/articles${slug ? `/${slug}` : ""}`;
  if (locale === "ka") return `${GEORGIAN_SITE_URL}${path}`;
  return `${ENGLISH_SITE_URL}${path}`;
}

export function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 210));
}

export function formatArticleDate(
  date: Date | null,
  locale: UserLocale,
): string {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
