import type { ZodiacSlug } from "@/lib/seo/zodiac-dates";

export type ZodiacSignEnglish = {
  tagline: string;
  core: string;
  strengths: string[];
  challenges: string[];
  love: string;
  career: string;
};

export const ZODIAC_SIGN_EN: Record<ZodiacSlug, ZodiacSignEnglish> = {
  aries: {
    tagline: "Bold beginnings, direct desire, and the courage to move first.",
    core: "Aries is the first sign of the zodiac: fast, instinctive, and energized by challenge. It tends to learn through action and prefers an honest attempt to endless hesitation. At its best, Aries brings courage and momentum; under pressure, urgency can turn into impatience.",
    strengths: [
      "Courageous and decisive",
      "Independent and energetic",
      "Direct about needs",
      "Quick to recover after setbacks",
    ],
    challenges: [
      "Can act before listening",
      "May lose interest after the initial spark",
      "Impatience with slower processes",
      "Can treat cooperation like competition",
    ],
    love: "Aries approaches love with clarity and heat. Attraction grows through play, honesty, and shared adventure. A healthy relationship gives Aries room to act independently while making mutual respect non-negotiable.",
    career:
      "Aries thrives where initiative matters: entrepreneurship, leadership, sales, sport, emergency response, or any role that rewards fast decisions. The deeper lesson is learning to sustain what it starts.",
  },
  taurus: {
    tagline:
      "Steady values, sensual presence, and the patience to build what lasts.",
    core: "Taurus is an Earth sign concerned with stability, value, and tangible experience. It prefers dependable progress over dramatic change and has a strong instinct for quality. At its best, Taurus is loyal and grounded; when threatened, steadiness can harden into resistance.",
    strengths: [
      "Reliable and patient",
      "Strong practical judgment",
      "Loyal to people and commitments",
      "Attuned to beauty and comfort",
    ],
    challenges: [
      "Can resist necessary change",
      "May hold on too long",
      "Possessiveness under insecurity",
      "Comfort can become inertia",
    ],
    love: "Taurus builds intimacy through consistency, physical affection, and trust that grows over time. It values sincerity over spectacle and needs a partner who respects both its pace and its need for emotional and material security.",
    career:
      "Taurus does well in finance, design, food, music, property, nature, and long-term operations. It brings patience and quality control, especially when success depends on steady improvement.",
  },
  gemini: {
    tagline: "Curiosity, connection, and a mind that needs movement.",
    core: "Gemini is an Air sign driven by questions, language, and exchange. It notices links quickly and adapts to new information with ease. At its best, Gemini keeps ideas alive; under stress, variety can become distraction and analysis can replace emotional presence.",
    strengths: [
      "Adaptable and quick-thinking",
      "Expressive communicator",
      "Curious about people and ideas",
      "Able to see multiple perspectives",
    ],
    challenges: [
      "Can scatter attention",
      "May intellectualize feelings",
      "Restlessness with repetition",
      "Sometimes changes direction too quickly",
    ],
    love: "Gemini needs conversation, humor, and room to keep discovering the other person. Emotional connection deepens when curiosity is paired with consistency and difficult subjects are not turned into clever detours.",
    career:
      "Gemini excels in writing, media, teaching, marketing, technology, research, and roles that connect information or people. Variety helps, but a clear system is essential for finishing.",
  },
  cancer: {
    tagline:
      "Emotional intelligence, protection, and a deep memory for belonging.",
    core: "Cancer is a Water sign shaped by feeling, attachment, and the need for a secure inner base. It reads atmosphere instinctively and often protects what it loves. At its best, Cancer is deeply caring; under strain, protection can become withdrawal or indirectness.",
    strengths: [
      "Empathetic and protective",
      "Strong emotional memory",
      "Loyal to home and chosen family",
      "Intuitive about unspoken needs",
    ],
    challenges: [
      "May retreat instead of speaking directly",
      "Can carry old hurts",
      "Mood can shape decisions",
      "Overprotection may limit others",
    ],
    love: "Cancer seeks emotional safety and a sense of home. It loves through care, remembrance, and everyday presence. Clear boundaries help Cancer give generously without becoming responsible for every feeling in the room.",
    career:
      "Cancer contributes emotional intelligence to care, hospitality, education, psychology, food, housing, and community work. It thrives where trust and continuity matter.",
  },
  leo: {
    tagline:
      "Creative confidence, generous warmth, and the need to live wholeheartedly.",
    core: "Leo is a Fire sign associated with self-expression, vitality, and creative leadership. It wants life to feel meaningful and personal. At its best, Leo encourages others to shine; when insecure, the need for recognition can dominate the room.",
    strengths: [
      "Warm and generous",
      "Creative and expressive",
      "Loyal under pressure",
      "Natural ability to inspire",
    ],
    challenges: [
      "Sensitivity to being overlooked",
      "Pride can delay repair",
      "May dramatize disappointment",
      "Can confuse leadership with control",
    ],
    love: "Leo loves openly and wants affection to feel chosen, visible, and alive. Loyalty and appreciation matter, but the strongest relationships are those where admiration flows in both directions.",
    career:
      "Leo excels in leadership, performance, education, entertainment, branding, and creative direction. It does best when responsibility includes a genuine opportunity to make something distinctive.",
  },
  virgo: {
    tagline:
      "Discernment, craft, and the quiet power of making things work better.",
    core: "Virgo is an Earth sign that notices detail, pattern, and practical improvement. It finds meaning in competence and useful contribution. At its best, Virgo turns complexity into order; under pressure, discernment can become perfectionism or relentless self-criticism.",
    strengths: [
      "Observant and precise",
      "Reliable problem-solver",
      "Thoughtful in practical ways",
      "Committed to improving a craft",
    ],
    challenges: [
      "Perfectionism can block progress",
      "May focus on flaws first",
      "Difficulty receiving help",
      "Can overthink ordinary uncertainty",
    ],
    love: "Virgo often expresses love through attention, practical support, and remembering the small details. Intimacy grows when helpfulness is balanced with warmth and a willingness to be imperfect together.",
    career:
      "Virgo thrives in analysis, health, editing, research, engineering, operations, and skilled service. It is especially valuable wherever quality depends on noticing what others miss.",
  },
  libra: {
    tagline:
      "Relationship intelligence, aesthetic balance, and the art of fair exchange.",
    core: "Libra is an Air sign oriented toward relationship, proportion, and perspective. It naturally compares viewpoints and looks for an arrangement everyone can live with. At its best, Libra creates cooperation; under pressure, the wish for harmony can delay necessary decisions.",
    strengths: [
      "Diplomatic and fair-minded",
      "Socially perceptive",
      "Strong aesthetic judgment",
      "Able to mediate opposing views",
    ],
    challenges: [
      "Indecision when every side feels valid",
      "May avoid productive conflict",
      "Can rely too much on external approval",
      "Resentment grows when needs stay unspoken",
    ],
    love: "Libra wants partnership to feel mutual, thoughtful, and beautiful in both tone and behavior. Relationships deepen when Libra names a real preference instead of asking harmony to make the decision.",
    career:
      "Libra performs well in law, design, diplomacy, counseling, partnerships, communications, and client-facing work. It excels at creating alignment without flattening differences.",
  },
  scorpio: {
    tagline: "Emotional depth, focused will, and transformation through truth.",
    core: "Scorpio is a Water sign drawn to intensity, trust, and what exists below the surface. It commits deeply and rarely treats important matters casually. At its best, Scorpio is resilient and perceptive; under threat, privacy can become control or suspicion.",
    strengths: [
      "Focused and resilient",
      "Emotionally perceptive",
      "Loyal once trust is earned",
      "Comfortable with complexity and change",
    ],
    challenges: [
      "Can guard vulnerability too tightly",
      "Suspicion may replace direct questions",
      "All-or-nothing reactions",
      "Difficulty releasing old betrayals",
    ],
    love: "Scorpio seeks honesty, depth, and a bond that can hold difficult truths. It needs privacy but not secrecy; intimacy strengthens when intensity is paired with consent, clarity, and room to breathe.",
    career:
      "Scorpio thrives in psychology, medicine, investigation, finance, crisis work, strategy, and research. It is powerful where discretion, courage, and transformation are required.",
  },
  sagittarius: {
    tagline:
      "Big horizons, candid optimism, and a life expanded through meaning.",
    core: "Sagittarius is a Fire sign driven by exploration, belief, and the need for a wider view. It learns through experience and often sees possibilities before limitations. At its best, Sagittarius inspires growth; under stress, confidence can outrun detail or sensitivity.",
    strengths: [
      "Optimistic and adventurous",
      "Honest and future-oriented",
      "Generous with perspective",
      "Quick to find meaning in experience",
    ],
    challenges: [
      "Bluntness can overlook impact",
      "Restlessness with routine",
      "May overpromise",
      "Can use freedom to avoid accountability",
    ],
    love: "Sagittarius needs honesty, movement, and a relationship spacious enough for both people to grow. Commitment works best when it feels like a shared expedition rather than a restriction.",
    career:
      "Sagittarius excels in education, travel, publishing, coaching, law, entrepreneurship, and international work. It contributes vision, especially when paired with people who enjoy building the details.",
  },
  capricorn: {
    tagline: "Long-term purpose, earned authority, and disciplined ambition.",
    core: "Capricorn is an Earth sign concerned with responsibility, structure, and lasting achievement. It respects time and tends to think in consequences. At its best, Capricorn is dependable and strategic; under pressure, competence can become rigidity or emotional distance.",
    strengths: [
      "Disciplined and dependable",
      "Strategic over the long term",
      "Calm with responsibility",
      "Able to build durable systems",
    ],
    challenges: [
      "Can carry too much alone",
      "Work may crowd out emotional life",
      "Pessimism under uncertainty",
      "High standards can become harshness",
    ],
    love: "Capricorn may open slowly, but it shows commitment through reliability and investment in a shared future. Relationships soften when practical devotion is accompanied by direct affection and vulnerability.",
    career:
      "Capricorn thrives in leadership, management, finance, engineering, government, and any field where reputation is built over time. It understands that consistency compounds.",
  },
  aquarius: {
    tagline:
      "Independent thought, social vision, and the courage to imagine differently.",
    core: "Aquarius is an Air sign associated with systems, community, and intellectual independence. It values authenticity and often sees patterns at a wider social scale. At its best, Aquarius is inventive and principled; under stress, objectivity can become detachment.",
    strengths: [
      "Original and independent",
      "Future-oriented thinker",
      "Loyal to principles and communities",
      "Comfortable challenging convention",
    ],
    challenges: [
      "Can detach from immediate feelings",
      "Resistance to ordinary expectations",
      "Stubborn attachment to an idea",
      "May value the group more than the person in front of them",
    ],
    love: "Aquarius needs friendship, respect, and space for individuality. Intimacy grows through shared ideas and honest freedom, but it deepens further when abstract care becomes emotionally present behavior.",
    career:
      "Aquarius excels in technology, science, social impact, networks, research, and unconventional creative work. It contributes most where improvement requires questioning the default.",
  },
  pisces: {
    tagline: "Imagination, empathy, and a porous connection to the unseen.",
    core: "Pisces is a Water sign shaped by sensitivity, symbolism, and the capacity to feel beyond clear boundaries. It often understands through intuition before logic. At its best, Pisces brings compassion and imagination; without grounding, openness can become confusion or escape.",
    strengths: [
      "Compassionate and imaginative",
      "Strong intuitive perception",
      "Adaptable and emotionally receptive",
      "Able to create meaning through art and symbolism",
    ],
    challenges: [
      "Boundaries can blur",
      "May avoid painful practicalities",
      "Idealization before evidence",
      "Absorbs the atmosphere around it",
    ],
    love: "Pisces wants tenderness, imagination, and a feeling of soulful recognition. Healthy love requires clear agreements and grounded behavior so empathy does not become self-erasure.",
    career:
      "Pisces thrives in art, music, film, healing, care, spirituality, and nonprofit work. It is strongest when inspiration is supported by routines and clear boundaries.",
  },
};

