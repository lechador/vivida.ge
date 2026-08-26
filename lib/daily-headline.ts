import type { AspectKind } from "@/lib/aspects";
import type { UserLocale } from "@/lib/i18n/locale";

type MoonAspect = {
  transit: string;
  natal: string;
  kind: string;
};

export type DailyHeadlineFacts = {
  moon: {
    sign: string;
    house: number | null;
    aspects: MoonAspect[];
  };
};

type Topic = {
  nominative: string;
  dative: string;
  genitive: string;
};

/**
 * Plain-language subjects for the natal point touched by today's Moon.
 *
 * The transit library's original titles leaned heavily on the same abstract
 * vocabulary ("soul", "heart", "inner..."). These forms let the product
 * headline name the actual life topic instead, while keeping Georgian case
 * endings natural across several editorial structures.
 */
const TOPIC_KA: Record<string, Topic> = {
  sun: {
    nominative: "საკუთარი სურვილი",
    dative: "საკუთარ სურვილს",
    genitive: "საკუთარი სურვილის",
  },
  moon: {
    nominative: "ემოციური რეაქცია",
    dative: "ემოციურ რეაქციას",
    genitive: "ემოციური რეაქციის",
  },
  mercury: {
    nominative: "მნიშვნელოვანი საუბარი",
    dative: "მნიშვნელოვან საუბარს",
    genitive: "მნიშვნელოვანი საუბრის",
  },
  venus: {
    nominative: "ახლო ურთიერთობა",
    dative: "ახლო ურთიერთობას",
    genitive: "ახლო ურთიერთობის",
  },
  mars: {
    nominative: "შემდეგი ნაბიჯი",
    dative: "შემდეგ ნაბიჯს",
    genitive: "შემდეგი ნაბიჯის",
  },
  jupiter: {
    nominative: "დიდი გეგმა",
    dative: "დიდ გეგმას",
    genitive: "დიდი გეგმის",
  },
  saturn: {
    nominative: "მთავარი ვალდებულება",
    dative: "მთავარ ვალდებულებას",
    genitive: "მთავარი ვალდებულების",
  },
  uranus: {
    nominative: "მოულოდნელი ცვლილება",
    dative: "მოულოდნელ ცვლილებას",
    genitive: "მოულოდნელი ცვლილების",
  },
  neptune: {
    nominative: "ინტუიცია",
    dative: "ინტუიციას",
    genitive: "ინტუიციის",
  },
  pluto: {
    nominative: "ღრმა ცვლილება",
    dative: "ღრმა ცვლილებას",
    genitive: "ღრმა ცვლილების",
  },
  chiron: {
    nominative: "ძველი გაკვეთილი",
    dative: "ძველ გაკვეთილს",
    genitive: "ძველი გაკვეთილის",
  },
  ascendant: {
    nominative: "საკუთარი თავის გამოჩენა",
    dative: "საკუთარი თავის გამოჩენას",
    genitive: "საკუთარი თავის გამოჩენის",
  },
  midheaven: {
    nominative: "პროფესიული ნაბიჯი",
    dative: "პროფესიულ ნაბიჯს",
    genitive: "პროფესიული ნაბიჯის",
  },
};

const ASPECT_KINDS = new Set<AspectKind>([
  "conjunction",
  "sextile",
  "square",
  "trine",
  "opposition",
]);

function isAspectKind(value: string): value is AspectKind {
  return ASPECT_KINDS.has(value as AspectKind);
}

const ASPECT_HEADLINES_KA: Record<
  string,
  Record<AspectKind, string[]>
