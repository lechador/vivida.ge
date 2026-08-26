import type { NatalChartJson, PremiumReportContentJson } from "@/db/schema";
import type { UserLocale } from "@/lib/i18n/user-locale";
import { computeSynastry, CATEGORIES, CATEGORY_LABEL_KA } from "@/lib/synastry";
import { computeTiming } from "@/lib/timing";
import { BODIES, signByIndex } from "@/lib/zodiac";
import type { ReportProductKey } from "@/lib/report-catalog";

type Input = {
  type: ReportProductKey;
  chart: NatalChartJson;
  locale: UserLocale;
  firstName: string | null;
  timezone: string;
  partner?: { name: string; chart: NatalChartJson };
  now?: Date;
};

function signName(index: number, locale: UserLocale): string {
  const sign = signByIndex(index);
  return locale === "ka" ? sign.labelKa : locale === "am" ? sign.labelAm : sign.labelEn;
}

function bodyName(key: string, locale: UserLocale): string {
  const body = BODIES[key];
  if (!body) return key;
  return locale === "ka" ? body.labelKa : locale === "am" ? body.labelAm : body.labelEn;
}

function baseName(name: string | null, locale: UserLocale): string {
  return name || (locale === "ka" ? "შენი" : locale === "am" ? "Ձեր" : "Your");
}

