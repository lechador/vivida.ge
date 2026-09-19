/** English editorial content for the Minor Arcana (suits ship ka + en only). */

export type EnglishMinorTarotCard = {
  slug: string;
  suit: "swords" | "cups" | "wands" | "pentacles";
  rank: string;
  name: string;
  glyph: string;
  keywords: string[];
  reversedKeywords: string[];
  upright: string;
  reversed: string;
  love: string;
  career: string;
};

export const MINOR_CARDS_EN: EnglishMinorTarotCard[] = [
  // ── Swords ────────────────────────────────────────────────────────────
  {
    slug: "ace-of-swords",
    suit: "swords",
    rank: "ace",
    name: "Ace of Swords",
    glyph: "🗡️",
    keywords: ["clarity", "truth", "breakthrough", "mind"],
    reversedKeywords: ["confusion", "hasty conclusions", "harshness"],
    upright:
      "The Ace of Swords is clarity of mind — a truth that cuts through fog. An idea, decision or conversation that puts everything in its place.",
    reversed:
      "Reversed, the Ace warns of muddled thinking or a rushed conclusion. Verify the facts before you speak.",
    love: "An honest conversation that clears the air between you.",
    career: "A clear idea or decision — cut the excess and act on it.",
  },
  {
    slug: "two-of-swords",
    suit: "swords",
    rank: "2",
    name: "Two of Swords",
    glyph: "🗡️",
    keywords: ["dilemma", "balance", "pause", "choice"],
    reversedKeywords: ["a delayed choice", "missing information"],
    upright:
      "Two blades held in balance between equal paths. You need a pause — not escape, but conscious waiting until the picture sharpens.",
    reversed:
      "Reversed, the wait has dragged on, and avoiding the choice has itself become the choice.",
    love: "Indecision in the relationship — you both know the conversation is unavoidable.",
    career: "Two options pull at you. Gather the missing fact, then decide.",
  },
  {
    slug: "three-of-swords",
    suit: "swords",
    rank: "3",
    name: "Three of Swords",
    glyph: "🗡️",
    keywords: ["pain", "honesty", "separation", "bitter truth"],
    reversedKeywords: ["reconciliation", "releasing pain", "forgiveness"],
    upright:
      "Three blades through the heart: words or news that cut. The pain is real, but the truth it carries will set you free.",
    reversed:
      "Reversed, the wound is healing — the old pain loses its grip if you stop replaying it.",
    love: "Disappointment or a third party's shadow. Face the truth directly.",
    career:
      "Criticism or failure stings, but the lesson it brings is valuable.",
  },
  {
    slug: "four-of-swords",
    suit: "swords",
    rank: "4",
    name: "Four of Swords",
    glyph: "🗡️",
    keywords: ["rest", "recovery", "pause", "silence"],
    reversedKeywords: ["exhaustion", "refusing rest"],
    upright:
      "Four blades order rest. After battle the mind needs silence — sleep, withdraw, recover your strength, then return.",
    reversed:
      "Reversed warns that you keep refusing rest, and your body will present the bill anyway.",
    love: "The relationship needs breathing room. A pause is not an ending.",
    career: "Take the break before you burn out — you will return clearer.",
  },
  {
    slug: "five-of-swords",
    suit: "swords",
    rank: "5",
    name: "Five of Swords",
    glyph: "🗡️",
    keywords: ["conflict", "hollow victory", "tension"],
    reversedKeywords: ["reconciliation", "an old fight ending"],
    upright:
      "Five blades mark a quarrel where winning costs more than losing. Ask yourself: is this battle worth winning?",
    reversed:
      "Reversed, an old conflict is closing — someone is ready to make the first move.",
    love: "Do not let a small quarrel grow into a deep wound. Choose calm.",
    career:
      "Office politics or a dispute — victory here could cost your career.",
  },
  {
    slug: "six-of-swords",
    suit: "swords",
    rank: "6",
    name: "Six of Swords",
    glyph: "🗡️",
    keywords: ["transition", "leaving the past", "calmer waters"],
    reversedKeywords: ["stuck in the past", "a blocked change"],
    upright:
      "Six blades crossing toward calm water: you are leaving a heavy period behind. The road is still long, but the worst is over.",
    reversed:
      "Reversed, you left the past physically but your mind is still there.",
    love: "The relationship enters a calmer phase — or you are leaving what hurt you.",
    career: "A hard project or job stays behind. Calmer road ahead.",
  },
  {
    slug: "seven-of-swords",
    suit: "swords",
    rank: "7",
    name: "Seven of Swords",
    glyph: "🗡️",
    keywords: ["strategy", "caution", "an independent path"],
    reversedKeywords: ["deception", "conscience", "exposure"],
    upright:
      "Seven blades mean clever strategy — sometimes the direct road fails and you need wit. Act independently, but honestly.",
    reversed:
      "Reversed warns of deception, yours or someone else's. Clean play wins in the long run.",
    love: "Something is hidden — or you are hiding your feelings. Honesty simplifies.",
    career: "Act smartly but ethically. A shortcut will prove expensive.",
  },
  {
    slug: "eight-of-swords",
    suit: "swords",
    rank: "8",
    name: "Eight of Swords",
    glyph: "🗡️",
    keywords: ["self-limitation", "fear", "a trap", "feeling powerless"],
    reversedKeywords: ["liberation", "a new perspective", "returning strength"],
    upright:
      "Eight blades show a self-made trap — the bonds are loose and the road is open, but fear holds you still. The first step is yours.",
    reversed: "Reversed is liberation: you can see the exit you kept missing.",
    love: "You feel trapped, but the door is open. Speak, or walk.",
    career:
      "The limits are more in your head than in reality. Review your options.",
  },
  {
    slug: "nine-of-swords",
    suit: "swords",
    rank: "9",
    name: "Nine of Swords",
    glyph: "🗡️",
    keywords: ["anxiety", "sleeplessness", "night thoughts"],
    reversedKeywords: ["relief", "overcoming fears", "daybreak"],
    upright:
      "Nine blades are night thoughts — fears that grow giant in the dark. Remember: in morning light the problem looks far smaller.",
    reversed:
      "Reversed brings relief — the darkest night is behind you and sleep returns.",
    love: "Night worries about love torment you. Speak honestly in the morning.",
    career:
      "Work stress follows you to bed. Write the thoughts down and sleep.",
  },
  {
    slug: "ten-of-swords",
    suit: "swords",
    rank: "10",
    name: "Ten of Swords",
    glyph: "🗡️",
    keywords: ["rock bottom", "an ending", "betrayal", "daybreak"],
    reversedKeywords: ["recovery", "the worst is over"],
    upright:
      "Ten blades are rock bottom — it cannot get worse, and that is good news. What ended has ended; daybreak is already starting.",
    reversed:
      "Reversed, the worst is behind you. You are slowly getting back up.",
    love: "Something has ended for good — painful, but liberating.",
    career:
      "A project or chapter has collapsed. Do not try to save it; start new.",
  },
  {
    slug: "page-of-swords",
    suit: "swords",
    rank: "page",
    name: "Page of Swords",
    glyph: "🗡️",
    keywords: ["curiosity", "news", "speed", "honesty"],
    reversedKeywords: ["gossip", "hasty words", "cynicism"],
    upright:
      "The Page is the messenger of a new idea — curious, quick, direct. Ask questions, learn, speak up. The energy is on your side.",
    reversed:
      "Reversed, the Page warns of gossip and hasty words. Do not turn truth into a weapon.",
    love: "An honest talk or an unexpected confession. Listen.",
    career: "New information or an idea. Study it before you spread it.",
  },
  {
    slug: "knight-of-swords",
    suit: "swords",
    rank: "knight",
    name: "Knight of Swords",
    glyph: "🗡️",
    keywords: ["speed", "resolve", "charge", "energy"],
    reversedKeywords: ["haste", "aggression", "burnout"],
    upright:
      "The Knight arrives like a storm — fast action, a clear target, no retreat. When the moment is ripe, do not hesitate.",
    reversed:
      "Reversed, the Knight is reckless — speed misses the target. Slow down before you break something.",
    love: "Passionate, fast-moving developments. Make sure you share the same pace.",
    career: "Time to charge — but a charge without a plan is chaos.",
  },
  {
    slug: "queen-of-swords",
    suit: "swords",
    rank: "queen",
    name: "Queen of Swords",
    glyph: "🗡️",
    keywords: ["clarity", "independence", "insight", "honesty"],
    reversedKeywords: ["coldness", "bitterness", "excessive criticism"],
    upright:
      "The Queen is wisdom earned through experience — she sees people as they are. Be honest, but fair.",
    reversed:
      "Reversed, the Queen warns of coldness. Do not let pain turn your heart to stone.",
    love: "Clarity in feelings — you know what you want and you say it.",
    career: "Objectivity and directness. Your judgment is sound; trust it.",
  },
  {
    slug: "king-of-swords",
    suit: "swords",
    rank: "king",
    name: "King of Swords",
    glyph: "🗡️",
    keywords: ["authority", "logic", "justice", "discipline"],
    reversedKeywords: ["manipulation", "a cold mind", "injustice"],
    upright:
      "The King is the highest master of mind — logic, ethics, fair judgment. Decide by facts, not emotions.",
    reversed:
      "Reversed, the King misuses mind — manipulation, cold calculation. Check the motives.",
    love: "You need clear rules and honest talk in the relationship.",
    career: "Strategy, analysis, fair leadership — your strong side.",
  },
  // ── Cups ──────────────────────────────────────────────────────────────
  {
    slug: "ace-of-cups",
    suit: "cups",
    rank: "ace",
    name: "Ace of Cups",
    glyph: "🏆",
    keywords: ["new feelings", "love", "intuition", "healing"],
    reversedKeywords: ["a closed heart", "emotional fatigue"],
    upright:
      "The Ace of Cups is the start of new feeling — love, friendship or spiritual awakening. The heart is opening. Let it.",
    reversed:
      "Reversed, the Ace points to a closed heart — hiding feelings, even from yourself.",
    love: "New love or deepening feelings. Open your heart.",
    career:
      "A creative offer or a team where you will belong with your whole soul.",
  },
  {
    slug: "two-of-cups",
    suit: "cups",
    rank: "2",
    name: "Two of Cups",
    glyph: "🏆",
    keywords: ["connection", "partnership", "mutual understanding"],
    reversedKeywords: ["imbalance", "misunderstanding", "a one-sided bond"],
    upright:
      "Two cups meeting: equal, honest, mutual. Whether love, friendship or business, the connection is healthy.",
    reversed:
      "Reversed, the balance is broken — one gives more while the other only takes.",
    love: "A strong mutual bond — or the chance to build one.",
    career: "A successful partnership. The deal serves both sides.",
  },
  {
    slug: "three-of-cups",
    suit: "cups",
    rank: "3",
    name: "Three of Cups",
    glyph: "🏆",
    keywords: ["friendship", "celebration", "community"],
    reversedKeywords: ["isolation", "gossip in the circle", "drifting apart"],
    upright:
      "Three cups raised with friends — joy multiplies when shared. Go out, celebrate, give thanks.",
    reversed:
      "Reversed, you have drifted from your circle, or the social round is draining you.",
    love: "Shared friends and happy times strengthen the bond.",
    career: "Team success. Celebrate it together with colleagues.",
  },
  {
    slug: "four-of-cups",
    suit: "cups",
    rank: "4",
    name: "Four of Cups",
    glyph: "🏆",
    keywords: ["apathy", "a missed chance", "withdrawal"],
    reversedKeywords: ["reawakening", "new interest", "acceptance"],
    upright:
      "Four cups are apathy — three stand before you while you miss the fourth. The chance is right under your nose, but your gaze is down.",
    reversed:
      "Reversed is reawakening: the world interests you again, and you catch the chance.",
    love: "You fail to value your partner's efforts. Look around.",
    career: "An offer you keep ignoring. Look at it once more.",
  },
  {
    slug: "five-of-cups",
    suit: "cups",
    rank: "5",
    name: "Five of Cups",
    glyph: "🏆",
    keywords: ["loss", "grief", "remaining hope"],
    reversedKeywords: ["acceptance", "letting go of the past", "new hope"],
    upright:
      "Five cups grieve what spilled — three lie fallen, but two still stand. Mourn, then turn and see what survived.",
    reversed:
      "Reversed is letting go of the past. The pain loosens its grip as you move forward.",
    love: "The pain of parting or disappointment. Time heals.",
    career: "Failure hurts, but two cups stand untouched. Build on them.",
  },
  {
    slug: "six-of-cups",
    suit: "cups",
    rank: "6",
    name: "Six of Cups",
    glyph: "🏆",
    keywords: ["nostalgia", "childhood", "warmth", "the past"],
    reversedKeywords: ["living in the past", "growing up", "an old wound"],
    upright:
      "Six cups are a sweet memory — childhood, old friends, home. The past warms your heart; sometimes going back is moving forward.",
    reversed:
      "Reversed warns against living in the past. Memory is a place to visit, not to live.",
    love: "An old love or childhood friend returns to your life.",
    career: "An old contact or skill becomes useful again.",
  },
  {
    slug: "seven-of-cups",
    suit: "cups",
    rank: "7",
    name: "Seven of Cups",
    glyph: "🏆",
    keywords: ["options", "illusion", "choice", "dreams"],
    reversedKeywords: ["clarity", "priorities", "a realistic choice"],
    upright:
      "Seven cups glitter with options, all calling you. But not all that glitters is gold: choose one and release the rest.",
    reversed:
      "Reversed is clarity — the fog lifts and you see which cup is real.",
    love: "Romantic fantasies pull you from reality. Choose what is real.",
    career: "Too many possibilities scatter you. Pick one and follow it.",
  },
  {
    slug: "eight-of-cups",
    suit: "cups",
    rank: "8",
    name: "Eight of Cups",
    glyph: "🏆",
    keywords: ["leaving", "seeking", "deeper meaning"],
    reversedKeywords: ["staying", "fear of change", "attachment"],
    upright:
      "Eight cups walk away from what is comfortable but no longer fulfilling. A hard step — yet the soul asks for deeper water.",
    reversed:
      "Reversed, you cannot dare to leave — or you left and keep looking back.",
    love: "A relationship that no longer fulfills you. Time to go.",
    career: "A stable but empty job. Your soul asks for more.",
  },
  {
    slug: "nine-of-cups",
    suit: "cups",
    rank: "9",
    name: "Nine of Cups",
    glyph: "🏆",
    keywords: ["wishes fulfilled", "contentment", "pride"],
    reversedKeywords: ["dissatisfaction", "materialism", "an empty wish"],
    upright:
      "Nine cups are wishes come true — what you dreamed of is in your hands. Enjoy, you earned it, and share it.",
    reversed:
      "Reversed warns: you got what you wanted, but it brought no happiness. Reconsider the wish.",
    love: "Emotional fullness — the relationship gives you what you need.",
    career: "The goal is reached. Enjoy it and set the next one.",
  },
  {
    slug: "ten-of-cups",
    suit: "cups",
    rank: "10",
    name: "Ten of Cups",
    glyph: "🏆",
    keywords: ["happiness", "harmony", "family", "fullness"],
    reversedKeywords: ["family tension", "broken harmony"],
    upright:
      "Ten cups are complete happiness — love, family, home, peace. One of the brightest cards in the deck: everything is in its place.",
    reversed:
      "Reversed, tension strains the family or close circle. Harmony needs rebuilding.",
    love: "Deep, lasting happiness — the home you are building together.",
    career: "Work and life in harmony. Appreciate it.",
  },
  {
    slug: "page-of-cups",
    suit: "cups",
    rank: "page",
    name: "Page of Cups",
    glyph: "🏆",
    keywords: ["sensitivity", "creativity", "good news", "sincerity"],
    reversedKeywords: ["emotional immaturity", "misunderstanding"],
    upright:
      "The Page is a gentle messenger — good news, a creative spark, a sincere feeling. Listen to intuition and do not be shy of tenderness.",
    reversed:
      "Reversed, the Page points to emotional immaturity — feelings that cannot become words.",
    love: "A romantic gesture or confession is on its way.",
    career: "A creative idea or intuitive find. Catch it.",
  },
  {
    slug: "knight-of-cups",
    suit: "cups",
    rank: "knight",
    name: "Knight of Cups",
    glyph: "🏆",
    keywords: ["romance", "an offer", "idealism", "movement"],
    reversedKeywords: ["illusion", "empty promises", "shifting moods"],
    upright:
      "The Knight moves with the heart — a romantic offer, a creative project, following the heart's call. Follow, but keep your eyes open.",
    reversed:
      "Reversed, the Knight warns of illusion — beautiful promises with no deeds behind them.",
    love: "A romantic gesture or a new admirer. Check whether deeds follow words.",
    career: "A creative offer. Beautiful, but check the details.",
  },
  {
    slug: "queen-of-cups",
    suit: "cups",
    rank: "queen",
    name: "Queen of Cups",
    glyph: "🏆",
    keywords: ["intuition", "compassion", "calm", "care"],
    reversedKeywords: ["emotional burnout", "missing boundaries"],
    upright:
      "The Queen is wisdom of the heart — intuition, compassion, quiet strength. Listen to others and to yourself; care is your gift.",
    reversed:
      "Reversed, the Queen points to emotional burnout — you hear everyone while no time remains for yourself.",
    love: "A deep emotional bond. You feel each other without words.",
    career: "Empathy and intuition at work. You are good with people.",
  },
  {
    slug: "king-of-cups",
    suit: "cups",
    rank: "king",
    name: "King of Cups",
    glyph: "🏆",
    keywords: ["emotional maturity", "calm", "diplomacy", "balance"],
    reversedKeywords: ["emotional manipulation", "suppressed feelings"],
    upright:
      "The King is master of emotions — feels deeply yet rules wisely. Diplomacy, calm in the storm, balance between heart and mind.",
    reversed:
      "Reversed, the King suppresses feelings or uses them to manipulate.",
    love: "A mature, steady partner — or you becoming one.",
    career:
      "Diplomacy and emotional intelligence. You resolve conflicts with calm.",
  },
  // ── Wands ─────────────────────────────────────────────────────────────
  {
    slug: "ace-of-wands",
    suit: "wands",
    rank: "ace",
    name: "Ace of Wands",
    glyph: "🔥",
    keywords: ["a spark", "inspiration", "new energy", "opportunity"],
    reversedKeywords: ["low energy", "a delayed start"],
    upright:
      "The Ace of Wands is new fire — an idea, a passion, an impulse demanding action. The spark is in your hand. Light it.",
    reversed:
      "Reversed, the Ace points to banked energy. The idea exists, but the step is postponed.",
    love: "New passion or a relationship rekindled.",
    career: "The spark of a new project. Start now.",
  },
  {
    slug: "two-of-wands",
    suit: "wands",
    rank: "2",
    name: "Two of Wands",
    glyph: "🔥",
    keywords: ["planning", "vision", "choice", "boldness"],
    reversedKeywords: ["hesitation", "poor planning", "fear of progress"],
    upright:
      "Two wands are the world held in hand — the plan is ready, the road is visible. One thing remains: a bold first step.",
    reversed:
      "Reversed is hesitation — the plan stays on paper because the step frightens you.",
    love: "Time to talk about where the relationship is going.",
    career: "An expansion plan. Calculate the risk and act.",
  },
  {
    slug: "three-of-wands",
    suit: "wands",
    rank: "3",
    name: "Three of Wands",
    glyph: "🔥",
    keywords: ["foresight", "expansion", "anticipation"],
    reversedKeywords: ["delays", "disappointment", "a failed plan"],
    upright:
      "Three wands watch the horizon — your ships are already sent and results are coming. Foresight pays off.",
    reversed: "Reversed means delays or broken expectations. Review the plan.",
    love: "The relationship widens — a shared vision of the future.",
    career: "Investment or expansion. The fruit is ripening; be patient.",
  },
  {
    slug: "four-of-wands",
    suit: "wands",
    rank: "4",
    name: "Four of Wands",
    glyph: "🔥",
    keywords: ["celebration", "home", "stability", "achievement"],
    reversedKeywords: ["a transitional period", "tension at home"],
    upright:
      "Four wands are celebration — home, wedding, a milestone reached. Pause, celebrate, share the joy with beloved people.",
    reversed:
      "Reversed marks a transitional period. Stability is still under construction.",
    love: "A happy chapter — engagement, wedding or moving in together.",
    career: "A successful finish. Celebrate it with the team.",
  },
  {
    slug: "five-of-wands",
    suit: "wands",
    rank: "5",
    name: "Five of Wands",
    glyph: "🔥",
    keywords: ["competition", "rivalry", "training"],
    reversedKeywords: ["conflict ending", "an inner battle"],
    upright:
      "Five wands are healthy rivalry — ideas clash so the best grows stronger. Do not fear debate; it trains you.",
    reversed:
      "Reversed marks either a conflict ending or a battle that moved inside.",
    love: "Small disagreements. Energy, not danger.",
    career: "Competition makes you stronger. Play fair.",
  },
  {
    slug: "six-of-wands",
    suit: "wands",
    rank: "6",
    name: "Six of Wands",
    glyph: "🔥",
    keywords: ["victory", "recognition", "success"],
    reversedKeywords: ["a fall", "arrogance", "missing recognition"],
    upright:
      "Six wands are victory everyone can see — recognition, reward, applause. Accept it with grace and share it.",
    reversed:
      "Reversed warns of arrogance. Do not let victory make you forget yourself.",
    love: "A relationship you are proud of. Show it.",
    career: "Public success. A promotion or award is near.",
  },
  {
    slug: "seven-of-wands",
    suit: "wands",
    rank: "7",
    name: "Seven of Wands",
    glyph: "🔥",
    keywords: ["defense", "position", "courage"],
    reversedKeywords: ["yielding", "pressure", "fatigue"],
    upright:
      "Seven wands defend a position — you stand higher and you are right. Everyone against you? All the better; truth is on your side.",
    reversed:
      "Reversed means yielding or fatigue — a battle no longer worth fighting.",
    love: "Defend the relationship against outside pressure.",
    career: "Defend the idea or position. You are right.",
  },
  {
    slug: "eight-of-wands",
    suit: "wands",
    rank: "8",
    name: "Eight of Wands",
    glyph: "🔥",
    keywords: ["speed", "news", "movement", "progress"],
    reversedKeywords: ["delays", "chaos", "misunderstanding"],
    upright:
      "Eight wands fly through the air — news, changes, progress arriving fast. Prepare, act, hold the pace.",
    reversed: "Reversed means delays or information chaos. Check the facts.",
    love: "Fast developments — messages, meetings, movement.",
    career: "The project accelerates. Be ready.",
  },
  {
    slug: "nine-of-wands",
    suit: "wands",
    rank: "9",
    name: "Nine of Wands",
    glyph: "🔥",
    keywords: ["endurance", "last reserves", "vigilance"],
    reversedKeywords: ["fatigue", "giving up", "lowering defenses"],
    upright:
      "Nine wands are the last reserves — you are tired but still standing. One step remains; do not quit at the finish.",
    reversed:
      "Reversed says the reserves are spent. You need rest, not surrender.",
    love: "Fighting for the relationship exhausts you — but it is worth it.",
    career: "One last effort is needed. The finish is near.",
  },
  {
    slug: "ten-of-wands",
    suit: "wands",
    rank: "10",
    name: "Ten of Wands",
    glyph: "🔥",
    keywords: ["burden", "responsibility", "overload"],
    reversedKeywords: ["laying down the burden", "delegation", "release"],
    upright:
      "Ten wands are too heavy a load — you carry everything alone. Release some, share some; the village is already in sight.",
    reversed:
      "Reversed is laying the burden down — delegation, refusal, release.",
    love: "The whole weight of the relationship is on you. Share it.",
    career: "You are overloaded. Delegation is wisdom, not weakness.",
  },
  {
    slug: "page-of-wands",
    suit: "wands",
    rank: "page",
    name: "Page of Wands",
    glyph: "🔥",
    keywords: ["enthusiasm", "a new venture", "boldness"],
    reversedKeywords: ["impulsiveness", "missing direction"],
    upright:
      "The Page is a messenger full of enthusiasm — a new idea, a journey, a venture. The universe says: dare, try.",
    reversed:
      "Reversed, the Page is impulsiveness — enthusiasm without direction fades.",
    love: "Playful flirting or a new acquaintance. Start light.",
    career: "An idea for a new direction. Study it and test it.",
  },
  {
    slug: "knight-of-wands",
    suit: "wands",
    rank: "knight",
    name: "Knight of Wands",
    glyph: "🔥",
    keywords: ["adventure", "passion", "speed", "risk"],
    reversedKeywords: ["recklessness", "instability", "promises of wind"],
    upright:
      "The Knight arrives like fire — passion, travel, a bold leap. Live fully, but know where you are going.",
    reversed: "Reversed, the Knight is reckless — fire that burns as well.",
    love: "A passionate romance. Enjoy it, but keep your feet on the ground.",
    career: "A bold move. Make sure the risk is calculated.",
  },
  {
    slug: "queen-of-wands",
    suit: "wands",
    rank: "queen",
    name: "Queen of Wands",
    glyph: "🔥",
    keywords: ["charisma", "warmth", "confidence", "energy"],
    reversedKeywords: ["jealousy", "missing self-belief"],
    upright:
      "The Queen shines like the sun — charisma, warmth, confidence. People watch you; use the influence for good.",
    reversed:
      "Reversed, the Queen marks an inner shadow — jealousy or self-doubt.",
    love: "The peak of attraction. Be sincere and hearts will answer.",
    career: "Leadership through charisma. The team stands behind you.",
  },
  {
    slug: "king-of-wands",
    suit: "wands",
    rank: "king",
    name: "King of Wands",
    glyph: "🔥",
    keywords: ["vision", "leadership", "charisma", "boldness"],
    reversedKeywords: ["domination", "impulsive leadership", "arrogance"],
    upright:
      "The King is a leader of vision — he moves people toward a goal and lights enthusiasm. Have a big plan? Gather the people.",
    reversed:
      "Reversed, the King dominates — leadership by force, not inspiration.",
    love: "A passionate, charismatic partner — or you being one.",
    career: "Business vision and leadership. Time to assemble the team.",
  },
  // ── Pentacles ─────────────────────────────────────────────────────────
  {
    slug: "ace-of-pentacles",
    suit: "pentacles",
    rank: "ace",
    name: "Ace of Pentacles",
    glyph: "🪙",
    keywords: ["new opportunity", "prosperity", "a beginning", "stability"],
    reversedKeywords: ["a missed chance", "financial anxiety"],
    upright:
      "The Ace of Pentacles is a tangible opportunity — a job, income, project, health. The seed is in the soil. Water it.",
    reversed:
      "Reversed, the Ace points to a missed chance or financial anxiety. Check the details.",
    love: "The start of a steady, reliable bond.",
    career: "A concrete offer — a job, a contract, an investment.",
  },
  {
    slug: "two-of-pentacles",
    suit: "pentacles",
    rank: "2",
    name: "Two of Pentacles",
    glyph: "🪙",
    keywords: ["balance", "juggling", "flexibility"],
    reversedKeywords: ["overload", "chaos", "losing control"],
    upright:
      "Two coins are juggling — work, family, money, time. No ball may drop; order your priorities and dance.",
    reversed: "Reversed, the balls are dropping. You took on too much.",
    love: "Balance between love and the rest of life.",
    career: "Juggling several projects. Set the priority.",
  },
  {
    slug: "three-of-pentacles",
    suit: "pentacles",
    rank: "3",
    name: "Three of Pentacles",
    glyph: "🪙",
    keywords: ["craftsmanship", "teamwork", "recognition"],
    reversedKeywords: ["poor workmanship", "team problems"],
    upright:
      "Three coins are mastery recognized — your work is seen and valued. Collaborate, learn, build with quality.",
    reversed: "Reversed points to poor workmanship or team discord.",
    love: "Working on the relationship together. Both are craftsmen.",
    career: "Professionalism is valued. Keep the quality up.",
  },
  {
    slug: "four-of-pentacles",
    suit: "pentacles",
    rank: "4",
    name: "Four of Pentacles",
    glyph: "🪙",
    keywords: ["attachment", "control", "security"],
    reversedKeywords: ["release", "generosity", "risk"],
    upright:
      "Four coins are tightly held hands — money, a person, control. Security is good, but gripping chokes.",
    reversed: "Reversed is opening the hands — giving, sharing, releasing.",
    love: "Attachment or jealousy. Loosen the reins.",
    career: "Hoarding money blocks growth. Spend wisely.",
  },
  {
    slug: "five-of-pentacles",
    suit: "pentacles",
    rank: "5",
    name: "Five of Pentacles",
    glyph: "🪙",
    keywords: ["hardship", "loss", "seeking support"],
    reversedKeywords: ["a way out", "accepting help", "improvement"],
    upright:
      "Five coins are a hard period — money, health or loneliness weigh on you. But help is near. Ask.",
    reversed: "Reversed is light at the tunnel's end. Things improve.",
    love: "Hardship weathered together strengthens the bond.",
    career: "Financial difficulty is temporary. Ask for help.",
  },
  {
    slug: "six-of-pentacles",
    suit: "pentacles",
    rank: "6",
    name: "Six of Pentacles",
    glyph: "🪙",
    keywords: ["generosity", "balance", "help"],
    reversedKeywords: ["debts", "inequality", "giving with strings"],
    upright:
      "Six coins are fair exchange — giving and receiving in balance. Either you are helped or you help; both are noble.",
    reversed:
      "Reversed marks inequality — a debt that binds, or help with conditions.",
    love: "Balance of giving and receiving. Both contribute equally.",
    career: "Fair pay or support. Accept it with dignity.",
  },
  {
    slug: "seven-of-pentacles",
    suit: "pentacles",
    rank: "7",
    name: "Seven of Pentacles",
    glyph: "🪙",
    keywords: ["patience", "assessment", "harvest", "time"],
    reversedKeywords: ["impatience", "wasted labor", "reconsidering"],
    upright:
      "Seven coins are the gardener watching the crop — labor invested, fruit ripening. Patience; harvest time is not yet.",
    reversed:
      "Reversed warns of wasted labor. Reconsider the direction before investing more.",
    love: "Labor invested in the relationship will bear fruit. Be patient.",
    career: "The project ripens. Do not harvest early.",
  },
  {
    slug: "eight-of-pentacles",
    suit: "pentacles",
    rank: "8",
    name: "Eight of Pentacles",
    glyph: "🪙",
    keywords: ["mastery", "labor", "details", "learning"],
    reversedKeywords: ["superficiality", "impatience", "missing quality"],
    upright:
      "Eight coins are the master's labor — details, practice, striving for perfection. Quiet work yields loud results.",
    reversed:
      "Reversed points to superficiality — you rush and quality suffers.",
    love: "Daily care for the relationship. Small deeds count.",
    career: "Refining the skill. Practice makes you a master.",
  },
  {
    slug: "nine-of-pentacles",
    suit: "pentacles",
    rank: "9",
    name: "Nine of Pentacles",
    glyph: "🪙",
    keywords: ["independence", "luxury", "self-reliance", "dignity"],
    reversedKeywords: ["dependence", "financial insecurity"],
    upright:
      "Nine coins are deserved luxury — independence earned through labor. Enjoy the fruit without guilt.",
    reversed:
      "Reversed marks financial insecurity or living on someone else's means.",
    love: "You are self-reliant — you enter relationships by choice, not need.",
    career: "Financial independence is near. Continue.",
  },
  {
    slug: "ten-of-pentacles",
    suit: "pentacles",
    rank: "10",
    name: "Ten of Pentacles",
    glyph: "🪙",
    keywords: ["legacy", "family", "lasting wealth"],
    reversedKeywords: ["family disputes", "short-term thinking"],
    upright:
      "Ten coins are legacy — family, tradition, wealth that outlasts generations. Build so it remains for your children.",
    reversed: "Reversed marks family or money disputes. The long view is lost.",
    love: "Building a family on a firm foundation.",
    career: "Long-term stability — pension, property, inheritance.",
  },
  {
    slug: "page-of-pentacles",
    suit: "pentacles",
    rank: "page",
    name: "Page of Pentacles",
    glyph: "🪙",
    keywords: ["study", "new chance", "practicality"],
    reversedKeywords: ["a missed chance", "an unrealistic plan"],
    upright:
      "The Page is a practical student — a new chance, a course, a job. Study diligently; a small step starts a long road.",
    reversed:
      "Reversed, the Page marks a missed chance. Your attention scattered.",
    love: "A realistic approach to feelings. Slowly and firmly.",
    career: "Study or an internship. An investment in yourself.",
  },
  {
    slug: "knight-of-pentacles",
    suit: "pentacles",
    rank: "knight",
    name: "Knight of Pentacles",
    glyph: "🪙",
    keywords: ["diligence", "reliability", "method"],
    reversedKeywords: ["stubbornness", "boredom", "stalling"],
    upright:
      "The Knight moves slowly but surely — diligence, reliability, routine that delivers. Boring? Effective.",
    reversed:
      "Reversed, the Knight is stubborn — method became the goal and progress stopped.",
    love: "A reliable though unhurried partner. Proves it by deeds.",
    career: "Methodical labor. The result is guaranteed.",
  },
  {
    slug: "queen-of-pentacles",
    suit: "pentacles",
    rank: "queen",
    name: "Queen of Pentacles",
    glyph: "🪙",
    keywords: ["care", "practicality", "abundance", "warmth"],
    reversedKeywords: ["forgetting yourself", "work-family imbalance"],
    upright:
      "The Queen is practical warmth — home, business, family flourish in her hands. She cares for others and for herself.",
    reversed:
      "Reversed, the Queen forgets herself — nursing everyone while running empty.",
    love: "A caring partner. A home that feels warm.",
    career: "Business sense and organization. You love money and it loves you.",
  },
  {
    slug: "king-of-pentacles",
    suit: "pentacles",
    rank: "king",
    name: "King of Pentacles",
    glyph: "🪙",
    keywords: ["success", "stability", "results", "wisdom"],
    reversedKeywords: ["greed", "materialism", "corruption"],
    upright:
      "The King is the peak of material mastery — success, stability, generosity through power. Build, and share.",
    reversed:
      "Reversed, the King is greed — money became the goal and people the means.",
    love: "A steady, generous partner. Security.",
    career: "The financial peak — business, investments, property.",
  },
];

export const MINOR_EN_BY_SLUG: Record<string, EnglishMinorTarotCard> =
  Object.fromEntries(MINOR_CARDS_EN.map((card) => [card.slug, card]));