> = {
  sun: {
    conjunction: ["საკუთარი სურვილი წინ გამოდის", "დღეს არჩევანი შენზეა"],
    sextile: ["საკუთარი სურვილის თქმა მარტივდება", "პატარა ინიციატივა თავდაჯერებას შეგმატებს"],
    square: ["სურვილსა და რეალობას შორის პაუზაა საჭირო", "საკუთარი სიმართლის დამტკიცებას ნუ იჩქარებ"],
    trine: ["თავდაჯერება დღეს შენს მხარესაა", "საკუთარი სურვილი ბუნებრივად იკვეთება"],
    opposition: ["შენი სურვილი სხვების მოლოდინებს ეჯახება", "გადაწყვეტილებამდე ორივე მხარეს შეხედე"],
  },
  moon: {
    conjunction: ["ემოციები ზედაპირზე ამოდის", "დღეს საკუთარ რეაქციას კარგად დააკვირდი"],
    sextile: ["გრძნობების გამოხატვა მარტივდება", "საკუთარ თავთან შეთანხმება ახლოსაა"],
    square: ["პირველ ემოციურ რეაქციას ნუ აჰყვები", "განწყობას გადაწყვეტილების უფლება ნუ მისცემ"],
    trine: ["ემოციური სიმშვიდე არჩევანს ამარტივებს", "დღეს საკუთარ რიტმს კარგად გრძნობ"],
    opposition: ["ერთი გრძნობა მეორეს ეწინააღმდეგება", "ემოციებსა და მოვალეობას შორის ბალანსი იპოვე"],
  },
  mercury: {
    conjunction: ["მნიშვნელოვანი საუბრის დროა", "ერთი აზრი ყურადღებას ითხოვს"],
    sextile: ["ერთი საუბარი ბევრს გაარკვევს", "სათქმელი დღეს ადვილად ლაგდება"],
    square: ["პასუხის გაცემას ნუ იჩქარებ", "სიტყვები დღეს მეტ სიფრთხილეს ითხოვს"],
    trine: ["სწორი სიტყვები თავისით მოდის", "აზრის დალაგება დღეს მარტივია"],
    opposition: ["საუბარში ორივე მხარეს მოუსმინე", "გრძნობა და ლოგიკა სხვადასხვა პასუხს გაძლევს"],
  },
  venus: {
    conjunction: ["ურთიერთობა ყურადღების ცენტრშია", "დღეს სიახლოვეს ვერ გადადებ"],
    sextile: ["შეთანხმება დღეს უფრო მარტივია", "პატარა ჟესტი ურთიერთობას გაათბობს"],
    square: ["სიამოვნებისთვის ზედმეტს ნუ დათმობ", "ურთიერთობაში მოლოდინები გადაამოწმე"],
    trine: ["ურთიერთობაში სიმარტივე ბრუნდება", "სითბოს გამოხატვა დღეს მარტივია"],
    opposition: ["სიახლოვესა და სივრცეს შორის ბალანსია საჭირო", "ურთიერთობაში მხოლოდ ერთ მხარეს ნუ დაინახავ"],
  },
  mars: {
    conjunction: ["მოქმედების დროა", "ენერგიას ერთი მიმართულება მიეცი"],
    sextile: ["პირველი ნაბიჯი დღეს მარტივია", "მცირე მოქმედება დიდ ბიძგს მოგცემს"],
    square: ["რეაქციამდე ათამდე დაითვალე", "ენერგიას კონფლიქტში ნუ დახარჯავ"],
    trine: ["საქმე სწრაფად იძვრის", "ენერგია დღეს შენს მხარესაა"],
    opposition: ["მოქმედებამდე წინააღმდეგობას მოუსმინე", "ძალას სწორი მიმართულება სჭირდება"],
  },
  jupiter: {
    conjunction: ["დიდი გეგმა წინ გამოდის", "შესაძლებლობას მასშტაბი ემატება"],
    sextile: ["დღეს მეტი შესაძლებლობა ჩანს", "პატარა ნაბიჯი დიდ გეგმას წაადგება"],
    square: ["დიდ დაპირებას დეტალებიც დაუმატე", "ოპტიმიზმმა რისკი არ დაგაფაროს"],
    trine: ["დიდ სურათში გზა ნათლად ჩანს", "ზრდისთვის კარგი სივრცე იხსნება"],
    opposition: ["მეტი ყოველთვის უკეთესს არ ნიშნავს", "დიდ გეგმასა და რეალურ რესურსს შორის ბალანსი იპოვე"],
  },
  saturn: {
    conjunction: ["ვალდებულებას ვეღარ გადადებ", "დღეს წესრიგი პირველ ადგილზეა"],
    sextile: ["დისციპლინა საქმეს გაგიმარტივებს", "პატარა გეგმა დიდ დატვირთვას შეამსუბუქებს"],
    square: ["საზღვრები მოთმინებას გთხოვს", "ყველაფრის ერთდროულად ტარებას ნუ ეცდები"],
    trine: ["თანმიმდევრობა შედეგს მოიტანს", "სიმშვიდე და წესრიგი შენს მხარესაა"],
    opposition: ["მოვალეობასა და სურვილს შორის არჩევანია", "სხვის მოთხოვნებს შენი საზღვრებიც დაუპირისპირე"],
  },
  uranus: {
    conjunction: ["მოულოდნელი ცვლილება იწყება", "უჩვეულო იდეას ადგილი სჭირდება"],
    sextile: ["ახალი მიდგომა საქმეს გაგიმარტივებს", "მოულოდნელი შანსი გამოიყენე"],
    square: ["ცვლილებას იმპულსურად ნუ აჰყვები", "მოულოდნელობამ გეგმას ნუ აგირევს"],
    trine: ["უჩვეულო იდეა კარგად იმუშავებს", "ცვლილება დღეს თავისუფლებას გაძლევს"],
    opposition: ["თავისუფლებასა და სტაბილურობას შორის ბალანსია", "მოულოდნელ რეაქციას დრო მიეცი"],
  },
  neptune: {
    conjunction: ["ინტუიცია ხმას იმაღლებს", "დღეს ფაქტი და წარმოსახვა გაარჩიე"],
    sextile: ["ინტუიცია სწორ მინიშნებას გაძლევს", "რბილი მიდგომა უკეთ იმუშავებს"],
    square: ["ბუნდოვან პასუხს გადაწყვეტილებად ნუ მიიღებ", "ფაქტები კიდევ ერთხელ გადაამოწმე"],
    trine: ["ინტუიცია დღეს შენს მხარესაა", "შემოქმედებითი პასუხი ადვილად მოდის"],
    opposition: ["ოცნებას რეალობის შემოწმება სჭირდება", "თანაგრძნობამ საკუთარი საზღვრები არ დაგავიწყოს"],
  },
  pluto: {
    conjunction: ["ღრმა ცვლილება იწყება", "მთავარ საკითხს ვეღარ გაექცევი"],
    sextile: ["სიმართლის დანახვა ძალას გაძლევს", "პატარა ცვლილებას დიდი ეფექტი ექნება"],
    square: ["კონტროლის სურვილს ნუ აჰყვები", "ძლიერ რეაქციას მოქმედებამდე დააკვირდი"],
    trine: ["რთული ცვლილება ძალად გარდაიქმნება", "დღეს სიღრმე შენს მხარესაა"],
    opposition: ["ძალის გადანაწილება აუცილებელია", "კონტროლსა და ნდობას შორის ბალანსი იპოვე"],
  },
  chiron: {
    conjunction: ["ძველი ტკივილი თავს გახსენებს", "მგრძნობიარე თემას ყურადღება სჭირდება"],
    sextile: ["ძველი გამოცდილება ახალ პასუხს გაძლევს", "გულწრფელი საუბარი შემსუბუქებას მოიტანს"],
    square: ["ძველ ტკივილს დღევანდელი არჩევანი ნუ უკარნახებს", "მგრძნობიარე თემას ნელა მიუახლოვდი"],
    trine: ["ძველი გამოცდილება დღეს გეხმარება", "საკუთარი სისუსტის მიღება ძალას გაძლევს"],
    opposition: ["სხვის რეაქციაში ძველი ტკივილი ჩანს", "თანაგრძნობასა და თვითდაცვას შორის ბალანსი იპოვე"],
  },
  ascendant: {
    conjunction: ["დღეს შენი გამოჩენის დროა", "პირველი შთაბეჭდილება ყურადღებას იქცევს"],
    sextile: ["საკუთარი თავის ჩვენება მარტივდება", "პატარა ინიციატივა თავდაჯერებას შეგმატებს"],
    square: ["გარეგნულ რეაქციას ნუ აჰყვები", "საკუთარი თავის დამტკიცებას ნუ იჩქარებ"],
    trine: ["თავდაჯერება ბუნებრივად ჩანს", "დღეს შენი სტილი კარგად მუშაობს"],
    opposition: ["შენი იმიჯი სხვის რეაქციას ეჯახება", "საკუთარ თავს სხვისი თვალითაც შეხედე"],
  },
  midheaven: {
    conjunction: ["პროფესიული ნაბიჯის დროა", "საქმე ყურადღების ცენტრშია"],
    sextile: ["კარიერაში პატარა გზა იხსნება", "საქმიანი საუბარი შედეგს მოიტანს"],
    square: ["სამსახურის წნეხს სახლში ნუ წამოიღებ", "პროფესიულ ნაბიჯს მეტი სიფრთხილე სჭირდება"],
    trine: ["საქმეში პროგრესი ბუნებრივად მოდის", "დღეს შენი შრომა კარგად ჩანს"],
    opposition: ["საქმესა და პირად ცხოვრებას ბალანსი სჭირდება", "რეპუტაციისთვის საკუთარ სურვილს ნუ დათმობ"],
  },
};

