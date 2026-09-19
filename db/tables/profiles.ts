import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  doublePrecision,
  date,
  time,
  jsonb,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Vivida-specific: birth profile, 1:1 with users.
 * Time stored separately so we can render exact birth time independent of TZ.
 */
export const profiles = pgTable(
  "profile",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    dateOfBirth: date("date_of_birth", { mode: "string" }),
    timeOfBirth: time("time_of_birth"),
    /** Self-reported or AI-inferred sex — 'male' | 'female' (null = unknown /
     *  chose to skip). Used only for aggregate audience analytics, never shown
     *  publicly. */
    gender: text("gender"),
    /** How `gender` was set: 'self' (user picked it) or 'ai' (name-inferred
     *  backfill). Self-reported always wins; the backfill only touches null/ai. */
    genderSource: text("gender_source"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    cityName: text("city_name"),
    timezone: text("timezone"),
    // ── Public profile fields ────────────────────────────────────────────
    /** Lowercase, slug-friendly handle used in profile URLs. Unique. */
    username: text("username").unique(),
    /** Public display name (defaults to user.name if not set). */
    displayName: text("display_name"),
    /** Short user-written bio (~280 char). */
    bio: text("bio"),
    /**
     * Whether this user appears on stranger-discovery surfaces: the /people
     * directory, people search, and "suggested people" rails. Default true
     * (public for new accounts; explicit opt-out toggle in onboarding +
     * Account). Their /u/[username] page stays reachable by direct link
     * either way — this only controls being *browsable*.
     */
    discoverable: boolean("discoverable").notNull().default(true),
    /** Opt-in: show the user's latest test results on their public /u/[username]
     *  page. Off by default — results are private until the taker chooses to
     *  display them (toggle on the result page). Per test kind. */
    showMbtiResult: boolean("show_mbti_result").notNull().default(false),
    showIqResult: boolean("show_iq_result").notNull().default(false),
    showEqResult: boolean("show_eq_result").notNull().default(false),
    showBigFiveResult: boolean("show_big_five_result").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("profile_username_trgm_idx").using(
      "gin",
      t.username.asc().op("gin_trgm_ops"),
    ),
    index("profile_display_name_trgm_idx").using(
      "gin",
      t.displayName.asc().op("gin_trgm_ops"),
    ),
  ],
);

/**
 * Cached natal chart per user. Recomputed only when birth data changes
 * (versioned via `inputHash`). Interpretations are stored separately so we
 * can regenerate AI text without re-running ephemeris calculations.
 */
export const charts = pgTable("chart", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  inputHash: text("input_hash").notNull(),
  source: text("source").notNull(), // 'api' | 'local'
  data: jsonb("data").$type<NatalChartJson>().notNull(),
  interpretation: jsonb(
    "interpretation",
  ).$type<ChartInterpretationJson | null>(),
  interpretationModel: text("interpretation_model"), // e.g. 'anthropic/claude-sonnet-4-6' or 'static'
  language: text("language").notNull().default("ka"),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  interpretedAt: timestamp("interpreted_at", { withTimezone: true }),
});

/**
 * Profile photos — Tinder-style carousel for public profiles. Stored in
 * Cloudflare R2 under `users/{userId}/{photoId}.{ext}`. `url` is the
 * cached public URL (precomputed so reads don't need extra resolution).
 * `ready=false` rows exist briefly between the presigned-URL handout and
 * the client confirming a successful upload.
 */
export const profilePhotos = pgTable("profile_photo", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** R2 object key — used for delete + presigned URL generation. */
  key: text("key").notNull().unique(),
  /** Public URL — cached for fast reads on profile views. */
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  /** false until the client confirms the file was successfully uploaded. */
  ready: boolean("ready").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Directed friendship requests. status: 'pending' | 'accepted' | 'blocked'.
 * Composite PK on (requester, recipient) prevents dupes; the reverse pair
 * is stored separately so we can query "who requested me" cheaply.
 */
export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
  "blocked",
]);

