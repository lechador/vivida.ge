/**
 * Deterministic Georgian-language interpretation layer for synastry.
 *
 * Pairs with `lib/synastry.ts` (which produces scores + the tightest cross
 * aspects) and turns those numeric values into prose: per-aspect taglines,
 * per-aspect detailed breakdowns, per-category narratives, and a
 * strengths × growth split.
 *
 * Grammar note: Georgian verbs that take an indirect object (ერწყმის,
 * ეხმიანება, ეჯახება, უპირისპირდება) require the object in the dative
 * case — for these noun stems that means appending "ს". So we keep two
 * forms of every body-domain word and pick the right one when composing
 * sentences. Without this, you get ungrammatical strings like "ერწყმის
 * აზროვნება" instead of the correct "აზროვნებას ერწყმის".
 */

import type { AspectKind } from "./aspects";
import { aspectDetailContent } from "./synastry-aspects-content";
import type { SynastryAspect, SynastryCategory } from "./synastry";

/** Georgian display name for each chart point. */
const BODY_LABEL: Record<string, string> = {
  sun: "მზე",
  moon: "მთვარე",
  mercury: "მერკური",
  venus: "ვენერა",
  mars: "მარსი",
  jupiter: "იუპიტერი",
  saturn: "სატურნი",
  uranus: "ურანი",
  neptune: "ნეპტუნი",
  pluto: "პლუტონი",
  ascendant: "ამომავალი",
  midheaven: "ზენიტი",
  chiron: "ქირონი",
};

/** What domain each body governs — nominative form. */
const BODY_DOMAIN_NOM: Record<string, string> = {
  sun: "ბირთვი",
  moon: "გრძნობები",
  mercury: "აზროვნება",
  venus: "სიყვარული",
  mars: "ენერგია",
  jupiter: "ზრდა",
  saturn: "სიმწიფე",
  uranus: "თავისუფლება",
  neptune: "ოცნებები",
  pluto: "გარდასახვა",
  ascendant: "თვითგამოხატვა",
  midheaven: "მიზანი",
  chiron: "მგრძნობელობა",
};

/** Same domain words in dative case (object of the aspect verb). */
const BODY_DOMAIN_DAT: Record<string, string> = {
  sun: "ბირთვს",
  moon: "გრძნობებს",
  mercury: "აზროვნებას",
  venus: "სიყვარულს",
  mars: "ენერგიას",
  jupiter: "ზრდას",
  saturn: "სიმწიფეს",
  uranus: "თავისუფლებას",
  neptune: "ოცნებებს",
  pluto: "გარდასახვას",
  ascendant: "თვითგამოხატვას",
  midheaven: "მიზანს",
  chiron: "მგრძნობელობას",
};

/** What each body represents *in a relationship context* — used in the
 *  detailed breakdown modal. Written so each line stands alone. */
const BODY_SYN_DESC: Record<string, string> = {
  sun: "შენი ბირთვი — ვინ ხარ ცხოვრების ცენტრში",
  moon: "შენი ემოციური სამყარო — როგორ გრძნობ თავს და გჭირდება სიახლოვე",
  mercury: "როგორ აზროვნებ და ერთმანეთთან საუბრობთ",
  venus: "რას აფასებ, ვის და როგორ ეფერები",
  mars: "როგორ მოქმედებ და რა გცეცხლავს",
  jupiter: "რა გაფართოებს და რას ისწავლი",
  saturn: "რა გასწავლის ვალდებულებას, რას აშენებ ხანგრძლივად",
  uranus: "რა გათავისუფლებს და მოულოდნელად გცვლის",
  neptune: "რას ოცნებობ, რას გრძნობ სიტყვებზე ღრმად",
  pluto: "რა გცვლის ფუნდამენტურად, ძველი სქემების სიკვდილი",
  ascendant: "როგორი ჩანხარ პირველი შეხვედრისას",
  midheaven: "რა მიმართულებას მიჰყევხარ ცხოვრებაში",
  chiron: "შენი მგრძნობიარე ადგილი — სადაც ცემო და სადაც კურნავ",
};

const ASPECT_META: Record<
  AspectKind,
  {
    glyph: string;
    labelKa: string;
    /** Verb at sentence end. Object goes in dative form. */
    verbKa: string;
    valence: "harmonious" | "neutral" | "tense";
    /** Generic meaning of this aspect type, displayed in the breakdown modal. */
    meaningKa: string;
  }
