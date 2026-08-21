import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { ArrowLeft, ArrowRight, BookOpen, ExternalLink, Heart } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { EQ_ARTICLES_AM, EQ_HUB_AM, type EqArticleAm } from "@/lib/seo/eq-articles-am";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

const SITE = ARMENIAN_SITE_URL;

export function EqArticlesHubAm() {
  const categories = [...new Set(EQ_ARTICLES_AM.map((item) => item.category))];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: EQ_HUB_AM.title,
      description: EQ_HUB_AM.description,
      inLanguage: "hy-AM",
      url: `${SITE}/emociuri-inteleqti`,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      numberOfItems: EQ_ARTICLES_AM.length,
      itemListElement: EQ_ARTICLES_AM.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${SITE}/emociuri-inteleqti/${item.slug}`,
      })),
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={90} shooting={1} />
      <SmartHeader locale="am" georgianPath="/emociuri-inteleqti" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <nav className="mb-8 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am" className="hover:text-foreground">Գլխավոր</Link>
          <span>/</span>
          <span className="text-foreground/80">Էմոցիոնալ ինտելեկտ</span>
        </nav>
        <header className="mx-auto max-w-3xl text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--vivida-pink)]/12 text-[var(--vivida-pink)]">
            <Heart />
          </div>
          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Էմոցիոնալ ինտելեկտի ուղեցույցներ
          </h1>
          <p className="mt-5 text-pretty text-base leading-7 text-foreground/75 sm:text-lg">
            Գործնական, հետազոտությունների վրա հիմնված հոդվածներ՝ սեփական էմոցիաները հասկանալու, էմպաթիան զարգացնելու և սթրեսին ավելի հավասարակշռված արձագանքելու համար:
          </p>
          <Link
            href="/am/tests"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--vivida-violet)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Ուսումնասիրել թեստերը
            <ArrowRight className="size-4" />
          </Link>
        </header>

        <div className="mt-14 space-y-12">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="mb-4 text-2xl font-semibold">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {EQ_ARTICLES_AM.filter((item) => item.category === category).map((item) => (
                  <article
                    key={item.slug}
                    className="group relative rounded-2xl border border-border bg-card/55 p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--vivida-violet)]/45"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BookOpen className="size-3.5" />
                      {item.readingMinutes} րոպե ընթերցում
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-snug">
                      <Link
                        href={`/am/emociuri-inteleqti/${item.slug}`}
                        className="after:absolute after:inset-0"
                      >
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-foreground/70">{item.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--vivida-cyan)]">
                      Կարդալ ուղեցույցը
                      <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="mt-14 rounded-2xl border border-border bg-card/45 p-5 text-sm leading-6 text-foreground/70">
          <strong className="text-foreground">Կրթական նպատակ.</strong> այս ուղեցույցները քննարկում են էմոցիոնալ հմտությունները և առօրյա ինքնօգնությունը: Դրանք չեն ախտորոշում հոգեկան առողջության խնդիրներ և չեն փոխարինում մասնագիտական օգնությանը:
        </aside>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

export function EqArticlePageAm({ item }: { item: EqArticleAm }) {
  const url = `${SITE}/emociuri-inteleqti/${item.slug}`;
  const related = EQ_ARTICLES_AM.filter(
    (other) =>
      other.slug !== item.slug &&
      other.domains.some((domain) => item.domains.includes(domain))
  ).slice(0, 3);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: item.title,
      description: item.description,
      inLanguage: "hy-AM",
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
        { "@type": "ListItem", position: 1, name: "Գլխավոր", item: SITE },
        {
          "@type": "ListItem",
          position: 2,
          name: "Էմոցիոնալ ինտելեկտ",
          item: `${SITE}/emociuri-inteleqti`,
        },
        { "@type": "ListItem", position: 3, name: item.title, item: url },
      ],
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={70} shooting={1} />
      <SmartHeader locale="am" georgianPath={`/emociuri-inteleqti/${item.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        <Link
          href="/am/emociuri-inteleqti"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Բոլոր EQ ուղեցույցները
        </Link>
        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--vivida-cyan)]">
            <span>{item.category}</span>
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="size-3.5" />
              {item.readingMinutes} րոպե ընթերցում
            </span>
          </div>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {item.title}
          </h1>
          <p className="mt-5 text-pretty text-lg leading-8 text-foreground/75">{item.intro}</p>
        </header>

        <div className="mt-10 space-y-10">
          {item.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-[1.02rem] leading-8 text-foreground/82">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-3xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/8 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Գործնական քայլեր</h2>
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
            <h2 className="text-2xl font-semibold">Հաճախ տրվող հարցեր</h2>
            <div className="mt-4 space-y-3">
              {item.faq.map((entry) => (
                <details
                  key={entry.q}
                  className="rounded-2xl border border-border bg-card/50 p-4"
                >
                  <summary className="cursor-pointer font-medium">{entry.q}</summary>
                  <p className="mt-3 leading-7 text-foreground/75">{entry.a}</p>
                </details>
              ))}
            </div>
          </section>

          <aside className="rounded-2xl border border-border bg-card/45 p-5 text-sm leading-6 text-foreground/70">
            <h2 className="font-semibold text-foreground">Հետազոտական աղբյուրներ</h2>
            <p className="mt-2">
              Այս կրթական նյութերը հիմնված են էմոցիոնալ հմտությունների հետազոտությունների, էմոցիոնալ կոմպետենցիաների վերլուծությունների և Առողջապահության համաշխարհային կազմակերպության (WHO) սթրեսի կառավարման գործնական մեթոդների վրա:
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
                Համակարգված վերանայում և մետավերլուծություն
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

        {related.length > 0 && (
          <section className="mt-16 border-t border-border/60 pt-10">
            <h2 className="text-xl font-semibold">Հարակից ուղեցույցներ</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {related.map((articleItem) => (
                <Link
                  key={articleItem.slug}
                  href={`/am/emociuri-inteleqti/${articleItem.slug}`}
                  className="rounded-xl border border-border bg-card/45 p-4 transition hover:bg-card/75"
                >
                  <div className="text-xs text-[var(--vivida-cyan)]">{articleItem.category}</div>
                  <div className="mt-1.5 text-sm font-semibold">{articleItem.title}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
      <SiteFooter locale="am" />
    </main>
  );
}
