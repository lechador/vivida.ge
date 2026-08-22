import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Compass } from "lucide-react";

import { auth } from "@/auth";
import { ArticleCard } from "@/components/articles/article-card";
import { ArticleEngagement } from "@/components/articles/article-engagement";
import { ArticleMarkdown, articleHeadings } from "@/components/articles/article-markdown";
import { ReadingProgress } from "@/components/articles/reading-progress";
import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import {
  ARTICLE_CATEGORY_LABELS,
  articlePath,
  articleUrl,
  formatArticleDate,
  getPublishedArticle,
  getPublishedArticleTranslations,
  listRelatedArticles,
  readingMinutes,
} from "@/lib/articles";
import { getArticleEngagement } from "@/lib/article-engagement";
import type { UserLocale } from "@/lib/i18n/locale";
import { getRequestLocale } from "@/lib/i18n/request-locale";

type Props = { params: Promise<{ slug: string }> };

const COPY = {
  ka: { back: "ყველა სტატია", min: "წთ საკითხავი", contents: "ამ სტატიაში", related: "წაიკითხე შემდეგ", note: "ეს სტატია განკუთვნილია საგანმანათლებლო და თვითრეფლექსიის მიზნებისთვის და არ ცვლის პროფესიონალურ ფსიქოლოგიურ ან სამედიცინო დახმარებას.", cta: "გაიცანი საკუთარი თავი უკეთ", ctaText: "გააგრძელე თვითშემეცნება Vivida-ს პიროვნების ტესტებითა და პერსონალური რუკით.", ctaLink: "შეარჩიე ტესტი" },
  en: { back: "All articles", min: "min read", contents: "In this article", related: "Read next", note: "This article is for education and self-reflection. It is not a substitute for professional psychological or medical care.", cta: "Understand yourself more clearly", ctaText: "Continue your self-discovery with Vivida's personality assessments and personal chart.", ctaLink: "Explore tests" },
  am: { back: "Բոլոր հոդվածները", min: "րոպե ընթերցում", contents: "Այս հոդվածում", related: "Կարդալ հաջորդը", note: "Այս հոդվածը կրթական և ինքնաճանաչման նպատակ ունի և չի փոխարինում մասնագիտական հոգեբանական կամ բժշկական օգնությանը:", cta: "Ճանաչեք ինքներդ ձեզ ավելի լավ", ctaText: "Շարունակեք ինքնաճանաչումը Vivida-ի անհատականության թեստերով և անձնական քարտեզով:", ctaLink: "Ընտրել թեստ" },
} as const;

