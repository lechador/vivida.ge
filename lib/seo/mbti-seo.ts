/**
 * SEO data for the 16 MBTI personality-type landing pages (/mbti/[type]).
 * Slugs are the lowercase 4-letter codes (e.g. "infp") — they double as the
 * search term ("infp ქართულად") and the URL. Titles/descriptions/FAQ are
 * templated from the archetype so all 16 stay consistent; the rich body copy
 * comes from the pre-generated library at render time.
 */

import { mbtiArchetypeKa } from "@/lib/mbti-questions";
import { mbtiFamousFor } from "@/lib/mbti-characters";
import { mbtiEnglishContent } from "@/lib/mbti-content-en";

export const ALL_MBTI_TYPES = [
  "ISTJ",
  "ISFJ",
  "INFJ",
  "INTJ",
  "ISTP",
  "ISFP",
  "INFP",
  "INTP",
  "ESTP",
  "ESFP",
  "ENFP",
  "ENTP",
  "ESTJ",
  "ESFJ",
  "ENFJ",
  "ENTJ",
] as const;

export const ALL_MBTI_SLUGS: string[] = ALL_MBTI_TYPES.map((t) =>
  t.toLowerCase(),
);

/** "infp" → "INFP"; returns null for anything not one of the 16. */
export function mbtiCodeFromSlug(slug: string): string | null {
  const code = slug.toUpperCase();
  return (ALL_MBTI_TYPES as readonly string[]).includes(code) ? code : null;
}

/** The four 16Personalities groups, with localized labels. */
export const MBTI_GROUP: Record<
  string,
  { key: string; labelKa: string; labelEn: string; labelAm: string }
