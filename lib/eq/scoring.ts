/**
 * EQ scoring — turns raw Likert answers into an overall score + a 5-domain
 * profile with qualitative bands and Georgian interpretation.
 *
 * Per item: raw 1..5, reverse-keyed items score `6 - raw`. Each domain (8
 * items) sums to 8..40, normalised to 0..100. Overall = the mean of the five
 * domain scores (equal weight, so no single domain dominates).
 *
 * Bands are calibrated for the leniency of self-report (neutral answers ≈ 50;
 * mild agreement ≈ 75), following the Schutte SSEIT convention where the
 * scale midpoint already reads as "low". Recomputed authoritatively on the
 * server at submit time.
 */

import {
  EQ_DOMAINS,
  EQ_QUESTIONS,
  type EqDomainKey,
} from "./questions";

export type EqBand = "developing" | "moderate" | "strong" | "exceptional";

export type EqDomainScore = {
  key: EqDomainKey;
  nameKa: string;
  nameEn: string;
  taglineKa: string;
  taglineEn: string;
  glyph: string;
  hue: string;
  /** 0–100. */
  score: number;
  band: EqBand;
};

export type EqResult = {
  /** 0–100, mean of the five domain scores. */
  overall: number;
  band: EqBand;
  domains: EqDomainScore[];
  /** Highest / lowest domain — the "strength" and "growth area". */
  topKey: EqDomainKey;
  lowKey: EqDomainKey;
};

const clamp15 = (n: number): number =>
  Number.isFinite(n) ? Math.min(5, Math.max(1, Math.round(n))) : 3;

/** Band cut-offs on the 0–100 scale (applies to overall and per-domain). */
export function eqBandKey(score: number): EqBand {
  if (score >= 78) return "exceptional";
  if (score >= 62) return "strong";
  if (score >= 45) return "moderate";
  return "developing";
}

export const EQ_BAND_META: Record<
  EqBand,
  { labelKa: string; labelEn: string; hue: string; summaryKa: string; summaryEn: string }
> = {
  developing: {
    labelKa: "განვითარებადი",
    labelEn: "Developing",
    hue: "oklch(0.72 0.20 15)",
    summaryKa:
      "შენი ემოციური ინტელექტი განვითარების ეტაპზეა — ეს კუნთივით ვარჯიშდება და იზრდება. მცირე ყოველდღიური დაკვირვება დიდ ცვლილებას მოიტანს.",
    summaryEn: "Your emotional skills have meaningful room to grow. Like a muscle, they respond to deliberate, repeated practice.",
  },
  moderate: {
    labelKa: "საშუალო",
    labelEn: "Moderate",
    hue: "oklch(0.82 0.16 85)",
    summaryKa:
      "მყარი საფუძველი გაქვს — ზოგ სფეროში ბუნებრივად ძლიერი ხარ, ზოგში კი წინსვლის კარგი სივრცე რჩება.",
    summaryEn: "You have a solid foundation, with natural strengths in some areas and clear opportunities to develop others.",
  },
  strong: {
    labelKa: "მაღალი",
    labelEn: "Strong",
    hue: "oklch(0.80 0.15 200)",
    summaryKa:
      "მაღალი ემოციური ინტელექტი — კარგად აღიქვამ და მართავ ემოციებს, საკუთარსაც და სხვისასაც. ეს რეალური უპირატესობაა ურთიერთობებში.",
    summaryEn: "You report strong emotional skills and generally navigate both your own feelings and other people's emotions effectively.",
  },
  exceptional: {
    labelKa: "გამორჩეული",
    labelEn: "Exceptional",
    hue: "oklch(0.78 0.18 305)",
    summaryKa:
      "გამორჩეულად მაღალი ემოციური ინტელექტი — იშვიათი და ძვირფასი უნარი, რომელიც ლიდერობასა და ღრმა კავშირებში ბრწყინავს.",
    summaryEn: "You report exceptionally developed emotional skills that can support leadership, resilience and deep relationships.",
  },
};

