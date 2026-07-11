CREATE TABLE "iq_result" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"attempt_id" text NOT NULL,
	"iq" integer NOT NULL,
	"theta" double precision NOT NULL,
	"percentile" integer NOT NULL,
	"correct" integer NOT NULL,
	"total" integer NOT NULL,
	"domain_scores" jsonb NOT NULL,
	"answers" jsonb NOT NULL,
	"time_used_sec" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "iq_result_attempt_id_unique" UNIQUE("attempt_id")
);
--> statement-breakpoint
ALTER TABLE "iq_result" ADD CONSTRAINT "iq_result_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "iq_results_user_created_idx" ON "iq_result" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "iq_results_created_idx" ON "iq_result" USING btree ("created_at");