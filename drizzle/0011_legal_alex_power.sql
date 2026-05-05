CREATE TABLE "weekly_forecast" (
	"user_id" text PRIMARY KEY NOT NULL,
	"week_start" date NOT NULL,
	"days" jsonb NOT NULL,
	"prompt_version" integer DEFAULT 1 NOT NULL,
	"natal_input_hash" text NOT NULL,
	"model" text NOT NULL,
	"language" text DEFAULT 'ka' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "weekly_forecast" ADD CONSTRAINT "weekly_forecast_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;