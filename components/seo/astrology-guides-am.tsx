import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  FaqList,
  GuideBreadcrumbs,
  GuideShell,
  NatalCta,
} from "@/components/seo/astrology-guide-shell";
import { localeHref } from "@/lib/i18n/armenian-routes";
import type { HouseGuide, PlanetGuide } from "@/lib/seo/astrology-guides";
import {
  HOUSE_GUIDES_AM,
  PLANET_GUIDES_AM,
} from "@/lib/seo/astrology-guides-am";
import {
  articleLd,
  breadcrumbLd,
  faqLd,
  serializeLd,
} from "@/lib/seo/jsonld";
import { ARMENIAN_SITE_URL } from "@/lib/seo/locales";

const BASE = ARMENIAN_SITE_URL;
const amHref = (path: string) => localeHref(path, "am");

export const HOUSES_AM = {
  title: "Աստղագուշակության 12 տները․ իմաստը նատալ քարտեզում",
  description:
    "Բացահայտեք նատալ քարտեզի 12 աստղաբանական տների իմաստը՝ ինքնությունից և ֆինանսներից մինչև հարաբերություններ, կարիերա, համայնք ու ներաշխարհ։",
};

const HOUSES_FAQ = [
  {
    q: "Ի՞նչ են աստղաբանական տները։",
    a: "Տները նատալ քարտեզը բաժանում են կյանքի 12 ոլորտների։ Մոլորակը ցույց է տալիս, թե ինչ էներգիա է գործում, կենդանակերպի նշանը՝ ինչպես է այն դրսևորվում, իսկ տունը՝ կյանքի որ ոլորտում։",
  },
  {
    q: "Ինչո՞ւ է անհրաժեշտ ծննդյան ճշգրիտ ժամը։",
    a: "Ասցենդենտը և տների սահմանները օրվա ընթացքում փոխվում են՝ հաճախ մոտավորապես երկու ժամը մեկ անցնելով հաջորդ նշան։ Նույնիսկ փոքր տարբերությունը կարող է փոխել տան սահմանը, ուստի հնարավորության դեպքում օգտագործեք ծննդյան վկայականում նշված ժամը։",
  },
  {
    q: "Ի՞նչ է նշանակում դատարկ տունը։",
    a: "Դատարկ տունը չի նշանակում, որ կյանքի այդ ոլորտը բացակայում է։ Տան սկզբնակետին դեռ կա նշան, որն ունի կառավարող մոլորակ․ մեկնաբանությունը սկսվում է հենց այս երկու գործոնից։",
  },
  {
    q: "Ո՞ր աստղաբանական տունն է ամենակարևորը։",
    a: "Բոլոր տներն էլ կարևոր են։ Անկյունային՝ 1-ին, 4-րդ, 7-րդ և 10-րդ տները հաճախ առավել տեսանելի են, բայց շեշտադրումը կախված է ամբողջ նատալ քարտեզից։",
  },
];

