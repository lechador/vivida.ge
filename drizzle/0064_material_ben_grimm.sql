CREATE TABLE "survey_response" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"survey_key" text NOT NULL,
	"status" text DEFAULT 'shown' NOT NULL,
	"choice" text,
	"feedback" text,
	"shown_at" timestamp with time zone DEFAULT now() NOT NULL,
	"responded_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "survey_response" ADD CONSTRAINT "survey_response_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "survey_response_user_survey_uq" ON "survey_response" USING btree ("user_id","survey_key");--> statement-breakpoint
CREATE INDEX "survey_response_survey_status_idx" ON "survey_response" USING btree ("survey_key","status");