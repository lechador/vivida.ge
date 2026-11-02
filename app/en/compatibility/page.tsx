import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

import { EnglishGuide } from "@/components/en/english-guide";
import { PolishGuide } from "@/components/pl/polish-guide";
import { CompatibilityCalculator } from "@/components/landing/compatibility-calculator";
import { buildCalculatorData } from "@/lib/compatibility-calculator-data";
import {
  DEFAULT_OG_IMAGE,
  ENGLISH_SITE_URL,
  localizedAlternates,
} from "@/lib/seo/locales";
import { articleLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { getRequestLocale } from "@/lib/i18n/request-locale";

const PATH_EN = "/en/compatibility";
const PATH_PL = "/pl/horoskop-partnerski";
const TITLE_EN = "Astrology Compatibility Beyond Sun Signs";
const DESCRIPTION_EN =
  "Learn how synastry compares two natal charts through the Sun, Moon, Venus, Mars, houses and planetary aspects, not only Sun signs.";

const TITLE_PL =
  "Horoskop Partnerski i Synastria Online – Dopasowanie Znaków Zodiaku | Vivida";
const DESCRIPTION_PL =
  "Sprawdź dopasowanie znaków zodiaku i synastrię partnerską online. Poznaj dynamikę relacji przez Słońce, Księżyc, Wenus, Marsa i aspekty horoskopu partnerskiego.";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const isPl = locale === "pl";
  const title = isPl ? TITLE_PL : `${TITLE_EN}, Vivida`;
  const description = isPl ? DESCRIPTION_PL : DESCRIPTION_EN;
  const path = isPl ? PATH_PL : PATH_EN;
  const canonicalPath = isPl ? "/pl/horoskop-partnerski" : "/compatibility";
  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates(
      path,
      "/zodiac/tavsebadoba",
      isPl ? "pl" : "en",
    ),
    openGraph: {
      images: [DEFAULT_OG_IMAGE],
      title,
      description,
      url: `${ENGLISH_SITE_URL}${canonicalPath}`,
      locale: isPl ? "pl_PL" : "en_US",
      alternateLocale: isPl ? ["en_US", "ka_GE"] : ["ka_GE", "pl_PL"],
    },
  };
}

