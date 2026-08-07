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
import type { UserLocale } from "@/lib/i18n/user-locale";

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
  | "messages";

export type NavItem = {
  key: NavActiveKey;
  href: string;
  label: string;
  labelEn: string;
  Icon: LucideIcon;
  /** Hue used for the active glow + hover icon tint. Roughly the brand axis. */
  hue: string;
  /** Small pill next to the label ("ახალი") — drop it once the feature ages. */
  badgeKa?: string;
  badgeEn?: string;
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
 * Resolve the visible label for the current interface language.
 */
export function navLabel(item: NavItem, locale: UserLocale = "ka"): string {
  return locale === "en" ? item.labelEn : item.label;
}

const ALL_NAV_ITEMS: NavItem[] = [
  {
    key: "today",
    href: "/dashboard",
    label: "დღეს",
    labelEn: "Today",
    Icon: Sun,
    hue: "oklch(0.82 0.16 80)",
  },
  {
    key: "sky",
    href: "/sky",
    label: "ცა ახლა",
    labelEn: "Sky now",
    Icon: Orbit,
    hue: "oklch(0.80 0.15 200)",
  },
  {
    key: "report",
    href: "/report",
    label: "ჩემი რუკა",
    labelEn: "My chart",
    Icon: Compass,
    hue: "oklch(0.78 0.18 305)",
  },
  {
    key: "ask",
    href: "/ask",
    label: "ჰკითხე",
    labelEn: "Ask",
    Icon: Stars,
    hue: "oklch(0.80 0.16 230)",
  },
  {
    key: "tarot",
    href: "/taro",
    label: "ტარო",
    labelEn: "Tarot",
    Icon: Wand2,
    hue: "oklch(0.78 0.18 305)",
    badgeKa: "ახალი",
    badgeEn: "New",
  },
  {
    key: "timing",
    href: "/timing",
    label: "როდის",
    labelEn: "Timing",
    Icon: CalendarClock,
    hue: "oklch(0.82 0.14 90)",
  },
  {
    key: "feed",
    href: "/feed",
    label: "ფიდი",
    labelEn: "Feed",
    Icon: Sparkles,
    hue: "oklch(0.78 0.18 320)",
  },
  {
    key: "tests",
    href: "/tests",
    label: "ტესტები",
    labelEn: "Tests",
    Icon: Brain,
    hue: "oklch(0.78 0.16 300)",
  },
  {
    key: "discover",
    href: "/discover",
    label: "აღმოაჩინე",
    labelEn: "Discover",
    Icon: Telescope,
    hue: "oklch(0.78 0.15 195)",
  },
  {
    key: "synastry",
    href: "/synastry",
    label: "თავსებადობა",
    labelEn: "Compatibility",
    Icon: Heart,
    hue: "oklch(0.72 0.22 350)",
  },
  {
    key: "people",
    href: "/people",
    label: "ხალხი",
    labelEn: "People",
    Icon: UserPlus,
    hue: "oklch(0.75 0.16 160)",
  },
  {
    key: "friends",
    href: "/friends",
    label: "მეგობრები",
    labelEn: "Friends",
    Icon: Users,
    hue: "oklch(0.72 0.22 0)",
  },
];

/**
 * The mobile bottom tab bar shows a curated 5-item subset of the nav:
 * today / chart / tarot / tests / chat. The content funnels (tarot, tests)
 * that the data shows drive consumption get a slot; the near-dead social
 * feed and synastry drop to the mobile drawer (still reachable). Messages
 * keeps a slot — it's the messenger's only mobile entry point, with a live
 * unread badge.
 */
/** Visible desktop nav — gated entries (e.g. discover) filtered out when off. */
export const NAV_ITEMS: NavItem[] = ALL_NAV_ITEMS.filter(navVisible);

const ALL_MOBILE_TAB_ITEMS: NavItem[] = [
  {
    key: "today",
    href: "/dashboard",
    label: "დღეს",
    labelEn: "Today",
    Icon: Sun,
    hue: "oklch(0.82 0.16 80)",
  },
  {
    key: "report",
    href: "/report",
    label: "ჩემი რუკა",
    labelEn: "My chart",
    Icon: Compass,
    hue: "oklch(0.78 0.18 305)",
  },
  {
    key: "tarot",
    href: "/taro",
    label: "ტარო",
    labelEn: "Tarot",
    Icon: Wand2,
    hue: "oklch(0.78 0.18 305)",
  },
  {
    key: "tests",
    href: "/tests",
    label: "ტესტები",
    labelEn: "Tests",
    Icon: Brain,
    hue: "oklch(0.78 0.16 300)",
  },
  {
    key: "messages",
    href: "/messages",
    label: "ჩატი",
    labelEn: "Chat",
    Icon: MessageCircle,
    hue: "oklch(0.78 0.18 200)",
  },
];

/** Visible mobile tab bar — same flag filtering as the desktop nav. */
export const MOBILE_TAB_ITEMS: NavItem[] =
  ALL_MOBILE_TAB_ITEMS.filter(navVisible);
