import Link from "next/link";

import { VividaMark } from "@/components/brand/vivida-mark";
import { GEORGIAN_SITE_URL, ENGLISH_SITE_URL, armenianSiteHref } from "@/lib/seo/locales";
import { requestIsEnglishHost } from "@/lib/i18n/request-locale";

const NAV = [
  { href: "/natal-chart", label: "Նատալ քարտեզ" },
  { href: "/horoscope", label: "Հորոսկոպ" },
  { href: "/zodiac", label: "Կենդանակերպ" },
  { href: "/compatibility", label: "Համատեղելիություն" },
  { href: "/tests", label: "Թեստեր" },
];

export async function ArmenianHeader({
  georgianPath = "/",
  englishPath = "/",
}: {
  georgianPath?: string;
  englishPath?: string;
}) {
  const onEnglishHost = await requestIsEnglishHost();
  const href = (path: string) => armenianSiteHref(path, onEnglishHost);

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
          <Link
            href={`${ENGLISH_SITE_URL}${englishPath === "/" ? "" : englishPath}`}
            hrefLang="en"
            className="rounded-full border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            aria-label="Switch to English"
          >
            EN
          </Link>
          <Link
            href={`${GEORGIAN_SITE_URL}${georgianPath === "/" ? "" : georgianPath}`}
            hrefLang="ka-GE"
            className="rounded-full border border-border/70 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            aria-label="Switch to Georgian"
          >
            ქარ
          </Link>
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
