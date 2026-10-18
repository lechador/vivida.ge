export type AngelNumberEn = {
  slug: string;
  title: string;
  essence: string;
  meaning: string;
  love: string;
  career: string;
  action: string;
};

export const ANGEL_NUMBERS_EN: AngelNumberEn[] = [
  {
    slug: "000",
    title: "000 Angel Number: Fresh Start and Open Potential",
    essence: "A clean slate, open possibility, and a quiet internal reset.",
    meaning:
      "Seeing 000 points to the space between endings and beginnings. Nothing is locked in yet, inviting you to choose your direction deliberately.",
    love: "In relationships, 000 encourages releasing old assumptions and listening with a clear mind.",
    career: "At work, 000 favors simplifying processes or starting a project from first principles.",
    action: "Pause, name one clear intention for this week, and let go of what is already finished.",
  },
  {
    slug: "111",
    title: "111 Angel Number: Focus and Initiative",
    essence: "Sharpened attention, personal agency, and taking the first step.",
    meaning:
      "111 is a prompt to notice where your attention is going. Instead of scattering energy across worries, channel it into one meaningful priority.",
    love: "Be direct and honest about what you want in connection rather than waiting passively.",
    career: "A strong moment to pitch an idea, begin a draft, or claim ownership of a goal.",
    action: "Pick one priority today and complete a concrete 15-minute step toward it.",
  },
  {
    slug: "222",
    title: "222 Angel Number: Balance, Patience, and Partnership",
    essence: "Cooperation, steady pacing, and mutual trust.",
    meaning:
      "222 highlights rhythm and reciprocity. Progress does not require forcing an outcome today; steady consistency matters more.",
    love: "Focus on listening, shared pacing, and calm dialogue in close relationships.",
    career: "Collaboration and diplomatic problem-solving bring better results than solo rushing.",
    action: "Check where your schedule feels lopsided and restore one small boundary.",
  },
  {
    slug: "333",
    title: "333 Angel Number: Expression and Creative Growth",
    essence: "Honest communication, curiosity, and creative momentum.",
    meaning:
      "333 invites you to bring your ideas into the open. Growth happens when thought, feeling, and expression align.",
    love: "Playfulness, warmth, and open conversation strengthen your bond.",
    career: "Share your perspective clearly and use creative approaches to solve a stuck problem.",
    action: "Write, speak, or build something visible today without over-editing yourself first.",
  },
  {
    slug: "444",
    title: "444 Angel Number: Stability and Strong Foundations",
    essence: "Structure, reliability, and grounded persistence.",
    meaning:
      "444 reminds you that lasting results are built brick by brick. Keep strengthening your habits, systems, and practical support.",
    love: "Reliability, clear commitments, and healthy boundaries create emotional safety.",
    career: "Review your systems, budget, and long-term plan to ensure your foundation is solid.",
    action: "Finish one practical task you have been postponing and organize your workspace.",
  },
  {
    slug: "555",
    title: "555 Angel Number: Change and Adaptability",
    essence: "Transition, flexibility, and stepping outside stale routines.",
    meaning:
      "555 signals shifting circumstances or an internal readiness for change. Meet new information with curiosity rather than rigidity.",
    love: "Refresh routines in your relationship or stay open to unexpected perspectives.",
    career: "Adaptability and learning a new skill open doors that routine habits miss.",
    action: "Change one unhelpful habit today and welcome a fresh approach.",
  },
  {
    slug: "777",
    title: "777 Angel Number: Reflection and Inner Wisdom",
    essence: "Quiet observation, discernment, and deeper understanding.",
    meaning:
      "777 invites you to step back from noise and reflect on what experience has already taught you.",
    love: "Seek emotional depth and honest understanding rather than surface reassurance.",
    career: "Research, careful analysis, and strategic thinking are favored now.",
    action: "Take ten minutes of quiet reflection and write down your clearest insight.",
  },
  {
    slug: "888",
    title: "888 Angel Number: Reciprocity and Material Stewardship",
    essence: "Sustainable effort, fair exchange, and responsible momentum.",
    meaning:
      "888 focuses on how you invest time, energy, and money—and whether your commitments are balanced and sustainable.",
    love: "Notice the balance of give and take in your closest relationships.",
    career: "A practical prompt to review finances, pricing, or long-term professional goals.",
    action: "Review one financial or professional commitment and align it with your priorities.",
  },
  {
    slug: "999",
    title: "999 Angel Number: Completion and Release",
    essence: "Closing a chapter with clarity so the next one can begin.",
    meaning:
      "999 marks the natural conclusion of a phase. Clearing unfinished business frees your attention for what comes next.",
    love: "Let go of old grievances or outdated expectations in relationships.",
    career: "Wrap up lingering deliverables and document what you learned.",
    action: "Complete or consciously close one unfinished item on your list today.",
  },
  {
    slug: "1111",
    title: "1111 Angel Number: Presence and Intentional Direction",
    essence: "Mindful awareness and aligning daily actions with core values.",
    meaning:
      "1111 serves as a mindfulness bell. When you notice it, check what you were thinking about and whether your actions match your goals.",
    love: "Bring full presence and sincerity to the person in front of you.",
    career: "Clarify your next milestone and commit to a realistic action plan.",
    action: "Write down one clear intention and schedule the first step on your calendar.",
  },
];

export const ANGEL_EN_BY_SLUG: Record<string, AngelNumberEn> =
  Object.fromEntries(ANGEL_NUMBERS_EN.map((item) => [item.slug, item]));

export const ANGEL_FAQ_EN = [
  {
    q: "What are angel numbers?",
    a: "Angel numbers are repeating or symmetrical number sequences—such as 111, 222, 444, or 11:11—used in modern symbolic numerology as prompts for reflection and intention.",
  },
  {
    q: "Why do I keep seeing the same number?",
    a: "Once a number pattern feels meaningful, selective attention makes it stand out whenever you glance at a clock, receipt, or screen. You can use that moment as a brief mindfulness check-in.",
  },
];
