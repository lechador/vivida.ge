import Link from "next/link";

import { VividaMark } from "@/components/brand/vivida-mark";
import { GEORGIAN_SITE_URL } from "@/lib/seo/locales";

const EXPLORE = [
  { href: "/natal-chart", label: "Natal chart" },
  { href: "/horoscope", label: "Daily horoscope" },
  { href: "/zodiac", label: "Zodiac signs" },
  { href: "/compatibility", label: "Compatibility" },
  { href: "/tests", label: "Tests" },
];

export function EnglishFooter() {
  return (
    <footer className="relative z-10 border-t border-border/40 bg-background/65 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-md">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <VividaMark size={36} id="english-footer" />
            <span className="text-xl font-semibold">vivida</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Personal astrology, natal charts and self-discovery tools. Core guidance is available in English; detailed personalized interpretations currently remain in Georgian.
          </p>
          <a href="mailto:hello@vivida.ge" className="mt-3 inline-block text-sm text-[var(--vivida-cyan)] hover:underline">
            hello@vivida.ge
          </a>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Explore</h2>
          <ul className="space-y-2 text-sm">
            {EXPLORE.map((item) => (
              <li key={item.href}><Link href={item.href} className="text-foreground/85 hover:text-foreground">{item.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Company</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="text-foreground/85 hover:text-foreground">About Vivida</Link></li>
            <li><Link href="/privacy" className="text-foreground/85 hover:text-foreground">Privacy policy</Link></li>
            <li><Link href="/terms" className="text-foreground/85 hover:text-foreground">Terms and conditions</Link></li>
            <li><Link href={GEORGIAN_SITE_URL} hrefLang="ka-GE" className="text-foreground/85 hover:text-foreground">ქართული ვერსია</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/30 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Vivida. Made in Georgia.
      </div>
    </footer>
  );
}
