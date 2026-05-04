CREATE TABLE "moon_phase" (
	"date" date PRIMARY KEY NOT NULL,
	"phase_key" text NOT NULL,
	"phase_label_ka" text NOT NULL,
	"sign_en" text NOT NULL,
	"sign_ka" text NOT NULL,
	"sign_index" integer NOT NULL,
	"phase_angle" double precision NOT NULL,
	"illumination" double precision NOT NULL,
	"age_days" double precision NOT NULL,
	"headline" text NOT NULL,
	"summary" text NOT NULL,
	"body" text NOT NULL,
	"themes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"prompt_version" integer DEFAULT 1 NOT NULL,
	"model" text NOT NULL,
	"language" text DEFAULT 'ka' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
