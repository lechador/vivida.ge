/**
 * Reusable per-transit interpretation library — powers the daily horoscope.
 *
 * "Transiting Moon square natal Venus" means the same thing for every user
 * who has it today, so each finite combination is generated once with a
 * high-quality model, stored in transit_interpretation_library, and the
 * daily reading is COMPOSED from these rows (see composeDailyFromLibrary)
 * instead of one slow per-user AI call. Three kinds:
 *
 *   - aspect: (transiting body, aspect kind, natal point) — 10 × 5 × 13 = 650.
 *             Directional: the transiting body is today's sky, the natal
 *             point is the person — so no alphabetical key sorting here.
 *   - house:  (transiting body, natal house) — 10 × 12 = 120.
 *   - sign:   (fast body sun…mars, zodiac sign) — 5 × 12 = 60. The
 *             collective mood; slow bodies' sign is generational noise.
 *
 * Rows flagged `edited` are never overwritten by regeneration. The
 * generators here (OpenRouter) are the live self-heal path only — bulk
 * seeding uses scripts/seed-transit-library.mjs (Vertex AI).
 */

import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { transitInterpretationLibrary } from "@/db/schema";
import { BODIES } from "./zodiac";
import { HOUSES } from "./houses";
import { SIGNS } from "./zodiac";
import type { AspectKind } from "./aspects";
import { ASPECT_BODIES, ASPECT_KINDS, libraryKindKa } from "./aspect-library";
import type { CrossAspect } from "./transits";
import { usesEnglishCopy, type UserLocale } from "./i18n/locale";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Same higher-quality model used for the other libraries. */
export const TRANSIT_LIBRARY_MODEL = "google/gemini-3.1-pro-preview";

/** Bodies that transit (today's sky). Same 10 as lib/transits.ts computes. */
export const TRANSIT_LIBRARY_BODIES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

/** Fast movers whose current sign colors the day/week for everyone. */
export const TRANSIT_SIGN_BODIES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
] as const;

/** How long each transit's influence lasts — woven into prompts and copy. */
const TIMESCALE_KA: Record<string, string> = {
  moon: "დღეს (მთვარის ტრანზიტი 1-2 დღე გრძელდება)",
  sun: "ამ დღეებში (მზის ტრანზიტი რამდენიმე დღე გრძელდება)",
  mercury: "ამ დღეებში (რამდენიმე დღე გრძელდება)",
  venus: "ამ დღეებში (რამდენიმე დღე გრძელდება)",
  mars: "ამ კვირაში (დაახლოებით ერთი კვირა გრძელდება)",
  jupiter: "ამ პერიოდში (კვირები გრძელდება)",
  saturn: "ამ პერიოდში (კვირები და თვეები გრძელდება)",
  uranus: "ამ პერიოდში (თვეები გრძელდება)",
  neptune: "ამ პერიოდში (თვეები გრძელდება)",
  pluto: "ამ პერიოდში (თვეები გრძელდება)",
};

// ---------------------------------------------------------------------------
// Keys + combos
// ---------------------------------------------------------------------------

export function transitAspectKey(
  transit: string,
  kind: AspectKind,
  natal: string
): string {
  return `aspect:${transit}:${kind}:${natal}`;
}

export function transitHouseKey(transit: string, house: number): string {
  return `house:${transit}:${house}`;
}

export function transitSignKey(transit: string, sign: string): string {
  return `sign:${transit}:${sign}`;
}

export type TransitCombo = {
  key: string;
  kind: "aspect" | "house" | "sign";
  transit: string;
  aspectKind: AspectKind | null;
  subject: string;
};