export const friendships = pgTable(
  "friendship",
  {
    requesterId: text("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.requesterId, t.recipientId] })],
);

/**
 * Romantic-intent swipes, the foundation of the match deck. Distinct from
 * `friendships`: a like is one-directional and silent until reciprocated.
 * One row per (liker → target); `kind` records the swipe direction so a
 * pass excludes the target from the deck without ever notifying them, and a
 * later like can overwrite a pass (upsert on the PK).
 */
export const likeKindEnum = pgEnum("like_kind", ["like", "pass"]);

export const likes = pgTable(
  "like",
  {
    likerId: text("liker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetId: text("target_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: likeKindEnum("kind").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.likerId, t.targetId] }),
    // "Who liked me" + reciprocal-like lookup on a fresh like.
    index("like_target_kind_idx").on(t.targetId, t.kind),
  ],
);

/**
 * A mutual like. Created when a like is reciprocated; either user can
 * unmatch (soft delete via `unmatchedAt` so the pair isn't re-surfaced in
 * the deck and the like rows stay as a record). The pair is stored sorted
 * (userAId < userBId) so a match is unique regardless of who liked first.
 */
export const matches = pgTable(
  "match",
  {
    userAId: text("user_a_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userBId: text("user_b_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    /** NULL = active match; set when either side unmatches. */
    unmatchedAt: timestamp("unmatched_at", { withTimezone: true }),
    /** Who pressed unmatch (for analytics / re-match rules later). */
    unmatchedBy: text("unmatched_by").references(() => users.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    primaryKey({ columns: [t.userAId, t.userBId] }),
    // List a user's matches: matches where they're either side, active first.
    index("match_user_a_idx").on(t.userAId, t.unmatchedAt),
    index("match_user_b_idx").on(t.userBId, t.unmatchedAt),
  ],
);

/**
 * Shape of the natal chart JSON we persist. Stable across `source`
 * (whether computed locally or fetched from freeastrologyapi.com).
 */
export type NatalChartJson = {
  ascendant: PointJson;
  midheaven: PointJson;
  bodies: Record<string, PointJson>; // sun, moon, mercury, venus, ...
  houses: HouseJson[]; // 12 cusps
  aspects?: NatalAspectJson[]; // major chart-internal aspects
};

export type NatalAspectJson = {
  /** Body keys; alphabetically sorted for stable IDs. */
  a: string;
  b: string;
  kind: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  family: "harmonic" | "tense" | "neutral";
  orb: number;
  intensity: number;
};

export type PointJson = {
  longitude: number; // 0-360 ecliptic
  signIndex: number; // 0-11 (Aries = 0)
  signDegree: number; // 0-30 within sign
  house?: number | null; // 1-12
  retrograde?: boolean;
};

export type HouseJson = {
  number: number; // 1-12
  cuspLongitude: number; // 0-360
  signIndex: number;
};

export type ChartInterpretationJson = {
  bigThree?: {
    sun?: string;
    moon?: string;
    ascendant?: string;
  };
  summary?: string;
  highlights?: Array<{ title: string; body: string }>;
  /** Per-planet narrative interpretation (Mercury–Pluto). Keys: planet keys. */
  planets?: Record<string, string>;
  /** Per-house narrative interpretation. Keys: "1".."12". */
  houses?: Record<string, string>;
  /** Per-aspect interpretation. Keys: "<a>-<b>-<kind>" (a < b alphabetically). */
  aspects?: Record<string, string>;
};

export type Profile = typeof profiles.$inferSelect;

export type NewProfile = typeof profiles.$inferInsert;

export type Chart = typeof charts.$inferSelect;

export type NewChart = typeof charts.$inferInsert;

export type ProfilePhoto = typeof profilePhotos.$inferSelect;

export type NewProfilePhoto = typeof profilePhotos.$inferInsert;

export type Like = typeof likes.$inferSelect;

export type NewLike = typeof likes.$inferInsert;

export type LikeKind = (typeof likeKindEnum.enumValues)[number];

export type Match = typeof matches.$inferSelect;

export type NewMatch = typeof matches.$inferInsert;

// ─── Trust & safety ─────────────────────────────────────────────────────

/**
 * Directional user blocks. A row (blocker → blocked) means `blockerId` has
 * blocked `blockedId`. Enforced *both ways* at read time (neither party can
 * message, friend, or see the other in feed/profile). Kept independent of
 * `friendships` so a block works with no prior relationship and survives
 * unfriending.
 */
export const blocks = pgTable(
  "block",
  {
    blockerId: text("blocker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    blockedId: text("blocked_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.blockerId, t.blockedId] }),
    // Reverse lookup: "who has blocked me".
    index("block_blocked_idx").on(t.blockedId),
  ],
);
