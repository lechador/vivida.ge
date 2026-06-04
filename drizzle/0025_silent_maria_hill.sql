CREATE TABLE "rate_limit_hit" (
	"bucket" text NOT NULL,
	"identifier" text NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limit_hit_bucket_identifier_window_start_pk" PRIMARY KEY("bucket","identifier","window_start")
);
