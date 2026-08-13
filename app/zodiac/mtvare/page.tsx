import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  MOON_HUB_CONTENT,
  MOONS_CONTENT,
  paragraphs,
} from "@/lib/seo/zodiac-content";
import {
  ALL_SLUGS,
  signMetaBySlug,
} from "@/lib/seo/zodiac-dates";
import { signColor } from "@/lib/zodiac";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { ZodiacPlacementHubEn } from "@/components/seo/zodiac-placement-hub-en";
import { localizedAlternates } from "@/lib/seo/locales";

const SITE_URL = "https://www.vivida.ge";
const PATH = "/zodiac/mtvare";

export async function generateMetadata(): Promise<Metadata> {
  if ((await getRequestLocale()) === "en") {
    const title = "Moon Signs: Meaning, Emotional Traits and Love";
    const description =
      "Discover what your Moon sign reveals about emotional needs, instinctive reactions, love, compatibility, and your private inner world.";
    return {
      title: { absolute: title },
      description,
      alternates: localizedAlternates(PATH, PATH, "en"),
      openGraph: {
        type: "website",
        url: "https://vividaastro.com/zodiac/mtvare",
        title,
        description,
        siteName: "Vivida",
        locale: "en_US",
      },
      twitter: { card: "summary_large_image", title, description },
    };
  }
  return MOON_HUB_CONTENT
    ? {
      title: { absolute: MOON_HUB_CONTENT.pageTitle },
      description: MOON_HUB_CONTENT.metaDescription,
      alternates: localizedAlternates(PATH, PATH, "ka"),
      openGraph: {
        type: "website",
        url: `${SITE_URL}${PATH}`,
        title: MOON_HUB_CONTENT.pageTitle,
        description: MOON_HUB_CONTENT.metaDescription,
        siteName: "Vivida",
        locale: "ka_GE",
      },
      twitter: {
        card: "summary_large_image",
        title: MOON_HUB_CONTENT.pageTitle,
        description: MOON_HUB_CONTENT.metaDescription,
      },
      }
    : {};
}

export default async function MoonHubPage() {
  if ((await getRequestLocale()) === "en")
    return <ZodiacPlacementHubEn kind="moon" />;
  if (!MOON_HUB_CONTENT || !MOONS_CONTENT) notFound();
  const c = MOON_HUB_CONTENT;
  const moons = MOONS_CONTENT;

  const hubLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: c.pageTitle,
    description: c.metaDescription,
    url: `${SITE_URL}${PATH}`,
    inLanguage: "ka-GE",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: ALL_SLUGS.map((slug, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}${PATH}/${slug}`,
        name: moons[slug]?.labelKa ?? slug,
      })),
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ცის ნიშნები", item: `${SITE_URL}/zodiac` },
      { "@type": "ListItem", position: 2, name: "მთვარის ნიშანი", item: `${SITE_URL}${PATH}` },
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/zodiac" className="hover:text-foreground">ცის ნიშნები</Link>
          <span>/</span>
          <span className="text-foreground/80">მთვარის ნიშანი</span>
        </nav>

        <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Moon className="size-3.5" />
          მთვარის ნიშანი
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {c.h1}
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          {c.tagline}
        </p>

        <div className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(c.intro).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Three explainer sections */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[c.whatItMeans, c.vsSun, c.howToFind].map((s, i) => (
            <article
              key={i}
              className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 backdrop-blur-xl sm:p-6"
            >
              <h2 className="mb-3 text-lg font-semibold tracking-tight">
                {s.title}
              </h2>
              <div className="space-y-3 text-pretty text-sm leading-relaxed text-foreground/85">
                {paragraphs(s.body).map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* All 12 moon signs grid */}
        <section className="mt-14">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            აირჩიე შენი მთვარის ნიშანი
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_SLUGS.map((slug) => {
              const m = moons[slug];
              const meta = signMetaBySlug(slug);
              const accent = meta ? signColor(meta) : "var(--vivida-violet)";
              return (
                <Link
                  key={slug}
                  href={`${PATH}/${slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-card/80 hover:ring-foreground/15"
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl text-xl"
                    style={{
                      background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                      boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accent} 35%, transparent)`,
                      color: accent,
                    }}
                  >
                    {m.symbol}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold tracking-tight">
                      მთვარე {m.labelKa}-ში
                    </div>
                    <div className="line-clamp-1 text-xs text-muted-foreground">
                      {m.tagline}
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16 max-w-3xl">
          <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {c.faq.map((item, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors open:bg-card/80 sm:p-5"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-medium text-foreground">
                  <span>{item.q}</span>
                  <span aria-hidden className="mt-1 shrink-0 text-xs text-muted-foreground transition-transform group-open:rotate-45">✦</span>
                </summary>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground/85 sm:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 backdrop-blur-xl sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            გაიგე შენი ზუსტი მთვარის ნიშანი
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-base text-muted-foreground">
            შენი დაბადების დროიდან Vivida ერთ წუთში დაგიფიქსირებს მთვარის
            ნიშანს — და ცის 12 სახლის სრულ რუკას.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/signup">დაიწყე უფასოდ</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
