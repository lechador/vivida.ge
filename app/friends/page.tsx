import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, UserPlus, Users } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import {
  listFriends,
  listIncomingRequests,
  listOutgoingRequests,
  type FriendshipUser,
} from "@/lib/friendship";
import {
  enrichFriendsWithSynastry,
  type FriendWithSynastry,
} from "@/lib/friend-synastry";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { FriendActions } from "@/components/friends/friend-actions";
import { CompatibilityChip } from "@/components/friends/compatibility-chip";
import { CompatibilityRow } from "@/components/friends/compatibility-row";
import { MessageButton } from "@/components/chat/message-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "მეგობრები" };

type Tab = "friends" | "compatibility" | "incoming" | "outgoing";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "friends", label: "მეგობრები" },
  { id: "compatibility", label: "თავსებადობა" },
  { id: "incoming", label: "შემოსული" },
  { id: "outgoing", label: "გაგზავნილი" },
];

export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const tab: Tab =
    params.tab === "compatibility" ||
    params.tab === "incoming" ||
    params.tab === "outgoing"
      ? params.tab
      : "friends";

  const [plan, friends, incoming, outgoing] = await Promise.all([
    getCurrentPlan(user.id),
    listFriends(user.id),
    listIncomingRequests(user.id),
    listOutgoingRequests(user.id),
  ]);

  const { viewerHasChart, friends: enrichedFriends } =
    await enrichFriendsWithSynastry(user.id, friends);

  const counts: Record<Tab, number> = {
    friends: enrichedFriends.length,
    compatibility: enrichedFriends.length,
    incoming: incoming.length,
    outgoing: outgoing.length,
  };

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_42%_at_50%_-5%,oklch(0.32_0.16_305/0.5),transparent_70%),radial-gradient(40%_30%_at_85%_60%,oklch(0.28_0.13_220/0.35),transparent_70%)]"
      />
      <Starfield count={110} shooting={3} />

      <AppHeader authed plan={plan} active="friends" />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-20 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          ხალხი
        </div>
        <h1 className="mb-6 text-balance text-3xl font-semibold tracking-tight sm:mb-8 sm:text-5xl">
          შენი{" "}
          <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
            წრე
          </span>
        </h1>

        {/* Tabs */}
        <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map(({ id, label }) => {
            const isActive = id === tab;
            const count = counts[id];
            return (
              <Link
                key={id}
                href={id === "friends" ? "/friends" : `/friends?tab=${id}`}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-all",
                  isActive
                    ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15 text-foreground shadow-[0_0_20px_-6px_oklch(0.78_0.18_305/0.6)]"
                    : "border-border bg-card/40 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                )}
              >
                {label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[10px] font-semibold leading-tight tabular-nums",
                    isActive
                      ? "bg-foreground/15 text-foreground"
                      : "bg-card/60 text-muted-foreground"
                  )}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </nav>

        {tab === "compatibility" ? (
          <CompatibilityTab
            viewerHasChart={viewerHasChart}
            friends={enrichedFriends}
          />
        ) : tab === "friends" ? (
          <>
            {!viewerHasChart && enrichedFriends.length > 0 && (
              <NoChartBanner />
            )}
            {enrichedFriends.length === 0 ? (
              <EmptyState tab="friends" />
            ) : (
              <ul className="grid gap-3">
                {enrichedFriends.map((u) => (
                  <FriendRow key={u.id} u={u} variant="friends" />
                ))}
              </ul>
            )}
          </>
        ) : (() => {
          const list = tab === "incoming" ? incoming : outgoing;
          return list.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <ul className="grid gap-3">
              {list.map((u) => (
                <FriendRow key={u.id} u={u} variant={tab} />
              ))}
            </ul>
          );
        })()}
      </section>
    </main>
  );
}

/** Compatibility tab — viewer's friends ranked by synastry score. Friends
 *  without a chart sink to the bottom (sentinel score of -1). */
function CompatibilityTab({
  viewerHasChart,
  friends,
}: {
  viewerHasChart: boolean;
  friends: FriendWithSynastry[];
}) {
  if (friends.length === 0) {
    return <EmptyState tab="compatibility" />;
  }
  if (!viewerHasChart) {
    return <NoChartBanner full />;
  }
  const ranked = [...friends].sort((a, b) => {
    const sa = a.synastry?.overall ?? -1;
    const sb = b.synastry?.overall ?? -1;
    return sb - sa;
  });
  return (
    <>
      <p className="mb-4 text-xs text-muted-foreground sm:text-sm">
        შენი მეგობრები დალაგებულია ცის რუკების ერთობლივი თავსებადობით. დააჭირე
        ვინმეს — ნახავ სრულ აღწერას.
      </p>
      <ul className="grid gap-3">
        {ranked.map((u, i) => (
          <CompatibilityRow key={u.id} u={u} rank={i + 1} />
        ))}
      </ul>
    </>
  );
}

