"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavActiveKey, type NavItem } from "./nav-items";

export type { NavActiveKey };

export function NavLinks({ active }: { active?: NavActiveKey }) {
  // Retired in favor of DesktopSidebar (left rail) on lg+ and
  // MobileTabBar at the bottom on mobile. Kept as a no-op so existing
  // AppHeader call sites continue to compile without per-page edits.
  void active;
  return null;
}

function NavLinkItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const { Icon } = item;
  return (
    <motion.div
      initial={false}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 500, damping: 28 }}
      className="relative"
    >
      <Link
        href={item.href}
        className={cn(
          "group relative inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-base font-medium transition-colors duration-200",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
        style={
          {
            // Custom property used by gradients/glows below; per-item hue
            // gives each tab its own personality without four CSS classes.
            "--nav-hue": item.hue,
          } as React.CSSProperties
        }
      >
        {/* Active background — gradient pill + glow + faint ring */}
        {isActive && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklch, var(--nav-hue) 26%, transparent) 0%, color-mix(in oklch, var(--nav-hue) 14%, transparent) 100%)",
              boxShadow:
                "0 6px 24px -8px color-mix(in oklch, var(--nav-hue) 60%, transparent), inset 0 0 0 1px color-mix(in oklch, var(--nav-hue) 30%, transparent)",
            }}
          />
        )}

        {/* Hover background — fades in on non-active items */}
        {!isActive && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-card/40 opacity-0 ring-1 ring-foreground/5 transition-opacity duration-200 group-hover:opacity-100"
          />
        )}

        {/* Icon — tilts on hover, gently rotates while active */}
        <motion.span
          aria-hidden
          animate={
            isActive
              ? { rotate: [0, -6, 6, 0] }
              : { rotate: 0 }
          }
          transition={
            isActive
              ? {
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { type: "spring", stiffness: 400, damping: 14 }
          }
          className={cn(
            "relative z-10 transition-transform duration-300",
            !isActive && "group-hover:-translate-y-0.5 group-hover:rotate-[14deg]"
          )}
        >
          <Icon
            className="size-[18px]"
            style={
              isActive
                ? { color: item.hue, filter: `drop-shadow(0 0 6px ${item.hue})` }
                : undefined
            }
          />
        </motion.span>

        <span
          className={cn(
            "relative z-10 transition-transform duration-200",
            !isActive && "group-hover:-translate-y-0.5"
          )}
        >
          {item.label}
        </span>

        {/* Tiny pulsing dot beside the label on the active tab — adds a
            living, "you are here" pulse to the otherwise static pill. */}
        {isActive && (
          <motion.span
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 size-1.5 rounded-full"
            style={{
              backgroundColor: item.hue,
              boxShadow: `0 0 10px ${item.hue}`,
            }}
          />
        )}
      </Link>
    </motion.div>
  );
}
