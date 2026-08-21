import { ArmenianLink as Link } from "@/components/i18n/international-link";

import { PublicNatalCalculator } from "@/components/calculator/public-natal-calculator";
import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

const SITE_URL = ARMENIAN_SITE_URL;
const PAGE_URL = `${SITE_URL}/natal-chart`;

const FAQ = [
  {
    q: "Ի՞նչ է նատալ քարտեզը:",
    a: "Նատալ կամ ծննդյան քարտեզը ֆիքսում է երկնքի դիրքը ձեր ծննդյան ճշգրիտ պահին: Այն ցույց է տալիս յուրաքանչյուր մոլորակի կենդանակերպի նշանը, տունը և հիմնական կապերը մյուս մոլորակների հետ:",
  },
  {
    q: "Արդյո՞ք նատալ քարտեզի հաշվիչն անվճար է:",
    a: "Այո: Մուտքագրեք ձեր ծննդյան ամսաթիվը, ժամը և քաղաքը՝ անվճար և առանց գրանցման ձեր տվյալները հաշվարկելու համար:",
  },
  {
    q: "Պարտադի՞ր է իմանալ ծննդյան ճշգրիտ ժամը:",
    a: "Մոլորակների մեծ մասը կարելի է հաշվարկել առանց ճշգրիտ ժամի: Բայց ձեր Ասցենդենտը և 12 տները փոխվում են օրվա ընթացքում, ուստի ճշգրիտ ժամը քարտեզը դարձնում է առավել ճշգրիտ:",
  },
  {
    q: "Ի՞նչ տեղեկատվություն է անհրաժեշտ:",
    a: "Ձեզ անհրաժեշտ է ծննդյան ամսաթիվը, ժամը (եթե հայտնի է) և ծննդավայր քաղաքը: Vivida-ն ավտոմատ որոշում է կոորդինատներն ու ժամային գոտին:",
  },
];

export function NatalChartPageAm() {
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Անվճար նատալ քարտեզի հաշվիչ — Vivida",
      url: PAGE_URL,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Web",
      inLanguage: "hy",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: "Vivida", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Գլխավոր", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Նատալ քարտեզ",
          item: PAGE_URL,
        },
      ],
    },
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
      <SmartHeader locale="am" georgianPath="/nataluri-ruka" />
      {ld.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-12">
        <header className="text-center">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Անվճար{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              նատալ քարտեզի
            </span>{" "}
            հաշվիչ
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-foreground/80 sm:text-lg">
            Մուտքագրեք ձեր ծննդյան ամսաթիվը, ժամը և վայրը՝ հաշվարկելու ձեր
            մոլորակները, Ասցենդենտը, 12 տները և հիմնական ասպեկտները:
          </p>
        </header>

        <div className="mt-8">
          <PublicNatalCalculator locale="am" />
        </div>

        <article className="mt-16 space-y-10">
          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ի՞նչ է նատալ քարտեզը
            </h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-foreground/85 sm:text-lg">
              Նատալ քարտեզը երկնքի ճշգրիտ պատկերն է ձեր ծննդյան պահին: Այն
              տեղադրում է Արևը, Լուսինը, մոլորակները և զգայուն կետերը
              կենդանակերպի 12 նշանների և 12 աստղաբանական տների մեջ: Այս բոլոր
              շերտերը միասին նկարագրում են խառնվածքը, հուզական օրինաչափությունները
              և կյանքի գլխավոր առաջնահերթությունները:
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ինչպե՞ս կարդալ ձեր քարտեզը
            </h2>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-foreground/85">
              <li>
                <strong className="text-foreground">Մոլորակները</strong> ցույց
                են տալիս, թե ինչն է գործում՝ ինքնություն, էմոցիաներ, միտք, սեր,
                կիրք, աճ և պատասխանատվություն:
              </li>
              <li>
                <strong className="text-foreground">Նշանները</strong> նկարագրում
                են, թե ինչպես է յուրաքանչյուր մոլորակ արտահայտվում:
              </li>
              <li>
                <strong className="text-foreground">Տները</strong> ցույց են
                տալիս կյանքի այն ոլորտները, որտեղ այդ էներգիան առավել ակտիվ է:
              </li>
              <li>
                <strong className="text-foreground">Ասպեկտները</strong> ցույց են
                տալիս, թե ինչպես են մոլորակները փոխազդում միմյանց հետ:
              </li>
            </ul>
            <p className="mt-4 text-pretty leading-relaxed text-foreground/85">
              Հաշվիչը տալիս է ձեզ տեղակայման ամբողջական տվյալները:
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ինչո՞ւ է կարևոր ծննդյան ժամը
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
              Ձեր ծագող նշանը (Ասցենդենտը) և տները կախված են ծննդյան պահին
              տեղական հորիզոնից և արագ փոխվում են: Եթե չգիտեք ձեր ճշգրիտ ժամը,
              Vivida-ն կարող է հաշվարկել մոլորակների մեծ մասի դիրքերը, բայց
              տների դիրքերը պետք է դիտարկել որպես մոտավոր:
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Հաճախակի տրվող հարցեր
            </h2>
            <div className="mt-5 space-y-3">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-2xl border border-border bg-card/55 p-4 ring-1 ring-foreground/5 backdrop-blur-xl open:bg-card/80 sm:p-5"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium">
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

          <section className="flex flex-wrap gap-2">
            {[
              { href: "/am/zodiac", label: "Կենդանակերպի նշաններ" },
              { href: "/am/compatibility", label: "Համատեղելիություն" },
              { href: "/am/horoscope", label: "Հորոսկոպ" },
              { href: "/am/tests", label: "Թեստեր" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center rounded-full border border-border bg-card/55 px-3 py-1.5 text-sm transition-colors hover:bg-card/80"
              >
                {item.label}
              </Link>
            ))}
          </section>
        </article>

        <PopularSearches
          locale="am"
          queries={[
            "անվճար նատալ քարտեզ",
            "ծննդյան քարտեզի հաշվիչ",
            "աստղաբանական քարտեզ",
            "ասցենդենտի հաշվարկ",
            "նատալ քարտեզի տներ",
          ]}
        />
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}
