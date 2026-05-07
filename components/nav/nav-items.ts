import {
  Compass,
  Heart,
  MessageCircle,
  Sun,
  Telescope,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavActiveKey =
  | "today"
  | "report"
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
 * Friends doesn't make this list (it's still reachable from the desktop
 * nav and from each user's profile); messages takes its slot so the
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
    key: "messages",
    href: "/messages",
    label: "ჩატი",
    Icon: MessageCircle,
    hue: "oklch(0.78 0.18 200)",
  },
];