> = {
  INTJ: {
    key: "analysts",
    labelKa: "ანალიტიკოსები",
    labelEn: "Analysts",
    labelAm: "Անալիտիկներ",
  },
  INTP: {
    key: "analysts",
    labelKa: "ანალიტიკოსები",
    labelEn: "Analysts",
    labelAm: "Անալիտիկներ",
  },
  ENTJ: {
    key: "analysts",
    labelKa: "ანალიტიკოსები",
    labelEn: "Analysts",
    labelAm: "Անալիտիկներ",
  },
  ENTP: {
    key: "analysts",
    labelKa: "ანალიტიკოსები",
    labelEn: "Analysts",
    labelAm: "Անալիտիկներ",
  },
  INFJ: {
    key: "diplomats",
    labelKa: "დიპლომატები",
    labelEn: "Diplomats",
    labelAm: "Դիվանագետներ",
  },
  INFP: {
    key: "diplomats",
    labelKa: "დიპლომატები",
    labelEn: "Diplomats",
    labelAm: "Դիվանագետներ",
  },
  ENFJ: {
    key: "diplomats",
    labelKa: "დიპლომატები",
    labelEn: "Diplomats",
    labelAm: "Դիվանագետներ",
  },
  ENFP: {
    key: "diplomats",
    labelKa: "დიპლომატები",
    labelEn: "Diplomats",
    labelAm: "Դիվանագետներ",
  },
  ISTJ: {
    key: "sentinels",
    labelKa: "მცველები",
    labelEn: "Sentinels",
    labelAm: "Պահապաններ",
  },
  ISFJ: {
    key: "sentinels",
    labelKa: "მცველები",
    labelEn: "Sentinels",
    labelAm: "Պահապաններ",
  },
  ESTJ: {
    key: "sentinels",
    labelKa: "მცველები",
    labelEn: "Sentinels",
    labelAm: "Պահապաններ",
  },
  ESFJ: {
    key: "sentinels",
    labelKa: "მცველები",
    labelEn: "Sentinels",
    labelAm: "Պահապաններ",
  },
  ISTP: {
    key: "explorers",
    labelKa: "მკვლევრები",
    labelEn: "Explorers",
    labelAm: "Հետազոտողներ",
  },
  ISFP: {
    key: "explorers",
    labelKa: "მკვლევრები",
    labelEn: "Explorers",
    labelAm: "Հետազոտողներ",
  },
  ESTP: {
    key: "explorers",
    labelKa: "მკვლევრები",
    labelEn: "Explorers",
    labelAm: "Հետազոտողներ",
  },
  ESFP: {
    key: "explorers",
    labelKa: "მკვლევრები",
    labelEn: "Explorers",
    labelAm: "Հետազոտողներ",
  },
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

export type MbtiSeoEn = {
  code: string;
  slug: string;
  archetype: string;
  tagline: string;
  group: { key: string; labelEn: string };
  pageTitle: string;
  metaDescription: string;
  faq: { q: string; a: string }[];
  queries: string[];
};

export function buildMbtiSeoEn(code: string): MbtiSeoEn {
  const content = mbtiEnglishContent(code);
  const group = MBTI_GROUP[code] ?? {
    key: "",
    labelKa: "",
    labelEn: "",
    labelAm: "",
  };
  const famous = mbtiFamousFor(code).slice(0, 3).join(", ");
  return {
    code,
    slug: code.toLowerCase(),
    archetype: content.archetype,
    tagline: content.tagline,
    group: { key: group.key, labelEn: group.labelEn },
    pageTitle: `${code} — ${content.archetype} Personality Type`,
    metaDescription: `Explore the ${code} (${content.archetype}) personality type: core preferences, strengths, challenges, relationships, career patterns and practical growth ideas.`,
    faq: [
      {
        q: `What does the ${code} personality type mean?`,
        a: `${code}, often called the ${content.archetype}, is one of sixteen MBTI-style preference patterns. ${content.tagline} It describes common tendencies, not fixed ability or a diagnosis.`,
      },
      {
        q: `How can I find out whether I am ${code}?`,
        a: "Take Vivida’s free 60-question personality test. You will receive a type, dimension percentages and a personalized profile in about seven minutes.",
      },
      {
        q: `Which famous people are commonly typed as ${code}?`,
        a: famous
          ? `${famous} are among the public figures often associated with ${code}. These typings are informal interpretations, not verified facts.`
          : `Public-figure personality typings are informal interpretations rather than verified facts.`,
      },
    ],
    queries: [
      code,
      `${code} personality type`,
      `${code} strengths`,
      `${code} relationships`,
      `MBTI ${code}`,
      "16 personality types",
      "personality test",
    ],
  };
}

export type MbtiSeoAm = {
  code: string;
  slug: string;
  archetype: string;
  tagline: string;
  group: { key: string; labelAm: string };
  pageTitle: string;
  metaDescription: string;
  faq: { q: string; a: string }[];
  queries: string[];
};

export function buildMbtiSeoAm(code: string): MbtiSeoAm {
  // Armenian MBTI library removed: no Armenian body copy remains. The export
  // stays until app/mbti/[type] drops its `am` branch (cross-area).
  const group = MBTI_GROUP[code] ?? {
    key: "",
    labelKa: "",
    labelEn: "",
    labelAm: "",
  };
  const archetype = code;
  const tagline = "";
  return {
    code,
    slug: code.toLowerCase(),
    archetype,
    tagline,
    group: { key: group.key, labelAm: group.labelAm },
    pageTitle: `${code} — ${archetype} | Անհատականության տիպ`,
    metaDescription: `${code} (${archetype}) անհատականության տիպի ամբողջական նկարագրությունը հայերենով. ուժեղ և թույլ կողմեր, հարաբերություններ, կարիերա: Անցեք անվճար թեստ Vivida-ում:`,
    faq: [
      {
        q: `Ի՞նչ է նշանակում ${code} տիպը:`,
        a: `${code} կամ „${archetype}“՝ 16 անհատականության տիպերից մեկն է: ${tagline}`,
      },
      {
        q: `Ինչպե՞ս պարզել՝ արդյոք ես ${code} եմ:`,
        a: "Անցեք Vivida-ի անվճար անհատականության թեստը և ստացեք ձեր տիպի մանրամասն վերլուծությունը:",
      },
    ],
    queries: [
      code,
      `${code} հայերեն`,
      `${code} տիպ`,
      `MBTI ${code}`,
      "16 անհատականության տիպեր",
      "անձի թեստ",
    ],
  };
}
