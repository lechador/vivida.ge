import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => createElement("a", { href, ...rest }, children),
}));

import {
  MOBILE_TAB_ITEMS,
  NAV_ITEMS,
  mobileTabLabel,
  navLabel,
  type NavItem,
} from "@/components/nav/nav-items";
import { MobileTabBar } from "@/components/nav/mobile-tab-bar";

function byKey(key: string): NavItem {
  const item = [...MOBILE_TAB_ITEMS, ...NAV_ITEMS].find((i) => i.key === key);
  if (!item) throw new Error(`missing nav item ${key}`);
  return item;
}

describe("mobile bottom navigation destinations", () => {
  it("is exactly Today / Tarot / Ask / My history, in order", () => {
    expect(MOBILE_TAB_ITEMS.map((i) => i.key)).toEqual([
      "today",
      "tarot",
      "ask",
      "library",
    ]);
    expect(MOBILE_TAB_ITEMS.map((i) => i.href)).toEqual([
      "/dashboard",
      "/taro",
      "/ask",
      "/library",
    ]);
  });

  it("labels every tab in both KA and EN, with history named as history", () => {
    const labels = (locale: "ka" | "en") =>
      MOBILE_TAB_ITEMS.map((i) => mobileTabLabel(i, locale));
    expect(labels("ka")).toEqual(["დღეს", "ტარო", "ჰკითხე", "ჩემი ისტორია"]);
    expect(labels("en")).toEqual(["Today", "Tarot", "Ask", "My history"]);
  });
});

describe("shared nav keeps every destination reachable", () => {
  it("orders desktop/drawer with Today, Tarot, Ask, History first", () => {
    const keys = NAV_ITEMS.map((i) => i.key);
    expect(keys.slice(0, 4)).toEqual(["today", "tarot", "ask", "library"]);
  });

  it("keeps My chart, tests, reports and interpersonal messages in the menu", () => {
    const keys = NAV_ITEMS.map((i) => i.key);
    for (const key of ["report", "tests", "reports", "messages"]) {
      expect(keys).toContain(key);
    }
  });

  it("names interpersonal messages distinctly from the AI ask entry", () => {
    const messages = byKey("messages");
    const ask = byKey("ask");
    expect(navLabel(messages, "ka")).toBe("წერილები");
    expect(navLabel(messages, "en")).toBe("Messages");
    expect(navLabel(messages, "ka")).not.toBe(navLabel(ask, "ka"));
    expect(navLabel(messages, "en")).not.toBe(navLabel(ask, "en"));
  });
});

describe("MobileTabBar runtime output", () => {
  it("links the four real destinations and opens the drawer from More (KA)", () => {
    const html = renderToStaticMarkup(
      createElement(MobileTabBar, {
        active: "today",
        unreadMessages: 0,
        pendingAskNudges: 0,
        locale: "ka",
      }),
    );
    for (const href of ["/dashboard", "/taro", "/ask", "/library"]) {
      expect(html).toContain(`href="${href}"`);
    }
    expect(html).not.toContain('href="#"');
    expect(html).not.toContain('href="/more"');
    expect(html).toContain("მეტი");
    expect(html).toContain("ჩემი ისტორია");
  });

  it("renders EN labels and the ask nudge badge on the real /ask tab", () => {
    const html = renderToStaticMarkup(
      createElement(MobileTabBar, {
        active: "ask",
        unreadMessages: 0,
        pendingAskNudges: 2,
        locale: "en",
      }),
    );
    expect(html).toContain("My history");
    expect(html).toContain("More");
    expect(html).toContain("New message from your astrologer");
  });
});
