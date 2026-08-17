import Link from "next/link";
import { Calendar, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import {
  ALL_SLUGS,
  ZODIAC_DATES,
  signMetaBySlug,
} from "@/lib/seo/zodiac-dates";
import { ZODIAC_SIGN_AM } from "@/lib/zodiac-sign-am";
import { signColor } from "@/lib/zodiac";
import { breadcrumbLd } from "@/lib/seo/jsonld";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

const ELEMENT_AM: Record<string, string> = {
  ცეცხლი: "Կրակ",
  მიწա: "Հող",
  ჰაერი: "Օդ",
  წყალი: "Ջուր",
};
const MODALITY_AM: Record<string, string> = {
  კარდინალური: "Կարդինալ",
  ფიქსირებული: "Ֆիքսված",
  მუტაბელური: "Փոփոխական",
};
const RULER_AM: Record<string, string> = {
  მზე: "Արև",
  მთვარე: "Լուսին",
  მერկური: "Մերկուրի",
  ვენერա: "Վեներա",
  მარსი: "Մարս",
  იუპիտერი: "Յուպիտեր",
  სატურნი: "Սատուրն",
  ურანი: "Ուրան",
  ნეპտუნი: "Նեպտուն",
  პլუტონი: "Պլուտոն",
};

const FAQ = [
  {
    q: "Որո՞նք են կենդանակերպի 12 նշանները:",
    a: "Արևադարձային կենդանակերպը բաժանում է Արևի տարեկան ուղին 12 նշանների՝ Խոյ, Ցուլ, Երկվորյակներ, Խեցգետին, Առյուծ, Կույս, Կշեռք, Կարիճ, Աղեղնավոր, Այծեղջյուր, Ջրհոս և Ձկներ:",
  },
  {
    q: "Իմ կենդանակերպի նշանը նույնն է, ինչ իմ Արևի նշա՞նը:",
    a: "Սովորաբար, այո: Երբ մարդիկ հարցնում են ձեր կենդանակերպի նշանը, նրանք ի նկատի ունեն Արևի դիրքը ձեր ծննդյան օրը: Ամբողջական քարտեզը ներառում է նաև Լուսինը, Ասցենդենտը, մյուս մոլորակներն ու տները:",
  },
  {
    q: "Ինչո՞ւ կարող են կենդանակերպի ամսաթվերը մեկ օրով տարբերվել:",
    a: "Արևի նշան մուտք գործելու ճշգրիտ պահը տարեցտարի մի փոքր շեղվում է՝ կախված նաև ժամային գոտուց: Եթե ծնվել եք սահմանագծին, հաշվարկեք ձեր նատալ քարտեզը ճշգրիտ արդյունքի համար:",
  },
];

export function ZodiacHubAm() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Կենդանակերպի 12 նշանները — Vivida",
      url: `${ARMENIAN_SITE_URL}/zodiac`,
      description:
        "Բացահայտեք կենդանակերպի բոլոր 12 նշանները, դրանց տարերքները, որակներն ու կառավարող մոլորակները:",
      inLanguage: "hy",
    },
    breadcrumbLd([
      { name: "Գլխավոր", url: ARMENIAN_SITE_URL },
      { name: "Կենդանակերպ", url: `${ARMENIAN_SITE_URL}/zodiac` },
    ]),
  ];

  return (
    <main
      lang="hy"
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%),radial-gradient(40%_30%_at_15%_70%,oklch(0.34_0.16_350/0.4),transparent_70%)]"
      />
      <Starfield count={150} shooting={3} />
      <SmartHeader locale="am" georgianPath="/zodiac" />
      {ld.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5 text-[var(--vivida-violet)]" /> 12
            աստղակերպեր
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Կենդանակերպի{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              12 նշանները
            </span>
          </h1>
          <p className="mt-4 text-pretty text-base text-foreground/80 sm:text-xl">
            Բացահայտեք յուրաքանչյուր նշանի բնավորությունը, տարերքը, կառավարող
            մոլորակը, ուժեղ կողմերն ու սիրային համատեղելիությունը:
          </p>
        </header>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_SLUGS.map((slug) => {
            const meta = signMetaBySlug(slug);
            if (!meta) return null;
            const dates = ZODIAC_DATES[slug];
            const profile = ZODIAC_SIGN_AM[slug];
            const color = signColor(meta);
            const element = ELEMENT_AM[meta.element] ?? meta.element;
            const modality = MODALITY_AM[meta.modality] ?? meta.modality;
            const ruler = RULER_AM[meta.ruler] ?? meta.ruler;

            return (
              <article
                key={slug}
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card/55 p-6 ring-1 ring-foreground/5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[var(--vivida-violet)]/45 hover:bg-card/75"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span
                      style={{ color }}
                      className="text-4xl transition-transform group-hover:scale-110"
                    >
                      {meta.symbol}
                    </span>
                    <span className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
                      {dates.rangeAm}
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-semibold text-foreground">
                    {meta.labelAm}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {element} · {modality} · Կառավարիչ՝ {ruler}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                    {profile?.tagline}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-1.5">
                  {profile?.strengths.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="rounded-lg border border-border/50 bg-card/40 px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <section className="mt-20 rounded-3xl border border-border bg-card/40 p-8 ring-1 ring-foreground/5 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Հաճախակի տրվող հարցեր
          </h2>
          <div className="mt-6 space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border/60 bg-card/60 p-4 open:bg-card/80"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  <span>{item.q}</span>
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">
                    ✦
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-foreground/80 sm:text-base">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <PopularSearches
          locale="am"
          queries={[
            "կենդանակերպի նշաններ",
            "խոյ նշան",
            "ցուլ նշան",
            "երկվորյակներ",
            "խեցգետին նշան",
            "առյուծ նշան",
            "կույս նշան",
            "կշեռք նշան",
            "կարիճ նշան",
            "աղեղնավոր նշան",
            "այծեղջյուր նշան",
            "ջրհոս նշան",
            "ձկներ նշան",
          ]}
        />
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}
