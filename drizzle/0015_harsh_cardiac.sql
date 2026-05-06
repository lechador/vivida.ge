CREATE TABLE "user_activity_day" (
	"user_id" text NOT NULL,
	"date_local" text NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_activity_day_user_id_date_local_pk" PRIMARY KEY("user_id","date_local")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_login_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_activity_day" ADD CONSTRAINT "user_activity_day_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;