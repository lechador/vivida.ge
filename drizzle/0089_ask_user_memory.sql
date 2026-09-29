CREATE TABLE "ask_user_memory" (
	"user_id" text PRIMARY KEY NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"traits" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"turns_seen" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ask_user_memory" ADD CONSTRAINT "ask_user_memory_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;