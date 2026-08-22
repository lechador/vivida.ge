"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { VividaMark } from "@/components/brand/vivida-mark";
import { MarketingCta } from "@/components/marketing-cta";
import { SiteSearch } from "@/components/search/site-search";
import { CORE_LANGUAGE_PAIRS, ENGLISH_SITE_URL } from "@/lib/seo/locales";

/** Only these few routes change slug across languages; every other public page
 * is published at the same path on the English domain (see englishSitemap()). */
const EN_PATH_BY_KA = new Map(
  CORE_LANGUAGE_PAIRS.map(({ ka, en }) => [ka, en as string]),
);

/**
 * English counterpart of the page currently being viewed. Absolute on purpose,
 * mirroring EnglishHeader's ქართული switch: the /en/* internal paths only
 * 301-redirect to this domain anyway.
 */
function englishHrefFor(pathname: string, override?: string): string {
  if (override) {
    return `${ENGLISH_SITE_URL}${override === "/" ? "" : override}`;
  }
  const kaPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const enPath = EN_PATH_BY_KA.get(kaPath) ?? kaPath;
  return `${ENGLISH_SITE_URL}${enPath === "/" ? "" : enPath}`;
}

/**
 * Lightweight header for public marketing pages (/how-it-works, /features,
 * /terms, /privacy). The authed AppHeader is over-featured for these — we
 * just need brand + a few nav links + a CTA.
 *
 * Client-side only because of usePathname: the EN switcher has to point at the
 * English version of the current page, and most call sites pass no `active`.
 */
export function MarketingHeader({
  active,
  englishPath,
}: {
  active?:
    | "features"
    | "how-it-works"
    | "nataluri-ruka"
    | "zodiac"
    | "horoskopi"
    | "taro"
    | "tests"
    | "articles";
  englishPath?: string;
}) {
  const englishHref = englishHrefFor(usePathname() || "/", englishPath);

  const link = (href: string, label: string, key: typeof active) => (
    <Link
      href={href}
      className={
        active === key
          ? "text-foreground transition-colors"
          : "text-muted-foreground transition-colors hover:text-foreground"
      }
    >
      {label}
    </Link>
  );

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <VividaMark size={40} id="marketing-header" />
          <span
            className="bg-clip-text text-transparent text-lg font-semibold tracking-tight sm:text-xl"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
            }}
          >
            vivida
          </span>
        </Link>

        <SiteSearch
          compact
          placeholder="ძებნა…"
          className="min-w-0 flex-1 sm:max-w-xs"
        />
      </div>

      <div className="flex shrink-0 items-center gap-6 sm:gap-7">
        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {link("/nataluri-ruka", "ნატალური რუკა", "nataluri-ruka")}
          {link("/horoskopi", "ჰოროსკოპი", "horoskopi")}
          {link("/taro", "ტარო", "taro")}
          {link("/tests", "ტესტები", "tests")}
          {link("/articles", "სტატიები", "articles")}
          {link("/zodiac", "ზოდიაქო", "zodiac")}
        </nav>

        <Link
          href={englishHref}
          hrefLang="en"
          className="rounded-full border border-border/70 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          aria-label="English version"
        >
          EN
        </Link>

        <MarketingCta />
      </div>
    </header>
  );
}