/** One short line per (domain × band) — the deep-view interpretation. */
export const EQ_DOMAIN_INTERP: Record<EqDomainKey, Record<EqBand, string>> = {
  "self-awareness": {
    developing:
      "ჯერ გიჭირს საკუთარი ემოციების რეალურ დროში ამოცნობა — ჩაისუნთქე და ჰკითხე თავს „რას ვგრძნობ ახლა?“",
    moderate:
      "ხშირად ხვდები, რას გრძნობ, თუმცა ზოგჯერ ემოცია შეუმჩნევლად გერევა.",
    strong: "კარგად იცნობ საკუთარ ემოციებსა და მათ გამომწვევ მიზეზებს.",
    exceptional:
      "ღრმად ხედავ საკუთარ შინაგან სამყაროს — ეს ყველა სხვა უნარის საძირკველია.",
  },
  "self-regulation": {
    developing:
      "ემოციები ხშირად გმართავს — პაუზისა და ღრმა სუნთქვის ტექნიკები სიმშვიდეს დაგიბრუნებს.",
    moderate: "ჩვეულებრივ იკავებ თავს, თუმცა ძლიერი სტრესი ზოგჯერ სჯობნის.",
    strong: "მშვიდად ინარჩუნებ წონასწორობას წნეხის ქვეშაც.",
    exceptional:
      "იშვიათი სიმშვიდით მართავ იმპულსებსა და რთულ ემოციებს — ქარიშხალშიც მყარად დგახარ.",
  },
  motivation: {
    developing:
      "მოტივაციის შენარჩუნება წარუმატებლობის შემდეგ გიჭირს — პატარა, მიღწევადი მიზნები დაგეხმარება.",
    moderate: "მიზნებისკენ მიდიხარ, თუმცა ენერგია ზოგჯერ იკლებს.",
    strong: "ოპტიმიზმითა და გამძლეობით მიიწევ წინ დაბრკოლებების მიუხედავად.",
    exceptional:
      "შინაგანი ცეცხლი გამოგარჩევს — მარცხიც კი ბიძგად გექცევა.",
  },
  empathy: {
    developing:
      "სხვისი ემოციების წაკითხვა ჯერ გიჭირს — ყურადღება ტონსა და სხეულის ენაზე დაგეხმარება.",
    moderate: "ხშირად გრძნობ სხვის განწყობას, თუმცა ყოველთვის არა.",
    strong: "მშვენივრად აღიქვამ და გაიგებ სხვის ემოციებს.",
    exceptional:
      "ღრმად გრძნობ სხვას — ადამიანები გცნობენ ისეთ ადამიანად, ვისაც ესმის.",
  },
  "social-skills": {
    developing:
      "ურთიერთობებში ზოგჯერ უხერხულობას გრძნობ — მცირე ნაბიჯები კავშირს გააძლიერებს.",
    moderate:
      "კარგად ურთიერთობ, თუმცა კონფლიქტი ან ახალი გარემო ზოგჯერ გამოწვევაა.",
    strong: "ადვილად ამყარებ კავშირს და აგვარებ უთანხმოებას.",
    exceptional:
      "ბუნებრივი ოსტატობით მართავ ურთიერთობებს და აკავშირებ ადამიანებს.",
  },
};

export const EQ_DOMAIN_INTERP_EN: Record<EqDomainKey, Record<EqBand, string>> = {
  "self-awareness": {
    developing: "Recognizing emotions in real time may be difficult. Pause and ask yourself, “What am I feeling, and what changed?”",
    moderate: "You often understand what you feel, although some emotions can still pass unnoticed until they become intense.",
    strong: "You usually recognize your emotions and understand what triggered them.",
    exceptional: "You report unusually clear insight into your inner experience, which supports every other emotional skill.",
  },
  "self-regulation": {
    developing: "Strong emotions may frequently direct your behavior. A deliberate pause can help turn reaction into choice.",
    moderate: "You generally regulate yourself well, although intense stress can sometimes overwhelm your usual strategies.",
    strong: "You tend to maintain composure and make considered choices even under pressure.",
    exceptional: "You report exceptional control of impulses and difficult feelings without suppressing what those feelings communicate.",
  },
  motivation: {
    developing: "Maintaining momentum after a setback may be difficult. Smaller, reachable goals can help rebuild confidence.",
    moderate: "You pursue your goals, although motivation can fluctuate when progress is slow or repetitive.",
    strong: "You generally move forward with optimism and persistence despite obstacles.",
    exceptional: "You report a powerful inner drive and an ability to turn setbacks into renewed energy.",
  },
  empathy: {
    developing: "Reading other people's emotions may require more conscious attention to tone, expression and context.",
    moderate: "You often sense how others feel, though subtle or unfamiliar signals may occasionally be missed.",
    strong: "You tend to recognize and understand other people's emotions accurately.",
    exceptional: "You report deep sensitivity to others' experiences, and people may naturally feel understood around you.",
  },
  "social-skills": {
    developing: "New or tense social situations may feel uncomfortable. Small, repeated acts of connection can build confidence.",
    moderate: "You generally relate well to people, while conflict or unfamiliar groups can still be challenging.",
    strong: "You tend to build rapport easily and navigate disagreement constructively.",
    exceptional: "You report a natural ability to connect people, communicate needs and guide relationships through tension.",
  },
};

