import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Brain,
  Clock,
  Fingerprint,
  HeartHandshake,
  Layers,
  Sparkles,
} from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SmartHeader } from "@/components/smart-header";
import { SiteFooter } from "@/components/site-footer";
import { TESTS, type TestCatalogEntry } from "@/lib/tests-catalog";
import { localeHref } from "@/lib/i18n/armenian-routes";
import {
  DEFAULT_OG_IMAGE,
  ARMENIAN_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";

const PATH = "/am/tests";
const TITLE = "Անվճար անհատականության, IQ և էմոցիոնալ ինտելեկտի թեստեր";
const DESCRIPTION =
  "Անցեք Vivida-ի IQ, EQ, Big Five և Astro-MBTI թեստերը կամ փորձեք արագ կենդանակերպի քվիզները: Հստակ արդյունքներ և մանրամասն բացատրություններ հայերենով:";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — Vivida` },
  description: DESCRIPTION,
  keywords: [
    "անվճար անհատականության թեստ",
    "օնլայն IQ թեստ",
    "էմոցիոնալ ինտելեկտի թեստ",
    "Big Five թեստ",
    "MBTI թեստ հայերեն",
    "կենդանակերպի քվիզ",
  ],
  alternates: localizedAlternates(PATH, "/tests", "am"),
  openGraph: {
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: `${ARMENIAN_SITE_URL}/tests`,
    locale: "hy_AM",
    alternateLocale: ["ka_GE", "en_US"],
  },
};

const THEME: Record<string, { Icon: LucideIcon; accent: string }> = {
  iq: { Icon: Brain, accent: "var(--vivida-cyan)" },
  eq: { Icon: HeartHandshake, accent: "var(--vivida-pink)" },
  "big-five": { Icon: Layers, accent: "var(--vivida-violet)" },
  "astro-mbti": { Icon: Fingerprint, accent: "var(--vivida-violet)" },
  "true-sign": { Icon: Sparkles, accent: "var(--vivida-cyan)" },
  "famous-zodiac": { Icon: Sparkles, accent: "var(--vivida-pink)" },
};

const FAQ = [
  {
    q: "Ո՞րն է տարբերությունը թեստի և քվիզի միջև:",
    a: "Vivida-ի հիմնական թեստերը տալիս են կառուցվածքային արդյունք, ինչպիսիք են IQ միավորը կամ անհատականության պրոֆիլը: Կենդանակերպի քվիզներն ավելի կարճ և զվարճալի խաղեր են:",
  },
  {
    q: "Արդյո՞ք թեստերն անվճար են:",
    a: "Այո, դուք կարող եք անցնել յուրաքանչյուր թեստ և ստանալ ձեր հիմնական արդյունքներն անվճար:",
  },
  {
    q: "Ո՞ր թեստից սկսել:",
    a: "Ընտրեք Astro-MBTI-ն՝ ձեր հոգեբանական տիպը բացահայտելու համար, Big Five-ը՝ գիտական անհատականության պրոֆիլի համար, EQ-ն՝ հուզական հմտությունների համար, կամ IQ-ն՝ տրամաբանության համար:",
  },
  {
    q: "Արդյո՞ք սրանք կլինիկական ախտորոշումներ են:",
    a: "Ոչ: Օնլայն թեստերի արդյունքները նախատեսված են ինքնաճանաչման և հետաքրքրության համար:",
  },
];

export default function ArmenianTestsPage() {
  const url = `${ARMENIAN_SITE_URL}/tests`;
  const ld = [
    articleLd({ url, headline: TITLE, description: DESCRIPTION }),
    breadcrumbLd([
      { name: "Գլխավոր", url: ARMENIAN_SITE_URL },
      { name: "Թեստեր", url },
    ]),
    faqLd(FAQ),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Vivida թեստեր և քվիզներ",
      itemListElement: TESTS.filter((test) => test.available).map(
        (test, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: test.titleAm,
          url: `${ARMENIAN_SITE_URL}${test.href}`,
        }),
      ),
    },
  ];

  return (
    <main
      lang="hy"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <SmartHeader active="tests" locale="am" georgianPath="/tests" />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="mb-10 text-center">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Թեստեր և քվիզներ
          </div>
          <h1 className="mt-2 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Բացահայտեք ավելին ձեր{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              մտածողության և հույզերի մասին
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base">
            Ինտելեկտի, անհատականության և հուզական սովորությունների խորքային
            թեստեր՝ ամբողջությամբ հայերենով:
          </p>
        </header>

        <TestSection
          eyebrow="Սկսեք այստեղից"
          title="Հիմնական թեստեր"
          tests={TESTS.filter((test) => test.kind === "featured")}
        />

        <div className="mt-10">
          <TestSection
            eyebrow="Արագ և զվարճալի"
            title="Կենդանակերպի քվիզներ"
            tests={TESTS.filter((test) => test.kind === "quiz")}
          />
        </div>

        <section className="mt-12">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Հաճախակի տրվող հարցեր
          </h2>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </section>

      <SiteFooter locale="am" />
    </main>
  );
}

function TestSection({
  eyebrow,
  title,
  tests,
}: {
  eyebrow: string;
  title: string;
  tests: TestCatalogEntry[];
}) {
  return (
    <section>
      <div className="mb-4">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tests.map((test) => {
          const { Icon, accent } = THEME[test.slug] ?? THEME.iq;
          return (
            <article
              key={test.slug}
              className="flex flex-col rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:border-foreground/20"
              style={{
                borderTopColor: `color-mix(in oklch, ${accent} 45%, transparent)`,
              }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-2xl"
                  style={{
                    background: `color-mix(in oklch, ${accent} 15%, transparent)`,
                    color: accent,
                  }}
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {test.titleAm}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {test.taglineAm}
                  </p>
                </div>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-foreground/85">
                {test.descAm}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {test.metaAm}
              </div>
              <Link
                href={localeHref(test.href, "am")}
                className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[linear-gradient(135deg,var(--vivida-violet),var(--vivida-pink))] px-4 py-2.5 text-sm font-semibold text-white"
              >
                {test.kind === "quiz" ? "Սկսել քվիզը" : "Սկսել թեստը"}
                <ArrowRight className="size-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
