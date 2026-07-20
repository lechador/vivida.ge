/**
 * The Big Five (OCEAN) personality test item bank.
 *
 * The Big Five is the scientific gold-standard model of personality — five
 * broad, largely independent traits: Openness, Conscientiousness,
 * Extraversion, Agreeableness, Neuroticism. Unlike the EQ test, the traits are
 * BIPOLAR — neither pole is "better", so there is no overall score, just a
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
  taglineKa: string;
  glyph: string;
  hue: string;
};

export type BigFiveQuestion = {
  id: number;
  trait: BigFiveTraitKey;
  textKa: string;
  /** Reverse-keyed: agreement indicates a LOWER level of the trait. */
  reverse: boolean;
};

/** 5-point agreement scale. */
export const BIG5_LIKERT: { value: number; labelKa: string }[] = [
  { value: 1, labelKa: "სრულიად არ ვეთანხმები" },
  { value: 2, labelKa: "არ ვეთანხმები" },
  { value: 3, labelKa: "ნეიტრალურად" },
  { value: 4, labelKa: "ვეთანხმები" },
  { value: 5, labelKa: "სრულიად ვეთანხმები" },
];

export const BIG5_TRAITS: BigFiveTrait[] = [
  {
    key: "openness",
    letter: "O",
    nameKa: "ღიაობა",
    taglineKa: "წარმოსახვა, ცნობისმოყვარეობა, ახლის ძიება",
    glyph: "🎨",
    hue: "oklch(0.78 0.18 305)",
  },
  {
    key: "conscientiousness",
    letter: "C",
    nameKa: "კეთილსინდისიერება",
    taglineKa: "ორგანიზებულობა, დისციპლინა, პასუხისმგებლობა",
    glyph: "📐",
    hue: "oklch(0.80 0.15 200)",
  },
  {
    key: "extraversion",
    letter: "E",
    nameKa: "ექსტრავერსია",
    taglineKa: "სოციალურობა, ენერგიულობა, თავდაჯერებულობა",
    glyph: "⚡",
    hue: "oklch(0.82 0.16 85)",
  },
  {
    key: "agreeableness",
    letter: "A",
    nameKa: "კეთილგანწყობა",
    taglineKa: "თანაგრძნობა, ნდობა, თანამშრომლობა",
    glyph: "🤲",
    hue: "oklch(0.75 0.20 350)",
  },
  {
    key: "neuroticism",
    letter: "N",
    nameKa: "ნევროტიზმი",
    taglineKa: "ემოციური მგრძნობელობა, სტრესისადმი მიდრეკილება",
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
  { id: 1, trait: "openness", reverse: false, textKa: "მიყვარს ახალი იდეებისა და აზრების გამოკვლევა." },
  { id: 2, trait: "openness", reverse: false, textKa: "მდიდარი წარმოსახვა მაქვს." },
  { id: 3, trait: "openness", reverse: false, textKa: "მიზიდავს ხელოვნება, მუსიკა და სილამაზე." },
  { id: 4, trait: "openness", reverse: true, textKa: "ვამჯობინებ ჩვეულ, ნაცნობ საქმეებს ახლის ცდას." },
  { id: 5, trait: "openness", reverse: false, textKa: "ხშირად ვფიქრობ აბსტრაქტულ ან ფილოსოფიურ საკითხებზე." },
  { id: 6, trait: "openness", reverse: false, textKa: "მაინტერესებს განსხვავებული კულტურები და ცხოვრების წესები." },
  { id: 7, trait: "openness", reverse: true, textKa: "იშვიათად მებადება შემოქმედებითი იდეები." },
  { id: 8, trait: "openness", reverse: false, textKa: "ცნობისმოყვარეობა ბევრი რამის შესწავლისკენ მიბიძგებს." },

  // ── Conscientiousness ──────────────────────────────────────────────────
  { id: 9, trait: "conscientiousness", reverse: false, textKa: "ყოველთვის ვასრულებ იმას, რასაც დავპირდები." },
  { id: 10, trait: "conscientiousness", reverse: false, textKa: "მიყვარს წესრიგი და წინასწარ დაგეგმვა." },
  { id: 11, trait: "conscientiousness", reverse: false, textKa: "საქმეს ბოლომდე მიმყავს, სანამ ახალს დავიწყებ." },
  { id: 12, trait: "conscientiousness", reverse: true, textKa: "ხშირად ვაჭიანურებ საქმეებს." },
  { id: 13, trait: "conscientiousness", reverse: false, textKa: "დეტალებს ყურადღებით ვეკიდები." },
  { id: 14, trait: "conscientiousness", reverse: true, textKa: "ჩემი ნივთები ხშირად არეულია." },
  { id: 15, trait: "conscientiousness", reverse: false, textKa: "მიზნის მისაღწევად დისციპლინას ვიჩენ." },
  { id: 16, trait: "conscientiousness", reverse: false, textKa: "სანდო და პასუხისმგებლიანი ადამიანი ვარ." },

  // ── Extraversion ───────────────────────────────────────────────────────
  { id: 17, trait: "extraversion", reverse: false, textKa: "ადვილად ვეცნობი ახალ ადამიანებს." },
  { id: 18, trait: "extraversion", reverse: false, textKa: "ხალხთან ურთიერთობა ენერგიას მმატებს." },
  { id: 19, trait: "extraversion", reverse: true, textKa: "დიდ კომპანიას მარტო ყოფნას ვამჯობინებ." },
  { id: 20, trait: "extraversion", reverse: false, textKa: "ხშირად ვიღებ ინიციატივას საუბარსა თუ საქმეში." },
  { id: 21, trait: "extraversion", reverse: false, textKa: "ხალისიანი და ცოცხალი ხასიათი მაქვს." },
  { id: 22, trait: "extraversion", reverse: true, textKa: "წყნარი და ჩუმი ადამიანი ვარ." },
  { id: 23, trait: "extraversion", reverse: false, textKa: "ყურადღების ცენტრში ყოფნა მახარებს." },
  { id: 24, trait: "extraversion", reverse: false, textKa: "სოციალურ ღონისძიებებზე თავს კომფორტულად ვგრძნობ." },

  // ── Agreeableness ──────────────────────────────────────────────────────
  { id: 25, trait: "agreeableness", reverse: false, textKa: "სხვისი გრძნობები ჩემთვის მნიშვნელოვანია." },
  { id: 26, trait: "agreeableness", reverse: false, textKa: "ადვილად ვთანაუგრძნობ ადამიანებს." },
  { id: 27, trait: "agreeableness", reverse: false, textKa: "ვცდილობ, ყველას კეთილად და პატივისცემით მოვექცე." },
  { id: 28, trait: "agreeableness", reverse: true, textKa: "ზოგჯერ ცივი ან უყურადღებო ვარ სხვების მიმართ." },
  { id: 29, trait: "agreeableness", reverse: false, textKa: "მზად ვარ, დავეხმარო მას, ვინც გაჭირვებაშია." },
  { id: 30, trait: "agreeableness", reverse: true, textKa: "ხშირად მეპარება ეჭვი ადამიანების ზრახვებში." },
  { id: 31, trait: "agreeableness", reverse: false, textKa: "კონფლიქტს კომპრომისსა და მოლაპარაკებას ვამჯობინებ." },
  { id: 32, trait: "agreeableness", reverse: false, textKa: "მინდა, ჩემ გარშემო ყველა კარგად იყოს." },

  // ── Neuroticism ────────────────────────────────────────────────────────
  { id: 33, trait: "neuroticism", reverse: false, textKa: "ხშირად ვღელავ ან ვნერვიულობ." },
  { id: 34, trait: "neuroticism", reverse: false, textKa: "ჩემი განწყობა სწრაფად იცვლება." },
  { id: 35, trait: "neuroticism", reverse: true, textKa: "იშვიათად ვგრძნობ სევდას ან დაძაბულობას." },
  { id: 36, trait: "neuroticism", reverse: false, textKa: "მცირე პრობლემებიც კი ადვილად მაწუხებს." },
  { id: 37, trait: "neuroticism", reverse: true, textKa: "სტრესის დროს სიმშვიდეს ვინარჩუნებ." },
  { id: 38, trait: "neuroticism", reverse: false, textKa: "ხშირად ვღელავ იმაზე, რაც შეიძლება ცუდად წავიდეს." },
  { id: 39, trait: "neuroticism", reverse: false, textKa: "თავს ხშირად დაუცველად ან მოწყვლადად ვგრძნობ." },
  { id: 40, trait: "neuroticism", reverse: true, textKa: "ემოციურად სტაბილური და მდგრადი ვარ." },
];

export const BIG5_QUESTION_COUNT = BIG5_QUESTIONS.length;

/** localStorage bridge from the anonymous test into the result flow. */
export const BIG5_ANSWERS_STORAGE_KEY = "vivida_bigfive_answers";
