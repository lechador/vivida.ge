CREATE TABLE "experiment_assignment" (
	"user_id" text NOT NULL,
	"experiment" text NOT NULL,
	"variant" text NOT NULL,
	"eligibility" text NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"exposed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	CONSTRAINT "experiment_assignment_user_id_experiment_pk" PRIMARY KEY("user_id","experiment")
);
--> statement-breakpoint
ALTER TABLE "experiment_assignment" ADD CONSTRAINT "experiment_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "experiment_assignment_cohort_idx" ON "experiment_assignment" USING btree ("experiment","variant","assigned_at");