CREATE TABLE "mission_outcomes" (
	"id" text PRIMARY KEY NOT NULL,
	"mission_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"metadata" jsonb,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "missions" DROP COLUMN "outputs";