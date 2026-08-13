/**
 * Astro-MBTI test data + scoring — modeled on the 16Personalities test.
 *
 * 60 Georgian statements across 5 dimensions (12 each): the four Jungian
 * axes (E/I, S/N, T/F, J/P) plus the Identity axis (Assertive/Turbulent),
 * which 16Personalities appends as a suffix — e.g. "INFJ-T". Within each
 * dimension the statements are split ~6/6 toward each pole, so a user who
 * reflexively agrees with everything (acquiescence bias) still lands near the
 * middle instead of being pushed to an extreme.
 *
 * Answers are a 7-point agree↔disagree scale (+3 … −3, neutral middle).
 * calculateMbti() folds them into the 5-letter type (e.g. "INFJ-T") plus a
 * per-axis strength breakdown for the results-page bars.
 */

/** localStorage key holding an anonymous taker's answers across the auth flow. */
export const MBTI_ANSWERS_STORAGE_KEY = "vivida_mbti_answers";

export type MbtiAxis = "EI" | "SN" | "TF" | "JP" | "AT";

/** The two poles of each axis, first letter first. */
export const AXIS_POLES: Record<MbtiAxis, readonly [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
  AT: ["A", "T"], // Assertive / Turbulent — the Identity dimension
};

/** Short Georgian axis labels for the results UI. */
export const AXIS_LABEL_KA: Record<MbtiAxis, readonly [string, string]> = {
  EI: ["ექსტრავერსია", "ინტროვერსია"],
  SN: ["სენსორიკა", "ინტუიცია"],
  TF: ["ლოგიკა", "გრძნობა"],
  JP: ["ორგანიზებულობა", "სპონტანურობა"],
  AT: ["თავდაჯერებული", "მშფოთვარე"],
};
export const AXIS_LABEL_EN: Record<MbtiAxis, readonly [string, string]> = {
  EI: ["Extraversion", "Introversion"], SN: ["Sensing", "Intuition"], TF: ["Thinking", "Feeling"], JP: ["Judging", "Prospecting"], AT: ["Assertive", "Turbulent"],
};

export type MbtiQuestion = {
  id: number;
  axis: MbtiAxis;
  /** The pole that AGREEING with this statement pushes toward. */
  pole: string;
  /** Georgian statement. */
  textKa: string;
  textEn?: string;
};

