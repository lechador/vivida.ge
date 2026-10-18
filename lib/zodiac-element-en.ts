import { SIGNS_BY_ELEMENT, type ElementSlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";

export type ElementEnglishContent = {
  slug: ElementSlug;
  name: string;
  title: string;
  description: string;
  tagline: string;
  signs: ZodiacSlug[];
  intro: string[];
  personality: string[];
  traits: string[];
  love: string;
  inLove: string[];
  career: string;
  inWork: string[];
  compatibility: string[];
  balance: string[];
  strengths: string[];
  challenges: string[];
  faq: Array<{ q: string; a: string }>;
};

export const ELEMENT_ENGLISH: Record<ElementSlug, ElementEnglishContent> = {
  fire: {
    slug: "fire",
    name: "Fire",
    title: "Fire Signs in Astrology: Aries, Leo and Sagittarius",
    description: "Explore the Fire element in astrology: Aries, Leo, and Sagittarius traits, passion, creativity, and compatibility.",
    tagline: "Vitality, courage, creative spark, and direct action.",
    signs: SIGNS_BY_ELEMENT.fire,
    intro: ["Fire signs bring warmth, momentum, and visionary enthusiasm to the zodiac."],
    personality: ["Fire signs act from instinct, courage, and an unmistakable zest for life."],
    traits: ["Bold, expressive, and action-oriented."],
    love: "Passionate, direct, and generous with affection.",
    inLove: ["Passionate, direct, and generous with affection."],
    career: "Natural initiators who thrive on leadership and creative challenges.",
    inWork: ["Natural initiators who thrive on leadership and creative challenges."],
    compatibility: ["Fire harmonizes naturally with fellow Fire signs and intellectually curious Air signs."],
    balance: ["Physical movement and creative outlets keep Fire energy grounded."],
    strengths: ["Courage and initiative", "Warmth and generosity", "Optimistic vision"],
    challenges: ["Impatience with slow processes", "Burnout from overcommitting"],
    faq: [{ q: "What are the Fire signs?", a: "The three Fire signs are Aries, Leo, and Sagittarius." }],
  },
  earth: {
    slug: "earth",
    name: "Earth",
    title: "Earth Signs in Astrology: Taurus, Virgo and Capricorn",
    description: "Explore the Earth element in astrology: Taurus, Virgo, and Capricorn traits, stability, craft, and compatibility.",
    tagline: "Grounded wisdom, reliability, sensory depth, and lasting craft.",
    signs: SIGNS_BY_ELEMENT.earth,
    intro: ["Earth signs turn ideas into tangible, enduring reality."],
    personality: ["Earth signs value consistency, craftsmanship, and practical wisdom."],
    traits: ["Practical, patient, and observant."],
    love: "Steadfast, sensual, and deeply devoted.",
    inLove: ["Steadfast, sensual, and deeply devoted."],
    career: "Reliable builders who excel at execution and long-term strategy.",
    inWork: ["Reliable builders who excel at execution and long-term strategy."],
    compatibility: ["Earth builds enduring bonds with fellow Earth signs and emotionally receptive Water signs."],
    balance: ["Flexibility and play help Earth signs avoid rigidity."],
    strengths: ["Reliability and patience", "Practical problem-solving", "Enduring loyalty"],
    challenges: ["Resistance to sudden change", "Perfectionism"],
    faq: [{ q: "What are the Earth signs?", a: "The three Earth signs are Taurus, Virgo, and Capricorn." }],
  },
  air: {
    slug: "air",
    name: "Air",
    title: "Air Signs in Astrology: Gemini, Libra and Aquarius",
    description: "Explore the Air element in astrology: Gemini, Libra, and Aquarius traits, intellect, communication, and compatibility.",
    tagline: "Curiosity, dialogue, perspective, and social connection.",
    signs: SIGNS_BY_ELEMENT.air,
    intro: ["Air signs connect people and ideas through language, fairness, and future vision."],
    personality: ["Air signs approach life with curiosity, dialogue, and conceptual clarity."],
    traits: ["Analytical, articulate, and socially perceptive."],
    love: "Communicative, mentally stimulating, and freedom-loving.",
    inLove: ["Communicative, mentally stimulating, and freedom-loving."],
    career: "Collaborators, strategists, and innovators.",
    inWork: ["Collaborators, strategists, and innovators."],
    compatibility: ["Air sparks effortlessly with fellow Air signs and dynamic Fire signs."],
    balance: ["Quiet embodiment and mindfulness ground Air energy."],
    strengths: ["Clear communication", "Objective perspective", "Social adaptability"],
    challenges: ["Overthinking emotions", "Restlessness"],
    faq: [{ q: "What are the Air signs?", a: "The three Air signs are Gemini, Libra, and Aquarius." }],
  },
  water: {
    slug: "water",
    name: "Water",
    title: "Water Signs in Astrology: Cancer, Scorpio and Pisces",
    description: "Explore the Water element in astrology: Cancer, Scorpio, and Pisces traits, intuition, empathy, and compatibility.",
    tagline: "Emotional depth, intuition, empathy, and transformative healing.",
    signs: SIGNS_BY_ELEMENT.water,
    intro: ["Water signs sense the emotional undercurrents beneath words and appearances."],
    personality: ["Water signs move through intuition, emotional resonance, and deep empathy."],
    traits: ["Intuitive, empathetic, and deeply reflective."],
    love: "Soulful, protective, and emotionally devoted.",
    inLove: ["Soulful, protective, and emotionally devoted."],
    career: "Insightful creators, healers, and perceptive strategists.",
    inWork: ["Insightful creators, healers, and perceptive strategists."],
    compatibility: ["Water flows deeply with fellow Water signs and grounded Earth signs."],
    balance: ["Healthy boundaries protect Water signs from emotional overload."],
    strengths: ["Deep empathy", "Strong intuition", "Emotional resilience"],
    challenges: ["Absorbing others' moods", "Guardedness when hurt"],
    faq: [{ q: "What are the Water signs?", a: "The three Water signs are Cancer, Scorpio, and Pisces." }],
  },
};