> = {
  conjunction: {
    glyph: "☌",
    labelKa: "კონიუნქცია",
    verbKa: "ერწყმის",
    valence: "neutral",
    meaningKa:
      "კონიუნქცია — ორი წერტილის ერთიანობა. ენერგიები ერთმანეთში გადადის და ერთად ცხოვრობს, ძლიერი და კონცენტრირებული ბმა იქმნება.",
  },
  trine: {
    glyph: "△",
    labelKa: "ტრინი",
    verbKa: "თავისუფლად ეხმიანება",
    valence: "harmonious",
    meaningKa:
      "ტრინი — ჰარმონიული, ბუნებრივი ნაკადი. ენერგიები ერთმანეთს ხელს უწყობს და თავისუფლად მიედინება, ცდის გარეშე.",
  },
  sextile: {
    glyph: "✶",
    labelKa: "სექსტილი",
    verbKa: "მეგობრულად ეხმიანება",
    valence: "harmonious",
    meaningKa:
      "სექსტილი — მეგობრული თანამშრომლობა. მცირე, მაგრამ თბილი შეთავაზებები, რომლებიც ცხოვრებას ამარაგებს.",
  },
  square: {
    glyph: "□",
    labelKa: "კვადრატი",
    verbKa: "ეჯახება",
    valence: "tense",
    meaningKa:
      "კვადრატი — დაძაბულობა, რომელიც მოქმედებას იწვევს. სწორედ ეს გრიგალი არის ზრდის ძრავა — გართულება, რომელშიც ძალაც იმალება.",
  },
  opposition: {
    glyph: "☍",
    labelKa: "ოპოზიცია",
    verbKa: "უპირისპირდება",
    valence: "tense",
    meaningKa:
      "ოპოზიცია — ორი მხარის სარკული გადაცილება. ერთმანეთში ჩვენი თავი ვხედავთ; ბალანსის გაკვეთილი.",
  },
};

export function aspectGlyph(kind: AspectKind): string {
  return ASPECT_META[kind].glyph;
}

export function aspectLabel(kind: AspectKind): string {
  return ASPECT_META[kind].labelKa;
}

export function aspectMeaning(kind: AspectKind): string {
  return ASPECT_META[kind].meaningKa;
}

export function aspectValence(
  kind: AspectKind
): "harmonious" | "neutral" | "tense" {
  return ASPECT_META[kind].valence;
}

export function bodyLabel(key: string): string {
  return BODY_LABEL[key] ?? key;
}

export function bodyDomain(key: string): string {
  return BODY_DOMAIN_NOM[key] ?? key;
}

export function bodySynastryDescription(key: string): string {
  return BODY_SYN_DESC[key] ?? "";
}

/**
 * Compose a one-line tagline like "ბირთვი აზროვნებას ერწყმის".
 * Uses Georgian SOV order with the second body in dative case so the
 * sentence is grammatically correct.
 */
export function describeAspect(asp: SynastryAspect): string {
  const meta = ASPECT_META[asp.kind];
  const subject = BODY_DOMAIN_NOM[asp.a] ?? asp.a;
  const object = BODY_DOMAIN_DAT[asp.b] ?? `${asp.b}ს`;
  return `${subject} ${object} ${meta.verbKa}`;
}

// ────────────────────────────────────────────────────────────────────────
// Detailed breakdown for the modal
// ────────────────────────────────────────────────────────────────────────

export type AspectBreakdown = {
  /** Headline like "ვენერა △ ამომავალი". */
  title: string;
  /** Tightness phrasing for the score panel. */
  tightnessNote: string;
  /** Generic meaning of the aspect type. */
  aspectMeaning: string;
  /** What body A represents in this relationship. */
  bodyADescription: string;
  /** What body B represents. */
  bodyBDescription: string;
  /** What this pairing gives the relationship — supportive side. */
  positive: string;
  /** What to watch for — friction, shadow, blind spots. */
  negative: string;
  /** A practical takeaway or advice. */
  takeaway: string;
};

