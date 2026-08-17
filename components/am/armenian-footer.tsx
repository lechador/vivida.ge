import Link from "next/link";

import { VividaMark } from "@/components/brand/vivida-mark";
import {
  GEORGIAN_SITE_URL,
  ENGLISH_SITE_URL,
  armenianSiteHref,
} from "@/lib/seo/locales";
import { requestIsEnglishHost } from "@/lib/i18n/request-locale";

const EXPLORE = [
  { href: "/natal-chart", label: "Նատալ քարտեզ" },
  { href: "/astrologiuri-saxlebi", label: "Աստղաբանական տներ" },
  { href: "/planetebi", label: "Մոլորակներ" },
  { href: "/horoscope", label: "Հորոսկոպ" },
  { href: "/compatibility", label: "Համատեղելիություն" },
  { href: "/zodiac", label: "Կենդանակերպ" },
  { href: "/zodiac/datit", label: "Նշանն ըստ ամսաթվի" },
  { href: "/zodiac/mtvare", label: "Լուսնի նշաններ" },
  { href: "/zodiac/amomavali", label: "Ասցենդենտներ" },
  { href: "/zodiac/elementebi", label: "Կենդանակերպի տարրեր" },
  { href: "/zodiac/gzamkvlevi", label: "Ամբողջական ուղեցույց" },
  { href: "/tests", label: "Թեստեր" },
  { href: "/features", label: "Հնարավորություններ" },
  { href: "/how-it-works", label: "Ինչպես է աշխատում" },
];

const TOOLS = [
  { href: "/horoskopi", label: "Օրական հորոսկոպ" },
  { href: "/zodiac/aries/2026", label: "Խոյ՝ 2026 թվականի հորոսկոպ" },
  { href: "/taro", label: "Տարո ընթերցում" },
  { href: "/quiz/namdvili-nishani", label: "Իմ իրական կենդանակերպի նշանը" },
  { href: "/quiz/varskvlavebis-zodiaqo", label: "Հայտնիների կենդանակերպը" },
  { href: "/pirovnebis-testi", label: "Անհատականության թեստ" },
  { href: "/mbti", label: "MBTI տիպեր" },
  { href: "/iq-testi", label: "IQ թեստ" },
  { href: "/eq-testi", label: "EQ թեստ" },
  { href: "/big-five", label: "Big Five թեստ" },
  { href: "/emociuri-inteleqti", label: "Էմոցիոնալ ինտելեկտ" },
];

export async function ArmenianFooter() {
  const onEnglishHost = await requestIsEnglishHost();
  const href = (path: string) => armenianSiteHref(path, onEnglishHost);

  return (
    <footer className="relative z-10 border-t border-border/40 bg-background/65 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-md">
          <Link href={href("/")} className="inline-flex items-center gap-2.5">
            <VividaMark size={36} id="armenian-footer" />
            <span className="text-xl font-semibold">vivida</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Անձնական աստղաբանություն, ծննդյան քարտեզներ և ինքնաճանաչման
            գործիքներ՝ ամբողջությամբ հայերենով:
          </p>
          <a
            href="mailto:hello@vivida.ge"
            className="mt-3 inline-block text-sm text-[var(--vivida-cyan)] hover:underline"
          >
            hello@vivida.ge
          </a>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Ուսումնասիրել
          </h2>
          <ul className="space-y-2 text-sm">
            {EXPLORE.map((item) => (
              <li key={item.href}>
                <Link
                  href={href(item.href)}
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
            Գործիքներ
          </h2>
          <ul className="space-y-2 text-sm">
            {TOOLS.map((item) => (
              <li key={item.href}>
                <Link
                  href={href(item.href)}
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
            Ընկերություն
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href={href("/about")}
                className="text-foreground/85 hover:text-foreground"
              >
                Մեր մասին
              </Link>
            </li>
            <li>
              <Link
                href={href("/privacy")}
                className="text-foreground/85 hover:text-foreground"
              >
                Գաղտնիության քաղաքականություն
              </Link>
            </li>
            <li>
              <Link
                href={href("/terms")}
                className="text-foreground/85 hover:text-foreground"
              >
                Օգտագործման պայմաններ
              </Link>
            </li>
            <li>
              <Link
                href={ENGLISH_SITE_URL}
                hrefLang="en"
                className="text-foreground/85 hover:text-foreground"
              >
                English version
              </Link>
            </li>
            <li>
              <Link
                href={GEORGIAN_SITE_URL}
                hrefLang="ka-GE"
                className="text-foreground/85 hover:text-foreground"
              >
                ქართული ვერსია
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/30 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Vivida. Բոլոր իրավունքները պաշտպանված են:
      </div>
    </footer>
  );
}
