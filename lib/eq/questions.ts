/**
 * The EQ (emotional intelligence) test item bank.
 *
 * Methodology — self-report, grounded in the research on EQ measurement:
 *   - Self-report Likert is the standard, buildable paradigm for a consumer
 *     test (ability tests like the MSCEIT need a licensed, consensus-scored
 *     answer key). Template: the Schutte SSEIT (Salovey–Mayer, 33 items,
 *     5-point Likert, reverse-keyed items, score bands).
 *   - Dimensions follow Goleman's five domains — the most recognizable framing
 *     for a general audience and a clean 5-spoke radar — each grounded in the
 *     underlying Salovey–Mayer constructs (perceive / use / understand / manage).
 *   - 40 original Georgian items, 8 per domain, with ~2 REVERSE-keyed items per
 *     domain so acquiescence bias ("agree with everything") is controlled: a
 *     reverse item scores `6 - raw`, so disagreement signals higher EQ.
 *
 * The items are hand-written originals (the SSEIT/MSCEIT items are copyrighted);
 * we reuse the method, not the wording. Scoring lives in ./scoring.ts.
 */

export type EqDomainKey =
  | "self-awareness"
  | "self-regulation"
  | "motivation"
  | "empathy"
  | "social-skills";

export type EqDomain = {
  key: EqDomainKey;
  nameKa: string;
  taglineKa: string;
  /** Fallback glyph + radar/accent hue (oklch) — 5 distinct hues. */
  glyph: string;
  hue: string;
};

export type EqQuestion = {
  /** Stable 1..40 — the persisted answer key. */
  id: number;
  domain: EqDomainKey;
  textKa: string;
  /** Reverse-keyed: disagreement indicates higher EQ (scored 6 - raw). */
  reverse: boolean;
};

/** 5-point agreement scale (value → Georgian label). */
export const EQ_LIKERT: { value: number; labelKa: string }[] = [
  { value: 1, labelKa: "სრულიად არ ვეთანხმები" },
  { value: 2, labelKa: "არ ვეთანხმები" },
  { value: 3, labelKa: "ნეიტრალურად" },
  { value: 4, labelKa: "ვეთანხმები" },
  { value: 5, labelKa: "სრულიად ვეთანხმები" },
];

export const EQ_DOMAINS: EqDomain[] = [
  {
    key: "self-awareness",
    nameKa: "თვითშემეცნება",
    taglineKa: "საკუთარი ემოციების ამოცნობა და გაცნობიერება",
    glyph: "🪞",
    hue: "oklch(0.78 0.18 305)",
  },
  {
    key: "self-regulation",
    nameKa: "თვითრეგულაცია",
    taglineKa: "ემოციების მართვა და იმპულსების კონტროლი",
    glyph: "⚓",
    hue: "oklch(0.80 0.15 200)",
  },
  {
    key: "motivation",
    nameKa: "მოტივაცია",
    taglineKa: "შინაგანი ბიძგი, ოპტიმიზმი და მიზანდასახულობა",
    glyph: "🔥",
    hue: "oklch(0.82 0.16 85)",
  },
  {
    key: "empathy",
    nameKa: "ემპათია",
    taglineKa: "სხვისი ემოციების აღქმა და გაგება",
    glyph: "💗",
    hue: "oklch(0.75 0.20 350)",
  },
  {
    key: "social-skills",
    nameKa: "სოციალური უნარები",
    taglineKa: "ურთიერთობების აგება და მართვა",
    glyph: "🤝",
    hue: "oklch(0.78 0.16 160)",
  },
];

export const EQ_DOMAIN_BY_KEY: Record<EqDomainKey, EqDomain> = Object.fromEntries(
  EQ_DOMAINS.map((d) => [d.key, d])
) as Record<EqDomainKey, EqDomain>;

