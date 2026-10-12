import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  boolean,
  index,
  uniqueIndex,
  pgEnum,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Per-user-day visit log. One row per (userId, dateLocal), the date is
 * stored as the user's local YYYY-MM-DD so an admin reading the
 * heatmap sees the same days the user lived. Deliberately schema-light
 * for the easy version: no per-page time, no session count. Bump later
 * if we need more granular analytics.
 */
export const userActivityDays = pgTable(
  "user_activity_day",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** YYYY-MM-DD in the user's profile timezone (or UTC fallback). */
    dateLocal: text("date_local").notNull(),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    /** Server-truth completion time for the current daily ritual version. */
    ritualCompletedAt: timestamp("ritual_completed_at", { withTimezone: true }),
    /** Version isolates current streaks from historical/backfilled activity. */
    ritualVersion: integer("ritual_version"),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.dateLocal] }),
    index("user_activity_ritual_completed_idx").on(
      t.userId,
      t.ritualCompletedAt,
    ),
  ],
);

export type UserActivityDay = typeof userActivityDays.$inferSelect;

/**
 * Community feed, short text posts visible to every signed-in user.
 * Hard delete on user removal (cascade) and on post author/admin
 * action; comments and reactions cascade with the parent post.
 *
 * No image uploads, no link parsing, body is plain text only by
 * product spec. Length cap enforced in `createPost`.
 */
export const posts = pgTable(
  "post",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    /** True once the author has edited the post at least once. The 5-minute
     *  edit window is enforced in the action; this flag exists so the UI
     *  can append "(რედაქტირებული)" without a separate timestamp column. */
    edited: boolean("edited").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Feed reads are always "newest first"; the explicit index lets
    // Postgres do an index-only descending scan rather than sorting in
    // memory once the table grows past a few thousand rows.
    index("post_created_at_idx").on(t.createdAt),
    index("post_user_idx").on(t.userId),
  ],
);

/**
 * Comments on a community post. Text only (same product spec). Cascades
 * with the parent post: when a post is deleted, all comments go too.
 */
export const postComments = pgTable(
  "post_comment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Self-FK for one-level reply threading. Null = top-level comment;
     *  non-null = reply to that comment. Replies of replies are
     *  rejected at the action layer (keeps UI nesting bounded). Cascade
     *  on delete so removing a parent cleans up its reply subtree. */
    parentId: text("parent_id").references((): AnyPgColumn => postComments.id, {
      onDelete: "cascade",
    }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Loading comments for a single post, always sorted oldest first.
    index("post_comment_post_idx").on(t.postId, t.createdAt),
    // Fetching all replies under one parent (used when expanding a
    // long thread or counting reply depth in the future).
    index("post_comment_parent_idx").on(t.parentId),
  ],
);

/**
 * Reaction taxonomy. Kept short on purpose, adding a kind means
 * designing a new icon and updating every render site. Enum values are
 * forever; "haha"/"wow" can be aliased to existing kinds at the UI
 * level if the product splits later.
 */
export const postReactionKindEnum = pgEnum("post_reaction_kind", [
  "like",
  "dislike",
  "funny",
  "sad",
]);

/**
 * Per-user reaction to a post. Composite PK (post, user) enforces
 * "one reaction per user per post" at the DB level, switching from
 * `like` to `sad` is a single `INSERT … ON CONFLICT DO UPDATE`, no
 * race window where a user can stack reactions.
 */
export const postReactions = pgTable(
  "post_reaction",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: postReactionKindEnum("kind").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.userId] }),
    // Per-post aggregate count: GROUP BY post_id, kind → uses this idx.
    index("post_reaction_post_kind_idx").on(t.postId, t.kind),
  ],
);

/**
 * Reputation, gamification layer. `user_reputation` is the running
 * total, `reputation_event` is the audit log + dedup source. We never
 * compute the total by SUM'ing events; that would punish frequently-
 * visited profiles. The trigger-style "increment on insert" lives in
 * application code (`awardReputation`), kept in sync via the unique
 * dedupe index.
 *
 * Event kinds:
 *  - post_created, you posted (cap 9/day)
 *  - comment_created, you commented (cap 5/day)
 *  - reaction_received, someone reacted to your post (cap 30/day)
 *  - comment_received, someone commented on your post (cap 30/day)
 *  - friend_added, you accepted a friend request (cap 20/day)
 *  - daily_visit, retired legacy event kind
 *  - profile_completed, one-shot, on first profile save
 *  - first_post, one-shot, on the first post you ever publish
 *  - joined, one-shot, on signup
 */
export const reputationEventKindEnum = pgEnum("reputation_event_kind", [
  "post_created",
  "comment_created",
  "reaction_received",
  "comment_received",
  "friend_added",
  "daily_visit",
  "profile_completed",
  "first_post",
  "joined",
]);

export const userReputation = pgTable("user_reputation", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  total: integer("total").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const reputationEvents = pgTable(
  "reputation_event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: reputationEventKindEnum("kind").notNull(),
    /** Stable identifier for the source of the event so the same one
     *  can't credit twice. Examples by kind:
     *   - post_created       → postId
     *   - comment_created    → commentId
     *   - reaction_received  → `${postId}:${reactorUserId}`
     *   - comment_received   → commentId
     *   - friend_added       → sorted pair `min(a,b):max(a,b)`
     *   - daily_visit        → retired legacy event subject
     *   - profile_completed  → `${userId}`
     *   - first_post         → `${userId}`
     *   - joined             → `${userId}`
     *
     * Always populated, the unique index relies on a non-null value to
     * enforce dedup. */
    subjectId: text("subject_id").notNull(),
    points: integer("points").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Daily-cap query: SUM(points) WHERE user_id, kind, created_at > today.
    index("rep_event_user_kind_created_idx").on(t.userId, t.kind, t.createdAt),
    // Dedup: same (kind, subjectId) can never insert twice.
    uniqueIndex("rep_event_dedupe_idx").on(t.kind, t.subjectId),
  ],
);

export type Post = typeof posts.$inferSelect;

export type NewPost = typeof posts.$inferInsert;

export type PostComment = typeof postComments.$inferSelect;

export type NewPostComment = typeof postComments.$inferInsert;

export type PostReaction = typeof postReactions.$inferSelect;

export type NewPostReaction = typeof postReactions.$inferInsert;

export type PostReactionKind = (typeof postReactionKindEnum.enumValues)[number];

export type UserReputation = typeof userReputation.$inferSelect;

export type ReputationEvent = typeof reputationEvents.$inferSelect;

export type NewReputationEvent = typeof reputationEvents.$inferInsert;

export type ReputationEventKind =
  (typeof reputationEventKindEnum.enumValues)[number];
