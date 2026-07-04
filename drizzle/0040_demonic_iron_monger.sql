CREATE TABLE "house_interpretation_library" (
	"key" text PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"house" integer NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"model" text NOT NULL,
	"edited" boolean DEFAULT false NOT NULL,
	"language" text DEFAULT 'ka' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
