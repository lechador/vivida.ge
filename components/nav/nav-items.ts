import { Compass, Heart, Sun, Telescope, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavActiveKey =
  | "today"
  | "report"
  | "discover"
  | "synastry"
  | "friends";

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
