import { and, desc, eq, lte, notInArray, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  articleComments,
  articleLikes,
  articles,
  profiles,
  users,
} from "@/db/schema";
import { loadProfilePhotos } from "@/lib/feed-core";
import { isAccountRestricted, RESTRICTED_MESSAGE } from "@/lib/restriction";
import { hasVerifiedBadge } from "@/lib/verified-badge";
import { getBlockedUserIds } from "@/lib/block";

export const ARTICLE_COMMENT_MAX = 1_000;
const COMMENT_THROTTLE_MS = 5_000;
const COMMENT_LIMIT = 100;

export type ArticleComment = {
  id: string;
  body: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
    username: string | null;
    verified: boolean;
  };
};

export type ArticleEngagement = {
  likeCount: number;
  commentCount: number;
  viewerLiked: boolean;
  comments: ArticleComment[];
};

export type ArticleEngagementResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const COMMENT_SELECT = {
  id: articleComments.id,
  body: articleComments.body,
  createdAt: articleComments.createdAt,
  authorId: users.id,
  authorName: users.name,
  authorImage: users.image,
  authorUsername: profiles.username,
  authorDisplayName: profiles.displayName,
  authorIsPremium: users.isPremium,
  authorPremiumUntil: users.premiumUntil,
  authorVerifiedBadgeGrantedAt: users.verifiedBadgeGrantedAt,
};

type CommentRow = {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
  authorUsername: string | null;
  authorDisplayName: string | null;
  authorIsPremium: boolean;
  authorPremiumUntil: Date | null;
  authorVerifiedBadgeGrantedAt: Date | null;
};

async function toComments(rows: CommentRow[]): Promise<ArticleComment[]> {
  const photos = await loadProfilePhotos(
    Array.from(new Set(rows.map((row) => row.authorId))),
  );
  const now = Date.now();
  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.createdAt,
    author: {
      id: row.authorId,
      name:
        row.authorDisplayName ??
        row.authorName ??
        row.authorUsername ??
        null,
      image: photos.get(row.authorId) ?? row.authorImage,
      username: row.authorUsername,
      verified: hasVerifiedBadge(
        {
          isPremium: row.authorIsPremium,
          premiumUntil: row.authorPremiumUntil,
          verifiedBadgeGrantedAt: row.authorVerifiedBadgeGrantedAt,
        },
        now,
      ),
    },
  }));
}

/** Public read model for the article page. */
export async function getArticleEngagement(
  articleId: string,
  viewerId?: string,
): Promise<ArticleEngagement> {
  try {
    const blockedIds = viewerId ? await getBlockedUserIds(viewerId) : [];
    const [likes, commentTotal, mine, rows] = await Promise.all([
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(articleLikes)
        .where(
          and(
            eq(articleLikes.articleId, articleId),
            blockedIds.length
              ? notInArray(articleLikes.userId, blockedIds)
              : undefined,
          ),
        ),
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(articleComments)
        .where(
          and(
            eq(articleComments.articleId, articleId),
            blockedIds.length
              ? notInArray(articleComments.userId, blockedIds)
              : undefined,
          ),
        ),
      viewerId
        ? db
            .select({ articleId: articleLikes.articleId })
            .from(articleLikes)
            .where(
              and(
                eq(articleLikes.articleId, articleId),
                eq(articleLikes.userId, viewerId),
              ),
            )
            .limit(1)
        : Promise.resolve([]),
      db
        .select(COMMENT_SELECT)
        .from(articleComments)
        .innerJoin(users, eq(users.id, articleComments.userId))
        .leftJoin(profiles, eq(profiles.userId, articleComments.userId))
        .where(
          and(
            eq(articleComments.articleId, articleId),
            blockedIds.length
              ? notInArray(articleComments.userId, blockedIds)
              : undefined,
          ),
        )
        .orderBy(desc(articleComments.createdAt))
        .limit(COMMENT_LIMIT),
    ]);

    return {
      likeCount: Number(likes[0]?.value ?? 0),
      commentCount: Number(commentTotal[0]?.value ?? 0),
      viewerLiked: mine.length > 0,
      comments: (await toComments(rows)).reverse(),
    };
  } catch (error) {
    // Code may briefly deploy before its migration. Keep published articles
    // readable during that window; writes still fail visibly through the API.
    if (process.env.NODE_ENV !== "production") {
      console.warn("Article engagement unavailable; using empty state.", error);
    }
    return { likeCount: 0, commentCount: 0, viewerLiked: false, comments: [] };
  }
}

