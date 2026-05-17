CREATE TABLE "sign_horoscope" (
	"sign" text NOT NULL,
	"period" text NOT NULL,
	"period_key" text NOT NULL,
	"headline" text NOT NULL,
	"summary" text NOT NULL,
	"body" text NOT NULL,
	"themes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"prompt_version" integer DEFAULT 1 NOT NULL,
	"model" text NOT NULL,
	"language" text DEFAULT 'ka' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sign_horoscope_sign_period_period_key_pk" PRIMARY KEY("sign","period","period_key")
);
