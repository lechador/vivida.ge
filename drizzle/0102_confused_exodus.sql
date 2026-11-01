CREATE TABLE "ask_conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"isolated_memory" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chart_chat_message" ADD COLUMN "conversation_id" text;--> statement-breakpoint
ALTER TABLE "ask_conversation" ADD CONSTRAINT "ask_conversation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ask_conversation_user_updated_idx" ON "ask_conversation" USING btree ("user_id","updated_at");--> statement-breakpoint
ALTER TABLE "chart_chat_message" ADD CONSTRAINT "chart_chat_message_conversation_id_ask_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ask_conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chart_chat_conversation_created_idx" ON "chart_chat_message" USING btree ("conversation_id","created_at");--> statement-breakpoint
ALTER TABLE "ask_user_memory" DROP COLUMN "topic_started_at";--> statement-breakpoint
INSERT INTO "ask_conversation" ("id", "user_id", "title", "isolated_memory", "created_at", "updated_at")
SELECT gen_random_uuid()::text, m."user_id",
  COALESCE((
    SELECT left(regexp_replace(u."content", '\s+', ' ', 'g'), 70)
    FROM "chart_chat_message" u
    WHERE u."user_id" = m."user_id" AND u."role" = 'user'
    ORDER BY u."created_at"
    LIMIT 1
  ), ''),
  false, min(m."created_at"), max(m."created_at")
FROM "chart_chat_message" m
WHERE m."conversation_id" IS NULL
GROUP BY m."user_id";
--> statement-breakpoint
UPDATE "chart_chat_message" c
SET "conversation_id" = a."id"
FROM "ask_conversation" a
WHERE a."user_id" = c."user_id" AND c."conversation_id" IS NULL;
