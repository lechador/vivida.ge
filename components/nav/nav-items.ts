import {
  Compass,
  Heart,
  MessageCircle,
  Sparkles,
  Sun,
  Telescope,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavActiveKey =
  | "today"
  | "report"
  | "feed"
  | "discover"
  | "synastry"
  | "friends"
  | "messages";

export type NavItem = {
  key: NavActiveKey;
  href: string;
  label: string;
  Icon: LucideIcon;
  /** Hue used for the active glow + hover icon tint. Roughly the brand axis. */
  hue: string;
};

export const NAV_ITEMS: NavItem[] = [
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
export const MOBILE_TAB_ITEMS: NavItem[] = [
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
