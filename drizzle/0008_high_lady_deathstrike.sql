CREATE TABLE "typing_indicator" (
	"sender_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "typing_indicator_sender_id_recipient_id_pk" PRIMARY KEY("sender_id","recipient_id")
);
--> statement-breakpoint
ALTER TABLE "typing_indicator" ADD CONSTRAINT "typing_indicator_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "typing_indicator" ADD CONSTRAINT "typing_indicator_recipient_id_user_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "typing_recipient_expires_idx" ON "typing_indicator" USING btree ("recipient_id","expires_at");