async function publishedArticleExists(articleId: string): Promise<boolean> {
  const [article] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(
      and(
        eq(articles.id, articleId),
        eq(articles.status, "published"),
        lte(articles.publishedAt, new Date()),
      ),
    )
    .limit(1);
  return Boolean(article);
}

/** Toggle one authenticated user's like and return authoritative state/count. */
export async function toggleArticleLike(
  userId: string,
  articleId: string,
): Promise<
  ArticleEngagementResult<{ liked: boolean; likeCount: number }>
> {
  if (await isAccountRestricted(userId)) {
    return { ok: false, error: RESTRICTED_MESSAGE };
  }
  if (!(await publishedArticleExists(articleId))) {
    return { ok: false, error: "სტატია ვერ მოიძებნა." };
  }

  const removed = await db
    .delete(articleLikes)
    .where(
      and(
        eq(articleLikes.articleId, articleId),
        eq(articleLikes.userId, userId),
      ),
    )
    .returning({ articleId: articleLikes.articleId });

  let liked = false;
  if (removed.length === 0) {
    await db
      .insert(articleLikes)
      .values({ articleId, userId })
      .onConflictDoNothing();
    liked = true;
  }

  const [total] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(articleLikes)
    .where(eq(articleLikes.articleId, articleId));

  return {
    ok: true,
    data: { liked, likeCount: Number(total?.value ?? 0) },
  };
}

/** Validate and append a top-level article comment. */
export async function addArticleComment(
  userId: string,
  articleId: string,
  rawBody: string,
): Promise<ArticleEngagementResult<{ comment: ArticleComment }>> {
  if (await isAccountRestricted(userId)) {
    return { ok: false, error: RESTRICTED_MESSAGE };
  }
  const body = rawBody.trim();
  if (!body) return { ok: false, error: "კომენტარი ცარიელია." };
  if (body.length > ARTICLE_COMMENT_MAX) {
    return {
      ok: false,
      error: `კომენტარი მაქსიმუმ ${ARTICLE_COMMENT_MAX} სიმბოლო უნდა იყოს.`,
    };
  }
  if (!(await publishedArticleExists(articleId))) {
    return { ok: false, error: "სტატია ვერ მოიძებნა." };
  }

  const cutoff = new Date(Date.now() - COMMENT_THROTTLE_MS);
  const [recent] = await db
    .select({ id: articleComments.id })
    .from(articleComments)
    .where(
      and(
        eq(articleComments.userId, userId),
        sql`${articleComments.createdAt} > ${cutoff}`,
      ),
    )
    .limit(1);
  if (recent) {
    return { ok: false, error: "ცოტა დაიცადე — ახლახან დაწერე კომენტარი." };
  }

  const [inserted] = await db
    .insert(articleComments)
    .values({ articleId, userId, body })
    .returning({ id: articleComments.id });
  if (!inserted) {
    return { ok: false, error: "კომენტარი ვერ გამოქვეყნდა." };
  }

  const rows = await db
    .select(COMMENT_SELECT)
    .from(articleComments)
    .innerJoin(users, eq(users.id, articleComments.userId))
    .leftJoin(profiles, eq(profiles.userId, articleComments.userId))
    .where(eq(articleComments.id, inserted.id))
    .limit(1);
  const [comment] = await toComments(rows);
  if (!comment) {
    return { ok: false, error: "კომენტარი ვერ გამოქვეყნდა." };
  }
  return { ok: true, data: { comment } };
}
