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

const FINANCE_EN: Record<ZodiacSlug, { focus: string; risk: string; advice: string }> = {
  aries: {
    focus: "You grow income through bold initiative, competitive drive, and decisive action. Entrepreneurship and performance-linked compensation suit your nature well.",
    risk: "Impulsive financial decisions and spending on immediate gratification can easily destabilize your budget.",
    advice: "Take a 24-hour cooling pause before large discretionary purchases, and automate savings transfers the moment income arrives.",
  },
  taurus: {
    focus: "Stability, enduring quality, and long-term value are your financial bedrock. You preserve and compound carefully built resources with admirable patience.",
    risk: "An appetite for luxury and premium comfort can sometimes drift into overspending or an excessive reluctance to adapt to new opportunities.",
    advice: "Pre-allocate a dedicated comfort allowance in your monthly budget, and periodically review your investments with calm detachment.",
  },
  gemini: {
    focus: "Information, agile communication, and skillfully managing multiple revenue streams expand your financial potential.",
    risk: "Rapidly shifting interests and launching too many ideas simultaneously can scatter your time and capital.",
    advice: "Commit to one primary financial milestone for 90 consecutive days, keeping incoming new project ideas logged in a separate ideas notebook.",
  },
  cancer: {
    focus: "A deep-seated need for emotional and domestic security fuels a highly responsible long-term savings plan for your household.",
    risk: "Emotional spending during stressful periods or bailing out loved ones at the expense of your own financial health.",
    advice: "Establish a robust emergency reserve, and set clear, pre-defined boundaries on personal loans and financial assistance.",
  },
  leo: {
    focus: "Confidence, creative flair, and authentic personal branding help you command premium rates and expand earnings.",
    risk: "Spending to project status, make a grand impression, or offer lavish gestures can sometimes outpace your actual disposable income.",
    advice: "Tie major prestige purchases strictly to achieved annual milestones, maintaining a disciplined cap until new revenue is locked in.",
  },
  virgo: {
    focus: "Meticulous attention to detail, analytical rigor, and practical budgeting give you natural financial discipline and clean order.",
    risk: "Over-analyzing decisions to the point of paralysis, or feeling disproportionate anxiety over small, routine expenses.",
    advice: "Implement a streamlined automated tracking system, and restrict detailed financial reviews to once a week.",
  },
  libra: {
    focus: "Diplomatic negotiation, collaborative partnerships, and refined aesthetic judgment unlock profitable opportunities.",
    risk: "Spending excessively to preserve social harmony or avoiding necessary but uncomfortable financial discussions with partners.",
    advice: "Put all shared expenses and business agreements in writing, establishing clear maximum spending limits on joint ventures.",
  },
  scorpio: {
    focus: "Strategic foresight, investigative research, and managing complex resources give you exceptional financial resilience and leverage.",
    risk: "A desire for total control or secretive financial habits can undermine mutual trust in partnerships and marriages.",
    advice: "Map out your multi-year strategy in clear numbers, scheduling regular, transparent check-ins regarding shared accounts.",
  },
  sagittarius: {
    focus: "A broad visionary horizon, higher education, and international perspectives open up expansive, unconventional avenues of revenue.",
    risk: "Unbounded optimism and heavy travel or adventure expenses can lead you to underestimate downside financial risk.",
    advice: "Evaluate big ventures using best- and worst-case scenarios, and maintain a dedicated, separate travel fund.",
  },
  capricorn: {
    focus: "Disciplined execution, organizational responsibility, and steadfast long-term vision build durable, compounding wealth over time.",
    risk: "An exclusive focus on defensive security can needlessly restrict your quality of life or cause you to bypass calculated growth moves.",
    advice: "Allocate a fixed percentage of income for leisure, health, and skill upgrades alongside your primary savings reserves.",
  },
  aquarius: {
    focus: "Innovation, technology, and unorthodox business models help you discover unique, non-traditional avenues of income.",
    risk: "Falling in love with abstract concepts while overlooking practical daily operational details, positive cash flow, and market demand.",
    advice: "Earmark a modest budget for experimental ventures, scaling up investment only after seeing measurable, validated results.",
  },
  pisces: {
    focus: "Sharp intuition, artistic talent, and deep empathy for human needs connect you with meaningful work and rewarding compensation.",
    risk: "Ambiguous agreements, chronic underpricing of your services, or loose emotional generosity eroding your financial safety.",
    advice: "Formalize pricing, deliverables, and payment deadlines in written contracts upfront, and automate your monthly savings.",
  },
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
  const f = FINANCE_EN[sign];
  return {
    main: [
      `${name}'s approach to money reflects its core strengths and decision pace: ${f.focus}`,
      `Financial growth does not rely on horoscope superstition, but on conscious daily habits, a clear measurable plan, and disciplined risk management. For ${name}, the key is applying natural strengths while keeping spending risks well managed.`,
    ],
    focus: f.focus,
    watch: f.risk,
    advice: f.advice,
  };
}
