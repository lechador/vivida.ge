CREATE TABLE "chinese_zodiac" (
	"animal" text PRIMARY KEY NOT NULL,
	"page_title" text NOT NULL,
	"meta_description" text NOT NULL,
	"headline" text DEFAULT '' NOT NULL,
	"intro" text NOT NULL,
	"personality" text DEFAULT '' NOT NULL,
	"strengths" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"weaknesses" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"love" text DEFAULT '' NOT NULL,
	"career" text DEFAULT '' NOT NULL,
	"compatibility" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"faq" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"prompt_version" integer DEFAULT 1 NOT NULL,
	"model" text NOT NULL,
	"language" text DEFAULT 'ka' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
