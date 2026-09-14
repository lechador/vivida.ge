import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  doublePrecision,
  date,
  jsonb,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import type { ChineseCompatItem } from "./messaging";

/**
 * Globally-cached moon phase + Gemini interpretation, one row per UTC date.
 * Universal (not per-user) — the moon's phase + sign is the same for everyone
 * on a given day, so a single row is served to all users.
 *
 * Cache invalidates by bumping `promptVersion` after a prompt change.
 */
export const moonPhases = pgTable("moon_phase", {
  /** UTC date (YYYY-MM-DD). Single PK, no userId. */
  date: date("date", { mode: "string" }).primaryKey(),
  /** "new_moon", "waxing_crescent", ... 8 canonical phases. */
  phaseKey: text("phase_key").notNull(),
  phaseLabelKa: text("phase_label_ka").notNull(),
  /** Sign the moon currently transits. */
  signEn: text("sign_en").notNull(),
  signKa: text("sign_ka").notNull(),
  signIndex: integer("sign_index").notNull(),
  /** Sun-Moon angular separation in degrees, 0..360. */
  phaseAngle: doublePrecision("phase_angle").notNull(),
  /** 0..1, fraction of disk illuminated. */
  illumination: doublePrecision("illumination").notNull(),
  /** 0..29.53, days since previous new moon. */
  ageDays: doublePrecision("age_days").notNull(),
  headline: text("headline").notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  themes: jsonb("themes").$type<string[]>().notNull().default([]),
  promptVersion: integer("prompt_version").notNull().default(1),
  model: text("model").notNull(),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Per-sun-sign horoscope readings for SEO landing pages. Unlike
 * dailyHoroscopes (per user, requires natal chart), these are universal
 * for everyone with that sun sign — generated once per (sign, period,
 * periodKey) and served to anonymous visitors at /zodiac/[sign]/dghes,
 * /kviris-horoskopi, /tvis-horoskopi.
 *
 * `period` is one of "day" | "week" | "month".
 * `periodKey` shape per period:
 *   - day   → "YYYY-MM-DD"            (today in Asia/Tbilisi)
 *   - week  → "YYYY-Www"              (ISO week, Monday-anchored)
 *   - month → "YYYY-MM"
 *
 * Composite PK on (sign, period, periodKey) makes upsert idempotent;
 * `promptVersion` lets us invalidate after a prompt-quality change.
 */
export const signHoroscopes = pgTable(
  "sign_horoscope",
  {
    /** zodiac slug — see ALL_SLUGS in lib/seo/zodiac-dates */
    sign: text("sign").notNull(),
    /** "day" | "week" | "month" */
    period: text("period").notNull(),
    /** date / ISO-week / YYYY-MM, see comment above */
    periodKey: text("period_key").notNull(),
    headline: text("headline").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    themes: jsonb("themes").$type<string[]>().notNull().default([]),
    promptVersion: integer("prompt_version").notNull().default(1),
    model: text("model").notNull(),
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.sign, t.period, t.periodKey] })],
);

/**
 * Evergreen "ranking" listicles ("ყველაზე ჭკვიანი / ეჭვიანი … ნიშნები").
 * One row per topic — all 12 signs ranked by a trait. Generated on-demand
 * by the SEO page and cached; `promptVersion` invalidates after a prompt
 * change. `items` is the ordered ranking.
 */
export type SignRankingItem = {
  /** zodiac slug — see ALL_SLUGS */
  slug: string;
  /** 1 = most, 12 = least */
  rank: number;
  blurb: string;
};

