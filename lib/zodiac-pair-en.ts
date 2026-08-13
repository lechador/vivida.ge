import { signMetaBySlug, type ZodiacSlug } from "@/lib/seo/zodiac-dates";
import { ELEMENT_EN, ZODIAC_SIGN_EN } from "@/lib/zodiac-sign-en";

export type PairRating = "Natural flow" | "Harmonious" | "Growth-oriented" | "Powerful mirror";

export type ZodiacPairEnglish = {
  title: string;
  description: string;
  tagline: string;
  rating: PairRating;
  overall: string;
  love: string;
  friendship: string;
  communication: string;
  strengths: string[];
  challenges: string[];
  verdict: string;
  faq: Array<{ q: string; a: string }>;
};

const SUPPORTIVE_ELEMENT_PAIRS = new Set([
  "air-fire",
  "earth-water",
]);

function elementPair(a: string, b: string): string {
  return [a, b].sort().join("-");
}

export function zodiacPairEnglish(a: ZodiacSlug, b: ZodiacSlug): ZodiacPairEnglish {
  const aMeta = signMetaBySlug(a)!;
  const bMeta = signMetaBySlug(b)!;
  const aName = aMeta.labelEn;
  const bName = bMeta.labelEn;
  const aProfile = ZODIAC_SIGN_EN[a];
  const bProfile = ZODIAC_SIGN_EN[b];
  const aElement = ELEMENT_EN[aMeta.element];
  const bElement = ELEMENT_EN[bMeta.element];
  const sameSign = a === b;
  const sameElement = aMeta.element === bMeta.element;
  const supportive = SUPPORTIVE_ELEMENT_PAIRS.has(
    elementPair(aElement.toLowerCase(), bElement.toLowerCase()),
  );
  const rating: PairRating = sameSign
    ? "Powerful mirror"
    : sameElement
      ? "Natural flow"
      : supportive
        ? "Harmonious"
        : "Growth-oriented";
  const title = `${aName} and ${bName} Compatibility: Love, Friendship and Communication`;
  const description = `${aName} and ${bName} compatibility in love, friendship, and communication. Explore strengths, challenges, emotional needs, and long-term potential.`;

  const overall = sameSign
    ? `${aName} with ${bName} creates a strong mirror: both people recognize the same instincts, values, and pressure points. ${aProfile.core} Shared understanding can feel immediate, but the relationship also doubles the sign's blind spots. The pair works best when familiarity becomes empathy rather than an excuse to repeat the same reaction.`
    : `${aName} brings ${aProfile.tagline.toLowerCase()} ${bName} brings ${bProfile.tagline.toLowerCase()} As ${aElement} and ${bElement} signs, they approach experience from ${sameElement ? "a related elemental rhythm" : supportive ? "different but naturally supportive angles" : "contrasting angles that require curiosity"}. Compatibility grows when neither person treats a different pace or priority as proof that the bond is wrong.`;
  const love = sameSign
    ? `${aProfile.love} With two ${aName} partners, affection can feel deeply understood because both value similar forms of reassurance and attraction. The key is to keep making explicit agreements instead of assuming that shared signs mean identical histories, boundaries, or needs.`
    : `${aProfile.love} ${bProfile.love} Together, ${aName} and ${bName} need to translate these two love languages into specific behavior. Attraction becomes more sustainable when both partners can name what creates trust, how they repair conflict, and how much closeness or independence each person needs.`;
  const friendship = sameSign
    ? `A ${aName}–${bName} friendship often forms around shared humor, values, or a familiar pace. It can be validating and energizing, provided comparison or competition does not replace genuine support.`
    : `${aName} can offer ${bName} ${aProfile.strengths[0].toLowerCase()}, while ${bName} contributes ${bProfile.strengths[0].toLowerCase()}. Friendship is strongest when their differences expand the range of the partnership instead of forcing both people into the same role.`;
  const communication = sameSign
    ? `Two ${aName} people may understand the intention behind each other's words quickly, yet they can also share the same conversational avoidance or trigger. Slowing down, checking assumptions, and allowing different conclusions keeps the dialogue useful.`
    : `${aName} tends to communicate through the instincts described by its ${aElement} nature, while ${bName} filters experience through ${bElement}. They communicate well when ${aName} avoids ${aProfile.challenges[0].toLowerCase()} and ${bName} watches for ${bProfile.challenges[0].toLowerCase()}. Clear requests are more reliable than expecting either person to guess.`;
  const strengths = sameSign
    ? [
        `Immediate recognition of ${aName}'s core needs`,
        `Shared appreciation for ${aProfile.strengths[0].toLowerCase()}`,
        "A familiar pace for decisions and connection",
        "Strong potential for mutual validation",
      ]
    : [
        `${aName}'s ${aProfile.strengths[0].toLowerCase()} complements ${bName}'s ${bProfile.strengths[0].toLowerCase()}`,
        `${aElement} and ${bElement} bring two useful perspectives`,
        "Each person can develop qualities the other uses naturally",
        "The bond can balance familiarity with discovery",
      ];
  const challenges = sameSign
    ? [
        `Both may fall into ${aProfile.challenges[0].toLowerCase()}`,
        "Similar defenses can intensify at the same time",
        "Assuming shared signs mean identical needs",
        "Competition or comparison can replace cooperation",
      ]
    : [
        `${aName} may struggle with ${aProfile.challenges[0].toLowerCase()}`,
        `${bName} may struggle with ${bProfile.challenges[0].toLowerCase()}`,
        "Different conflict speeds can create misunderstanding",
        "Unspoken expectations may harden into a story about incompatibility",
      ];
  const verdict = `${aName} and ${bName} have a ${rating.toLowerCase()} connection. Sun signs describe an important baseline, not a final relationship score. The Moon, Venus, Mars, rising signs, house overlays, and aspects between two complete charts can reinforce this pattern or change it substantially.`;
  const faq = [
    { q: `Are ${aName} and ${bName} compatible?`, a: `${aName} and ${bName} can build a rewarding relationship when they work consciously with their ${aElement} and ${bElement} styles. This pairing is best described as ${rating.toLowerCase()}.` },
    { q: `How are ${aName} and ${bName} in love?`, a: love },
    { q: `What is the biggest challenge for ${aName} and ${bName}?`, a: challenges[0] + ". " + challenges[2] + "." },
    { q: "Can Sun signs alone predict a relationship?", a: "No. A useful compatibility reading compares both complete natal charts, especially the Moon, Venus, Mars, Ascendant, houses, and inter-chart aspects." },
  ];

  return { title, description, tagline: `${aName}'s ${aElement} style meets ${bName}'s ${bElement} style in a ${rating.toLowerCase()} connection.`, rating, overall, love, friendship, communication, strengths, challenges, verdict, faq };
}

