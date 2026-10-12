"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2, MessageCircle, Send } from "lucide-react";

import { VerifiedBadge } from "@/components/profile/verified-badge";
import { DEFAULT_AVATAR } from "@/lib/avatar";
import type {
  ArticleComment,
  ArticleEngagement,
} from "@/lib/article-engagement";
import type { UserLocale } from "@/lib/i18n/locale";

const COMMENT_MAX = 1_000;

const COPY = {
  ka: {
    discussion: "დისკუსია",
    comments: "კომენტარი",
    like: "მომწონს",
    unlike: "მოწონების გაუქმება",
    placeholder: "გაგვიზიარე შენი აზრი…",
    publish: "გამოქვეყნება",
    empty: "ჯერ კომენტარი არ არის, დაიწყე საუბარი.",
    loginTitle: "შემოუერთდი დისკუსიას",
    loginText: "სტატიის მოსაწონად ან კომენტარის დასაწერად გაიარე ავტორიზაცია.",
    login: "შესვლა",
    genericError: "მოქმედება ვერ შესრულდა. სცადე თავიდან.",
    invalidComment: "დაწერე კომენტარი გამოქვეყნებამდე.",
    user: "Vivida-ს წევრი",
  },
  en: {
    discussion: "Discussion",
    comments: "comments",
    like: "Like",
    unlike: "Remove like",
    placeholder: "Share your perspective…",
    publish: "Publish",
    empty: "No comments yet, start the conversation.",
    loginTitle: "Join the discussion",
    loginText: "Sign in to like this article or leave a comment.",
    login: "Sign in",
    genericError: "That action did not work. Please try again.",
    invalidComment: "Write a comment before publishing.",
    user: "Vivida member",
  },
} as const;

type ClientComment = Omit<ArticleComment, "createdAt"> & {
  createdAt: Date | string;
};

type Props = {
  articleId: string;
  locale: UserLocale;
  loginHref: string;
};

type EngagementPayload = ArticleEngagement & { isAuthenticated: boolean };

const EMPTY_ENGAGEMENT: ArticleEngagement = {
  likeCount: 0,
  commentCount: 0,
  viewerLiked: false,
  comments: [],
};

function commentDate(value: Date | string, locale: UserLocale): string {
  return new Intl.DateTimeFormat(locale === "ka" ? "ka-GE" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

async function responseError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload.error && !payload.error.endsWith("_failed")) {
      return payload.error === "invalid_comment" ? fallback : payload.error;
    }
  } catch {
    // A non-JSON error page still receives the localized fallback below.
  }
  return fallback;
}