function metadataAlternates(
  locale: UserLocale,
  translations: Awaited<ReturnType<typeof getPublishedArticleTranslations>>,
  currentSlug: string,
) {
  const languages: Record<string, string> = {};
  for (const item of translations) {
    const language = item.language as UserLocale;
    const key = language === "ka" ? "ka-GE" : language === "am" ? "hy-AM" : "en";
    languages[key] = articleUrl(language, item.slug);
    if (language === "am") languages.hy = articleUrl(language, item.slug);
  }
  languages["x-default"] = languages.en ?? articleUrl(locale, currentSlug);
  return { canonical: articleUrl(locale, currentSlug), languages };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const article = await getPublishedArticle(locale, slug);
  if (!article) return { title: "Article not found", robots: { index: false, follow: false } };
  const translations = await getPublishedArticleTranslations(article.translationKey);
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  return {
    title,
    description,
    authors: [{ name: article.authorName }],
    alternates: metadataAlternates(locale, translations, article.slug),
    openGraph: {
      type: "article",
      title,
      description,
      url: articleUrl(locale, article.slug),
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.authorName],
      images: [{ url: article.imageUrl, alt: article.imageAlt, width: 1440, height: 810 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [article.imageUrl] },
  };
}

export default async function ArticlePage({ params }: Props) {
  const [{ slug }, locale, session] = await Promise.all([
    params,
    getRequestLocale(),
    auth(),
  ]);
  const article = await getPublishedArticle(locale, slug);
  if (!article) notFound();

  const [translations, related, engagement] = await Promise.all([
    getPublishedArticleTranslations(article.translationKey),
    listRelatedArticles(article),
    getArticleEngagement(article.id, session?.user?.id),
  ]);
  const paths = new Map(translations.map((item) => [item.language, `/articles/${item.slug}`]));
  const headings = articleHeadings(article.content);
  const copy = COPY[locale];
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [article.imageUrl.startsWith("http") ? article.imageUrl : new URL(article.imageUrl, articleUrl(locale)).toString()],
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    inLanguage: locale === "am" ? "hy-AM" : locale === "ka" ? "ka-GE" : "en",
    author: { "@type": "Organization", name: article.authorName },
    publisher: { "@type": "Organization", name: "Vivida", url: articleUrl(locale).replace(/\/articles$/, "") },
    mainEntityOfPage: articleUrl(locale, article.slug),
    articleSection: ARTICLE_CATEGORY_LABELS[locale][article.category as keyof (typeof ARTICLE_CATEGORY_LABELS)[typeof locale]],
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <ReadingProgress />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_32%_at_50%_-4%,oklch(0.30_0.16_305/0.42),transparent_72%)]" />
      <Starfield count={85} shooting={1} />
      <SmartHeader
        active="articles"
        locale={locale}
        georgianPath={paths.get("ka") ?? "/articles"}
        englishPath={paths.get("en") ?? "/articles"}
        armenianPath={paths.get("am") ?? "/articles"}
      />
      <main className="relative z-10 flex-1">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

        <article>
          <header className="mx-auto w-full max-w-5xl px-4 pb-8 pt-10 sm:px-6 sm:pb-12 sm:pt-16">
            <Link href={articlePath(locale)} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="size-4" aria-hidden /> {copy.back}
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm">
              <Link href={`${articlePath(locale)}?category=${article.category}`} className="rounded-full border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/10 px-3 py-1.5 font-semibold text-[var(--vivida-violet)]">
                {ARTICLE_CATEGORY_LABELS[locale][article.category as keyof (typeof ARTICLE_CATEGORY_LABELS)[typeof locale]]}
              </Link>
              <span>{formatArticleDate(article.publishedAt, locale)}</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" aria-hidden />{readingMinutes(article.content)} {copy.min}</span>
            </div>
            <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">{article.title}</h1>
            <p className="mt-6 max-w-3xl text-pretty text-lg leading-relaxed text-foreground/72 sm:text-xl">{article.excerpt}</p>
            <p className="mt-5 text-sm text-muted-foreground">{article.authorName}</p>
          </header>

          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-[0_36px_100px_-50px_oklch(0.65_0.24_305/0.8)] sm:rounded-[2rem]">
              <Image src={article.imageUrl} alt={article.imageAlt} fill priority quality={75} sizes="(max-width: 1200px) 100vw, 1152px" className="object-cover" />
              <div aria-hidden className="absolute inset-0 ring-1 ring-inset ring-white/10" />
            </div>
          </div>

          <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-16">
            <div data-article-body>
              <ArticleMarkdown content={article.content} />
              <p className="mt-12 rounded-2xl border border-border/70 bg-card/45 p-5 text-sm leading-relaxed text-muted-foreground">{copy.note}</p>
            </div>
            {headings.length > 1 && (
              <aside className="order-first lg:order-none">
                <div className="rounded-2xl border border-border/70 bg-card/50 p-5 backdrop-blur-xl lg:sticky lg:top-24">
                  <p className="flex items-center gap-2 text-sm font-semibold"><Compass className="size-4 text-[var(--vivida-cyan)]" aria-hidden />{copy.contents}</p>
                  <nav className="mt-4 space-y-3 text-sm text-muted-foreground" aria-label={copy.contents}>
                    {headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} className={`block leading-snug transition-colors hover:text-foreground ${heading.level === 3 ? "pl-3" : ""}`}>{heading.text}</a>)}
                  </nav>
                </div>
              </aside>
            )}
          </div>
        </article>

        <ArticleEngagement
          articleId={article.id}
          locale={locale}
          initial={engagement}
          isAuthenticated={Boolean(session?.user?.id)}
          loginHref={`/login?next=${encodeURIComponent(`${articlePath(locale, article.slug)}#discussion`)}`}
        />

        <section className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20">
          <div className="overflow-hidden rounded-3xl border border-[var(--vivida-violet)]/30 bg-[radial-gradient(circle_at_15%_10%,oklch(0.65_0.24_305/0.22),transparent_45%),color-mix(in_oklch,var(--card)_70%,transparent)] p-7 sm:p-10">
            <h2 className="text-balance text-2xl font-semibold sm:text-3xl">{copy.cta}</h2>
            <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-foreground/72">{copy.ctaText}</p>
            <Link href={locale === "am" ? "/am/tests" : locale === "en" ? "/tests" : "/tests"} className="mt-6 inline-flex rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-3 text-sm font-semibold text-white">{copy.ctaLink}</Link>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
            <h2 className="mb-7 text-3xl font-semibold tracking-tight">{copy.related}</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {related.map((item) => <ArticleCard key={item.id} article={item} locale={locale} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