function genericAspectHeadlineVariants(topic: Topic, kind: AspectKind): string[] {
  switch (kind) {
    case "conjunction":
      return [
        `${topic.nominative} ყურადღების ცენტრშია`,
        `დღეს ${topic.dative} ვერ გადადებ`,
        `${topic.genitive} დროა`,
      ];
    case "sextile":
      return [
        `${topic.nominative} უფრო მარტივად ლაგდება`,
        `დღეს ${topic.dative} გზა ეხსნება`,
        `პატარა ნაბიჯი ${topic.dative} წაადგება`,
      ];
    case "square":
      return [
        `${topic.nominative} მოთმინებას ითხოვს`,
        `${topic.dative} მეტი სიფრთხილე სჭირდება`,
        `${topic.genitive} გამო ნუ იჩქარებ`,
      ];
    case "trine":
      return [
        `${topic.nominative} შენს მხარეს მუშაობს`,
        `${topic.genitive} დალაგება ბუნებრივად გამოდის`,
        `დღეს ${topic.dative} მეტი სივრცე აქვს`,
      ];
    case "opposition":
      return [
        `${topic.nominative} ბალანსს ითხოვს`,
        `${topic.genitive} ორი მხარე ჩანს`,
        `დღეს ${topic.dative} სხვა კუთხით შეხედე`,
      ];
  }
}

