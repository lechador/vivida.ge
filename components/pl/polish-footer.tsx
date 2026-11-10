import Link from "next/link";

import { GEORGIAN_SITE_URL, ENGLISH_SITE_URL } from "@/lib/seo/locales";
import { VividaMark } from "@/components/brand/vivida-mark";

const EXPLORE = [
  { href: "/pl/horoskop-urodzeniowy", label: "Horoskop urodzeniowy" },
  { href: "/pl/horoskop-dzienny", label: "Horoskop dzienny" },
  { href: "/pl/horoskop-tygodniowy", label: "Horoskop tygodniowy" },
  { href: "/pl/horoskop-miesieczny", label: "Horoskop miesięczny" },
  { href: "/pl/horoskop-partnerski", label: "Horoskop partnerski" },
  { href: `${ENGLISH_SITE_URL}/features`, label: "Funkcje" },
  { href: `${ENGLISH_SITE_URL}/how-it-works`, label: "Jak to działa" },
];

const LEARN = [
  { href: "/pl/znaki-zodiaku", label: "Znaki zodiaku" },
  { href: "/pl/znaki-zodiaku/daty", label: "Znak wg daty urodzenia" },
  { href: "/pl/znaki-zodiaku/znak-ksiezyca", label: "Księżycowy znak zodiaku" },
  { href: "/pl/znaki-zodiaku/ascendent", label: "Ascendent w znakach" },
  { href: "/pl/znaki-zodiaku/zywioly", label: "Żywioły zodiaku" },
  { href: "/pl/znaki-zodiaku/przewodnik", label: "Kompletny przewodnik" },
  { href: "/pl/znaki-zodiaku/rankingi", label: "Rankingi znaków" },
  { href: "/pl/domy-astrologiczne", label: "Domy astrologiczne" },
  { href: "/pl/planety-w-astrologii", label: "Planety w astrologii" },
  { href: "/pl/kalendarz-astrologiczny", label: "Kalendarz astrologiczny" },
  { href: "/pl/zacmienia", label: "Zaćmienia" },
];

const TOOLS = [
  { href: "/pl/tarot", label: "Tarot online" },
  { href: "/pl/sennik", label: "Sennik online" },
  { href: "/pl/numerologia", label: "Numerologia i Droga Życia" },
  { href: "/pl/liczby-anielskie", label: "Liczby anielskie" },
  { href: "/pl/kalendarz-ksiezycowy", label: "Kalendarz księżycowy" },
  { href: "/pl/horoskop-chinski", label: "Horoskop chiński" },
  { href: "/pl/tests", label: "Testy psychologiczne" },
  { href: "/pl/test-iq", label: "Test IQ" },
  { href: "/pl/test-osobowosci", label: "Test osobowości" },
  { href: "/pl/inteligencja-emocjonalna", label: "Inteligencja emocjonalna" },
];

export function PolishFooter() {
  return (
    <footer className="relative z-10 border-t border-border/40 bg-background/65 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="max-w-md">
          <Link href="/pl" className="inline-flex items-center gap-2.5">
            <VividaMark size={36} id="polish-footer" />
            <span className="text-xl font-semibold">vivida</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Twój osobisty almanach astrologiczny i obserwatorium nieba.
            Precyzyjne efemerydy astronomiczne, horoskop urodzeniowy, tranzyty
            planet i synastria partnerska w języku polskim.
          </p>
          <a
            href="mailto:hello@vividaastro.com"
            className="mt-3 inline-block text-sm text-[var(--vivida-cyan)] hover:underline"
          >
            hello@vividaastro.com
          </a>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Odkrywaj
          </h2>
          <ul className="space-y-2 text-sm">
            {EXPLORE.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-foreground/85 hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Wiedza
          </h2>
          <ul className="space-y-2 text-sm">
            {LEARN.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-foreground/85 hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Narzędzia
          </h2>
          <ul className="space-y-2 text-sm">
            {TOOLS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-foreground/85 hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Firma
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/pl/about"
                className="text-foreground/85 hover:text-foreground"
              >
                O Vivida
              </Link>
            </li>
            <li>
              <Link
                href="/pl/privacy"
                className="text-foreground/85 hover:text-foreground"
              >
                Polityka prywatności
              </Link>
            </li>
            <li>
              <Link
                href="/pl/terms"
                className="text-foreground/85 hover:text-foreground"
              >
                Regulamin serwisu
              </Link>
            </li>
            <li>
              <a
                href={ENGLISH_SITE_URL}
                hrefLang="en"
                className="text-foreground/85 hover:text-foreground"
              >
                English version
              </a>
            </li>
            <li>
              <a
                href={GEORGIAN_SITE_URL}
                hrefLang="ka-GE"
                className="text-foreground/85 hover:text-foreground"
              >
                ქართული ვერსია
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/30 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Vivida. Operated by CoreShift Apps LLC.
        Wszelkie prawa zastrzeżone.
      </div>
    </footer>
  );
}
