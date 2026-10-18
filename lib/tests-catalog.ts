export type TestCatalogEntry = {
  slug: string;
  kind: "featured" | "quiz";
  href: string;
  available: boolean;
  locales?: readonly ("ka" | "en")[];
  titleKa: string;
  titleEn: string;
  taglineKa: string;
  taglineEn: string;
  descKa: string;
  descEn: string;
  metaKa: string;
  metaEn: string;
};

export const TESTS: TestCatalogEntry[] = [
  {
    slug: "astro-mbti",
    kind: "featured",
    href: "/pirovnebis-testi",
    available: true,
    locales: ["ka", "en"],
    titleKa: "Astro-MBTI პიროვნების ტესტი",
    titleEn: "Astro-MBTI Personality Assessment",
    taglineKa: "16 ფსიქოლოგიური ტიპი და კოსმიური არქეტიპი",
    taglineEn: "16 psychological types paired with your cosmic archetype",
    descKa:
      "გაიგე შენი 4-ასოიანი MBTI კოდი, ძლიერი მხარეები, ურთიერთობის სტილი და კარიერული მიმართულება.",
    descEn:
      "Discover your 4-letter personality code, cognitive preferences, relationship style, and natural strengths.",
    metaKa: "36 კითხვა · ~5 წუთი",
    metaEn: "36 questions · ~5 min",
  },
  {
    slug: "big-five",
    kind: "featured",
    href: "/big-five",
    available: true,
    locales: ["ka", "en"],
    titleKa: "Big Five (დიდი ხუთეული)",
    titleEn: "Big Five Personality Traits",
    taglineKa: "პიროვნების 5 ფუნდამენტური განზომილება",
    taglineEn: "The five core dimensions of human personality",
    descKa:
      "მეცნიერულად ყველაზე აღიარებული პიროვნების მოდელი: ღიაობა, კეთილსინდისიერება, ექსტრავერსია, კეთილგანწყობა და ნეიროტიციზმი.",
    descEn:
      "Measure Openness, Conscientiousness, Extraversion, Agreeableness, and Emotional Sensitivity with clear percentile scores.",
    metaKa: "50 კითხვა · ~6 წუთი",
    metaEn: "50 questions · ~6 min",
  },
  {
    slug: "eq",
    kind: "featured",
    href: "/eq-testi",
    available: true,
    locales: ["ka", "en"],
    titleKa: "ემოციური ინტელექტის (EQ) ტესტი",
    titleEn: "Emotional Intelligence (EQ) Test",
    taglineKa: "ემპათია, თვითრეგულაცია და სოციალური უნარები",
    taglineEn: "Self-awareness, regulation, empathy, and social skill",
    descKa:
      "შეაფასე როგორ კითხულობ საკუთარ და სხვების ემოციებს და როგორ მართავ რთულ სიტუაციებს.",
    descEn:
      "Explore how you recognize, regulate, and respond to emotions in yourself and others.",
    metaKa: "32 კითხვა · ~4 წუთი",
    metaEn: "32 questions · ~4 min",
  },
  {
    slug: "iq",
    kind: "featured",
    href: "/iq-testi",
    available: true,
    locales: ["ka", "en"],
    titleKa: "IQ და ლოგიკის ტესტი",
    titleEn: "IQ & Pattern Reasoning Test",
    taglineKa: "ვიზუალური მატრიცები და ლოგიკური აზროვნება",
    taglineEn: "Visual matrices, sequences, and abstract logic",
    descKa:
      "გამოსცადე ანალიტიკური სისწრაფე და კანონზომიერებების აღმოჩენის უნარი დროში გათვლილ ამოცანებში.",
    descEn:
      "Test your pattern recognition and abstract reasoning across progressive logic matrices.",
    metaKa: "25 ამოცანა · ~12 წუთი",
    metaEn: "25 problems · ~12 min",
  },
  {
    slug: "self-esteem",
    kind: "featured",
    href: "/tvit-shepasebis-testi",
    available: true,
    locales: ["ka"],
    titleKa: "თვითშეფასების ტესტი",
    titleEn: "Rosenberg Self-Esteem Scale",
    taglineKa: "როზენბერგის კლასიკური შკალა ქართულად",
    taglineEn: "The classic 10-item self-worth reflection scale",
    descKa:
      "სწრაფი და ზუსტი თვითშეფასების კითხვარი შინაგანი საყრდენისა და თვითკრიტიკის დონის გასაზომად.",
    descEn:
      "A brief, research-backed reflection on self-worth and inner confidence.",
    metaKa: "10 კითხვა · ~2 წუთი",
    metaEn: "10 questions · ~2 min",
  },
  {
    slug: "true-sign",
    kind: "quiz",
    href: "/quiz/namdvili-nishani",
    available: true,
    locales: ["ka", "en"],
    titleKa: "შენი ნამდვილი ზოდიაქოს ნიშანი",
    titleEn: "Your True Zodiac Sign Quiz",
    taglineKa: "რომელ ნიშანს ჰგავხარ ხასიათით სინამდვილეში?",
    taglineEn: "Which sign matches your real temperament?",
    descKa:
      "უპასუხე სიტუაციურ კითხვებს და გაიგე, რომელი სტიქია და ნიშანი მართავს შენს ყოველდღიურ გადაწყვეტილებებს.",
    descEn:
      "Answer situational prompts to see which element and zodiac sign best match how you actually act.",
    metaKa: "12 კითხვა · ~2 წუთი",
    metaEn: "12 questions · ~2 min",
  },
  {
    slug: "famous-zodiac",
    kind: "quiz",
    href: "/quiz/varskvlavebis-zodiaqo",
    available: true,
    locales: ["ka", "en"],
    titleKa: "გამოიცანი ვარსკვლავის ზოდიაქო",
    titleEn: "Guess the Celebrity's Sign",
    taglineKa: "რამდენად კარგად ცნობ ნიშნების ენერგიას?",
    taglineEn: "How well can you spot zodiac energy in famous figures?",
    descKa:
      "სწრაფი ქვიზი ცნობილი ადამიანების ზოდიაქოს გამოსაცნობად.",
    descEn:
      "A fast, playful challenge matching iconic personalities to their sun signs.",
    metaKa: "10 რაუნდი · ~2 წუთი",
    metaEn: "10 rounds · ~2 min",
  },
];
