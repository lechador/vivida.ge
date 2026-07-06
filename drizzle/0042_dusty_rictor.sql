CREATE TABLE "transit_interpretation_library" (
	"key" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"transit" text NOT NULL,
	"aspect_kind" text,
	"subject" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"model" text NOT NULL,
	"edited" boolean DEFAULT false NOT NULL,
	"language" text DEFAULT 'ka' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
