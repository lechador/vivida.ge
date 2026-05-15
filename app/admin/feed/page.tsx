import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { db } from "@/db";
import {
  postComments,
  posts,
  profiles,
  users,
} from "@/db/schema";
import { AdminPostRow } from "@/components/admin/admin-post-row";
import { AdminCommentRow } from "@/components/admin/admin-comment-row";

export const metadata = { title: "ფიდის მოდერაცია" };
export const dynamic = "force-dynamic";

/**
 * Admin moderation surface for the community feed.
 *
 * Two stacked tables: most-recent posts + most-recent comments. Each
 * row has a delete button that calls the same server action that the
 * public PostCard uses — admin permission is granted by the email
 * allow-list check inside the action, not by a separate /admin/api
 * endpoint, so there's one path to audit.
 */
export default async function AdminFeedPage() {
  const [recentPosts, recentComments] = await Promise.all([
    db
      .select({
        id: posts.id,
        body: posts.body,
        createdAt: posts.createdAt,
        authorId: users.id,
        authorEmail: users.email,
        authorName: users.name,
        authorUsername: profiles.username,
      })
      .from(posts)
      .innerJoin(users, eq(users.id, posts.userId))
      .leftJoin(profiles, eq(profiles.userId, posts.userId))
      .orderBy(desc(posts.createdAt))
      .limit(100),
    db
      .select({
        id: postComments.id,
        postId: postComments.postId,
        body: postComments.body,
        createdAt: postComments.createdAt,
        authorId: users.id,
        authorEmail: users.email,
        authorName: users.name,
        authorUsername: profiles.username,
      })
      .from(postComments)
      .innerJoin(users, eq(users.id, postComments.userId))
      .leftJoin(profiles, eq(profiles.userId, postComments.userId))
      .orderBy(desc(postComments.createdAt))
      .limit(100),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-2 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          ფიდის მოდერაცია
        </h1>
        <Link
          href="/feed"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ფიდის ნახვა →
        </Link>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        ბოლო 100 პოსტი და კომენტარი. წაშლა იშლება სამუდამოდ — კომენტარები და
        რეაქციები კასკადით ქრება პოსტთან ერთად.
      </p>

      <section className="mb-12">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          პოსტები · {recentPosts.length}
        </h2>
        {recentPosts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/60 bg-card/30 p-6 text-center text-sm text-muted-foreground">
            ფიდი ცარიელია.
          </p>
        ) : (
          <ul className="space-y-2">
            {recentPosts.map((p) => (
              <AdminPostRow key={p.id} post={p} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          კომენტარები · {recentComments.length}
        </h2>
        {recentComments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/60 bg-card/30 p-6 text-center text-sm text-muted-foreground">
            კომენტარი ჯერ არ არსებობს.
          </p>
        ) : (
          <ul className="space-y-2">
            {recentComments.map((c) => (
              <AdminCommentRow key={c.id} comment={c} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
