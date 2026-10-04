import Link from "next/link";

import { auth } from "@/auth";
import { cn } from "@/lib/utils";
import { getHeaderData } from "@/lib/header-cache";
import { getBalance } from "@/lib/credits";
import { Button } from "@/components/ui/button";
import { VividaMark } from "@/components/brand/vivida-mark";
import { DesktopSidebar } from "./desktop-sidebar";
import { MobileNav } from "./mobile-nav";
import { MobileSearch } from "./mobile-search";
import { MobileTabBar } from "./mobile-tab-bar";
import { NavLinks } from "./nav-links";
import { type NavActiveKey } from "./nav-items";
import { NotificationsDropdown } from "./notifications-dropdown";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { CreditBalanceMenu } from "@/components/credits/credit-balance-menu";
import { getUserLocale, type UserLocale } from "@/lib/i18n/user-locale";

/**
 * App-wide top navigation. Server component that fetches its own session
 * and notification feed when the user is authed. Pages only pass auth state
 * and the active section.
 */
export async function AppHeader({
  authed,
  active,
}: {
  authed: boolean;
  active?:
    | "today"
    | "sky"
    | "report"
    | "reports"
    | "ask"
    | "library"
    | "tarot"
    | "timing"
    | "feed"
    | "tests"
    | "discover"
    | "people"
    | "synastry"
    | "friends"
    | "messages"
    | "account";
}) {
  let userInfo: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null = null;
  let notifications: Awaited<
    ReturnType<typeof getHeaderData>
  >["notifications"] = [];
  let unread = 0;
  let username: string | null = null;
  let unreadMessages = 0;
  let pendingAskNudges = 0;
  let balance = 0;
  let locale: UserLocale = "ka";
  let isPremium = false;
  let residenceCountryCode: string | null = null;

  if (authed) {
    const session = await auth();
    if (session?.user?.id) {
      // Balance fetched fresh (not via the 30s header cache) so a spend/earn
      // shows immediately in the navbar chip.
      const [data, bal, preferredLocale] = await Promise.all([
        getHeaderData(session.user.id),
        getBalance(session.user.id),
        getUserLocale(session.user.id),
      ]);
      userInfo = {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        // Prefer the user's chosen "main" profile photo over the OAuth
        // avatar baked into the JWT — falls back when they have none yet.
        image: data.avatarUrl ?? session.user.image ?? null,
      };
      notifications = data.notifications;
      unread = data.unread;
      username = data.username;
      unreadMessages = data.unreadMessages;
      pendingAskNudges = data.pendingAskNudges;
      balance = bal;
      locale = preferredLocale;
      isPremium = data.isPremium;
      residenceCountryCode = data.residenceCountryCode;
    }
  }

  return (
    <>
      <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5">
        {/* Mobile hamburger — authed users only (guests don't have nav). */}
        {userInfo && (
          <MobileNav
            active={active as NavActiveKey | undefined}
            locale={locale}
            unreadMessages={unreadMessages}
            pendingAskNudges={pendingAskNudges}
          />
        )}

        <Link
          href={userInfo ? "/dashboard" : "/"}
          className={cn(
            "flex shrink-0 items-center gap-2.5",
            // The desktop sidebar has its own logo block; hide the in-header
            // version on lg+ so the right cluster (search + bell + user)
            // gets the full breathing room.
            userInfo && "lg:hidden",
          )}
        >
          <VividaMark
            size={48}
            id="app-header"
            className="!size-10 sm:!size-12"
          />
          <span
            className="hidden bg-clip-text text-transparent text-2xl font-semibold tracking-tight sm:inline"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
            }}
          >
            vivida
          </span>
        </Link>

        {/* Authed nav — central pill links, hidden on mobile (drawer instead) */}
        {userInfo && <NavLinks active={active as NavActiveKey | undefined} />}

        {/* Search bar — desktop inline; mobile uses MobileSearch icon below. */}
        <div className="hidden flex-1 items-center justify-center md:flex">
          {userInfo && <SearchBar locale={locale} />}
        </div>
        {/* Pure spacer when inline search is hidden, so right cluster floats right */}
        <div className="flex-1 md:hidden" />

        {/* Right cluster */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {userInfo ? (
            <>
              <MobileSearch locale={locale} />
              <CreditBalanceMenu
                balance={balance}
                locale={locale}
                isPremium={isPremium}
                countryCode={residenceCountryCode}
              />
              <NotificationsDropdown
                initial={notifications}
                initialUnread={unread}
                locale={locale}
              />
              <UserMenu
                name={userInfo.name}
                email={userInfo.email}
                image={userInfo.image}
                username={username}
                balance={balance}
                isPremium={isPremium}
                countryCode={residenceCountryCode}
                locale={locale}
              />
            </>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/login">
                {locale !== "ka" ? "Sign in" : "შესვლა"}
              </Link>
            </Button>
          )}
        </div>
      </header>
      {userInfo && (
        <>
          <MobileTabBar
            active={active as NavActiveKey | undefined}
            unreadMessages={unreadMessages}
            pendingAskNudges={pendingAskNudges}
            locale={locale}
          />
          <DesktopSidebar
            active={active as NavActiveKey | undefined}
            unreadMessages={unreadMessages}
            pendingAskNudges={pendingAskNudges}
            locale={locale}
          />
        </>
      )}
    </>
  );
}
