ALTER TABLE "post_comment" ADD COLUMN "parent_id" text;--> statement-breakpoint
ALTER TABLE "post_comment" ADD CONSTRAINT "post_comment_parent_id_post_comment_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post_comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_comment_parent_idx" ON "post_comment" USING btree ("parent_id");