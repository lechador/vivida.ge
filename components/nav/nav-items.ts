import {
  Brain,
  BookOpen,
  CalendarClock,
  Compass,
  Heart,
  MessageCircle,
  ScrollText,
  Orbit,
  Sparkles,
  Stars,
  Store,
  Sun,
  Telescope,
  UserPlus,
  Users,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { SOCIAL_FEATURES, type SocialFeature } from "@/lib/social-flags";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { REPORT_STORE_VISIBLE } from "@/lib/report-store-availability";

export type NavActiveKey =
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
  | "readings"
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
  /**
   * Optional bottom-tab-bar-only label override. The /library destination
   * reads as "My history" in the tab bar while drawer/sidebar keep the
   * canonical library name.
   */
  tabLabel?: string;
  tabLabelEn?: string;
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

/**
 * Locale allowlist per nav key. The Insight Bazaar ships English-only, so
 * its entry renders on the English host only — a Georgian-host link would
 * 404 (no /readings route exists there, rewrites are English-host-only).
 */
const NAV_LOCALE_GATE: Partial<Record<NavActiveKey, readonly UserLocale[]>> = {
  readings: ["en"],
};

function navVisible(item: NavItem): boolean {
  if (item.key === "reports" && !REPORT_STORE_VISIBLE) return false;
  const gate = NAV_FEATURE_GATE[item.key];
  return !gate || SOCIAL_FEATURES[gate];
}

/**
 * Resolve the visible label for the current interface language.
 */
export function navLabel(item: NavItem, locale: UserLocale = "ka"): string {
  if (locale === "en") return item.labelEn;
  return item.label;
}

/**
 * Bottom-tab-bar label: honors the per-item tab override (history naming
 * for /library) and falls back to the canonical label.
 */
export function mobileTabLabel(
  item: NavItem,
  locale: UserLocale = "ka",
): string {
  if (locale === "en") return item.tabLabelEn ?? item.labelEn;
  return item.tabLabel ?? item.label;
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
    key: "tarot",
    href: "/taro",
    label: "ტარო",
    labelEn: "Tarot",
    Icon: Wand2,
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
    key: "library",
    href: "/library",
    label: "ბიბლიოთეკა",
    labelEn: "Library",
    Icon: BookOpen,
    hue: "oklch(0.80 0.15 190)",
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
    key: "sky",
    href: "/sky",
    label: "ცა ახლა",
    labelEn: "Sky now",
    Icon: Orbit,
    hue: "oklch(0.80 0.15 200)",
  },
  {
    key: "reports",
    href: "/reports",
    label: "რეპორტები",
    labelEn: "Reports",
    Icon: ScrollText,
    hue: "oklch(0.80 0.16 55)",
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
    key: "readings",
    href: "/readings",
    label: "რიდინგები",
    labelEn: "Readings",
    Icon: Store,
    hue: "oklch(0.75 0.18 340)",
  },
  {
    key: "messages",
    href: "/messages",
    label: "წერილები",
    labelEn: "Messages",
    Icon: MessageCircle,
    hue: "oklch(0.78 0.18 200)",
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
 * The mobile bottom tab bar shows four link destinations —
 * Today / Tarot / Ask / My history — plus a More entry point that opens
 * the full nav drawer (rendered by MobileTabBar, not a link here).
 * Tab entries reuse the canonical item (href/icon/hue/labels) so the two
 * surfaces cannot drift; /library carries its tab-only history naming.
 */
export const NAV_ITEMS: NavItem[] = ALL_NAV_ITEMS.filter(navVisible);

/**
 * Sidebar/drawer items for an interface language — feature flags plus the
 * locale gates (English-only destinations never render dead links).
 */
export function navItems(locale: UserLocale = "ka"): NavItem[] {
  return NAV_ITEMS.filter((item) => {
    const gate = NAV_LOCALE_GATE[item.key];
    return !gate || gate.includes(locale);
  });
}

function mobileTab(key: NavActiveKey): NavItem {
  const item = ALL_NAV_ITEMS.find((entry) => entry.key === key);
  if (!item) throw new Error(`unknown mobile tab ${key}`);
  if (key === "library") {
    return { ...item, tabLabel: "ჩემი ისტორია", tabLabelEn: "My history" };
  }
  return { ...item };
}

const ALL_MOBILE_TAB_ITEMS: NavItem[] = [
  mobileTab("today"),
  mobileTab("tarot"),
  mobileTab("ask"),
  mobileTab("library"),
];

/** Visible mobile tab bar — same flag filtering as the desktop nav. */
export const MOBILE_TAB_ITEMS: NavItem[] =
  ALL_MOBILE_TAB_ITEMS.filter(navVisible);
