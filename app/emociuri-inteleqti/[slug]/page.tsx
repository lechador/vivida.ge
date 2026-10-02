import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ExternalLink,
} from "lucide-react";

import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { EqArticlePageEn } from "@/components/seo/eq-articles-en";

import { getRequestLocale } from "@/lib/i18n/request-locale";
import { EQ_ARTICLES, eqArticleBySlug } from "@/lib/seo/eq-articles";
import { eqArticleEnBySlug } from "@/lib/seo/eq-articles-en";
import {
  ALL_EQ_EN_SLUGS,
  eqPublicSlug,
  resolveEqSlug,
} from "@/lib/seo/en-slugs";

import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import {
  englishSiteHref,
  DEFAULT_OG_IMAGE,
  localizedAlternates,
} from "@/lib/seo/locales";

const BASE = "https://www.vivida.ge/emociuri-inteleqti";

export function generateStaticParams() {
  return [
    ...EQ_ARTICLES.map(({ slug }) => ({ slug })),
    ...ALL_EQ_EN_SLUGS.map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const locale = await getRequestLocale();
  const kaSlug =
    locale === "en"
      ? resolveEqSlug(rawSlug, "en", (s) => Boolean(eqArticleBySlug(s)))
      : eqArticleBySlug(rawSlug)
        ? rawSlug
        : null;
  if (locale === "en") {
    const item = kaSlug ? eqArticleEnBySlug(kaSlug) : undefined;
    if (!item || !kaSlug) return { title: "Article not found" };
    const kaPath = `/emociuri-inteleqti/${kaSlug}`;
    // Canonical English URL carries the keyword slug.
    const path = `/emotional-intelligence/${eqPublicSlug(kaSlug, "en")}`;
    return {
      title: { absolute: item.title },
      description: item.description,
      keywords: [
        item.category,
        "emotional intelligence",
        "EQ",
        ...item.domains,
      ],
      alternates: localizedAlternates(path, kaPath, "en"),
      openGraph: {
        images: [DEFAULT_OG_IMAGE],
        title: item.title,
        description: item.description,
        url: englishSiteHref(path, false),
        type: "article",
        locale: "en_US",
        publishedTime: "2026-07-20T00:00:00.000Z",
        modifiedTime: "2026-08-14T00:00:00.000Z",
      },
      twitter: {
        card: "summary_large_image",
        title: item.title,
        description: item.description,
      },
    };
  }
  const slug = rawSlug;
  const item = eqArticleBySlug(slug);
  if (!item) return { title: "სტატია ვერ მოიძებნა" };
  const url = `${BASE}/${item.slug}`;
  return {
    title: item.title,
    description: item.description,
    keywords: [item.category, "ემოციური ინტელექტი", "EQ", ...item.domains],
    alternates: localizedAlternates(
      `/emociuri-inteleqti/${slug}`,
      `/emociuri-inteleqti/${slug}`,
      "ka",
    ),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      title: item.title,
      description: item.description,
      url,
      type: "article",
      locale: "ka_GE",
      publishedTime: "2026-07-20T00:00:00+04:00",
      modifiedTime: "2026-07-20T00:00:00+04:00",
    },
  };
}

export default async function EqArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const locale = await getRequestLocale();
  if (locale === "en") {
    const kaSlug = resolveEqSlug(rawSlug, "en", (s) =>
      Boolean(eqArticleBySlug(s)),
    );
    const englishItem = kaSlug ? eqArticleEnBySlug(kaSlug) : undefined;
    if (!englishItem) notFound();
    return <EqArticlePageEn item={englishItem} />;
  }
  const slug = rawSlug;
  const item = eqArticleBySlug(slug);
  if (!item) notFound();
  const url = `${BASE}/${item.slug}`;
  const related = EQ_ARTICLES.filter(
    (other) =>
      other.slug !== item.slug &&
      other.domains.some((domain) => item.domains.includes(domain)),
  ).slice(0, 3);
  const ld = [
    articleLd({
      url,
      headline: item.title,
      description: item.description,
      datePublished: "2026-07-20T00:00:00+04:00",
      dateModified: "2026-07-20T00:00:00+04:00",
      about: { "@type": "Thing", name: "ემოციური ინტელექტი" },
    }),
    breadcrumbLd([
      { name: "მთავარი", url: "https://www.vivida.ge" },
      { name: "ემოციური ინტელექტი", url: BASE },
      { name: item.title, url },
    ]),
    faqLd(item.faq),
  ];

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <Starfield count={70} shooting={1} />
      <SmartHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        <Link
          href="/emociuri-inteleqti"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> ყველა სტატია
        </Link>
        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--vivida-cyan)]">
            <span>{item.category}</span>
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <BookOpen className="size-3.5" /> {item.readingMinutes} წუთი
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
              <h2 className="text-2xl font-semibold tracking-tight">
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
            <h2 className="text-2xl font-semibold">პრაქტიკული გეგმა</h2>
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
            <h2 className="text-2xl font-semibold">ხშირი კითხვები</h2>
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
              კვლევითი საფუძველი
            </h2>
            <p className="mt-2">
              სტატიების სერია ეფუძნება ემოციური ინტელექტის უნარების მოდელს,
              ემოციური კომპეტენციების ტრენინგების სისტემურ მიმოხილვასა და WHO-ს
              სტრესის მართვის პრაქტიკულ გზამკვლევს.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              <a
                href="https://medicine.yale.edu/news-article/the-truth-about-emotional-intelligence/"
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                Yale Center for Emotional Intelligence{" "}
                <ExternalLink className="size-3" />
              </a>
              <a
                href="https://pmc.ncbi.nlm.nih.gov/articles/PMC11616120/"
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                სისტემური მიმოხილვა და მეტა-ანალიზი{" "}
                <ExternalLink className="size-3" />
              </a>
              <a
                href="https://www.who.int/thailand/activities/doing-what-matters-in-times-of-stress"
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                WHO: Doing What Matters <ExternalLink className="size-3" />
              </a>
            </div>
          </aside>
        </div>

        <section className="mt-14 border-t border-border pt-9">
          <h2 className="text-2xl font-semibold">შემდეგ წაიკითხე</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {related.map((other) => (
              <Link
                key={other.slug}
                href={`/emociuri-inteleqti/${other.slug}`}
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
          <h2 className="mt-3 text-2xl font-semibold">
            რომელი უნარია შენი ზრდის სივრცე?
          </h2>
          <p className="mt-2 text-sm text-foreground/75">
            გაიარე 40-კითხვიანი EQ თვითშეფასება და მიიღე პირადი ემოციური რუკა.
          </p>
          <Link
            href="/eq-testi"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--vivida-violet)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            EQ ტესტის დაწყება <ArrowRight className="size-4" />
          </Link>
        </div>
      </article>
    </main>
  );
}