function annual(input: Input): PremiumReportContentJson {
  const now = input.now ?? new Date();
  const year = now.getUTCFullYear();
  const timing = computeTiming(input.chart, now, input.timezone, 365, input.locale);
  const top = [...timing.days].sort((a, b) => b.score - a.score).slice(0, 6);
  const cautious = [...timing.days].sort((a, b) => a.score - b.score).slice(0, 4);
  const sun = signName(input.chart.bodies.sun.signIndex, input.locale);
  const moon = signName(input.chart.bodies.moon.signIndex, input.locale);
  const asc = signName(input.chart.ascendant.signIndex, input.locale);
  if (input.locale === "ka") return {
    title: `${year} — შენი პერსონალური წელი`,
    subtitle: `${baseName(input.firstName, input.locale)} · მზე ${sun} · მთვარე ${moon} · ასცენდენტი ${asc}`,
    overview: `ეს წელი იკითხება შენი ნატალური რუკისა და მომდევნო 12 თვის ტრანზიტების გადაკვეთით. მთავარი ამოცანაა ${sun}-ის მიზანმიმართულობა, ${moon}-ის ემოციური საჭიროებები და ${asc}-ის მოქმედების სტილი ერთ მიმართულებად შეკრა.`,
    sections: [
      { title: "წლის მთავარი თემა", body: `შენი მზის ნიშანი — ${sun} — გთხოვს, ენერგია იმ მიზნებში ჩადო, რომლებიც პირად მნიშვნელობას ატარებს. ასცენდენტი ${asc} გაჩვენებს, როგორ დაიწყო; მთვარე ${moon} კი როდის გჭირდება ტემპის შენელება და შინაგანი რესურსის აღდგენა.`, highlights: ["აირჩიე ერთი მთავარი წლიური მიმართულება", "შეაფასე პროგრესი ყოველ თვეში", "არ აურიო სიჩქარე და რეალური წინსვლა"] },
      { title: "ზრდა და შესაძლებლობები", body: `იუპიტერისა და მხარდამჭერი ტრანზიტების დღეები გაფართოების ფანჯრებს ქმნის. გამოიყენე ისინი მნიშვნელოვანი შეხვედრებისთვის, განაცხადებისთვის, სწავლისთვის და ხილვადობის გასაზრდელად.` },
      { title: "საზღვრები და გარდაქმნა", body: `დაძაბული პერიოდები აკრძალვა არ არის — ისინი გაჩვენებს, სად არის სტრუქტურა გასამყარებელი. სატურნის ენაზე საუკეთესო პასუხია გეგმა, ვადა და თანმიმდევრული პატარა ნაბიჯი.` },
      { title: "წლის რიტმი", body: `ყველა თვე ერთნაირი დატვირთვისთვის არ არის. ენერგიის მაღალ დღეებში იმოქმედე; დაბალ დღეებში გადაამოწმე, დაასრულე და დაისვენე. ასეთი მონაცვლეობა შენს რესურსს იცავს.` },
    ],
    keyDates: [
      ...top.map((d) => ({ date: d.dateIso, title: "მხარდამჭერი ფანჯარა", note: "ინიციატივისთვის, შეთანხმებისთვის ან ხილვადობისთვის ძლიერი დღეა.", tone: "supportive" as const })),
      ...cautious.map((d) => ({ date: d.dateIso, title: "შენელების ფანჯარა", note: "გადაამოწმე დეტალები და დატოვე ადგილი გეგმის შესაცვლელად.", tone: "caution" as const })),
    ].sort((a, b) => a.date.localeCompare(b.date)),
    actionPlan: ["ჩამოწერე წლის ერთი მთავარი მიზანი და სამი საზომი შედეგი.", "თვეში ერთხელ გადაამოწმე ენერგია, პროგრესი და საზღვრები.", "მნიშვნელოვანი ნაბიჯები მხარდამჭერ ფანჯრებში დაგეგმე.", "რთულ კვირებში შეამცირე მოცულობა, მაგრამ შეინარჩუნე რიტმი."],
    closing: "ასტროლოგიური დრო მიმართულებას გაძლევს; არჩევანი და მოქმედება შენთან რჩება.",
  };
  return {
    title: `${year} — Your personal year`,
    subtitle: `${baseName(input.firstName, input.locale)} · Sun in ${sun} · Moon in ${moon} · ${asc} rising`,
    overview: `This outlook combines your natal chart with the next 12 months of transits. Your central task is to align the purpose of ${sun}, the emotional needs of ${moon}, and the outward style of ${asc}.`,
    sections: [
      { title: "The theme of your year", body: `Your ${sun} Sun asks you to invest energy in goals with personal meaning. ${asc} rising describes how you initiate; your ${moon} Moon shows when you need to restore your inner resources.`, highlights: ["Choose one central direction", "Review progress monthly", "Do not confuse speed with progress"] },
      { title: "Growth and opportunity", body: "Supportive Jupiter and personal transits create windows for applications, learning, important conversations and greater visibility." },
      { title: "Boundaries and transformation", body: "Challenging periods are diagnostic rather than prohibitive. Respond with structure, deadlines and small repeatable steps." },
      { title: "Your yearly rhythm", body: "Act in high-energy windows; review, complete and recover in lower-energy periods. Alternating these modes protects your momentum." },
    ],
    keyDates: [...top.map((d) => ({ date: d.dateIso, title: "Supportive window", note: "Strong for initiative, agreement or visibility.", tone: "supportive" as const })), ...cautious.map((d) => ({ date: d.dateIso, title: "Slow-down window", note: "Review details and leave room to adjust.", tone: "caution" as const }))].sort((a, b) => a.date.localeCompare(b.date)),
    actionPlan: ["Name one central yearly goal and three measurable outcomes.", "Review energy, progress and boundaries once a month.", "Schedule important moves in supportive windows.", "Reduce volume in difficult weeks without abandoning the rhythm."],
    closing: "Astrological timing offers direction; choice and action remain yours.",
  };
}