function aspectHeadlineVariants(
  natal: string,
  topic: Topic,
  kind: AspectKind,
): string[] {
  return ASPECT_HEADLINES_KA[natal]?.[kind]
    ?? genericAspectHeadlineVariants(topic, kind);
}

const HOUSE_HEADLINES_KA: Record<number, string[]> = {
  1: ["დღეს საკუთარი თავი წინ გამოდის", "შენი რეაქცია ბევრს ამბობს"],
  2: ["რესურსებს მშვიდად გადახედე", "ფულთან სიცხადე პატარა ნაბიჯით იწყება"],
  3: ["ერთი საუბარი ბევრს გაარკვევს", "დღეს სიტყვებს მეტი წონა აქვს"],
  4: ["სახლი მეტ ყურადღებას ითხოვს", "მყუდროება დღეს შენით იწყება"],
  5: ["სიამოვნებას ადგილი დაუთმე", "შემოქმედებით იდეას გამოცდა სჭირდება"],
  6: ["პატარა საქმეები ჯერ დაალაგე", "სხეულის რიტმს ყურადღებით მოუსმინე"],
  7: ["პარტნიორის რეაქციას დააკვირდი", "ურთიერთობაში პასუხი საუბარს მოაქვს"],
  8: ["რთული თემა ზედაპირზე ამოდის", "სიღრმეში ჩასვლა სიცხადეს მოიტანს"],
  9: ["ახალი ხედვა გზას ცვლის", "დღეს ნაცნობ საზღვრებს გასცდი"],
  10: ["საქმე და რეპუტაცია წინ გამოდის", "პროფესიულ ნაბიჯს ნუ გადადებ"],
  11: ["სწორი ადამიანები გზას გაჩვენებენ", "სამომავლო გეგმას გუნდური ძალა სჭირდება"],
  12: ["დღეს სიმშვიდეს მეტი ფასი აქვს", "პასუხი სიჩუმეში უფრო კარგად ჩანს"],
};

