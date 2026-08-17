import Link from "next/link";

import {
  ARMENIAN_SITE_URL,
  GEORGIAN_SITE_URL,
  englishSiteHref,
} from "@/lib/seo/locales";
import { VividaMark } from "@/components/brand/vivida-mark";
import { requestIsEnglishHost } from "@/lib/i18n/request-locale";

/**
 * The Georgian footer carries three link columns into every content cluster;
 * this one carried five links total, so ~590 of the 599 English URLs had no
 * sitewide internal link at all and depended entirely on the sitemap for
 * discovery. On a domain with no backlinks yet, that is the binding
 * constraint on crawling. Every href below is verified live on the English
 * host — Georgian slugs are intentional (the English site reuses them).
 */
const EXPLORE = [
  { href: "/natal-chart", label: "Natal chart" },
  { href: "/horoscope", label: "How horoscopes work" },
  { href: "/horoskopi", label: "Daily horoscope" },
  { href: "/horoskopi/kvireuli", label: "Weekly horoscope" },
  { href: "/horoskopi/tviuri", label: "Monthly horoscope" },
  { href: "/compatibility", label: "Compatibility" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How it works" },
];

const LEARN = [
  { href: "/zodiac", label: "Zodiac signs" },
  { href: "/zodiac/datit", label: "Sign by birth date" },
  { href: "/zodiac/mtvare", label: "Moon sign" },
  { href: "/zodiac/amomavali", label: "Rising sign" },
  { href: "/zodiac/elementebi", label: "Elements" },
  { href: "/zodiac/gzamkvlevi", label: "Complete guide" },
  { href: "/zodiac/reitingebi", label: "Sign rankings" },
  { href: "/astrologiuri-saxlebi", label: "Astrological houses" },
  { href: "/planetebi", label: "Planets" },
  { href: "/astrologiuri-kalendari", label: "Astrology calendar" },
  { href: "/dabnelebebi", label: "Eclipses" },
];

const TOOLS = [
  { href: "/taro", label: "Tarot reading" },
  { href: "/sizmris-akhsna", label: "Dream interpretation" },
  { href: "/numerologia", label: "Numerology" },
  { href: "/angeluri-ricxvebi", label: "Angel numbers" },
  { href: "/chinuri-horoskopi", label: "Chinese zodiac" },
  { href: "/tests", label: "Tests and quizzes" },
  { href: "/iq-testi", label: "IQ test" },
  { href: "/pirovnebis-testi", label: "Personality test" },
  { href: "/mbti", label: "MBTI types" },
  { href: "/emociuri-inteleqti", label: "Emotional intelligence" },
];

export async function EnglishFooter() {
  // Rendered on the Georgian host too (signed-in user reading English), where
  // a bare English path either 404s or serves Georgian — so content links are
  // resolved against the English domain whenever this is not that domain.
  const onEnglishHost = await requestIsEnglishHost();
  const href = (path: string) => englishSiteHref(path, onEnglishHost);
  return (
    <footer className="relative z-10 border-t border-border/40 bg-background/65 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="max-w-md">
          <Link href={href("/")} className="inline-flex items-center gap-2.5">
            <VividaMark size={36} id="english-footer" />
            <span className="text-xl font-semibold">vivida</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Personal astrology, natal charts and self-discovery tools, with core assessments and personalized readings available in English.
          </p>
          <a href="mailto:hello@vivida.ge" className="mt-3 inline-block text-sm text-[var(--vivida-cyan)] hover:underline">
            hello@vivida.ge
          </a>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Explore</h2>
          <ul className="space-y-2 text-sm">
            {EXPLORE.map((item) => (
              <li key={item.href}><Link href={href(item.href)} className="text-foreground/85 hover:text-foreground">{item.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Learn</h2>
          <ul className="space-y-2 text-sm">
            {LEARN.map((item) => (
              <li key={item.href}><Link href={href(item.href)} className="text-foreground/85 hover:text-foreground">{item.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tools</h2>
          <ul className="space-y-2 text-sm">
            {TOOLS.map((item) => (
              <li key={item.href}><Link href={href(item.href)} className="text-foreground/85 hover:text-foreground">{item.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Company</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href={href("/about")} className="text-foreground/85 hover:text-foreground">About Vivida</Link></li>
            <li><Link href={href("/privacy")} className="text-foreground/85 hover:text-foreground">Privacy policy</Link></li>
            <li><Link href={href("/terms")} className="text-foreground/85 hover:text-foreground">Terms and conditions</Link></li>
            <li><Link href={ARMENIAN_SITE_URL} hrefLang="hy-AM" className="text-foreground/85 hover:text-foreground">Հայերեն</Link></li>
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
