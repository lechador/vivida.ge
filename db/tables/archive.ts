import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  index,
  uniqueIndex,
  pgEnum,
} from "drizzle-orm/pg-core";
import { blocks } from "./profiles";
import { partners } from "./relationships";
import type { WeeklyForecastDay } from "./results";
import { users } from "./users";

/**
 * One-time, paid, downloadable PDF reports (natal / synastry / forecast).
 * Lifecycle: pending → paid → generating → ready (or failed). The PDF lives privately in R2;
 * `pdfKey` is the object key and we serve it via short-lived signed URLs.
 */
export const pdfReportStatusEnum = pgEnum("pdf_report_status", [
  "pending", // checkout started, awaiting Stripe payment
  "paid", // credit spend confirmed — generation queued
  "generating", // worker is producing the PDF
  "ready", // PDF stored in R2, downloadable
  "failed", // generation errored — retryable
]);

export type PremiumReportContentJson = {
  title: string;
  subtitle: string;
  overview: string;
  sections: Array<{ title: string; body: string; highlights?: string[] }>;
  keyDates?: Array<{
    date: string;
    title: string;
    note: string;
    tone: "supportive" | "caution" | "neutral";
  }>;
  actionPlan: string[];
  closing: string;
};

export const pdfReports = pgTable(
  "pdf_report",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Stable product key: natal / annual / relationship / career / timing. */
    type: text("type").notNull().default("natal"),
    /** Language captured at purchase so retries always reproduce the same PDF. */
    language: text("language").notNull().default("ka"),
    status: pdfReportStatusEnum("status").notNull().default("pending"),
    /** chart input hash captured at purchase, so we can flag a stale report
     *  if the user later changes their birth data. */
    inputHash: text("input_hash"),
    /** Product edition prevents repeat charges for the same dated/sourced report. */
    editionKey: text("edition_key").notNull().default("evergreen"),
    /** Empty for solo reports; partner id for relationship reports. */
    subjectKey: text("subject_key").notNull().default(""),
    partnerId: text("partner_id").references(() => partners.id, {
      onDelete: "set null",
    }),
    /** Rows purchased together share a bundle id/key for customer support. */
    bundleId: text("bundle_id"),
    bundleKey: text("bundle_key"),
    /** Snapshot used to render the PDF and support deterministic retries. */
    content: jsonb("content").$type<PremiumReportContentJson | null>(),
    amountCents: integer("amount_cents").notNull().default(0),
    currency: text("currency").notNull().default("GEL"),
    /** Legacy compatibility field; new credit-funded reports are always false. */
    comped: boolean("comped").notNull().default(false),
    stripeSessionId: text("stripe_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    /** R2 object key once generated. */
    pdfKey: text("pdf_key"),
    /** last generation error, for support/retry. */
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    /** Timestamp of the latest renderer claim; used to recover crashed jobs. */
    generationStartedAt: timestamp("generation_started_at", {
      withTimezone: true,
    }),
    readyAt: timestamp("ready_at", { withTimezone: true }),
  },
  (t) => [
    index("pdf_report_user_created_idx").on(t.userId, t.createdAt),
    index("pdf_report_status_idx").on(t.status),
    uniqueIndex("pdf_report_user_product_edition_idx").on(
      t.userId,
      t.type,
      t.language,
      t.editionKey,
      t.subjectKey,
    ),
    index("pdf_report_bundle_idx").on(t.userId, t.bundleId),
  ],
);

export type PdfReport = typeof pdfReports.$inferSelect;

export type NewPdfReport = typeof pdfReports.$inferInsert;

export type PdfReportStatus = (typeof pdfReportStatusEnum.enumValues)[number];

export const libraryEntryKindEnum = pgEnum("library_entry_kind", [
  "daily",
  "weekly",
  "tarot",
  "ai",
  "report",
]);

export type LibraryEntryKind = (typeof libraryEntryKindEnum.enumValues)[number];