/** "ძალიან ზუსტი" / "მჭიდრო" / "ფართო" — turns orb tightness into Georgian. */
function tightnessLabel(tightness: number): string {
  if (tightness >= 0.85) return "ძალიან ზუსტი ასპექტი — ენერგია ბევრ შემთხვევაში გრძნობადია.";
  if (tightness >= 0.7) return "მჭიდრო ასპექტი — გავლენა ცხადად ჩანს.";
  if (tightness >= 0.5) return "საშუალო სიმჭიდროვის ასპექტი — გავლენა შეინიშნება.";
  return "ფართო ორბი — გავლენა მსუბუქია, მაგრამ ფონზე იგრძნობა.";
}

/**
 * Deterministic fallback used only when the JSON content store doesn't
 * yet have an entry for this (aspect × body × body) combo. Pre-generation
 * covers all 5 × 91 = 455 possibilities, so this should rarely fire in
 * practice; keeping it means a missing entry never blanks the modal.
 */
function fallbackDetail(asp: SynastryAspect): {
  positive: string;
  negative: string;
  takeaway: string;
} {
  const valence = ASPECT_META[asp.kind].valence;
  const aDom = BODY_DOMAIN_NOM[asp.a] ?? asp.a;
  const bDom = BODY_DOMAIN_NOM[asp.b] ?? asp.b;
  const aDomDat = BODY_DOMAIN_DAT[asp.a] ?? `${asp.a}ს`;
  const bDomDat = BODY_DOMAIN_DAT[asp.b] ?? `${asp.b}ს`;

  if (valence === "harmonious") {
    return {
      positive: `${aDom} და ${bDom} ერთმანეთში ბუნებრივად გადადის — ერთი იწყებს, მეორემ იცის გაგრძელება. ცდის გარეშე გრძნობთ ერთმანეთის ნაკადს.`,
      negative: `ეს ჰარმონია იოლად ხდება ჩვეულებად — შეიძლება ერთმანეთი თავისთავად მიიღოთ და ცოცხალი ძალისხმევა აღარ ჩადოთ. ღირს, ცნობიერად აფასებდეთ ამ ნაკადს.`,
      takeaway: `${bDomDat} ${aDom} ენერგიას ანიჭებს — არ დაივიწყოთ მადლიერების ღია გამოხატვა და თემაზე ცოცხალი საუბარი.`,
    };
  }
  if (valence === "tense") {
    return {
      positive: `${aDom}-სა და ${bDom}-ს შორის სწორედ ხახუნი ქმნის ცოცხალ ენერგიას — ეს დაძაბულობა გაიძულებთ ცნობიერად მოეპყროთ ამ სფეროს, რაც ნელ-ნელა ღრმავდება.`,
      negative: `${aDom} და ${bDom} ხშირად გვერდს გვერდი ვერ ეტევა — ერთი მეორეს უმარტივებს მცდელობას. თუ უგულებელყოფთ, აქ მუდმივი მოლოდინები და ხახუნი დაგროვდება.`,
      takeaway: `${aDomDat} ცნობიერად დაუთმეთ დრო, ვიდრე ${bDom}-ს გვერდს აუხვევთ. ხახუნი წერტილია, სადაც ცნობიერი მცდელობა ცვლის შაბლონს.`,
    };
  }
  return {
    positive: `${aDom} და ${bDom} ერთ წერტილში იყრება — ერთობდებიან, ერთმანეთის გარეშე ამ თემაზე უკვე ვერ ფიქრობთ. ერთად მძლავრი ფოკუსი გექნებათ.`,
    negative: `ენერგიები ისე ერევა, რომ შეიძლება საკუთარი სახე დაივიწყოთ ამ სფეროში. გრძნობებიც, აზრებიც ერთმანეთს ჩამოაქვს ფერი.`,
    takeaway: `ცალ-ცალკე გესმოდეთ რა მიგაჩნია თქვენ ${aDomDat} და რა — პარტნიორს ${bDomDat}. ცნობიერი გამიჯვნით ერთიანობაც უფრო ღრმად მუშაობს.`,
  };
}

export function aspectBreakdown(asp: SynastryAspect): AspectBreakdown {
  const meta = ASPECT_META[asp.kind];
  const generated = aspectDetailContent(asp.kind, asp.a, asp.b);
  const detail = generated ?? fallbackDetail(asp);
  return {
    title: `${BODY_LABEL[asp.a] ?? asp.a} ${meta.glyph} ${BODY_LABEL[asp.b] ?? asp.b}`,
    tightnessNote: tightnessLabel(asp.tightness),
    aspectMeaning: meta.meaningKa,
    bodyADescription: BODY_SYN_DESC[asp.a] ?? "",
    bodyBDescription: BODY_SYN_DESC[asp.b] ?? "",
    positive: detail.positive,
    negative: detail.negative,
    takeaway: detail.takeaway,
  };
}

