CREATE TABLE IF NOT EXISTS "competition" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date_start" date NOT NULL,
	"date_end" date NOT NULL,
	"location" text,
	"registeration_fee" integer,
	"max_participants" integer,
	"guide_book" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "event" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date_start" date NOT NULL,
	"date_end" date NOT NULL,
	"location" text,
	"registeration_fee" integer,
	"max_participants" integer,
	"guide_book" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team" (
	"id" text PRIMARY KEY NOT NULL,
	"team_leader_id" text,
	"team_name" text NOT NULL,
	"join_link" text,
	"team_code" text NOT NULL,
	"required_documents" text
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "full_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "required_documents" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "team" ADD CONSTRAINT "team_team_leader_id_user_id_fk" FOREIGN KEY ("team_leader_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
