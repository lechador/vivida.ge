import Link from "next/link";

import {
  GEORGIAN_SITE_URL,
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
}: {
  georgianPath?: string;
}) {
  // Also rendered on the Georgian host (signed-in user reading English), where
  // /natal-chart, /horoscope and /compatibility are hard 404s. `/login` is
  // deliberately left relative — the session cookie is per-domain.
  const onEnglishHost = await requestIsEnglishHost();
  const href = (path: string) => englishSiteHref(path, onEnglishHost);
  const georgianHref = `${GEORGIAN_SITE_URL}${georgianPath === "/" ? "" : georgianPath}`;
  return (
    <header className="relative z-20 border-b border-border/30 bg-background/45 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href={href("/")}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Vivida English home"
        >
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

        <nav
          className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex"
          aria-label="English navigation"
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
            currentLocale="en"
            englishHref={href(resolveEnglishPath(georgianPath))}
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

      <nav
        className="mx-auto flex w-full max-w-7xl gap-4 overflow-x-auto px-4 pb-3 text-xs text-muted-foreground lg:hidden"
        aria-label="English mobile navigation"
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
