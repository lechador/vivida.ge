CREATE TABLE "moon_phase_interpretation_library" (
	"key" text PRIMARY KEY NOT NULL,
	"phase" text NOT NULL,
	"sign" text NOT NULL,
	"headline" text NOT NULL,
	"summary" text NOT NULL,
	"body" text NOT NULL,
	"themes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model" text NOT NULL,
	"edited" boolean DEFAULT false NOT NULL,
	"language" text DEFAULT 'ka' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