export const MBTI_QUESTIONS: MbtiQuestion[] = [
  // ── E / I (12) ───────────────────────────────────────────────────────────
  { id: 1, axis: "EI", pole: "E", textKa: "ხალხმრავალ ღონისძიებაზე ენერგიით ვივსები და ადრე წასვლა არ მინდა." },
  { id: 2, axis: "EI", pole: "I", textKa: "ხანგრძლივი სოციალური ურთიერთობის შემდეგ, ენერგიის აღსადგენად მარტოობა მჭირდება." },
  { id: 3, axis: "EI", pole: "E", textKa: "უცნობ ადამიანთან საუბრის დაწყება ჩემთვის ბუნებრივი და ადვილია." },
  { id: 4, axis: "EI", pole: "I", textKa: "მირჩევნია, მყავდეს რამდენიმე ახლო მეგობარი, ვიდრე ბევრი ნაცნობი." },
  { id: 5, axis: "EI", pole: "E", textKa: "ხმამაღლა ფიქრი მეხმარება — იდეები ხშირად საუბრისას მებადება." },
  { id: 6, axis: "EI", pole: "I", textKa: "ღრმა, პირისპირ საუბარი მირჩევნია დიდ, ხმაურიან ჯგუფს." },
  { id: 7, axis: "EI", pole: "E", textKa: "ადვილად ვიჩენ ახალ ნაცნობებს." },
  { id: 8, axis: "EI", pole: "I", textKa: "მდიდარი შინაგანი სამყარო მაქვს და მარტოობა იშვიათად მბეზრდება." },
  { id: 9, axis: "EI", pole: "E", textKa: "მოვლენების ცენტრში ყოფნა და აქტიურობა მასტიმულირებს." },
  { id: 10, axis: "EI", pole: "I", textKa: "ყურადღების ცენტრში ხანგრძლივად ყოფნა მღლის." },
  { id: 11, axis: "EI", pole: "E", textKa: "დღის ბოლოს ადამიანებთან ურთიერთობა უფრო მახალისებს, ვიდრე მღლის." },
  { id: 12, axis: "EI", pole: "I", textKa: "მნიშვნელოვანი გადაწყვეტილების მიღებამდე მარტო დაფიქრება მჭირდება." },

  // ── S / N (12) ───────────────────────────────────────────────────────────
  { id: 13, axis: "SN", pole: "S", textKa: "კონკრეტულ ფაქტებსა და გამოცდილებას უფრო ვენდობი, ვიდრე თეორიებს." },
  { id: 14, axis: "SN", pole: "N", textKa: "ხშირად ვფიქრობ მომავალსა და ჯერ არარსებულ შესაძლებლობებზე." },
  { id: 15, axis: "SN", pole: "S", textKa: "აბსტრაქტულ იდეებზე ფიქრს, დეტალებსა და პრაქტიკულ ნაბიჯებზე კონცენტრირება მირჩევნია." },
  { id: 16, axis: "SN", pole: "N", textKa: "მიყვარს სიმბოლოების, ფარული მნიშვნელობებისა და ღრმა კავშირების ძიება." },
  { id: 17, axis: "SN", pole: "S", textKa: "ვამჯობინებ მკაფიო ინსტრუქციას, რომელიც ზუსტად აღწერს, რა უნდა გავაკეთო." },
  { id: 18, axis: "SN", pole: "N", textKa: "ხშირად ზოგად კანონზომიერებას უფრო ადრე ვამჩნევ, ვიდრე ცალკეულ დეტალებს." },
  { id: 19, axis: "SN", pole: "S", textKa: "ოცნებას მირჩევნია აწმყოზე და ხელშესახებ საქმეებზე ზრუნვა." },
  { id: 20, axis: "SN", pole: "N", textKa: "წარმოსახვა ხშირად მაფიქრებინებს კითხვაზე: „რა იქნებოდა, თუ...“." },
  { id: 21, axis: "SN", pole: "S", textKa: "უფრო ვენდობი იმას, რაც გამოცდილია, ვიდრე ახალ, დაუმტკიცებელ იდეას." },
  { id: 22, axis: "SN", pole: "N", textKa: "ახალი, უცნაური იდეები მახალისებს, თუნდაც თავიდან არაპრაქტიკული ჩანდეს." },
  { id: 23, axis: "SN", pole: "S", textKa: "თანმიმდევრული, ნაბიჯ-ნაბიჯ მიდგომა მირჩევნია დიდ ნახტომებს." },
  { id: 24, axis: "SN", pole: "N", textKa: "ხშირად ვფიქრობ ცხოვრების საზრისსა და დანიშნულებაზე." },

  // ── T / F (12) ───────────────────────────────────────────────────────────
  { id: 25, axis: "TF", pole: "T", textKa: "გადაწყვეტილების მიღებისას ლოგიკასა და ობიექტურ ანალიზს ვამჯობინებ ემოციებს." },
  { id: 26, axis: "TF", pole: "F", textKa: "სხვისი გრძნობების გათვალისწინება ჩემთვის ხშირად უფრო მნიშვნელოვანია, ვიდრე მკაცრი წესი." },
  { id: 27, axis: "TF", pole: "T", textKa: "კრიტიკას პირდაპირ გამოვთქვამ და ვიღებ, ზედმეტი შერბილების გარეშე." },
  { id: 28, axis: "TF", pole: "F", textKa: "ადვილად ვგრძნობ, როცა ჩემ გვერდით მყოფი ცუდ ხასიათზეა." },
  { id: 29, axis: "TF", pole: "T", textKa: "სამართლიანობა ჩემთვის ხშირად უფრო მნიშვნელოვანია, ვიდრე თანაგრძნობა." },
  { id: 30, axis: "TF", pole: "F", textKa: "ურთიერთობებში ჰარმონია ჩემთვის ერთ-ერთი უმთავრესია." },
  { id: 31, axis: "TF", pole: "T", textKa: "ვცდილობ, ემოციები განზე გადავდო, როცა მნიშვნელოვან გადაწყვეტილებას ვიღებ." },
  { id: 32, axis: "TF", pole: "F", textKa: "სხვების დახმარება და მხარდაჭერა ბუნებრივად გამომდის." },
  { id: 33, axis: "TF", pole: "T", textKa: "კამათისას არგუმენტის სისწორე უფრო მაინტერესებს, ვიდრე ის, თუ ვინ დარჩება ნაწყენი." },
  { id: 34, axis: "TF", pole: "F", textKa: "ხშირად გადაწყვეტილებას იმის მიხედვით ვიღებ, რასაც გული მკარნახობს." },
  { id: 35, axis: "TF", pole: "T", textKa: "ლოგიკური შეუსაბამობა მაღიზიანებს, თუნდაც უმნიშვნელო იყოს." },
  { id: 36, axis: "TF", pole: "F", textKa: "ადვილად ვთანაუგრძნობ სხვის ტკივილს, თითქოს ჩემი იყოს." },

  // ── J / P (12) ───────────────────────────────────────────────────────────
  { id: 37, axis: "JP", pole: "J", textKa: "მიყვარს გეგმები და სიები — როცა ყველაფერი წინასწარ დაგეგმილია, თავს კომფორტულად ვგრძნობ." },
  { id: 38, axis: "JP", pole: "P", textKa: "მირჩევნია, არჩევანი ღიად დავტოვო და გადაწყვეტილება ბოლო მომენტში მივიღო." },
  { id: 39, axis: "JP", pole: "J", textKa: "საქმეს ვადაზე ადრე ვასრულებ და არ მიყვარს ბოლო წუთამდე გადადება." },
  { id: 40, axis: "JP", pole: "P", textKa: "სპონტანურობა და მოულოდნელი ცვლილებები მახალისებს და არ მაღიზიანებს." },
  { id: 41, axis: "JP", pole: "J", textKa: "მოწესრიგებული გარემო და მკაფიო განრიგი მამშვიდებს." },
  { id: 42, axis: "JP", pole: "P", textKa: "მკაცრი განრიგი მზღუდავს — თავისუფლება მირჩევნია." },
  { id: 43, axis: "JP", pole: "J", textKa: "როცა გადაწყვეტილებას ვიღებ, ვმშვიდდები; ღია საკითხები კი მაწუხებს." },
  { id: 44, axis: "JP", pole: "P", textKa: "ხშირად ვცვლი გეგმას, თუ გზად უკეთესი ვარიანტი გამოჩნდა." },
  { id: 45, axis: "JP", pole: "J", textKa: "სანამ დავისვენებ, ჯერ საქმეს ვასრულებ." },
  { id: 46, axis: "JP", pole: "P", textKa: "მუშაობა უკეთ გამომდის, როცა დროში შეზღუდული ვარ." },
  { id: 47, axis: "JP", pole: "J", textKa: "მიყვარს, როცა წესები და მოლოდინები მკაფიოა." },
  { id: 48, axis: "JP", pole: "P", textKa: "მოქნილობა და ადაპტაციის უნარი ჩემი ძლიერი მხარეა." },

  // ── A / T · Identity (12) ────────────────────────────────────────────────
  { id: 49, axis: "AT", pole: "A", textKa: "სტრესულ სიტუაციაშიც კი სიმშვიდეს ვინარჩუნებ." },
  { id: 50, axis: "AT", pole: "T", textKa: "ხშირად ვღელავ იმაზე, რაც შეიძლება არასწორად წავიდეს." },
  { id: 51, axis: "AT", pole: "A", textKa: "საკუთარ თავში დარწმუნებული ვარ და იშვიათად მეპარება ეჭვი ჩემი გადაწყვეტილებების სისწორეში." },
  { id: 52, axis: "AT", pole: "T", textKa: "ჩემ შესახებ სხვისი აზრი ძალიან მაწუხებს." },
  { id: 53, axis: "AT", pole: "A", textKa: "წარუმატებლობას ადვილად ვუმკლავდები და სწრაფად აღვიდგენ ძალებს." },
  { id: 54, axis: "AT", pole: "T", textKa: "შეცდომებზე დიდხანს ვნერვიულობ და საკუთარ თავს ვკიცხავ." },
  { id: 55, axis: "AT", pole: "A", textKa: "ჩემი განწყობა სტაბილურია და იშვიათად იცვლება." },
  { id: 56, axis: "AT", pole: "T", textKa: "პერფექციონისტი ვარ — მინდა, ყველაფერი უნაკლო იყოს." },
  { id: 57, axis: "AT", pole: "A", textKa: "იშვიათად ვღელავ მომავალზე — მჯერა, რომ თავს გავართმევ." },
  { id: 58, axis: "AT", pole: "T", textKa: "ხშირად ვადარებ საკუთარ თავს სხვებს და ვღელავ, ვარ თუ არა საკმარისად კარგი." },
  { id: 59, axis: "AT", pole: "A", textKa: "კრიტიკა ნაკლებად მაშფოთებს — ვითვალისწინებ და გზას ვაგრძელებ." },
  { id: 60, axis: "AT", pole: "T", textKa: "სტრესის დროს დასვენება და დამშვიდება მიჭირს." },
];