export function ArticleEngagement({ articleId, locale, loginHref }: Props) {
  const copy = COPY[locale];
  const router = useRouter();
  const [liked, setLiked] = useState(EMPTY_ENGAGEMENT.viewerLiked);
  const [likeCount, setLikeCount] = useState(EMPTY_ENGAGEMENT.likeCount);
  const [commentCount, setCommentCount] = useState(
    EMPTY_ENGAGEMENT.commentCount,
  );
  const [comments, setComments] = useState<ClientComment[]>(
    EMPTY_ENGAGEMENT.comments,
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [engagementReady, setEngagementReady] = useState(false);
  const [body, setBody] = useState("");
  const [likePending, setLikePending] = useState(false);
  const [commentPending, setCommentPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetch(`/api/articles/${articleId}/comments`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("engagement_failed");
        return response.json() as Promise<EngagementPayload>;
      })
      .then((payload) => {
        if (!active) return;
        setLiked(payload.viewerLiked);
        setLikeCount(payload.likeCount);
        setCommentCount(payload.commentCount);
        setComments(payload.comments);
        setIsAuthenticated(payload.isAuthenticated);
      })
      .catch(() => {
        // The article remains fully readable if engagement is unavailable.
      })
      .finally(() => {
        if (active) setEngagementReady(true);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [articleId]);

  async function toggleLike() {
    if (!engagementReady) return;
    if (!isAuthenticated) {
      router.push(loginHref);
      return;
    }
    if (likePending) return;

    const previousLiked = liked;
    const previousCount = likeCount;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)));
    setLikePending(true);
    setError(null);

    try {
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: "POST",
      });
      if (response.status === 401) {
        router.push(loginHref);
        return;
      }
      if (!response.ok)
        throw new Error(await responseError(response, copy.genericError));
      const payload = (await response.json()) as {
        liked: boolean;
        likeCount: number;
      };
      setLiked(payload.liked);
      setLikeCount(payload.likeCount);
    } catch (caught) {
      setLiked(previousLiked);
      setLikeCount(previousCount);
      setError(caught instanceof Error ? caught.message : copy.genericError);
    } finally {
      setLikePending(false);
    }
  }

  async function publishComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const commentBody = body.trim();
    if (!commentBody) {
      setError(copy.invalidComment);
      return;
    }
    if (commentPending) return;

    setCommentPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: commentBody }),
      });
      if (response.status === 401) {
        router.push(loginHref);
        return;
      }
      if (!response.ok)
        throw new Error(await responseError(response, copy.genericError));
      const payload = (await response.json()) as { comment: ClientComment };
      setComments((current) => [...current, payload.comment]);
      setCommentCount((count) => count + 1);
      setBody("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.genericError);
    } finally {
      setCommentPending(false);
    }
  }

  return (
    <section
      id="discussion"
      className="mx-auto w-full max-w-5xl scroll-mt-24 px-4 pb-16 sm:px-6 sm:pb-20"
      aria-labelledby="discussion-title"
    >
      <div className="rounded-3xl border border-border/70 bg-card/45 p-5 shadow-[0_28px_90px_-55px_oklch(0.65_0.24_305/0.7)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <h2
              id="discussion-title"
              className="text-2xl font-semibold sm:text-3xl"
            >
              {copy.discussion}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {commentCount} {copy.comments}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleLike}
            disabled={!engagementReady || likePending}
            aria-pressed={liked}
            aria-label={liked ? copy.unlike : copy.like}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all disabled:cursor-wait disabled:opacity-70 ${
              liked
                ? "border-pink-400/45 bg-pink-400/15 text-pink-300"
                : "border-border/80 bg-background/35 text-foreground/80 hover:border-pink-400/35 hover:text-pink-300"
            }`}
          >
            {likePending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Heart
                className={`size-4 ${liked ? "fill-current" : ""}`}
                aria-hidden
              />
            )}
            {copy.like} · {likeCount}
          </button>
        </div>

        {!engagementReady ? (
          <div
            className="vivida-pulse-soft mt-6 h-24 rounded-2xl border border-border/60 bg-background/25"
            aria-hidden
          />
        ) : isAuthenticated ? (
          <form onSubmit={publishComment} className="mt-6">
            <label htmlFor="article-comment" className="sr-only">
              {copy.placeholder}
            </label>
            <textarea
              id="article-comment"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={COMMENT_MAX}
              rows={4}
              placeholder={copy.placeholder}
              className="w-full resize-y rounded-2xl border border-border/80 bg-background/35 px-4 py-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-[var(--vivida-violet)]/65 focus:ring-2 focus:ring-[var(--vivida-violet)]/15"
            />
            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground">
                {body.length}/{COMMENT_MAX}
              </span>
              <button
                type="submit"
                disabled={commentPending || body.trim().length === 0}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {commentPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-4" aria-hidden />
                )}
                {copy.publish}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--vivida-violet)]/25 bg-[var(--vivida-violet)]/8 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{copy.loginTitle}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {copy.loginText}
              </p>
            </div>
            <Link
              href={loginHref}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
            >
              {copy.login}
            </Link>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-7 space-y-5" aria-live="polite">
          {!engagementReady ? (
            <div
              className="vivida-pulse-soft h-20 rounded-2xl border border-border/60 bg-background/25"
              aria-hidden
            />
          ) : comments.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border/70 p-5 text-sm text-muted-foreground">
              <MessageCircle className="size-5 shrink-0" aria-hidden />
              {copy.empty}
            </div>
          ) : (
            comments.map((comment) => {
              const displayName = comment.author.name ?? copy.user;
              const profileHref = comment.author.username
                ? `/u/${comment.author.username}`
                : null;
              const avatar = (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={comment.author.image || DEFAULT_AVATAR}
                  alt=""
                  className="size-10 shrink-0 rounded-full border border-border/80 object-cover"
                />
              );

              return (
                <article key={comment.id} className="flex items-start gap-3">
                  {profileHref ? (
                    <Link href={profileHref} aria-label={displayName}>
                      {avatar}
                    </Link>
                  ) : (
                    avatar
                  )}
                  <div className="min-w-0 flex-1 rounded-2xl bg-background/30 px-4 py-3 ring-1 ring-foreground/5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      {profileHref ? (
                        <Link
                          href={profileHref}
                          className="font-semibold hover:text-[var(--vivida-violet)]"
                        >
                          {displayName}
                        </Link>
                      ) : (
                        <span className="font-semibold">{displayName}</span>
                      )}
                      {comment.author.verified && <VerifiedBadge />}
                      <time
                        dateTime={new Date(comment.createdAt).toISOString()}
                        suppressHydrationWarning
                        className="text-xs text-muted-foreground"
                      >
                        {commentDate(comment.createdAt, locale)}
                      </time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/88">
                      {comment.body}
                    </p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
