import Link from "next/link";

import {
  GEORGIAN_SITE_URL,
  armenianSiteHref,
  englishSiteHref,
  resolveEnglishPath,
} from "@/lib/seo/locales";
import { VividaMark } from "@/components/brand/vivida-mark";
import { requestIsEnglishHost } from "@/lib/i18n/request-locale";
import { LanguageSelector } from "@/components/i18n/language-selector";

const NAV = [
  { href: "/natal-chart", label: "Natal chart" },
  { href: "/horoscope", label: "Horoscope" },
  { href: "/zodiac", label: "Zodiac" },
  { href: "/tests", label: "Tests" },
  { href: "/articles", label: "Articles" },
];

export async function EnglishHeader({
  georgianPath = "/",
  armenianPath,
}: {
  georgianPath?: string;
  armenianPath?: string;
}) {
  // Also rendered on the Georgian host (signed-in user reading English), where
  // /natal-chart, /horoscope and /compatibility are hard 404s. `/login` is
  // deliberately left relative — the session cookie is per-domain.
  const onEnglishHost = await requestIsEnglishHost();
  const href = (path: string) => englishSiteHref(path, onEnglishHost);
  // ArmenianHeader has always offered a way back to English and Georgian.
  // Nothing on the English chrome offered a way *to* Armenian — the only
  // routes in were a direct /am link, the once-per-browser geo redirect, or
  // already being signed in with the preference set.
  //
  // `armenianPath` is an optional override, same shape as ArmenianHeader's
  // `englishPath`: resolveEnglishPath(georgianPath) is the right derivation
  // for every regular page (the long tail shares its slug across all three
  // locales; the ~9 core routes have an explicit pairing table), but two
  // EnglishGuide pages are irregular and must override it explicitly —
  // /en/about has no Georgian page at all (georgianPath="/", which would
  // derive back to the homepage, not /about), and /en/horoscope's
  // georgianPath is "/horoskopi" (paired with the Georgian daily-horoscope
  // hub for hreflang reasons — see the comment on ENGLISH_ONLY_ROUTES in
  // lib/seo/locales.ts), which would derive to the Armenian daily hub
  // instead of the explainer /am/horoscope actually mirrors.
  const resolvedArmenianPath = armenianPath ?? resolveEnglishPath(georgianPath);
  const armenianHref = armenianSiteHref(resolvedArmenianPath, onEnglishHost);
  const georgianHref = `${GEORGIAN_SITE_URL}${georgianPath === "/" ? "" : georgianPath}`;
  return (
    <header className="relative z-20 border-b border-border/30 bg-background/45 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href={href("/")} className="flex shrink-0 items-center gap-2.5" aria-label="Vivida English home">
          <VividaMark size={38} id="english-header" />
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

        <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex" aria-label="English navigation">
          {NAV.map((item) => (
            <Link key={item.href} href={href(item.href)} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector
            currentLocale="en"
            englishHref={href(resolveEnglishPath(georgianPath))}
            armenianHref={armenianHref}
            georgianHref={georgianHref}
          />
          <Link
            href="/login"
            className="rounded-full border border-[var(--vivida-cyan)]/45 bg-[var(--vivida-cyan)]/8 px-3.5 py-1.5 text-sm font-medium text-[var(--vivida-cyan)] transition-colors hover:bg-[var(--vivida-cyan)]/14 hover:text-foreground"
          >
            Sign in
          </Link>
        </div>
      </div>

      <nav className="mx-auto flex w-full max-w-7xl gap-4 overflow-x-auto px-4 pb-3 text-xs text-muted-foreground lg:hidden" aria-label="English mobile navigation">
        {NAV.map((item) => (
          <Link key={item.href} href={href(item.href)} className="shrink-0 hover:text-foreground">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
