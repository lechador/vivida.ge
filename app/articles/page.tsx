import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, Sparkles } from "lucide-react";

import { ArticleCard } from "@/components/articles/article-card";
import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_LABELS,
  articlePath,
  articleUrl,
  isArticleCategory,
  listPublishedArticles,
} from "@/lib/articles";
import { getRequestLocale } from "@/lib/i18n/request-locale";

const COPY = {
  ka: {
    title: "სტატიები ფსიქოლოგიაზე, ფილოსოფიასა და თვითგანვითარებაზე",
    description: "დაფიქრებული და პრაქტიკული საკითხავი საკუთარი თავის, ურთიერთობებისა და უფრო გააზრებული ცხოვრების შესახებ.",
    eyebrow: "Vivida Journal",
    heading: "აზრები უფრო გააზრებული ცხოვრებისთვის",
    intro: "ფსიქოლოგია, ფილოსოფია, ურთიერთობები და თვითგანვითარება — სიღრმით, სიმშვიდით და ყოველდღიურ ცხოვრებაში გამოსაყენებელი ხედვით.",
    all: "ყველა",
    empty: "ამ კატეგორიაში სტატია მალე გამოჩნდება.",
  },
  en: {
    title: "Psychology, Philosophy & Self-Development Articles",
    description: "Thoughtful, practical reading about the mind, relationships and living with greater clarity.",
    eyebrow: "Vivida Journal",
    heading: "Ideas for a more examined life",
    intro: "Psychology, philosophy, relationships and self-development — thoughtful perspectives you can carry into everyday life.",
    all: "All",
    empty: "Articles in this category are coming soon.",
  },
  am: {
    title: "Հոգեբանության, փիլիսոփայության և ինքնազարգացման հոդվածներ",
    description: "Մտածված և գործնական ընթերցանություն ինքնաճանաչման, հարաբերությունների և ավելի գիտակցված կյանքի մասին:",
    eyebrow: "Vivida Journal",
    heading: "Մտքեր ավելի գիտակցված կյանքի համար",
    intro: "Հոգեբանություն, փիլիսոփայություն, հարաբերություններ և ինքնազարգացում՝ խորությամբ ու առօրյայում կիրառելի հայացքով:",
    all: "Բոլորը",
    empty: "Այս բաժնի հոդվածները շուտով կհրապարակվեն:",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = COPY[locale];
  const canonical = articleUrl(locale);
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        "ka-GE": articleUrl("ka"),
        en: articleUrl("en"),
        "hy-AM": articleUrl("am"),
        hy: articleUrl("am"),
        "x-default": articleUrl("en"),
      },
    },
    openGraph: {
      type: "website",
      title: copy.title,
      description: copy.description,
      url: canonical,
      images: ["/images/articles/courage-to-begin-again.webp"],
    },
    twitter: { title: copy.title, description: copy.description },
  };
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [locale, query] = await Promise.all([getRequestLocale(), searchParams]);
  const selected = isArticleCategory(query.category) ? query.category : undefined;
  const items = await listPublishedArticles(locale, { category: selected });
  const copy = COPY[locale];

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_38%_at_50%_-5%,oklch(0.30_0.16_305/0.48),transparent_70%),radial-gradient(42%_28%_at_92%_34%,oklch(0.28_0.14_220/0.3),transparent_72%)]"
      />
      <Starfield count={105} shooting={2} />
      <SmartHeader
        active="articles"
        locale={locale}
        georgianPath="/articles"
        englishPath="/articles"
        armenianPath="/articles"
      />

      <main className="relative z-10 flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pb-14 sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--vivida-violet)]">
            <Sparkles className="size-3.5" aria-hidden /> {copy.eyebrow}
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            {copy.heading}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/72 sm:text-xl">
            {copy.intro}
          </p>
        </section>

        <nav
          aria-label={locale === "ka" ? "სტატიების კატეგორიები" : locale === "am" ? "Հոդվածների բաժիններ" : "Article categories"}
          className="article-category-nav mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 pb-8 sm:flex-wrap sm:justify-center sm:px-6"
        >
          <Link
            href={articlePath(locale)}
            aria-current={!selected ? "page" : undefined}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              !selected
                ? "border-[var(--vivida-cyan)]/45 bg-[var(--vivida-cyan)]/12 text-[var(--vivida-cyan)]"
                : "border-border bg-card/45 text-muted-foreground hover:text-foreground"
            }`}
          >
            {copy.all}
          </Link>
          {ARTICLE_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`${articlePath(locale)}?category=${category}`}
              aria-current={selected === category ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                selected === category
                  ? "border-[var(--vivida-cyan)]/45 bg-[var(--vivida-cyan)]/12 text-[var(--vivida-cyan)]"
                  : "border-border bg-card/45 text-muted-foreground hover:text-foreground"
              }`}
            >
              {ARTICLE_CATEGORY_LABELS[locale][category]}
            </Link>
          ))}
        </nav>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
          {items.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((article, index) => (
                <div key={article.id} className={index === 0 && !selected ? "md:col-span-2 lg:col-span-3" : ""}>
                  <ArticleCard
                    article={article}
                    locale={locale}
                    featured={index === 0 && !selected}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card/55 px-6 py-14 text-center backdrop-blur-xl">
              <BookOpenText className="mx-auto size-9 text-[var(--vivida-violet)]" aria-hidden />
              <p className="mt-4 text-foreground/75">{copy.empty}</p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
