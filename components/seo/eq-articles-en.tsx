import { EnglishLink as Link } from "@/components/i18n/international-link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ExternalLink,
  Heart,
} from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { EQ_ARTICLES_EN, type EqArticleEn } from "@/lib/seo/eq-articles-en";
import { eqPublicSlug } from "@/lib/seo/en-slugs";

const SITE = "https://www.vividaastro.com";

export const EQ_HUB_EN = {
  title: "Emotional Intelligence: Practical EQ Guides and Exercises",
  description:
    "Build emotional intelligence with practical, research-informed guides to self-awareness, emotion regulation, empathy, motivation, communication, relationships, and work.",
};

export function EqArticlesHubEn() {
  const categories = [...new Set(EQ_ARTICLES_EN.map((item) => item.category))];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: EQ_HUB_EN.title,
      description: EQ_HUB_EN.description,
      inLanguage: "en",
      url: `${SITE}/emotional-intelligence`,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      numberOfItems: EQ_ARTICLES_EN.length,
      itemListElement: EQ_ARTICLES_EN.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${SITE}/emotional-intelligence/${eqPublicSlug(item.slug, "en")}`,
      })),
    },
  ];
  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <Starfield count={90} shooting={1} />
      <SmartHeader locale="en" georgianPath="/emociuri-inteleqti" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="text-foreground/80">Emotional intelligence</span>
        </nav>
        <header className="mx-auto max-w-3xl text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--vivida-pink)]/12 text-[var(--vivida-pink)]">
            <Heart />
          </div>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Emotional intelligence guides
          </h1>
          <p className="mt-5 text-pretty text-base leading-7 text-foreground/75 sm:text-lg">
            Practical, research-informed articles for understanding emotion,
            strengthening empathy, communicating more clearly, and responding to
            stress with greater choice.
          </p>
          <Link
            href="/eq-testi"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--vivida-violet)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Take the EQ self-assessment
            <ArrowRight className="size-4" />
          </Link>
        </header>

        <div className="mt-14 space-y-12">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="font-display mb-4 text-2xl font-medium">
                {category}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {EQ_ARTICLES_EN.filter(
                  (item) => item.category === category,
                ).map((item) => (
                  <article
                    key={item.slug}
                    className="group relative rounded-2xl border border-border bg-card/55 p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--vivida-violet)]/45"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="size-3.5" />
                      {item.readingMinutes} min read
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-snug">
                      <Link
                        href={`/emociuri-inteleqti/${eqPublicSlug(item.slug, "en")}`}
                        className="after:absolute after:inset-0"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-foreground/70">
                      {item.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--vivida-cyan)]">
                      Read guide
                      <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="mt-14 rounded-2xl border border-border bg-card/45 p-5 text-sm leading-6 text-foreground/70">
          <strong className="text-foreground">Educational scope:</strong> these
          guides discuss emotional skills and everyday coping. They do not
          diagnose mental-health conditions or replace care from a qualified
          professional.
        </aside>
      </section>
      <SiteFooter locale="en" />
    </main>
  );
}

export function EqArticlePageEn({ item }: { item: EqArticleEn }) {
  const url = `${SITE}/emotional-intelligence/${eqPublicSlug(item.slug, "en")}`;
  const related = EQ_ARTICLES_EN.filter(
    (other) =>
      other.slug !== item.slug &&
      other.domains.some((domain) => item.domains.includes(domain)),
  ).slice(0, 3);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: item.title,
      description: item.description,
      inLanguage: "en",
      datePublished: "2026-07-20T00:00:00.000Z",
      dateModified: "2026-08-14T00:00:00.000Z",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "Vivida", url: SITE },
      publisher: { "@type": "Organization", name: "Vivida", url: SITE },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: item.faq.map((entry) => ({
        "@type": "Question",
        name: entry.q,
        acceptedAnswer: { "@type": "Answer", text: entry.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE },
        {
          "@type": "ListItem",
          position: 2,
          name: "Emotional intelligence",
          item: `${SITE}/emotional-intelligence`,
        },
        { "@type": "ListItem", position: 3, name: item.title, item: url },
      ],
    },
  ];
  return (
    <main
      lang="en"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <Starfield count={70} shooting={1} />
      <SmartHeader
        locale="en"
        georgianPath={`/emociuri-inteleqti/${item.slug}`}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        <Link
          href="/emociuri-inteleqti"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All EQ guides
        </Link>
        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--vivida-cyan)]">
            <span>{item.category}</span>
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="size-3.5" />
              {item.readingMinutes} min read
            </span>
          </div>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {item.title}
          </h1>
          <p className="mt-5 text-pretty text-lg leading-8 text-foreground/75">
            {item.intro}
          </p>
        </header>

        <div className="mt-10 space-y-10">
          {item.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl font-medium tracking-tight">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-[1.02rem] leading-8 text-foreground/82">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
          <section className="rounded-3xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/8 p-6 sm:p-8">
            <h2 className="font-display text-2xl font-medium">
              Practical plan
            </h2>
            <ol className="mt-5 space-y-3">
              {item.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--vivida-violet)] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="leading-6">{step}</span>
                </li>
              ))}
            </ol>
          </section>
          <section>
            <h2 className="font-display text-2xl font-medium">
              Frequently asked questions
            </h2>
            <div className="mt-4 space-y-3">
              {item.faq.map((entry) => (
                <details
                  key={entry.q}
                  className="rounded-2xl border border-border bg-card/50 p-4"
                >
                  <summary className="cursor-pointer font-medium">
                    {entry.q}
                  </summary>
                  <p className="mt-3 leading-7 text-foreground/75">{entry.a}</p>
                </details>
              ))}
            </div>
          </section>
          <aside className="rounded-2xl border border-border bg-card/45 p-5 text-sm leading-6 text-foreground/70">
            <h2 className="font-semibold text-foreground">
              Research context and limits
            </h2>
            <p className="mt-2">
              This educational series draws on emotional-skills research, a
              systematic review of emotional-competency training, and the World
              Health Organization’s practical stress-management materials. A
              self-assessment is not a clinical diagnosis.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              <a
                href="https://medicine.yale.edu/news-article/the-truth-about-emotional-intelligence/"
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                Yale Center for Emotional Intelligence
                <ExternalLink className="size-3" />
              </a>
              <a
                href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11616120/"
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                Systematic review and meta-analysis
                <ExternalLink className="size-3" />
              </a>
              <a
                href="https://www.who.int/thailand/activities/doing-what-matters-in-times-of-stress"
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                WHO: Doing What Matters
                <ExternalLink className="size-3" />
              </a>
            </div>
          </aside>
        </div>

        <section className="mt-14 border-t border-border pt-9">
          <h2 className="font-display text-2xl font-medium">Read next</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((other) => (
              <Link
                key={other.slug}
                href={`/emociuri-inteleqti/${eqPublicSlug(other.slug, "en")}`}
                className="rounded-2xl border border-border bg-card/50 p-4 text-sm font-medium leading-5 hover:border-[var(--vivida-violet)]/45"
              >
                {other.title}
                <ArrowRight className="mt-3 size-4 text-[var(--vivida-cyan)]" />
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 rounded-3xl bg-gradient-to-br from-[var(--vivida-violet)]/20 to-[var(--vivida-pink)]/15 p-7 text-center">
          <Check className="mx-auto size-6 text-[var(--vivida-cyan)]" />
          <h2 className="font-display mt-3 text-2xl font-medium">
            Which skill is your growth area?
          </h2>
          <p className="mt-2 text-sm text-foreground/75">
            Take the 40-question EQ self-assessment and explore your five-domain
            profile.
          </p>
          <Link
            href="/eq-testi"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--vivida-violet)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Start the EQ assessment
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </article>
      <SiteFooter locale="en" />
    </main>
  );
}
