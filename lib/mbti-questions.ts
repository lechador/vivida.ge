/**
 * Astro-MBTI test data + scoring.
 *
 * 16 Georgian statements, 4 per axis (E/I, S/N, T/F, J/P). Within each axis
 * two statements lean toward the first pole and two toward the second, so a
 * user who reflexively agrees with everything (acquiescence bias) still lands
 * near the middle instead of being pushed to one extreme.
 *
 * Answers are a 5-point Likert scale (+2 strongly-agree … −2 strongly-
 * disagree). calculateMbti() folds them into the exact 4-letter type plus a
 * per-axis strength breakdown for the results-page progress bars.
 */

/** localStorage key holding an anonymous taker's answers across the auth flow. */
export const MBTI_ANSWERS_STORAGE_KEY = "vivida_mbti_answers";

export type MbtiAxis = "EI" | "SN" | "TF" | "JP";

/** The two poles of each axis, first letter first. */
export const AXIS_POLES: Record<MbtiAxis, readonly [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

/** Short Georgian axis labels for the results UI. */
export const AXIS_LABEL_KA: Record<MbtiAxis, readonly [string, string]> = {
  EI: ["ექსტრავერსია", "ინტროვერსია"],
  SN: ["სენსორიკა", "ინტუიცია"],
  TF: ["ლოგიკა", "გრძნობა"],
  JP: ["ორგანიზებულობა", "სპონტანურობა"],
};

export type MbtiQuestion = {
  id: number;
  axis: MbtiAxis;
  /** The pole that AGREEING with this statement pushes toward. */
  pole: string;
  /** Georgian statement. */
  textKa: string;
};

export const MBTI_QUESTIONS: MbtiQuestion[] = [
  // ── E / I ──────────────────────────────────────────────────────────────
  {
    id: 1,
    axis: "EI",
    pole: "E",
    textKa:
      "ხალხმრავალ ღონისძიებაზე ენერგიას ვიღებ და არ მინდა, რომ ადრე წავიდე.",
  },
  {
    id: 2,
    axis: "EI",
    pole: "I",
    textKa:
      "ხანგრძლივი სოციალური ურთიერთობის შემდეგ მჭირდება მარტო დარჩენა, რომ ენერგია აღვიდგინო.",
  },
  {
    id: 3,
    axis: "EI",
    pole: "E",
    textKa: "უცნობ ადამიანთან საუბრის დაწყება ჩემთვის ადვილია.",
  },
  {
    id: 4,
    axis: "EI",
    pole: "I",
    textKa: "მირჩევნია რამდენიმე ღრმა მეგობრობა, ვიდრე ბევრი ზედაპირული ნაცნობობა.",
  },

  // ── S / N ──────────────────────────────────────────────────────────────
  {
    id: 5,
    axis: "SN",
    pole: "S",
    textKa: "კონკრეტულ ფაქტებსა და გამოცდილებას უფრო ვენდობი, ვიდრე თეორიებს.",
  },
  {
    id: 6,
    axis: "SN",
    pole: "N",
    textKa:
      "ხშირად ვფიქრობ მომავალზე და შესაძლებლობებზე, რომლებიც ჯერ არ დამდგარა.",
  },
  {
    id: 7,
    axis: "SN",
    pole: "S",
    textKa: "დეტალებსა და პრაქტიკულ ნაბიჯებზე ფოკუსირება მირჩევნია აბსტრაქტულ იდეებს.",
  },
  {
    id: 8,
    axis: "SN",
    pole: "N",
    textKa: "მიყვარს სიმბოლოების, ფარული მნიშვნელობებისა და ღრმა კავშირების ძიება.",
  },

  // ── T / F ──────────────────────────────────────────────────────────────
  {
    id: 9,
    axis: "TF",
    pole: "T",
    textKa:
      "გადაწყვეტილების მიღებისას ლოგიკასა და ობიექტურ ანალიზს ვამჯობინებ ემოციებს.",
  },
  {
    id: 10,
    axis: "TF",
    pole: "F",
    textKa:
      "სხვისი გრძნობების გათვალისწინება ჩემთვის ხშირად უფრო მნიშვნელოვანია, ვიდრე მკაცრი წესი.",
  },
  {
    id: 11,
    axis: "TF",
    pole: "T",
    textKa: "კრიტიკას პირდაპირ ვაძლევ და ვიღებ, ზედმეტი დარბილების გარეშე.",
  },
  {
    id: 12,
    axis: "TF",
    pole: "F",
    textKa: "ადვილად ვგრძნობ, როცა ჩემ გვერდით მყოფი ადამიანი ცუდ ხასიათზეა.",
  },

  // ── J / P ──────────────────────────────────────────────────────────────
  {
    id: 13,
    axis: "JP",
    pole: "J",
    textKa:
      "მიყვარს გეგმები და სიები — როცა ყველაფერი წინასწარ ორგანიზებულია, თავს კომფორტულად ვგრძნობ.",
  },
  {
    id: 14,
    axis: "JP",
    pole: "P",
    textKa: "მირჩევნია ვარიანტები ღია დავტოვო და გადაწყვეტილება ბოლო მომენტში მივიღო.",
  },
  {
    id: 15,
    axis: "JP",
    pole: "J",
    textKa: "საქმეს ვასრულებ ვადაზე ადრე და არ მიყვარს ბოლო წუთამდე გადადება.",
  },
  {
    id: 16,
    axis: "JP",
    pole: "P",
    textKa: "სპონტანურობა და მოულოდნელი ცვლილებები მახალისებს, არ მაღიზიანებს.",
  },
];

/** 5-point Likert scale, strongly-agree (+2) → strongly-disagree (−2). */
export const MBTI_LIKERT: { value: number; labelKa: string }[] = [
  { value: 2, labelKa: "სრულიად ვეთანხმები" },
  { value: 1, labelKa: "ვეთანხმები" },
  { value: 0, labelKa: "ნეიტრალური" },
  { value: -1, labelKa: "არ ვეთანხმები" },
  { value: -2, labelKa: "სრულიად არ ვეთანხმები" },
];

/** Canonical Georgian archetype names — the AI names one too, but this is the
 *  deterministic fallback if that call fails, and a stable label everywhere. */
export const MBTI_ARCHETYPE_KA: Record<string, string> = {
  ISTJ: "ლოგისტიკოსი",
  ISFJ: "დამცველი",
  INFJ: "ადვოკატი",
  INTJ: "არქიტექტორი",
  ISTP: "ვირტუოზი",
  ISFP: "ავანტიურისტი",
  INFP: "შუამავალი",
  INTP: "ლოგიკოსი",
  ESTP: "მეწარმე",
  ESFP: "გამრთობი",
  ENFP: "ენთუზიასტი",
  ENTP: "პოლემისტი",
  ESTJ: "აღმასრულებელი",
  ESFJ: "კონსული",
  ENFJ: "პროტაგონისტი",
  ENTJ: "მეთაური",
};

export function mbtiArchetypeKa(type: string): string {
  return MBTI_ARCHETYPE_KA[type.toUpperCase()] ?? type;
}

// ── Scoring ────────────────────────────────────────────────────────────────

export type MbtiAxisScore = {
  /** Winning pole of the axis. */
  letter: string;
  /** 50–100: strength toward `letter` (50 = dead tie, 100 = extreme). */
  pct: number;
};

export type MbtiScores = {
  EI: MbtiAxisScore;
  SN: MbtiAxisScore;
  TF: MbtiAxisScore;
  JP: MbtiAxisScore;
};

export type MbtiResult = {
  /** Exact 4-letter type, e.g. "ESTJ". */
  type: string;
  scores: MbtiScores;
};

/** Max raw magnitude per axis: 4 questions × the ±2 Likert extreme. */
const AXIS_MAX = 4 * 2;

/**
 * Fold Likert answers into the 4-letter type + per-axis breakdown.
 *
 * `answers` maps questionId → Likert value (−2…+2). Missing/invalid answers
 * count as 0 (neutral), so a partial submission still resolves rather than
 * throwing. A dead-tie axis (raw 0) resolves deterministically to the first
 * pole at exactly 50%.
 */
export function calculateMbti(answers: Record<number, number>): MbtiResult {
  const raw: Record<MbtiAxis, number> = { EI: 0, SN: 0, TF: 0, JP: 0 };

  for (const q of MBTI_QUESTIONS) {
    const a = answers[q.id];
    const v = typeof a === "number" && a >= -2 && a <= 2 ? a : 0;
    const [first] = AXIS_POLES[q.axis];
    // Agreeing pushes toward q.pole; express every axis in terms of its FIRST
    // pole so the sign is consistent (agree-with-first → +, agree-with-second → −).
    raw[q.axis] += q.pole === first ? v : -v;
  }

  const axisScore = (axis: MbtiAxis): MbtiAxisScore => {
    const [first, second] = AXIS_POLES[axis];
    const r = raw[axis];
    const letter = r >= 0 ? first : second; // tie → first pole
    const pct = Math.round(50 + (Math.abs(r) / AXIS_MAX) * 50);
    return { letter, pct };
  };

  const scores: MbtiScores = {
    EI: axisScore("EI"),
    SN: axisScore("SN"),
    TF: axisScore("TF"),
    JP: axisScore("JP"),
  };

  const type =
    scores.EI.letter + scores.SN.letter + scores.TF.letter + scores.JP.letter;

  return { type, scores };
}
