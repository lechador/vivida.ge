import { signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { ELEMENT_EN, ZODIAC_SIGN_EN } from "@/lib/zodiac-sign-en";
import { type HoroscopeTheme } from "@/lib/seo/thematic-horoscope";

export const THEME_CONFIG_EN: Record<HoroscopeTheme, {
  label: string;
  shortLabel: string;
  title: string;
  description: string;
  intro: string;
  glyph: string;
}> = {
  love: {
    label: "Love Horoscope",
    shortLabel: "Love",
    title: "Love Horoscope: All 12 Zodiac Signs in Relationships",
    description: "Love horoscope for all 12 zodiac signs: attraction, emotional needs, relationship strengths, challenges, and practical guidance.",
    intro: "Explore how each zodiac sign approaches attraction, intimacy, trust, and partnership. Choose a sign for a detailed love profile and practical relationship guidance.",
    glyph: "♥",
  },
  finance: {
    label: "Money Horoscope",
    shortLabel: "Money",
    title: "Money Horoscope: Financial Traits of All Zodiac Signs",
    description: "Explore the money style of every zodiac sign, including financial strengths, spending risks, earning patterns, and practical habits.",
    intro: "Astrology cannot predict wealth, but it can offer a useful language for examining habits around security, value, risk, spending, and long-term planning.",
    glyph: "$",
  },
  career: {
    label: "Career Horoscope",
    shortLabel: "Career",
    title: "Career Horoscope: Work Style of All 12 Zodiac Signs",
    description: "Career horoscope for every zodiac sign: work style, professional strengths, growth areas, motivation, and suitable environments.",
    intro: "Discover what motivates each sign at work, which strengths it uses naturally, and which habits can support more sustainable professional growth.",
    glyph: "✦",
  },
};

export type ThematicHoroscopeEnglish = {
  main: string[];
  focus: string;
  watch: string;
  advice: string;
};

export function thematicHoroscopeEnglish(theme: HoroscopeTheme, sign: ZodiacSlug): ThematicHoroscopeEnglish {
  const meta = signMetaBySlug(sign)!;
  const profile = ZODIAC_SIGN_EN[sign];
  const name = meta.labelEn;
  const element = ELEMENT_EN[meta.element];

  if (theme === "love") {
    return {
      main: [
        profile.love,
        `${name} brings a ${element.toLowerCase()} rhythm to relationships. Attraction is only the opening; long-term compatibility depends on how both people communicate needs, repair conflict, respect boundaries, and make room for change. The Moon and Venus add important emotional and romantic detail beyond the Sun sign.`,
      ],
      focus: `${name} relationships become stronger when ${profile.strengths.slice(0, 3).join(", ").toLowerCase()} are expressed with reciprocity rather than expectation.`,
      watch: `Pay attention to ${profile.challenges.slice(0, 2).join(" and ").toLowerCase()}. These patterns are not destiny; naming them early makes trust and repair easier.`,
      advice: `Ask directly for the behavior that creates safety, and stay curious about a partner's different love language instead of treating it as a lack of care.`,
    };
  }
  if (theme === "career") {
    return {
      main: [
        profile.career,
        `${name}'s ${element} nature influences pace and motivation, but a satisfying career also depends on skills, opportunity, values, and working conditions. The strongest path gives ${name} a practical way to use ${profile.strengths.slice(0, 2).join(" and ").toLowerCase()} while developing systems around the parts that require more effort.`,
      ],
      focus: `${name} can create visible value through ${profile.strengths.slice(0, 3).join(", ").toLowerCase()}.`,
      watch: `Professional momentum may slow when ${profile.challenges.slice(0, 2).join(" and ").toLowerCase()} are left unmanaged.`,
      advice: `Choose one skill to deepen, one measurable result to own, and one working condition that protects your energy. A good career fit is built through evidence as well as self-knowledge.`,
    };
  }
  return {
    main: [
      `${name}'s approach to money often reflects its wider ${element.toLowerCase()} style: ${profile.core} These traits can influence earning, spending, saving, and how quickly financial decisions are made.`,
      `Astrology does not determine income or replace financial planning. For ${name}, the useful reflection is how to apply ${profile.strengths.slice(0, 2).join(" and ").toLowerCase()} to real numbers while preventing ${profile.challenges.slice(0, 2).join(" and ").toLowerCase()} from shaping costly habits.`,
    ],
    focus: `${name}'s financial strengths include ${profile.strengths.slice(0, 3).join(", ").toLowerCase()}, especially when goals are specific and progress is reviewed consistently.`,
    watch: `Watch for ${profile.challenges.slice(0, 2).join(" and ").toLowerCase()} in spending, negotiation, or risk decisions.`,
    advice: `Use a written budget, automate a realistic reserve, and pause before major commitments. Base important financial decisions on evidence and qualified advice, not a horoscope alone.`,
  };
}
