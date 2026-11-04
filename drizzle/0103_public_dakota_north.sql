CREATE TABLE "pmf_survey_response" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"wave" text NOT NULL,
	"answer" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pmf_survey_response" ADD CONSTRAINT "pmf_survey_response_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pmf_survey_response_user_wave_idx" ON "pmf_survey_response" USING btree ("user_id","wave");