import type { ElementSlug } from "@/lib/seo/zodiac-dates";

export type ZodiacElementEnglish = {
  name: string;
  tagline: string;
  intro: string;
  personality: string;
  strengths: string[];
  challenges: string[];
  love: string;
  career: string;
  compatibility: string;
};

export const ELEMENT_ENGLISH: Record<ElementSlug, ZodiacElementEnglish> = {
  fire: {
    name: "Fire signs",
    tagline: "Instinct, enthusiasm, courage, and the drive to create movement.",
    intro: "Aries, Leo, and Sagittarius belong to the Fire element. In astrology, Fire represents vitality, confidence, inspiration, and the willingness to act. Strong Fire energy tends to meet life directly: it wants experience, expression, and a reason to believe in what comes next.",
    personality: "Fire signs are often energized by challenge and possibility. They can be warm, candid, playful, and visibly passionate about what matters to them. Their growth lies in turning the first spark into sustained effort, making room for other people's pace, and learning that sensitivity can strengthen courage rather than weaken it.",
    strengths: ["Courage and initiative", "Creative self-expression", "Optimism and resilience", "Ability to inspire others"],
    challenges: ["Impatience with slow progress", "Acting before listening", "Burnout after intense effort", "Taking disagreement personally"],
    love: "Fire signs need warmth, honesty, affection, and a relationship that still feels alive. Attraction often grows through play, adventure, and mutual encouragement. The bond becomes stronger when excitement is paired with reliability and both partners can shine without competing for all the attention.",
    career: "Fire thrives in roles that reward initiative, visibility, leadership, competition, or creativity. Entrepreneurship, performance, sport, education, sales, and mission-led work can be natural fits. Clear priorities and consistent systems help Fire transform bold ideas into durable results.",
    compatibility: "Fire and Air often energize one another: Air gives an idea language and perspective, while Fire gives it momentum. Fire signs can also understand each other's intensity. Earth may add structure and Water may add emotional depth, provided neither side dismisses the other's natural rhythm.",
  },
  earth: {
    name: "Earth signs",
    tagline: "Stability, practical intelligence, patience, and tangible value.",
    intro: "Taurus, Virgo, and Capricorn belong to the Earth element. In astrology, Earth represents the material world, reliability, craft, resources, and the capacity to build over time. Strong Earth energy looks for evidence, usefulness, and a foundation that can support real life.",
    personality: "Earth signs tend to be observant, grounded, and serious about commitments. They often trust gradual progress more than dramatic promises and show care through presence or practical help. Their growth lies in staying flexible, tolerating uncertainty, and remembering that rest and pleasure are part of a sustainable life.",
    strengths: ["Reliability and patience", "Practical problem-solving", "Strong boundaries and judgment", "Ability to improve systems"],
    challenges: ["Resistance to necessary change", "Overwork or perfectionism", "Focusing on risk before possibility", "Equating control with security"],
    love: "Earth signs usually build intimacy through consistency, trust, physical presence, and shared responsibility. They prefer actions that match words. Relationships deepen when stability leaves room for emotional openness, spontaneity, and the changing needs of both people.",
    career: "Earth excels wherever quality, planning, stewardship, or long-term execution matters. Finance, operations, health, engineering, property, design, food, and skilled craft can suit this element. Earth is especially valuable when a promising concept needs a dependable structure.",
    compatibility: "Earth and Water often create a nourishing rhythm: Earth offers containment while Water brings emotional meaning. Earth signs may also share practical priorities with one another. Fire can encourage risk and Air can introduce flexibility when differences are handled with respect.",
  },
  air: {
    name: "Air signs",
    tagline: "Ideas, connection, perspective, and the movement of information.",
    intro: "Gemini, Libra, and Aquarius belong to the Air element. In astrology, Air represents thought, language, social exchange, pattern recognition, and the ability to step back for perspective. Strong Air energy needs curiosity, conversation, and room to reconsider an idea.",
    personality: "Air signs are often mentally agile, socially perceptive, and interested in how people or concepts connect. They can translate complexity and keep possibilities open. Their growth lies in staying present with feelings, making decisions before every variable is known, and turning insight into embodied action.",
    strengths: ["Communication and curiosity", "Adaptability and perspective", "Social intelligence", "Inventive problem-solving"],
    challenges: ["Overthinking emotions", "Scattered attention", "Indecision or detachment", "Living in theory instead of practice"],
    love: "Air signs need mental rapport, humor, honest dialogue, and enough freedom for individuality. They often fall in love through conversation and shared ideas. Emotional safety grows when words are supported by consistency and difficult feelings are explored rather than explained away.",
    career: "Air performs well in communication, education, research, media, design, technology, law, strategy, and community-building. Variety and collaboration are motivating, but priorities and deadlines help Air keep a brilliant range of ideas from becoming fragmentation.",
    compatibility: "Air and Fire tend to generate momentum together: Air offers possibilities and Fire acts on them. Air signs may also understand one another's need for exchange and freedom. Earth can add follow-through and Water can deepen intimacy when communication stays patient and specific.",
  },
  water: {
    name: "Water signs",
    tagline: "Feeling, intuition, attachment, imagination, and emotional depth.",
    intro: "Cancer, Scorpio, and Pisces belong to the Water element. In astrology, Water represents emotion, instinct, memory, empathy, and what flows beneath the visible surface. Strong Water energy reads atmosphere quickly and needs experiences to carry personal meaning.",
    personality: "Water signs tend to be receptive, protective, imaginative, and sensitive to what remains unspoken. They can offer profound care and emotional insight. Their growth lies in distinguishing intuition from fear, maintaining clear boundaries, and naming needs directly instead of expecting others to sense them.",
    strengths: ["Empathy and intuition", "Emotional loyalty", "Creative imagination", "Capacity for healing and renewal"],
    challenges: ["Absorbing other people's moods", "Withdrawal or indirectness", "Holding on to old hurts", "Idealization before evidence"],
    love: "Water signs seek emotional safety, trust, tenderness, and a sense of meaningful connection. They often love through care and deep attention. Relationships become healthier when empathy is balanced with boundaries and neither person must abandon a private life to prove devotion.",
    career: "Water contributes intuition and human understanding to psychology, care, art, film, music, hospitality, research, healing, and community work. Clear agreements and grounded routines protect this element's sensitivity while allowing imagination to become useful work.",
    compatibility: "Water and Earth often support each other: Water softens and nourishes, while Earth provides steadiness. Water signs may also recognize one another's emotional language. Air can bring perspective and Fire can restore movement when both sides avoid treating difference as invalidation.",
  },
};