/** Sum of a domain's items (reverse-keyed applied), normalised to 0–100. */
function domainScore(domain: EqDomainKey, answers: Record<number, number>): number {
  const items = EQ_QUESTIONS.filter((q) => q.domain === domain);
  let sum = 0;
  for (const q of items) {
    const raw = clamp15(answers[q.id]);
    sum += q.reverse ? 6 - raw : raw;
  }
  const min = items.length; // all 1s
  const max = items.length * 5; // all 5s
  return Math.round(((sum - min) / (max - min)) * 100);
}

export function calculateEq(answers: Record<number, number>): EqResult {
  const domains: EqDomainScore[] = EQ_DOMAINS.map((d) => {
    const score = domainScore(d.key, answers);
    return {
      key: d.key,
      nameKa: d.nameKa,
      nameEn: d.nameEn,
      taglineKa: d.taglineKa,
      taglineEn: d.taglineEn,
      glyph: d.glyph,
      hue: d.hue,
      score,
      band: eqBandKey(score),
    };
  });

  const overall = Math.round(
    domains.reduce((a, d) => a + d.score, 0) / domains.length
  );

  // Highest = strength, lowest = growth area (first wins ties by domain order).
  let top = domains[0];
  let low = domains[0];
  for (const d of domains) {
    if (d.score > top.score) top = d;
    if (d.score < low.score) low = d;
  }

  return {
    overall,
    band: eqBandKey(overall),
    domains,
    topKey: top.key,
    lowKey: low.key,
  };
}

/** One concrete, actionable practice per domain — shown in the deep view. */
export const EQ_DOMAIN_TIP: Record<EqDomainKey, string> = {
  "self-awareness":
    "დღეში ერთხელ ჩაიწერე ერთი წინადადება იმაზე, რაც იგრძენი და რამ გამოიწვია — კვირაში შენს ემოციურ ნიმუშებს დაინახავ.",
  "self-regulation":
    "ძლიერი ემოციის მომენტში დაითვალე ექვსამდე და ღრმად ამოისუნთქე პასუხამდე — ეს პაუზა რეაქციას არჩევანად აქცევს.",
  motivation:
    "დიდი მიზანი დაშალე პატარა, ერთდღიან ნაბიჯებად — თითო მიღწევა ბიძგს გაძლევს შემდეგისთვის.",
  empathy:
    "საუბრისას ერთი წუთით მხოლოდ მოსმენაზე გადართე ყურადღება — არა პასუხის მოფიქრებაზე — და დააკვირდი ტონსა და სახეს.",
  "social-skills":
    "უთანხმოებისას ჯერ მეორე მხარის პოზიცია გაიმეორე შენი სიტყვებით — ეს დაძაბულობას ხსნის და ნდობას აჩენს.",
};

export const EQ_DOMAIN_TIP_EN: Record<EqDomainKey, string> = {
  "self-awareness": "Once a day, write one sentence naming an emotion and what prompted it. After a week, look for recurring patterns.",
  "self-regulation": "When emotion spikes, count slowly to six and exhale before responding. The pause gives your values time to catch up.",
  motivation: "Break one large goal into a step you can finish today. Visible progress creates energy for the next step.",
  empathy: "During one conversation, listen for a full minute without planning your reply. Notice tone, pace and expression.",
  "social-skills": "During disagreement, restate the other person's position in your own words before explaining yours.",
};

/** Short headline built from the standout domain. */
export function eqHeadlineKa(result: EqResult): string {
  const top = result.domains.find((d) => d.key === result.topKey);
  return top ? `შენი ძალა — ${top.nameKa}` : "შენი ემოციური პროფილი";
}