export function AstrologyHousesHubAm() {
  const url = `${BASE}/astrologiuri-saxlebi`;
  const ld = [
    articleLd({
      url,
      headline: HOUSES_AM.title,
      description: HOUSES_AM.description,
      datePublished: "2026-08-17T00:00:00+04:00",
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: BASE },
      { name: "Աստղաբանական տներ", url },
    ]),
    faqLd(HOUSES_FAQ),
  ];

  return (
    <GuideShell locale="am" georgianPath="/astrologiuri-saxlebi">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-7 sm:px-6 sm:pt-12">
        <GuideBreadcrumbs
          locale="am"
          items={[
            { href: "/astrologiuri-saxlebi", label: "Աստղաբանական տներ" },
          ]}
        />
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vivida-violet)]">
            Նատալ քարտեզի ուղեցույց
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Աստղաբանական 12 տները՝{" "}
            <span className="bg-gradient-to-r from-[var(--vivida-violet)] via-[var(--vivida-pink)] to-[var(--vivida-cyan)] bg-clip-text text-transparent">
              ձեր կյանքի ոլորտները
            </span>
          </h1>
          <p className="mt-5 text-pretty text-lg leading-8 text-foreground/80">
            Նատալ քարտեզի 12 տները պատասխանում են «որտե՞ղ» հարցին․
            կյանքի ո՞ր ոլորտում է դրսևորվում մոլորակի էներգիան։ Այս
            գործնական ուղեցույցով բացահայտեք յուրաքանչյուր տան իմաստը։
          </p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOUSE_GUIDES_AM.map((house) => (
            <Link
              key={house.number}
              href={amHref(`/astrologiuri-saxlebi/${house.number}`)}
              className="group rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 transition hover:-translate-y-0.5 hover:border-[var(--vivida-violet)]/40"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl font-semibold text-[var(--vivida-violet)]">
                  {house.number}
                </span>
                <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">{house.name}</h2>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                {house.area}
              </p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {house.keywords.slice(0, 3).map((keyword) => (
                  <li
                    key={keyword}
                    className="rounded-full border border-border px-2 py-1 text-[11px] text-muted-foreground"
                  >
                    {keyword}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <h2 className="text-xl font-semibold">Ինչպես մեկնաբանել տունը</h2>
            <p className="mt-3 leading-7 text-foreground/78">
              Միավորեք չորս գործոն՝ տան կյանքի ոլորտը, նրա սկզբնակետի
              նշանը, այդ նշանի կառավարող մոլորակը և տան ներսում գտնվող
              մոլորակները։ Ապա ավելացրեք ասպեկտները․ մեկ դիրքը երբեք չի
              պատմում ամբողջ պատմությունը։
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <h2 className="text-xl font-semibold">Եթե տանը մոլորակ չկա</h2>
            <p className="mt-3 leading-7 text-foreground/78">
              Դա լիովին բնական է․ տասը հիմնական մոլորակները չեն կարող
              լրացնել բոլոր տասներկու տները։ Դատարկ տունը մեկնաբանեք նրա
              սկզբնակետի նշանի և այդ նշանի կառավարող մոլորակի դիրքի միջոցով։
            </p>
          </div>
        </section>
        <FaqList locale="am" items={HOUSES_FAQ} />
        <NatalCta locale="am" title="Ո՞ր տներում են ձեր մոլորակները" />
      </article>
    </GuideShell>
  );
}

export function AstrologyHousePageAm({ house }: { house: HouseGuide }) {
  const url = `${BASE}/astrologiuri-saxlebi/${house.number}`;
  const title = `${house.number}-րդ տունն աստղագուշակության մեջ․ ${house.name}`;
  const description = `Բացահայտեք ${house.number}-րդ տան իմաստը նատալ քարտեզում՝ ${house.area.toLowerCase()}, բնական նշանը, կառավարող մոլորակը և մեկնաբանման եղանակը։`;
  const faq = [
    { q: `Ի՞նչ է նշանակում ${house.number}-րդ տունը նատալ քարտեզում։`, a: house.meaning },
    {
      q: `Ո՞ր նշանն ու մոլորակն են կապված ${house.number}-րդ տան հետ։`,
      a: `Կենդանակերպի բնական համադրության մեջ ${house.number}-րդ տունը կապված է ${house.sign} նշանի հետ և խորհրդանշորեն կառավարվում է ${house.planet} մոլորակի կողմից։ Անձնական քարտեզում տան իրական նշանը կախված է ծննդյան ժամից և վայրից։`,
    },
    { q: `Ի՞նչ է նշանակում մի քանի մոլորակ ունենալ ${house.number}-րդ տանը։`, a: house.strong },
    { q: `Ինչպե՞ս մեկնաբանել իմ ${house.number}-րդ տունը։`, a: house.reading },
  ];
  const current = HOUSE_GUIDES_AM.findIndex(
    (item) => item.number === house.number,
  );
  const prev = HOUSE_GUIDES_AM[(current + 11) % 12];
  const next = HOUSE_GUIDES_AM[(current + 1) % 12];
  const ld = [
    articleLd({
      url,
      headline: title,
      description,
      datePublished: "2026-08-17T00:00:00+04:00",
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: BASE },
      { name: "Աստղաբանական տներ", url: `${BASE}/astrologiuri-saxlebi` },
      { name: `${house.number}-րդ տուն`, url },
    ]),
    faqLd(faq),
  ];

  return (
    <GuideShell
      locale="am"
      georgianPath={`/astrologiuri-saxlebi/${house.number}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-7 sm:px-6 sm:pt-12">
        <GuideBreadcrumbs
          locale="am"
          items={[
            { href: "/astrologiuri-saxlebi", label: "Աստղաբանական տներ" },
            {
              href: `/astrologiuri-saxlebi/${house.number}`,
              label: `${house.number}-րդ տուն`,
            },
          ]}
        />
        <header>
          <div className="flex size-16 items-center justify-center rounded-2xl border border-[var(--vivida-violet)]/35 bg-[var(--vivida-violet)]/12 text-3xl font-semibold text-[var(--vivida-violet)]">
            {house.number}
          </div>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {house.number}-րդ տունն աստղագուշակության մեջ․ {house.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-foreground/80">
            {house.area}։ Հիմնական հարցը՝{" "}
            <strong className="text-foreground">«{house.question}»</strong>
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {house.keywords.map((word) => (
              <li
                key={word}
                className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground/75"
              >
                {word}
              </li>
            ))}
          </ul>
        </header>
        <section className="mt-10 space-y-5">
          <div className="rounded-2xl border border-border bg-card/55 p-6">
            <h2 className="text-2xl font-semibold">
              Ի՞նչ է նշանակում {house.number}-րդ տունը
            </h2>
            <p className="mt-4 leading-8 text-foreground/82">{house.meaning}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/50 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Բնական համադրություն
              </p>
              <p className="mt-2 text-lg font-semibold">{house.sign}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/50 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Խորհրդանշական կառավարիչ
              </p>
              <p className="mt-2 text-lg font-semibold">{house.planet}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/55 p-6">
            <h2 className="text-2xl font-semibold">Երբ այս տունն ընդգծված է</h2>
            <p className="mt-4 leading-8 text-foreground/82">{house.strong}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/55 p-6">
            <h2 className="text-2xl font-semibold">Ինչպես ճշգրիտ մեկնաբանել</h2>
            <p className="mt-4 leading-8 text-foreground/82">{house.reading}</p>
          </div>
        </section>
        <FaqList locale="am" items={faq} />
        <nav
          aria-label="Այլ աստղաբանական տներ"
          className="mt-10 grid grid-cols-2 gap-3"
        >
          <Link
            href={amHref(`/astrologiuri-saxlebi/${prev.number}`)}
            className="rounded-xl border border-border bg-card/40 p-4 text-sm hover:border-foreground/25"
          >
            ← {prev.number}-րդ տուն
          </Link>
          <Link
            href={amHref(`/astrologiuri-saxlebi/${next.number}`)}
            className="rounded-xl border border-border bg-card/40 p-4 text-right text-sm hover:border-foreground/25"
          >
            {next.number}-րդ տուն →
          </Link>
        </nav>
        <NatalCta
          locale="am"
          title={`Բացահայտեք ձեր ${house.number}-րդ տունը`}
        />
      </article>
    </GuideShell>
  );
}

export const PLANETS_AM = {
  title: "Մոլորակներն աստղագուշակության մեջ․ իմաստը նատալ քարտեզում",
  description:
    "Բացահայտեք Արեգակի, Լուսնի, Մերկուրիի, Վեներայի, Մարսի, Յուպիտերի, Սատուրնի, Ուրանի, Նեպտունի և Պլուտոնի իմաստը նատալ քարտեզում։",
};

const PLANETS_FAQ = [
  {
    q: "Ի՞նչ է նշանակում մոլորակը նատալ քարտեզում։",
    a: "Մոլորակը խորհրդանշում է հոգեբանական գործառույթ կամ մղում։ Մերկուրին ներկայացնում է մտածողությունը, Վեներան՝ արժեքներն ու գրավչությունը, իսկ Մարսը՝ գործողությունն ու ցանկությունը։ Նշանը ցույց է տալիս՝ ինչպես է այն գործում, իսկ տունը՝ կյանքի որ ոլորտում։",
  },
  {
    q: "Ինչո՞ւ են Արեգակն ու Լուսինը մոլորակների շարքում։",
    a: "Աստղագուշակները դրանք անվանում են լուսատուներ, բայց մեկնաբանության մեջ սովորաբար խմբավորում են մոլորակների հետ։ Աստղագիտական առումով Արեգակն աստղ է, իսկ Լուսինը՝ Երկրի բնական արբանյակը։",
  },
  {
    q: "Ո՞ր մոլորակն է ամենակարևորը։",
    a: "Արեգակը, Լուսինն ու ասցենդենտը մեկնաբանության օգտակար մեկնակետեր են, սակայն յուրաքանչյուր մոլորակ, տուն և ասպեկտ նպաստում է ամբողջական նատալ քարտեզին։",
  },
  {
    q: "Ի՞նչ է կառավարող մոլորակը։",
    a: "Կենդանակերպի յուրաքանչյուր նշան ունի կառավարող մոլորակ։ Ձեր ասցենդենտի նշանի կառավարիչը հաճախ կոչվում է նաև քարտեզի կառավարիչ, քանի որ նրա դիրքը կարևոր հուշում է տալիս ձեր ընդհանուր ուղղության մասին։",
  },
];

export function PlanetsHubAm() {
  const url = `${BASE}/planetebi`;
  const ld = [
    articleLd({
      url,
      headline: PLANETS_AM.title,
      description: PLANETS_AM.description,
      datePublished: "2026-08-17T00:00:00+04:00",
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: BASE },
      { name: "Մոլորակներն աստղագուշակության մեջ", url },
    ]),
    faqLd(PLANETS_FAQ),
  ];

  return (
    <GuideShell locale="am" georgianPath="/planetebi">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-20 pt-7 sm:px-6 sm:pt-12">
        <GuideBreadcrumbs
          locale="am"
          items={[{ href: "/planetebi", label: "Մոլորակներ" }]}
        />
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--vivida-cyan)]">
            Նատալ քարտեզի ուղեցույց
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Մոլորակները{" "}
            <span className="bg-gradient-to-r from-[var(--vivida-violet)] via-[var(--vivida-pink)] to-[var(--vivida-cyan)] bg-clip-text text-transparent">
              աստղագուշակության մեջ
            </span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-foreground/80">
            Մոլորակը պատասխանում է «ի՞նչն է գործում» հարցին։ Արեգակը
            ներկայացնում է ինքնությունը, Լուսինը՝ էմոցիոնալ կարիքները,
            Վեներան՝ գրավչությունը, իսկ Մարսը՝ գործելու ոճը։ Ընտրեք մոլորակն
            ու կարդացեք ամբողջական բացատրությունը։
          </p>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-2">
          {PLANET_GUIDES_AM.map((planet) => (
            <Link
              href={amHref(`/planetebi/${planet.slug}`)}
              key={planet.slug}
              className="group flex gap-5 rounded-2xl border border-border bg-card/55 p-5 ring-1 ring-foreground/5 transition hover:-translate-y-0.5 hover:border-[var(--vivida-cyan)]/35"
            >
              <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-3xl text-[var(--vivida-cyan)]">
                {planet.symbol}
              </span>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold">{planet.name}</h2>
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" />
                </div>
                <p className="mt-1 text-sm text-foreground/70">{planet.role}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Կառավարում է՝ {planet.rules}
                </p>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-12 rounded-2xl border border-border bg-card/50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">
            Մոլորակ + նշան + տուն + ասպեկտ
          </h2>
          <p className="mt-4 max-w-3xl leading-8 text-foreground/80">
            Օգտակար մեկնաբանությունը միավորում է չորս շերտ․ մոլորակը ցույց է
            տալիս՝ <strong className="text-foreground">ինչ</strong> էներգիա է
            գործում, կենդանակերպի նշանը՝{" "}
            <strong className="text-foreground">ինչպես</strong>,
            աստղաբանական տունը՝{" "}
            <strong className="text-foreground">որտեղ</strong>, իսկ
            ասպեկտները նկարագրում են այդ էներգիայի կապը քարտեզի մյուս մասերի
            հետ։
          </p>
          <Link
            href={amHref("/astrologiuri-saxlebi")}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--vivida-violet)] hover:underline"
          >
            Բացահայտեք 12 աստղաբանական տները
            <ArrowRight className="size-4" />
          </Link>
        </section>
        <FaqList locale="am" items={PLANETS_FAQ} />
        <NatalCta locale="am" title="Որտե՞ղ են ձեր մոլորակները" />
      </article>
    </GuideShell>
  );
}

export function PlanetPageAm({ planet }: { planet: PlanetGuide }) {
  const url = `${BASE}/planetebi/${planet.slug}`;
  const title = `${planet.name}-ը նատալ քարտեզում․ իմաստն աստղագուշակության մեջ`;
  const description = `Բացահայտեք ${planet.name}-ի իմաստը նատալ քարտեզում՝ ${planet.role.toLowerCase()}, կառավարող նշանները, հավասարակշռված դրսևորումը և տարածված մարտահրավերները։`;
  const faq = [
    { q: `Ի՞նչ է նշանակում ${planet.name}-ը նատալ քարտեզում։`, a: planet.meaning },
    {
      q: `Ի՞նչ է կառավարում ${planet.name}-ը աստղագուշակության մեջ։`,
      a: `${planet.name}-ը կապված է «${planet.role}» թեմայի հետ։ Հավասարակշռված դրսևորմամբ այն բերում է հետևյալ որակները․ ${planet.balanced}`,
    },
    {
      q: `Կենդանակերպի ո՞ր նշանն է կառավարում ${planet.name}-ը։`,
      a: `${planet.name}-ը կառավարում է՝ ${planet.rules}։ Սա բնական համադրություն է․ անձնական նատալ քարտեզում մոլորակը կարող է գտնվել կենդանակերպի ցանկացած նշանում և տանը։`,
    },
    {
      q: `Ինչպե՞ս գտնեմ ${planet.name}-ի իմ դիրքը։`,
      a: "Հաշվարկեք ձեր նատալ քարտեզը՝ օգտագործելով ծննդյան ամսաթիվը, ճշգրիտ ժամը և վայրը։ Արդյունքը ցույց կտա մոլորակի կենդանակերպի նշանը, տունը և մյուս մոլորակների հետ ասպեկտները։",
    },
  ];
  const index = PLANET_GUIDES_AM.findIndex(
    (item) => item.slug === planet.slug,
  );
  const prev =
    PLANET_GUIDES_AM[
      (index + PLANET_GUIDES_AM.length - 1) % PLANET_GUIDES_AM.length
    ];
  const next = PLANET_GUIDES_AM[(index + 1) % PLANET_GUIDES_AM.length];
  const ld = [
    articleLd({
      url,
      headline: title,
      description,
      datePublished: "2026-08-17T00:00:00+04:00",
    }),
    breadcrumbLd([
      { name: "Գլխավոր", url: BASE },
      { name: "Մոլորակներ", url: `${BASE}/planetebi` },
      { name: planet.name, url },
    ]),
    faqLd(faq),
  ];

  return (
    <GuideShell locale="am" georgianPath={`/planetebi/${planet.slug}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />
      <article className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-20 pt-7 sm:px-6 sm:pt-12">
        <GuideBreadcrumbs
          locale="am"
          items={[
            { href: "/planetebi", label: "Մոլորակներ" },
            { href: `/planetebi/${planet.slug}`, label: planet.name },
          ]}
        />
        <header>
          <span className="flex size-20 items-center justify-center rounded-2xl border border-[var(--vivida-cyan)]/30 bg-[var(--vivida-cyan)]/10 text-5xl text-[var(--vivida-cyan)]">
            {planet.symbol}
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            {planet.name}-ը նատալ քարտեզում
          </h1>
          <p className="mt-4 text-xl text-foreground/80">{planet.role}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {planet.keywords.map((word) => (
              <li
                key={word}
                className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground/75"
              >
                {word}
              </li>
            ))}
          </ul>
        </header>
        <section className="mt-10 space-y-5">
          <div className="rounded-2xl border border-border bg-card/55 p-6">
            <h2 className="text-2xl font-semibold">
              Ի՞նչ է նշանակում {planet.name}-ը աստղագուշակության մեջ
            </h2>
            <p className="mt-4 leading-8 text-foreground/82">{planet.meaning}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card/55 p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Կառավարող նշաններ
            </p>
            <p className="mt-2 text-lg font-semibold">{planet.rules}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--vivida-cyan)]/25 bg-[var(--vivida-cyan)]/7 p-6">
              <h2 className="text-xl font-semibold">Հավասարակշռված դրսևորում</h2>
              <p className="mt-3 leading-7 text-foreground/80">
                {planet.balanced}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--vivida-pink)]/25 bg-[var(--vivida-pink)]/7 p-6">
              <h2 className="text-xl font-semibold">Աճի մարտահրավեր</h2>
              <p className="mt-3 leading-7 text-foreground/80">
                {planet.challenge}
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card/55 p-6">
            <h2 className="text-xl font-semibold">Ինքնավերլուծության հարց</h2>
            <blockquote className="mt-3 border-l-2 border-[var(--vivida-violet)] pl-4 text-lg leading-8 text-foreground/85">
              {planet.question}
            </blockquote>
          </div>
          <div className="rounded-2xl border border-border bg-card/55 p-6">
            <h2 className="text-xl font-semibold">
              Ինչպես մեկնաբանել այն ձեր քարտեզում
            </h2>
            <p className="mt-3 leading-8 text-foreground/80">
              {planet.name}-ի նշանը նկարագրում է դրսևորման ոճը, նրա{" "}
              <Link
                href={amHref("/astrologiuri-saxlebi")}
                className="text-[var(--vivida-violet)] hover:underline"
              >
                աստղաբանական տունը
              </Link>{" "}
              ցույց է տալիս կյանքի ոլորտը, իսկ ասպեկտները՝ կապերը մյուս
              հոգեբանական գործառույթների հետ։ Ոչ մի դիրք ինքնին վերջնական
              դատավճիռ չէ։
            </p>
          </div>
        </section>
        <FaqList locale="am" items={faq} />
        <nav
          aria-label="Այլ մոլորակներ"
          className="mt-10 grid grid-cols-2 gap-3"
        >
          <Link
            href={amHref(`/planetebi/${prev.slug}`)}
            className="rounded-xl border border-border bg-card/40 p-4 text-sm hover:border-foreground/25"
          >
            ← {prev.name}
          </Link>
          <Link
            href={amHref(`/planetebi/${next.slug}`)}
            className="rounded-xl border border-border bg-card/40 p-4 text-right text-sm hover:border-foreground/25"
          >
            {next.name} →
          </Link>
        </nav>
        <NatalCta
          locale="am"
          title={`Գտեք ${planet.name}-ը ձեր նատալ քարտեզում`}
        />
      </article>
    </GuideShell>
  );
}
