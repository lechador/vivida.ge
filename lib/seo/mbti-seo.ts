/**
 * SEO data for the 16 MBTI personality-type landing pages (/mbti/[type]).
 * Slugs are the lowercase 4-letter codes (e.g. "infp") — they double as the
 * search term ("infp ქართულად") and the URL. Titles/descriptions/FAQ are
 * templated from the archetype so all 16 stay consistent; the rich body copy
 * comes from the pre-generated library at render time.
 */

import { MBTI_TYPES } from "@/lib/mbti-library";
import { mbtiArchetypeKa } from "@/lib/mbti-questions";
import { mbtiFamousFor } from "@/lib/mbti-characters";

export const ALL_MBTI_SLUGS: string[] = MBTI_TYPES.map((t) => t.toLowerCase());

/** "infp" → "INFP"; returns null for anything not one of the 16. */
export function mbtiCodeFromSlug(slug: string): string | null {
  const code = slug.toUpperCase();
  return (MBTI_TYPES as readonly string[]).includes(code) ? code : null;
}

/** The four 16Personalities groups, with Georgian labels. */
export const MBTI_GROUP: Record<string, { key: string; labelKa: string }> = {
  INTJ: { key: "analysts", labelKa: "ანალიტიკოსები" },
  INTP: { key: "analysts", labelKa: "ანალიტიკოსები" },
  ENTJ: { key: "analysts", labelKa: "ანალიტიკოსები" },
  ENTP: { key: "analysts", labelKa: "ანალიტიკოსები" },
  INFJ: { key: "diplomats", labelKa: "დიპლომატები" },
  INFP: { key: "diplomats", labelKa: "დიპლომატები" },
  ENFJ: { key: "diplomats", labelKa: "დიპლომატები" },
  ENFP: { key: "diplomats", labelKa: "დიპლომატები" },
  ISTJ: { key: "sentinels", labelKa: "მცველები" },
  ISFJ: { key: "sentinels", labelKa: "მცველები" },
  ESTJ: { key: "sentinels", labelKa: "მცველები" },
  ESFJ: { key: "sentinels", labelKa: "მცველები" },
  ISTP: { key: "explorers", labelKa: "მკვლევრები" },
  ISFP: { key: "explorers", labelKa: "მკვლევრები" },
  ESTP: { key: "explorers", labelKa: "მკვლევრები" },
  ESFP: { key: "explorers", labelKa: "მკვლევრები" },
};

/** Short evocative tagline per type — used in hero + meta. */
export const MBTI_TAGLINE_KA: Record<string, string> = {
  INTJ: "სტრატეგი მოაზროვნე, რომელიც ყველაფერს წინასწარ გეგმავს.",
  INTP: "ცნობისმოყვარე ანალიტიკოსი იდეებისა და თეორიების მიღმა.",
  ENTJ: "თამამი ლიდერი, რომელიც გზას იკვლევს და ხალხს უძღვება.",
  ENTP: "მახვილგონივრული მოკამათე და იდეების დაუშრეტელი წყარო.",
  INFJ: "იდეალისტი, რომელსაც სამყაროს შეცვლა სურს.",
  INFP: "პოეტური სული, საკუთარი ღირებულებებით ხელმძღვანელი.",
  ENFJ: "ქარიზმატული შთამაგონებელი, რომელიც სხვებს ზრდაში ეხმარება.",
  ENFP: "თავისუფალი, ენერგიული მეოცნებე უსაზღვრო ენთუზიაზმით.",
  ISTJ: "საიმედო, პრაქტიკული და ურყევად ორგანიზებული.",
  ISFJ: "თბილი მზრუნველი და ერთგული მცველი.",
  ESTJ: "ორგანიზატორი და წესრიგის შემქმნელი.",
  ESFJ: "მზრუნველი, რომელიც ხალხს აერთიანებს და ზრუნავს.",
  ISTP: "პრაქტიკული ოსტატი და უშიშარი ექსპერიმენტატორი.",
  ISFP: "მგრძნობიარე შემოქმედი და თავისუფალი სული.",
  ESTP: "ენერგიული, გაბედული და სპონტანური მოქმედი.",
  ESFP: "ცხოვრების ხალისი და ყურადღების ბუნებრივი ცენტრი.",
};

export type MbtiSeo = {
  code: string;
  slug: string;
  archetypeKa: string;
  taglineKa: string;
  group: { key: string; labelKa: string };
  pageTitle: string;
  metaDescription: string;
  faq: { q: string; a: string }[];
  /** Query variants (Georgian + Latin) for PopularSearches + JSON-LD. */
  queries: string[];
};

export function buildMbtiSeo(code: string): MbtiSeo {
  const archetypeKa = mbtiArchetypeKa(code);
  const taglineKa = MBTI_TAGLINE_KA[code] ?? "";
  const group = MBTI_GROUP[code] ?? { key: "", labelKa: "" };
  const famous = mbtiFamousFor(code).slice(0, 3).join(", ");

  return {
    code,
    slug: code.toLowerCase(),
    archetypeKa,
    taglineKa,
    group,
    pageTitle: `${code} — ${archetypeKa} | პიროვნების ტიპი`,
    metaDescription:
      `${code} (${archetypeKa}) პიროვნების ტიპის სრული აღწერა ქართულად: ` +
      `ძლიერი და სუსტი მხარეები, ურთიერთობები, კარიერა და ცნობილი ${code}-ები. ` +
      `გაიარე უფასო პიროვნების ტესტი Vivida-ზე.`,
    faq: [
      {
        q: `რას ნიშნავს ${code} ტიპი?`,
        a: `${code} ანუ „${archetypeKa}“ — 16 პიროვნების ტიპიდან ერთ-ერთი. ${taglineKa} ეს ტიპი აღწერს, როგორ იღებ ენერგიას, აღიქვამ ინფორმაციას, იღებ გადაწყვეტილებებს და აწყობ ცხოვრებას.`,
      },
      {
        q: `როგორ გავიგო, ${code} ვარ თუ არა?`,
        a: `გაიარე უფასო Astro-MBTI ტესტი — 60 კითხვა, დაახლოებით 7 წუთი. ტესტი განსაზღვრავს შენს ზუსტ ტიპს და მოგცემს დეტალურ, პერსონალურ ანალიზს.`,
      },
      {
        q: `ცნობილი ${code}-ები?`,
        a: famous
          ? `ამ ტიპს ხშირად მიაწერენ ისეთ ცნობილ ადამიანებს, როგორებიც არიან ${famous} და სხვები.`
          : `Astro-MBTI-ის სრულ პროფილში ნახავ, რომელ ცნობილ ადამიანებს მიაწერენ ამ ტიპს.`,
      },
    ],
    queries: [
      code,
      `${code} ქართულად`,
      `${code} პიროვნების ტიპი`,
      `mbti ${code}`,
      `${archetypeKa} პიროვნება`,
      "პიროვნების ტესტი",
      "16 personalities ქართულად",
    ],
  };
}
