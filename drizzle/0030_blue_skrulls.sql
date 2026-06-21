CREATE TABLE "sign_ranking" (
	"topic" text PRIMARY KEY NOT NULL,
	"headline" text NOT NULL,
	"intro" text NOT NULL,
	"items" jsonb NOT NULL,
	"faq" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"prompt_version" integer DEFAULT 1 NOT NULL,
	"model" text NOT NULL,
	"language" text DEFAULT 'ka' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
