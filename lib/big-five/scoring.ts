/**
 * Big Five scoring. Each trait is scored 0–100 from its 8 items (reverse-keyed
 * items score `6 - raw`). The traits are BIPOLAR — there is no overall score;
 * the result is the five-trait profile, and both high and low ends carry a
 * neutral, non-judgmental meaning. Recomputed authoritatively on the server.
 */

import {
  BIG5_QUESTIONS,
  BIG5_TRAITS,
  type BigFiveTraitKey,
} from "./questions";

export type BigFiveLevel = "low" | "mid" | "high";

export type BigFiveTraitScore = {
  key: BigFiveTraitKey;
  letter: string;
  nameKa: string;
  taglineKa: string;
  glyph: string;
  hue: string;
  /** 0–100. */
  score: number;
  level: BigFiveLevel;
};

export type BigFiveResult = {
  traits: BigFiveTraitScore[];
  /** Most / least pronounced trait — the profile's two poles (descriptive). */
  topKey: BigFiveTraitKey;
  lowKey: BigFiveTraitKey;
};

const clamp15 = (n: number): number =>
  Number.isFinite(n) ? Math.min(5, Math.max(1, Math.round(n))) : 3;

export function big5Level(score: number): BigFiveLevel {
  if (score >= 60) return "high";
  if (score <= 40) return "low";
  return "mid";
}

export const BIG5_LEVEL_LABEL: Record<BigFiveLevel, string> = {
  low: "დაბალი",
  mid: "საშუალო",
  high: "მაღალი",
};

/**
 * Neutral interpretation for each (trait × level). Both poles are valid
 * personality descriptions — low is never framed as a deficit.
 */
export const BIG5_TRAIT_INTERP: Record<
  BigFiveTraitKey,
  Record<BigFiveLevel, string>
> = {
  openness: {
    high: "ცნობისმოყვარე, შემოქმედებითი და ღია ხარ — გიზიდავს ახალი იდეები, ხელოვნება და უჩვეულო გამოცდილება.",
    mid: "აბალანსებ ცნობისმოყვარეობასა და პრაქტიკულობას — ღია ხარ ახლისთვის, მაგრამ ნაცნობსა და ტრადიციულსაც აფასებ.",
    low: "პრაქტიკული და მიწიერი ხარ — უპირატესობას ანიჭებ გამოცდილ, ნაცნობ გზებსა და კონკრეტულ საქმეს.",
  },
  conscientiousness: {
    high: "ორგანიზებული, დისციპლინირებული და საიმედო ხარ — გეგმავ, ასრულებ და საქმე ბოლომდე მიგყავს.",
    mid: "აბალანსებ წესრიგსა და მოქნილობას — პასუხისმგებლიანი ხარ, მაგრამ სპონტანურობისთვისაც ტოვებ ადგილს.",
    low: "მოქნილი და სპონტანური ხარ — თავისუფლებას მკაცრ გეგმებსა და რუტინას ამჯობინებ.",
  },
  extraversion: {
    high: "ენერგიული და კომუნიკაბელური ხარ — სხვებთან ურთიერთობა გამხნევებს და ადვილად იღებ ინიციატივას.",
    mid: "აბალანსებ სოციალურობასა და განმარტოებას — გიხარია ადამიანებთან ყოფნა, მაგრამ მარტოც გჭირდება დრო ენერგიის აღსადგენად.",
    low: "ინტროვერტი და დაკვირვებული ხარ — ენერგიით მშვიდ გარემოსა და მცირე სოციალურ წრეში იმუხტები.",
  },
  agreeableness: {
    high: "თბილი, თანამგრძნობი და თანამშრომლობაზე ორიენტირებული ხარ — ენდობი ადამიანებს და ზრუნავ სხვების კეთილდღეობაზე.",
    mid: "აბალანსებ სითბოსა და პირდაპირობას — კეთილგანწყობილი ხარ, მაგრამ საჭიროებისას საკუთარი ინტერესების დაცვაც შეგიძლია.",
    low: "პირდაპირი, კრიტიკული და დამოუკიდებელი ხარ — ამჯობინებ სიმართლეს დიპლომატიას და მყარად დგახარ შენს აზრზე.",
  },
  neuroticism: {
    high: "ემოციურად მგრძნობიარე ხარ — ღრმად განიცდი და სტრესზე ძლიერად რეაგირებ, რაც მდიდარ შინაგან სამყაროზეც მიანიშნებს.",
    mid: "ემოციურად საკმაოდ გაწონასწორებული ხარ — გრძნობ სტრესს, მაგრამ, როგორც წესი, სწრაფად უბრუნდები წონასწორობას.",
    low: "ემოციურად სტაბილური და მშვიდი ხარ — სტრესულ ვითარებაშიც კი იშვიათად კარგავ წონასწორობას.",
  },
};

/** Sum of a trait's items (reverse-keyed applied), normalised to 0–100. */
function traitScore(trait: BigFiveTraitKey, answers: Record<number, number>): number {
  const items = BIG5_QUESTIONS.filter((q) => q.trait === trait);
  let sum = 0;
  for (const q of items) {
    const raw = clamp15(answers[q.id]);
    sum += q.reverse ? 6 - raw : raw;
  }
  const min = items.length;
  const max = items.length * 5;
  return Math.round(((sum - min) / (max - min)) * 100);
}

export function calculateBigFive(answers: Record<number, number>): BigFiveResult {
  const traits: BigFiveTraitScore[] = BIG5_TRAITS.map((t) => {
    const score = traitScore(t.key, answers);
    return {
      key: t.key,
      letter: t.letter,
      nameKa: t.nameKa,
      taglineKa: t.taglineKa,
      glyph: t.glyph,
      hue: t.hue,
      score,
      level: big5Level(score),
    };
  });

  let top = traits[0];
  let low = traits[0];
  for (const t of traits) {
    if (t.score > top.score) top = t;
    if (t.score < low.score) low = t;
  }

  return { traits, topKey: top.key, lowKey: low.key };
}

/** Short headline built from the most-pronounced trait. */
export function big5HeadlineKa(result: BigFiveResult): string {
  const top = result.traits.find((t) => t.key === result.topKey);
  return top ? `შენში ყველაზე გამოკვეთილია — ${top.nameKa}` : "შენი პიროვნების პროფილი";
}
