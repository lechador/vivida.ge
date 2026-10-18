import type { LifePathNumber } from "@/lib/numerology";

export type LifePathContentEn = {
  number: LifePathNumber;
  title: string;
  archetype: string;
  essence: string;
  traits: string[];
  strengths: string;
  challenges: string;
  love: string;
  career: string;
  advice: string;
};

export const LIFE_PATH_CONTENT_EN: Record<LifePathNumber, LifePathContentEn> = {
  "1": {
    number: "1",
    title: "Life Path Number 1: The Pioneer",
    archetype: "The Pioneer",
    essence:
      "Life Path 1 represents initiative, self-reliance, and original direction. Its core lesson is trusting your own judgment while opening new paths.",
    traits: ["Independent", "Focused", "Original", "Courageous"],
    strengths:
      "Clear decision-making, self-motivation, and the courage to start from a blank page.",
    challenges:
      "Impatience, reluctance to ask for help, and mistaking stubbornness for strength.",
    love:
      "You thrive with a partner who respects autonomy and communicates directly.",
    career:
      "Entrepreneurship, product leadership, independent consulting, and pioneering roles.",
    advice:
      "Remember that collaboration multiplies initiative rather than diluting it.",
  },
  "2": {
    number: "2",
    title: "Life Path Number 2: The Diplomat",
    archetype: "The Diplomat",
    essence:
      "Life Path 2 centers on partnership, emotional nuance, and quiet mediation.",
    traits: ["Empathetic", "Diplomatic", "Observant", "Cooperative"],
    strengths:
      "Deep listening, conflict resolution, and building lasting trust.",
    challenges:
      "Over-accommodating others to keep the peace and taking tension personally.",
    love:
      "Warm, attentive, and devoted—you value emotional safety and reciprocity.",
    career:
      "Counseling, mediation, design, people operations, and collaborative leadership.",
    advice:
      "True harmony includes your own voice; state your needs clearly.",
  },
  "3": {
    number: "3",
    title: "Life Path Number 3: The Creative Communicator",
    archetype: "The Creator",
    essence:
      "Life Path 3 is associated with expression, storytelling, optimism, and social warmth.",
    traits: ["Expressive", "Imaginative", "Social", "Optimistic"],
    strengths:
      "Turning complex feelings into clear words, art, or lively conversation.",
    challenges:
      "Scattering energy across too many projects and avoiding heavier emotions.",
    love:
      "Playful, affectionate, and drawn to partners who enjoy curiosity and dialogue.",
    career:
      "Writing, media, design, teaching, marketing, and performing arts.",
    advice:
      "Pair your natural inspiration with simple daily follow-through.",
  },
  "4": {
    number: "4",
    title: "Life Path Number 4: The Builder",
    archetype: "The Builder",
    essence:
      "Life Path 4 embodies structure, reliability, craftsmanship, and steady progress.",
    traits: ["Grounded", "Disciplined", "Reliable", "Methodical"],
    strengths:
      "Turning plans into durable systems through patience and consistency.",
    challenges:
      "Rigidity, overworking, and resisting unexpected change.",
    love:
      "Loyal and steady—you show care through dependable actions.",
    career:
      "Engineering, architecture, finance, operations, and project management.",
    advice:
      "Leave room for flexibility alongside structure.",
  },
  "5": {
    number: "5",
    title: "Life Path Number 5: The Explorer",
    archetype: "The Explorer",
    essence:
      "Life Path 5 reflects adaptability, curiosity, freedom, and learning through direct experience.",
    traits: ["Adaptable", "Curious", "Adventurous", "Quick-thinking"],
    strengths:
      "Embracing change, connecting across cultures, and reinventing routines.",
    challenges:
      "Restlessness, impatience with repetition, and abandonar commitments too early.",
    love:
      "You need breathing room, honesty, and shared adventure.",
    career:
      "Travel, journalism, entrepreneurship, sales, and dynamic roles.",
    advice:
      "Choose commitments that expand your freedom rather than fearing all structure.",
  },
  "6": {
    number: "6",
    title: "Life Path Number 6: The Guardian",
    archetype: "The Nurturer",
    essence:
      "Life Path 6 centers on responsibility, care, beauty, and community stewardship.",
    traits: ["Supportive", "Protective", "Fair-minded", "Warm"],
    strengths:
      "Creating welcoming environments and standing up for the people you love.",
    challenges:
      "Over-functioning for others and holding yourself to impossible standards.",
    love:
      "Devoted, relationship-oriented, and attentive to shared home life.",
    career:
      "Healthcare, education, counseling, hospitality, and interior design.",
    advice:
      "Support others without carrying responsibilities that belong to them.",
  },
  "7": {
    number: "7",
    title: "Life Path Number 7: The Seeker",
    archetype: "The Seeker",
    essence:
      "Life Path 7 combines analytical depth with contemplative intuition.",
    traits: ["Analytical", "Reflective", "Perceptive", "Independent"],
    strengths:
      "Research, pattern recognition, and seeing beneath surface appearances.",
    challenges:
      "Detachment, overthinking, and withdrawing when trust feels risky.",
    love:
      "You value depth, honesty, and respect for quiet solitude.",
    career:
      "Science, research, technology, strategy, writing, and philosophy.",
    advice:
      "Balance analysis with lived connection.",
  },
  "8": {
    number: "8",
    title: "Life Path Number 8: The Strategist",
    archetype: "The Executive",
    essence:
      "Life Path 8 focuses on agency, stewardship of resources, and measurable impact.",
    traits: ["Ambitious", "Strategic", "Resilient", "Decisive"],
    strengths:
      "Organizing large efforts, navigating pressure, and building material stability.",
    challenges:
      "Workaholism, control dynamics, and equating self-worth with achievement.",
    love:
      "Direct and protective; you respect partners with strong integrity.",
    career:
      "Business leadership, finance, law, real estate, and operations.",
    advice:
      "Lead with fairness and keep personal relationships as a true priority.",
  },
  "9": {
    number: "9",
    title: "Life Path Number 9: The Humanitarian",
    archetype: "The Humanitarian",
    essence:
      "Life Path 9 represents broad perspective, compassion, synthesis, and completion.",
    traits: ["Compassionate", "Broad-minded", "Generous", "Idealistic"],
    strengths:
      "Empathy across differences, artistic synthesis, and big-picture wisdom.",
    challenges:
      "Difficulty letting go of the past and neglecting personal boundaries.",
    love:
      "Warm and idealistic, seeking a relationship with shared meaning.",
    career:
      "Nonprofit leadership, arts, education, international work, and healing professions.",
    advice:
      "Allow completed chapters to close so new energy can enter.",
  },
  "11": {
    number: "11",
    title: "Master Number 11: The Intuitive Illuminator",
    archetype: "The Intuitive",
    essence:
      "Master Number 11 pairs the sensitivity of 2 with heightened intuitive insight and creative inspiration.",
    traits: ["Intuitive", "Inspiring", "Sensitive", "Visionary"],
    strengths:
      "Sensing unspoken dynamics and inspiring others through authenticity.",
    challenges:
      "Nervous overwhelm and self-doubt when expectations feel too high.",
    love:
      "Deeply soulful and attuned; you value emotional honesty.",
    career:
      "Psychology, arts, coaching, teaching, and visionary leadership.",
    advice:
      "Ground your intuition in steady daily routines.",
  },
  "22": {
    number: "22",
    title: "Master Number 22: The Master Builder",
    archetype: "The Master Builder",
    essence:
      "Master Number 22 unites visionary ideals with the practical discipline of 4 to build lasting institutions.",
    traits: ["Visionary", "Pragmatic", "Structured", "Capable"],
    strengths:
      "Translating large-scale ideas into concrete, workable systems.",
    challenges:
      "Feeling burdened by high expectations or micromanaging every detail.",
    love:
      "Steady and committed, thriving with a partner who shares long-term vision.",
    career:
      "Architecture, systems engineering, civic projects, and social enterprise.",
    advice:
      "Build step by step—lasting work is a marathon, not a sprint.",
  },
  "33": {
    number: "33",
    title: "Master Number 33: The Master Teacher",
    archetype: "The Master Teacher",
    essence:
      "Master Number 33 blends the expressive warmth of 3 with the devoted care of 6.",
    traits: ["Compassionate", "Uplifting", "Creative", "Devoted"],
    strengths:
      "Teaching by example, emotional generosity, and community healing.",
    challenges:
      "Caretaker fatigue and putting everyone else's healing ahead of your own.",
    love:
      "Nurturing, patient, and deeply committed to mutual growth.",
    career:
      "Education, counseling, arts, community leadership, and healthcare.",
    advice:
      "Replenish your own energy first so your care remains sustainable.",
  },
};

export const NUMEROLOGY_FAQ_EN: Array<{ q: string; a: string }> = [
  {
    q: "How do you calculate your life path number?",
    a: "Add the digits of your birth year, month, and day until you reach a single digit (1–9) or one of the Master Numbers (11, 22, 33).",
  },
  {
    q: "What are Master Numbers in numerology?",
    a: "Master Numbers 11, 22, and 33 are double-digit numbers that are traditionally kept intact because they combine the qualities of their root digit with amplified sensitivity or scale.",
  },
  {
    q: "Is numerology the same as astrology?",
    a: "No. Numerology uses symbolic patterns derived from calendar numbers, while astrology calculates the positions of celestial bodies for a specific time and place.",
  },
];