const MBTI_TEXT_EN = [
  "Crowded events energize me, and I rarely want to leave early.", "After prolonged social interaction, I need time alone to recharge.", "Starting a conversation with a stranger feels natural and easy to me.", "I prefer a few close friends to a large circle of acquaintances.", "Thinking aloud helps me; ideas often emerge while I speak.", "I prefer a deep one-to-one conversation to a large, noisy group.", "I make new acquaintances easily.", "I have a rich inner world and rarely become bored when alone.", "Being active at the center of events stimulates me.", "Being the center of attention for a long time drains me.", "At the end of the day, interaction with people tends to energize rather than exhaust me.", "I need time alone to think before making an important decision.",
  "I trust concrete facts and experience more than theories.", "I often think about the future and possibilities that do not exist yet.", "I prefer focusing on details and practical steps to considering abstract ideas.", "I enjoy searching for symbols, hidden meanings and deeper connections.", "I prefer clear instructions that specify exactly what to do.", "I often notice the overall pattern before the individual details.", "I prefer attending to the present and tangible tasks rather than daydreaming.", "My imagination often leads me to ask, “What if?”", "I trust proven approaches more than new, untested ideas.", "New and unusual ideas excite me even when they initially seem impractical.", "I prefer a sequential, step-by-step approach to large leaps.", "I often think about meaning and purpose in life.",
  "When deciding, I favor logic and objective analysis over emotion.", "Considering other people's feelings is often more important to me than following a strict rule.", "I give and receive criticism directly, without much softening.", "I easily notice when someone near me is in a bad mood.", "Fairness is often more important to me than compassion.", "Harmony is one of my highest priorities in relationships.", "I try to set emotion aside when making an important decision.", "Helping and supporting others comes naturally to me.", "In an argument, I care more about whether the reasoning is correct than who may feel hurt.", "I often make decisions by following what my heart tells me.", "Logical inconsistencies bother me, even when they are minor.", "I readily empathize with another person's pain as though it were my own.",
  "I like plans and lists, and feel comfortable when things are arranged in advance.", "I prefer to keep my options open and decide at the last moment.", "I finish tasks ahead of deadlines and dislike waiting until the last minute.", "Spontaneity and unexpected changes excite rather than irritate me.", "An orderly environment and a clear schedule help me feel calm.", "Strict schedules feel restrictive; I prefer freedom.", "Reaching a decision brings relief, while unresolved matters bother me.", "I often change a plan when a better option appears along the way.", "I finish my work before allowing myself to relax.", "I tend to work better under time pressure.", "I like rules and expectations to be clear.", "Flexibility and adaptability are among my strengths.",
  "I remain calm even in stressful situations.", "I often worry about what might go wrong.", "I trust myself and rarely doubt the soundness of my decisions.", "Other people's opinions of me concern me deeply.", "I cope with failure well and regain momentum quickly.", "I dwell on mistakes and criticize myself for a long time.", "My mood is stable and changes infrequently.", "I am a perfectionist and want everything to be flawless.", "I rarely worry about the future because I trust myself to cope.", "I often compare myself with others and worry that I may not be good enough.", "Criticism does not unsettle me for long; I consider it and move forward.", "When stressed, I find it difficult to relax and calm down.",
];