export type LibraryEntryContent =
  | {
      type: "daily";
      summary: string;
      body: string;
      themes: string[];
    }
  | {
      type: "weekly";
      weekStart: string;
      days: WeeklyForecastDay[];
    }
  | {
      type: "tarot";
      question: string;
      cards: Array<{
        slug: string;
        name: string;
        glyph: string;
        reversed: boolean;
        position: string;
        interpretation: string;
      }>;
      reading: string;
      advice: string;
      /** What this attempt settled: 0/free for the first reading, cost otherwise. */
      charged?: number;
      free?: boolean;
      /** True when the AI call failed and the static fallback was used. */
      degraded?: boolean;
      /** Follow-up questions on the same spread, oldest first. */
      followups?: Array<{
        question: string;
        answer: string;
        degraded?: boolean;
        charged?: number;
        free?: boolean;
      }>;
    }
  | {
      type: "ai";
      question: string;
      answer: string;
    }
  | {
      type: "report";
      reportType: string;
      status: string;
    };

/**
 * Durable personal archive of generated readings. Source rows may be cached,
 * overwritten, or live in separate product tables; this snapshot keeps the
 * exact value the user received and layers favorites + private notes on top.
 */
export const libraryEntries = pgTable(
  "library_entry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: libraryEntryKindEnum("kind").notNull(),
    /** Stable id in the source product (date, message id, report id, etc.). */
    sourceId: text("source_id").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    content: jsonb("content").$type<LibraryEntryContent>().notNull(),
    href: text("href"),
    language: text("language").notNull().default("ka"),
    favorite: boolean("favorite").notNull().default(false),
    note: text("note"),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("library_entry_user_kind_source_idx").on(
      t.userId,
      t.kind,
      t.sourceId,
    ),
    index("library_entry_user_occurred_idx").on(t.userId, t.occurredAt),
    index("library_entry_user_favorite_idx").on(t.userId, t.favorite),
  ],
);

export type LibraryEntry = typeof libraryEntries.$inferSelect;

export type NewLibraryEntry = typeof libraryEntries.$inferInsert;

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "user",
  "post",
  "comment",
  "message_thread",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "open",
  "reviewed",
  "actioned",
  "dismissed",
]);

/**
 * User-submitted abuse reports. `targetId` is the reported user / post /
 * comment id, or the other participant's user id for a message_thread report.
 * Resolution fields keep the latest queue state easy to query; the append-only
 * report_moderation_action table below preserves the full admin audit trail.
 */
export const reports = pgTable(
  "report",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: reportTargetTypeEnum("target_type").notNull(),
    targetId: text("target_id").notNull(),
    reason: text("reason"),
    status: reportStatusEnum("status").notNull().default("open"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: text("reviewed_by"),
    resolutionNote: text("resolution_note"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("report_status_created_idx").on(t.status, t.createdAt),
    index("report_reporter_target_idx").on(
      t.reporterId,
      t.targetType,
      t.targetId,
    ),
  ],
);

/**
 * Append-only trust & safety audit trail. A report may be reviewed, reopened,
 * dismissed, restricted, and later unrestricted; keeping each event avoids
 * losing the decision history when the report's current status changes.
 */
export const reportModerationActions = pgTable(
  "report_moderation_action",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reportId: text("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    targetUserId: text("target_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("report_moderation_action_report_idx").on(t.reportId, t.createdAt),
    index("report_moderation_action_target_idx").on(
      t.targetUserId,
      t.createdAt,
    ),
  ],
);

export type Block = typeof blocks.$inferSelect;

export type Report = typeof reports.$inferSelect;

export type NewReport = typeof reports.$inferInsert;

export type ReportTargetType = (typeof reportTargetTypeEnum.enumValues)[number];

export type ReportModerationAction =
  typeof reportModerationActions.$inferSelect;

/**
 * Per-axis MBTI score. `letter` is the winning pole of the axis; `pct` is how
 * strongly the user leaned toward it (50–100 — 50 is a dead tie, 100 is the
 * extreme). Drives the four progress bars on the results page.
 */
export type MbtiAxisScore = {
  letter: string; // one of E/I, S/N, T/F, J/P, A/T depending on the axis
  pct: number; // 50–100
};

/**
 * The five MBTI axes, keyed by the axis pair. `AT` (Identity, Assertive/
 * Turbulent) is optional so rows written before the Identity axis existed still
 * type-check when read back.
 */
export type MbtiScoresJson = {
  EI: MbtiAxisScore;
  SN: MbtiAxisScore;
  TF: MbtiAxisScore;
  JP: MbtiAxisScore;
  AT?: MbtiAxisScore;
};
