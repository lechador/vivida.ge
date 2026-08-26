import type { NatalChartJson, RelationshipWeeklyJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { shiftDate } from "@/lib/streak";
import { computeTiming } from "@/lib/timing";
import { localDateString } from "@/lib/transits";

type RelationshipTheme = RelationshipWeeklyJson["theme"];

const THEME_PRIORITY: Array<[string, RelationshipTheme]> = [
  ["mercury", "communication"],
  ["venus", "closeness"],
  ["moon", "emotions"],
  ["mars", "boundaries"],
  ["saturn", "boundaries"],
];

const PLANETS: Record<UserLocale, Record<string, string>> = {
  ka: {
    venus: "ვენერა", mars: "მარსი", jupiter: "იუპიტერი", saturn: "სატურნი",
    sun: "მზე", moon: "მთვარე", mercury: "მერკური", ascendant: "ასცენდენტი",
    midheaven: "MC",
  },
  en: {
    venus: "Venus", mars: "Mars", jupiter: "Jupiter", saturn: "Saturn",
    sun: "Sun", moon: "Moon", mercury: "Mercury", ascendant: "Ascendant",
    midheaven: "Midheaven",
  },
  am: {
    venus: "Վեներան", mars: "Մարսը", jupiter: "Յուպիտերը", saturn: "Սատուրնը",
    sun: "Արևը", moon: "Լուսինը", mercury: "Մերկուրին", ascendant: "Ասցենդենտը",
    midheaven: "MC",
  },
};

const ASPECTS: Record<UserLocale, Record<string, string>> = {
  ka: { conjunction: "შეერთება", sextile: "სექსტილი", square: "კვადრატი", trine: "ტრინი", opposition: "ოპოზიცია" },
  en: { conjunction: "conjunction", sextile: "sextile", square: "square", trine: "trine", opposition: "opposition" },
  am: { conjunction: "միացում", sextile: "սեքստիլ", square: "քառակուսի", trine: "տրին", opposition: "ընդդիմություն" },
};

const COPY: Record<UserLocale, {
  headlines: Record<RelationshipTheme, string>;
  summaries: Record<RelationshipTheme, string>;
  questions: Record<RelationshipTheme, string[]>;
  supportive: string;
  tense: string;
  neutral: string;
}> = {
  ka: {
    headlines: {
      communication: "კვირა გულწრფელი საუბრისთვის",
      closeness: "კვირა ერთმანეთთან დასაახლოებლად",
      emotions: "კვირა ერთმანეთის უკეთ მოსასმენად",
      boundaries: "კვირა საზღვრებისა და მოთმინებისთვის",
      growth: "კვირა საერთო ნაბიჯისთვის",
    },
    summaries: {
      communication: "სიტყვები ამ კვირაში განსაკუთრებით მნიშვნელოვანია — თქვით სათქმელი მკაფიოდ და მოსმენასაც დაუთმეთ ადგილი.",
      closeness: "პატარა ყურადღება და ხარისხიანი დრო კავშირს უფრო თბილსა და მყარად აქცევს.",
      emotions: "ემოციური ფონი გაძლიერებულია; ეცადეთ რეაქციების მიღმა ერთმანეთის საჭიროებები დაინახოთ.",
      boundaries: "განსხვავებული ტემპი დაძაბულობას არ ნიშნავს — მკაფიო საზღვრები და პაუზა ახლა კავშირს იცავს.",
      growth: "კარგი დროა შეთანხმდეთ ერთ პატარა საერთო მიზანზე და პირველი ნაბიჯი ერთად გადადგათ.",
    },
    questions: {
      communication: ["რა გინდა, რომ ამ კვირაში უკეთ გავიგო?", "რომელ საუბარს ვადებთ თავს?", "როგორ შეგვიძლია უთანხმოებისას ერთმანეთის მოსმენა?"],
      closeness: ["როდის გრძნობ ჩემთან ყველაზე მეტ სიახლოვეს?", "რა პატარა ჟესტი გაგახარებდა ამ კვირაში?", "რა დრო დავიტოვოთ მხოლოდ ჩვენთვის?"],
      emotions: ["როგორ ხარ სინამდვილეში ამ კვირაში?", "როდის გჭირდება ჩემგან მხარდაჭერა და როდის — სივრცე?", "რა ემოციის გაზიარება გიჭირს?"],
      boundaries: ["რომელი საზღვარი გჭირდება ახლა ყველაზე მეტად?", "სად გვჭირდება მეტი მოთმინება?", "როგორ ვთქვათ „არა“ ისე, რომ კავშირი დავიცვათ?"],
      growth: ["რა ერთი მიზანი შეგვიძლია ერთად დავიწყოთ?", "რა ვისწავლეთ ერთმანეთისგან ბოლო დროს?", "რა იქნება ჩვენი პატარა საერთო გამარჯვება?"],
    },
    supportive: "ეს დღე კავშირს მხარს უჭერს — გამოიყენეთ სიახლოვისა და შეთანხმებისთვის.",
    tense: "შესაძლოა მეტი მგრძნობელობა ან ხახუნი იყოს — იჩქარეთ ნაკლებად და მოუსმინეთ მეტად.",
    neutral: "ეს თემა ყურადღებას ითხოვს — გულწრფელი დაკვირვება ბევრს გაგაგებინებთ.",
  },
  en: {
    headlines: {
      communication: "A week for honest conversation", closeness: "A week to grow closer",
      emotions: "A week to listen more deeply", boundaries: "A week for patience and boundaries",
      growth: "A week for one shared step",
    },
    summaries: {
      communication: "Words matter more this week. Say what you mean clearly and leave equal room for listening.",
      closeness: "Small gestures and intentional time together can make the bond feel warmer and steadier.",
      emotions: "Feelings run closer to the surface; look for the need behind each reaction.",
      boundaries: "Different rhythms do not mean distance. Clear limits and timely pauses protect the connection.",
      growth: "Choose one small shared goal and take its first step together.",
    },
    questions: {
      communication: ["What do you want me to understand better this week?", "Which conversation are we avoiding?", "How can we listen better during disagreement?"],
      closeness: ["When do you feel closest to me?", "What small gesture would make you feel cared for?", "What time should we reserve just for us?"],
      emotions: ["How are you really feeling this week?", "When do you need support, and when do you need space?", "Which feeling is hardest to share?"],
      boundaries: ["Which boundary matters most to you right now?", "Where do we need more patience?", "How can we say no while protecting the bond?"],
      growth: ["What is one goal we can begin together?", "What have we learned from each other lately?", "What would count as a small shared win?"],
    },
    supportive: "This supports the connection—use it for closeness and agreement.",
    tense: "Sensitivity or friction may rise—slow down and listen more carefully.",
    neutral: "This theme deserves attention; honest observation can reveal a lot.",
  },
  am: {
    headlines: {
      communication: "Անկեղծ զրույցի շաբաթ", closeness: "Մերձենալու շաբաթ",
      emotions: "Ավելի խոր լսելու շաբաթ", boundaries: "Համբերության և սահմանների շաբաթ",
      growth: "Մեկ ընդհանուր քայլի շաբաթ",
    },
    summaries: {
      communication: "Այս շաբաթ խոսքերը հատկապես կարևոր են․ հստակ արտահայտվեք և նույնքան տեղ թողեք լսելուն։",
      closeness: "Փոքր ուշադրությունն ու միասին անցկացրած որակյալ ժամանակը կապը դարձնում են ավելի ջերմ։",
      emotions: "Զգացմունքներն ավելի տեսանելի են․ փորձեք արձագանքի հետևում տեսնել իրական կարիքը։",
      boundaries: "Տարբեր ռիթմերը հեռավորություն չեն նշանակում․ հստակ սահմաններն ու դադարները պաշտպանում են կապը։",
      growth: "Ընտրեք մեկ փոքր ընդհանուր նպատակ և միասին արեք առաջին քայլը։",
    },
    questions: {
      communication: ["Ի՞նչ ես ուզում, որ այս շաբաթ ավելի լավ հասկանամ։", "Ո՞ր զրույցից ենք խուսափում։", "Ինչպե՞ս կարող ենք վեճի ժամանակ ավելի լավ լսել։"],
      closeness: ["Ե՞րբ ես ինձ ամենամոտ զգում։", "Ո՞ր փոքր ժեստը քեզ կուրախացնի։", "Ի՞նչ ժամանակ պահենք միայն մեզ համար։"],
      emotions: ["Իրականում ինչպե՞ս ես այս շաբաթ։", "Ե՞րբ է պետք աջակցություն, իսկ ե՞րբ՝ տարածք։", "Ո՞ր զգացմունքն է դժվար կիսել։"],
      boundaries: ["Ո՞ր սահմանն է հիմա ամենակարևորը։", "Որտե՞ղ է պետք ավելի շատ համբերություն։", "Ինչպե՞ս ասել «ոչ»՝ պահպանելով կապը։"],
      growth: ["Ո՞ր մեկ նպատակը կարող ենք միասին սկսել։", "Վերջերս ի՞նչ ենք սովորել միմյանցից։", "Ի՞նչը կլինի մեր փոքր ընդհանուր հաղթանակը։"],
    },
    supportive: "Այս պահը աջակցում է կապին․ օգտագործեք այն մտերմության և համաձայնության համար։",
    tense: "Հնարավոր է զգայունություն կամ լարվածություն․ դանդաղեք և ավելի ուշադիր լսեք։",
    neutral: "Այս թեման ուշադրություն է պահանջում․ անկեղծ դիտարկումը շատ բան կբացի։",
  },
};

/** Monday in the supplied timezone, as a stable YYYY-MM-DD cache key. */
export function relationshipWeekStart(now: Date, timezone: string): string {
  const localDate = localDateString(now, timezone);
  const weekday = new Date(`${localDate}T12:00:00Z`).getUTCDay();
  return shiftDate(localDate, -(weekday === 0 ? 6 : weekday - 1));
}

function chooseTheme(notable: Array<{ transit: string; natal: string }>): RelationshipTheme {
  for (const [planet, theme] of THEME_PRIORITY) {
    if (notable.some((item) => item.transit === planet || item.natal === planet)) return theme;
  }
  return "growth";
}

export function computeRelationshipWeekly(
  ownerChart: NatalChartJson,
  partnerChart: NatalChartJson,
  now: Date,
  timezone: string,
  locale: UserLocale = "ka",
): RelationshipWeeklyJson {
  const language = COPY[locale] ? locale : "ka";
  const weekStart = relationshipWeekStart(now, timezone);
  const monday = new Date(`${weekStart}T12:00:00Z`);
  const owner = computeTiming(ownerChart, monday, timezone, 7, language);
  const partner = computeTiming(partnerChart, monday, timezone, 7, language);
  const days = owner.days.map((day, index) => {
    const score = Math.round((day.score + (partner.days[index]?.score ?? 0)) / 2);
    return {
      dateIso: day.dateIso,
      score,
      tier: score >= 35 ? "great" as const : score >= 14 ? "good" as const : score > -28 ? "calm" as const : "tough" as const,
    };
  });
  const average = days.length ? days.reduce((sum, day) => sum + day.score, 0) / days.length : 0;
  const harmonyScore = Math.max(0, Math.min(100, Math.round(50 + average / 2)));
  const merged = [
    ...owner.notable.map((item) => ({ ...item, source: "owner" as const })),
    ...partner.notable.map((item) => ({ ...item, source: "partner" as const })),
  ].sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  const theme = chooseTheme(merged);
  const copy = COPY[language];
  const notable = merged.slice(0, 4).map((item) => ({
    key: `${item.source}:${item.dateIso}:${item.transit}:${item.natal}:${item.kind}`,
    dateIso: item.dateIso,
    title: language === "en"
      ? `${PLANETS[language][item.transit] ?? item.transit} ${ASPECTS[language][item.kind] ?? item.kind} ${PLANETS[language][item.natal] ?? item.natal}`
      : `${PLANETS[language][item.transit] ?? item.transit} — ${ASPECTS[language][item.kind] ?? item.kind} — ${PLANETS[language][item.natal] ?? item.natal}`,
    meaning: item.family === "harmonic" ? copy.supportive : item.family === "tense" ? copy.tense : copy.neutral,
    family: item.family,
  }));

  return {
    weekStart,
    headline: copy.headlines[theme],
    summary: copy.summaries[theme],
    theme,
    harmonyScore,
    challengeScore: 100 - harmonyScore,
    days,
    questions: copy.questions[theme].map((text, index) => ({ key: `${theme}:${index + 1}`, text })),
    notable,
  };
}