function timingReport(input: Input): PremiumReportContentJson {
  const timing = computeTiming(input.chart, input.now ?? new Date(), input.timezone, 90, input.locale);
  const best = [...timing.days].sort((a, b) => b.score - a.score).slice(0, 8);
  const caution = [...timing.days].sort((a, b) => a.score - b.score).slice(0, 6);
  const en = input.locale !== "ka";
  return {
    title: en ? "Your next 90 days" : "შენი მომდევნო 90 დღე",
    subtitle: en ? "A personal timing map for action, review and recovery" : "პერსონალური დროის რუკა მოქმედებისთვის, გადახედვისა და აღდგენისთვის",
    overview: en ? "This report scores each day against your natal chart. It is a planning compass—not a guarantee—and works best when paired with your real priorities and constraints." : "ეს რეპორტი თითოეულ დღეს შენს ნატალურ რუკასთან მიმართებით აფასებს. ის დაგეგმვის კომპასია და არა გარანტია — საუკეთესო შედეგს რეალურ პრიორიტეტებთან ერთად იძლევა.",
    sections: [
      { title: en ? "How to use the calendar" : "როგორ გამოიყენო კალენდარი", body: en ? "Use supportive days for launches, asks and decisive conversations. Use neutral days for steady execution. On caution days, reduce avoidable risk and create extra review time." : "მხარდამჭერი დღეები გამოიყენე დაწყებისთვის, თხოვნებისთვის და გადამწყვეტი საუბრებისთვის. მშვიდ დღეებში იმუშავე სტაბილურად. ფრთხილ დღეებში შეამცირე ზედმეტი რისკი და დატოვე მეტი დრო გადამოწმებისთვის." },
      { title: en ? "Your strongest windows" : "შენი ძლიერი ფანჯრები", body: best.map((d) => d.dateIso).join(" · "), highlights: best.slice(0, 4).map((d) => en ? `${d.dateIso}: act on a clear priority` : `${d.dateIso}: იმოქმედე მკაფიო პრიორიტეტზე`) },
      { title: en ? "Windows for extra care" : "ფანჯრები მეტი სიფრთხილისთვის", body: caution.map((d) => d.dateIso).join(" · "), highlights: caution.slice(0, 4).map((d) => en ? `${d.dateIso}: verify before committing` : `${d.dateIso}: გადაწყვეტილებამდე გადაამოწმე`) },
      { title: en ? "Notable personal transits" : "მნიშვნელოვანი პირადი ტრანზიტები", body: timing.notable.length ? timing.notable.map((n) => `${n.dateLabelKa} — ${n.title}: ${n.meaning}`).join("\n\n") : (en ? "No unusually exact major transit dominates this window; consistency matters more than a single date." : "ამ პერიოდში ერთი გამოკვეთილად ზუსტი მთავარი ტრანზიტი არ დომინირებს — თანმიმდევრულობა ერთ კონკრეტულ თარიღზე მნიშვნელოვანია.") },
    ],
    keyDates: [...best.map((d) => ({ date: d.dateIso, title: en ? "Go window" : "მოქმედების ფანჯარა", note: en ? "Prioritize a meaningful outward move." : "პრიორიტეტი მიეცი მნიშვნელოვან გარე ნაბიჯს.", tone: "supportive" as const })), ...caution.map((d) => ({ date: d.dateIso, title: en ? "Review window" : "გადახედვის ფანჯარა", note: en ? "Slow down and verify assumptions." : "შეანელე და გადაამოწმე ვარაუდები.", tone: "caution" as const }))].sort((a, b) => a.date.localeCompare(b.date)),
    actionPlan: en ? ["Pick three outcomes for the 90-day window.", "Place the hardest outward move in a supportive window.", "Reserve caution days for review and maintenance.", "Re-check the calendar every Sunday."] : ["აირჩიე სამი შედეგი მომდევნო 90 დღისთვის.", "ყველაზე რთული გარე ნაბიჯი მხარდამჭერ ფანჯარაში მოათავსე.", "ფრთხილი დღეები გადახედვასა და მოვლას დაუთმე.", "ყოველ კვირას გადაამოწმე მომდევნო შვიდი დღე."],
    closing: en ? "Good timing supports a good decision; it never replaces one." : "კარგი დრო კარგ გადაწყვეტილებას ეხმარება — მას არ ცვლის.",
  };
}