export const signRankings = pgTable("sign_ranking", {
  /** topic slug — see RANKING_TOPICS in lib/seo/rankings */
  topic: text("topic").primaryKey(),
  headline: text("headline").notNull(),
  intro: text("intro").notNull(),
  items: jsonb("items").$type<SignRankingItem[]>().notNull(),
  faq: jsonb("faq").$type<{ q: string; a: string }[]>().notNull().default([]),
  promptVersion: integer("prompt_version").notNull().default(1),
  model: text("model").notNull(),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type SignRanking = typeof signRankings.$inferSelect;

/**
 * Reusable per-placement interpretation library — shared across all users.
 * One row per (subject, sign): subject ∈ sun/moon/mercury…/pluto/ascendant,
 * sign ∈ aries…pisces. `key` is `${subject}:${sign}` (e.g. "sun:scorpio").
 *
 * These are the sign-level texts that read identically for everyone with the
 * same placement, so we generate them once and reuse them — the report's
 * Big Three + planet sections pull from here at render time instead of a
 * per-user AI call. `edited=true` marks a human-curated row so regeneration
 * leaves it alone. Editable from the admin panel (same DB).
 */
export const interpretationLibrary = pgTable("interpretation_library", {
  /** `${subject}:${sign}`, e.g. "venus:leo". */
  key: text("key").primaryKey(),
  /** Placement subject: sun/moon/mercury/…/pluto/ascendant. */
  subject: text("subject").notNull(),
  /** Sign key: aries…pisces. */
  sign: text("sign").notNull(),
  /** Georgian interpretation text shown in the report. */
  body: text("body").notNull(),
  /** Model id that produced it, "curated", or "manual" after an admin edit. */
  model: text("model").notNull(),
  /** True once a human edits it — regeneration skips edited rows. */
  edited: boolean("edited").notNull().default(false),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type InterpretationLibraryRow =
  typeof interpretationLibrary.$inferSelect;

/**
 * Reusable per-aspect interpretation library — the aspect counterpart of
 * `interpretation_library`. One row per (planetA, planetB, kind), e.g.
 * "Sun conjunction Moon" reads identically for every user who has it, so we
 * generate each once and reuse it. `key` is `aspectKey(a, b, kind)` — the
 * SAME alphabetically-sorted "<a>-<b>-<kind>" id already used as the map key
 * in ChartInterpretationJson.aspects, so no translation layer is needed at
 * the call site. `edited=true` marks a human-curated row so regeneration
 * leaves it alone. Editable from the admin panel (same DB).
 */
export const aspectInterpretationLibrary = pgTable(
  "aspect_interpretation_library",
  {
    /** `aspectKey(a, b, kind)`, e.g. "moon-sun-square". */
    key: text("key").primaryKey(),
    /** Body keys, alphabetically sorted (a < b) — matches aspectKey's order. */
    planetA: text("planet_a").notNull(),
    planetB: text("planet_b").notNull(),
    /** conjunction | sextile | square | trine | opposition */
    kind: text("kind").notNull(),
    /** Georgian interpretation text shown in the report. */
    body: text("body").notNull(),
    /** Model id that produced it, "curated", or "manual" after an admin edit. */
    model: text("model").notNull(),
    /** True once a human edits it — regeneration skips edited rows. */
    edited: boolean("edited").notNull().default(false),
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export type AspectInterpretationLibraryRow =
  typeof aspectInterpretationLibrary.$inferSelect;

/**
 * Reusable synastry (compatibility) interpretation library — the two-chart
 * counterpart of the natal aspect/house libraries. "One person's Sun square
 * the other's Moon" reads identically for every pair that has it, so each
 * finite combination is generated once (rich Georgian, direction-neutral
 * wording — never "your"/"their", since either partner may be A or B) and
 * reused on every profile compatibility view. Two kinds:
 *
 *   - `kind='aspect'`  — (planetA, planetB, aspectKind): a cross-chart aspect
 *                        between the two people's planets. Pair is unordered
 *                        (A's Sun △ B's Moon ≡ A's Moon △ B's Sun), keys use
 *                        sorted body names: 91 pairs × 5 kinds = 455 rows.
 *   - `kind='overlay'` — (planetA, house): one person's planet falling in the
 *                        other's house. 13 bodies × 12 houses = 156 rows.
 *
 * `key` is `aspect:${a}-${b}-${kind}` or `overlay:${body}-${house}`.
 * `edited=true` marks a human-curated row so regeneration leaves it alone.
 */
export const synastryInterpretationLibrary = pgTable(
  "synastry_interpretation_library",
  {
    key: text("key").primaryKey(),
    /** 'aspect' | 'overlay' */
    kind: text("kind").notNull(),
    /** Body key; for aspects the alphabetically-first of the pair. */
    planetA: text("planet_a").notNull(),
    /** Aspects only: the alphabetically-second body. */
    planetB: text("planet_b"),
    /** Aspects only: conjunction | sextile | square | trine | opposition. */
    aspectKind: text("aspect_kind"),
    /** Overlays only: 1–12 — whose-ever house the planet lands in. */
    house: integer("house"),
    /** Georgian interpretation shown on the compatibility view. */
    body: text("body").notNull(),
    /** Model id that produced it, "curated", or "manual" after an admin edit. */
    model: text("model").notNull(),
    edited: boolean("edited").notNull().default(false),
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("synastry_library_kind_idx").on(t.kind)],
);

export type SynastryInterpretationLibraryRow =
  typeof synastryInterpretationLibrary.$inferSelect;

/**
 * Reusable per-house interpretation library — the house counterpart of the
 * sign/aspect libraries. Unlike a planet-in-sign or a two-planet aspect, a
 * house's full meaning depends on BOTH its cusp sign AND which (variable,
 * unbounded) set of planets occupy it, so it isn't a single finite lookup.
 * We decompose it into two reusable, finite pieces instead:
 *
 *   - `kind='cusp'`     — (house, sign): "what this life area looks like
 *                          under this sign" — 12 houses × 12 signs = 144.
 *   - `kind='occupant'` — (house, planet): "what it means for this planet's
 *                          energy to be active in this life area" —
 *                          12 houses × 11 planets = 132.
 *
 * At render time the cusp text + each occupant's text are composed into the
 * single string the report shows for that house (see actions/chart.ts).
 * `key` is `${kind}:${house}:${subject}` (subject = sign key or planet key).
 * `edited=true` marks a human-curated row so regeneration leaves it alone.
 */
export const houseInterpretationLibrary = pgTable(
  "house_interpretation_library",
  {
    /** `${kind}:${house}:${subject}`, e.g. "cusp:4:cancer", "occupant:4:moon". */
    key: text("key").primaryKey(),
    /** 'cusp' | 'occupant' */
    kind: text("kind").notNull(),
    /** House number 1-12. */
    house: integer("house").notNull(),
    /** Sign key (cusp) or planet key (occupant). */
    subject: text("subject").notNull(),
    /** Georgian interpretation text shown in the report. */
    body: text("body").notNull(),
    /** Model id that produced it, "curated", or "manual" after an admin edit. */
    model: text("model").notNull(),
    /** True once a human edits it — regeneration skips edited rows. */
    edited: boolean("edited").notNull().default(false),
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export type HouseInterpretationLibraryRow =
  typeof houseInterpretationLibrary.$inferSelect;

/**
 * Reusable per-transit interpretation library — the daily-horoscope
 * counterpart of the natal libraries above. A transit means the same thing
 * for every user who has it ("transiting Moon square natal Venus" reads
 * identically for everyone), so each finite combination is generated once
 * and the daily reading is COMPOSED from these rows at generation time —
 * zero per-user AI calls (see actions/daily.ts). Three kinds:
 *
 *   - `kind='aspect'` — (transiting body, aspect kind, natal point):
 *                        10 × 5 × 13 = 650. Direction matters — transiting
 *                        Moon → natal Venus ≠ transiting Venus → natal Moon.
 *   - `kind='house'`  — (transiting body, natal house): 10 × 12 = 120,
 *                        "this energy is moving through this life area".
 *   - `kind='sign'`   — (fast body sun…mars, zodiac sign): 5 × 12 = 60,
 *                        the collective daily/weekly mood (same for everyone).
 *
 * `key` is `${kind}:${transit}:${subject}` where subject is
 * `${aspectKind}:${natalBody}`, a house number, or a sign key.
 * `title` is a short headline used both as the daily reading's headline
 * (strongest transit wins) and as the label in the transit-breakdown UI.
 * `edited=true` marks a human-curated row so regeneration leaves it alone.
 */
export const transitInterpretationLibrary = pgTable(
  "transit_interpretation_library",
  {
    /** e.g. "aspect:moon:square:venus", "house:mars:7", "sign:moon:leo". */
    key: text("key").notNull(),
    /** 'aspect' | 'house' | 'sign' */
    kind: text("kind").notNull(),
    /** Transiting body key (sun…pluto). */
    transit: text("transit").notNull(),
    /** Aspect kind for kind='aspect', else null. */
    aspectKind: text("aspect_kind"),
    /** Natal point key (aspect), house number as text (house), or sign key (sign). */
    subject: text("subject").notNull(),
    /** Short headline (3-7 words), in `language`. */
    title: text("title").notNull(),
    /** Interpretation text (2-4 sentences), in `language`. */
    body: text("body").notNull(),
    /** Model id that produced it, "curated", or "manual" after an admin edit. */
    model: text("model").notNull(),
    /** True once a human edits it — regeneration skips edited rows. */
    edited: boolean("edited").notNull().default(false),
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    /**
     * (key, language) — NOT key alone.
     *
     * `language` has existed since the table was created, but `key` was the
     * primary key, so the table could physically hold only ONE row per combo
     * and every row was Georgian. That is why the Armenian daily horoscope
     * came back in Georgian script: the reader's locale selected this table
     * and the table had nothing else to give. Widening the key is what lets
     * a translated row sit alongside its Georgian original.
     */
    primaryKey({
      columns: [table.key, table.language],
      name: "transit_interpretation_library_pkey",
    }),
  ],
);

export type TransitInterpretationLibraryRow =
  typeof transitInterpretationLibrary.$inferSelect;

/**
 * Reusable moon-phase reading library. A moon-phase reading is collective
 * (same for everyone) and fully determined by (phase, moon sign) — the
 * illumination % and cycle age are numeric garnish, not interpretation
 * inputs. 8 phases × 12 signs = 96 combos, each holding the COMPLETE
 * reading shape the daily moon_phase row uses (headline/summary/body/
 * themes), so ensureMoonPhase copies a library row instead of calling the
 * model. `key` is `${phaseKey}:${signKey}`, e.g. "full_moon:leo".
 * `edited=true` marks a human-curated row so regeneration leaves it alone.
 */
export const moonPhaseInterpretationLibrary = pgTable(
  "moon_phase_interpretation_library",
  {
    /** `${phaseKey}:${signKey}`, e.g. "full_moon:leo". */
    key: text("key").primaryKey(),
    /** "new_moon", "waxing_crescent", … 8 canonical phases. */
    phase: text("phase").notNull(),
    /** Sign key ("aries"…"pisces"). */
    sign: text("sign").notNull(),
    headline: text("headline").notNull(),
    summary: text("summary").notNull(),
    body: text("body").notNull(),
    themes: jsonb("themes").$type<string[]>().notNull().default([]),
    /** Model id that produced it, "curated", or "manual" after an admin edit. */
    model: text("model").notNull(),
    /** True once a human edits it — regeneration skips edited rows. */
    edited: boolean("edited").notNull().default(false),
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export type MoonPhaseInterpretationLibraryRow =
  typeof moonPhaseInterpretationLibrary.$inferSelect;

export const chineseZodiac = pgTable("chinese_zodiac", {
  /** animal slug, or "_hub" for the hub page */
  animal: text("animal").primaryKey(),
  pageTitle: text("page_title").notNull(),
  metaDescription: text("meta_description").notNull(),
  headline: text("headline").notNull().default(""),
  intro: text("intro").notNull(),
  personality: text("personality").notNull().default(""),
  strengths: jsonb("strengths").$type<string[]>().notNull().default([]),
  weaknesses: jsonb("weaknesses").$type<string[]>().notNull().default([]),
  love: text("love").notNull().default(""),
  career: text("career").notNull().default(""),
  compatibility: jsonb("compatibility")
    .$type<ChineseCompatItem[]>()
    .notNull()
    .default([]),
  faq: jsonb("faq").$type<{ q: string; a: string }[]>().notNull().default([]),
  promptVersion: integer("prompt_version").notNull().default(1),
  model: text("model").notNull(),
  language: text("language").notNull().default("ka"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type ChineseZodiac = typeof chineseZodiac.$inferSelect;

export type MoonPhase = typeof moonPhases.$inferSelect;

export type NewMoonPhase = typeof moonPhases.$inferInsert;

export type SignHoroscope = typeof signHoroscopes.$inferSelect;

export type NewSignHoroscope = typeof signHoroscopes.$inferInsert;

export type SignHoroscopePeriod = "day" | "week" | "month";

/**
 * Reusable Astro-MBTI interpretation library — the pro-written, pre-generated
 * bulk that a fast live `flash` call composes over at test time (same pattern
 * as the transit/house libraries). Two kinds:
 *
 *   - `kind='type'`     — (mbtiType): the deep psychological portrait of the
 *                         type. `title` holds its Georgian archetype name.
 *                         16 rows.
 *   - `kind='type_sun'` — (mbtiType, sun sign): "how this type expresses
 *                         through this Sun sign" — the reducible astro fusion.
 *                         16 × 12 = 192 rows.
 *
 * `key` is `${kind}:${mbtiType}[:${sign}]`, e.g. "type:INFJ", "type_sun:INFJ:leo".
 * `edited=true` marks a human-curated row so regeneration leaves it alone.
 */
export const mbtiInterpretationLibrary = pgTable(
  "mbti_interpretation_library",
  {
    /** e.g. "type:INFJ", "type_sun:INFJ:leo". */
    key: text("key").primaryKey(),
    /** 'type' | 'type_sun' */
    kind: text("kind").notNull(),
    /** 4-letter MBTI code. */
    mbtiType: text("mbti_type").notNull(),
    /** Sun sign key for kind='type_sun', else null. */
    sign: text("sign"),
    /** Georgian archetype name (kind='type' only), else null. */
    title: text("title"),
    /** Georgian interpretation text. */
    body: text("body").notNull(),
    /** Model id that produced it, or "manual" after an admin edit. */
    model: text("model").notNull(),
    /** True once a human edits it — regeneration skips edited rows. */
    edited: boolean("edited").notNull().default(false),
    language: text("language").notNull().default("ka"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
);

export type MbtiInterpretationLibraryRow =
  typeof mbtiInterpretationLibrary.$inferSelect;

/**
 * The Astro-MBTI quiz questions — the editable surface of the test. Seeded from
 * the canonical list in lib/mbti-questions.ts (`MBTI_QUESTIONS`), which stays
 * the source of truth for the *structure* (id → axis → pole, 12-per-axis
 * balance). Admins edit only `textKa` here (wording/grammar fixes), so scoring
 * can never be broken from the panel. The quiz reads active rows live, so edits
 * go out immediately; the app falls back to the static list if the table is
 * empty or unreachable.
 */
export const mbtiQuestions = pgTable("mbti_question", {
  /** Stable 1..60 — matches the id answers are keyed by. */
  id: integer("id").primaryKey(),
  /** 'EI' | 'SN' | 'TF' | 'JP' | 'AT' — fixed structural metadata. */
  axis: text("axis").notNull(),
  /** The pole agreeing pushes toward (E/I/…/A/T) — fixed structural metadata. */
  pole: text("pole").notNull(),
  /** Georgian statement shown to the taker (the editable field). */
  textKa: text("text_ka").notNull(),
  /** Presentation order in the quiz. */
  orderIndex: integer("order_index").notNull(),
  /** Included in the live test when true. */
  active: boolean("active").notNull().default(true),
  /** True once an admin edits the wording (re-seed skips edited rows). */
  edited: boolean("edited").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type MbtiQuestionRow = typeof mbtiQuestions.$inferSelect;
