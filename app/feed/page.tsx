import { Sparkles } from "lucide-react";

import { listFeed } from "@/actions/feed";
import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import { isAdminEmail } from "@/lib/admin-auth";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";

export const metadata = { title: "ფიდი" };
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const user = await requireUser();
  const [plan, posts] = await Promise.all([
    getCurrentPlan(user.id),
    listFeed({ limit: 30 }),
  ]);
  const viewerIsAdmin = isAdminEmail(user.email);

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%)]"
      />
      <Starfield count={100} shooting={2} />

      <AppHeader authed plan={plan} active="feed" />

      <section className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          საზოგადოება
        </div>
        <h1 className="mb-6 text-balance text-3xl font-semibold tracking-tight sm:mb-8 sm:text-4xl">
          ვივიდას{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            ფიდი
          </span>
        </h1>

        <div className="mb-6">
          <PostComposer
            authorImage={user.image ?? null}
            authorName={user.name ?? null}
          />
        </div>

        {posts.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-4">
            {posts.map((p) => (
              <li key={p.id}>
                <PostCard
                  post={p}
                  viewerId={user.id}
                  viewerIsAdmin={viewerIsAdmin}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center">
      <Sparkles className="mx-auto mb-3 size-8 text-[var(--vivida-violet)]" />
      <h2 className="text-lg font-semibold">ფიდი ჯერ ცარიელია</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        იყავი პირველი — დაწერე რასაც ფიქრობ, კითხვა, ციტატა, ან უბრალოდ
        როგორ ხარ.
      </p>
    </div>
  );
}
