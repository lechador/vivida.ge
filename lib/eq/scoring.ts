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
  taglineKa: string;
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
  { labelKa: string; hue: string; summaryKa: string }
> = {
  developing: {
    labelKa: "განვითარებადი",
    hue: "oklch(0.72 0.20 15)",
    summaryKa:
      "შენი ემოციური ინტელექტი განვითარების ეტაპზეა — ეს კუნთივით ვარჯიშდება და იზრდება. მცირე ყოველდღიური დაკვირვება დიდ ცვლილებას მოიტანს.",
  },
  moderate: {
    labelKa: "საშუალო",
    hue: "oklch(0.82 0.16 85)",
    summaryKa:
      "მყარი საფუძველი გაქვს — ზოგ სფეროში ბუნებრივად ძლიერი ხარ, ზოგში კი წინსვლის კარგი სივრცე რჩება.",
  },
  strong: {
    labelKa: "მაღალი",
    hue: "oklch(0.80 0.15 200)",
    summaryKa:
      "მაღალი ემოციური ინტელექტი — კარგად აღიქვამ და მართავ ემოციებს, საკუთარსაც და სხვისასაც. ეს რეალური უპირატესობაა ურთიერთობებში.",
  },
  exceptional: {
    labelKa: "გამორჩეული",
    hue: "oklch(0.78 0.18 305)",
    summaryKa:
      "გამორჩეულად მაღალი ემოციური ინტელექტი — იშვიათი და ძვირფასი უნარი, რომელიც ლიდერობასა და ღრმა კავშირებში ბრწყინავს.",
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
      taglineKa: d.taglineKa,
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

/** Short headline built from the standout domain. */
export function eqHeadlineKa(result: EqResult): string {
  const top = result.domains.find((d) => d.key === result.topKey);
  return top ? `შენი ძალა — ${top.nameKa}` : "შენი ემოციური პროფილი";
}
