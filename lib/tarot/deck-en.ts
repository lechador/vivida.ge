/** English editorial content for the 22-card Major Arcana deck. */
export type EnglishTarotCard = {
  slug: string;
  number: number;
  name: string;
  glyph: string;
  keywords: string[];
  reversedKeywords: string[];
  upright: string;
  reversed: string;
  love: string;
  career: string;
};

export const TAROT_CARDS_EN: EnglishTarotCard[] = [
  {
    slug: "the-fool", number: 0, name: "The Fool", glyph: "🃏",
    keywords: ["new beginnings", "spontaneity", "freedom", "trust"],
    reversedKeywords: ["recklessness", "hesitation", "poor timing"],
    upright: "The Fool opens a new journey: a step into the unknown with curiosity, trust and an open heart. You do not need every answer before you begin.",
    reversed: "Reversed, The Fool warns against a careless leap or fear disguised as preparation. Check the ground, then choose consciously.",
    love: "A fresh connection or a more spontaneous chapter in an existing relationship asks for honesty and courage.",
    career: "A new path, venture or calculated risk may be calling. Learn enough to move, but do not wait for perfect certainty.",
  },
  {
    slug: "the-magician", number: 1, name: "The Magician", glyph: "🪄",
    keywords: ["willpower", "resourcefulness", "manifestation", "skill"],
    reversedKeywords: ["manipulation", "scattered energy", "unused talent"],
    upright: "The Magician reminds you that the tools are already in your hands. Focus intention, skill and action on one clear outcome.",
    reversed: "Reversed, The Magician points to scattered effort, self-doubt or influence used without integrity. Bring your energy back to one honest aim.",
    love: "Magnetism and initiative shape the connection. Say what you want and make room for an equally direct response.",
    career: "Your ability and opportunity can meet now. Show your work, communicate clearly and take the lead.",
  },
  {
    slug: "the-high-priestess", number: 2, name: "The High Priestess", glyph: "🌙",
    keywords: ["intuition", "mystery", "inner knowing", "wisdom"],
    reversedKeywords: ["blocked intuition", "secrecy", "inner noise"],
    upright: "The High Priestess asks you to listen beneath the obvious. A quieter truth is available through intuition, dreams and careful observation.",
    reversed: "Reversed, she suggests that you are ignoring your instincts or that essential information remains hidden. Pause before deciding.",
    love: "Feelings may be deep but not yet spoken. Let trust develop without forcing disclosure before it is ready.",
    career: "Not every answer is in the visible data. Notice patterns, timing and what is not being said.",
  },
  {
    slug: "the-empress", number: 3, name: "The Empress", glyph: "🌷",
    keywords: ["abundance", "creativity", "care", "growth"],
    reversedKeywords: ["creative block", "overgiving", "self-neglect"],
    upright: "The Empress carries the energy of growth, beauty and nourishment. What you tend with patience can become abundant.",
    reversed: "Reversed, she calls attention to depleted energy or care flowing only outward. Restore yourself before asking more of your creativity.",
    love: "Warmth, sensuality and emotional safety help a relationship flourish.",
    career: "A creative project can bear fruit when it receives consistent time, resources and room to develop.",
  },
  {
    slug: "the-emperor", number: 4, name: "The Emperor", glyph: "🏛️",
    keywords: ["structure", "authority", "stability", "leadership"],
    reversedKeywords: ["rigidity", "domination", "lack of structure"],
    upright: "The Emperor asks for order, boundaries and responsible leadership. Build a structure strong enough to support the future you want.",
    reversed: "Reversed, he reveals excessive control or the absence of a reliable framework. Replace force with clear, fair boundaries.",
    love: "Commitment and dependability matter, but security should not become control.",
    career: "Lead with discipline, define expectations and make decisions that serve the long term.",
  },
  {
    slug: "the-hierophant", number: 5, name: "The Hierophant", glyph: "🗝️",
    keywords: ["tradition", "learning", "guidance", "shared values"],
    reversedKeywords: ["rebellion", "dogma", "an unconventional path"],
    upright: "The Hierophant points toward trusted knowledge, mentorship and traditions that carry hard-won wisdom. Learn the rules before changing them.",
    reversed: "Reversed, this card asks whether convention still serves your truth. An independent path may be necessary, but choose it thoughtfully.",
    love: "Shared values, loyalty and a more formal commitment come into focus.",
    career: "A mentor, course or established system can help you advance more efficiently.",
  },
  {
    slug: "the-lovers", number: 6, name: "The Lovers", glyph: "💞",
    keywords: ["love", "choice", "alignment", "connection"],
    reversedKeywords: ["disharmony", "misalignment", "a difficult choice"],
    upright: "The Lovers is both connection and choice. Let your decision reflect your deepest values rather than fear or temporary pressure.",
    reversed: "Reversed, it signals imbalance, mixed commitments or a conflict between desire and values. Name the contradiction honestly.",
    love: "A meaningful bond deepens through mutual choice, openness and aligned values.",
    career: "A major decision asks which path fits who you are, not merely what appears most impressive.",
  },
  {
    slug: "the-chariot", number: 7, name: "The Chariot", glyph: "🐎",
    keywords: ["determination", "victory", "direction", "self-control"],
    reversedKeywords: ["lost direction", "aggression", "stalled momentum"],
    upright: "The Chariot brings progress through focus and disciplined will. Hold competing forces together and steer them toward one destination.",
    reversed: "Reversed, it points to scattered momentum or a struggle for control. Reconfirm the destination before pushing harder.",
    love: "The relationship needs a shared direction and the willingness to move as a team.",
    career: "Focused effort and decisive leadership can break through resistance.",
  },
  {
    slug: "strength", number: 8, name: "Strength", glyph: "🦁",
    keywords: ["courage", "patience", "compassion", "inner strength"],
    reversedKeywords: ["self-doubt", "fear", "drained confidence"],
    upright: "Strength is calm courage: meeting powerful emotion with patience rather than force. Your steadiness is more effective than domination.",
    reversed: "Reversed, it highlights self-doubt or energy worn down by an inner battle. Treat yourself with the compassion you would offer someone you love.",
    love: "Gentleness, patience and brave vulnerability make the bond stronger.",
    career: "Meet pressure with quiet endurance. Confidence grows through consistent action, not performance.",
  },
  {
    slug: "the-hermit", number: 9, name: "The Hermit", glyph: "🏮",
    keywords: ["reflection", "solitude", "search", "inner guidance"],
    reversedKeywords: ["isolation", "avoidance", "loneliness"],
    upright: "The Hermit invites a deliberate retreat from noise. Solitude, study and reflection can reveal the answer that outside opinions obscure.",
    reversed: "Reversed, solitude may have become isolation or avoidance. Keep the insight you found, then reconnect with the world.",
    love: "Space for self-understanding may be necessary before closeness can become more honest.",
    career: "Deep work, research or independent reflection will be more valuable than chasing immediate visibility.",
  },
  {
    slug: "wheel-of-fortune", number: 10, name: "Wheel of Fortune", glyph: "🎡",
    keywords: ["change", "cycles", "turning point", "opportunity"],
    reversedKeywords: ["resistance", "setback", "repeating patterns"],
    upright: "The Wheel of Fortune marks a turning point. Circumstances are moving, and your best response is to recognize the opening and adapt.",
    reversed: "Reversed, a difficult cycle may be repeating or change may feel outside your control. Notice the part of the pattern you can alter.",
    love: "A relationship enters a new phase; flexibility matters more than trying to preserve the old one.",
    career: "An unexpected shift can become an opportunity if you respond quickly and stay grounded.",
  },
  {
    slug: "justice", number: 11, name: "Justice", glyph: "⚖️",
    keywords: ["truth", "fairness", "accountability", "clarity"],
    reversedKeywords: ["bias", "avoidance", "unfairness"],
    upright: "Justice asks for facts, balance and ownership of consequences. Make the choice you could defend in full daylight.",
    reversed: "Reversed, it reveals denial, unfair treatment or a judgment distorted by bias. Seek missing evidence before reaching a conclusion.",
    love: "Honest conversation and equal responsibility are essential now.",
    career: "Contracts, decisions and evaluations favor accuracy, transparency and documented facts.",
  },
  {
    slug: "the-hanged-man", number: 12, name: "The Hanged Man", glyph: "🙃",
    keywords: ["pause", "surrender", "new perspective", "release"],
    reversedKeywords: ["stalling", "resistance", "pointless sacrifice"],
    upright: "The Hanged Man asks you to stop forcing movement. A voluntary pause and a different point of view can change what the situation means.",
    reversed: "Reversed, waiting may have become avoidance or sacrifice without purpose. Decide what you are truly willing to release.",
    love: "Give the connection breathing room and look at the pattern from the other person's perspective.",
    career: "Delay action long enough to rethink the problem, but set a point at which reflection becomes a decision.",
  },
  {
    slug: "death", number: 13, name: "Death", glyph: "🦋",
    keywords: ["ending", "transformation", "release", "renewal"],
    reversedKeywords: ["resistance to change", "stagnation", "unfinished closure"],
    upright: "Death rarely speaks of literal death; it marks an ending that makes transformation possible. Release what has completed its purpose.",
    reversed: "Reversed, you may be holding on to a chapter that is already over. Grief and closure deserve time, but not permanent control.",
    love: "The relationship must transform, or an old emotional pattern must end before intimacy can renew.",
    career: "A role, method or professional identity is ready to be retired so a more fitting direction can emerge.",
  },
  {
    slug: "temperance", number: 14, name: "Temperance", glyph: "🕊️",
    keywords: ["balance", "moderation", "integration", "patience"],
    reversedKeywords: ["excess", "imbalance", "poor timing"],
    upright: "Temperance blends opposites into a workable whole. Progress comes through patience, measured adjustment and sustainable rhythm.",
    reversed: "Reversed, extremes are draining the situation. Reduce the swing, simplify the process and restore a steady pace.",
    love: "Mutual adjustment and calm communication create durable harmony.",
    career: "Combine different skills or viewpoints, and favor consistency over a dramatic short-term push.",
  },
  {
    slug: "the-devil", number: 15, name: "The Devil", glyph: "⛓️",
    keywords: ["attachment", "temptation", "shadow", "material desire"],
    reversedKeywords: ["release", "awareness", "breaking a pattern"],
    upright: "The Devil exposes a bond that feels powerful because it operates in the shadows: compulsion, fear, shame or unhealthy attachment. Naming it restores choice.",
    reversed: "Reversed, the chain is becoming visible and therefore breakable. Small acts of honesty can begin a larger liberation.",
    love: "Strong chemistry may coexist with jealousy, dependence or control. Attraction is not the same as safety.",
    career: "Ambition or financial pressure may be narrowing your choices. Identify the cost of the bargain before accepting it.",
  },
  {
    slug: "the-tower", number: 16, name: "The Tower", glyph: "🗼",
    keywords: ["upheaval", "revelation", "breakthrough", "liberation"],
    reversedKeywords: ["avoided change", "private crisis", "fear of disruption"],
    upright: "The Tower breaks a structure that can no longer hold the truth. The disruption is real, but so is the freedom to rebuild honestly.",
    reversed: "Reversed, you may be postponing an inevitable correction or experiencing the change internally. Address the weak foundation before it fails publicly.",
    love: "A revelation changes the relationship's structure. Truth must come before comfort.",
    career: "Sudden change exposes what was unstable. Protect essentials, learn quickly and rebuild with stronger assumptions.",
  },
  {
    slug: "the-star", number: 17, name: "The Star", glyph: "⭐",
    keywords: ["hope", "healing", "inspiration", "renewal"],
    reversedKeywords: ["discouragement", "disconnection", "lost faith"],
    upright: "The Star brings quiet hope after difficulty. Healing is underway, and authenticity will guide the next chapter better than fear.",
    reversed: "Reversed, hope may feel distant because exhaustion is speaking louder. Reconnect with one small source of meaning and let trust rebuild gradually.",
    love: "Openness and healing make a gentler, more honest kind of intimacy possible.",
    career: "A renewed sense of purpose can guide your work. Share the idea that feels genuinely yours.",
  },
  {
    slug: "the-moon", number: 18, name: "The Moon", glyph: "🌕",
    keywords: ["intuition", "uncertainty", "dreams", "the unconscious"],
    reversedKeywords: ["clarity emerging", "confusion", "suppressed fear"],
    upright: "The Moon moves through uncertainty, emotion and incomplete information. Trust intuition, but verify assumptions before treating them as facts.",
    reversed: "Reversed, confusion may be starting to lift, or fear may be distorting what you see. Bring the hidden concern into clear language.",
    love: "Mixed signals or unspoken fears need compassionate clarification.",
    career: "The full picture is not visible yet. Ask more questions and avoid commitments built on guesswork.",
  },
  {
    slug: "the-sun", number: 19, name: "The Sun", glyph: "☀️",
    keywords: ["joy", "clarity", "success", "vitality"],
    reversedKeywords: ["temporary cloud", "burnout", "delayed joy"],
    upright: "The Sun brings confidence, clarity and life-giving warmth. What was uncertain becomes easier to see, share and celebrate.",
    reversed: "Reversed, the light is present but partly blocked by exhaustion, unrealistic expectations or a delay. Simplify what joy needs to mean.",
    love: "Warmth, playfulness and open affection strengthen the bond.",
    career: "Visibility and success are favored. Let your contribution be seen and acknowledge the people who helped.",
  },
  {
    slug: "judgement", number: 20, name: "Judgement", glyph: "📯",
    keywords: ["awakening", "reckoning", "calling", "renewal"],
    reversedKeywords: ["self-doubt", "harsh judgment", "living in the past"],
    upright: "Judgement is an awakening: an honest review of the past followed by a call to live differently. Take the lesson without remaining inside the old story.",
    reversed: "Reversed, self-criticism or fear of being judged is delaying the next chapter. Accountability should create movement, not paralysis.",
    love: "A relationship is being reassessed; truth may lead to renewal, forgiveness or a clear release.",
    career: "A larger calling or decisive transition asks you to act on what experience has taught you.",
  },
  {
    slug: "the-world", number: 21, name: "The World", glyph: "🌍",
    keywords: ["completion", "achievement", "wholeness", "integration"],
    reversedKeywords: ["unfinished business", "delay", "incomplete closure"],
    upright: "The World marks meaningful completion: the parts have come together, and one full cycle is ready to close. Honor the achievement before beginning again.",
    reversed: "Reversed, one final piece remains unfinished or closure is being delayed. Identify the concrete step that completes the cycle.",
    love: "A relationship reaches a mature sense of wholeness or completes an important chapter with clarity.",
    career: "A major goal is achieved. Integrate what you learned before choosing the next horizon.",
  },
];

export const TAROT_EN_BY_SLUG: Record<string, EnglishTarotCard> =
  Object.fromEntries(TAROT_CARDS_EN.map((card) => [card.slug, card]));

export const SPREAD_POSITIONS_EN = [
  "Past / root",
  "Present / core",
  "Future / path",
] as const;
