import { cache } from "react";
import { and, desc, eq, lte, ne } from "drizzle-orm";

import { db } from "@/db";
import { articles, type ArticleRow } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/locale";
import {
  ARMENIAN_SITE_URL,
  ENGLISH_SITE_URL,
  GEORGIAN_SITE_URL,
} from "@/lib/seo/locales";

export const ARTICLE_CATEGORIES = [
  "psychology",
  "philosophy",
  "self-development",
  "relationships",
  "wellbeing",
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];
export type PublishedArticle = ArticleRow;

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
  },
  en: {
    psychology: "Psychology",
    philosophy: "Philosophy",
    "self-development": "Self-development",
    relationships: "Relationships",
    wellbeing: "Wellbeing",
  },
  am: {
    psychology: "Հոգեբանություն",
    philosophy: "Փիլիսոփայություն",
    "self-development": "Ինքնազարգացում",
    relationships: "Հարաբերություններ",
    wellbeing: "Բարեկեցություն",
  },
};

export function isArticleCategory(value: string | undefined): value is ArticleCategory {
  return ARTICLE_CATEGORIES.includes(value as ArticleCategory);
}

/** Keep public reads alive during rolling deploys where code lands before DB migration. */
async function safely<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Article query unavailable; returning an empty result.", error);
    }
    return fallback;
  }
}

export const listPublishedArticles = cache(
  async (
    locale: UserLocale,
    options: { limit?: number; category?: ArticleCategory } = {},
  ): Promise<PublishedArticle[]> => {
    const limit = Math.min(Math.max(options.limit ?? 24, 1), 60);
    const conditions = [
      eq(articles.language, locale),
      eq(articles.status, "published"),
      lte(articles.publishedAt, new Date()),
      options.category ? eq(articles.category, options.category) : undefined,
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
);

export const getPublishedArticle = cache(
  async (locale: UserLocale, slug: string): Promise<PublishedArticle | null> => {
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
);

export const getPublishedArticleTranslations = cache(
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
);

export const listRelatedArticles = cache(
  async (article: PublishedArticle, limit = 3): Promise<PublishedArticle[]> => {
    const sameCategory = await safely(
      () =>
        db
          .select()
          .from(articles)
          .where(
            and(
              eq(articles.language, article.language),
              eq(articles.status, "published"),
              eq(articles.category, article.category),
              ne(articles.id, article.id),
              lte(articles.publishedAt, new Date()),
            ),
          )
          .orderBy(desc(articles.publishedAt))
          .limit(limit),
      [],
    );
    if (sameCategory.length >= limit) return sameCategory;

    const excludedIds = new Set([article.id, ...sameCategory.map((item) => item.id)]);
    const recent = await listPublishedArticles(article.language as UserLocale, {
      limit: limit + excludedIds.size,
    });
    return [
      ...sameCategory,
      ...recent.filter((item) => !excludedIds.has(item.id)),
    ].slice(0, limit);
  },
);

export const listPublishedArticleSitemapItems = cache(async () =>
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
);

export function articlePath(locale: UserLocale, slug?: string): string {
  const path = `/articles${slug ? `/${slug}` : ""}`;
  return locale === "am" ? `/am${path}` : path;
}

export function articleUrl(locale: UserLocale, slug?: string): string {
  const path = `/articles${slug ? `/${slug}` : ""}`;
  if (locale === "ka") return `${GEORGIAN_SITE_URL}${path}`;
  if (locale === "am") return `${ARMENIAN_SITE_URL}${path}`;
  return `${ENGLISH_SITE_URL}${path}`;
}

export function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 210));
}

export function formatArticleDate(date: Date | null, locale: UserLocale): string {
  if (!date) return "";
  return new Intl.DateTimeFormat(
    locale === "ka" ? "ka-GE" : locale === "am" ? "hy-AM" : "en-US",
    { day: "numeric", month: "long", year: "numeric" },
  ).format(date);
}
