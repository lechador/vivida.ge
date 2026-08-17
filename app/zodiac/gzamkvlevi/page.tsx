import Link from "next/link";
import type { Metadata } from "next";
import {
  Calendar,
  Compass,
  Moon,
  Sparkles,
  Sunrise,
  Sun,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { GUIDE_LATIN_QUERIES } from "@/lib/seo/transliteration";
import {
  MOONS_CONTENT,
  RISINGS_CONTENT,
  SIGNS_CONTENT,
  PAIRS_CONTENT,
} from "@/lib/seo/zodiac-content";
import {
  ALL_ELEMENT_SLUGS,
  ALL_PAIR_SLUGS,
  ALL_SLUGS,
  ELEMENT_LABEL_KA,
  SIGNS_BY_ELEMENT,
  ZODIAC_DATES,
  parsePairSlug,
  signMetaBySlug,
  type ZodiacSlug,
} from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import {
  ARMENIAN_SITE_URL,
  DEFAULT_OG_IMAGE,
  localizedAlternates,
} from "@/lib/seo/locales";
import { ZodiacGuideIndexEn } from "@/components/seo/zodiac-guides-en";
import { ZodiacGuideIndexAm } from "@/components/seo/zodiac-guides-am";

const SITE_URL = "https://www.vivida.ge";
const PATH = "/zodiac/gzamkvlevi";

const PAGE_TITLE =
  "ცის სრული გზამკვლევი — ყველა ცის ნიშანი ერთ ადგილას | Vivida";
const META_DESCRIPTION =
  "ცის ნიშნები, მთვარის ნიშანი, ამომავალი, ელემენტები და 78 თავსებადობის წყვილი — ვივიდას სრული ასტროლოგიური გზამკვლევი ერთ გვერდზე.";

const KA_METADATA: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: META_DESCRIPTION,
  alternates: localizedAlternates(PATH, PATH, "ka"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    type: "website",
    url: `${SITE_URL}${PATH}`,
    title: PAGE_TITLE,
    description: META_DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: META_DESCRIPTION,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  if (locale === "ka") return KA_METADATA;
  if (locale === "am") {
    const title =
      "Կենդանակերպի ամբողջական ուղեցույց՝ նշաններ, Լուսին, ասցենդենտ և համատեղելիություն";
    const description =
      "Բացահայտեք կենդանակերպի բոլոր նշանները, Լուսնի նշանները, ասցենդենտները, չորս տարրերը, հորոսկոպներն ու համատեղելիության բոլոր 78 զույգերը։";
    return {
      title: { absolute: title },
      description,
      alternates: localizedAlternates(`/am${PATH}`, PATH, "am"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `${ARMENIAN_SITE_URL}${PATH}`,
        title,
        description,
        siteName: "Vivida",
        locale: "hy_AM",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  if (locale === "en") {
    const title =
      "Complete Zodiac Guide: Signs, Moon, Rising and Compatibility";
    const description =
      "Explore all zodiac signs, Moon signs, rising signs, four elements, horoscope periods, calculators, and all 78 compatibility pairings.";
    return {
      title: { absolute: title },
      description,
      alternates: localizedAlternates(PATH, PATH, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        type: "website",
        url: `https://www.vividaastro.com${PATH}`,
        title,
        description,
        siteName: "Vivida",
        locale: "en_US",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  return KA_METADATA;
}

const ELEMENT_ACCENT: Record<string, string> = {
  fire: "oklch(0.72 0.22 30)",
  earth: "oklch(0.65 0.13 130)",
  air: "oklch(0.78 0.16 220)",
  water: "oklch(0.65 0.20 285)",
};

export default async function GuideIndexPage() {
  const locale = await getRequestLocale();
  if (locale === "am") return <ZodiacGuideIndexAm />;
  if (locale === "en") return <ZodiacGuideIndexEn />;
  // Build a flat list of all canonical pages for the JSON-LD ItemList.
  const allUrls: Array<{ url: string; name: string }> = [
    { url: `${SITE_URL}/zodiac`, name: "ცის ნიშნები — ჰაბი" },
    { url: `${SITE_URL}/zodiac/datit`, name: "ცის ნიშანი თარიღით" },
    { url: `${SITE_URL}/zodiac/elementebi`, name: "ცის ელემენტები" },
    { url: `${SITE_URL}/zodiac/tavsebadoba`, name: "ცის ნიშნების თავსებადობა" },
    { url: `${SITE_URL}/zodiac/mtvare`, name: "მთვარის ნიშანი" },
    { url: `${SITE_URL}/zodiac/amomavali`, name: "ამომავალი ნიშანი" },
    ...ALL_SLUGS.map((s) => ({
      url: `${SITE_URL}/zodiac/${s}`,
      name: SIGNS_CONTENT[s].labelKa,
    })),
    ...ALL_SLUGS.map((s) => ({
      url: `${SITE_URL}/zodiac/mtvare/${s}`,
      name: `მთვარე ${SIGNS_CONTENT[s].labelKa}-ში`,
    })),
    ...ALL_SLUGS.map((s) => ({
      url: `${SITE_URL}/zodiac/amomavali/${s}`,
      name: `${SIGNS_CONTENT[s].labelKa} ამომავალი`,
    })),
    ...ALL_ELEMENT_SLUGS.map((el) => ({
      url: `${SITE_URL}/zodiac/elementebi/${el}`,
      name: ELEMENT_LABEL_KA[el],
    })),
    ...ALL_PAIR_SLUGS.map((p) => ({
      url: `${SITE_URL}/zodiac/tavsebadoba/${p}`,
      name: `თავსებადობა — ${p}`,
    })),
  ];

  const pageLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: PAGE_TITLE,
    description: META_DESCRIPTION,
    url: `${SITE_URL}${PATH}`,
    inLanguage: "ka-GE",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: allUrls.length,
      itemListElement: allUrls.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: item.url,
        name: item.name,
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "ცის ნიშნები",
        item: `${SITE_URL}/zodiac`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "სრული გზამკვლევი",
        item: `${SITE_URL}${PATH}`,
      },
    ],
  };

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={130} shooting={3} />
      <SmartHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">
            ცის ნიშნები
          </Link>
          <span>/</span>
          <span className="text-foreground/80">სრული გზამკვლევი</span>
        </nav>

        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Compass className="size-3.5" />
          სრული გზამკვლევი
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          ცის სრული გზამკვლევი
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          ვივიდას ყველა ასტროლოგიური გვერდი ერთ ადგილას — 12 ცის ნიშანი, მთვარე,
          ამომავალი, ელემენტები და 78 თავსებადობის წყვილი.
        </p>

        {/* Quick anchors */}
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            { id: "sun", label: "მზის ნიშანი" },
            { id: "moon", label: "მთვარის ნიშანი" },
            { id: "rising", label: "ამომავალი" },
            { id: "elements", label: "ელემენტები" },
            { id: "compat", label: "თავსებადობა" },
            { id: "tools", label: "ხელსაწყოები" },
          ].map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
            >
              {a.label}
            </a>
          ))}
        </div>

        {/* Sun signs */}
        <Section
          id="sun"
          icon={<Sun className="size-4" />}
          title="ცის 12 ნიშანი"
          subtitle="მზის ნიშანი — ამოცნობილი ხასიათი"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {ALL_SLUGS.map((slug) => {
              const c = SIGNS_CONTENT[slug];
              const meta = signMetaBySlug(slug);
              const accent = meta ? signColor(meta) : "var(--vivida-violet)";
              return (
                <Link
                  key={slug}
                  href={`/zodiac/${slug}`}
                  className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-xl text-lg"
                      style={{
                        background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                        boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent)`,
                        color: accent,
                      }}
                    >
                      {c.symbol}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold tracking-tight">
                        {c.labelKa}
                      </div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {ZODIAC_DATES[slug].rangeKa}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>

        {/* Moon signs */}
        <Section
          id="moon"
          icon={<Moon className="size-4" />}
          title="12 მთვარის ნიშანი"
          subtitle="ემოციური ბირთვი და შინაგანი სამყარო"
        >
          <SignList
            slugs={ALL_SLUGS}
            hrefBuilder={(s) => `/zodiac/mtvare/${s}`}
            labelBuilder={(s) =>
              MOONS_CONTENT
                ? `მთვარე ${MOONS_CONTENT[s].labelKa}-ში`
                : `მთვარე ${SIGNS_CONTENT[s].labelKa}-ში`
            }
            taglineBuilder={(s) => MOONS_CONTENT?.[s]?.tagline}
            symbolBuilder={(s) => SIGNS_CONTENT[s].symbol}
          />
          <div className="mt-3">
            <Link
              href="/zodiac/mtvare"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              მთვარის ნიშნის სრული ჰაბი →
            </Link>
          </div>
        </Section>

        {/* Rising signs */}
        <Section
          id="rising"
          icon={<Sunrise className="size-4" />}
          title="12 ამომავალი ნიშანი"
          subtitle="ნიღაბი, რომელსაც სამყარო ხედავს პირველად"
        >
          <SignList
            slugs={ALL_SLUGS}
            hrefBuilder={(s) => `/zodiac/amomavali/${s}`}
            labelBuilder={(s) =>
              RISINGS_CONTENT
                ? `${RISINGS_CONTENT[s].labelKa} ამომავალი`
                : `${SIGNS_CONTENT[s].labelKa} ამომავალი`
            }
            taglineBuilder={(s) => RISINGS_CONTENT?.[s]?.tagline}
            symbolBuilder={(s) => SIGNS_CONTENT[s].symbol}
          />
          <div className="mt-3">
            <Link
              href="/zodiac/amomavali"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ამომავალი ნიშნის სრული ჰაბი →
            </Link>
          </div>
        </Section>

        {/* Elements */}
        <Section
          id="elements"
          icon={<Sparkles className="size-4" />}
          title="4 ცის ელემენტი"
          subtitle="ცეცხლი · მიწა · ჰაერი · წყალი"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ALL_ELEMENT_SLUGS.map((el) => {
              const accent = ELEMENT_ACCENT[el];
              const signs = SIGNS_BY_ELEMENT[el];
              return (
                <Link
                  key={el}
                  href={`/zodiac/elementebi/${el}`}
                  className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-xl text-lg"
                      style={{
                        background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                        boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent)`,
                        color: accent,
                      }}
                    >
                      △
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold tracking-tight">
                        {ELEMENT_LABEL_KA[el]}
                      </div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {signs.map((s) => SIGNS_CONTENT[s].labelKa).join(" · ")}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-3">
            <Link
              href="/zodiac/elementebi"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ელემენტების ჰაბი →
            </Link>
          </div>
        </Section>

        {/* Compatibility — 78 pairs grouped by first sign */}
        <Section
          id="compat"
          icon={<Heart className="size-4" />}
          title="78 თავსებადობის წყვილი"
          subtitle="ყველა შესაძლო კომბინაცია"
        >
          <div className="mb-4 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold tracking-tight">
                  სრული 12×12 ცხრილი
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  ნახე ყველა წყვილი ერთი მზერით — სტარეიტინგით
                </div>
              </div>
              <Link
                href="/zodiac/tavsebadoba"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/65 px-3 py-1.5 text-sm transition-colors hover:bg-card/85"
              >
                ცხრილზე გადასვლა →
              </Link>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_SLUGS.map((firstSlug) => {
              const firstLabel = SIGNS_CONTENT[firstSlug].labelKa;
              const meta = signMetaBySlug(firstSlug);
              const accent = meta ? signColor(meta) : "var(--vivida-violet)";
              const pairsForSign = ALL_PAIR_SLUGS.filter((p) => {
                const parsed = parsePairSlug(p);
                return (
                  parsed && (parsed[0] === firstSlug || parsed[1] === firstSlug)
                );
              });
              return (
                <details
                  key={firstSlug}
                  className="group rounded-2xl border border-border bg-card/45 p-3 ring-1 ring-foreground/5 backdrop-blur-xl open:bg-card/65 sm:p-4"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <span
                        className="grid size-7 place-items-center rounded-lg text-sm"
                        style={{
                          background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                          color: accent,
                        }}
                      >
                        {SIGNS_CONTENT[firstSlug].symbol}
                      </span>
                      {firstLabel} — {pairsForSign.length} წყვილი
                    </span>
                    <span
                      aria-hidden
                      className="text-xs text-muted-foreground transition-transform group-open:rotate-90"
                    >
                      ›
                    </span>
                  </summary>
                  <ul className="mt-3 space-y-1.5">
                    {pairsForSign.map((p) => {
                      const parsed = parsePairSlug(p);
                      if (!parsed) return null;
                      const [a, b] = parsed;
                      const pairContent = PAIRS_CONTENT?.[p];
                      const labelA =
                        pairContent?.labelA ??
                        SIGNS_CONTENT[a as ZodiacSlug].labelKa;
                      const labelB =
                        pairContent?.labelB ??
                        SIGNS_CONTENT[b as ZodiacSlug].labelKa;
                      return (
                        <li key={p}>
                          <Link
                            href={`/zodiac/tavsebadoba/${p}`}
                            className="block rounded-lg px-2 py-1.5 text-sm text-foreground/85 transition-colors hover:bg-foreground/5 hover:text-foreground"
                          >
                            {labelA} + {labelB}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              );
            })}
          </div>
        </Section>

        {/* Tools */}
        <Section
          id="tools"
          icon={<Calendar className="size-4" />}
          title="ხელსაწყოები და ჰაბები"
          subtitle="ცის რუკის შესვლის წერტილები"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                href: "/zodiac/datit",
                title: "ნიშანი თარიღით",
                desc: "შენი დაბადების თვე და დღე — ვუთხართ ცის ნიშანი წამში.",
              },
              {
                href: "/zodiac",
                title: "ცის ნიშნების ჰაბი",
                desc: "12 ნიშნის შესავალი, ელემენტები და მოდალურობა.",
              },
              {
                href: "/zodiac/mtvare",
                title: "მთვარის ნიშნის ჰაბი",
                desc: "რატომ არის შენი მთვარე მზესთან თანაბრად მნიშვნელოვანი.",
              },
              {
                href: "/zodiac/amomavali",
                title: "ამომავალი ნიშნის ჰაბი",
                desc: "ასცენდენტი — როგორ შედიხარ ცხოვრებაში.",
              },
              {
                href: "/zodiac/elementebi",
                title: "ელემენტების ჰაბი",
                desc: "ცეცხლი, მიწა, ჰაერი, წყალი — ცის ნიშნების ენერგიები.",
              },
              {
                href: "/zodiac/tavsebadoba",
                title: "თავსებადობის ცხრილი",
                desc: "12×12 სრული ცხრილი — ნახე ნებისმიერი კომბინაცია.",
              },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:bg-card/80 hover:ring-foreground/15"
              >
                <div className="text-sm font-semibold tracking-tight">
                  {t.title}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t.desc}
                </div>
              </Link>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            ეს მხოლოდ შესავალია
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            ცოცხალი ნატალური რუკა, ყოველდღიური პროგნოზი და სინასტრია — Vivida-ს
            აპლიკაციაში. ერთ წუთში დაიწყე უფასოდ.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">დაიწყე უფასოდ</Link>
          </Button>
        </div>

        <PopularSearches queries={GUIDE_LATIN_QUERIES} />
      </section>

      <SiteFooter />
    </main>
  );
}

function Section({
  id,
  icon,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-14 scroll-mt-24">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg border border-border bg-card/65 text-foreground/80">
          {icon}
        </span>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SignList({
  slugs,
  hrefBuilder,
  labelBuilder,
  taglineBuilder,
  symbolBuilder,
}: {
  slugs: ZodiacSlug[];
  hrefBuilder: (s: ZodiacSlug) => string;
  labelBuilder: (s: ZodiacSlug) => string;
  taglineBuilder: (s: ZodiacSlug) => string | undefined;
  symbolBuilder: (s: ZodiacSlug) => string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {slugs.map((slug) => {
        const meta = signMetaBySlug(slug);
        const accent = meta ? signColor(meta) : "var(--vivida-violet)";
        const tagline = taglineBuilder(slug);
        return (
          <Link
            key={slug}
            href={hrefBuilder(slug)}
            className="group flex items-center gap-3 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15"
          >
            <span
              className="grid size-9 shrink-0 place-items-center rounded-xl text-lg"
              style={{
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent)`,
                color: accent,
              }}
            >
              {symbolBuilder(slug)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold tracking-tight">
                {labelBuilder(slug)}
              </div>
              {tagline && (
                <div className="line-clamp-1 text-xs text-muted-foreground">
                  {tagline}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
