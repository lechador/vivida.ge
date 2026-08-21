import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { Sparkles } from "lucide-react";

import { Starfield } from "@/components/landing/starfield";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Button } from "@/components/ui/button";
import {
  ALL_ELEMENT_SLUGS,
  SIGNS_BY_ELEMENT,
  signMetaBySlug,
  type ElementSlug,
} from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { ARMENIAN_SITE_URL, armenianSiteHref } from "@/lib/seo/locales";
import { signColor } from "@/lib/zodiac";
import {
  ELEMENT_NAME_AM,
  ELEMENT_SHORT_NAME_AM,
  elementArmenian,
  ZODIAC_PLACEMENTS_AM,
} from "@/lib/zodiac-placements-am";

const PATH = "/zodiac/elementebi";
const ACCENT: Record<ElementSlug, string> = {
  fire: "oklch(0.72 0.22 30)",
  earth: "oklch(0.65 0.13 130)",
  air: "oklch(0.78 0.16 220)",
  water: "oklch(0.65 0.20 285)",
};
const GLYPH: Record<ElementSlug, string> = {
  fire: "△",
  earth: "▽",
  air: "△",
  water: "▽",
};
const BLURB_KEY: Record<
  ElementSlug,
  "fireBlurb" | "earthBlurb" | "airBlurb" | "waterBlurb"
> = {
  fire: "fireBlurb",
  earth: "earthBlurb",
  air: "airBlurb",
  water: "waterBlurb",
};

function paragraphs(value: string) {
  return value
    .split("\n\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ZodiacElementsHubAm() {
  const content = ZODIAC_PLACEMENTS_AM.elementsHub;
  const url = `${ARMENIAN_SITE_URL}${PATH}`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: content.pageTitle,
      description: content.metaDescription,
      url,
      inLanguage: "hy-AM",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: ALL_ELEMENT_SLUGS.map((element, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${url}/${element}`,
          name: ELEMENT_NAME_AM[element],
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
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
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="am" georgianPath={PATH} />
      {structuredData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am/zodiac">Կենդանակերպի նշաններ</Link>
          <span>/</span>
          <span className="text-foreground/80">Տարրեր</span>
        </nav>
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Կենդանակերպի տարրերը
        </div>
        <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
          {content.h1}
        </h1>
        <p className="max-w-2xl text-pretty text-lg text-muted-foreground">
          {content.tagline}
        </p>
        <div className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(content.intro).map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {ALL_ELEMENT_SLUGS.map((element) => (
            <Link
              key={element}
              href={`/am${PATH}/${element}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:bg-card/80"
            >
              <div
                aria-hidden
                className="absolute -right-16 -top-16 size-48 rounded-full opacity-30 blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${ACCENT[element]} 0%, transparent 70%)`,
                }}
              />
              <div className="relative flex items-center gap-3">
                <span
                  className="grid size-10 place-items-center rounded-xl text-xl"
                  style={{
                    color: ACCENT[element],
                    background: `color-mix(in oklch, ${ACCENT[element]} 18%, transparent)`,
                  }}
                >
                  {GLYPH[element]}
                </span>
                <h2 className="text-xl font-semibold sm:text-2xl">
                  {ELEMENT_NAME_AM[element]}
                </h2>
              </div>
              <p className="relative mt-4 text-sm leading-relaxed text-foreground/85 sm:text-base">
                {content[BLURB_KEY[element]]}
              </p>
              <div className="relative mt-4 flex flex-wrap gap-2">
                {SIGNS_BY_ELEMENT[element].map((sign) => {
                  const meta = signMetaBySlug(sign)!;
                  return (
                    <span
                      key={sign}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-2.5 py-1 text-xs"
                    >
                      <span style={{ color: signColor(meta) }}>
                        {SIGNS_CONTENT[sign].symbol}
                      </span>
                      {meta.labelAm}
                    </span>
                  );
                })}
              </div>
            </Link>
          ))}
        </div>

        <Faq items={content.faq} />
        <div className="mt-16 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Տեսեք ձեր տարրերի հավասարակշռությունը
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Ամբողջական նատալ քարտեզը ցույց է տալիս, թե ձեր մոլորակային դիրքերում
            որքան Կրակ, Հող, Օդ և Ջուր կա։
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/am/natal-chart">Հաշվարկել նատալ քարտեզը</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

