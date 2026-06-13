CREATE TYPE "public"."like_kind" AS ENUM('like', 'pass');--> statement-breakpoint
ALTER TYPE "public"."notification_kind" ADD VALUE 'new_match';--> statement-breakpoint
CREATE TABLE "like" (
	"liker_id" text NOT NULL,
	"target_id" text NOT NULL,
	"kind" "like_kind" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "like_liker_id_target_id_pk" PRIMARY KEY("liker_id","target_id")
);
--> statement-breakpoint
CREATE TABLE "match" (
	"user_a_id" text NOT NULL,
	"user_b_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unmatched_at" timestamp with time zone,
	"unmatched_by" text,
	CONSTRAINT "match_user_a_id_user_b_id_pk" PRIMARY KEY("user_a_id","user_b_id")
);
--> statement-breakpoint
ALTER TABLE "like" ADD CONSTRAINT "like_liker_id_user_id_fk" FOREIGN KEY ("liker_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "like" ADD CONSTRAINT "like_target_id_user_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_user_a_id_user_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_user_b_id_user_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_unmatched_by_user_id_fk" FOREIGN KEY ("unmatched_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "like_target_kind_idx" ON "like" USING btree ("target_id","kind");--> statement-breakpoint
CREATE INDEX "match_user_a_idx" ON "match" USING btree ("user_a_id","unmatched_at");--> statement-breakpoint
CREATE INDEX "match_user_b_idx" ON "match" USING btree ("user_b_id","unmatched_at");