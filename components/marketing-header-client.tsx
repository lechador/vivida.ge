"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { englishSiteHref, resolveEnglishPath } from "@/lib/seo/locales";

const NAV_LINKS = [
  { href: "/horoskopi", label: "ჰოროსკოპი" },
  { href: "/nataluri-ruka", label: "ნატალური რუკა" },
  { href: "/zodiac", label: "ზოდიაქო" },
  { href: "/taro", label: "ტარო" },
  { href: "/tests", label: "ტესტები" },
];

export function MarketingHeaderNav({ active }: { active?: string }) {
  const pathname = usePathname() || "/";

  return (
    <nav
      aria-label="მთავარი ნავიგაცია"
      className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex"
    >
      {NAV_LINKS.map((item) => {
        const isCurrent =
          active === item.href.slice(1) ||
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 whitespace-nowrap transition-colors duration-150 hover:text-foreground ${
              isCurrent
                ? "text-foreground underline decoration-primary decoration-1 underline-offset-8"
                : ""
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MarketingEnglishLink({
  englishPath,
}: {
  englishPath?: string;
}) {
  const pathname = usePathname() || "/";
  const enHref = englishSiteHref(
    englishPath ?? resolveEnglishPath(pathname),
    true,
  );

  return (
    <a
      href={enHref}
      hrefLang="en"
      className="whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
    >
      EN
    </a>
  );
}