// ────────────────────────────────────────────────────────────────────────
// Per-category narratives, keyed by score tier
// ────────────────────────────────────────────────────────────────────────

type Tier = "excellent" | "strong" | "good" | "mixed" | "challenging";

function tierFromScore(score: number): Tier {
  // Re-anchored to the new neutral=48 spread so each tier corresponds
  // to a real qualitative range — no more "70%" pairs reading as if
  // they're already in the strong band.
  if (score >= 78) return "excellent";
  if (score >= 64) return "strong";
  if (score >= 50) return "good";
  if (score >= 36) return "mixed";
  return "challenging";
}

const CATEGORY_NARRATIVE: Record<SynastryCategory, Record<Tier, string>> = {
  love: {
    excellent:
      "გრძნობების შენადნობი იშვიათი ხარისხის — მზე და ვენერა ერთმანეთს თბილ რეზონანსში ხედავენ. სიახლოვე ბუნებრივად მოდის.",
    strong:
      "სიყვარული ერთობლივი მელოდიასავით ჟღერს — ერთმანეთის ემოციური ენა გესმით.",
    good:
      "კარგი ემოციური საფუძველი. სიახლოვე იღვიძებს მაშინ, როცა დრო და სივრცე ერთად ვითარდება.",
    mixed:
      "გრძნობებში ვნებაც არის და გადაკვეთის ხაზიც. ღირს, ერთმანეთი მოლოდინების გარეშე გაეცნოთ.",
    challenging:
      "სიყვარულის ენები განსხვავდება — მცირე ნაბიჯები და ღია საუბარი დაგეხმარებათ.",
  },
  friendship: {
    excellent:
      "ერთად ყოფნა გართობაცაა და დასვენებაც. ბუნებრივად ხდებით ერთმანეთის სანდო წრე.",
    strong:
      "მეგობრული ნაკადი — გრძნობთ, რომ ერთმანეთს ხედავთ, ნდობა ნელ-ნელა მტკიცდება.",
    good: "მეგობრობა ვითარდება მაშინ, როცა საერთო რიტმს იპოვით.",
    mixed:
      "ფაზებში გადადიხართ — ხანდახან ახლოს, ხანდახან შორს. ეს არ გიშლით კარგად გაიცნოთ ერთმანეთი.",
    challenging:
      "მეგობრობას მეტი ცნობიერი მცდელობა სჭირდება — სხვადასხვაგვარად აღიქვამთ სამყაროს.",
  },
  communication: {
    excellent:
      "სიტყვების გადაცემა ხდება ისე, თითქოს ერთი ენიდან მეორეზე გადადიხართ. იდეების ნაპერწკლობაა.",
    strong: "გონება გონებას ხვდება — საუბარი ღრმავდება, არა ცხრება.",
    good: "კომუნიკაცია ვითარდება, თუ მიენდობით ერთმანეთის რიტმს.",
    mixed:
      "ხანდახან ვერ მოიხელთებთ ერთსა და იმავე ტალღას — სიჩუმე უფრო მრავლისმეტყველია, ვიდრე სიტყვა.",
    challenging:
      "გადახარისხება მნიშვნელოვანია — ერთმანეთის ენაზე საუბარი ისწავლეთ.",
  },
  growth: {
    excellent:
      "ერთად ხდებით მეტი, ვიდრე მარტო — ეს კავშირი ცხოვრების მნიშვნელოვან ეტაპებზე გექნებათ ფრთა.",
    strong: "ერთად ვითარდებით — წინ მიგიწოდებთ ერთმანეთს, არ გიჩერებთ.",
    good: "ნელი, საფუძვლიანი ზრდის შესაძლებლობა, თუ მცდელობას არ მოიშლით.",
    mixed:
      "ერთად ზრდას გადაკვეთები აქვს — ისწავლეთ, რომ სხვადასხვა ტემპით მოძრაობა ნორმალურია.",
    challenging:
      "მზადობა ერთმანეთის გავლენისთვის — სწორედ ეს განსაზღვრავს ერთად შორს წახვალთ თუ არა.",
  },
  chemistry: {
    excellent:
      "მიზიდვა ფიზიკურიც არის და ენერგეტიკულიც — მარსი და ვენერა ერთად ცეცხლავენ ცას.",
    strong: "ენერგიები ერთმანეთს ხვდებიან — სიახლოვე ცოცხალია.",
    good: "მცირე, თბილი ნაპერწკლები. ფლირტისთვის თუ დრო გექნებათ, გაუძღოლი.",
    mixed: "ვნება ცვალებადია — ხან ცეცხლი, ხან ჩუმი.",
    challenging:
      "ფიზიკური მიზიდვა ნაკლებად ვლინდება — ეს არ ნიშნავს, რომ კავშირი არ არის.",
  },
  business: {
    excellent:
      "საქმიანი ბმა იშვიათი ხარისხისაა — ერთობლივი მიზნები, შეთანხმებული რიტმი და ერთმანეთის გაძლიერების ბუნებრივი ნიჭი.",
    strong:
      "კარგი სამუშაო წყვილი — სტრუქტურა, კომუნიკაცია და ამბიცია ბუნებრივად ეჩვევა ერთიმეორეს.",
    good:
      "თანამშრომლობას პოტენციალი აქვს, თუ როლები მკაფიოდ გაინაწილეთ და მოლოდინი ღიად დაამყარეთ.",
    mixed:
      "სამუშაო ენერგია ცვალებადია — ხან ერთსა და იმავე ვექტორს მიყვებით, ხან ერთმანეთს ხელს უშლით. წერილობითი შეთანხმება დაგეხმარებათ.",
    challenging:
      "საქმიანი თანამშრომლობა მოითხოვს მკაფიო ჩარჩოს — განსხვავებული სამუშაო სტილი თუ პრიორიტეტები ხშირად ხახუნს იწვევს. პერსონალური სიახლოვე ალბათ უფრო ბუნებრივია, ვიდრე ერთად საქმის კეთება.",
  },
};

