import { SIGNS } from "@/lib/zodiac";
import {
  ALL_ELEMENT_SLUGS,
  ALL_PAIR_SLUGS,
  ALL_SLUGS,
  ELEMENT_LABEL_KA,
  SIGNS_BY_ELEMENT,
  ZODIAC_DATES,
  type ElementSlug,
  type ZodiacSlug,
} from "./zodiac-dates";

export type CompatibilityLevel = "ძლიერი" | "ჰარმონიული" | "გამომწვევი";
export type CompatibilityScore = CompatibilityLevel;

export function paragraphs(text?: string | null): string[] {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function slugByLabelKa(labelKa: string): ZodiacSlug | undefined {
  return SIGNS.find((s) => s.labelKa === labelKa)?.slug;
}

export type SignContent = {
  slug: ZodiacSlug;
  labelKa: string;
  symbol: string;
  element: string;
  modality: string;
  ruler: string;
  pageTitle: string;
  metaDescription: string;
  tagline: string;
  intro: string;
  personality: string;
  strengths: string[];
  weaknesses: string[];
  love: string;
  loveKa: string;
  career: string;
  careerKa: string;
  compatibility: Array<{ signKa: string; level: CompatibilityLevel; note: string }>;
  famous: string[];
  faq: Array<{ q: string; a: string }>;
};

export const SIGNS_CONTENT: Record<ZodiacSlug, SignContent> = Object.fromEntries(
  SIGNS.map((s) => {
    const love = `სიყვარულში ${s.labelKa} ეძებს ნამდვილ სიახლოვეს, ურთიერთგაგებასა და ემოციურ სანდოობას.`;
    const career = `პროფესიულ სფეროში ${s.labelKa} საუკეთესოდ ვლინდება იქ, სადაც დამოუკიდებლობა, ხედვა და შემოქმედებითი მიდგომა ფასდება.`;
    return [
      s.slug,
      {
        slug: s.slug,
        labelKa: s.labelKa,
        symbol: s.symbol,
        element: s.element,
        modality: s.modality,
        ruler: s.rulerKa,
        pageTitle: `${s.labelKa} — ზოდიაქოს ნიშანი, ხასიათი და თავსებადობა`,
        metaDescription: `${s.labelKa} (${ZODIAC_DATES[s.slug].rangeKa}): ხასიათი, ძლიერი მხარეები, სიყვარული, კარიერა და თავსებადობა სხვა ნიშნებთან.`,
        tagline: `${s.element}ს ${s.modality} ნიშანი, რომელსაც მართავს ${s.rulerKa}.`,
        intro: `${s.labelKa} გამოირჩევა უნიკალური შინაგანი ენერგიითა და თვითგამოხატვის სტილით. მისი მმართველი პლანეტა ${s.rulerKa} განსაზღვრავს იმ ძირითად მოტივაციას, რომლითაც ეს ნიშანი სამყაროს უკავშირდება.`,
        personality: `${s.labelKa} აერთიანებს ${s.element}ს სტიქიის ბუნებრივ იმპულსსა და ${s.modality} მოდალურობის სტრუქტურას. ყოველდღიურ ცხოვრებაში ეს ვლინდება ღრმა ინტუიციით, მიზანდასახულობითა და გულწრფელი ურთიერთობების სურვილით.`,
        strengths: [
          "ავთენტურობა და შინაგანი სიმტკიცე",
          "ერთგულება მნიშვნელოვანი ადამიანების მიმართ",
          "სწრაფი ადაპტაციისა და განვითარების უნარი",
        ],
        weaknesses: [
          "გადაჭარბებული თვითკრიტიკა ან იმპულსურობა დაძაბულ დროს",
          "საკუთარი ემოციების დამალვის ჩვევა",
        ],
        love,
        loveKa: love,
        career,
        careerKa: career,
        compatibility: SIGNS.filter((o) => o.slug !== s.slug)
          .slice(0, 4)
          .map((o, idx) => ({
            signKa: o.labelKa,
            level: (idx % 2 === 0 ? "ძლიერი" : "ჰარმონიული") as CompatibilityLevel,
            note: `${s.labelKa} და ${o.labelKa} ქმნიან საინტერესო და დინამიკურ კავშირს.`,
          })),
        famous: [],
        faq: [
          {
            q: `როდის იწყება ${s.labelKa}-ის ზოდიაქო?`,
            a: `${s.labelKa}-ის პერიოდი მოიცავს თარიღებს: ${ZODIAC_DATES[s.slug].rangeKa}.`,
          },
          {
            q: `რომელი პლანეტა მართავს ${s.labelKa}-ს?`,
            a: `${s.labelKa}-ის მმართველი პლანეტაა ${s.rulerKa}, ხოლო სტიქია — ${s.element}.`,
          },
        ],
      },
    ];
  }),
) as unknown as Record<ZodiacSlug, SignContent>;

export const HUB_CONTENT = {
  pageTitle: "ზოდიაქოს ნიშნები — თარიღები, ხასიათი და თავსებადობა",
  metaDescription:
    "12 ზოდიაქოს ნიშანი ქართულად: თარიღები, სტიქიები, მმართველი პლანეტები, ხასიათი და თავსებადობა.",
  h1: "ზოდიაქოს 12 ნიშანი: სრული გზამკვლევი",
  tagline: "იპოვე შენი ნიშანი, შეისწავლე ოთხი სტიქია და გაიგე, როგორ მუშაობს შენი სრული ნატალური რუკა.",
  intro:
    "ზოდიაქოს წრე თორმეტ თანაბარ სექტორად იყოფა და თითოეული მათგანი ადამიანის გამოცდილების უნიკალურ არქეტიპს გამოხატავს.\n\nმზის ნიშანი შენი ცნობიერი ბირთვია, ხოლო მთვარე და ასცენდენტი სურათს სრულყოფილს ხდის.",
  whatIsZodiac: {
    title: "რა არის ზოდიაქო?",
    body: "ზოდიაქო ეკლიპტიკის გასწვრივ განლაგებული 12 ნიშნის სისტემაა, რომელსაც ასტროლოგია პლანეტების პოზიციების ასახსნელად იყენებს.",
  },
  elements: {
    title: "ოთხი სტიქია: ცეცხლი, მიწა, ჰაერი, წყალი",
    body: "ცეცხლის ნიშნები (ვერძი, ლომი, მშვილდოსანი) მოქმედებითა და შთაგონებით ცხოვრობენ; მიწის ნიშნები (კურო, ქალწული, თხის რქა) სიმყარეს ქმნიან; ჰაერის ნიშნები (ტყუპები, სასწორი, მერწყული) იდეებს აკავშირებენ; წყლის ნიშნები (კირჩხიბი, მორიელი, თევზები) კი ემოციურ სიღრმეს ატარებენ.",
  },
  modalities: {
    title: "სამი მოდალურობა",
    body: "კარდინალური ნიშნები იწყებენ ახალ ციკლებს, ფიქსირებული ნიშნები ამყარებენ და ინარჩუნებენ, ხოლო მუტაბელური ნიშნები ცვლილებასა და ადაპტაციას უწყობენ ხელს.",
  },
  faq: [
    {
      q: "რამდენი ზოდიაქოს ნიშანი არსებობს?",
      a: "ტრადიციულ დასავლურ ასტროლოგიაში 12 ზოდიაქოს ნიშანია, რომლებიც ოთხ სტიქიად იყოფა.",
    },
    {
      q: "რა განსხვავებაა მზის, მთვარისა და ამომავალ ნიშნებს შორის?",
      a: "მზის ნიშანი შენი ძირითადი იდენტობაა, მთვარის ნიშანი — ემოციური რეაქციები, ხოლო ამომავალი ნიშანი (ასცენდენტი) — როგორ გხედავს გარესამყარო.",
    },
  ],
};

export type PairContent = {
  slug: string;
  signA: ZodiacSlug;
  signB: ZodiacSlug;
  labelA: string;
  labelB: string;
  pageTitle: string;
  metaDescription: string;
  overallScore: CompatibilityScore;
  tagline: string;
  intro: string;
  overall: string;
  love: string;
  loveAndRomance: string;
  friendship: string;
  communication: string;
  trustAndValues: string;
  verdict: string;
  strengths: string[];
  challenges: string[];
  advice: string;
  faq: Array<{ q: string; a: string }>;
};

export const PAIRS_CONTENT: Record<string, PairContent> = Object.fromEntries(
  ALL_PAIR_SLUGS.map((slug) => {
    const [a, b] = slug.split("-") as [ZodiacSlug, ZodiacSlug];
    const sa = SIGNS_CONTENT[a];
    const sb = SIGNS_CONTENT[b];
    const sameElement = sa.element === sb.element;
    const score: CompatibilityScore = sameElement
      ? "ძლიერი"
      : (ALL_SLUGS.indexOf(a) + ALL_SLUGS.indexOf(b)) % 2 === 0
        ? "ჰარმონიული"
        : "გამომწვევი";
    const intro = `${sa.labelKa} და ${sb.labelKa} წყვილში ქმნიან დინამიკას, სადაც ${sa.element} და ${sb.element} ერთმანეთს ხვდება.`;
    const loveAndRomance = `რომანტიკულ ურთიერთობაში ${sa.labelKa} და ${sb.labelKa} სწავლობენ ერთმანეთის ტემპისა და ემოციური ენის დაფასებას.`;
    const advice = "მიეცით ერთმანეთს სივრცე თვითგამოხატვისთვის და მოუსმინეთ პარტნიორის საჭიროებებს.";
    return [
      slug,
      {
        slug,
        signA: a,
        signB: b,
        labelA: sa.labelKa,
        labelB: sb.labelKa,
        pageTitle: `${sa.labelKa} და ${sb.labelKa} — თავსებადობა სიყვარულსა და მეგობრობაში`,
        metaDescription: `${sa.labelKa} და ${sb.labelKa}: ზოდიაქოს თავსებადობა, ძლიერი მხარეები, კომუნიკაცია და რჩევები წყვილისთვის.`,
        overallScore: score,
        tagline: `${sa.labelKa} და ${sb.labelKa} ერთმანეთს უნიკალური ენერგიითა და პერსპექტივით ავსებენ.`,
        intro,
        overall: intro,
        love: loveAndRomance,
        loveAndRomance,
        friendship: `მეგობრობაში ${sa.labelKa} და ${sb.labelKa} ქმნიან სანდო და საინტერესო კავშირს, სადაც საერთო იდეები და მხარდაჭერა წინა პლანზეა.`,
        communication: `კომუნიკაცია წყვილს შორის მით უფრო მყარია, რაც უფრო ღიად საუბრობენ საკუთარ მოლოდინებზე.`,
        trustAndValues: `ნდობა და საერთო ღირებულებები ეტაპობრივად, საერთო გამოცდილებით ყალიბდება.`,
        verdict: advice,
        strengths: [
          "ურთიერთშევსება და საერთო ინტერესები",
          "ემოციური გულწრფელობა და ზრდის პოტენციალი",
          "ძლიერი მიზიდულობა და ცოცხალი დიალოგი",
        ],
        challenges: [
          "განსხვავებული ტემპი გადაწყვეტილებების მიღებისას",
          "ემოციების გამოხატვის სხვადასხვა სტილი",
        ],
        advice,
        faq: [
          {
            q: `როგორია ${sa.labelKa} და ${sb.labelKa} თავსებადობა?`,
            a: `${sa.labelKa} და ${sb.labelKa} თავსებადობა ფასდება როგორც ${score}.`,
          },
        ],
      },
    ];
  }),
);

export const COMPATIBILITY_HUB_CONTENT = {
  pageTitle: "ზოდიაქოს ნიშნების თავსებადობა — 78 წყვილის ანალიზი",
  metaDescription: "შეამოწმე ზოდიაქოს ნიშნების თავსებადობა სიყვარულში, მეგობრობასა და ურთიერთობებში.",
  h1: "ზოდიაქოს თავსებადობა",
  tagline: "აირჩიე ორი ნიშანი და ნახე მათი კავშირის ძლიერი მხარეები და დინამიკა.",
  intro: "თავსებადობა მხოლოდ მზის ნიშნებით არ შემოიფარგლება, თუმცა ორი ნიშნის სტიქიებისა და მოდალურობის შედარება შესანიშნავი საწყისი წერტილია.",
  howItWorks: {
    title: "როგორ მუშაობს ზოდიაქოს თავსებადობა",
    body: "ნიშნების შედარებისას ვითვალისწინებთ მათ სტიქიებს, მოდალურობასა და წრეზე კუთხურ დაშორებას.",
  },
  elementsRule: {
    title: "ოთხი სტიქიის კანონზომიერება",
    body: "ცეცხლი და ჰაერი ერთმანეთს აძლიერებს, მიწა და წყალი კი მყარ საყრდენს ქმნის.",
  },
  beyondSun: {
    title: "მზის ნიშნის მიღმა: სრული სინასტრია",
    body: "ნამდვილი სინასტრია ადარებს მთვარის, ვენერას, მარსისა და ასცენდენტის პოზიციებს.",
  },
  faq: [
    {
      q: "რომელი ნიშნები ეწყობიან ერთმანეთს ყველაზე კარგად?",
      a: "ხშირად ერთი და იმავე ან მეგობრული სტიქიის ნიშნები (ცეცხლი-ჰაერი, მიწა-წყალი) ბუნებრივ ჰარმონიას ქმნიან.",
    },
  ],
};

export type PlacementContent = {
  sign: ZodiacSlug;
  labelKa: string;
  symbol: string;
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  emotionalWorld: string;
  emotionalCore: string;
  inRelationships: string;
  love: string;
  needsAndComfort: string;
  firstImpressions: string;
  lifePath: string;
  appearanceAndVibe: string;
  shadow: string;
  compatibility: string;
  famous: string[];
  strengths: string[];
  challenges: string[];
  faq: Array<{ q: string; a: string }>;
};

export const MOONS_CONTENT: Record<ZodiacSlug, PlacementContent> = Object.fromEntries(
  ALL_SLUGS.map((slug) => {
    const s = SIGNS_CONTENT[slug];
    return [
      slug,
      {
        sign: slug,
        labelKa: s.labelKa,
        symbol: s.symbol,
        pageTitle: `მთვარე ${s.labelKa}-ში — ემოციური ბირთვი და ინსტინქტები`,
        metaDescription: `რას ნიშნავს მთვარე ${s.labelKa}-ში: შინაგანი სამყარო, ემოციური საჭიროებები და ურთიერთობები.`,
        h1: `მთვარე ${s.labelKa}-ში`,
        tagline: `შენი ემოციური ბირთვი ${s.element}ს ენერგიით საზრდოობს.`,
        intro: `მთვარე ${s.labelKa}-ში განსაზღვრავს, როგორ რეაგირებ ინსტინქტურად და რა გჭირდება შინაგანი სიმშვიდისთვის.`,
        emotionalWorld: s.personality,
        emotionalCore: s.personality,
        inRelationships: s.love,
        love: s.love,
        needsAndComfort: `სიმშვიდისთვის მნიშვნელოვანია ავთენტური გარემო და ემოციური უსაფრთხოება.`,
        firstImpressions: s.intro,
        lifePath: s.career,
        appearanceAndVibe: s.tagline,
        shadow: s.weaknesses.join(" "),
        compatibility: `საუკეთესოდ ეწყობა იმ ადამიანებს, რომლებიც პატივს სცემენ ${s.element}ს ემოციურ ტემპს.`,
        famous: s.famous,
        strengths: s.strengths,
        challenges: s.weaknesses,
        faq: s.faq,
      },
    ];
  }),
) as unknown as Record<ZodiacSlug, PlacementContent>;

export const RISINGS_CONTENT: Record<ZodiacSlug, PlacementContent> = Object.fromEntries(
  ALL_SLUGS.map((slug) => {
    const s = SIGNS_CONTENT[slug];
    return [
      slug,
      {
        sign: slug,
        labelKa: s.labelKa,
        symbol: s.symbol,
        pageTitle: `${s.labelKa} ასცენდენტი (ამომავალი ნიშანი) — მნიშვნელობა`,
        metaDescription: `რას ნიშნავს ${s.labelKa} ამომავალი ნიშანი ნატალურ რუკაში.`,
        h1: `${s.labelKa} ამომავალი (ასცენდენტი)`,
        tagline: `პირველი შთაბეჭდილება და სოციალური ენერგია ${s.labelKa}-ის სტილში.`,
        intro: `ასცენდენტი ${s.labelKa}-ში აყალიბებს შენს გარეგან სტილსა და ახალ გარემოში შესვლის მანერას.`,
        emotionalWorld: s.personality,
        emotionalCore: s.personality,
        inRelationships: s.love,
        love: s.love,
        needsAndComfort: s.intro,
        firstImpressions: s.personality,
        lifePath: s.career,
        appearanceAndVibe: s.tagline,
        shadow: s.weaknesses.join(" "),
        compatibility: `ურთიერთობებში იზიდავს პარტნიორებს, რომლებიც აბალანსებენ ${s.labelKa}-ის ენერგიას.`,
        famous: s.famous,
        strengths: s.strengths,
        challenges: s.weaknesses,
        faq: s.faq,
      },
    ];
  }),
) as unknown as Record<ZodiacSlug, PlacementContent>;

export const MOON_HUB_CONTENT = {
  pageTitle: "მთვარის ნიშნები ასტროლოგიაში — ემოციური სამყარო",
  metaDescription: "გაიგე რას ნიშნავს მთვარის ნიშანი ნატალურ რუკაში და წაიკითხე 12-ვე ნიშნის აღწერა.",
  h1: "მთვარის ნიშნები",
  tagline: "შენი შინაგანი სამყარო, ინსტინქტები და ემოციური კომფორტი.",
  intro: "მთვარის ნიშანი აჩვენებს, როგორ განიცდი ემოციებს და რა გაძლევს დაცულობის შეგრძნებას.",
  whatItMeans: {
    title: "რას ნიშნავს მთვარის ნიშანი",
    body: "მთვარის ნიშანი გამოხატავს შენს შინაგან ემოციურ რეაქციებს, ინტუიციასა და ქვეცნობიერ ჩვევებს.",
  },
  vsSun: {
    title: "მთვარე და მზე: რა განსხვავებაა",
    body: "მზე შენი ცნობიერი მიზანია, მთვარე კი — ის, რასაც გულით გრძნობ უსაფრთხო გარემოში.",
  },
  howToFind: {
    title: "როგორ გამოვთვალოთ მთვარის ნიშანი",
    body: "მთვარე სწრაფად მოძრაობს და ნიშანს ყოველ 2.5 დღეში იცვლის, ამიტომ ზუსტი თარიღი და საათი მნიშვნელოვანია.",
  },
  faq: HUB_CONTENT.faq,
};

export const RISING_HUB_CONTENT = {
  pageTitle: "ამომავალი ნიშანი (ასცენდენტი) — 12 ნიშნის გზამკვლევი",
  metaDescription: "რა არის ასცენდენტი და როგორ აყალიბებს ის შენს პირველ შთაბეჭდილებასა და სახლების ბადეს.",
  h1: "ამომავალი ნიშანი (ასცენდენტი)",
  tagline: "ნიღაბი და ენერგია, რომლითაც სამყაროს ხვდები.",
  intro: "ასცენდენტი არის ზოდიაქოს ნიშანი, რომელიც შენი დაბადების წუთს აღმოსავლეთ ჰორიზონტზე ამოდიოდა.",
  whatItMeans: {
    title: "რა არის ასცენდენტი",
    body: "ასცენდენტი განსაზღვრავს პირველი სახლის წვერს და მთელი ნატალური რუკის არქიტექტურას.",
  },
  whyBirthTime: {
    title: "რატომ არის საჭირო დაბადების ზუსტი საათი",
    body: "ჰორიზონტზე ახალი ნიშანი საშუალოდ ყოველ ორ საათში ამოდის, ამიტომ ზუსტი დრო გადამწყვეტია.",
  },
  chartRuler: {
    title: "რუკის მმართველი პლანეტა",
    body: "შენი ამომავალი ნიშნის მმართველი პლანეტა მთელი ნატალური რუკის მთავარი გზამკვლევია.",
  },
  faq: HUB_CONTENT.faq,
};

export const BY_DATE_CONTENT = {
  pageTitle: "ზოდიაქოს ნიშნები თარიღების მიხედვით — იპოვე შენი ნიშანი",
  metaDescription: "ზოდიაქოს ნიშნების კალენდარი თვეებისა და რიცხვების მიხედვით.",
  h1: "ზოდიაქოს ნიშნები თარიღით",
  tagline: "აირჩიე დაბადების თვე და რიცხვი შენი მზის ნიშნის სანახავად.",
  intro: "თითოეული ზოდიაქოს ნიშანი წელიწადის დაახლოებით 30-დღიან მონაკვეთს მოიცავს.",
  howItWorks: {
    title: "როგორ განისაზღვრება ზოდიაქოს თარიღები",
    body: "მზის ნიშანი დამოკიდებულია იმაზე, თუ ეკლიპტიკის რომელ სექტორში იმყოფებოდა მზე შენი დაბადების დღეს.",
  },
  cusp: {
    title: "საზღვრისპირა თარიღები (კასპი)",
    body: "თუ ნიშნის შეცვლის დღეს დაიბადე, ზუსტი საათის მითითებით ნატალური რუკა უშეცდომოდ გამოითვლის მზის გრადუსს.",
  },
  beyondSun: {
    title: "მზის ნიშნის მიღმა",
    body: "დაბადების თარიღსა და საათს ერთად შეუძლია აჩვენოს შენი მთვარისა და ამომავალი ნიშნებიც.",
  },
  faq: HUB_CONTENT.faq,
};

export type ElementContent = {
  slug: ElementSlug;
  labelKa: string;
  signs: ZodiacSlug[];
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  personality: string;
  traits: string;
  inLove: string;
  love: string;
  inWork: string;
  career: string;
  compatibility: string;
  balance: string;
  strengths: string[];
  weaknesses: string[];
  challenges: string[];
  faq: Array<{ q: string; a: string }>;
};

export const ELEMENTS_CONTENT: Record<ElementSlug, ElementContent> = Object.fromEntries(
  ALL_ELEMENT_SLUGS.map((el) => {
    const traits = `${ELEMENT_LABEL_KA[el]}ს ნიშნები გამოირჩევიან თავიანთი უნიკალური აღქმითა და მოქმედების სტილით.`;
    const inLove = `ურთიერთობებში ${ELEMENT_LABEL_KA[el]} ეძებს გულწრფელობასა და ბუნებრივ ჰარმონიას.`;
    const inWork = `საქმეში ${ELEMENT_LABEL_KA[el]}ს სტიქია ავლენს მდგრადობასა და შემოქმედებით ხედვას.`;
    const challenges = ["გადაღლა ერთფეროვან გარემოში", "ემოციური გადაჭარბება"];
    return [
      el,
      {
        slug: el,
        labelKa: ELEMENT_LABEL_KA[el],
        signs: SIGNS_BY_ELEMENT[el],
        pageTitle: `${ELEMENT_LABEL_KA[el]}ს ნიშნები ასტროლოგიაში`,
        metaDescription: `${ELEMENT_LABEL_KA[el]}ს სტიქიის ზოდიაქოს ნიშნები, ხასიათი და თავსებადობა.`,
        h1: `${ELEMENT_LABEL_KA[el]}ს სტიქია`,
        tagline: `როგორ მოქმედებს ${ELEMENT_LABEL_KA[el]}ს ენერგია ნატალურ რუკაში.`,
        intro: `${ELEMENT_LABEL_KA[el]}ს სტიქია აერთიანებს სამ ნიშანს და განსაზღვრავს ტემპერამენტის ძირითად ტონს.`,
        personality: traits,
        traits,
        inLove,
        love: inLove,
        inWork,
        career: inWork,
        compatibility: `${ELEMENT_LABEL_KA[el]}ს ნიშნები ბუნებრივ ჰარმონიას პოულობენ მონათესავე სტიქიებთან.`,
        balance: `როცა რუკაში ${ELEMENT_LABEL_KA[el]} დაბალანსებულია, ადამიანი თავდაჯერებულად და ჰარმონიულად მოქმედებს.`,
        strengths: ["ბუნებრივი ინტუიცია", "ძლიერი თვითგამოხატვა", "მდგრადობა"],
        weaknesses: challenges,
        challenges,
        faq: HUB_CONTENT.faq,
      },
    ];
  }),
) as unknown as Record<ElementSlug, ElementContent>;

export const ELEMENTS_HUB_CONTENT = {
  pageTitle: "ზოდიაქოს 4 სტიქია — ცეცხლი, მიწა, ჰაერი, წყალი",
  metaDescription: "გაიგე როგორ აყალიბებს ოთხი სტიქია ზოდიაქოს ნიშნების ხასიათს.",
  h1: "ზოდიაქოს ოთხი სტიქია",
  tagline: "ცეცხლი, მიწა, ჰაერი და წყალი — ასტროლოგიის საბაზისო ენერგიები.",
  intro: HUB_CONTENT.elements.body,
  faq: HUB_CONTENT.faq,
};

export type YearlyContent = {
  sign: ZodiacSlug;
  year: number;
  pageTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  overview: string;
  love: string;
  career: string;
  healthAndEnergy: string;
  keyMonths: Array<{ month: string; note: string }>;
  faq: Array<{ q: string; a: string }>;
};

export const ALL_YEARLY_YEARS = [2026];

export function yearlyContentFor(sign: ZodiacSlug, year: number): YearlyContent | null {
  if (!ALL_YEARLY_YEARS.includes(year)) return null;
  const s = SIGNS_CONTENT[sign];
  if (!s) return null;
  return {
    sign,
    year,
    pageTitle: `${s.labelKa} — ${year} წლის ჰოროსკოპი`,
    metaDescription: `${s.labelKa}-ის ${year} წლის ასტროლოგიური პროგნოზი: სიყვარული, კარიერა, ფინანსები და მთავარი ტენდენციები.`,
    h1: `${s.labelKa}: ${year} წლის ჰოროსკოპი`,
    tagline: `${year} წელი ${s.labelKa}-ისთვის განახლების, პიროვნული ზრდისა და მკაფიო პრიორიტეტების პერიოდია.`,
    overview: `${year} წელს ${s.labelKa} იღებს მნიშვნელოვან შესაძლებლობებს როგორც პირად, ისე პროფესიულ სფეროში.`,
    love: s.love,
    career: s.career,
    healthAndEnergy: "ყურადღება მიაქციე ძილის რეჟიმსა და ემოციურ განტვირთვას.",
    keyMonths: [
      { month: "გაზაფხული", note: "ახალი იდეებისა და ინიციატივების დაწყების დრო." },
      { month: "შემოდგომა", note: "შედეგების შეჯამება და ურთიერთობების გამყარება." },
    ],
    faq: s.faq,
  };
}
