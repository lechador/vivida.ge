CREATE TABLE "eq_result" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"attempt_id" text NOT NULL,
	"overall" integer NOT NULL,
	"band" text NOT NULL,
	"domain_scores" jsonb NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "eq_result_attempt_id_unique" UNIQUE("attempt_id")
);
--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "show_eq_result" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "eq_result" ADD CONSTRAINT "eq_result_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "eq_results_user_created_idx" ON "eq_result" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "eq_results_created_idx" ON "eq_result" USING btree ("created_at");