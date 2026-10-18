export type DreamSymbolEn = {
  slug: string;
  title: string;
  summary: string;
  meaning: string;
  variants: Array<{ when: string; means: string }>;
  positive: string;
  caution: string;
};

export const DREAM_SYMBOLS_EN: DreamSymbolEn[] = [
  {
    slug: "gveli",
    title: "Snake",
    summary: "A classic symbol of transformation, hidden tension, instinct, and renewal.",
    meaning:
      "Dreaming of a snake often points to something beneath the surface that wants your attention—either an unspoken stressor or an ongoing personal transition.",
    variants: [
      {
        when: "you see a calm snake",
        means: "Growing awareness, grounded instinct, and quiet adaptation to change.",
      },
      {
        when: "a snake chases or bites you",
        means: "A prompt to address an avoided conversation, boundary, or source of stress.",
      },
    ],
    positive: "Shedding an outdated habit and stepping into renewed energy.",
    caution: "Avoid ignoring a situation that clearly needs direct honesty.",
  },
  {
    slug: "wyali",
    title: "Water",
    summary: "A mirror of emotional state, intuition, and mental clarity.",
    meaning:
      "Water in dreams reflects how your emotional life feels right now. Clear, calm water suggests steadiness, while turbulent water points to emotional overload.",
    variants: [
      {
        when: "the water is clear and calm",
        means: "Emotional relief, clarity, and peaceful perspective.",
      },
      {
        when: "waves are rough or rising",
        means: "Strong feelings or recent pressures asking for rest and expression.",
      },
    ],
    positive: "Emotional renewal and honest self-understanding.",
    caution: "Give yourself space to process feelings before reacting.",
  },
  {
    slug: "kbili",
    title: "Teeth",
    summary: "Connected with confidence, voice, transition, and fear of losing control.",
    meaning:
      "Dreams about loose or falling teeth are common during stressful transitions or moments when your confidence or communication feels tested.",
    variants: [
      {
        when: "a tooth falls out painlessly",
        means: "Letting go of an old role and adjusting to a new life stage.",
      },
      {
        when: "you notice strong, healthy teeth",
        means: "Feeling capable, assertive, and clear in how you speak up.",
      },
    ],
    positive: "Reclaiming your voice and personal agency.",
    caution: "Check where you may be carrying unnecessary performance pressure.",
  },
  {
    slug: "dzagli",
    title: "Dog",
    summary: "Loyalty, companionship, boundaries, and trusted instincts.",
    meaning:
      "A dog in a dream often reflects friendship, loyalty, and how protected or supported you feel in daily life.",
    variants: [
      {
        when: "a friendly dog approaches you",
        means: "Supportive relationships and trustworthy connection.",
      },
      {
        when: "a dog barks or guards a gate",
        means: "An invitation to notice and respect important personal boundaries.",
      },
    ],
    positive: "Steady loyalty and warm connection.",
    caution: "Pay attention to whether your boundaries are clear.",
  },
  {
    slug: "bavshvi",
    title: "Child",
    summary: "New beginnings, vulnerability, curiosity, and emerging ideas.",
    meaning:
      "A child in a dream frequently symbolizes a fresh project, creative seed, or vulnerable part of yourself that benefits from patient care.",
    variants: [
      {
        when: "a child is laughing or playing",
        means: "Creative playfulness, fresh energy, and optimism.",
      },
      {
        when: "you are caring for a child",
        means: "Nurturing a new responsibility or tending to your own wellbeing.",
      },
    ],
    positive: "Fresh potential and sincere enthusiasm.",
    caution: "Give new plans realistic time and care to grow.",
  },
  {
    slug: "fuli",
    title: "Money",
    summary: "Self-worth, value exchange, energy, and practical opportunity.",
    meaning:
      "Dreams about money often speak to how you value your time, skills, and energy as much as literal finances.",
    variants: [
      {
        when: "you find money",
        means: "Recognizing an overlooked strength or resource.",
      },
      {
        when: "you are counting or organizing money",
        means: "Reviewing priorities and commitments in waking life.",
      },
    ],
    positive: "Clearer appreciation of your own worth and resources.",
    caution: "Avoid overextending your energy on low-value commitments.",
  },
  {
    slug: "mze",
    title: "Sun",
    summary: "Clarity, vitality, warmth, and conscious awareness.",
    meaning:
      "Seeing the Sun in a dream highlights illumination, renewed energy, and seeing a situation more clearly.",
    variants: [
      {
        when: "you watch a sunrise",
        means: "A fresh chapter, renewed motivation, and clearer perspective.",
      },
    ],
    positive: "Vitality, confidence, and constructive focus.",
    caution: "Balance active ambition with rest.",
  },
  {
    slug: "mtvare",
    title: "Moon",
    summary: "Intuition, quiet reflection, emotional cycles, and imagination.",
    meaning:
      "The Moon in a dream invites you to notice subtle feelings, creative intuition, and what is unfolding quietly.",
    variants: [
      {
        when: "you see a bright Full Moon",
        means: "Emotional culmination and heightened awareness.",
      },
    ],
    positive: "Deeper intuition and creative insight.",
    caution: "Verify facts in waking life rather than relying on mood alone.",
  },
];

export const DREAM_EN_BY_SLUG: Record<string, DreamSymbolEn> =
  Object.fromEntries(DREAM_SYMBOLS_EN.map((item) => [item.slug, item]));
