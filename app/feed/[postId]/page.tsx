import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { getPostForViewer } from "@/lib/feed-core";
import { isAdminEmail } from "@/lib/admin-auth";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { PostCard } from "@/components/feed/post-card";
import { getUserLocale } from "@/lib/i18n/user-locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getRequestLocale()) !== "ka" ? "Post" : "პოსტი" };
}
export const dynamic = "force-dynamic";

/**
 * Single-post thread page (Threads/X style). Reached by clicking any post in
 * the feed. Renders the post with `mode="detail"` so the comment thread is
 * shown and replyable inline, instead of the feed's collapsed teaser.
 */
export default async function PostThreadPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const user = await requireUser();

  const [post, locale] = await Promise.all([
    getPostForViewer(user.id, postId),
    getUserLocale(user.id),
  ]);
  const en = locale !== "ka";
  const am = locale === "am";

  if (!post) notFound();

  return (
    <main lang={locale} className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%)]"
      />
      <Starfield count={70} shooting={1} />

      <AppHeader authed active="feed" />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <Link
          href="/feed"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {am ? "Վերադառնալ լրահոս" : en ? "Back to feed" : "ფიდზე დაბრუნება"}
        </Link>

        <PostCard
          post={post}
          viewerId={user.id}
          viewerIsAdmin={isAdminEmail(user.email)}
          mode="detail"
          locale={locale}
        />
      </section>
    </main>
  );
}
