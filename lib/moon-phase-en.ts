import type { MoonPhaseReadingResult } from "./openrouter";
import {
  PHASE_LABEL_EN,
  type MoonPhaseSnapshot,
  type PhaseKey,
} from "./moon-phase";
import { signByIndex } from "./zodiac";

const PHASE_GUIDANCE: Record<
  PhaseKey,
  { focus: string; action: string; themes: string[] }
> = {
  new_moon: {
    focus: "a quiet reset, fresh intention, and the first outline of a new cycle",
    action: "Choose one intention that is small enough to begin now and clear enough to revisit over the next four weeks.",
    themes: ["New beginning", "Intention", "Reset"],
  },
  waxing_crescent: {
    focus: "early momentum, experimentation, and protecting a new direction while it is still taking shape",
    action: "Support the idea with one repeatable action instead of demanding immediate proof that it will work.",
    themes: ["Momentum", "Practice", "Commitment"],
  },
  first_quarter: {
    focus: "decision, constructive pressure, and the need to turn intention into visible movement",
    action: "Address the obstacle directly and decide what deserves effort before urgency decides for you.",
    themes: ["Decision", "Action", "Adjustment"],
  },
  waxing_gibbous: {
    focus: "refinement, preparation, and improving what is already in motion",
    action: "Review the details, ask for useful feedback, and strengthen the part of the plan most likely to carry the result.",
    themes: ["Refinement", "Preparation", "Focus"],
  },
  full_moon: {
    focus: "visibility, culmination, and emotions or results becoming easier to recognize",
    action: "Notice what has reached a turning point, name the feeling without dramatizing it, and respond to the facts now visible.",
    themes: ["Clarity", "Culmination", "Release"],
  },
  waning_gibbous: {
    focus: "integration, perspective, and sharing what the completed phase has taught you",
    action: "Keep what proved useful, communicate the lesson clearly, and let unnecessary effort begin to fall away.",
    themes: ["Integration", "Perspective", "Sharing"],
  },
  last_quarter: {
    focus: "revision, release, and an honest look at habits that no longer support the next cycle",
    action: "End or simplify one commitment that consumes energy without returning enough meaning or progress.",
    themes: ["Release", "Revision", "Boundaries"],
  },
  waning_crescent: {
    focus: "rest, closure, and making space before the next beginning",
    action: "Reduce noise, finish what can be finished gently, and give reflection more room than forced productivity.",
    themes: ["Rest", "Closure", "Reflection"],
  },
};

const SIGN_TONE: Record<
  string,
  { tone: string; question: string; theme: string }
> = {
  aries: { tone: "direct, active, and impatient with delay", question: "What deserves a clean first move?", theme: "Initiative" },
  taurus: { tone: "steady, embodied, and concerned with security", question: "What can be made more stable or sustainable?", theme: "Stability" },
  gemini: { tone: "curious, verbal, and open to a different angle", question: "Which conversation or missing fact could change the picture?", theme: "Communication" },
  cancer: { tone: "protective, receptive, and sensitive to emotional atmosphere", question: "What would create genuine safety rather than temporary reassurance?", theme: "Emotional care" },
  leo: { tone: "expressive, warm, and ready to make the heart visible", question: "Where can confidence become generous creative action?", theme: "Expression" },
  virgo: { tone: "observant, practical, and focused on useful improvement", question: "Which small adjustment would make daily life work better?", theme: "Refinement" },
  libra: { tone: "relational, diplomatic, and alert to balance", question: "What does fairness require from each side?", theme: "Balance" },
  scorpio: { tone: "intense, private, and willing to meet what lies beneath the surface", question: "What truth becomes clearer when control is loosened?", theme: "Depth" },
  sagittarius: { tone: "expansive, candid, and drawn toward meaning or possibility", question: "Which direction restores a sense of purpose?", theme: "Perspective" },
  capricorn: { tone: "disciplined, strategic, and attentive to long-term consequences", question: "What structure would make the goal more realistic?", theme: "Responsibility" },
  aquarius: { tone: "independent, inventive, and interested in a wider social view", question: "What changes when the familiar rule is questioned?", theme: "Innovation" },
  pisces: { tone: "intuitive, imaginative, and porous to subtle feeling", question: "Which feeling needs compassion, and which boundary needs clarity?", theme: "Intuition" },
};

export function englishMoonPhaseReading(
  snapshot: MoonPhaseSnapshot,
): MoonPhaseReadingResult {
  const phase = PHASE_GUIDANCE[snapshot.phaseKey];
  const sign = signByIndex(snapshot.signIndex);
  const signTone = SIGN_TONE[sign.key];
  const phaseLabel = PHASE_LABEL_EN[snapshot.phaseKey];

  return {
    headline: `${phaseLabel} in ${sign.labelEn}`,
    summary: `This ${phaseLabel.toLowerCase()} emphasizes ${phase.focus}. With the Moon in ${sign.labelEn}, the emotional tone is more ${signTone.tone}.`,
    body: `${phase.action}\n\n${signTone.question} Treat the lunar cycle as a reflection and planning framework, not a guarantee that a specific event will occur.`,
    themes: [phase.themes[0], signTone.theme, phase.themes[1]],
  };
}
