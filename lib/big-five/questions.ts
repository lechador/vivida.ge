/**
 * The Big Five (OCEAN) personality test item bank.
 *
 * The Big Five is the scientific gold-standard model of personality, five
 * broad, largely independent traits: Openness, Conscientiousness,
 * Extraversion, Agreeableness, Neuroticism. Unlike the EQ test, the traits are
 * BIPOLAR, neither pole is "better", so there is no overall score, just a
 * profile.
 *
 * Method: self-report, 5-point Likert, grounded in the public-domain IPIP item
 * pool (original Georgian wording, not the copyrighted NEO items). Each trait
 * has 8 items with reverse-keyed items mixed in so agreement direction is
 * balanced and acquiescence bias is controlled. Scoring lives in ./scoring.ts.
 */

export type BigFiveTraitKey =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "neuroticism";

export type BigFiveTrait = {
  key: BigFiveTraitKey;
  /** One-letter OCEAN code, e.g. "O". */
  letter: string;
  nameKa: string;
  nameEn: string;
  taglineKa: string;
  taglineEn: string;
  glyph: string;
  hue: string;
};

export type BigFiveQuestion = {
  id: number;
  trait: BigFiveTraitKey;
  textKa: string;
  textEn?: string;
  /** Reverse-keyed: agreement indicates a LOWER level of the trait. */
  reverse: boolean;
};

/** 5-point agreement scale. */
export const BIG5_LIKERT: { value: number; labelKa: string; labelEn: string }[] = [
  { value: 1, labelKa: "სრულიად არ ვეთანხმები", labelEn: "Strongly disagree" },
  { value: 2, labelKa: "არ ვეთანხმები", labelEn: "Disagree" },
  { value: 3, labelKa: "არც ვეთანხმები, არც არ ვეთანხმები", labelEn: "Neither agree nor disagree" },
  { value: 4, labelKa: "ვეთანხმები", labelEn: "Agree" },
  { value: 5, labelKa: "სრულიად ვეთანხმები", labelEn: "Strongly agree" },
];

export const BIG5_TRAITS: BigFiveTrait[] = [
  {
    key: "openness",
    letter: "O",
    nameKa: "ღიაობა",
    nameEn: "Openness",
    taglineKa: "წარმოსახვა, ცნობისმოყვარეობა, ახლის ძიება",
    taglineEn: "Imagination, curiosity and openness to novelty",
    glyph: "🎨",
    hue: "oklch(0.78 0.18 305)",
  },
  {
    key: "conscientiousness",
    letter: "C",
    nameKa: "კეთილსინდისიერება",
    nameEn: "Conscientiousness",
    taglineKa: "ორგანიზებულობა, დისციპლინა, პასუხისმგებლობა",
    taglineEn: "Organization, discipline and responsibility",
    glyph: "📐",
    hue: "oklch(0.80 0.15 200)",
  },
  {
    key: "extraversion",
    letter: "E",
    nameKa: "ექსტრავერსია",
    nameEn: "Extraversion",
    taglineKa: "სოციალურობა, ენერგიულობა, თავდაჯერებულობა",
    taglineEn: "Sociability, energy and assertiveness",
    glyph: "⚡",
    hue: "oklch(0.82 0.16 85)",
  },
  {
    key: "agreeableness",
    letter: "A",
    nameKa: "კეთილგანწყობა",
    nameEn: "Agreeableness",
    taglineKa: "თანაგრძნობა, ნდობა, თანამშრომლობა",
    taglineEn: "Compassion, trust and cooperation",
    glyph: "🤲",
    hue: "oklch(0.75 0.20 350)",
  },
  {
    key: "neuroticism",
    letter: "N",
    nameKa: "ნევროტიზმი",
    nameEn: "Neuroticism",
    taglineKa: "ემოციური მგრძნობელობა, სტრესისადმი მიდრეკილება",
    taglineEn: "Emotional sensitivity and stress reactivity",
    glyph: "🌊",
    hue: "oklch(0.78 0.16 160)",
  },
];

export const BIG5_TRAIT_BY_KEY: Record<BigFiveTraitKey, BigFiveTrait> =
  Object.fromEntries(BIG5_TRAITS.map((t) => [t.key, t])) as Record<
    BigFiveTraitKey,
    BigFiveTrait
  >;