/** Every possible combo: 650 aspect + 120 house + 60 sign = 830. */
export function allTransitCombos(): TransitCombo[] {
  const out: TransitCombo[] = [];
  for (const t of TRANSIT_LIBRARY_BODIES) {
    for (const kind of ASPECT_KINDS) {
      for (const n of ASPECT_BODIES) {
        out.push({
          key: transitAspectKey(t, kind, n),
          kind: "aspect",
          transit: t,
          aspectKind: kind,
          subject: n,
        });
      }
    }
    for (let h = 1; h <= 12; h++) {
      out.push({
        key: transitHouseKey(t, h),
        kind: "house",
        transit: t,
        aspectKind: null,
        subject: String(h),
      });
    }
  }
  for (const t of TRANSIT_SIGN_BODIES) {
    for (const s of SIGNS) {
      out.push({
        key: transitSignKey(t, s.key),
        kind: "sign",
        transit: t,
        aspectKind: null,
        subject: s.key,
      });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export type TransitEntry = { title: string; body: string };

const ASPECT_EN: Record<AspectKind, { label: string; dynamic: string; advice: string }> = {
  conjunction: {
    label: "conjunct",
    dynamic: "The two themes become concentrated and difficult to separate.",
    advice: "Give the combined energy one clear, constructive outlet.",
  },
  sextile: {
    label: "sextile",
    dynamic: "A useful opening appears, but it works best when you choose to use it.",
    advice: "Take the small opportunity instead of waiting for a perfect one.",
  },
  square: {
    label: "square",
    dynamic: "Friction makes the underlying need harder to ignore and asks for an adjustment.",
    advice: "Pause before reacting, then turn the pressure into one practical action.",
  },
  trine: {
    label: "trine",
    dynamic: "The two themes cooperate naturally and can restore momentum with less resistance.",
    advice: "Use the ease deliberately rather than assuming it will carry the day by itself.",
  },
  opposition: {
    label: "opposite",
    dynamic: "Two valid needs pull in different directions and become visible through contrast.",
    advice: "Make room for both sides before choosing the next step.",
  },
};

const TRANSIT_TIMESCALE_EN: Record<string, string> = {
  moon: "today and into tomorrow",
  sun: "over the next few days",
  mercury: "over the next several days",
  venus: "over the next several days",
  mars: "through this week",
  jupiter: "over the coming weeks",
  saturn: "over the coming weeks and months",
  uranus: "as a longer-term background influence",
  neptune: "as a longer-term background influence",
  pluto: "as a longer-term background influence",
};

function titleCase(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}

function englishTransitEntry(key: string): TransitEntry | null {
  const [kind, transit, subjectA, subjectB] = key.split(":");
  const transitMeta = BODIES[transit];
  const transitLabel = transitMeta?.labelEn ?? titleCase(transit);
  const transitMeaning = transitMeta?.meaningEn ?? "the way you direct this energy";
  const timescale = TRANSIT_TIMESCALE_EN[transit] ?? "during this period";

  if (kind === "aspect") {
    const aspectKind = subjectA as AspectKind;
    const aspect = ASPECT_EN[aspectKind];
    if (!aspect || !subjectB) return null;
    const natalMeta = BODIES[subjectB];
    const natalLabel = natalMeta?.labelEn ?? titleCase(subjectB);
    const natalMeaning = natalMeta?.meaningEn ?? "an established part of your natal pattern";
    return {
      title: `${transitLabel} ${aspect.label} natal ${natalLabel}`,
      body: `Transiting ${transitLabel} forms a ${aspect.label} aspect to your natal ${natalLabel} ${timescale}. ${transitLabel} activates ${transitMeaning.toLowerCase()}, while natal ${natalLabel} describes ${natalMeaning.toLowerCase()}. ${aspect.dynamic} ${aspect.advice}`,
    };
  }

  if (kind === "house") {
    const houseNumber = Number(subjectA);
    const house = HOUSES[houseNumber];
    if (!house) return null;
    return {
      title: `${transitLabel} activates your ${houseNumber}${houseNumber === 1 ? "st" : houseNumber === 2 ? "nd" : houseNumber === 3 ? "rd" : "th"} house`,
      body: `Transiting ${transitLabel} moves through your ${house.labelEn} ${timescale}, drawing attention to ${house.themeEn.toLowerCase()}. ${transitMeaning} becomes easier to notice through this area of life. Choose one concrete way to engage with it instead of spreading your attention too widely.`,
    };
  }

  if (kind === "sign") {
    const sign = SIGNS.find((item) => item.key === subjectA);
    if (!sign) return null;
    return {
      title: `${transitLabel} in ${sign.labelEn}`,
      body: `${transitLabel} is moving through ${sign.labelEn} ${timescale}, giving the shared atmosphere a more ${sign.labelEn}-like rhythm. ${transitMeaning} is expressed with greater emphasis on ${sign.element === "ცეცხლი" ? "initiative and expression" : sign.element === "მიწა" ? "stability and practical results" : sign.element === "ჰაერი" ? "ideas, exchange, and perspective" : "feeling, intuition, and emotional context"}. Work with the mood consciously rather than treating it as a fixed prediction.`,
    };
  }

  return null;
}

/**
 * Batched read: key → {title, body} for the requested keys. Pure read —
 * never generates. Editing a row in the admin reflects on next compose.
 */
export async function getTransitLibraryEntries(
  keys: string[],
  locale: UserLocale = "ka",
): Promise<Map<string, TransitEntry>> {
  if (keys.length === 0) return new Map();
  // English is composed programmatically from label tables, so it never needs
  // a row and can't have gaps.
  if (locale === "en") {
    return new Map(
      keys
        .map((key) => [key, englishTransitEntry(key)] as const)
        .filter((entry): entry is readonly [string, TransitEntry] => Boolean(entry[1])),
    );
  }

  // Georgian and Armenian both live in the table, one row per (key, language).
  const rows = await db
    .select({
      key: transitInterpretationLibrary.key,
      title: transitInterpretationLibrary.title,
      body: transitInterpretationLibrary.body,
    })
    .from(transitInterpretationLibrary)
    .where(
      and(
        inArray(transitInterpretationLibrary.key, keys),
        eq(transitInterpretationLibrary.language, locale),
      ),
    );
  const found = new Map(rows.map((r) => [r.key, { title: r.title, body: r.body }]));

  // A missing Armenian row must fall back to ENGLISH, never to the Georgian
  // row that shares its key — Georgian script on an Armenian page is the
  // worse of the two failures, and it is the exact bug this table caused
  // before it could hold a second language. `composeDailyFromLibrary` aborts
  // the whole composition on any gap, so without this a single untranslated
  // combo would drop the reader onto the full-AI path for the entire day.
  if (locale !== "ka") {
    for (const key of keys) {
      if (found.has(key)) continue;
      const fallback = englishTransitEntry(key);
      if (fallback) found.set(key, fallback);
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// Prompts + live self-heal generation (OpenRouter)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT =
  "შენ ხარ გამოცდილი ქართველი ასტროლოგი და მწერალი. წერ ბუნებრივ, მდიდარ, " +
  "ლიტერატურულ ქართულად — გრამატიკულად უნაკლო, ცოცხალი და კონკრეტული. " +
  "თავიდან აიცილე თარგმანის სტილი, გამეორებები და კლიშეები " +
  '("ვარსკვლავები გელიან", "მიენდე სამყაროს"). ' +
  'დააბრუნე მხოლოდ JSON: {"title": "...", "body": "..."} — title არის ' +
  "მოკლე სათაური (3-6 სიტყვა, წერტილის გარეშე), body — ტექსტი.";

/** Build the user prompt for one combo. Short daily copy, not natal essays. */
export function buildTransitPrompt(combo: TransitCombo): string {
  const t = BODIES[combo.transit];
  const tLabel = t?.labelKa ?? combo.transit;
  const tMeaning = t?.meaningKa ?? "";
  const timescale = TIMESCALE_KA[combo.transit] ?? "ამ პერიოდში";

  if (combo.kind === "aspect") {
    const n = BODIES[combo.subject];
    const nLabel = n?.labelKa ?? combo.subject;
    const nMeaning = n?.meaningKa ?? "";
    const kindKa = libraryKindKa(combo.aspectKind!);
    return (
      `დაწერე დღიური ტრანზიტის ინტერპრეტაცია: ტრანზიტული ${tLabel} ${kindKa} ` +
      `ნატალურ ${nLabel}-სთან.\n` +
      `ტრანზიტული ${tLabel} — დღევანდელი ცის ენერგია (${tMeaning}). ` +
      `ნატალური ${nLabel} — ადამიანის თანდაყოლილი თვისება (${nMeaning}).\n` +
      `დროის მასშტაბი: ${timescale}.\n\n` +
      `2-4 წინადადება (დაახ. 40-70 სიტყვა), "შენ"-ის ფორმა. ახსენი რა იგრძნობა ` +
      `დღეს ამ ტრანზიტით და ერთი კონკრეტული, პრაქტიკული რჩევა. ` +
      `title იყოს ამ დღის განწყობის მოკლე, ცოცხალი ფორმულირება.`
    );
  }

  if (combo.kind === "house") {
    const h = HOUSES[Number(combo.subject)];
    return (
      `დაწერე დღიური ტრანზიტის ინტერპრეტაცია: ტრანზიტული ${tLabel} გადის ` +
      `ნატალურ ${h.labelKa}-ში (${h.themeKa}).\n` +
      `${tLabel} — ${tMeaning}. ${h.labelKa} — ${h.meaningKa}\n` +
      `დროის მასშტაბი: ${timescale}.\n\n` +
      `2-3 წინადადება (დაახ. 35-60 სიტყვა), "შენ"-ის ფორმა. რომელი ცხოვრების ` +
      `სფერო აქტიურდება და როგორ გამოიყენო ეს დღეს. ` +
      `title იყოს მოკლე და კონკრეტული.`
    );
  }

  const s = SIGNS.find((x) => x.key === combo.subject);
  const sLabel = s?.labelKa ?? combo.subject;
  return (
    `დაწერე დღიური ტრანზიტის ინტერპრეტაცია: ${tLabel} ახლა ${sLabel}-შია — ` +
    `ეს ყველასთვის საერთო, კოლექტიური განწყობაა.\n` +
    `${tLabel} — ${tMeaning}. ${sLabel}-ის ელემენტი: ${s?.element ?? ""}, ` +
    `მოდალობა: ${s?.modality ?? ""}.\n` +
    `დროის მასშტაბი: ${timescale}.\n\n` +
    `2-3 წინადადება (დაახ. 35-60 სიტყვა), "შენ"-ის ფორმა. როგორი ემოციური/` +
    `ენერგეტიკული ფონია დღეს ამ განლაგებით და რას უწყობს ხელს. ` +
    `title იყოს დღის განწყობის მოკლე ფორმულირება.`
  );
}

interface OpenRouterJson {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message: string };
}

/** Parse the model's {"title","body"} JSON, tolerating code fences. */
export function parseTransitEntryJson(raw: string): TransitEntry {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
  const parsed = JSON.parse(stripped) as Partial<TransitEntry>;
  if (!parsed.title || !parsed.body) throw new Error("missing title/body");
  return { title: parsed.title.trim(), body: parsed.body.trim() };
}

/** Generate one entry via OpenRouter (live self-heal path). Throws on error. */
export async function generateTransitEntry(
  combo: TransitCombo
): Promise<TransitEntry> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vivida.ge",
      "X-Title": "Vivida transit library",
    },
    body: JSON.stringify({
      model: TRANSIT_LIBRARY_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildTransitPrompt(combo) },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      // gemini-3.1-pro always reasons — leave headroom past the thinking budget.
      max_tokens: 8000,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = (await res.json()) as OpenRouterJson;
  if (json.error) throw new Error(`OpenRouter: ${json.error.message}`);
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error(`empty entry for ${combo.key}`);
  return parseTransitEntryJson(raw);
}

/**
 * Ensure rows exist for the given combos, generating any missing ones and
 * persisting them. Background/self-heal path — callers should NOT await this
 * on a render path; gaps fall back to the full-AI daily instead.
 */
export async function ensureTransitLibraryFor(
  combos: TransitCombo[]
): Promise<void> {
  // Georgian only. `generateTransitEntry`'s prompt is Georgian, so this can
  // only ever produce a `ka` row — now that (key, language) is the primary
  // key, the language has to be stated rather than left to the column
  // default, or a future generator would silently overwrite Georgian.
  // Armenian is backfilled by scripts/translate-transit-library.mjs; a gap
  // there falls back to English at read time rather than being generated
  // live, so an Armenian reader never waits on a model call.
  const have = await getTransitLibraryEntries(combos.map((c) => c.key), "ka");
  const missing = combos.filter((c) => !have.has(c.key));
  for (const c of missing) {
    try {
      const entry = await generateTransitEntry(c);
      await db
        .insert(transitInterpretationLibrary)
        .values({
          key: c.key,
          kind: c.kind,
          transit: c.transit,
          aspectKind: c.aspectKind,
          subject: c.subject,
          title: entry.title,
          body: entry.body,
          model: TRANSIT_LIBRARY_MODEL,
          language: "ka",
        })
        .onConflictDoNothing();
    } catch (err) {
      console.warn(
        `[transit-library] generate failed for ${c.key}:`,
        (err as Error).message
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Daily composition
// ---------------------------------------------------------------------------

/** The day's computed transit facts, with sign KEYS (not English labels). */
export type TransitDayFacts = {
  moon: { sign: string; house: number | null; aspects: CrossAspect[] };
  sun: { house: number | null };
  innerAspects: CrossAspect[];
  outerAspects: CrossAspect[];
};

/** Theme chip per transiting body — composed dailies pick from these. */
const BODY_THEME_KA: Record<string, string> = {
  sun: "იდენტობა",
  moon: "ემოციები",
  mercury: "კომუნიკაცია",
  venus: "ურთიერთობები",
  mars: "ენერგია",
  jupiter: "ზრდა",
  saturn: "სტრუქტურა",
  uranus: "ცვლილება",
  neptune: "ინტუიცია",
  pluto: "ტრანსფორმაცია",
};

const BODY_THEME_EN: Record<string, string> = {
  sun: "Identity",
  moon: "Emotions",
  mercury: "Communication",
  venus: "Relationships",
  mars: "Energy",
  jupiter: "Growth",
  saturn: "Structure",
  uranus: "Change",
  neptune: "Intuition",
  pluto: "Transformation",
};

/** How many of each aspect category the composed reading uses. */
const COMPOSE_LIMITS = { moon: 3, inner: 2, outer: 1 } as const;

function aspectCombo(a: CrossAspect): TransitCombo {
  return {
    key: transitAspectKey(a.transit, a.kind, a.natal),
    kind: "aspect",
    transit: a.transit,
    aspectKind: a.kind,
    subject: a.natal,
  };
}

/**
 * The exact combos composeDailyFromLibrary would use for these facts.
 * Composition runs only when ALL of them have library rows.
 */
export function combosForDay(facts: TransitDayFacts): TransitCombo[] {
  const out: TransitCombo[] = [];
  out.push({
    key: transitSignKey("moon", facts.moon.sign),
    kind: "sign",
    transit: "moon",
    aspectKind: null,
    subject: facts.moon.sign,
  });
  if (facts.moon.house) {
    out.push({
      key: transitHouseKey("moon", facts.moon.house),
      kind: "house",
      transit: "moon",
      aspectKind: null,
      subject: String(facts.moon.house),
    });
  }
  if (facts.sun.house) {
    out.push({
      key: transitHouseKey("sun", facts.sun.house),
      kind: "house",
      transit: "sun",
      aspectKind: null,
      subject: String(facts.sun.house),
    });
  }
  for (const a of facts.moon.aspects.slice(0, COMPOSE_LIMITS.moon))
    out.push(aspectCombo(a));
  for (const a of facts.innerAspects.slice(0, COMPOSE_LIMITS.inner))
    out.push(aspectCombo(a));
  for (const a of facts.outerAspects.slice(0, COMPOSE_LIMITS.outer))
    out.push(aspectCombo(a));
  return out;
}

export type ComposedDaily = {
  headline: string;
  summary: string;
  body: string;
  themes: string[];
};

/**
 * Compose the daily reading purely from library entries — zero AI calls.
 * Returns null if any needed entry is missing (caller falls back to the
 * full-AI path and self-heals the gap in the background).
 *
 * Shape mirrors the AI reading: headline from the strongest transit's title,
 * summary = the collective Moon-sign mood, body = Moon house → Moon aspects
 * → week background (inner) → long-term backdrop (outer) paragraphs.
 */
export function composeDailyFromLibrary(
  facts: TransitDayFacts,
  entries: Map<string, TransitEntry>,
  locale: UserLocale = "ka",
): ComposedDaily | null {
  const need = (key: string): TransitEntry | null => entries.get(key) ?? null;

  const moonSign = need(transitSignKey("moon", facts.moon.sign));
  if (!moonSign) return null;

  const moonHouse = facts.moon.house
    ? need(transitHouseKey("moon", facts.moon.house))
    : null;
  if (facts.moon.house && !moonHouse) return null;

  const sunHouse = facts.sun.house
    ? need(transitHouseKey("sun", facts.sun.house))
    : null;
  if (facts.sun.house && !sunHouse) return null;

  const collect = (aspects: CrossAspect[], limit: number) => {
    const out: Array<{ aspect: CrossAspect; entry: TransitEntry }> = [];
    for (const a of aspects.slice(0, limit)) {
      const entry = need(transitAspectKey(a.transit, a.kind, a.natal));
      if (!entry) return null; // any gap → whole composition aborts
      out.push({ aspect: a, entry });
    }
    return out;
  };

  const moonAspects = collect(facts.moon.aspects, COMPOSE_LIMITS.moon);
  const innerAspects = collect(facts.innerAspects, COMPOSE_LIMITS.inner);
  const outerAspects = collect(facts.outerAspects, COMPOSE_LIMITS.outer);
  if (!moonAspects || !innerAspects || !outerAspects) return null;

  // Headline: the tightest Moon aspect leads the day; quiet days fall back
  // to the Moon's house, then its sign.
  const headline =
    moonAspects[0]?.entry.title ?? moonHouse?.title ?? moonSign.title;

  const paragraphs: string[] = [];
  if (moonHouse) paragraphs.push(moonHouse.body);
  for (const m of moonAspects) paragraphs.push(m.entry.body);
  // Quiet Moon days get the slower Sun-house backdrop as filler context.
  if (sunHouse && moonAspects.length <= 1) paragraphs.push(sunHouse.body);
  for (const i of innerAspects) paragraphs.push(i.entry.body);
  for (const o of outerAspects) paragraphs.push(o.entry.body);
  if (paragraphs.length === 0) paragraphs.push(moonSign.body);

  // Themes: one chip per distinct transiting body involved, Moon first.
  const bodies: string[] = ["moon"];
  for (const { aspect } of [...moonAspects, ...innerAspects, ...outerAspects]) {
    if (!bodies.includes(aspect.transit)) bodies.push(aspect.transit);
  }
  const themes = bodies
    .map((b) => (usesEnglishCopy(locale) ? BODY_THEME_EN[b] : BODY_THEME_KA[b]))
    .filter(Boolean)
    .slice(0, 4);

  return {
    headline,
    summary: moonSign.body,
    body: paragraphs.join("\n\n"),
    themes,
  };
}

// ---------------------------------------------------------------------------
// Weekly forecast composition
// ---------------------------------------------------------------------------

export type WeeklyDayDriver = {
  transit: string;
  natal: string;
  kind: string;
  family: "harmonic" | "tense" | "neutral";
};

export type WeeklyDayInput = {
  dateIso: string;
  moonSignKey: string;
  drivers: WeeklyDayDriver[];
};

export type WeeklyDayNarrative = {
  dateIso: string;
  headline: string;
  harmonicReason: string;
  challengingReason: string;
  advice: string;
};

/** Last-resort copy for days genuinely missing a whole aspect family —
 *  rotated by day index so consecutive quiet days don't repeat. */
const NO_HARMONIC_KA = [
  "დიდი შეღავათები ამ დღეს არ ჩანს — მშვიდი, სამუშაო ფონია, სადაც პროგრესს შენ თვითონ ქმნი.",
  "ცა ამ დღეს ნეიტრალურია — მხარდაჭერა პატარა, შენივე შექმნილი წესრიგიდან მოვა.",
];
const NO_TENSE_KA = [
  "სერიოზული ხახუნი ამ დღეს არ ჩანს — მხოლოდ ნუ გადატვირთავ განრიგს, სიმშვიდე შენს სასარგებლოდ მუშაობს.",
  "დაძაბული ასპექტები ამ დღეს თითქმის არ არის — ერთადერთი რისკი ზედმეტი თვითკმაყოფილებაა.",
];
const NO_HARMONIC_EN = [
  "No major supportive aspect dominates this day, so progress comes through your own pacing, preparation, and steady follow-through.",
  "The background is relatively neutral; small routines and clear priorities will provide more support than waiting for a dramatic opening.",
];
const NO_TENSE_EN = [
  "No major tense aspect dominates this day. Keep the schedule realistic and let the calmer rhythm work in your favor.",
  "Friction is comparatively light today; the main risk is overconfidence or taking an easy opening for granted.",
];

/**
 * Compose the 7-day narratives purely from library entries — zero AI calls.
 * Per day: headline = strongest driver's title, reasons = strongest
 * harmonic/tense drivers' bodies, advice = that day's Moon-sign mood.
 * Slow transits drive several days in a row, so each pick prefers an entry
 * not yet used in that field earlier in the week — the week reads varied
 * instead of repeating one Pluto aspect four times.
 *
 * Returns null if any needed entry is missing (caller falls back to AI).
 */
export async function composeWeeklyFromLibrary(
  days: WeeklyDayInput[],
  locale: UserLocale = "ka",
): Promise<WeeklyDayNarrative[] | null> {
  const keys = new Set<string>();
  for (const d of days) {
    keys.add(transitSignKey("moon", d.moonSignKey));
    for (const dr of d.drivers) {
      keys.add(transitAspectKey(dr.transit, dr.kind as AspectKind, dr.natal));
    }
  }
  const entries = await getTransitLibraryEntries([...keys], locale);

  const usedHeadline = new Set<string>();
  const usedHarmonic = new Set<string>();
  const usedTense = new Set<string>();

  // Prefer the strongest driver whose entry hasn't been used for this field
  // yet this week. When every candidate has already appeared (slow transits
  // dominate whole weeks), rotate through them by day index instead of
  // repeating the strongest one every remaining day.
  const pick = (
    drivers: WeeklyDayDriver[],
    used: Set<string>,
    dayIndex: number
  ): { key: string; entry: TransitEntry } | null => {
    const candidates: Array<{ key: string; entry: TransitEntry }> = [];
    for (const dr of drivers) {
      const key = transitAspectKey(dr.transit, dr.kind as AspectKind, dr.natal);
      const entry = entries.get(key);
      if (!entry) continue;
      candidates.push({ key, entry });
      if (!used.has(key)) {
        used.add(key);
        return { key, entry };
      }
    }
    if (candidates.length === 0) return null;
    return candidates[dayIndex % candidates.length];
  };

  const out: WeeklyDayNarrative[] = [];
  for (let i = 0; i < days.length; i++) {
    const d = days[i];
    const moonSign = entries.get(transitSignKey("moon", d.moonSignKey));
    if (!moonSign) return null;

    // Any driver missing its library row → abort to the AI path. With the
    // library fully seeded this only happens for brand-new chart points.
    for (const dr of d.drivers) {
      const key = transitAspectKey(dr.transit, dr.kind as AspectKind, dr.natal);
      if (!entries.has(key)) return null;
    }

    const harmonic = pick(d.drivers.filter((x) => x.family === "harmonic"), usedHarmonic, i);
    const tense = pick(d.drivers.filter((x) => x.family === "tense"), usedTense, i);
    const neutral = d.drivers.filter((x) => x.family === "neutral");
    const neutralEntry =
      neutral.length > 0
        ? entries.get(
            transitAspectKey(neutral[0].transit, neutral[0].kind as AspectKind, neutral[0].natal)
          ) ?? null
        : null;

    const headlinePick = pick(d.drivers, usedHeadline, i);
    const headline = headlinePick?.entry.title ?? moonSign.title;

    // The neutral entry can stand in for at most ONE missing side — never
    // both, or the two reasons would read identically.
    const harmonicReason =
      harmonic?.entry.body ??
      neutralEntry?.body ??
      (usesEnglishCopy(locale)
        ? NO_HARMONIC_EN[i % NO_HARMONIC_EN.length]
        : NO_HARMONIC_KA[i % NO_HARMONIC_KA.length]);
    const challengingReason =
      tense?.entry.body ??
      (harmonic ? neutralEntry?.body : null) ??
      (usesEnglishCopy(locale)
        ? NO_TENSE_EN[i % NO_TENSE_EN.length]
        : NO_TENSE_KA[i % NO_TENSE_KA.length]);

    out.push({
      dateIso: d.dateIso,
      headline,
      harmonicReason,
      challengingReason,
      advice: moonSign.body,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Read-time overlay for the transit-breakdown UI
// ---------------------------------------------------------------------------

export type TransitBreakdownItem = {
  transit: string;
  natal: string;
  /** Aspect kind — string, matching how topAspects is persisted in jsonb. */
  kind: string;
  orb: number;
  title: string;
  body: string;
};

/**
 * Map stored top aspects (dailyHoroscopes.transits.topAspects) to their
 * library interpretations for display. Aspects without a library row yet are
 * skipped — the section simply shows fewer items until the seed completes.
 */
export async function overlayTransitAspects(
  aspects: Array<{ transit: string; natal: string; kind: string; orb: number }>,
  limit = 5,
  locale: UserLocale = "ka",
): Promise<TransitBreakdownItem[]> {
  const top = aspects.slice(0, limit * 2); // over-fetch: some may lack rows
  const entries = await getTransitLibraryEntries(
    top.map((a) => transitAspectKey(a.transit, a.kind as AspectKind, a.natal)),
    locale,
  );
  const out: TransitBreakdownItem[] = [];
  for (const a of top) {
    const entry = entries.get(
      transitAspectKey(a.transit, a.kind as AspectKind, a.natal)
    );
    if (!entry) continue;
    out.push({
      transit: a.transit,
      natal: a.natal,
      kind: a.kind,
      orb: a.orb,
      title: entry.title,
      body: entry.body,
    });
    if (out.length >= limit) break;
  }
  return out;
}
