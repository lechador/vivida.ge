export type AngelNumberEn = {
  slug: string;
  title: string;
  essence: string;
  meaning: string;
  love: string;
  career: string;
  action: string;
};

const angel = (
  slug: string,
  title: string,
  essence: string,
  meaning: string,
  love: string,
  career: string,
  action: string,
): AngelNumberEn => ({ slug, title, essence, meaning, love, career, action });

export const ANGEL_NUMBERS_EN: AngelNumberEn[] = [
  angel(
    "000",
    "000, A New Cycle and Infinite Possibility",
    "Zero is the beginning before the beginning, a clean slate where nothing is written yet.",
    "000 appears when one chapter has ended and the next has not yet begun. This empty space can feel unsettling, but it is precisely what gives you freedom of choice, you have nothing to defend, which means you can begin anything.",
    "In relationships, 000 is a sign of a reset: either a fresh chapter with the same person or a clean slate on your own. Both paths are healthy if chosen with genuine honesty.",
    "In work and career, this is a moment of pause. Seeking a new direction is far more worthwhile now than fighting to keep an exhausted old path alive.",
    "Do not rush to fill the void. Give yourself a few days to ask 'What do I truly want?', and only then make your decision."
  ),
  angel(
    "111",
    "111 and 11:11, Thoughts Are Materializing",
    "The most famous angel number: your thoughts are turning into reality with unusual speed right now.",
    "111 is an amplifier number. Seeing it frequently means the door to a new stage has opened and what you think about most is taking tangible shape. That is why making a wish at 11:11 is considered worthwhile, the direction of your mind is what matters most.",
    "In love, 111 heralds a new acquaintance or a brand-new stage in a relationship. If you are single, it is a call for emotional openness.",
    "An idea that has been circling in your mind for a long time should now be written down and started. 111 is a number of beginning, not endless planning.",
    "Notice what you were thinking about the moment you saw the number, that exact topic is what needs to be strengthened or adjusted."
  ),
  angel(
    "222",
    "222 and 22:22, Balance, Trust and Partnership",
    "222 is a number of patience: the seed has been planted, now growth needs time.",
    "The number two is about harmony, diplomacy, and equilibrium between two sides. Frequently seeing 222 means you are on the right path, but visible results have not arrived yet, and that is completely normal. It is a test of trust.",
    "In relationships, 222 is one of the kindest signs: reconciliation, deepening intimacy, or an important conversation that brings two people closer together.",
    "Collaboration is far more fruitful right now than fighting alone. A partnership or team project is well worth pursuing.",
    "Do not abandon what you started recently. 222 reminds you that it is too early to demand the final harvest."
  ),
  angel(
    "333",
    "333, Creativity and Self-Expression",
    "Three is the voice: 333 tells you that what is inside you must come out.",
    "333 is the number of creativity, communication, and authentic self-expression. It often appears when someone is holding their true thoughts back, hiding their talent, keeping quiet, or waiting for external approval. The three repeated is an amplification of that inner voice.",
    "In love, 333 is a call for candid conversation. What you leave unsaid hurts a relationship far more than speaking the truth.",
    "A creative project, presentation, or starting your own venture, now is the time to raise your voice and be heard.",
    "Speak one thing today that you have been holding back for a long time. 333 is asking for exactly that."
  ),
  angel(
    "444",
    "444, Protection and a Solid Foundation",
    "444 is one of the most reassuring numbers: you are not alone, and your foundation is sturdy.",
    "Four represents stability, four walls, four directions, four elements. 444 usually appears during challenging periods as a sign of support: what you are building is durable, even if it does not feel that way in this moment.",
    "In relationships, 444 points to reliability, loyalty and emotional safety that matter far more than fleeting drama.",
    "Effort that seems to show no immediate result is actually laying a deep foundation. Keep going, results will soon become visible.",
    "When you see 444, look back at everything you have already built. Often the fear in our heads is far larger than the actual risk."
  ),
  angel(
    "555",
    "555, A Major Shift Is Coming",
    "Five is movement: 555 means change has already begun, whether you are ready or not.",
    "555 is one of the most energetic angel numbers. It appears when life is shifting direction, career, relationship, location, or inner outlook. Resisting at this stage only makes the process painful.",
    "In love, 555 is a turning point: either the relationship moves to a new level, or it reaches its conclusion. Both outcomes offer freedom and growth.",
    "An offer, transition, or complete change in direction. Taking a calculated risk is far more justified now than usual.",
    "Do not cling to the old simply because it is familiar. Write down what you stand to lose and what you stand to gain, and make your choice."
  ),
  angel(
    "666",
    "666, Restoring Balance (Not a Bad Omen)",
    "666 is not a scary number, it points to an imbalance between material demands and inner wellbeing.",
    "In popular culture 666 has a bad reputation, but in numerology its meaning is entirely different. Six is about family, care, and home. Repeated three times, it indicates that balance has tipped: you are either buried in money and work, or over-giving to others while forgetting yourself.",
    "In relationships, 666 serves as an explicit warning against chronic self-sacrifice, caring has become noticeably one-sided, and you must restore equal balance.",
    "Work and professional duties have completely displaced personal life, joy, and restful peace. This number urgently asks you to reclaim healthy emotional boundaries.",
    "Return to a simple question: when was the last time you did something purely for yourself? The answer usually explains everything."
  ),
  angel(
    "777",
    "777, Luck, Intuition and the Right Path",
    "Seven is the number of spirituality: 777 is confirmation that you are heading in the right direction.",
    "777 usually appears when you have made a difficult but correct decision. It signifies good fortune, but not random luck, the kind prepared by your own conscious choices. It also marks a period of heightened intuition.",
    "In love, 777 points toward a profound, genuine connection, a sacred bond where you do not need to pretend, perform, or wear an emotional mask.",
    "Knowledge, preparation, and study pay off now. It is a favorable time for exams, learning, or stepping into an expert role.",
    "Trust your first instinct. During 777 sightings, intuition is far more precise than overthinking."
  ),
  angel(
    "888",
    "888, Abundance and Returned Effort",
    "Eight is the infinity symbol: 888 means what was sown is now yielding its harvest.",
    "888 is the number of financial and energetic abundance. It often appears after a long period of disciplined work, when the reward is already on its way. Eight is also cyclical: what you give to the world returns to you in kind.",
    "In relationships, 888 is all about balanced reciprocity and mutual appreciation, the dynamic of giving and receiving has finally aligned in harmony.",
    "A raise, a solid contract, or a project that finally pays off. It is a favorable time for important financial decisions.",
    "Allow yourself to receive what comes your way, many people start diminishing their own worth at the very moment success arrives."
  ),
  angel(
    "999",
    "999, Completion and Closing a Chapter",
    "Nine is the final single digit: 999 means a major chapter is coming to an end.",
    "999 is the number of completion, and ending here is not a loss, but liberation. It appears when a relationship, job, or lifestyle has exhausted its purpose, even if you are not yet willing to admit it.",
    "In relationships, 999 often signifies an honest conclusion, either of an old unhealthy dynamic or of the relationship itself.",
    "A project is reaching its natural end. Dragging it out only occupies space meant for fresh opportunities.",
    "Finish and close one thing you have been dragging out for months. Space will immediately open up."
  ),
  angel(
    "1010",
    "1010 and 10:10, A Fresh Start on Your Path",
    "1010 combines the initiative of one and the potential of zero: beginning on a clean slate.",
    "One is beginning, zero is infinite potential. Together they mean that a new stage is not just starting, but aligning directly with your deeper aspirations. 10:10 on the clock often appears right before a decisive choice.",
    "In love, 1010 is a call to open your heart, postponing your choice out of fear is no longer serving you.",
    "A promising new role or venture that aligns far more authentically with your core values and life purpose than previous commitments.",
    "Ask yourself: 'If fear did not exist, what would I do?', 1010 is pointing directly to that answer."
  ),
  angel(
    "1111",
    "1111, Awakening and Alignment",
    "1111 is the most frequently noticed clock synchronicity, a classic sign of alignment.",
    "1111 is a quadruple one, representing the maximum energy of beginning. Traditionally called a 'gateway': a moment when the gap between thought and reality narrows. That is why making a wish at 11:11 is one of the most widespread rituals worldwide.",
    "In love, 1111 is often associated with a fateful meeting or a decisive turning point in a relationship.",
    "A clear and unmistakable signal for a fresh career direction, especially if you have harbored the idea in secret for a long time.",
    "When you see 11:11, formulate in one precise sentence what you desire. Clarity is the primary requirement of this number."
  ),
  angel(
    "1212",
    "1212 and 12:12, Trusting the Journey",
    "1212 combines balance and forward motion: take the step, and the rest will fall into place.",
    "One is initiating, two is patience and trust. 1212 means you are moving toward a new chapter, but you do not need to control every single detail. This number appears especially often to those who over-plan.",
    "In relationships, 1212 represents a stage of growth, taking a shared step forward is worth far more than waiting for the perfect moment.",
    "A project that is not yet fully defined is still worth starting. Action will bring the clarity you seek.",
    "Choose one small step that you can take today. 1212 is about beginning, not waiting for perfection."
  ),
  angel(
    "1234",
    "1234, Step-by-Step Progress",
    "1234 is the number of sequence: everything is in order, simply keep going.",
    "An ascending sequence represents natural, orderly progress, one step after another, without skipping stages. 1234 often appears when someone feels they are moving too slowly. In truth, the pace is just right.",
    "Your relationship is developing naturally and organically, trying to rush emotional milestones will only create unnecessary friction.",
    "Breaking down your big goal into small, concrete milestones is the most effective approach right now.",
    "Write down the next three steps and execute only the first one today. The rest will follow in due time."
  ),
];