function career(input: Input): PremiumReportContentJson {
  const en = input.locale !== "ka";
  const mc = signName(input.chart.midheaven.signIndex, input.locale);
  const sun = signName(input.chart.bodies.sun.signIndex, input.locale);
  const mercury = signName(input.chart.bodies.mercury.signIndex, input.locale);
  const saturn = signName(input.chart.bodies.saturn.signIndex, input.locale);
  return {
    title: en ? "Career and calling" : "კარიერა და მოწოდება",
    subtitle: en ? `Midheaven in ${mc} · Sun in ${sun}` : `MC ${mc}-ში · მზე ${sun}-ში`,
    overview: en ? `Your Midheaven in ${mc} describes the reputation you build over time, while your ${sun} Sun shows the work that keeps your identity engaged. This report turns those signals into choices about role, environment and growth.` : `MC ${mc}-ში აღწერს რეპუტაციას, რომელსაც დროთა განმავლობაში აშენებ; მზე ${sun}-ში კი აჩვენებს, როგორი საქმე ინარჩუნებს შენს შინაგან ჩართულობას. ეს რეპორტი ამ სიგნალებს როლის, გარემოსა და ზრდის არჩევანებად გარდაქმნის.`,
    sections: [
      { title: en ? "Public direction" : "საზოგადოებრივი მიმართულება", body: en ? `${mc} at the top of your chart favors a career path where its qualities become visible and useful. Build proof of work—not only potential—and let your reputation compound.` : `${mc} რუკის მწვერვალზე გიბიძგებს კარიერისკენ, სადაც ამ ნიშნის თვისებები ხილული და სასარგებლო ხდება. ააშენე შესრულებული საქმის მტკიცებულება და არა მხოლოდ პოტენციალი.`, highlights: en ? ["Choose work with visible outcomes", "Build a repeatable body of proof", "Treat reputation as a long-term asset"] : ["აირჩიე საქმე ხილული შედეგით", "შექმენი განმეორებადი პორტფოლიო", "რეპუტაციას გრძელვადიან აქტივად შეხედე"] },
      { title: en ? "Thinking and communication" : "აზროვნება და კომუნიკაცია", body: en ? `Mercury in ${mercury} describes how you learn, explain and solve. Design your workflow around that style, while deliberately practicing the opposite mode when the task requires it.` : `მერკური ${mercury}-ში აღწერს, როგორ სწავლობ, ხსნი და წყვეტ პრობლემებს. სამუშაო პროცესი ამ სტილზე ააწყვე, მაგრამ საჭიროებისას საპირისპირო რეჟიმიც შეგნებულად ავარჯიშე.` },
      { title: en ? "Discipline and mastery" : "დისციპლინა და ოსტატობა", body: en ? `Saturn in ${saturn} marks the field where patience becomes authority. Progress may feel slower here, but consistency produces durable credibility.` : `სატურნი ${saturn}-ში მიუთითებს სფეროზე, სადაც მოთმინება ავტორიტეტად გარდაიქმნება. პროგრესი შეიძლება ნელი ჩანდეს, მაგრამ თანმიმდევრულობა მყარ სანდოობას ქმნის.` },
      { title: en ? "Best work environment" : "შესაფერისი სამუშაო გარემო", body: en ? `Your ${sun} Sun needs enough autonomy to care about the result and enough structure to finish. Favor teams that make ownership clear, give useful feedback and reward depth over noise.` : `შენს ${sun}-ის მზეს სჭირდება საკმარისი ავტონომია შედეგით დასაინტერესებლად და საკმარისი სტრუქტურა საქმის დასასრულებლად. ეძებე გუნდი, სადაც პასუხისმგებლობა ნათელია და ხარისხიანი უკუკავშირი არსებობს.` },
    ],
    actionPlan: en ? ["Define one professional thesis you want to be known for.", "Create one public proof-of-work artifact in 30 days.", "Ask three trusted people where they see your strongest leverage.", "Run a 90-day experiment before making a permanent leap."] : ["განსაზღვრე ერთი პროფესიული თემა, რომლითაც გინდა გიცნობდნენ.", "30 დღეში შექმენი ერთი საჯარო ნამუშევარი.", "სამ სანდო ადამიანს ჰკითხე, სად ხედავენ შენს ყველაზე ძლიერ მხარეს.", "საბოლოო ნახტომამდე ჩაატარე 90-დღიანი ექსპერიმენტი."],
    closing: en ? "A calling becomes a career through repeated evidence, boundaries and time." : "მოწოდება კარიერად განმეორებადი შედეგით, საზღვრებითა და დროით იქცევა.",
  };
}

