import type { HoroscopeTheme } from "@/lib/seo/thematic-horoscope";
import type { ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { signMetaBySlug } from "@/lib/seo/zodiac-dates";
import { SIGNS_CONTENT_EN } from "@/lib/seo/zodiac-content-en";

export type ThemeConfigEn = {
  label: string;
  shortLabel: string;
  glyph: string;
  title: string;
  description: string;
  intro: string;
};

export const THEME_CONFIG_EN: Record<HoroscopeTheme, ThemeConfigEn> = {
  love: {
    label: "Love Horoscope",
    shortLabel: "Love",
    glyph: "♀",
    title: "Love Horoscope by Zodiac Sign: Relationships & Attraction",
    description:
      "Explore how all 12 zodiac signs approach love, intimacy, communication, commitment, and relationship growth.",
    intro:
      "Every Sun sign expresses affection in its own language—some through bold initiative, others through steady devotion, thoughtful dialogue, or deep emotional attunement.",
  },
  career: {
    label: "Career Horoscope",
    shortLabel: "Career",
    glyph: "♃",
    title: "Career Horoscope by Zodiac Sign: Work Style & Strengths",
    description:
      "Discover each zodiac sign's professional strengths, leadership style, workplace motivation, and practical growth habits.",
    intro:
      "Your Sun sign highlights how you initiate projects, collaborate with a team, and sustain motivation over the long run.",
  },
  finance: {
    label: "Money & Finance Horoscope",
    shortLabel: "Finance",
    glyph: "♄",
    title: "Finance Horoscope by Zodiac Sign: Money Habits & Security",
    description:
      "How each zodiac sign approaches earning, saving, risk, and long-term material stability.",
    intro:
      "Financial habits often reflect temperament: how we weigh immediate experience against future security and independence.",
  },
};

export function thematicHoroscopeEnglish(
  theme: HoroscopeTheme,
  sign: ZodiacSlug,
): {
  focus: string;
  main: string[];
  watch: string;
  advice: string;
} {
  const meta = signMetaBySlug(sign)!;
  const en = SIGNS_CONTENT_EN[sign];
  const loveArr = en?.love ? [en.love] : [];
  const careerArr = en?.career ? [en.career] : [];

  if (theme === "love") {
    return {
      focus: `${meta.labelEn} brings ${meta.elementEn.toLowerCase()}-sign sincerity, presence, and unmistakable personal rhythm to close relationships.`,
      main:
        loveArr.length > 0
          ? loveArr
          : [
              `In relationships, ${meta.labelEn} values genuine connection, mutual respect, and emotional honesty.`,
            ],
      watch: `Avoid assuming your partner automatically reads unspoken expectations during stressful weeks.`,
      advice: `State what makes you feel appreciated in simple, concrete terms and leave space for your partner's pace.`,
    };
  }
  if (theme === "career") {
    return {
      focus: `${meta.labelEn} thrives in roles that honor its ${meta.modalityEn.toLowerCase()} ${meta.elementEn.toLowerCase()} strengths and sense of purpose.`,
      main:
        careerArr.length > 0
          ? careerArr
          : [
              `At work, ${meta.labelEn} contributes clearest when goals and autonomy are well defined.`,
            ],
      watch: `Watch for overcommitting or losing momentum when priorities are left vague.`,
      advice: `Align your daily schedule with one high-leverage priority before reacting to small distractions.`,
    };
  }
  return {
    focus: `${meta.labelEn} balances practical resourcefulness with its core values when making financial decisions.`,
    main: [
      ...careerArr,
      `With money and long-term resources, ${meta.labelEn} benefits from a rhythm that supports both stability and personal freedom.`,
    ],
    watch: `Guard against impulse decisions driven by temporary stress or comparison.`,
    advice: `Automate your baseline savings so day-to-day choices feel calm and intentional.`,
  };
}
