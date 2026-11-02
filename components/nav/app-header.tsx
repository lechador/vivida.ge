import Link from "next/link";

import { auth } from "@/auth";
import { getHeaderData } from "@/lib/header-cache";
import { getBalance } from "@/lib/credits";
import { Button } from "@/components/ui/button";
import { VividaMark } from "@/components/brand/vivida-mark";
import { LunarPhaseDisc } from "@/components/brand/celestial-icons";
import { computeMoonPhase, PHASE_LABEL_EN } from "@/lib/moon-phase";
import { MobileNav } from "./mobile-nav";
import { MobileSearch } from "./mobile-search";
import { MobileTabBar } from "./mobile-tab-bar";
import { navItems, navLabel, type NavActiveKey } from "./nav-items";
import { NotificationsDropdown } from "./notifications-dropdown";
import { ObservatoryDrawer } from "./observatory-drawer";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { CreditBalanceMenu } from "@/components/credits/credit-balance-menu";
import { AppLanguageSwitcher } from "@/components/i18n/international-language-switcher";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getUserLocale, type UserLocale } from "@/lib/i18n/user-locale";
import { localizedHref } from "@/lib/seo/public-paths";
import { signByIndex } from "@/lib/zodiac";

const PHASE_LABEL_PL: Record<string, string> = {
  new_moon: "Nów",
  waxing_crescent: "Przybywający sierp",
  first_quarter: "Pierwsza kwadra",
  waxing_gibbous: "Przybywający garb",
  full_moon: "Pełnia",
  waning_gibbous: "Ubywający garb",
  last_quarter: "Trzecia kwadra",
  waning_crescent: "Ubywający sierp",
};

const PRIMARY_WORKSPACE_KEYS: NavActiveKey[] = [
  "today",
  "report",
  "synastry",
  "tarot",
  "ask",
];

/**
 * Unified Editorial Celestial Top Bar + Persistent Celestial Context Strip.
 *
 * Row 1 (Top Bar Contract):
 *   Zone 1 (Left): Single-line Brand Wordmark
 *   Zone 2 (Center): 5 concise single-line navigation links
 *   Zone 3 (Right): Utility / Account action
 *
 * Row 2 (Persistent Celestial Context Strip):
 *   Displays active section breadcrumb, live lunar phase SVG & zodiac telemetry,
 *   inline profile search (for authenticated users), and the Slide-Over Observatory Drawer.
 */
