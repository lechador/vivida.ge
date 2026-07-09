CREATE TABLE "mbti_test_results" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"mbti_type" text NOT NULL,
	"archetype_name_ge" text NOT NULL,
	"scores" jsonb NOT NULL,
	"ai_synthesis_text" text NOT NULL,
	"model" text NOT NULL,
	"language" text DEFAULT 'ka' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mbti_test_results" ADD CONSTRAINT "mbti_test_results_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mbti_results_user_created_idx" ON "mbti_test_results" USING btree ("user_id","created_at");