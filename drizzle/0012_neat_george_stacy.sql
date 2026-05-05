CREATE TABLE "partner" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"date_of_birth" date NOT NULL,
	"time_of_birth" time,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"city_name" text NOT NULL,
	"timezone" text NOT NULL,
	"chart" jsonb NOT NULL,
	"input_hash" text NOT NULL,
	"ai_interpretation" jsonb,
	"ai_viewer_hash" text,
	"ai_model" text,
	"ai_generated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_user_created_idx" ON "partner" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "partner_user_deleted_idx" ON "partner" USING btree ("user_id","deleted_at");