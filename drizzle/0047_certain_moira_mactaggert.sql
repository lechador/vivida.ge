CREATE TABLE "mbti_question" (
	"id" integer PRIMARY KEY NOT NULL,
	"axis" text NOT NULL,
	"pole" text NOT NULL,
	"text_ka" text NOT NULL,
	"order_index" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"edited" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