const SIGN_HEADLINES_KA: Record<string, string[]> = {
  aries: ["აჩქარებამდე მიმართულება აირჩიე", "პირველი ნაბიჯი დღეს შენზეა"],
  taurus: ["მარტივი რიტმი უკეთ იმუშავებს", "სტაბილურობას პატარა ნაბიჯი ქმნის"],
  gemini: ["ერთი საუბარი ახალ გზას ხსნის", "ცნობისმოყვარეობა დღეს გეხმარება"],
  cancer: ["ჯერ საკუთარ სიმშვიდეს მიხედე", "ახლობლებთან გულწრფელობა დაგაახლოებს"],
  leo: ["საკუთარ იდეას ადგილი დაუთმე", "დღეს გამოჩენა არ დამალო"],
  virgo: ["პატარა დეტალი დიდ სხვაობას ქმნის", "დღე წესრიგის აღდგენას გთხოვს"],
  libra: ["სწორი ბალანსი საუბარში იპოვე", "გადაწყვეტილებამდე ორივე მხარეს შეხედე"],
  scorpio: ["რთულ თემას პირდაპირ შეხედე", "სიღრმე დღეს შენს მხარესაა"],
  sagittarius: ["ნაცნობ ჩარჩოს ერთი ნაბიჯით გასცდი", "დიდ სურათს კიდევ ერთხელ შეხედე"],
  capricorn: ["მთავარ საქმეს მშვიდად მიჰყევი", "შედეგს დღეს თანმიმდევრობა მოიტანს"],
  aquarius: ["უჩვეულო იდეას შანსი მიეცი", "სხვა ხედვა საჭირო პასუხს გაჩვენებს"],
  pisces: ["ინტუიციას ფაქტებიც შეუწყვე", "დღეს რბილი მიდგომა უკეთ მუშაობს"],
};

function stableIndex(seed: string, size: number): number {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % size;
}

function pick<T>(items: readonly T[], seed: string): T {
  return items[stableIndex(seed, items.length)];
}

function leadMoonAspect(aspects: MoonAspect[]): MoonAspect | null {
  return aspects.find((aspect) => aspect.transit === "moon") ?? null;
}

/**
 * Build a short Georgian product headline from the actual daily driver.
 * The date is part of the seed, so a recurring transit rotates through
 * different editorial structures instead of showing one library title for
 * every occurrence and every user forever.
 */