function relationship(input: Input): PremiumReportContentJson {
  if (!input.partner) throw new Error("relationship report requires a partner");
  const result = computeSynastry(input.chart, input.partner.chart);
  const en = input.locale !== "ka";
  const sorted = CATEGORIES.map((key) => ({ key, score: result.scores[key] })).sort((a, b) => b.score - a.score);
  const labelsEn: Record<string, string> = { love: "Love", friendship: "Friendship", communication: "Communication", growth: "Growth", chemistry: "Chemistry", business: "Shared work" };
  const label = (key: string) => en ? labelsEn[key] : CATEGORY_LABEL_KA[key as keyof typeof CATEGORY_LABEL_KA];
  return {
    title: en ? `Relationship report: ${input.partner.name}` : `ურთიერთობის რეპორტი: ${input.partner.name}`,
    subtitle: en ? `Overall compatibility ${result.overall}%` : `საერთო თავსებადობა ${result.overall}%`,
    overview: en ? `Your ${result.overall}% score is a map of tendencies, not a verdict. The strongest area is ${label(sorted[0].key)} (${sorted[0].score}%); the area asking for the most conscious work is ${label(sorted.at(-1)!.key)} (${sorted.at(-1)!.score}%).` : `თქვენი ${result.overall}% ქულა ტენდენციების რუკაა და არა განაჩენი. ყველაზე ძლიერი სფეროა ${label(sorted[0].key)} (${sorted[0].score}%), ხოლო ყველაზე შეგნებულ მუშაობას ითხოვს ${label(sorted.at(-1)!.key)} (${sorted.at(-1)!.score}%).`,
    sections: [
      { title: en ? "Compatibility by area" : "თავსებადობა სფეროების მიხედვით", body: sorted.map((x) => `${label(x.key)} — ${x.score}%`).join("\n"), highlights: sorted.slice(0, 3).map((x) => en ? `${label(x.key)} is a natural resource for the relationship.` : `${label(x.key)} ურთიერთობის ბუნებრივი რესურსია.`) },
      { title: en ? "Your strongest contacts" : "თქვენი ძლიერი კონტაქტები", body: result.topAspects.slice(0, 4).map((a) => `${bodyName(a.a, input.locale)} ${a.kind} ${bodyName(a.b, input.locale)} · ${a.orb.toFixed(1)}°`).join("\n") || (en ? "The relationship is shaped more by the full pattern than one dominant aspect." : "ურთიერთობას ერთი დომინანტური ასპექტის ნაცვლად მთლიანი სურათი აყალიბებს.") },
      { title: en ? "Where friction can become growth" : "სად შეიძლება დაძაბულობა ზრდად იქცეს", body: en ? `Treat a lower ${label(sorted.at(-1)!.key)} score as a prompt for explicit agreements. Name needs before interpreting motives, and return to the conversation after nervous systems have settled.` : `${label(sorted.at(-1)!.key)}-ის შედარებით დაბალი ქულა მკაფიო შეთანხმებებისკენ გიბიძგებთ. განზრახვების გამოცნობის ნაცვლად დაასახელეთ საჭიროებები და რთულ საუბარს დამშვიდების შემდეგ დაუბრუნდით.` },
      { title: en ? "Questions to explore together" : "საერთო კითხვები", body: en ? "What helps each of us feel heard?\nWhat does support look like during stress?\nWhich decision needs a clearer shared agreement?\nHow do we protect both closeness and autonomy?" : "რა ეხმარება თითოეულ ჩვენგანს, რომ მოსმენილად იგრძნოს თავი?\nროგორ გამოიყურება მხარდაჭერა სტრესის დროს?\nრომელ გადაწყვეტილებას სჭირდება უფრო მკაფიო შეთანხმება?\nროგორ დავიცვათ სიახლოვეც და ავტონომიაც?" },
    ],
    actionPlan: en ? ["Hold one 30-minute check-in without problem-solving for the first 10 minutes.", "Agree on one repair phrase for tense moments.", "Plan one activity around your strongest compatibility area.", "Review one recurring conflict as a shared system, not a personal defect."] : ["ჩაატარეთ 30-წუთიანი check-in და პირველი 10 წუთი მხოლოდ მოუსმინეთ.", "შეთანხმდით ერთ ფრაზაზე დაძაბული მომენტის შესარბილებლად.", "დაგეგმეთ აქტივობა ყველაზე ძლიერი სფეროს გარშემო.", "განმეორებადი კონფლიქტი საერთო სისტემად განიხილეთ და არა პირად ნაკლად."],
    closing: en ? "Compatibility is potential; relationship quality is the practice you build together." : "თავსებადობა პოტენციალია; ურთიერთობის ხარისხი — პრაქტიკა, რომელსაც ერთად ქმნით.",
  };
}

export function buildPremiumReportContent(input: Input): PremiumReportContentJson {
  if (input.type === "annual") return annual(input);
  if (input.type === "timing") return timingReport(input);
  if (input.type === "career") return career(input);
  return relationship(input);
}