export function narrateCategory(
  cat: SynastryCategory,
  score: number
): string {
  return CATEGORY_NARRATIVE[cat][tierFromScore(score)];
}

// ────────────────────────────────────────────────────────────────────────
// Strengths × Growth split
// ────────────────────────────────────────────────────────────────────────

export type AspectGroup = {
  strengths: SynastryAspect[];
  growth: SynastryAspect[];
};

/**
 * Split aspects by valence. Conjunctions are filed under whichever bucket
 * is shorter so the columns stay roughly balanced visually — astrologically
 * a conjunction is neutral and reads either way depending on the planets.
 */
export function splitByValence(aspects: SynastryAspect[]): AspectGroup {
  const strengths: SynastryAspect[] = [];
  const growth: SynastryAspect[] = [];
  for (const a of aspects) {
    const v = aspectValence(a.kind);
    if (v === "harmonious") strengths.push(a);
    else if (v === "tense") growth.push(a);
    else (strengths.length <= growth.length ? strengths : growth).push(a);
  }
  return { strengths, growth };
}

export function overallNarrative(percent: number): string {
  // Thresholds mirror overallVerdict() in lib/synastry.ts — keep in sync.
  if (percent >= 88)
    return "ცის რუკები ერთიანი ნაკადით ხვდებიან — იშვიათი, ღრმა რეზონანსი.";
  if (percent >= 78)
    return "კავშირი ბუნებრივად მუშაობს — გასაკვირი არ იქნება, თუ ერთმანეთს კარგად გრძნობთ.";
  if (percent >= 66)
    return "ძლიერი საფუძველი არის — დრო და სიფრთხილე გააძლიერებს ბმას.";
  if (percent >= 55)
    return "კარგი პოტენციალი — როცა მცდელობას არ ეშინია, კავშირი ცოცხლდება.";
  if (percent >= 43)
    return "ცოცხალი დინამიკა, განსხვავებებითაც — ეს კავშირს არ ანდგრევს, აფერად-აქცევს.";
  if (percent >= 30)
    return "გამოწვევაა, რომელშიც ზრდა იმალება — ცნობიერი მუშაობით კავშირი მოულოდნელად ღრმავდება.";
  return "ხახუნიანი ენერგია — ბევრი წინააღმდეგობა, მაგრამ ვინც ერთად გადარჩება, ერთმანეთს ბოლომდე გაიცნობს.";
}