/** Inline / full banner urging the viewer to fill out their birth chart so
 *  synastry can compute. Inline mode sits above the friends list; full
 *  mode replaces it (used on the compatibility tab). */
function NoChartBanner({ full = false }: { full?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--vivida-violet)]/35 bg-gradient-to-br from-[var(--vivida-violet)]/10 via-card/60 to-[var(--vivida-cyan)]/10 p-5 ring-1 ring-foreground/5 backdrop-blur-xl",
        full ? "text-center" : "mb-5 sm:mb-6"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          full && "flex-col text-balance"
        )}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)]/15 text-[var(--vivida-violet)]">
          <Sparkles className="size-5" />
        </span>
        <div className={cn("flex-1", full && "text-center")}>
          <h2 className="text-base font-semibold tracking-tight sm:text-lg">
            შენი ცის რუკა ჯერ არ არის
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            შეავსე დაბადების მონაცემები — გამოვთვლი თავსებადობას ყველა შენ
            მეგობართან.
          </p>
        </div>
        <Button asChild variant="mystic" className={cn(full && "mt-2")}>
          <Link href="/onboarding">შევსება</Link>
        </Button>
      </div>
    </div>
  );
}

function FriendRow({
  u,
  variant,
}: {
  u: FriendWithSynastry | FriendshipUser;
  variant: Tab;
}) {
  const displayName =
    u.displayName ?? u.name?.split(" ")[0] ?? u.username ?? "user";
  const profileHref = u.username ? `/u/${u.username}` : null;
  const synastry =
    variant === "friends" && "synastry" in u ? u.synastry : null;

  const avatar = u.image ? (
    <Image
      src={u.image}
      alt=""
      width={48}
      height={48}
      className="size-12 shrink-0 rounded-full border border-border/80 object-cover"
    />
  ) : (
    <div className="grid size-12 shrink-0 place-items-center rounded-full border border-border bg-card/60 text-base text-muted-foreground">
      {displayName[0]?.toUpperCase()}
    </div>
  );

  return (
    <li className="group flex items-center gap-4 rounded-2xl border border-border bg-card/65 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:bg-card/80 hover:ring-foreground/15">
      {profileHref ? (
        <Link
          href={profileHref}
          aria-label={`${displayName}-ის პროფილი`}
          className="shrink-0 rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {avatar}
        </Link>
      ) : (
        avatar
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          {profileHref ? (
            <Link
              href={profileHref}
              className="truncate text-base font-medium text-foreground transition-colors hover:text-[var(--vivida-violet)]"
            >
              {displayName}
            </Link>
          ) : (
            <span className="truncate text-base font-medium text-foreground">
              {displayName}
            </span>
          )}
          {u.username && (
            <Link
              href={`/u/${u.username}`}
              className="truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              @{u.username}
            </Link>
          )}
        </div>
        {u.bio && (
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {u.bio}
          </p>
        )}
      </div>
      {synastry && (
        <CompatibilityChip
          overall={synastry.overall}
          topCategory={synastry.topCategory}
        />
      )}
      {/* Message button for accepted friends only — same gate as the
          server action enforces. Renders before FriendActions so "remove"
          (the destructive action) sits last in tab order. */}
      {variant === "friends" && (
        <MessageButton partnerId={u.id} variant="icon" />
      )}
      <FriendActions
        variant={variant === "compatibility" ? "friends" : variant}
        otherUserId={u.id}
        otherUsername={u.username}
      />
      {u.username && (
        <Link
          href={`/u/${u.username}`}
          aria-label={`${displayName}-ის პროფილი`}
          className="hidden shrink-0 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
        >
          <ArrowRight className="size-4" />
        </Link>
      )}
    </li>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  const copy = {
    friends: {
      Icon: Users,
      title: "ჯერ არცერთი მეგობარი არ გყავს",
      body: "გაუგზავნე მეგობრობის თხოვნა მათ, ვისთანაც გინდა შენი თავსებადობის ნახვა.",
    },
    compatibility: {
      Icon: Sparkles,
      title: "თავსებადობა ჯერ ცარიელია",
      body: "დაუმეგობრდი ვინმეს — შემდეგ აქ ნახავ ცის რუკების ერთობლივ ქულას.",
    },
    incoming: {
      Icon: UserPlus,
      title: "შემოსული მოთხოვნები არ არის",
      body: "როცა ვინმე მოგწერს მეგობრობის თხოვნას, აქ გამოჩნდება.",
    },
    outgoing: {
      Icon: UserPlus,
      title: "გაგზავნილი მოთხოვნები არ არის",
      body: "გახსნა შენ მიერ გაგზავნილი თხოვნები ჩანს, სანამ მეორე მხარე უპასუხებდეს.",
    },
  }[tab];

  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 text-center">
      <copy.Icon className="mx-auto mb-3 size-8 text-muted-foreground" />
      <h2 className="text-lg font-semibold">{copy.title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {copy.body}
      </p>
    </div>
  );
}