export function dailyHeadlineKa(
  facts: DailyHeadlineFacts,
  dateKey: string,
  fallback: string,
): string {
  const aspect = leadMoonAspect(facts.moon.aspects);
  const topic = aspect ? TOPIC_KA[aspect.natal] : null;
  if (aspect && topic && isAspectKind(aspect.kind)) {
    const variants = aspectHeadlineVariants(aspect.natal, topic, aspect.kind);
    return pick(
      variants,
      `${dateKey}:${facts.moon.sign}:${facts.moon.house ?? "-"}:${aspect.kind}:${aspect.natal}`,
    );
  }

  const houseVariants = facts.moon.house
    ? HOUSE_HEADLINES_KA[facts.moon.house]
    : null;
  if (houseVariants) {
    return pick(houseVariants, `${dateKey}:house:${facts.moon.house}`);
  }

  const signVariants = SIGN_HEADLINES_KA[facts.moon.sign];
  return signVariants
    ? pick(signVariants, `${dateKey}:sign:${facts.moon.sign}`)
    : fallback;
}

const EMAIL_ASPECT_KA: Record<AspectKind, (topic: Topic) => string[]> = {
  conjunction: (topic) => [
    `რა სჭირდება დღეს ${topic.dative}?`,
    `დღეს მთავარი თემა: ${topic.nominative}`,
  ],
  sextile: (topic) => [
    "სად გეხსნება დღეს მარტივი გზა?",
    `${topic.nominative} — შანსი, რომლის გამოყენებაც ღირს`,
  ],
  square: (topic) => [
    "სად ღირს დღეს ტემპის შენელება?",
    `${topic.nominative}: ნუ იჩქარებ პასუხს`,
  ],
  trine: (topic) => [
    "რა გამოგივა დღეს უფრო მარტივად?",
    `${topic.nominative} დღეს შენს მხარესაა`,
  ],
  opposition: (topic) => [
    "სად დაგჭირდება დღეს ბალანსი?",
    `${topic.nominative}: ჯერ ორივე მხარეს შეხედე`,
  ],
};

const EMAIL_HOUSE_KA: Record<number, string> = {
  1: "დღეს ყურადღება საკუთარ თავზე გადადის",
  2: "რას გეუბნება დღე ფულსა და რესურსებზე?",
  3: "რომელი საუბარი შეცვლის დღევანდელ ტონს?",
  4: "სახლსა და ახლობლებს დღეს შენი ყურადღება სჭირდება",
  5: "რა მოგანიჭებს დღეს ნამდვილ სიამოვნებას?",
  6: "რომელი პატარა საქმეა დღეს პირველ ადგილზე?",
  7: "რას გაჩვენებს დღეს ახლო ურთიერთობა?",
  8: "რომელი რთული თემა ითხოვს გულწრფელ პასუხს?",
  9: "სად გჭირდება დღეს უფრო ფართო ხედვა?",
  10: "რომელი პროფესიული ნაბიჯი არ უნდა გადადო?",
  11: "ვინ დაგეხმარება დღეს წინსვლაში?",
  12: "რატომ გჭირდება დღეს მეტი სიმშვიდე?",
};

export type DailyEmailSubjectInput = {
  firstName: string | null;
  headline: string;
  dateKey: string;
  locale: UserLocale;
  topAspects?: MoonAspect[] | null;
  moonHouse?: number | null;
};

/** Email gets its own hook; the dashboard headline is not copied verbatim. */
export function dailyEmailSubject(input: DailyEmailSubjectInput): string {
  if (input.locale === "en") return `Today for you: ${input.headline}`;
  if (input.locale !== "ka") return input.headline;

  const aspect = leadMoonAspect(input.topAspects ?? []);
  const topic = aspect ? TOPIC_KA[aspect.natal] : null;
  let subject: string;

  if (aspect && topic && isAspectKind(aspect.kind)) {
    subject = pick(
      EMAIL_ASPECT_KA[aspect.kind](topic),
      `${input.dateKey}:email:${aspect.kind}:${aspect.natal}`,
    );
  } else if (input.moonHouse && EMAIL_HOUSE_KA[input.moonHouse]) {
    subject = EMAIL_HOUSE_KA[input.moonHouse];
  } else {
    subject = `რას გეუბნება დღევანდელი პროგნოზი?`;
  }

  return input.firstName ? `${input.firstName}, ${subject}` : subject;
}
