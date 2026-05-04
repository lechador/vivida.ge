CREATE TYPE "public"."auth_token_purpose" AS ENUM('email_verify', 'password_reset');--> statement-breakpoint
CREATE TABLE "auth_token" (
	"token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"purpose" "auth_token_purpose" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "auth_token" ADD CONSTRAINT "auth_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_token_user_purpose_idx" ON "auth_token" USING btree ("user_id","purpose");