export const BIG5_QUESTIONS: BigFiveQuestion[] = [
  // ── Openness ───────────────────────────────────────────────────────────
  { id: 1, trait: "openness", reverse: false, textKa: "მიყვარს ახალი იდეების შესწავლა და სხვადასხვა მოსაზრებაზე დაფიქრება." },
  { id: 2, trait: "openness", reverse: false, textKa: "მდიდარი წარმოსახვა მაქვს." },
  { id: 3, trait: "openness", reverse: false, textKa: "მიზიდავს ხელოვნება, მუსიკა და სილამაზე." },
  { id: 4, trait: "openness", reverse: true, textKa: "ახალი რამის ცდას ნაცნობი საქმეების კეთება მირჩევნია." },
  { id: 5, trait: "openness", reverse: false, textKa: "ხშირად ვფიქრობ აბსტრაქტულ ან ფილოსოფიურ საკითხებზე." },
  { id: 6, trait: "openness", reverse: false, textKa: "მაინტერესებს სხვადასხვა კულტურა და ცხოვრების წესი." },
  { id: 7, trait: "openness", reverse: true, textKa: "იშვიათად მებადება შემოქმედებითი იდეები." },
  { id: 8, trait: "openness", reverse: false, textKa: "ცნობისმოყვარეობა ახალი საკითხების შესწავლისკენ მიბიძგებს." },

  // ── Conscientiousness ──────────────────────────────────────────────────
  { id: 9, trait: "conscientiousness", reverse: false, textKa: "ყოველთვის ვასრულებ დანაპირებს." },
  { id: 10, trait: "conscientiousness", reverse: false, textKa: "მიყვარს წესრიგი და წინასწარ დაგეგმვა." },
  { id: 11, trait: "conscientiousness", reverse: false, textKa: "დაწყებული საქმე ბოლომდე მიმყავს და მხოლოდ შემდეგ ვიწყებ ახალს." },
  { id: 12, trait: "conscientiousness", reverse: true, textKa: "ხშირად ვაჭიანურებ საქმეებს." },
  { id: 13, trait: "conscientiousness", reverse: false, textKa: "დეტალებს დიდ ყურადღებას ვაქცევ." },
  { id: 14, trait: "conscientiousness", reverse: true, textKa: "ჩემი ნივთები ხშირად არეულია." },
  { id: 15, trait: "conscientiousness", reverse: false, textKa: "მიზნის მისაღწევად დისციპლინირებულად ვმოქმედებ." },
  { id: 16, trait: "conscientiousness", reverse: false, textKa: "სანდო და პასუხისმგებლიანი ადამიანი ვარ." },

  // ── Extraversion ───────────────────────────────────────────────────────
  { id: 17, trait: "extraversion", reverse: false, textKa: "ახალ ადამიანებს ადვილად ვეცნობი." },
  { id: 18, trait: "extraversion", reverse: false, textKa: "ხალხთან ურთიერთობა ენერგიას მმატებს." },
  { id: 19, trait: "extraversion", reverse: true, textKa: "ადამიანთა დიდ ჯგუფში ყოფნას მარტო ყოფნა მირჩევნია." },
  { id: 20, trait: "extraversion", reverse: false, textKa: "საუბარსა თუ საქმეში ინიციატივას ხშირად მე ვიღებ." },
  { id: 21, trait: "extraversion", reverse: false, textKa: "ხალისიანი და ცოცხალი ხასიათი მაქვს." },
  { id: 22, trait: "extraversion", reverse: true, textKa: "წყნარი და ჩუმი ადამიანი ვარ." },
  { id: 23, trait: "extraversion", reverse: false, textKa: "ყურადღების ცენტრში ყოფნა მახარებს." },
  { id: 24, trait: "extraversion", reverse: false, textKa: "სოციალურ ღონისძიებებზე თავს კომფორტულად ვგრძნობ." },

  // ── Agreeableness ──────────────────────────────────────────────────────
  { id: 25, trait: "agreeableness", reverse: false, textKa: "სხვისი გრძნობები ჩემთვის მნიშვნელოვანია." },
  { id: 26, trait: "agreeableness", reverse: false, textKa: "სხვების განცდებს ადვილად ვუთანაგრძნობ." },
  { id: 27, trait: "agreeableness", reverse: false, textKa: "ვცდილობ, ყველას კეთილად და პატივისცემით მოვექცე." },
  { id: 28, trait: "agreeableness", reverse: true, textKa: "ზოგჯერ ცივი ან უყურადღებო ვარ სხვების მიმართ." },
  { id: 29, trait: "agreeableness", reverse: false, textKa: "მზად ვარ, გაჭირვებულ ადამიანს დავეხმარო." },
  { id: 30, trait: "agreeableness", reverse: true, textKa: "ხშირად მეპარება ეჭვი ადამიანების ზრახვებში." },
  { id: 31, trait: "agreeableness", reverse: false, textKa: "კონფლიქტის დროს კომპრომისსა და მოლაპარაკებას ვირჩევ." },
  { id: 32, trait: "agreeableness", reverse: false, textKa: "მინდა, ჩემ გარშემო ყველა კარგად იყოს." },

  // ── Neuroticism ────────────────────────────────────────────────────────
  { id: 33, trait: "neuroticism", reverse: false, textKa: "ხშირად ვღელავ ან ვნერვიულობ." },
  { id: 34, trait: "neuroticism", reverse: false, textKa: "ჩემი განწყობა სწრაფად იცვლება." },
  { id: 35, trait: "neuroticism", reverse: true, textKa: "იშვიათად ვგრძნობ სევდას ან დაძაბულობას." },
  { id: 36, trait: "neuroticism", reverse: false, textKa: "მცირე პრობლემებიც კი ადვილად მაწუხებს." },
  { id: 37, trait: "neuroticism", reverse: true, textKa: "სტრესის დროს სიმშვიდეს ვინარჩუნებ." },
  { id: 38, trait: "neuroticism", reverse: false, textKa: "ხშირად ვნერვიულობ, რომ შეიძლება რაღაც ცუდად წავიდეს." },
  { id: 39, trait: "neuroticism", reverse: false, textKa: "თავს ხშირად დაუცველად ან მოწყვლადად ვგრძნობ." },
  { id: 40, trait: "neuroticism", reverse: true, textKa: "ემოციურად სტაბილური და მდგრადი ვარ." },
];

