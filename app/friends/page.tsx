import Image from "next/image";
import Link from "next/link";
import { ArrowRight, UserPlus, Users } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { getCurrentPlan } from "@/lib/plan";
import {
  listFriends,
  listIncomingRequests,
  listOutgoingRequests,
  type FriendshipUser,
} from "@/lib/friendship";
import { Starfield } from "@/components/landing/starfield";
import { AppHeader } from "@/components/nav/app-header";
import { FriendActions } from "@/components/friends/friend-actions";
import { MessageButton } from "@/components/chat/message-button";
import { cn } from "@/lib/utils";

export const metadata = { title: "მეგობრები · Vivida" };

type Tab = "friends" | "incoming" | "outgoing";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "friends", label: "მეგობრები" },
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
    params.tab === "incoming" || params.tab === "outgoing"
      ? params.tab
      : "friends";

  const [plan, friends, incoming, outgoing] = await Promise.all([
    getCurrentPlan(user.id),
    listFriends(user.id),
    listIncomingRequests(user.id),
    listOutgoingRequests(user.id),
  ]);

  const counts: Record<Tab, number> = {
    friends: friends.length,
    incoming: incoming.length,
    outgoing: outgoing.length,
  };
  const list =
    tab === "friends" ? friends : tab === "incoming" ? incoming : outgoing;

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

        {list.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <ul className="grid gap-3">
            {list.map((u) => (
              <FriendRow key={u.id} u={u} variant={tab} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function FriendRow({
  u,
  variant,
}: {
  u: FriendshipUser;
  variant: Tab;
}) {
  const displayName =
    u.displayName ?? u.name?.split(" ")[0] ?? u.username ?? "user";
  const profileHref = u.username ? `/u/${u.username}` : null;

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
      {/* Message button for accepted friends only — same gate as the
          server action enforces. Renders before FriendActions so "remove"
          (the destructive action) sits last in tab order. */}
      {variant === "friends" && (
        <MessageButton partnerId={u.id} variant="icon" />
      )}
      <FriendActions
        variant={variant}
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
