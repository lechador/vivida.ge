import Link from "next/link";
import { ExternalLink, Moon, Sun } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { formatAmDate } from "@/lib/i18n/am-date";
import { ECLIPSES_AM, type ArmenianEclipse } from "@/lib/seo/eclipse-am";
import { articleLd, breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";
import { moonEvents, type MoonEvent, type MoonEventKind } from "@/lib/seo/moon-events";
import { signByIndex } from "@/lib/zodiac";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

const SITE = ARMENIAN_SITE_URL;

const CFG = {
  full: {
    title: "Լիալուսին",
    slug: "savse-mtvare",
    symbol: "🌕",
    description:
      "Լիալուսնի ամսաթվերը, ճշգրիտ ժամերը, կենդանակերպի նշանները, լուսավորվածության տվյալներն ու աստղագիտական խորհուրդները:",
  },
  new: {
    title: "Նորալուսին",
    slug: "akhali-mtvare",
    symbol: "🌑",
    description:
      "Նորալուսնի ամսաթվերը, ճշգրիտ ժամերը, կենդանակերպի նշանները, լուսավորվածության տվյալներն ու նոր փուլի սկզբի խորհուրդները:",
  },
} as const;

export const MOON_PHASE_META_AM = {
  full: {
    title: "Լիալուսնի օրացույց. ամսաթվեր, ժամեր և կենդանակերպի նշաններ",
    description: CFG.full.description,
  },
  new: {
    title: "Նորալուսնի օրացույց. ամսաթվեր, ժամեր և կենդանակերպի նշաններ",
    description: CFG.new.description,
  },
} as const;

export const ECLIPSE_META_AM = {
  title: "Արեգակի և Լուսնի խավարումներ. 2026–2028 թթ. օրացույց",
  description:
    "Արեգակի և Լուսնի խավարումների ամսաթվերը, տեսակները, տեսանելիության գոտիները և դիտման ուղեցույցը 2026-ից 2028 թվականների համար:",
};

function getSignAm(signIndex: number): string {
  return signByIndex(signIndex).labelAm;
}

function eventDate(event: MoonEvent) {
  return formatAmDate(event.date);
}

function eventTime(event: MoonEvent) {
  return `${new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Tbilisi",
    timeZoneName: "short",
  }).format(event.date)}`;
}

function eventMeaning(event: MoonEvent) {
  const signAm = getSignAm(event.snapshot.signIndex);
  return event.kind === "full"
    ? `Լիալուսինը ${signAm} նշանում խորհրդանշորեն ընդգծում է գագաթնակետը, արդյունքների տեսանելիությունը և հուզական հստակությունը: Աստղագիտորեն Լուսնի սկավառակը գրեթե ամբողջությամբ լուսավորված է:`
    : `Նորալուսինը ${signAm} նշանում խորհրդանշում է նոր մտադրություններ և նոր ցիկլի սկիզբ: Աստղագիտորեն Լուսինը գտնվում է Արեգակի մոտ և նրա լուսավոր կողմը ուղղված է Երկրից հակառակ:`;
}

export function MoonPhaseHubAm({ kind }: { kind: MoonEventKind }) {
  const cfg = CFG[kind];
  const events = moonEvents(kind).slice(0, 15);
  const meta = MOON_PHASE_META_AM[kind];
  const url = `${SITE}/${cfg.slug}`;

  const faq = [
    {
      q: `Ե՞րբ է հաջորդ ${cfg.title}ը:`,
      a: events[0]
        ? `Հաջորդ ${cfg.title}ը կլինի ${eventDate(events[0])}-ին, մոտավորապես ժամը ${eventTime(
            events[0]
          )}-ին:`
        : "Օրացույցը կթարմացվի ավտոմատ:",
    },
    {
      q: `Որքա՞ն է տևում ${cfg.title}ը:`,
      a: `Ճշգրիտ աստղագիտական փուլը մեկ կոնկրետ պահ է, սակայն Լուսինը գրեթե անփոփոխ է երևում մոտ երկու-երեք գիշեր:`,
    },
    {
      q: "Արդյո՞ք փուլը տեղի է ունենում նույն օրը ամենուր:",
      a: "Ճշգրիտ աստղագիտական ակնթարթը նույնն է ամբողջ աշխարհում, սակայն տեղական օրացուցային ամսաթիվը կարող է տարբերվել ըստ ժամային գոտիների:",
    },
  ];

  const ld = [
    articleLd({
      url,
      headline: meta.title,
      description: meta.description,
      datePublished: "2026-08-13T00:00:00+04:00",
      dateModified: new Date().toISOString(),
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: SITE },
      { name: cfg.title, url },
    ]),
    faqLd(faq),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: events.map((event, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${cfg.title} — ${eventDate(event)}`,
        url: `${url}/${event.iso}`,
      })),
    },
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={110} shooting={2} />
      <SmartHeader locale="am" georgianPath={`/${cfg.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <header className="max-w-3xl">
          <div className="text-5xl">{cfg.symbol}</div>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{cfg.title}ի օրացույց</h1>
          <p className="mt-4 text-lg leading-8 text-foreground/80">{cfg.description}</p>
        </header>

        <nav className="mt-7 flex flex-wrap gap-2">
          {[
            ["/am/savse-mtvare", "Լիալուսին"],
            ["/am/akhali-mtvare", "Նորալուսին"],
            ["/am/dabnelebebi", "Խավարումներ"],
            ["/am/mtvaris-kalendari", "Լուսնային օրացույց"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-full border px-4 py-2 text-sm ${
                href === `/am/${cfg.slug}`
                  ? "border-[var(--vivida-violet)]/50 bg-[var(--vivida-violet)]/12"
                  : "border-border bg-card/55"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {events[0] && (
          <section className="mt-10 rounded-3xl border border-[var(--vivida-violet)]/30 bg-[var(--vivida-violet)]/10 p-7 sm:p-9">
            <p className="text-sm text-[var(--vivida-cyan)]">Հաջորդ {cfg.title}ը</p>
            <h2 className="mt-2 text-3xl font-semibold">{eventDate(events[0])}</h2>
            <p className="mt-2">
              {eventTime(events[0])} · {events[0].snapshot.signSymbol}{" "}
              {getSignAm(events[0].snapshot.signIndex)}
            </p>
            <p className="mt-4 max-w-2xl leading-7 text-foreground/78">
              {eventMeaning(events[0])}
            </p>
            <Link
              href={`/am/${cfg.slug}/${events[0].iso}`}
              className="mt-5 inline-flex rounded-full border border-border bg-card/60 px-4 py-2 text-sm"
            >
              Կարդալ ամբողջական ուղեցույցը →
            </Link>
          </section>
        )}

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Առաջիկա ամսաթվեր</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.iso}
                href={`/am/${cfg.slug}/${event.iso}`}
                className="rounded-2xl border border-border bg-card/55 p-5 transition hover:-translate-y-0.5"
              >
                <p className="text-xs text-muted-foreground">{eventTime(event)}</p>
                <h3 className="mt-1 font-semibold">{eventDate(event)}</h3>
                <p className="mt-2 text-sm text-foreground/70">
                  {event.snapshot.signSymbol} {getSignAm(event.snapshot.signIndex)} ·{" "}
                  {Math.round(event.snapshot.illumination * 100)}% լուսավորվածություն
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14 max-w-3xl">
          <h2 className="text-2xl font-semibold">Աստղագիտություն և աստղաբանական նշանակություն</h2>
          <p className="mt-4 leading-8 text-foreground/80">
            Լուսնի փուլերը հաշվարկվում են Արեգակի և Լուսնի երկրակենտրոն դիրքերից: Ամսաթիվն ու լուսավորվածությունը չափելի աստղագիտական տվյալներ են, իսկ կենդանակերպի նշանի մեկնաբանությունը պատկանում է աստղաբանական ավանդույթին:
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Հաճախ տրվող հարցեր</h2>
          <div className="mt-4 space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 leading-7 text-foreground/75">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

export function MoonPhaseDetailAm({ event }: { event: MoonEvent }) {
  const cfg = CFG[event.kind];
  const date = eventDate(event);
  const meaning = eventMeaning(event);
  const url = `${SITE}/${cfg.slug}/${event.iso}`;
  const signAm = getSignAm(event.snapshot.signIndex);

  const faq = [
    {
      q: `Ո՞ր կենդանակերպի նշանում է Լուսինը ${date}-ին:`,
      a: `${cfg.title}ը տեղի է ունենում ${signAm} նշանում՝ գագաթնակետին հասնելով ժամը ${eventTime(
        event
      )}-ին:`,
    },
    {
      q: "Ի՞նչ անել այս փուլի ընթացքում:",
      a:
        event.kind === "full"
          ? "Գնահատեք այն, ինչ հասել է արդյունքի, ավարտեք սկսածը և պահպանեք հանգստություն հուզական պահերին:"
          : "Ընտրեք հստակ նպատակ, արեք առաջին փոքր քայլը և ժամանակ տվեք նոր շրջանին զարգանալու:",
    },
  ];

  const ld = [
    articleLd({
      url,
      headline: `${cfg.title} — ${date}`,
      description: meaning,
      datePublished: `${event.iso}T00:00:00Z`,
      dateModified: `${event.iso}T00:00:00Z`,
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: SITE },
      { name: cfg.title, url: `${SITE}/${cfg.slug}` },
      { name: date, url },
    ]),
    faqLd(faq),
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={90} shooting={1} />
      <SmartHeader locale="am" georgianPath={`/${cfg.slug}/${event.iso}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-10 sm:px-6">
        <Link href={`/am/${cfg.slug}`} className="text-xs text-muted-foreground">
          ← {cfg.title}
        </Link>
        <header className="mt-6 rounded-3xl border border-border bg-card/60 p-7 sm:p-9">
          <div className="text-5xl">{cfg.symbol}</div>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            {cfg.title} — {date}
          </h1>
          <p className="mt-4 text-lg">
            {eventTime(event)} · {event.snapshot.signSymbol} {signAm}
          </p>
          <p className="mt-4 leading-8 text-foreground/80">{meaning}</p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Լուսավորվածություն", `${Math.round(event.snapshot.illumination * 100)}%`],
            ["Լուսնային տարիք", `${event.snapshot.ageDays.toFixed(1)} օր`],
            ["Փուլային անկյուն", `${event.snapshot.phaseAngle.toFixed(1)}°`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-card/50 p-5">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-semibold">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Գործնական ուղեցույց</h2>
          <div className="mt-4 space-y-4 leading-8 text-foreground/80">
            <p>
              {event.kind === "full"
                ? "Լիալուսինը բնական ցիկլի գագաթնակետն է: Ուշադրություն դարձրեք արդյունքներին և խուսափեք չմտածված հուզական որոշումներից:"
                : "Նորալուսինը սկսում է լուսնային նոր շրջան: Ընտրեք մեկ հստակ ուղղություն և գործեք հետևողականորեն:"}
            </p>
            <p>
              {signAm} նշանի խորհրդանշական թեմաները ավելացնում են աստղաբանական ենթատեքստ, սակայն կարևոր որոշումները պետք է հիմնված լինեն իրական փաստերի վրա:
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Հաճախ տրվող հարցեր</h2>
          <div className="mt-4 space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 leading-7 text-foreground/75">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-2">
          <Link href="/am/mtvaris-kalendari" className="rounded-full border border-border px-4 py-2 text-sm">
            Լուսնային օրացույց
          </Link>
          <Link href="/am/dabnelebebi" className="rounded-full border border-border px-4 py-2 text-sm">
            Խավարումներ
          </Link>
        </div>
      </article>
      <SiteFooter locale="am" />
    </main>
  );
}

export function EclipseHubAm() {
  const faq = [
    {
      q: "Ե՞րբ է հաջորդ խավարումը:",
      a: `${ECLIPSES_AM[0].title}: Տեսանելիությունը կախված է ձեր գտնվելու վայրից:`,
    },
    {
      q: "Ինչո՞ւ խավարում չի լինում յուրաքանչյուր Նորալուսնի կամ Լիալուսնի ժամանակ:",
      a: "Լուսնի ուղեծիրը թեքված է Երկրի ուղեծրային հարթության նկատմամբ: Խավարում տեղի է ունենում միայն այն ժամանակ, երբ Արեգակը, Երկիրը և Լուսինը հավասարվում են լուսնային հանգույցների մոտ:",
    },
    {
      q: "Անվտա՞նգ է արդյոք դիտել Արեգակի խավարումը:",
      a: "Երբեք մի նայեք Արեգակին անզեն աչքով կամ սովորական արևային ակնոցներով: Օգտագործեք հատուկ հավաստագրված (ISO 12312-2) արևային ֆիլտրեր:",
    },
  ];

  const ld = [
    articleLd({
      url: `${SITE}/dabnelebebi`,
      headline: ECLIPSE_META_AM.title,
      description: ECLIPSE_META_AM.description,
      datePublished: "2026-08-13T00:00:00+04:00",
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: SITE },
      { name: "Խավարումներ", url: `${SITE}/dabnelebebi` },
    ]),
    faqLd(faq),
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={110} shooting={2} />
      <SmartHeader locale="am" georgianPath="/dabnelebebi" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <section className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <header className="max-w-3xl">
          <Sun className="size-10 text-[var(--vivida-gold,#eac358)]" />
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
            Արեգակի և Լուսնի խավարումներ
          </h1>
          <p className="mt-4 text-lg leading-8 text-foreground/80">
            Խավարումների ամսաթվերը, տեսակները, տեսանելիության գոտիները և ուղեցույցը 2026–2028 թթ. համար՝ ըստ NASA-ի տվյալների:
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {ECLIPSES_AM.map((eclipse) => (
            <Link
              key={eclipse.slug}
              href={`/am/dabnelebebi/${eclipse.slug}`}
              className="rounded-2xl border border-border bg-card/55 p-5 transition hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                {eclipse.type === "solar" ? (
                  <Sun className="mt-1 size-5 text-[var(--vivida-gold,#eac358)]" />
                ) : (
                  <Moon className="mt-1 size-5 text-[var(--vivida-violet)]" />
                )}
                <div>
                  <p className="text-xs text-muted-foreground">
                    {eclipse.type === "solar" ? "Արեգակի" : "Լուսնի"} · {eclipse.subtype}
                  </p>
                  <h2 className="mt-1 font-semibold">{eclipse.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-foreground/70">
                    {eclipse.visibility}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold">Հաճախ տրվող հարցեր</h2>
          <div className="mt-4 space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="rounded-2xl border border-border bg-card/50 p-5">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-3 leading-7 text-foreground/75">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </section>
      <SiteFooter locale="am" />
    </main>
  );
}

export function EclipseDetailAm({ eclipse }: { eclipse: ArmenianEclipse }) {
  const url = `${SITE}/dabnelebebi/${eclipse.slug}`;
  const date = new Date(`${eclipse.date}T12:00:00Z`);
  const snapshot = moonEvents(eclipse.type === "solar" ? "new" : "full", 1000).find(
    (event) => Math.abs(event.date.getTime() - date.getTime()) < 3 * 86400000
  );

  const signAm = snapshot ? getSignAm(snapshot.snapshot.signIndex) : "";

  const ld = [
    articleLd({
      url,
      headline: eclipse.title,
      description: eclipse.description,
      datePublished: `${eclipse.date}T00:00:00Z`,
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: SITE },
      { name: "Խավարումներ", url: `${SITE}/dabnelebebi` },
      { name: eclipse.title, url },
    ]),
  ];

  return (
    <main lang="hy" className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <Starfield count={90} shooting={1} />
      <SmartHeader locale="am" georgianPath={`/dabnelebebi/${eclipse.slug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-10 sm:px-6">
        <Link href="/am/dabnelebebi" className="text-xs text-muted-foreground">
          ← Բոլոր խավարումները
        </Link>
        <header className="mt-6 rounded-3xl border border-border bg-card/60 p-7 sm:p-9">
          {eclipse.type === "solar" ? (
            <Sun className="size-10 text-[var(--vivida-gold,#eac358)]" />
          ) : (
            <Moon className="size-10 text-[var(--vivida-violet)]" />
          )}
          <p className="mt-4 text-sm text-[var(--vivida-cyan)]">
            {eclipse.subtype} {eclipse.type === "solar" ? "Արեգակի" : "Լուսնի"} խավարում
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{eclipse.title}</h1>
          <p className="mt-4 text-lg leading-8 text-foreground/80">{eclipse.description}</p>
        </header>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Որտե՞ղ է տեսանելի լինելու</h2>
          <p className="mt-4 leading-8 text-foreground/80">{eclipse.visibility}</p>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Ճշգրիտ տեսանելիությունն ու ժամը կախված են ձեր քաղաքից: Դիտելուց առաջ ճշտեք տեղական աստղագիտական կանխատեսումը:
          </p>
        </section>

        {snapshot && (
          <section className="mt-10 rounded-2xl border border-border bg-card/50 p-6">
            <h2 className="text-xl font-semibold">Լուսնի փուլը և կենդանակերպի նշանը</h2>
            <p className="mt-3 leading-7 text-foreground/78">
              Խավարումը տեղի է ունենում {eclipse.type === "solar" ? "Նորալուսնի" : "Լիալուսնի"} մոտ՝{" "}
              {snapshot.snapshot.signSymbol} {signAm} նշանում:
            </p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Անվտանգ դիտում</h2>
          <p className="mt-4 leading-8 text-foreground/80">
            {eclipse.type === "solar"
              ? "Երբեք մի նայեք Արեգակին անզեն աչքով: Օգտագործեք ISO 12312-2 ստանդարտին համապատասխանող հատուկ ակնոցներ:"
              : "Լուսնի խավարումը բացարձակապես անվտանգ է դիտել անզեն աչքով:"}
          </p>
        </section>

        <a
          href={eclipse.source}
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"
        >
          NASA-ի տվյալներ <ExternalLink className="size-4" />
        </a>
      </article>
      <SiteFooter locale="am" />
    </main>
  );
}
