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
  // ── E / I (15) ───────────────────────────────────────────────────────────
  { id: 1, axis: "EI", pole: "E", textKa: "ხალხმრავალ ღონისძიებაზე ენერგიას ვიღებ და არ მინდა, რომ ადრე წავიდე." },
  { id: 2, axis: "EI", pole: "I", textKa: "ხანგრძლივი სოციალური ურთიერთობის შემდეგ მჭირდება მარტოობა, რომ ენერგია აღვიდგინო." },
  { id: 3, axis: "EI", pole: "E", textKa: "უცნობ ადამიანთან საუბრის დაწყება ჩემთვის ბუნებრივი და ადვილია." },
  { id: 4, axis: "EI", pole: "I", textKa: "მირჩევნია რამდენიმე ღრმა მეგობრობა, ვიდრე ბევრი ზედაპირული ნაცნობობა." },
  { id: 5, axis: "EI", pole: "E", textKa: "ხმამაღლა ფიქრი მეხმარება — იდეები ხშირად საუბრისას მიბადება, არა მხოლოდ მარტო ყოფნისას." },
  { id: 6, axis: "EI", pole: "I", textKa: "სოციალურ ღონისძიებამდე ხშირად ვგრძნობ შინაგან წინააღმდეგობას, თუნდაც შემდეგ მომეწონოს." },
  { id: 7, axis: "EI", pole: "E", textKa: "ადვილად ვამყარებ ახალ ნაცნობობას და ვიწყებ კონტაქტს." },
  { id: 8, axis: "EI", pole: "I", textKa: "ღრმა, ერთი-ერთზე საუბარი მირჩევნია დიდ, ხმაურიან ჯგუფს." },
  { id: 9, axis: "EI", pole: "E", textKa: "ხანგრძლივი სიჩუმე და მარტოობა მალე მბეზრდება." },
  { id: 10, axis: "EI", pole: "I", textKa: "ჩემი შინაგანი სამყარო იმდენად მდიდარია, რომ მარტოობაში იშვიათად ვმოწყენილვარ." },
  { id: 11, axis: "EI", pole: "E", textKa: "მოვლენების ცენტრში ყოფნა და აქტიურობა მასტიმულირებს." },
  { id: 12, axis: "EI", pole: "I", textKa: "ყურადღების ცენტრში ხანგრძლივად ყოფნა მღლის." },
  { id: 13, axis: "EI", pole: "E", textKa: "ხალხთან ურთიერთობა დღის ბოლოს უფრო მაძლიერებს, ვიდრე მღლის." },
  { id: 14, axis: "EI", pole: "I", textKa: "მნიშვნელოვან გადაწყვეტილებამდე მჭირდება მარტო დარჩენა და დაფიქრება." },
  { id: 15, axis: "EI", pole: "E", textKa: "სპონტანურად შემიძლია დავურეკო ან შევხვდე ვინმეს წინასწარი გეგმის გარეშე." },

  // ── S / N (15) ───────────────────────────────────────────────────────────
  { id: 16, axis: "SN", pole: "S", textKa: "კონკრეტულ ფაქტებსა და გამოცდილებას უფრო ვენდობი, ვიდრე თეორიებს." },
  { id: 17, axis: "SN", pole: "N", textKa: "ხშირად ვფიქრობ მომავალზე და შესაძლებლობებზე, რომლებიც ჯერ არ დამდგარა." },
  { id: 18, axis: "SN", pole: "S", textKa: "დეტალებსა და პრაქტიკულ ნაბიჯებზე ფოკუსირება მირჩევნია აბსტრაქტულ იდეებს." },
  { id: 19, axis: "SN", pole: "N", textKa: "მიყვარს სიმბოლოების, ფარული მნიშვნელობებისა და ღრმა კავშირების ძიება." },
  { id: 20, axis: "SN", pole: "S", textKa: "ვამჯობინებ მკაფიო ინსტრუქციას, რომელიც ზუსტად აღწერს, რა უნდა გავაკეთო." },
  { id: 21, axis: "SN", pole: "N", textKa: "ხშირად ვამჩნევ ზოგად შაბლონს უფრო ადრე, ვიდრე ცალკეულ დეტალებს." },
  { id: 22, axis: "SN", pole: "S", textKa: "აწმყოზე და რეალურ, ხელშესახებ საქმეზე ორიენტირება მირჩევნია ოცნებას." },
  { id: 23, axis: "SN", pole: "N", textKa: "ჩემი წარმოსახვა ხშირად მიმყავს „რა იქნებოდა, თუ…“ კითხვებისკენ." },
  { id: 24, axis: "SN", pole: "S", textKa: "ვენდობი იმას, რაც უკვე გამოცდილია და მუშაობს, ვიდრე ახალ, დაუმტკიცებელ იდეას." },
  { id: 25, axis: "SN", pole: "N", textKa: "ახალი, უცნაური იდეები მახალისებს, თუნდაც მაშინვე პრაქტიკული არ იყოს." },
  { id: 26, axis: "SN", pole: "S", textKa: "აღწერისას კონკრეტულ დეტალებს ვამჩნევ და ვიმახსოვრებ." },
  { id: 27, axis: "SN", pole: "N", textKa: "უფრო მაინტერესებს „რატომ“ და „საიდან“, ვიდრე „რა“ და „როგორ“." },
  { id: 28, axis: "SN", pole: "S", textKa: "თანმიმდევრული, ნაბიჯ-ნაბიჯ მიდგომა მირჩევნია დიდ ნახტომებს." },
  { id: 29, axis: "SN", pole: "N", textKa: "ხშირად ვფიქრობ ცხოვრების ღრმა აზრსა და დანიშნულებაზე." },
  { id: 30, axis: "SN", pole: "S", textKa: "ფეხი მიწაზე მიდგას — უფრო რეალისტი ვარ, ვიდრე მეოცნებე." },

  // ── T / F (15) ───────────────────────────────────────────────────────────
  { id: 31, axis: "TF", pole: "T", textKa: "გადაწყვეტილების მიღებისას ლოგიკასა და ობიექტურ ანალიზს ვამჯობინებ ემოციებს." },
  { id: 32, axis: "TF", pole: "F", textKa: "სხვისი გრძნობების გათვალისწინება ჩემთვის ხშირად უფრო მნიშვნელოვანია, ვიდრე მკაცრი წესი." },
  { id: 33, axis: "TF", pole: "T", textKa: "კრიტიკას პირდაპირ ვაძლევ და ვიღებ, ზედმეტი დარბილების გარეშე." },
  { id: 34, axis: "TF", pole: "F", textKa: "ადვილად ვგრძნობ, როცა ჩემ გვერდით მყოფი ადამიანი ცუდ ხასიათზეა." },
  { id: 35, axis: "TF", pole: "T", textKa: "სამართლიანობა ჩემთვის ხშირად უფრო მნიშვნელოვანია, ვიდრე თანაგრძნობა." },
  { id: 36, axis: "TF", pole: "F", textKa: "ურთიერთობებში ჰარმონია ჩემთვის ერთ-ერთი უმთავრესია." },
  { id: 37, axis: "TF", pole: "T", textKa: "ვცდილობ, ემოციები განზე გადავდო, როცა მნიშვნელოვან გადაწყვეტილებას ვიღებ." },
  { id: 38, axis: "TF", pole: "F", textKa: "სხვების დახმარება და მხარდაჭერა ბუნებრივად მომდის." },
  { id: 39, axis: "TF", pole: "T", textKa: "არგუმენტში მართებულობა უფრო მაინტერესებს, ვიდრე ის, ვინ დარჩება ნაწყენი." },
  { id: 40, axis: "TF", pole: "F", textKa: "ხშირად ვიღებ გადაწყვეტილებას იმის მიხედვით, რაც სწორად „მეგრძნობა“." },
  { id: 41, axis: "TF", pole: "T", textKa: "ლოგიკური შეუსაბამობა მაღიზიანებს, თუნდაც პატარა იყოს." },
  { id: 42, axis: "TF", pole: "F", textKa: "ადვილად ვთანაუგრძნობ სხვის ტკივილს, თითქოს ჩემი იყოს." },
  { id: 43, axis: "TF", pole: "T", textKa: "ობიექტური ვიქნები, მაშინაც კი, თუ ეს ვინმეს ეწყინება." },
  { id: 44, axis: "TF", pole: "F", textKa: "ვცდილობ, არავინ ვაწყენინო და ყველას გრძნობებს მოვუფრთხილდე." },
  { id: 45, axis: "TF", pole: "T", textKa: "ემოციურ არგუმენტს ნაკლებად ვენდობი, ვიდრე ფაქტებს." },

  // ── J / P (15) ───────────────────────────────────────────────────────────
  { id: 46, axis: "JP", pole: "J", textKa: "მიყვარს გეგმები და სიები — როცა ყველაფერი წინასწარ ორგანიზებულია, თავს კომფორტულად ვგრძნობ." },
  { id: 47, axis: "JP", pole: "P", textKa: "მირჩევნია ვარიანტები ღია დავტოვო და გადაწყვეტილება ბოლო მომენტში მივიღო." },
  { id: 48, axis: "JP", pole: "J", textKa: "საქმეს ვასრულებ ვადაზე ადრე და არ მიყვარს ბოლო წუთამდე გადადება." },
  { id: 49, axis: "JP", pole: "P", textKa: "სპონტანურობა და მოულოდნელი ცვლილებები მახალისებს, არ მაღიზიანებს." },
  { id: 50, axis: "JP", pole: "J", textKa: "მოწესრიგებული გარემო და მკაფიო განრიგი მშვიდად მაგრძნობინებს." },
  { id: 51, axis: "JP", pole: "P", textKa: "მკაცრი განრიგი მზღუდავს — თავისუფლება მირჩევნია." },
  { id: 52, axis: "JP", pole: "J", textKa: "როცა გადაწყვეტილებას მივიღებ, ვმშვიდდები; ღია საკითხები მაწუხებს." },
  { id: 53, axis: "JP", pole: "P", textKa: "ხშირად ვცვლი გეგმას გზადაგზა, თუ უკეთესი ვარიანტი გამოჩნდა." },
  { id: 54, axis: "JP", pole: "J", textKa: "სანამ დავისვენებ, ჯერ საქმეს ვასრულებ." },
  { id: 55, axis: "JP", pole: "P", textKa: "მუშაობა უკეთ გამომდის, როცა ბოლო ვადა მაჩქარებს." },
  { id: 56, axis: "JP", pole: "J", textKa: "მიყვარს, როცა წესები და მოლოდინები მკაფიოა." },
  { id: 57, axis: "JP", pole: "P", textKa: "ახალ ადგილას გეგმის გარეშე დათვალიერება მირჩევნია დეტალურ მარშრუტს." },
  { id: 58, axis: "JP", pole: "J", textKa: "დაუსრულებელი საქმეები შფოთს მგვრის." },
  { id: 59, axis: "JP", pole: "P", textKa: "მოქნილობა და ადაპტაცია ჩემი ძლიერი მხარეა." },
  { id: 60, axis: "JP", pole: "J", textKa: "დღეს დაგეგმილს ვცდილობ ბოლომდე მივყვე, გადახრების გარეშე." },
];

/** 7-point Likert scale (16Personalities-style), +3 strongly-agree → −3
 *  strongly-disagree with a neutral middle. */
export const MBTI_LIKERT: { value: number; labelKa: string }[] = [
  { value: 3, labelKa: "სრულიად ვეთანხმები" },
  { value: 2, labelKa: "ვეთანხმები" },
  { value: 1, labelKa: "ნაწილობრივ ვეთანხმები" },
  { value: 0, labelKa: "ნეიტრალური" },
  { value: -1, labelKa: "ნაწილობრივ არ ვეთანხმები" },
  { value: -2, labelKa: "არ ვეთანხმები" },
  { value: -3, labelKa: "სრულიად არ ვეთანხმები" },
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

/** Max raw magnitude per axis: 15 questions × the ±3 Likert extreme. */
const AXIS_MAX = 15 * 3;

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
    const v = typeof a === "number" && a >= -3 && a <= 3 ? a : 0;
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