export const EQ_QUESTIONS: EqQuestion[] = [
  // ── Self-awareness ─────────────────────────────────────────────────────
  { id: 1, domain: "self-awareness", reverse: false, textKa: "ჩვეულებრივ ზუსტად შემიძლია დავასახელო, რას ვგრძნობ და რატომ." },
  { id: 2, domain: "self-awareness", reverse: false, textKa: "ვამჩნევ ჩემი განწყობის ცვლილებას, სანამ ის სრულად დამეუფლება." },
  { id: 3, domain: "self-awareness", reverse: false, textKa: "ვაცნობიერებ, როგორ მოქმედებს ჩემი ემოციები ჩემ გარშემო მყოფებზე." },
  { id: 4, domain: "self-awareness", reverse: true, textKa: "ხშირად საკუთარი ემოციური რეაქცია მიკვირს." },
  { id: 5, domain: "self-awareness", reverse: false, textKa: "ვიცი, რომელი სიტუაციები აღვიძებს ჩემში ძლიერ ემოციებს." },
  { id: 6, domain: "self-awareness", reverse: false, textKa: "შემიძლია ერთმანეთისგან გავარჩიო მსგავსი ემოციები — მაგალითად, შფოთვა და აღელვება." },
  { id: 7, domain: "self-awareness", reverse: true, textKa: "იშვიათად ვჩერდები იმაზე დასაფიქრებლად, თუ რატომ ვგრძნობ ასე." },
  { id: 8, domain: "self-awareness", reverse: false, textKa: "რეალურად ვაფასებ ჩემს ემოციურ ძლიერ და სუსტ მხარეებს." },

  // ── Self-regulation ────────────────────────────────────────────────────
  { id: 9, domain: "self-regulation", reverse: false, textKa: "როცა ვღელავ, შემიძლია დავმშვიდდე რეაქციამდე." },
  { id: 10, domain: "self-regulation", reverse: false, textKa: "წნეხის ქვეშ სიმშვიდეს ვინარჩუნებ." },
  { id: 11, domain: "self-regulation", reverse: true, textKa: "ხშირად გაცხარებისას ისეთ რამეს ვამბობ, რასაც შემდეგ ვნანობ." },
  { id: 12, domain: "self-regulation", reverse: false, textKa: "ცუდი განწყობისგან შედარებით სწრაფად ვთავისუფლდები." },
  { id: 13, domain: "self-regulation", reverse: false, textKa: "ჩემს ქცევას ვცვლი, როცა სიტუაცია ამას მოითხოვს." },
  { id: 14, domain: "self-regulation", reverse: true, textKa: "როცა რაღაც მაღიზიანებს, ეს მთელ დღეს მიფუჭებს." },
  { id: 15, domain: "self-regulation", reverse: false, textKa: "ვფიქრობ, სანამ ვიმოქმედებ, მაშინაც კი, როცა ემოციები მძაფრია." },
  { id: 16, domain: "self-regulation", reverse: false, textKa: "შემიძლია შევიკავო იმპულსი, როცა მისი დრო არ არის." },

  // ── Motivation ─────────────────────────────────────────────────────────
  { id: 17, domain: "motivation", reverse: false, textKa: "იმედს ვინარჩუნებ მაშინაც, როცა საქმე ცუდად მიდის." },
  { id: 18, domain: "motivation", reverse: false, textKa: "მიზნისკენ ვაგრძელებ სვლას წარუმატებლობის მიუხედავად." },
  { id: 19, domain: "motivation", reverse: true, textKa: "როცა რაღაცაში ვმარცხდები, ხელს ვიღებ." },
  { id: 20, domain: "motivation", reverse: false, textKa: "ჩემს ემოციებს ენერგიის მოსაცემად და წინ წასაწევად ვიყენებ." },
  { id: 21, domain: "motivation", reverse: false, textKa: "მოტივაციის შენარჩუნების საშუალებას ვპოულობ მოსაწყენ საქმეშიც კი." },
  { id: 22, domain: "motivation", reverse: false, textKa: "იმედგაცრუების შემდეგ სწრაფად ვბრუნდები ფორმაში." },
  { id: 23, domain: "motivation", reverse: true, textKa: "ინტერესს ვკარგავ, როგორც კი საქმე რთულდება." },
  { id: 24, domain: "motivation", reverse: false, textKa: "საკუთარ თავს მიზნებს ვუსახავ და ენერგიულად მივყვები მათ." },

  // ── Empathy ────────────────────────────────────────────────────────────
  { id: 25, domain: "empathy", reverse: false, textKa: "ჩვეულებრივ ვგრძნობ, როგორ არის ადამიანი, მაშინაც კი, თუ ამას არ ამბობს." },
  { id: 26, domain: "empathy", reverse: false, textKa: "სწრაფად ვგრძნობ ოთახის საერთო განწყობას." },
  { id: 27, domain: "empathy", reverse: false, textKa: "ვცდილობ სიტუაცია სხვისი კუთხიდანაც დავინახო." },
  { id: 28, domain: "empathy", reverse: true, textKa: "მიჭირს იმის შემჩნევა, როცა ვინმე ნაწყენია." },
  { id: 29, domain: "empathy", reverse: false, textKa: "ხალხი ხშირად ჩემთან მოდის, როცა გაგებას საჭიროებს." },
  { id: 30, domain: "empathy", reverse: false, textKa: "ვამჩნევ მცირე ცვლილებასაც ადამიანის ტონსა თუ სახის გამომეტყველებაში." },
  { id: 31, domain: "empathy", reverse: true, textKa: "იშვიათად ვფიქრობ იმაზე, თუ როგორ აისახება ჩემი ქმედება სხვებზე." },
  { id: 32, domain: "empathy", reverse: false, textKa: "შემიძლია ვიგრძნო ის, რასაც მეგობარი განიცდის, როცა მტკივნეულს მიზიარებს." },

  // ── Social skills ──────────────────────────────────────────────────────
  { id: 33, domain: "social-skills", reverse: false, textKa: "ადვილად ვამყარებ კავშირს ახალ ადამიანებთან." },
  { id: 34, domain: "social-skills", reverse: false, textKa: "შემიძლია დავამშვიდო ადამიანებს შორის დაძაბული სიტუაცია." },
  { id: 35, domain: "social-skills", reverse: false, textKa: "ვამბობ იმას, რაც მჭირდება, სხვისი გულის ტკენის გარეშე." },
  { id: 36, domain: "social-skills", reverse: true, textKa: "მიჭირს საუბრის გაბმა და გაგრძელება." },
  { id: 37, domain: "social-skills", reverse: false, textKa: "უთანხმოებას ისე ვაგვარებ, რომ ურთიერთობა არ ზიანდება." },
  { id: 38, domain: "social-skills", reverse: false, textKa: "ხალხს ჩემთან საუბარი უადვილდება." },
  { id: 39, domain: "social-skills", reverse: true, textKa: "ჯგუფურ გარემოში ხშირად უხერხულად ვგრძნობ თავს." },
  { id: 40, domain: "social-skills", reverse: false, textKa: "სხვების დარწმუნება შემიძლია იმის გაგებით, რაც მათთვის მნიშვნელოვანია." },
];

export const EQ_QUESTION_COUNT = EQ_QUESTIONS.length;

/** localStorage bridge from the anonymous test into the claim/result flow. */
export const EQ_ANSWERS_STORAGE_KEY = "vivida_eq_answers";

export function eqQuestionById(id: number): EqQuestion | undefined {
  return EQ_QUESTIONS.find((q) => q.id === id);
}
