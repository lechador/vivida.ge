import { SIGNS } from "@/lib/zodiac";
import { ZODIAC_DATES, type ZodiacSlug } from "@/lib/seo/zodiac-dates";

export const ELEMENT_EN: Record<string, string> = {
  ცეცხლი: "Fire",
  მიწა: "Earth",
  ჰაერი: "Air",
  წყალი: "Water",
  Fire: "Fire",
  Earth: "Earth",
  Air: "Air",
  Water: "Water",
};

export const MODALITY_EN: Record<string, string> = {
  კარდინალური: "Cardinal",
  ფიქსირებული: "Fixed",
  მუტაბელური: "Mutable",
  Cardinal: "Cardinal",
  Fixed: "Fixed",
  Mutable: "Mutable",
};

export const RULER_EN: Record<string, string> = {
  მარსი: "Mars",
  ვენერა: "Venus",
  მერკური: "Mercury",
  მთვარე: "Moon",
  მზე: "Sun",
  პლუტონი: "Pluto",
  იუპიტერი: "Jupiter",
  სატურნი: "Saturn",
  ურანი: "Uranus",
  ნეპტუნი: "Neptune",
};

export const COMPATIBILITY_EN: Record<string, string> = {
  ძლიერი: "Strong",
  ჰარმონიული: "Harmonious",
  გამომწვევი: "Dynamic",
};

export type ZodiacSignEnEntry = {
  tagline: string;
  core: string;
  intro: string;
  personality: string[];
  strengths: string[];
  weaknesses: string[];
  challenges: string[];
  love: string;
  career: string;
  compatibility: Array<{ signSlug: ZodiacSlug; signEn: string; level: string; note: string }>;
  famous: string[];
  faq: Array<{ q: string; a: string }>;
};

export const ZODIAC_SIGN_EN: Record<ZodiacSlug, ZodiacSignEnEntry> = Object.fromEntries(
  SIGNS.map((s) => {
    const core = `${s.labelEn} (${ZODIAC_DATES[s.slug].rangeEn}) is a ${s.modalityEn.toLowerCase()} ${s.elementEn.toLowerCase()} sign ruled by ${s.rulerEn}.`;
    const challenges = [
      "Restlessness when routines feel stagnant",
      "Taking on too much responsibility alone",
    ];
    return [
      s.slug,
      {
        tagline: `A ${s.modalityEn.toLowerCase()} ${s.elementEn.toLowerCase()} sign ruled by ${s.rulerEn}, known for clarity, depth, and unmistakable presence.`,
        core,
        intro: core,
        personality: [
          `${s.labelEn} combines the elemental energy of ${s.elementEn} with a ${s.modalityEn.toLowerCase()} approach to life and relationships.`,
        ],
        strengths: [
          "Authentic presence and clear intuition",
          "Steady commitment to personal values",
          "Capacity for growth and self-reflection",
        ],
        weaknesses: challenges,
        challenges,
        love: `In love, ${s.labelEn} seeks genuine connection, mutual respect, and emotional honesty.`,
        career: `In career and creative work, ${s.labelEn} excels where purpose, autonomy, and craft meet.`,
        compatibility: SIGNS.filter((o) => o.slug !== s.slug)
          .slice(0, 4)
          .map((o) => ({
            signSlug: o.slug,
            signEn: o.labelEn,
            level: "Strong",
            note: `${s.labelEn} and ${o.labelEn} share a complementary and engaging dynamic.`,
          })),
        famous: [],
        faq: [
          {
            q: `What are ${s.labelEn} dates?`,
            a: `${s.labelEn} dates are ${ZODIAC_DATES[s.slug].rangeEn}.`,
          },
          {
            q: `What element is ${s.labelEn}?`,
            a: `${s.labelEn} is a ${s.elementEn} sign (${s.modalityEn} modality) ruled by ${s.rulerEn}.`,
          },
        ],
      },
    ];
  }),
) as unknown as Record<ZodiacSlug, ZodiacSignEnEntry>;
