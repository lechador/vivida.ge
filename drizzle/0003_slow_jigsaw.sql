CREATE TABLE "daily_horoscope" (
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"headline" text NOT NULL,
	"summary" text NOT NULL,
	"body" text NOT NULL,
	"themes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"transits" jsonb,
	"model" text NOT NULL,
	"language" text DEFAULT 'ka' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_horoscope_user_id_date_pk" PRIMARY KEY("user_id","date")
);
--> statement-breakpoint
ALTER TABLE "daily_horoscope" ADD CONSTRAINT "daily_horoscope_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;