import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { VividaMark } from "@/components/brand/vivida-mark";
import { cn } from "@/lib/utils";
import { MessagesTabBadge } from "./messages-tab-badge";
import { NAV_ITEMS, type NavActiveKey, type NavItem } from "./nav-items";

/**
 * Desktop-only left sidebar. Shows on lg+ as a sticky vertical nav, with
 * the same destinations as the mobile bottom tab bar plus "მეგობრები"
 * (which the mobile bar sheds in favor of "ჩატი"). Content gets pushed
 * right via a body padding rule in globals.css that keys off the
 * `[data-desktop-sidebar]` attribute, so individual pages don't need
 * surgical edits — they just gain the extra horizontal space.
 *
 * The legacy AppHeader pill nav becomes redundant on lg, so it's
 * hidden there.
 */
export function DesktopSidebar({
  active,
  unreadMessages = 0,
}: {
  active?: NavActiveKey;
  unreadMessages?: number;
}) {
  // Sidebar shows the full primary nav. Messages goes alongside friends —
  // we have the vertical room, no reason to drop one for the other here.
  const items: NavItem[] = [
    ...NAV_ITEMS,
    {
      key: "messages",
      href: "/messages",
      label: "ჩატი",
      Icon: MessageCircle,
      hue: "oklch(0.78 0.18 200)",
    },
  ];

  return (
    <aside
      data-desktop-sidebar
      aria-label="ძირითადი ნავიგაცია"
      className={cn(
        "hidden lg:flex",
        "fixed left-0 top-0 z-30 h-[100dvh] w-56",
        // Layered surface: deep violet base + a thin gradient line on the
        // right edge so it reads as its own column, not just a darker
        // strip of page background.
        "flex-col border-r border-[var(--vivida-violet)]/30 bg-[oklch(0.15_0.05_290/0.95)] backdrop-blur-2xl",
        "shadow-[8px_0_32px_-12px_oklch(0.65_0.24_305/0.18)]",
        "after:pointer-events-none after:absolute after:inset-y-8 after:right-0 after:w-px after:bg-[linear-gradient(180deg,transparent,oklch(0.78_0.18_305/0.45),transparent)]"
      )}
    >
      <Link
        href="/feed"
        className="flex items-center gap-2.5 px-5 pb-5 pt-6"
      >
        <VividaMark size={36} id="sidebar-mark" className="!size-9" />
        <span
          className="bg-clip-text text-transparent text-xl font-semibold tracking-tight"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--vivida-violet) 0%, var(--vivida-pink) 55%, var(--vivida-cyan) 100%)",
          }}
        >
          vivida
        </span>
      </Link>

      <div
        aria-hidden
        className="mx-5 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <ul className="mt-3 flex flex-col gap-0.5 px-3">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--vivida-violet)]/15 text-foreground"
                    : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "relative grid size-8 place-items-center rounded-lg transition-all",
                    isActive
                      ? "bg-[var(--vivida-violet)]/30 ring-1 ring-[var(--vivida-violet)]/55 shadow-[0_0_18px_-4px_oklch(0.65_0.24_305/0.55)]"
                      : "bg-card/40 ring-1 ring-border/40 group-hover:ring-border"
                  )}
                  style={isActive ? { color: item.hue } : undefined}
                >
                  <item.Icon className="size-4" />
                  {item.key === "messages" && (
                    <MessagesTabBadge initial={unreadMessages} />
                  )}
                </span>
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-[var(--vivida-violet)] shadow-[0_0_8px_oklch(0.65_0.24_305/0.85)]"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto px-5 pb-6 pt-4">
        <div
          aria-hidden
          className="mb-4 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />
        <Link
          href="/account"
          className="block text-xs text-muted-foreground hover:text-foreground"
        >
          ანგარიში & პარამეტრები →
        </Link>
      </div>
    </aside>
  );
}