const BIG5_TEXT_EN = [
  "I enjoy exploring new ideas and considering different perspectives.", "I have a vivid imagination.", "I am drawn to art, music and beauty.", "I prefer familiar activities to trying something new.", "I often think about abstract or philosophical questions.", "I am interested in different cultures and ways of life.", "I rarely have creative ideas.", "Curiosity drives me to learn about unfamiliar subjects.",
  "I follow through on my promises.", "I like order and planning ahead.", "I finish what I start before moving to something new.", "I often procrastinate.", "I pay close attention to details.", "My belongings are often disorganized.", "I work with discipline toward my goals.", "I am a dependable and responsible person.",
  "I find it easy to meet new people.", "Interacting with people gives me energy.", "I prefer being alone to spending time in a large group.", "I often take the initiative in conversations or activities.", "I have an energetic and lively manner.", "I am a quiet and reserved person.", "I enjoy being the center of attention.", "I feel comfortable at social events.",
  "Other people's feelings matter to me.", "I empathize easily with what others are experiencing.", "I try to treat everyone with kindness and respect.", "I can sometimes be cold or inattentive toward others.", "I am willing to help someone who is struggling.", "I often question other people's intentions.", "During conflict, I look for compromise and dialogue.", "I want the people around me to be well.",
  "I often feel worried or nervous.", "My mood changes quickly.", "I rarely feel sad or tense.", "Even small problems can upset me easily.", "I remain calm under stress.", "I often worry that something may go wrong.", "I frequently feel vulnerable or insecure.", "I am emotionally stable and resilient.",
];

export const BIG5_QUESTIONS_EN: BigFiveQuestion[] = BIG5_QUESTIONS.map((question, index) => ({
  ...question,
  textEn: BIG5_TEXT_EN[index],
}));

export const BIG5_QUESTION_COUNT = BIG5_QUESTIONS.length;

/** localStorage bridge from the anonymous test into the result flow. */
export const BIG5_ANSWERS_STORAGE_KEY = "vivida_bigfive_answers";
