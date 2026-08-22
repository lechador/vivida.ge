import Link from "next/link";

import {
  GEORGIAN_SITE_URL,
  ENGLISH_SITE_URL,
  armenianSiteHref,
  resolveEnglishPath,
} from "@/lib/seo/locales";
import { VividaMark } from "@/components/brand/vivida-mark";
import { requestIsEnglishHost } from "@/lib/i18n/request-locale";
import { LanguageSelector } from "@/components/i18n/language-selector";

const NAV = [
  { href: "/natal-chart", label: "Նատալ քարտեզ" },
  { href: "/horoscope", label: "Հորոսկոպ" },
  { href: "/zodiac", label: "Կենդանակերպ" },
  { href: "/compatibility", label: "Համատեղելիություն" },
  { href: "/tests", label: "Թեստեր" },
  { href: "/articles", label: "Հոդվածներ" },
];

export async function ArmenianHeader({
  georgianPath = "/",
  englishPath,
}: {
  georgianPath?: string;
  englishPath?: string;
}) {
  const onEnglishHost = await requestIsEnglishHost();
  const href = (path: string) => armenianSiteHref(path, onEnglishHost);
  // Every caller already threads the real Georgian slug of the current page
  // through for the KA switch below — the long tail shares that slug across
  // all three locales, so the same prop derives an equally page-accurate
  // English target via resolveEnglishPath's ~9-route pairing table.
  //
  // `englishPath` stays a real, optional override rather than being replaced
  // outright: ArmenianShell's core-route callers (app/am/{about,compatibility,
  // horoscope,privacy,terms}) already pass a correct explicit value, and one
  // of them is irregular in a way resolveEnglishPath can't reconstruct —
  // /am/horoscope's Georgian pairing is /horoskopi (the daily-horoscope hub,
  // paired for hreflang reasons — see CORE_LANGUAGE_PAIRS/ENGLISH_ONLY_ROUTES
  // in lib/seo/locales.ts), which would derive back to English /horoskopi, not
  // the /horoscope explainer /am/horoscope actually mirrors.
  //
  // Every long-tail SEO guide, though, reaches this header through
  // SmartHeader, whose props never included englishPath at all — so on
  // ~590 of the ~599 Armenian pages, "EN" silently landed on the homepage
  // no matter which article you clicked it from. The derived fallback below
  // fixes those; the explicit prop still wins where a caller supplies one.
  const resolvedEnglishPath = englishPath ?? resolveEnglishPath(georgianPath);
  const englishHref = `${ENGLISH_SITE_URL}${resolvedEnglishPath === "/" ? "" : resolvedEnglishPath}`;
  const georgianHref = `${GEORGIAN_SITE_URL}${georgianPath === "/" ? "" : georgianPath}`;

  return (
    <header className="relative z-20 border-b border-border/30 bg-background/45 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href={href("/")}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Vivida Armenian home"
        >
          <VividaMark size={38} id="armenian-header" />
          <span
            className="bg-clip-text text-lg font-semibold tracking-tight text-transparent sm:text-xl"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #a78bfa 0%, #f472b6 55%, #22d3ee 100%)",
            }}
          >
            vivida
          </span>
        </Link>

        <nav
          className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex"
          aria-label="Armenian navigation"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={href(item.href)}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector
            currentLocale="am"
            englishHref={englishHref}
            armenianHref={href(resolvedEnglishPath)}
            georgianHref={georgianHref}
          />
          <Link
            href="/login"
            className="rounded-full border border-[var(--vivida-cyan)]/45 bg-[var(--vivida-cyan)]/8 px-3.5 py-1.5 text-sm font-medium text-[var(--vivida-cyan)] transition-colors hover:bg-[var(--vivida-cyan)]/14 hover:text-foreground"
          >
            Մուտք
          </Link>
        </div>
      </div>

      <nav
        className="mx-auto flex w-full max-w-7xl gap-4 overflow-x-auto px-4 pb-3 text-xs text-muted-foreground lg:hidden"
        aria-label="Armenian mobile navigation"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={href(item.href)}
            className="shrink-0 hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