export async function AppHeader({
  authed,
  active,
}: {
  authed: boolean;
  active?: NavActiveKey | "account";
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
      const [data, bal, preferredLocale] = await Promise.all([
        getHeaderData(session.user.id),
        getBalance(session.user.id),
        getUserLocale(session.user.id),
      ]);
      userInfo = {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
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
  if (!userInfo) {
    locale = await getRequestLocale();
  }

  const pl = locale === "pl";
  const en = locale !== "ka";

  const allItems = navItems(locale);
  const primaryLinks = PRIMARY_WORKSPACE_KEYS.map((key) =>
    allItems.find((item) => item.key === key),
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));

  const activeNavItem = active
    ? allItems.find((item) => item.key === active)
    : undefined;
  const activeSectionLabel =
    active === "account"
      ? pl
        ? "Konto i ustawienia"
        : en
          ? "Account & Settings"
          : "ანგარიში და პარამეტრები"
      : activeNavItem
        ? navLabel(activeNavItem, locale)
        : pl
          ? "Obserwatorium"
          : en
            ? "Observatory"
            : "ობსერვატორია";

  const moonSnapshot = computeMoonPhase(new Date());
  const moonSign = moonSnapshot ? signByIndex(moonSnapshot.signIndex) : null;
  const illumPct = moonSnapshot
    ? Math.round(moonSnapshot.illumination * 100)
    : 50;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        {/* Row 1: Strict 3-Zone Top Bar Contract */}
        <div className="mx-auto flex h-15 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:gap-8 sm:px-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <div className="flex shrink-0 items-center gap-2.5">
            {userInfo && (
              <MobileNav
                active={active as NavActiveKey | undefined}
                locale={locale}
                unreadMessages={unreadMessages}
                pendingAskNudges={pendingAskNudges}
              />
            )}
            <Link
              href={userInfo ? "/dashboard" : pl ? "/pl" : "/"}
              className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap"
            >
              <VividaMark size={28} id="app-header" className="shrink-0" />
              <span className="hidden font-display text-2xl font-medium tracking-tight text-foreground min-[380px]:inline">
                Vivida
              </span>
            </Link>
          </div>

          {/* Zone 2: 5 Concise Single-Line Workspace / Public Links */}
          <nav
            aria-label={
              pl
                ? "Główna nawigacja"
                : en
                  ? "Primary navigation"
                  : "მთავარი ნავიგაცია"
            }
            className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex"
          >
            {userInfo ? (
              primaryLinks.map((item) => {
                const isActive = active === item.key;
                return (
                  <Link
                    key={item.key}
                    href={localizedHref(item.href, locale)}
                    className={`shrink-0 whitespace-nowrap transition-colors duration-150 hover:text-foreground ${
                      isActive
                        ? "text-foreground underline decoration-primary decoration-1 underline-offset-8"
                        : ""
                    }`}
                  >
                    {navLabel(item, locale)}
                  </Link>
                );
              })
            ) : (
              <>
                <Link
                  href={localizedHref("/horoskopi", locale)}
                  className="shrink-0 whitespace-nowrap transition-colors hover:text-foreground"
                >
                  {pl ? "Horoskop" : en ? "Horoscope" : "ჰოროსკოპი"}
                </Link>
                <Link
                  href={localizedHref("/nataluri-ruka", locale)}
                  className="shrink-0 whitespace-nowrap transition-colors hover:text-foreground"
                >
                  {pl
                    ? "Horoskop urodzeniowy"
                    : en
                      ? "Birth Chart"
                      : "ნატალური რუკა"}
                </Link>
                <Link
                  href={localizedHref("/zodiac/tavsebadoba", locale)}
                  className="shrink-0 whitespace-nowrap transition-colors hover:text-foreground"
                >
                  {pl ? "Zgodność" : en ? "Compatibility" : "თავსებადობა"}
                </Link>
                <Link
                  href={localizedHref("/taro", locale)}
                  className="shrink-0 whitespace-nowrap transition-colors hover:text-foreground"
                >
                  {en ? "Tarot" : "ტარო"}
                </Link>
                <Link
                  href={localizedHref("/tests", locale)}
                  className="shrink-0 whitespace-nowrap transition-colors hover:text-foreground"
                >
                  {pl ? "Testy" : en ? "Tests" : "ტესტები"}
                </Link>
              </>
            )}
          </nav>

          {/* Zone 3: Account Controls or Primary Sign-in Action */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <AppLanguageSwitcher locale={locale} authed={Boolean(userInfo)} />
            {userInfo ? (
              <>
                <MobileSearch locale={locale} />
                <span className="hidden min-[430px]:block">
                  <CreditBalanceMenu
                    balance={balance}
                    locale={locale}
                    isPremium={isPremium}
                    countryCode={residenceCountryCode}
                  />
                </span>
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
              <Button
                asChild
                variant="outline"
                size="sm"
                className="shrink-0 whitespace-nowrap"
              >
                <Link href="/login">
                  {pl ? "Zaloguj się" : en ? "Sign in" : "შესვლა"}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Persistent Celestial Context Strip & Slide-Over Drawer Trigger */}
        <div className="border-t border-border bg-[oklch(0.15_0.038_280)]">
          <div className="mx-auto flex h-9 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            {/* Left: Active Breadcrumb + Live Lunar Telemetry */}
            <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                  {pl ? "Obserwatorium" : en ? "Observatory" : "ობსერვატორია"}
                </span>
                <span aria-hidden>/</span>
                <span className="truncate font-medium text-foreground">
                  {activeSectionLabel}
                </span>
              </div>

              {moonSnapshot && (
                <Link
                  href={localizedHref("/mtvaris-kalendari", locale)}
                  className="hidden items-center gap-2 border-l border-border pl-3 font-mono text-[11px] tabular-nums text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
                >
                  <LunarPhaseDisc
                    phaseAngle={moonSnapshot.phaseAngle}
                    size={16}
                  />
                  <span>
                    {pl
                      ? (PHASE_LABEL_PL[moonSnapshot.phaseKey] ??
                        PHASE_LABEL_EN[moonSnapshot.phaseKey])
                      : en
                        ? PHASE_LABEL_EN[moonSnapshot.phaseKey]
                        : moonSnapshot.phaseLabelKa}
                  </span>
                  <span aria-hidden>·</span>
                  <span className="text-[var(--vivida-gold)]">
                    {moonSnapshot.signSymbol}{" "}
                    {pl
                      ? (moonSign?.labelPl ?? moonSnapshot.signEn)
                      : en
                        ? moonSnapshot.signEn
                        : moonSnapshot.signKa}
                  </span>
                  <span aria-hidden>·</span>
                  <span>{illumPct}%</span>
                </Link>
              )}
            </div>

            {/* Right: Inline Search (Desktop Authed) + Slide-Over Observatory Drawer */}
            <div className="flex shrink-0 items-center gap-3">
              {userInfo && (
                <div className="hidden lg:block">
                  <SearchBar locale={locale} />
                </div>
              )}
              <ObservatoryDrawer
                authed={Boolean(userInfo)}
                active={active}
                locale={locale}
                unreadMessages={unreadMessages}
                pendingAskNudges={pendingAskNudges}
              />
            </div>
          </div>
        </div>
      </header>

      {userInfo && (
        <MobileTabBar
          active={active as NavActiveKey | undefined}
          unreadMessages={unreadMessages}
          pendingAskNudges={pendingAskNudges}
          locale={locale}
        />
      )}
    </>
  );
}
