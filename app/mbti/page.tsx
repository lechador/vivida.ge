import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { PopularSearches } from "@/components/seo/popular-searches";
import { SiteFooter } from "@/components/site-footer";
import { SmartHeader } from "@/components/smart-header";
import { Starfield } from "@/components/landing/starfield";
import { Button } from "@/components/ui/button";
import { MBTI_TYPES } from "@/lib/mbti-library";
import { mbtiCharacterSrc } from "@/lib/mbti-characters";
import { buildMbtiSeo, MBTI_GROUP } from "@/lib/seo/mbti-seo";
import { breadcrumbLd, faqLd, serializeLd } from "@/lib/seo/jsonld";

const SITE_URL = "https://www.vivida.ge";

const TITLE = "16 პიროვნების ტიპი — MBTI ტიპები ქართულად";
const DESCRIPTION =
  "16 პიროვნების ტიპის სრული ჩამონათვალი ქართულად (MBTI / 16Personalities). აღწერა, ძლიერი და სუსტი მხარეები, ურთიერთობები და კარიერა — გაიარე უფასო პიროვნების ტესტი.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "16 პიროვნების ტიპი",
    "პიროვნების ტიპები",
    "mbti ტიპები",
    "mbti ქართულად",
    "16 personalities ქართულად",
    "პიროვნების ტესტი",
    "ფსიქოლოგიური ტიპები",
  ],
  alternates: { canonical: `${SITE_URL}/mbti` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/mbti`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Vivida",
    locale: "ka_GE",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const GROUP_ORDER = ["analysts", "diplomats", "sentinels", "explorers"] as const;
const GROUP_LABEL: Record<string, { labelKa: string; blurbKa: string }> = {
  analysts: { labelKa: "ანალიტიკოსები", blurbKa: "ლოგიკა, სტრატეგია და დამოუკიდებელი აზროვნება." },
  diplomats: { labelKa: "დიპლომატები", blurbKa: "ემპათია, იდეალიზმი და ღრმა ღირებულებები." },
  sentinels: { labelKa: "მცველები", blurbKa: "წესრიგი, საიმედოობა და პრაქტიკულობა." },
  explorers: { labelKa: "მკვლევრები", blurbKa: "სპონტანურობა, ხელოვნება და მოქმედება." },
};

export default function MbtiHubPage() {
  const byGroup = GROUP_ORDER.map((g) => ({
    group: g,
    ...GROUP_LABEL[g],
    types: (MBTI_TYPES as readonly string[]).filter((t) => MBTI_GROUP[t]?.key === g),
  }));

  const faq = [
    {
      q: "რა არის 16 პიროვნების ტიპი?",
      a: "16 პიროვნების ტიპი (MBTI / 16Personalities) ხასიათს აღწერს ოთხი ღერძით: ინტროვერსია/ექსტრავერსია, სენსორიკა/ინტუიცია, ლოგიკა/გრძნობა და ორგანიზებულობა/სპონტანურობა. მათი კომბინაცია ქმნის 16 უნიკალურ ტიპს.",
    },
    {
      q: "როგორ გავიგო ჩემი ტიპი?",
      a: "გაიარე უფასო Astro-MBTI ტესტი — 60 კითხვა, დაახლოებით 7 წუთი. მიიღებ შენს ზუსტ ტიპსა და დეტალურ პერსონალურ ანალიზს.",
    },
  ];

  const ld = [
    breadcrumbLd([
      { name: "მთავარი", url: SITE_URL },
      { name: "ტესტები", url: `${SITE_URL}/tests` },
      { name: "პიროვნების ტიპები", url: `${SITE_URL}/mbti` },
    ]),
    faqLd(faq),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: (MBTI_TYPES as readonly string[]).map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/mbti/${t.toLowerCase()}`,
        name: `${t} — ${buildMbtiSeo(t).archetypeKa}`,
      })),
    },
  ];

  return (
    <main className="relative isolate flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_50%_-5%,oklch(0.32_0.18_305/0.55),transparent_70%),radial-gradient(45%_30%_at_85%_30%,oklch(0.30_0.15_220/0.45),transparent_70%)]"
      />
      <Starfield count={120} shooting={2} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeLd(ld) }}
      />

      <SmartHeader />

      <section className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <header className="mb-8 text-center sm:mb-10">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            MBTI · 16Personalities
          </div>
          <h1 className="mt-1 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            16 პიროვნების{" "}
            <span className="bg-[linear-gradient(120deg,var(--vivida-violet),var(--vivida-pink),var(--vivida-cyan))] bg-clip-text text-transparent">
              ტიპი
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm text-foreground/80 sm:text-base">
            აირჩიე ტიპი და წაიკითხე სრული აღწერა ქართულად — ან გაიარე ტესტი და
            გაიგე შენი ტიპი.
          </p>
          <Button asChild variant="mystic" size="lg" className="mt-5">
            <Link href="/pirovnebis-testi">გაიარე ტესტი</Link>
          </Button>
        </header>

        <div className="space-y-8">
          {byGroup.map((g) => (
            <div key={g.group}>
              <div className="mb-3">
                <h2 className="text-lg font-semibold tracking-tight">{g.labelKa}</h2>
                <p className="text-sm text-muted-foreground">{g.blurbKa}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {g.types.map((t) => {
                  const s = buildMbtiSeo(t);
                  return (
                    <Link
                      key={t}
                      href={`/mbti/${s.slug}`}
                      className="flex flex-col items-center rounded-2xl border border-border bg-card/50 p-4 text-center ring-1 ring-foreground/5 backdrop-blur-xl transition-colors hover:border-[var(--vivida-violet)]/50 hover:bg-card/70"
                    >
                      <Image
                        src={mbtiCharacterSrc(t)}
                        alt={`${t} — ${s.archetypeKa}`}
                        width={96}
                        height={96}
                        className="h-20 w-20 object-contain"
                      />
                      <span className="mt-2 text-base font-bold tracking-wide">{t}</span>
                      <span className="text-xs text-muted-foreground">{s.archetypeKa}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            ხშირად დასმული კითხვები
          </h2>
          <div className="space-y-3">
            {faq.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-card/50 ring-1 ring-foreground/5 backdrop-blur-xl"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 font-medium [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-foreground/85">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <PopularSearches
          queries={[
            "16 პიროვნების ტიპი",
            "პიროვნების ტესტი",
            "mbti ქართულად",
            "16 personalities ქართულად",
            "ფსიქოლოგიური ტესტი",
          ]}
        />
      </section>

      <SiteFooter />
    </main>
  );
}