export const MBTI_QUESTIONS_EN: MbtiQuestion[] = MBTI_QUESTIONS.map((question, index) => ({ ...question, textEn: MBTI_TEXT_EN[index] }));

/** 7-point Likert scale (16Personalities-style), +3 strongly-agree → −3
 *  strongly-disagree with a neutral middle. */
export const MBTI_LIKERT: { value: number; labelKa: string; labelEn: string }[] = [
  { value: 3, labelKa: "სრულიად ვეთანხმები", labelEn: "Strongly agree" },
  { value: 2, labelKa: "ვეთანხმები", labelEn: "Agree" },
  { value: 1, labelKa: "ნაწილობრივ ვეთანხმები", labelEn: "Slightly agree" },
  { value: 0, labelKa: "ნეიტრალური", labelEn: "Neutral" },
  { value: -1, labelKa: "ნაწილობრივ არ ვეთანხმები", labelEn: "Slightly disagree" },
  { value: -2, labelKa: "არ ვეთანხმები", labelEn: "Disagree" },
  { value: -3, labelKa: "სრულიად არ ვეთანხმები", labelEn: "Strongly disagree" },
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
export const MBTI_ARCHETYPE_EN: Record<string, string> = {
  ISTJ: "Logistician", ISFJ: "Defender", INFJ: "Advocate", INTJ: "Architect",
  ISTP: "Virtuoso", ISFP: "Adventurer", INFP: "Mediator", INTP: "Logician",
  ESTP: "Entrepreneur", ESFP: "Entertainer", ENFP: "Campaigner", ENTP: "Debater",
  ESTJ: "Executive", ESFJ: "Consul", ENFJ: "Protagonist", ENTJ: "Commander",
};

/** The 4-letter Jungian base of a type, dropping any "-A/-T" Identity suffix. */
export function mbtiBaseType(type: string): string {
  return type.slice(0, 4).toUpperCase();
}

export function mbtiArchetypeKa(type: string): string {
  const base = mbtiBaseType(type);
  return MBTI_ARCHETYPE_KA[base] ?? base;
}
export function mbtiArchetypeEn(type: string): string {
  const base = mbtiBaseType(type);
  return MBTI_ARCHETYPE_EN[base] ?? base;
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
  AT: MbtiAxisScore;
};

export type MbtiResult = {
  /** Full type with Identity suffix, e.g. "ESTJ-A". */
  type: string;
  scores: MbtiScores;
};

/** Max raw magnitude per axis: 12 questions × the ±3 Likert extreme. */
const AXIS_MAX = 12 * 3;

/**
 * Fold Likert answers into the 5-letter type (e.g. "INFJ-T") + per-axis
 * breakdown.
 *
 * `answers` maps questionId → Likert value (−3…+3). Missing/invalid answers
 * count as 0 (neutral), so a partial submission still resolves rather than
 * throwing. A dead-tie axis (raw 0) resolves deterministically to the first
 * pole at exactly 50%.
 */
export function calculateMbti(
  answers: Record<number, number>,
  questions: MbtiQuestion[] = MBTI_QUESTIONS
): MbtiResult {
  const raw: Record<MbtiAxis, number> = { EI: 0, SN: 0, TF: 0, JP: 0, AT: 0 };

  for (const q of questions) {
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
    AT: axisScore("AT"),
  };

  // 16Personalities format: the four Jungian letters + "-" + Identity letter.
  const type =
    scores.EI.letter +
    scores.SN.letter +
    scores.TF.letter +
    scores.JP.letter +
    "-" +
    scores.AT.letter;

  return { type, scores };
}