export const ELEMENT_EN: Record<string, string> = {
  fire: "Fire",
  earth: "Earth",
  air: "Air",
  water: "Water",
};
export const MODALITY_EN: Record<string, string> = {
  კარდინალური: "Cardinal",
  ფიქსირებული: "Fixed",
  მუტაბელური: "Mutable",
};
export const RULER_EN: Record<ZodiacSlug, string> = {
  aries: "Mars",
  taurus: "Venus",
  gemini: "Mercury",
  cancer: "Moon",
  leo: "Sun",
  virgo: "Mercury",
  libra: "Venus",
  scorpio: "Pluto",
  sagittarius: "Jupiter",
  capricorn: "Saturn",
  aquarius: "Uranus",
  pisces: "Neptune",
};

export const COMPATIBILITY_EN: Record<ZodiacSlug, ZodiacSlug[]> = {
  aries: ["leo", "sagittarius", "gemini", "libra"],
  taurus: ["virgo", "capricorn", "cancer", "scorpio"],
  gemini: ["libra", "aquarius", "aries", "sagittarius"],
  cancer: ["scorpio", "pisces", "taurus", "capricorn"],
  leo: ["aries", "sagittarius", "gemini", "aquarius"],
  virgo: ["taurus", "capricorn", "cancer", "pisces"],
  libra: ["gemini", "aquarius", "leo", "aries"],
  scorpio: ["cancer", "pisces", "virgo", "taurus"],
  sagittarius: ["aries", "leo", "aquarius", "gemini"],
  capricorn: ["taurus", "virgo", "scorpio", "cancer"],
  aquarius: ["gemini", "libra", "sagittarius", "leo"],
  pisces: ["cancer", "scorpio", "taurus", "virgo"],
};
