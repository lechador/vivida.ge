import { ArmenianLink as Link } from "@/components/i18n/international-link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportPromo } from "@/components/report/report-promo";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { SIGNS_CONTENT } from "@/lib/seo/zodiac-content";
import { ALL_SLUGS, ZODIAC_DATES, signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { ALL_HOROSCOPE_THEMES, themeUrl, type HoroscopeTheme } from "@/lib/seo/thematic-horoscope";
import { THEME_CONFIG_AM, getThematicHoroscopeAm } from "@/lib/thematic-horoscope-am";
import { signColor } from "@/lib/zodiac";
import { ARMENIAN_SITE_URL, DEFAULT_OG_IMAGE, localizedAlternates } from "@/lib/seo/locales";

export function thematicHubMetadataAm(theme: HoroscopeTheme) {
  const config = THEME_CONFIG_AM[theme];
  const path = `/am${themeUrl(theme)}`;
  const url = `${ARMENIAN_SITE_URL}${themeUrl(theme)}`;
  return {
    title: { absolute: `${config.title} — Vivida` },
    description: config.description,
    alternates: localizedAlternates(path, themeUrl(theme), "am"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "website" as const,
      url,
      title: config.title,
      description: config.description,
      siteName: "Vivida",
      locale: "hy_AM",
    },
    twitter: { card: "summary_large_image" as const, title: config.title, description: config.description },
  };
}

export function thematicDetailMetadataAm(theme: HoroscopeTheme, sign: ZodiacSlug) {
  const config = THEME_CONFIG_AM[theme];
  const content = getThematicHoroscopeAm(theme, sign);
  const meta = signMetaBySlug(sign)!;
  const name = meta.labelAm || meta.labelKa;
  const path = `/am${themeUrl(theme, sign)}`;
  const url = `${ARMENIAN_SITE_URL}${themeUrl(theme, sign)}`;
  const title = `${name} ${config.label}. Բնութագիր և գործնական խորհուրդներ`;
  const description = `${name} ${config.label.toLowerCase()}. Բացահայտիր ուժեղ կողմերը, մարտահրավերները, ռիսկերը և խորհուրդները ${config.shortLabel.toLowerCase()} ոլորտում:`;
  return {
    title: { absolute: `${title} — Vivida` },
    description,
    keywords: [`${name} ${config.label.toLowerCase()}`, `${name} ${config.shortLabel.toLowerCase()}`, content.focus],
    alternates: localizedAlternates(path, themeUrl(theme, sign), "am"),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      type: "article" as const,
      url,
      title,
      description,
      siteName: "Vivida",
      locale: "hy_AM",
    },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}

function themeFaqAm(theme: HoroscopeTheme) {
  const config = THEME_CONFIG_AM[theme];
  return [
    {
      q: `Ի՞նչ է նկարագրում ${config.label.toLowerCase()}ը:`,
      a: `Այն ցույց է տալիս, թե ինչպես է յուրաքանչյուր նշանի բնավորությունն արտահայտվում ${theme === "love" ? "սիրո, մտերմության և հարաբերությունների" : theme === "finance" ? "եկամուտների, ծախսերի և ֆինանսական սովորությունների" : "մոտիվացիայի, աշխատանքային ոճի և մասնագիտական աճի"} մեջ: Սա ընդհանուր ուղեցույց է, ոչ թե անձնական կանխատեսում:`,
    },
    {
      q: "Ո՞ր նշանը պետք է կարդալ:",
      a: "Սկսեք ձեր Արևի նշանից: Ավելի ամբողջական պատկերացման համար ուսումնասիրեք նաև ձեր ասցենդենտը, Լուսինը և ողջ նատալ քարտեզը:",
    },
    {
      q: "Արդյո՞ք սա անհատական կանխատեսում է:",
      a: "Ոչ: Անհատական աստղաբանական վերլուծության համար անհրաժեշտ է ծննդյան ճշգրիտ ամսաթիվ, ժամ, վայր և լիարժեք նատալ քարտեզ:",
    },
  ];
}

function FaqAm({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section className="mt-14 max-w-3xl">
      <h2 className="mb-4 text-2xl font-semibold">Հաճախ տրվող հարցեր</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details key={item.q} className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 open:bg-card/80">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium">
              <span>{item.q}</span>
              <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-45">✦</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80 sm:text-base">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function ThematicHoroscopeHubAm({ theme }: { theme: HoroscopeTheme }) {
  const config = THEME_CONFIG_AM[theme];
  const faq = themeFaqAm(theme);
  const url = `${ARMENIAN_SITE_URL}${themeUrl(theme)}`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: config.title,
      description: config.description,
      url,
      inLanguage: "hy-AM",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: ALL_SLUGS.map((sign, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${signMetaBySlug(sign)!.labelAm || sign} ${config.label}`,
          url: `${ARMENIAN_SITE_URL}${themeUrl(theme, sign)}`,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={110} shooting={2} />
      <SmartHeader locale="am" georgianPath={themeUrl(theme)} />
      {ld.map((item, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <nav className="mb-6 flex gap-2 text-xs text-muted-foreground">
          <Link href="/am/horoscope">Հորոսկոպ</Link>
          <span>/</span>
          <span className="text-foreground/80">{config.label}</span>
        </nav>
        <header className="max-w-3xl">
          <div className="text-4xl" aria-hidden>{config.glyph}</div>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">{config.title}</h1>
          <p className="mt-4 text-pretty text-lg leading-8 text-foreground/80">{config.intro}</p>
        </header>
        <div className="mt-8 flex flex-wrap gap-2">
          {ALL_HOROSCOPE_THEMES.map((item) => (
            <Link
              key={item}
              href={`/am${themeUrl(item)}`}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                item === theme
                  ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/15"
                  : "border-border bg-card/55 text-muted-foreground hover:text-foreground"
              }`}
            >
              {THEME_CONFIG_AM[item].label}
            </Link>
          ))}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_SLUGS.map((sign) => {
            const meta = signMetaBySlug(sign)!;
            const content = getThematicHoroscopeAm(theme, sign);
            const accent = signColor(meta);
            const name = meta.labelAm || meta.labelKa;
            return (
              <Link
                key={sign}
                href={`/am${themeUrl(theme, sign)}`}
                className="group rounded-2xl border border-border bg-card/55 p-5 transition hover:-translate-y-0.5 hover:border-foreground/20"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="grid size-12 place-items-center rounded-xl text-2xl"
                    style={{
                      color: accent,
                      background: `color-mix(in oklch, ${accent} 16%, transparent)`,
                    }}
                  >
                    {SIGNS_CONTENT[sign].symbol}
                  </div>
                  <div>
                    <h2 className="font-semibold">{name} {config.label}</h2>
                    <p className="text-xs text-muted-foreground">{ZODIAC_DATES[sign].rangeAm}</p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-4 text-sm leading-6 text-foreground/78">{content.main[0]}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[var(--vivida-cyan)]">
                  Ամբողջական ուղեցույց <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
        <section className="mt-14 max-w-3xl">
          <h2 className="text-2xl font-semibold">Ինչպե՞ս օգտագործել այս հորոսկոպը</h2>
          <p className="mt-4 text-base leading-8 text-foreground/80">
            Արևի նշանը հիանալի մեկնարկային կետ է, սակայն {config.shortLabel.toLowerCase()}ը հնարավոր չէ ամբողջությամբ հասկանալ միայն մեկ դիրքով: Խորհուրդ ենք տալիս ուսումնասիրել նաև ձեր Լուսինը, ասցենդենտը, մոլորակներն ու տները ամբողջական նատալ քարտեզում:
          </p>
        </section>
        <FaqAm items={faq} />
        <div className="mt-14 rounded-3xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 p-7 text-center">
          <Sparkles className="mx-auto size-6 text-[var(--vivida-cyan)]" />
          <h2 className="mt-3 text-2xl font-semibold">Բացահայտիր քո ամբողջական աստղաբանական պրոֆիլը</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-foreground/75">
            Արևի նշանը միայն սկիզբն է: Նատալ քարտեզը ներառում է ծննդյան ժամը, վայրը, բոլոր մոլորակները, տներն ու ասպեկտները:
          </p>
          <Button asChild variant="mystic" className="mt-5">
            <Link href="/am/natal-chart">Հաշվարկել ծննդյան քարտեզը</Link>
          </Button>
        </div>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

export function ThematicHoroscopeDetailAm({
  theme,
  sign,
}: {
  theme: HoroscopeTheme;
  sign: ZodiacSlug;
}) {
  const config = THEME_CONFIG_AM[theme];
  const content = getThematicHoroscopeAm(theme, sign);
  const meta = signMetaBySlug(sign)!;
  const name = meta.labelAm || meta.labelKa;
  const accent = signColor(meta);
  const faq = [
    {
      q: `Ինչպիսի՞ն է ${name}ը ${theme === "love" ? "սիրո մեջ" : theme === "finance" ? "ֆինանսական հարցերում" : "կարիերայում"}:`,
      a: content.main[0],
    },
    {
      q: `Ո՞րն է ${name}ի գլխավոր ուժեղ կողմը:`,
      a: content.focus,
    },
    {
      q: `Ինչի՞ց պետք է զգուշանա ${name}ը:`,
      a: content.watch,
    },
  ];
  const url = `${ARMENIAN_SITE_URL}${themeUrl(theme, sign)}`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${name} ${config.label}. Բնութագիր և խորհուրդներ`,
      description: content.focus,
      inLanguage: "hy-AM",
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      author: { "@type": "Organization", name: "Vivida" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={90} shooting={1} />
      <SmartHeader locale="am" georgianPath={themeUrl(theme, sign)} />
      {ld.map((item, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
      <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <nav className="text-xs text-muted-foreground">
          <Link href={`/am${themeUrl(theme)}`}>{config.label}</Link> / {name}
        </nav>
        <header className="mt-6 rounded-3xl border border-border bg-card/60 p-6 sm:p-9">
          <div className="flex items-start gap-4">
            <div
              className="grid size-16 place-items-center rounded-2xl text-4xl"
              style={{
                color: accent,
                background: `color-mix(in oklch, ${accent} 16%, transparent)`,
              }}
            >
              {SIGNS_CONTENT[sign].symbol}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{ZODIAC_DATES[sign].rangeAm}</p>
              <h1 className="mt-1 text-balance text-3xl font-semibold sm:text-4xl">
                {name} {config.label}
              </h1>
            </div>
          </div>
          <p className="mt-5 text-lg leading-8 text-foreground/82">{content.focus}</p>
        </header>
        <section className="mt-10 space-y-4 text-base leading-8 text-foreground/82">
          {content.main.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-[var(--vivida-pink)]/25 bg-[var(--vivida-pink)]/8 p-5">
            <h2 className="font-semibold">Ինչի՞ց զգուշանալ</h2>
            <p className="mt-2 text-sm leading-7 text-foreground/78">{content.watch}</p>
          </section>
          <section className="rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/8 p-5">
            <h2 className="font-semibold">Գործնական խորհուրդներ</h2>
            <p className="mt-2 text-sm leading-7 text-foreground/78">{content.advice}</p>
          </section>
        </div>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Այլ հորոսկոպներ {name}ի համար</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {ALL_HOROSCOPE_THEMES.filter((item) => item !== theme).map((item) => (
              <Link
                key={item}
                href={`/am${themeUrl(item, sign)}`}
                className="rounded-full border border-border bg-card/55 px-4 py-2 text-sm hover:bg-card/80"
              >
                {THEME_CONFIG_AM[item].label}
              </Link>
            ))}
            <Link href={`/am/zodiac/${sign}`} className="rounded-full border border-border bg-card/55 px-4 py-2 text-sm">
              {name}ի ամբողջական ուղեցույց
            </Link>
          </div>
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Մյուս նշանները</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {ALL_SLUGS.filter((item) => item !== sign).map((item) => (
              <Link
                key={item}
                href={`/am${themeUrl(theme, item)}`}
                className="rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm"
              >
                {SIGNS_CONTENT[item].symbol} {signMetaBySlug(item)!.labelAm || signMetaBySlug(item)!.labelKa}
              </Link>
            ))}
          </div>
        </section>
        <FaqAm items={faq} />
        <ReportPromo className="mt-14" />
      </article>
      <SiteFooter locale="am" />
    </main>
  );
}
