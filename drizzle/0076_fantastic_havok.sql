CREATE TYPE "public"."library_entry_kind" AS ENUM('daily', 'weekly', 'tarot', 'ai', 'report');--> statement-breakpoint
CREATE TABLE "library_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" "library_entry_kind" NOT NULL,
	"source_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"content" jsonb NOT NULL,
	"href" text,
	"language" text DEFAULT 'ka' NOT NULL,
	"favorite" boolean DEFAULT false NOT NULL,
	"note" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "library_entry" ADD CONSTRAINT "library_entry_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "library_entry_user_kind_source_idx" ON "library_entry" USING btree ("user_id","kind","source_id");--> statement-breakpoint
CREATE INDEX "library_entry_user_occurred_idx" ON "library_entry" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE INDEX "library_entry_user_favorite_idx" ON "library_entry" USING btree ("user_id","favorite");--> statement-breakpoint

-- Preserve the value users already received before the unified library existed.
INSERT INTO "library_entry" (
	"id", "user_id", "kind", "source_id", "title", "summary", "content",
	"language", "occurred_at", "created_at", "updated_at"
)
SELECT
	'daily-' || md5(d."user_id" || ':' || d."date"::text),
	d."user_id",
	'daily'::"library_entry_kind",
	d."date"::text,
	d."headline",
	d."summary",
	jsonb_build_object(
		'type', 'daily',
		'summary', d."summary",
		'body', d."body",
		'themes', d."themes"
	),
	d."language",
	d."created_at",
	d."created_at",
	d."created_at"
FROM "daily_horoscope" d
ON CONFLICT ("user_id", "kind", "source_id") DO NOTHING;--> statement-breakpoint

INSERT INTO "library_entry" (
	"id", "user_id", "kind", "source_id", "title", "summary", "content",
	"language", "occurred_at", "created_at", "updated_at"
)
SELECT
	'weekly-' || md5(w."user_id" || ':' || w."week_start"::text),
	w."user_id",
	'weekly'::"library_entry_kind",
	w."week_start"::text,
	CASE
		WHEN w."language" = 'en' THEN 'Your 7-day forecast'
		WHEN w."language" = 'am' THEN 'Ձեր 7-օրյա կանխատեսումը'
		ELSE 'შენი 7-დღიანი პროგნოზი'
	END,
	CASE
		WHEN w."language" = 'en' THEN 'Personal forecast for the next seven days'
		WHEN w."language" = 'am' THEN 'Անձնական կանխատեսում առաջիկա յոթ օրերի համար'
		ELSE 'პერსონალური პროგნოზი მომდევნო შვიდი დღისთვის'
	END,
	jsonb_build_object('type', 'weekly', 'weekStart', w."week_start", 'days', w."days"),
	w."language",
	w."created_at",
	w."created_at",
	w."created_at"
FROM "weekly_forecast" w
ON CONFLICT ("user_id", "kind", "source_id") DO NOTHING;--> statement-breakpoint

INSERT INTO "library_entry" (
	"id", "user_id", "kind", "source_id", "title", "summary", "content",
	"href", "language", "occurred_at", "created_at", "updated_at"
)
SELECT
	'report-' || p."id",
	p."user_id",
	'report'::"library_entry_kind",
	p."id",
	CASE
		WHEN p."language" = 'en' THEN 'Complete natal report'
		WHEN p."language" = 'am' THEN 'Ամբողջական նատալ զեկույց'
		ELSE 'სრული ნატალური რეპორტი'
	END,
	CASE
		WHEN p."language" = 'en' THEN 'Your downloadable personal PDF report'
		WHEN p."language" = 'am' THEN 'Ձեր ներբեռնվող անձնական PDF զեկույցը'
		ELSE 'შენი ჩამოსატვირთი პერსონალური PDF რეპორტი'
	END,
	jsonb_build_object('type', 'report', 'reportType', p."type", 'status', p."status"),
	'/reports/' || p."id",
	p."language",
	COALESCE(p."ready_at", p."paid_at", p."created_at"),
	p."created_at",
	COALESCE(p."ready_at", p."paid_at", p."created_at")
FROM "pdf_report" p
WHERE p."status" IN ('paid', 'generating', 'ready', 'failed')
ON CONFLICT ("user_id", "kind", "source_id") DO NOTHING;--> statement-breakpoint

INSERT INTO "library_entry" (
	"id", "user_id", "kind", "source_id", "title", "summary", "content",
	"href", "language", "occurred_at", "created_at", "updated_at"
)
SELECT
	'ai-' || a."id",
	a."user_id",
	'ai'::"library_entry_kind",
	a."id",
	LEFT(COALESCE(q."content", CASE WHEN u."interface_language" = 'en' THEN 'AI insight' WHEN u."interface_language" = 'am' THEN 'AI հուշում' ELSE 'AI რჩევა' END), 160),
	LEFT(a."content", 240),
	jsonb_build_object('type', 'ai', 'question', COALESCE(q."content", ''), 'answer', a."content"),
	'/ask',
	u."interface_language",
	a."created_at",
	a."created_at",
	a."created_at"
FROM "chart_chat_message" a
JOIN "user" u ON u."id" = a."user_id"
LEFT JOIN LATERAL (
	SELECT m."content"
	FROM "chart_chat_message" m
	WHERE m."user_id" = a."user_id"
		AND m."role" = 'user'
		AND m."created_at" <= a."created_at"
	ORDER BY m."created_at" DESC, m."id" DESC
	LIMIT 1
) q ON true
WHERE a."role" = 'assistant'
ON CONFLICT ("user_id", "kind", "source_id") DO NOTHING;
