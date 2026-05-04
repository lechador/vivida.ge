CREATE TABLE "chart" (
	"user_id" text PRIMARY KEY NOT NULL,
	"input_hash" text NOT NULL,
	"source" text NOT NULL,
	"data" jsonb NOT NULL,
	"interpretation" jsonb,
	"interpretation_model" text,
	"language" text DEFAULT 'ka' NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"interpreted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "chart" ADD CONSTRAINT "chart_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;