export default async function EnglishCompatibilityPage() {
  const locale = await getRequestLocale();
  const isPl = locale === "pl";
  const { signs, pairs } = buildCalculatorData(isPl ? "pl" : "en");
  const canonicalPath = isPl ? "/pl/horoskop-partnerski" : "/compatibility";
  const url = `${ENGLISH_SITE_URL}${canonicalPath}`;
  const ld = [
    articleLd({
      url,
      headline: isPl ? TITLE_PL : TITLE_EN,
      description: isPl ? DESCRIPTION_PL : DESCRIPTION_EN,
    }),
    breadcrumbLd([
      {
        name: isPl ? "Start" : "Home",
        url: isPl ? `${ENGLISH_SITE_URL}/pl` : ENGLISH_SITE_URL,
      },
      { name: isPl ? "Horoskop partnerski" : "Compatibility", url },
    ]),
  ];

  if (isPl) {
    return (
      <PolishGuide
        eyebrow="Relacje i synastria"
        title="Dopasowanie to więcej niż tylko znaki Słońca"
        intro="Astrologiczne dopasowanie partnerskie (synastria) porównuje dwa kompletne kosmogramy. Odkrywa wzorce przyciągania, porozumienia, różnic i wspólnego rozwoju bez sztywnego wyrokowania o losie relacji."
        georgianPath="/zodiac/tavsebadoba"
        jsonLd={ld}
      >
        <section className="not-prose rounded-3xl border border-border bg-card/40 p-4 sm:p-7">
          <div className="mb-6 text-center">
            <Heart className="mx-auto size-7 text-[var(--vivida-pink)]" />
            <h2 className="mt-3 text-2xl font-semibold">
              Wypróbuj darmowy kalkulator dopasowania znaków zodiaku
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Wybierz dwa znaki zodiaku, aby natychmiast otrzymać interpretację
              dopasowania partnerskiego, a następnie przejdź do pełnej analizy
              pary.
            </p>
          </div>
          <CompatibilityCalculator signs={signs} pairs={pairs} locale="pl" />
        </section>
        <section>
          <h2>Co porównuje analiza synastrii partnerskiej</h2>
          <ul className="mt-4 list-disc">
            <li>
              <strong>Połączenia Słońca</strong> opisują tożsamość, kierunek
              życiowy i wzajemne uznanie.
            </li>
            <li>
              <strong>Połączenia Księżyca</strong> ujawniają rytm emocjonalny,
              poczucie bezpieczeństwa i codzienne potrzeby.
            </li>
            <li>
              <strong>Aspekty Merkurego</strong> podkreślają styl komunikacji i
              sposób przetwarzania myśli.
            </li>
            <li>
              <strong>Wenus i Mars</strong> tradycyjnie odpowiadają za czułość,
              przyciąganie fizyczne, pożądanie i dynamikę zdobywania.
            </li>
            <li>
              <strong>Kontakty Saturna</strong> wskazują na odpowiedzialność,
              trwałość, granice lub presję w związku.
            </li>
            <li>
              <strong>Nałożenie domów</strong> pokazuje, które obszary życia
              jednej osoby zostają aktywowane przez planety partnera.
            </li>
          </ul>
        </section>
        <section>
          <h2>Dlaczego jeden procentowy wynik to za mało</h2>
          <p>
            Wynik procentowy to wspaniały punkt wyjścia do rozmowy, ale
            prawdziwe relacje są wielowymiarowe. Trudniejsze aspekty mogą
            inspirować do dojrzałości i zaangażowania, podczas gdy łatwe bywają
            brane za pewnik. Dokładna godzina urodzenia, emocjonalna dojrzałość,
            szczera komunikacja i realne okoliczności życiowe mają większe
            znaczenie niż pojedyncza kategoria astrologiczna.
          </p>
        </section>
        <section>
          <h2>Używaj horoskopu partnerskiego do dialogu</h2>
          <p>
            Najzdrowszym zastosowaniem synastrii jest zadawanie lepszych pytań:
            Gdzie rozumiemy się naturalnie? W jakich obszarach nasze potrzeby
            się różnią? Jakie wzorce wymagają wyraźniejszych granic lub
            cierpliwszej komunikacji? Astrologia nigdy nie powinna służyć do
            usprawiedliwiania szkodliwych zachowań ani zastępować szczerej
            rozmowy.
          </p>
        </section>
        <div className="rounded-3xl border border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/8 p-6 text-center sm:p-8">
          <Heart className="mx-auto size-7 text-[var(--vivida-pink)]" />
          <h2 className="mt-3">Odkryj pełną synastrię partnerską</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Załóż bezpłatny profil, aby porównać kompletne kosmogramy
            urodzeniowe w języku polskim — w tym Księżyc, Wenus, Marsa, domy i
            wzajemne aspekty planet.
          </p>
          <Link
            href="/signup"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-3 text-sm font-semibold text-white"
          >
            Załóż bezpłatny profil <ArrowRight className="size-4" />
          </Link>
        </div>
      </PolishGuide>
    );
  }

  return (
    <EnglishGuide
      eyebrow="Relationships and synastry"
      title="Compatibility is more than two Sun signs"
      intro="Astrological compatibility, often called synastry, compares two complete natal charts. It explores patterns of ease, attraction, difference and growth without deciding whether a relationship will succeed."
      georgianPath="/zodiac/tavsebadoba"
      jsonLd={ld}
    >
      <section className="not-prose rounded-3xl border border-border bg-card/40 p-4 sm:p-7">
        <div className="mb-6 text-center">
          <Heart className="mx-auto size-7 text-[var(--vivida-pink)]" />
          <h2 className="mt-3 text-2xl font-semibold">
            Try the free Sun-sign calculator
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Choose two signs for an instant English compatibility reading, then
            open the full pair analysis.
          </p>
        </div>
        <CompatibilityCalculator signs={signs} pairs={pairs} locale="en" />
      </section>
      <section>
        <h2>What a compatibility reading compares</h2>
        <ul className="mt-4 list-disc">
          <li>
            <strong>Sun connections</strong> can describe identity, direction
            and mutual recognition.
          </li>
          <li>
            <strong>Moon connections</strong> are often read for emotional
            rhythm, comfort and everyday needs.
          </li>
          <li>
            <strong>Mercury aspects</strong> can highlight communication styles
            and ways of processing information.
          </li>
          <li>
            <strong>Venus and Mars</strong> are traditionally associated with
            affection, attraction, desire and pursuit.
          </li>
          <li>
            <strong>Saturn contacts</strong> may emphasize responsibility,
            endurance, boundaries or pressure.
          </li>
          <li>
            <strong>House overlays</strong> show which areas of one person’s
            life are activated by the other’s planets.
          </li>
        </ul>
      </section>
      <section>
        <h2>Why one score cannot tell the whole story</h2>
        <p>
          A percentage can be a playful introduction, but real relationships are
          multidimensional. Some challenging aspects can support growth and
          commitment, while easy aspects can be taken for granted. Birth-time
          accuracy, individual maturity, communication and real-life
          circumstances matter more than a single astrological category.
        </p>
      </section>
      <section>
        <h2>Use compatibility as a conversation</h2>
        <p>
          The healthiest use of synastry is to ask better questions: Where do we
          naturally understand each other? Where do our needs differ? Which
          patterns require clearer boundaries or more patient communication?
          Astrology should never be used to excuse harmful behavior, ignore
          consent or replace direct conversation.
        </p>
      </section>
      <div className="rounded-3xl border border-[var(--vivida-pink)]/35 bg-[var(--vivida-pink)]/8 p-6 text-center sm:p-8">
        <Heart className="mx-auto size-7 text-[var(--vivida-pink)]" />
        <h2 className="mt-3">Try the free Sun-sign calculator</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Create a free profile to compare complete birth charts, including the
          Moon, Venus, Mars, houses, and cross-chart aspects, in English.
        </p>
        <Link
          href="/signup"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink))] px-5 py-3 text-sm font-semibold text-white"
        >
          Create my profile <ArrowRight className="size-4" />
        </Link>
      </div>
    </EnglishGuide>
  );
}
