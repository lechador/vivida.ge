import {
  pgTable,
  text,
  timestamp,
  primaryKey,
  integer,
  jsonb,
  boolean,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * Direct messages between two users. We don't model "conversations"
 * explicitly — a conversation is implicit (any pair of users sharing
 * messages). `readAt` is set on the row when the recipient opens the
 * conversation containing it.
 */
export const messages = pgTable(
  "message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("message_sender_recipient_idx").on(
      t.senderId,
      t.recipientId,
      t.createdAt,
    ),
    index("message_recipient_read_idx").on(t.recipientId, t.readAt),
    index("message_recipient_created_idx").on(t.recipientId, t.createdAt),
    index("message_sender_read_idx").on(t.senderId, t.readAt),
  ],
);

/**
 * Ephemeral typing state. One row per (sender → recipient) pair. The sender
 * upserts a row with `expiresAt = now() + 5s` on each keystroke (debounced);
 * the recipient's SSE poll reads any rows still in the future. Stale rows
 * are ignored at read-time and overwritten on the next keystroke.
 */
export const typingIndicators = pgTable(
  "typing_indicator",
  {
    senderId: text("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recipientId: text("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.senderId, t.recipientId] }),
    index("typing_recipient_expires_idx").on(t.recipientId, t.expiresAt),
  ],
);

/**
 * Notification types we currently emit. Keep the enum lean — adding a new
 * kind is cheap (jsonb payload), but enum values are forever.
 */
export const notificationKindEnum = pgEnum("notification_kind", [
  "friend_request",
  "friend_accepted",
  "post_comment",
  "post_reaction",
  "mention",
  // Mutual like in the match deck — emitted to both users at once.
  "new_match",
  // Credit balance moved (earned or spent) — deep-links to /credits.
  "credit",
  "relationship_connected",
  "relationship_weekly",
  "relationship_transit",
  "timing_reminder",
  "forecast_reminder",
]);

/**
 * Notification feed for the bell-icon dropdown. One row per event delivered
 * to a user. `payload` carries kind-specific details (the actor's userId,
 * username, display name, image, etc.) so we don't need a join to render.
 */
export type NotificationPayload = {
  fromUserId?: string;
  fromUsername?: string | null;
  fromName?: string | null;
  fromImage?: string | null;
  /** Set on `post_comment` / `post_reaction` so the bell-icon row can
   *  deep-link to /feed#post-<id>. */
  postId?: string;
  /** Optional preview of the comment body for the dropdown. */
  preview?: string;
  /** Reaction kind for `post_reaction` notifications — drives the icon. */
  reaction?: "like" | "dislike" | "funny" | "sad";
  /** "post" | "comment" — only set on `mention` kind so the row can show
   *  "მოგიხსენიეს კომენტარში" vs. "მოგიხსენიეს პოსტში". */
  mentionContext?: "post" | "comment";
  /** Signed credit delta for `credit` kind (positive = earned, negative
   *  = spent). */
  creditAmount?: number;
  /** CreditReason slug for `credit` kind — mapped to a Georgian label + icon. */
  creditReason?: string;
  /** Resulting balance after the change, for `credit` kind. */
  creditBalance?: number;
  /** Shared relationship/synastry destination and recurring-update copy. */
  partnerId?: string;
  partnerName?: string;
  relationshipHeadline?: string;
  transitTitle?: string;
  reminderTitle?: string;
  reminderBody?: string;
  reminderUrl?: string;
};

export const notifications = pgTable("notification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: notificationKindEnum("kind").notNull(),
  payload: jsonb("payload").$type<NotificationPayload>().notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Web Push subscriptions — one row per browser/device a user opted into
 * notifications from. `endpoint` is unique (the push service URL); `p256dh`
 * and `auth` are the client's encryption keys. Presence of a row = the user
 * receives the daily push. Expired endpoints (HTTP 410) are pruned on send.
 */
export const pushSubscriptions = pgTable("push_subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  /** Optional UA string for debugging which device this is. */
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;

/** User-owned delivery choices for personal astrology reminders. */
export const reminderSettings = pgTable("reminder_setting", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  transitPush: boolean("transit_push").notNull().default(false),
  transitEmail: boolean("transit_email").notNull().default(false),
  /** daily | weekly */
  transitCadence: text("transit_cadence").notNull().default("weekly"),
  forecastPush: boolean("forecast_push").notNull().default(false),
  forecastEmail: boolean("forecast_email").notNull().default(false),
  /** Global channels for relationships that are enabled per partner. */
  relationshipPush: boolean("relationship_push").notNull().default(true),
  relationshipEmail: boolean("relationship_email").notNull().default(false),
  /** 0–23 in the user's profile timezone. */
  localHour: integer("local_hour").notNull().default(9),
  /** 0=Sunday ... 6=Saturday. */
  weeklyDay: integer("weekly_day").notNull().default(1),
  calendarEnabled: boolean("calendar_enabled").notNull().default(false),
  /** Opaque secret URL token for calendar subscriptions. */
  calendarToken: text("calendar_token").unique(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** Append-only consent history used for reminder opt-in/opt-out funnels. */
export const reminderPreferenceEvents = pgTable(
  "reminder_preference_event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    channel: text("channel").notNull(),
    /** opt_in | opt_out */
    eventType: text("event_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("reminder_preference_event_funnel_idx").on(
      t.eventType,
      t.topic,
      t.channel,
      t.createdAt,
    ),
    index("reminder_preference_event_user_idx").on(t.userId, t.createdAt),
  ],
);

export const reminderDeliveries = pgTable(
  "reminder_delivery",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    channel: text("channel").notNull(),
    deliveryKey: text("delivery_key").notNull(),
    destination: text("destination").notNull().default("/dashboard"),
    /** claimed | sent | failed */
    status: text("status").notNull().default("claimed"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    /** Set when the authenticated recipient opens the reminder destination. */
    valueCompletedAt: timestamp("value_completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("reminder_delivery_user_topic_channel_key_idx").on(
      t.userId,
      t.topic,
      t.channel,
      t.deliveryKey,
    ),
    index("reminder_delivery_created_idx").on(t.createdAt),
    index("reminder_delivery_funnel_idx").on(
      t.status,
      t.topic,
      t.channel,
      t.createdAt,
    ),
  ],
);

export type ReminderSettings = typeof reminderSettings.$inferSelect;

export type ReminderDelivery = typeof reminderDeliveries.$inferSelect;

/**
 * Chinese-zodiac page content (ჩინური ჰოროსკოპი). One row per animal slug
 * (plus a reserved "_hub" row for the hub intro/FAQ). Creative Georgian prose
 * is generated by Gemini on demand and cached here; `promptVersion` invalidates
 * after a prompt change. Factual data (names, years, elements) lives in
 * lib/seo/chinese-zodiac, not here.
 */
export type ChineseCompatItem = {
  /** animal slug — see ALL_CHINESE_SLUGS */
  slug: string;
  /** "ძლიერი" | "ჰარმონიული" | "გამომწვევი" */
  level: string;
  note: string;
};

export type Notification = typeof notifications.$inferSelect;

export type NewNotification = typeof notifications.$inferInsert;

export type NotificationKind = (typeof notificationKindEnum.enumValues)[number];

export type Message = typeof messages.$inferSelect;

export type NewMessage = typeof messages.$inferInsert;

export type TypingIndicator = typeof typingIndicators.$inferSelect;

export type NewTypingIndicator = typeof typingIndicators.$inferInsert;
