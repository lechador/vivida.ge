import {
  Brain,
  CalendarClock,
  Compass,
  Heart,
  MessageCircle,
  Orbit,
  Sparkles,
  Stars,
  Sun,
  Telescope,
  UserPlus,
  Users,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SOCIAL_FEATURES, type SocialFeature } from "@/lib/social-flags";
import type { PlanId } from "@/lib/pricing";

export type NavActiveKey =
  | "today"
  | "sky"
  | "report"
  | "ask"
  | "tarot"
  | "timing"
  | "feed"
  | "tests"
  | "discover"
  | "people"
  | "synastry"
  | "friends"
  | "messages"
  | "pro";

export type NavItem = {
  key: NavActiveKey;
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Hue used for the active glow + hover icon tint. Roughly the brand axis. */
  hue: string;
  /** Small pill next to the label ("ახალი") — drop it once the feature ages. */
  badgeKa?: string;
};

/**
 * Nav keys that are gated behind a social feature flag. A key absent from
 * this map is always visible. When the flag is off the entry is filtered
 * out of every rendered nav (desktop sidebar, mobile drawer, tab bar).
 */
const NAV_FEATURE_GATE: Partial<Record<NavActiveKey, SocialFeature>> = {
  discover: "swipeDeck",
  people: "peopleDirectory",
};

function navVisible(item: NavItem): boolean {
  const gate = NAV_FEATURE_GATE[item.key];
  return !gate || SOCIAL_FEATURES[gate];
}

/**
 * The former "pro" slot is now the credits hub — the label is the same for
 * everyone. (Kept as a function so per-plan labels stay easy to reintroduce.)
 */
export function navLabel(item: NavItem, _plan: PlanId): string {
  return item.label;
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    key: "today",
    href: "/dashboard",
    label: "დღეს",
    Icon: Sun,
    hue: "oklch(0.82 0.16 80)",
  },
  {
    key: "sky",
    href: "/sky",
    label: "ცა ახლა",
    Icon: Orbit,
    hue: "oklch(0.80 0.15 200)",
  },
  {
    key: "report",
    href: "/report",
    label: "ჩემი რუკა",
    Icon: Compass,
    hue: "oklch(0.78 0.18 305)",
  },
  {
    key: "ask",
    href: "/ask",
    label: "ჰკითხე",
    Icon: Stars,
    hue: "oklch(0.80 0.16 230)",
  },
  {
    key: "tarot",
    href: "/taro",
    label: "ტარო",
    Icon: Wand2,
    hue: "oklch(0.78 0.18 305)",
    badgeKa: "ახალი",
  },
  {
    key: "timing",
    href: "/timing",
    label: "როდის",
    Icon: CalendarClock,
    hue: "oklch(0.82 0.14 90)",
  },
  {
    key: "feed",
    href: "/feed",
    label: "ფიდი",
    Icon: Sparkles,
    hue: "oklch(0.78 0.18 320)",
  },
  {
    key: "tests",
    href: "/tests",
    label: "ტესტები",
    Icon: Brain,
    hue: "oklch(0.78 0.16 300)",
  },
  {
    key: "discover",
    href: "/discover",
    label: "აღმოაჩინე",
    Icon: Telescope,
    hue: "oklch(0.78 0.15 195)",
  },
  {
    key: "synastry",
    href: "/synastry",
    label: "თავსებადობა",
    Icon: Heart,
    hue: "oklch(0.72 0.22 350)",
  },
  {
    key: "people",
    href: "/people",
    label: "ხალხი",
    Icon: UserPlus,
    hue: "oklch(0.75 0.16 160)",
  },
  {
    key: "friends",
    href: "/friends",
    label: "მეგობრები",
    Icon: Users,
    hue: "oklch(0.72 0.22 0)",
  },
];

/**
 * The mobile bottom tab bar shows a curated 5-item subset of the nav.
 * Friends and feed don't make this list (they're still reachable from
 * the desktop nav and the mobile drawer); messages takes a slot so the
 * messenger is one tap away with a live unread badge.
 */
/** Visible desktop nav — gated entries (e.g. discover) filtered out when off. */
export const NAV_ITEMS: NavItem[] = ALL_NAV_ITEMS.filter(navVisible);

const ALL_MOBILE_TAB_ITEMS: NavItem[] = [
  {
    key: "today",
    href: "/dashboard",
    label: "დღეს",
    Icon: Sun,
    hue: "oklch(0.82 0.16 80)",
  },
  {
    key: "report",
    href: "/report",
    label: "ჩემი რუკა",
    Icon: Compass,
    hue: "oklch(0.78 0.18 305)",
  },
  {
    key: "feed",
    href: "/feed",
    label: "ფიდი",
    Icon: Sparkles,
    hue: "oklch(0.78 0.18 320)",
  },
  {
    key: "synastry",
    href: "/synastry",
    label: "თავსებადობა",
    Icon: Heart,
    hue: "oklch(0.72 0.22 350)",
  },
  {
    key: "messages",
    href: "/messages",
    label: "ჩატი",
    Icon: MessageCircle,
    hue: "oklch(0.78 0.18 200)",
  },
];

/** Visible mobile tab bar — same flag filtering as the desktop nav. */
export const MOBILE_TAB_ITEMS: NavItem[] =
  ALL_MOBILE_TAB_ITEMS.filter(navVisible);
