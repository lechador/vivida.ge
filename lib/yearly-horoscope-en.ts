import { signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { ZODIAC_SIGN_EN } from "@/lib/zodiac-sign-en";

type YearTheme = {
  theme: string;
  opportunity: string;
  grounding: string;
  supportiveMonths: string[];
  reflectiveMonths: string[];
};

const THEMES_2026: Record<ZodiacSlug, YearTheme> = {
  aries: { theme: "turning bold beginnings into a sustainable new chapter", opportunity: "taking visible initiative without carrying every responsibility alone", grounding: "pace, follow-through, and clear agreements", supportiveMonths: ["April", "July", "October"], reflectiveMonths: ["February", "August"] },
  taurus: { theme: "updating the structures that once felt permanent", opportunity: "building security around present values rather than old habits", grounding: "flexibility, honest budgeting, and gradual experimentation", supportiveMonths: ["April", "July", "October"], reflectiveMonths: ["March", "September"] },
  gemini: { theme: "choosing the ideas and relationships worthy of sustained attention", opportunity: "giving a strong voice to work that connects people or information", grounding: "priorities, repetition, and emotional presence", supportiveMonths: ["April", "July", "October"], reflectiveMonths: ["February", "September"] },
  cancer: { theme: "creating a stronger inner base while becoming more visible", opportunity: "leading through care, intuition, and emotional intelligence", grounding: "boundaries, direct requests, and restorative routines", supportiveMonths: ["April", "July", "October"], reflectiveMonths: ["February", "September"] },
  leo: { theme: "expressing creativity with greater purpose and maturity", opportunity: "taking ownership of a project that deserves your full presence", grounding: "shared credit, patience, and openness to feedback", supportiveMonths: ["April", "July", "October", "December"], reflectiveMonths: ["February", "August"] },
  virgo: { theme: "replacing perfection with a more humane form of mastery", opportunity: "turning precise knowledge into useful, visible contribution", grounding: "rest, delegation, and progress measured over time", supportiveMonths: ["April", "July", "October"], reflectiveMonths: ["March", "November"] },
  libra: { theme: "making clear choices that preserve both connection and self-respect", opportunity: "forming partnerships based on explicit reciprocity", grounding: "decisiveness, constructive conflict, and named preferences", supportiveMonths: ["April", "July", "October"], reflectiveMonths: ["March", "November"] },
  scorpio: { theme: "releasing an old power struggle and investing in what can genuinely transform", opportunity: "using emotional depth for focused creative or professional renewal", grounding: "transparency, trust built slowly, and flexible control", supportiveMonths: ["April", "August", "November"], reflectiveMonths: ["February", "June"] },
  sagittarius: { theme: "giving freedom a direction strong enough to create real growth", opportunity: "expanding through study, travel, teaching, or a wider audience", grounding: "commitment, detail, and respect for practical limits", supportiveMonths: ["March", "July", "October", "November"], reflectiveMonths: ["May", "September"] },
  capricorn: { theme: "building success around a definition that feels personally meaningful", opportunity: "taking long-term authority while simplifying an outdated burden", grounding: "emotional availability, recovery time, and adaptable plans", supportiveMonths: ["April", "July", "October"], reflectiveMonths: ["February", "September"] },
  aquarius: { theme: "bringing an unconventional idea into a form other people can use", opportunity: "finding community around a future-facing project or principle", grounding: "consistency, intimacy, and attention to immediate realities", supportiveMonths: ["March", "July", "October"], reflectiveMonths: ["May", "December"] },
  pisces: { theme: "giving imagination a clear container and practical next step", opportunity: "turning empathy or creativity into work with visible impact", grounding: "evidence, boundaries, and simple daily structure", supportiveMonths: ["March", "July", "October"], reflectiveMonths: ["May", "August"] },
};

export type YearlyHoroscopeEnglish = {
  title: string;
  description: string;
  tagline: string;
  overview: string[];
  supportiveMonths: string[];
  reflectiveMonths: string[];
  sections: Array<{ title: string; body: string }>;
  advice: string;
  faq: Array<{ q: string; a: string }>;
};

export function yearlyHoroscopeEnglish(sign: ZodiacSlug, year: number): YearlyHoroscopeEnglish {
  const name = signMetaBySlug(sign)!.labelEn;
  const profile = ZODIAC_SIGN_EN[sign];
  const focus = THEMES_2026[sign];
  const title = `${name} Horoscope ${year}: Love, Career and Year Ahead`;
  const description = `${name} ${year} horoscope: explore the year's central themes for love, career, money, wellbeing, and personal growth, with practical guidance.`;
  const sections = [
    { title: "Love and relationships", body: `${profile.love} In ${year}, relationships become a place to practice ${focus.grounding}. Singles can benefit from watching for consistent behavior rather than only immediate chemistry, while established bonds grow through clearer expectations and space for both people to evolve.` },
    { title: "Career and direction", body: `${profile.career} This year's strongest professional opportunity lies in ${focus.opportunity}. Choose work that can reward your natural strengths—${profile.strengths.slice(0, 2).join(" and ").toLowerCase()}—while building a repeatable process around them.` },
    { title: "Money and resources", body: `${year} favors financial decisions that support the larger theme of ${focus.theme}. Review recurring costs, protect a realistic reserve, and distinguish a strategic investment from an impulse. Astrology can frame reflection, but significant financial choices should rely on your actual numbers and qualified advice.` },
    { title: "Wellbeing and energy", body: `Your energy is easier to sustain when ambition is balanced with recovery. Notice whether ${profile.challenges[0].toLowerCase()} or ${profile.challenges[1].toLowerCase()} is creating unnecessary strain. Consistent sleep, movement, nourishment, and professional healthcare when needed matter more than any horoscope timing.` },
    { title: "Personal growth", body: `The deeper work of ${year} is ${focus.theme}. Use reflection as a bridge to action: name one pattern to release, one skill to develop, and one relationship or project that deserves steady attention. The goal is not to become less ${name}, but to express the sign's strengths with more choice.` },
  ];
  const faq = [
    { q: `What is the main theme for ${name} in ${year}?`, a: `The central theme is ${focus.theme}. Progress comes through ${focus.grounding}.` },
    { q: `What does the ${name} ${year} horoscope say about love?`, a: sections[0].body },
    { q: `Which months are highlighted for ${name} in ${year}?`, a: `${focus.supportiveMonths.join(", ")} are supportive planning months, while ${focus.reflectiveMonths.join(" and ")} are better used for review and course correction. Treat these as reflective prompts rather than guarantees.` },
    { q: "Is a yearly Sun-sign horoscope personal?", a: "It is a broad interpretation for one placement. A personal forecast also considers your rising sign, houses, natal planets, aspects, location, and exact birth time." },
  ];
  return {
    title,
    description,
    tagline: `${year} is a year for ${focus.theme}.`,
    overview: [
      `${year} asks ${name} to focus on ${focus.theme}. ${profile.core} The opportunity is to use these instincts deliberately, choosing a direction that can hold your energy after the first wave of motivation has passed.`,
      `The year supports ${focus.opportunity}. At the same time, ${focus.grounding} will keep progress realistic. This horoscope describes broad Sun-sign themes; use it as a planning and reflection tool alongside the concrete facts of your life.`,
    ],
    supportiveMonths: focus.supportiveMonths,
    reflectiveMonths: focus.reflectiveMonths,
    sections,
    advice: `Let ${profile.strengths[0].toLowerCase()} lead, but give it structure. The most useful question for ${year} is not “What should happen?” but “What can I practice consistently enough to change the outcome?”`,
    faq,
  };
}

