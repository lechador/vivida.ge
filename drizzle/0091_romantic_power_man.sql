CREATE TYPE "public"."phone_verification_purpose" AS ENUM('signup', 'login', 'account');--> statement-breakpoint
CREATE TABLE "phone_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"purpose" "phone_verification_purpose" NOT NULL,
	"code_hash" text NOT NULL,
	"claim_token" text NOT NULL,
	"user_id" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified_at" timestamp with time zone,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "phone_verification_claim_token_unique" UNIQUE("claim_token")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "phone_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "phone_verification" ADD CONSTRAINT "phone_verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "phone_verification_phone_purpose_idx" ON "phone_verification" USING btree ("phone","purpose");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_phone_unique" UNIQUE("phone");