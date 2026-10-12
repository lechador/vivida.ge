/**
 * The EQ (emotional intelligence) test item bank.
 *
 * Methodology, self-report, grounded in the research on EQ measurement:
 *   - Self-report Likert is the standard, buildable paradigm for a consumer
 *     test (ability tests like the MSCEIT need a licensed, consensus-scored
 *     answer key). Template: the Schutte SSEIT (Salovey–Mayer, 33 items,
 *     5-point Likert, reverse-keyed items, score bands).
 *   - Dimensions follow Goleman's five domains, the most recognizable framing
 *     for a general audience and a clean 5-spoke radar, each grounded in the
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
  nameEn: string;
  taglineKa: string;
  taglineEn: string;
  /** Fallback glyph + radar/accent hue (oklch), 5 distinct hues. */
  glyph: string;
  hue: string;
};

export type EqQuestion = {
  /** Stable 1..40, the persisted answer key. */
  id: number;
  domain: EqDomainKey;
  textKa: string;
  textEn?: string;
  /** Reverse-keyed: disagreement indicates higher EQ (scored 6 - raw). */
  reverse: boolean;
};

/** 5-point agreement scale (value → Georgian label). */
export const EQ_LIKERT: { value: number; labelKa: string; labelEn: string }[] = [
  { value: 1, labelKa: "სრულიად არ ვეთანხმები", labelEn: "Strongly disagree" },
  { value: 2, labelKa: "არ ვეთანხმები", labelEn: "Disagree" },
  { value: 3, labelKa: "ნეიტრალურად", labelEn: "Neither agree nor disagree" },
  { value: 4, labelKa: "ვეთანხმები", labelEn: "Agree" },
  { value: 5, labelKa: "სრულიად ვეთანხმები", labelEn: "Strongly agree" },
];

export const EQ_DOMAINS: EqDomain[] = [
  {
    key: "self-awareness",
    nameKa: "თვითშემეცნება",
    nameEn: "Self-awareness",
    taglineKa: "საკუთარი ემოციების ამოცნობა და გაცნობიერება",
    taglineEn: "Recognizing and understanding your emotions",
    glyph: "🪞",
    hue: "oklch(0.78 0.18 305)",
  },
  {
    key: "self-regulation",
    nameKa: "თვითრეგულაცია",
    nameEn: "Self-regulation",
    taglineKa: "ემოციების მართვა და იმპულსების კონტროლი",
    taglineEn: "Managing emotions and controlling impulses",
    glyph: "⚓",
    hue: "oklch(0.80 0.15 200)",
  },
  {
    key: "motivation",
    nameKa: "მოტივაცია",
    nameEn: "Motivation",
    taglineKa: "შინაგანი ბიძგი, ოპტიმიზმი და მიზანდასახულობა",
    taglineEn: "Inner drive, optimism and persistence",
    glyph: "🔥",
    hue: "oklch(0.82 0.16 85)",
  },
  {
    key: "empathy",
    nameKa: "ემპათია",
    nameEn: "Empathy",
    taglineKa: "სხვისი ემოციების აღქმა და გაგება",
    taglineEn: "Recognizing and understanding others' emotions",
    glyph: "💗",
    hue: "oklch(0.75 0.20 350)",
  },
  {
    key: "social-skills",
    nameKa: "სოციალური უნარები",
    nameEn: "Social skills",
    taglineKa: "ურთიერთობების აგება და მართვა",
    taglineEn: "Building and navigating relationships",
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
  { id: 6, domain: "self-awareness", reverse: false, textKa: "შემიძლია ერთმანეთისგან გავარჩიო მსგავსი ემოციები, მაგალითად, შფოთვა და აღელვება." },
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

const EQ_QUESTION_TEXT_EN: Record<number, string> = {
  1: "I can usually name exactly what I am feeling and why.",
  2: "I notice changes in my mood before they fully take over.",
  3: "I understand how my emotions affect the people around me.",
  4: "My own emotional reactions often surprise me.",
  5: "I know which situations tend to trigger strong emotions in me.",
  6: "I can distinguish between similar feelings, such as anxiety and excitement.",
  7: "I rarely pause to consider why I feel the way I do.",
  8: "I have a realistic view of my emotional strengths and limitations.",
  9: "When I become upset, I can calm myself before reacting.",
  10: "I remain composed under pressure.",
  11: "When I am angry, I often say things that I later regret.",
  12: "I recover from a bad mood relatively quickly.",
  13: "I adapt my behavior when a situation calls for it.",
  14: "When something annoys me, it can spoil my entire day.",
  15: "I think before acting, even when my emotions are intense.",
  16: "I can resist an impulse when acting on it would be poorly timed.",
  17: "I remain hopeful even when things are going badly.",
  18: "I keep working toward a goal despite setbacks.",
  19: "When I fail at something, I tend to give up.",
  20: "I can use my emotions as energy to move forward.",
  21: "I find ways to stay motivated even during boring tasks.",
  22: "I regain momentum quickly after disappointment.",
  23: "I lose interest as soon as something becomes difficult.",
  24: "I set goals for myself and pursue them with energy.",
  25: "I can usually sense how someone feels even when they do not say it.",
  26: "I quickly pick up on the overall mood in a room.",
  27: "I try to see situations from other people's perspectives.",
  28: "I find it difficult to notice when someone is upset.",
  29: "People often come to me when they need to feel understood.",
  30: "I notice small changes in a person's tone or facial expression.",
  31: "I rarely consider how my actions may affect other people.",
  32: "I can feel what a friend is going through when they share something painful.",
  33: "I connect easily with new people.",
  34: "I can help calm a tense situation between people.",
  35: "I can express what I need without needlessly hurting someone else.",
  36: "I find it difficult to start and sustain a conversation.",
  37: "I handle disagreements without damaging the relationship.",
  38: "People generally find it easy to talk with me.",
  39: "I often feel awkward in group settings.",
  40: "I can persuade people by understanding what matters to them.",
};

export const EQ_QUESTIONS_EN: EqQuestion[] = EQ_QUESTIONS.map((question) => ({
  ...question,
  textEn: EQ_QUESTION_TEXT_EN[question.id],
}));

export const EQ_QUESTION_COUNT = EQ_QUESTIONS.length;

/** localStorage bridge from the anonymous test into the claim/result flow. */
export const EQ_ANSWERS_STORAGE_KEY = "vivida_eq_answers";

export function eqQuestionById(id: number): EqQuestion | undefined {
  return EQ_QUESTIONS.find((q) => q.id === id);
}
