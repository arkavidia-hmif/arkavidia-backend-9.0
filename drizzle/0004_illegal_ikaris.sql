CREATE TYPE "public"."competition_submission_type_enum" AS ENUM('uiux_poster');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competition_announcement" (
	"id" text PRIMARY KEY NOT NULL,
	"competition_id" text NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competition_submission" (
	"team_id" text NOT NULL,
	"competition_id" text NOT NULL,
	"type" "competition_submission_type_enum" NOT NULL,
	"media_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	CONSTRAINT "competition_submission_team_id_type_pk" PRIMARY KEY("team_id","type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "competition_timeline" (
	"id" text PRIMARY KEY NOT NULL,
	"competition_id" text NOT NULL,
	"title" text NOT NULL,
	"date" timestamp NOT NULL,
	"show_on_landing" boolean DEFAULT false NOT NULL,
	"show_tile" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_announcement" ADD CONSTRAINT "competition_announcement_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_announcement" ADD CONSTRAINT "competition_announcement_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission" ADD CONSTRAINT "competition_submission_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_submission" ADD CONSTRAINT "competition_submission_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "competition_timeline" ADD CONSTRAINT "competition_timeline_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
