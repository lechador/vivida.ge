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
  nameEn: string;
  taglineKa: string;
  taglineEn: string;
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
export const BIG5_LEVEL_LABEL_EN: Record<BigFiveLevel, string> = { low: "Low", mid: "Moderate", high: "High" };

/**
 * Neutral interpretation for each (trait × level). Both poles are valid
 * personality descriptions — low is never framed as a deficit.
 */
export const BIG5_TRAIT_INTERP: Record<
  BigFiveTraitKey,
  Record<BigFiveLevel, string>
> = {
  openness: {
    high: "ცნობისმოყვარე, შემოქმედებითი და სიახლეების მიმართ გახსნილი ხარ — გიზიდავს ახალი იდეები, ხელოვნება და უჩვეულო გამოცდილებები.",
    mid: "ცნობისმოყვარეობასა და პრაქტიკულობას ერთმანეთს უთავსებ — სიახლეებს ინტერესით ხვდები, თუმცა ნაცნობსა და ტრადიციულსაც აფასებ.",
    low: "პრაქტიკული და მიწიერი ხარ — უპირატესობას ანიჭებ გამოცდილ, ნაცნობ გზებსა და კონკრეტულ საქმეს.",
  },
  conscientiousness: {
    high: "ორგანიზებული, დისციპლინირებული და საიმედო ხარ — გეგმავ, ასრულებ და საქმე ბოლომდე მიგყავს.",
    mid: "წესრიგსა და მოქნილობას ერთმანეთს უთავსებ — პასუხისმგებლიანი ხარ, თუმცა სპონტანურობისთვისაც ტოვებ ადგილს.",
    low: "მოქნილი და სპონტანური ხარ — თავისუფლებას მკაცრ გეგმებსა და რუტინას ამჯობინებ.",
  },
  extraversion: {
    high: "ენერგიული და კომუნიკაბელური ხარ — სხვებთან ურთიერთობა ენერგიას გმატებს და ინიციატივას ადვილად იჩენ.",
    mid: "სოციალურობასა და განმარტოებას ერთმანეთს უთავსებ — ადამიანებთან ყოფნაც გსიამოვნებს და ენერგიის აღსადგენად მარტო დარჩენაც გჭირდება.",
    low: "ინტროვერტული და დაკვირვებული ბუნება გაქვს — ენერგიას მშვიდ გარემოში, მარტო ყოფნისას ან ადამიანთა მცირე წრეში აღიდგენ.",
  },
  agreeableness: {
    high: "თბილი, თანამგრძნობი და თანამშრომლობაზე ორიენტირებული ხარ — ენდობი ადამიანებს და ზრუნავ სხვების კეთილდღეობაზე.",
    mid: "სითბოსა და პირდაპირობას ერთმანეთს უთავსებ — კეთილგანწყობილი ხარ, თუმცა საჭიროებისას საკუთარი ინტერესების დაცვაც შეგიძლია.",
    low: "პირდაპირი, კრიტიკული და დამოუკიდებელი ხარ — დიპლომატიაზე მეტად გულახდილობას აფასებ და საკუთარ აზრს მტკიცედ იცავ.",
  },
  neuroticism: {
    high: "ემოციურად მგრძნობიარე ხარ — მოვლენებს ღრმად განიცდი და სტრესზე მძაფრად რეაგირებ. ამიტომ დაძაბულობის შემდეგ წონასწორობის აღსადგენად შეიძლება მეტი დრო დაგჭირდეს.",
    mid: "ემოციურად საკმაოდ გაწონასწორებული ხარ — გრძნობ სტრესს, მაგრამ, როგორც წესი, სწრაფად უბრუნდები წონასწორობას.",
    low: "ემოციურად სტაბილური და მშვიდი ხარ — სტრესულ ვითარებაშიც კი იშვიათად კარგავ წონასწორობას.",
  },
};

export const BIG5_TRAIT_INTERP_EN: typeof BIG5_TRAIT_INTERP = {
  openness: {
    high: "You are curious, imaginative and open to novelty, with an appetite for ideas, art and unfamiliar experiences.",
    mid: "You balance curiosity with practicality, welcoming new ideas while still valuing familiar and proven approaches.",
    low: "You tend to be practical and grounded, preferring concrete work and familiar, tested approaches.",
  },
  conscientiousness: {
    high: "You tend to be organized, disciplined and dependable, making plans and following tasks through to completion.",
    mid: "You balance structure with flexibility, acting responsibly while leaving room for spontaneity.",
    low: "You tend to be flexible and spontaneous, preferring freedom and adaptation over strict plans and routines.",
  },
  extraversion: {
    high: "You tend to be energetic and sociable, gaining energy from interaction and taking initiative comfortably.",
    mid: "You balance social connection with solitude, enjoying people while also needing private time to recharge.",
    low: "You tend to be introverted and observant, restoring energy in quiet settings, alone or with a small circle.",
  },
  agreeableness: {
    high: "You tend to be warm, compassionate and cooperative, trusting people and caring about their well-being.",
    mid: "You balance warmth with directness, cooperating readily while still protecting your own interests when needed.",
    low: "You tend to be direct, skeptical and independent, valuing candor and firm positions over easy agreement.",
  },
  neuroticism: {
    high: "You are emotionally sensitive and may experience stress intensely, needing more time to regain balance after pressure.",
    mid: "You are reasonably emotionally balanced, noticing stress but usually returning to equilibrium without prolonged difficulty.",
    low: "You tend to be emotionally stable and calm, rarely losing your balance even in stressful circumstances.",
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
      nameEn: t.nameEn,
      taglineKa: t.taglineKa,
      taglineEn: t.taglineEn,
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
  return top ? `შენი ყველაზე გამოკვეთილი თვისებაა ${top.nameKa}` : "შენი პიროვნების პროფილი";
}

export function big5HeadlineEn(result: BigFiveResult): string {
  const top = result.traits.find((trait) => trait.key === result.topKey);
  return top ? `Your most pronounced trait is ${top.nameEn}` : "Your personality profile";
}
