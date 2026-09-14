import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Editorial articles. Every row is one language edition; `translationKey`
 * groups editions of the same story without requiring all three languages to
 * exist. This keeps publishing flexible and lets hreflang advertise only real,
 * published counterparts.
 */
export const articles = pgTable(
  "article",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    translationKey: text("translation_key").notNull(),
    language: text("language").notNull().default("ka"),
    slug: text("slug").notNull(),
    status: text("status").notNull().default("draft"),
    category: text("category").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    /** Trusted-editor Markdown; rendered by a deliberately small safe subset. */
    content: text("content").notNull(),
    imageUrl: text("image_url").notNull(),
    imageAlt: text("image_alt").notNull(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    authorName: text("author_name").notNull().default("Vivida Editorial"),
    featured: boolean("featured").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("article_language_slug_uq").on(t.language, t.slug),
    uniqueIndex("article_translation_language_uq").on(
      t.translationKey,
      t.language,
    ),
    index("article_published_language_idx").on(
      t.status,
      t.language,
      t.publishedAt,
    ),
    index("article_category_language_idx").on(t.category, t.language),
  ],
);

export type ArticleRow = typeof articles.$inferSelect;

export type NewArticleRow = typeof articles.$inferInsert;

/**
 * Public discussion attached to an editorial article. Reading is public, while
 * writes always require an authenticated, unrestricted Vivida account.
 */
export const articleComments = pgTable(
  "article_comment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("article_comment_article_created_idx").on(t.articleId, t.createdAt),
    index("article_comment_user_created_idx").on(t.userId, t.createdAt),
  ],
);

/** One toggleable like per user and article. */
export const articleLikes = pgTable(
  "article_like",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.articleId, t.userId] }),
    index("article_like_article_idx").on(t.articleId),
  ],
);

export type ArticleCommentRow = typeof articleComments.$inferSelect;

export type ArticleLikeRow = typeof articleLikes.$inferSelect;