export function ZodiacElementPageAm({ element }: { element: ElementSlug }) {
  const content = elementArmenian(element);
  const accent = ACCENT[element];
  const path = `${PATH}/${element}`;
  const url = armenianSiteHref(path, false);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: content.title,
      description: content.description,
      inLanguage: "hy-AM",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "Vivida" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
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
      <Starfield count={130} shooting={3} />
      <SmartHeader locale="am" georgianPath={path} />
      {structuredData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/am/zodiac">Կենդանակերպի նշաններ</Link>
          <span>/</span>
          <Link href={`/am${PATH}`}>Տարրեր</Link>
          <span>/</span>
          <span className="text-foreground/80">
            {ELEMENT_SHORT_NAME_AM[element]}
          </span>
        </nav>
        <article className="relative overflow-hidden rounded-3xl border border-border bg-card/65 p-6 ring-1 ring-foreground/5 sm:p-10">
          <div
            aria-hidden
            className="absolute -right-20 -top-20 size-72 rounded-full opacity-30 blur-3xl"
            style={{
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
            }}
          />
          <div className="relative flex items-center gap-5">
            <div
              className="grid size-20 shrink-0 place-items-center rounded-3xl text-4xl"
              style={{
                color: accent,
                background: `color-mix(in oklch, ${accent} 18%, transparent)`,
              }}
            >
              {GLYPH[element]}
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Կենդանակերպի տարր
              </div>
              <h1 className="mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">
                {content.name}
              </h1>
              <p className="mt-2 text-foreground/85 sm:text-lg">
                {content.tagline}
              </p>
            </div>
          </div>
          <div className="relative mt-6 flex flex-wrap gap-2">
            {SIGNS_BY_ELEMENT[element].map((sign) => {
              const meta = signMetaBySlug(sign)!;
              return (
                <Link
                  key={sign}
                  href={`/am/zodiac/${sign}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
                >
                  <span style={{ color: signColor(meta) }}>
                    {SIGNS_CONTENT[sign].symbol}
                  </span>
                  {meta.labelAm}
                </Link>
              );
            })}
          </div>
        </article>
        <div className="mt-12 max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-foreground/90 sm:text-lg">
          {paragraphs(content.intro).map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        <TextSection
          title={`${content.name}՝ բնավորությունը`}
          body={content.personality}
        />
        <section className="mt-12 grid gap-6 sm:grid-cols-2">
          <List
            title="Ուժեղ կողմեր"
            items={content.strengths}
            accent={accent}
          />
          <List
            title="Աճի ուղղություններ"
            items={content.challenges}
            accent="var(--muted-foreground)"
          />
        </section>
        <TextSection title="Սիրո մեջ" body={content.love} />
        <TextSection title="Աշխատանքում" body={content.career} />
        <TextSection
          title="Համատեղելիությունն այլ տարրերի հետ"
          body={content.compatibility}
        />
        <Faq items={content.faq} />
        <section className="mt-14">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Մյուս տարրերը
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_ELEMENT_SLUGS.filter((item) => item !== element).map(
              (item) => (
                <Link
                  key={item}
                  href={`/am${PATH}/${item}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm hover:bg-card/80"
                >
                  <span style={{ color: ACCENT[item] }}>{GLYPH[item]}</span>
                  {ELEMENT_NAME_AM[item]}
                </Link>
              ),
            )}
          </div>
        </section>
        <div className="mt-14 rounded-2xl border border-[var(--vivida-violet)]/30 bg-gradient-to-br from-[var(--vivida-violet)]/12 via-card/60 to-[var(--vivida-cyan)]/12 p-7 text-center ring-1 ring-foreground/5 sm:p-10">
          <Sparkles className="mx-auto mb-3 size-7 text-[var(--vivida-violet)]" />
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Ձեր քարտեզը բոլոր չորս տարրերի համադրությունն է
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Հաշվարկեք բոլոր մոլորակային դիրքերը՝ ձեր տարրային ամբողջական
            հավասարակշռությունը հասկանալու համար։
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-6">
            <Link href="/am/natal-chart">Հաշվարկել նատալ քարտեզը</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

function TextSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="space-y-4 text-pretty text-base leading-relaxed text-foreground/90">
        {paragraphs(body).map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}

function List({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span style={{ color: accent }}>✦</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function Faq({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <section className="mt-16 max-w-3xl">
      <h2 className="mb-5 text-2xl font-semibold tracking-tight sm:text-3xl">
        Հաճախ տրվող հարցեր
      </h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 open:bg-card/80 sm:p-5"
          >
            <summary className="flex cursor-pointer list-none justify-between gap-4 font-medium">
              <span>{item.q}</span>
              <span
                aria-hidden
                className="text-muted-foreground transition-transform group-open:rotate-45"
              >
                ✦
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
