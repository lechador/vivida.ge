CREATE TYPE "public"."reputation_event_kind" AS ENUM('post_created', 'comment_created', 'reaction_received', 'comment_received', 'friend_added', 'daily_visit', 'profile_completed', 'first_post', 'joined');--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE 'post_reaction';--> statement-breakpoint
CREATE TABLE "reputation_event" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" "reputation_event_kind" NOT NULL,
	"subject_id" text NOT NULL,
	"points" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_reputation" (
	"user_id" text PRIMARY KEY NOT NULL,
	"total" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post" ADD COLUMN "edited" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reputation_event" ADD CONSTRAINT "reputation_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reputation" ADD CONSTRAINT "user_reputation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "rep_event_user_kind_created_idx" ON "reputation_event" USING btree ("user_id","kind","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "rep_event_dedupe_idx" ON "reputation_event" USING btree ("kind","subject_id");