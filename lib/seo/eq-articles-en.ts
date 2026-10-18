export type EqArticleEn = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingMinutes: number;
  domains: string[];
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
  steps: string[];
  faq: Array<{ q: string; a: string }>;
};

export const EQ_ARTICLES_EN: EqArticleEn[] = [
  {
    slug: "emociis-amocnoba",
    title: "How to Name What You Feel: Emotional Granularity in Practice",
    description:
      "Learn how naming emotions with precision reduces overwhelm, clarifies needs, and strengthens everyday self-awareness.",
    category: "Self-Awareness",
    readingMinutes: 5,
    domains: ["self_awareness", "self_regulation"],
    intro:
      "When every difficult state is labeled simply 'stressed' or 'fine', your mind has very little information about what to do next. Emotional granularity turns vague tension into clear, workable signals.",
    sections: [
      {
        heading: "Why precise labels calm the nervous system",
        paragraphs: [
          "Affect-labeling research shows that putting accurate words to an emotional state helps shift activity from reactive alarm toward reflective choice.",
          "Naming disappointment, apprehension, or boundary fatigue does not dramatize the feeling—it clarifies what matters to you in that moment.",
        ],
      },
      {
        heading: "Reading somatic cues early",
        paragraphs: [
          "Before a thought is fully formed, emotion often appears as shallow breathing, jaw tension, or restlessness. Catching the signal early gives you more room to respond.",
        ],
      },
    ],
    steps: [
      "Pause for 15 seconds and notice physical tension without judging it.",
      "Replace a broad word like 'bad' or 'upset' with a more specific emotion word.",
      "Ask what unmet need, expectation, or value sits underneath the feeling.",
    ],
    faq: [
      {
        q: "What is emotional granularity?",
        a: "It is the ability to distinguish closely related emotional states—such as frustration, disappointment, and exhaustion—rather than lumping them together.",
      },
      {
        q: "How can I practice this daily?",
        a: "Write a one-sentence check-in twice a day noting the specific emotion and the situation that triggered it.",
      },
    ],
  },
  {
    slug: "stresis-marTva-90-wamshi",
    title: "The 90-Second Pause: Regulating Strong Emotional Waves",
    description:
      "Practical emotion-regulation tools to create space between a trigger and your response during high-pressure moments.",
    category: "Emotion Regulation",
    readingMinutes: 6,
    domains: ["self_regulation"],
    intro:
      "The initial surge of an acute emotional trigger rises and peaks quickly, unless we replay the story in a loop. A deliberate pause restores choice.",
    sections: [
      {
        heading: "Creating space between stimulus and response",
        paragraphs: [
          "Regulation is not suppression. It is the skill of letting the peak physiological wave pass before you speak, reply, or decide.",
        ],
      },
    ],
    steps: [
      "Delay sending a heated message or making a sharp remark for at least 90 seconds.",
      "Take three slow breaths with a longer exhale than inhale.",
      "Return to the issue by separating observable facts from assumptions.",
    ],
    faq: [
      {
        q: "Does emotion regulation mean ignoring anger?",
        a: "No. Anger often signals a crossed boundary; regulation helps you express that boundary clearly rather than reactively.",
      },
    ],
  },
  {
    slug: "empatia-gadawvis-gareshe",
    title: "Empathy Without Burnout: Compassion With Healthy Boundaries",
    description:
      "How to stay present and supportive for others without absorbing their stress as your own.",
    category: "Empathy",
    readingMinutes: 6,
    domains: ["empathy", "social_skills"],
    intro:
      "Deep empathy is a relational strength, but without clear boundaries it can turn into emotional exhaustion.",
    sections: [
      {
        heading: "Understanding versus absorbing",
        paragraphs: [
          "Perspective-taking allows you to care about someone's experience while remembering where your responsibility begins and ends.",
        ],
      },
    ],
    steps: [
      "Listen with curiosity and reflect back what you hear before offering solutions.",
      "Ask whether the other person wants comfort, perspective, or practical help.",
      "Take a brief reset after emotionally heavy conversations.",
    ],
    faq: [
      {
        q: "What is empathy fatigue?",
        a: "It happens when continuous emotional caregiving without recovery leaves you feeling numb, irritable, or depleted.",
      },
    ],
  },
  {
    slug: "rtuli-saubari-mierTebulad",
    title: "Navigating Difficult Conversations Without Defensiveness",
    description:
      "Use clear observations, honest feelings, and actionable requests to handle conflict constructively.",
    category: "Relationships",
    readingMinutes: 7,
    domains: ["social_skills", "empathy"],
    intro:
      "Most difficult conversations derail in the first thirty seconds because a grievance is phrased as a character judgment.",
    sections: [
      {
        heading: "From blame to clear observation",
        paragraphs: [
          "Replacing 'you always' or 'you never' with a specific moment and a clear request lowers defensiveness and invites collaboration.",
        ],
      },
    ],
    steps: [
      "Start with a neutral observation about a specific situation.",
      "Share the impact on you without diagnosing the other person's motives.",
      "End with one concrete, doable request.",
    ],
    faq: [
      {
        q: "What if the other person becomes defensive anyway?",
        a: "Slow the pace, acknowledge their perspective, and return to the shared goal of the conversation.",
      },
    ],
  },
  {
    slug: "shinagani-motivacia",
    title: "Intrinsic Motivation: Sustaining Momentum When Progress Feels Slow",
    description:
      "How to connect daily habits to personal values and recover quickly from setbacks.",
    category: "Motivation",
    readingMinutes: 5,
    domains: ["motivation", "self_awareness"],
    intro:
      "Sustainable motivation relies less on bursts of willpower and more on values-aligned routines that survive low-energy days.",
    sections: [
      {
        heading: "Process over perfection",
        paragraphs: [
          "Shifting focus from distant outcomes to small, repeatable actions reduces avoidance and builds self-trust.",
        ],
      },
    ],
    steps: [
      "Connect your goal to a core personal value.",
      "Define a 15-minute minimum viable action for busy days.",
      "Review progress weekly rather than judging yourself hour by hour.",
    ],
    faq: [
      {
        q: "Why do I procrastinate on things I care about?",
        a: "Procrastination is often an emotion-regulation response to perfectionism or uncertainty, not laziness.",
      },
    ],
  },
];

export function eqArticleEnBySlug(kaSlug: string): EqArticleEn | undefined {
  return EQ_ARTICLES_EN.find((item) => item.slug === kaSlug);
}
