CREATE TABLE "report_moderation_action" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"actor_email" text NOT NULL,
	"action" text NOT NULL,
	"target_user_id" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "resolution_note" text;--> statement-breakpoint
ALTER TABLE "report" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "report_moderation_action" ADD CONSTRAINT "report_moderation_action_report_id_report_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."report"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_moderation_action" ADD CONSTRAINT "report_moderation_action_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "report_moderation_action_report_idx" ON "report_moderation_action" USING btree ("report_id","created_at");--> statement-breakpoint
CREATE INDEX "report_moderation_action_target_idx" ON "report_moderation_action" USING btree ("target_user_id","created_at");