import Link from "next/link";

import { cn } from "@/lib/utils";
import { MessagesTabBadge } from "./messages-tab-badge";
import { MOBILE_TAB_ITEMS, type NavActiveKey } from "./nav-items";
import { navLabel } from "./nav-items";
import type { UserLocale } from "@/lib/i18n/user-locale";

/**
 * iOS/Android-style fixed bottom tab bar. Mirrors the desktop NavLinks
 * destinations so authed users on phones get one-tap access to every
 * primary destination without opening the hamburger drawer. Hidden on
 * lg+ where the inline header nav already covers it.
 *
 * Respects safe-area insets so it sits above the iOS home indicator
 * instead of being clipped under it.
 */
export function MobileTabBar({
  active,
  unreadMessages = 0,
  locale = "ka",
}: {
  active?: NavActiveKey;
  unreadMessages?: number;
  locale?: UserLocale;
}) {
  return (
    <nav
      data-mobile-tab-bar
      aria-label={locale === "en" ? "Main navigation" : "ძირითადი ნავიგაცია"}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 lg:hidden",
        // Lifted card surface that reads as its own UI layer instead of
        // bleeding into the page. Dark, opaque, with a violet-tinted top
        // edge + a soft cosmic glow above it.
        "border-t border-[var(--vivida-violet)]/35 bg-[oklch(0.18_0.06_290/0.92)] backdrop-blur-2xl",
        "shadow-[0_-12px_32px_-8px_oklch(0.65_0.24_305/0.18)]",
        "before:pointer-events-none before:absolute before:inset-x-6 before:-top-px before:h-px before:bg-[linear-gradient(90deg,transparent,oklch(0.78_0.18_305/0.65),transparent)]",
        "pb-[max(env(safe-area-inset-bottom),0.25rem)]"
      )}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 pt-1.5">
        {MOBILE_TAB_ITEMS.map((item) => {
          const isActive = active === item.key;
          return (
            <li key={item.key} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "relative grid size-9 place-items-center rounded-xl transition-all",
                    isActive
                      ? "bg-[var(--vivida-violet)]/25 ring-1 ring-[var(--vivida-violet)]/60 shadow-[0_0_18px_-4px_oklch(0.65_0.24_305/0.6)]"
                      : "group-active:scale-95"
                  )}
                  style={isActive ? { color: item.hue } : undefined}
                >
                  <item.Icon className="size-5" />
                  {item.key === "messages" && (
                    <MessagesTabBadge
                      initial={unreadMessages}
                      locale={locale}
                    />
                  )}
                </span>
                <span className="truncate">{navLabel(item, locale)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
