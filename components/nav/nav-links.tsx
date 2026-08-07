"use client";

import type { NavActiveKey } from "./nav-items";

export type { NavActiveKey };

export function NavLinks({ active }: { active?: NavActiveKey }) {
  // Retired in favor of DesktopSidebar (left rail) on lg+ and
  // MobileTabBar at the bottom on mobile. Kept as a no-op so existing
  // AppHeader call sites continue to compile without per-page edits.
  void active;
  return null;
}