export const ANGEL_EN_BY_SLUG: Record<string, AngelNumberEn> =
  Object.fromEntries(ANGEL_NUMBERS_EN.map((number) => [number.slug, number]));

export const ANGEL_FAQ_EN = [
  {
    q: "What are angel numbers?",
    a: "Angel numbers are repeating number sequences you notice frequently, on clocks, license plates, or receipts. In numerological tradition, they are viewed as prompts about where you are in life right now. They are not supernatural predictions; they are practical tools for attention and self-reflection.",
  },
  {
    q: "Why do I see repeating numbers on the clock so often?",
    a: "Partly this is selective attention: once a pattern becomes meaningful, your brain notices and filters it out immediately. Traditional lore adds that you are actively engaging with the theme represented by that number. Both explanations complement each other.",
  },
  {
    q: "What is the difference between an angel number and a life path number?",
    a: "A life path number is calculated from your birth date and remains constant throughout your life, it describes your core character. An angel number is about the current moment: it shifts depending on the phase and questions you are navigating right now.",
  },
  {
    q: "Is 666 a bad sign?",
    a: "No. While popular culture gave it a threatening reputation, in numerology six is about family, care, and home. 666 simply points to an imbalance, typically that you are overwhelmed by material concerns or over-giving to others while neglecting yourself.",
  },
];
