import Link from "next/link";

import { cn } from "@/lib/utils";
import { MessagesTabBadge } from "./messages-tab-badge";
import { MOBILE_TAB_ITEMS, type NavActiveKey } from "./nav-items";

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
}: {
  active?: NavActiveKey;
  unreadMessages?: number;
}) {
  return (
    <nav
      data-mobile-tab-bar
      aria-label="ძირითადი ნავიგაცია"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 lg:hidden",
        "border-t border-border/60 bg-background/85 backdrop-blur-2xl",
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
                      ? "bg-[var(--vivida-violet)]/20 ring-1 ring-[var(--vivida-violet)]/40"
                      : "group-active:scale-95"
                  )}
                  style={isActive ? { color: item.hue } : undefined}
                >
                  <item.Icon className="size-5" />
                  {item.key === "messages" && (
                    <MessagesTabBadge initial={unreadMessages} />
                  )}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
